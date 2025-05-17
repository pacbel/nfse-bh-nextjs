import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildConsultarNfseRpsXml } from "../../utils/xmlBuilderMetodo3";
import { writeLog } from "./logs";
// Removida importação de jsonLoader - os dados devem vir diretamente do POST
import { createSoapEnvelopeMetodo3 } from "../../utils/soapBuilderMetodos";
import { validateXsdGlobal } from "../../utils/validateXsdGlobal";
import { findCertificatePath } from "../../utils/certificateUtils";

// Parâmetros de configuração das variáveis de ambiente
const BHISS_URLS = {
  1: process.env.API_URL_PRODUCTION, // Produção
  2: process.env.API_URL // Homologação
};

// Headers SOAP
const SOAP_HEADERS = {
  'Content-Type': process.env.CONTENT_TYPE || 'text/xml;charset=UTF-8',
  'SOAPAction': process.env.SOAP_ACTION + 'ConsultarNfsePorRps',
  'Accept': process.env.ACCEPT || 'text/xml, application/xml',
  'User-Agent': process.env.USER_AGENT || 'Apache-HttpClient/4.5.5 (Java/1.8.0_144)',
  'Connection': 'close',
  'Cache-Control': 'no-cache'
};

export default async function handler(req, res) {

  // Array para armazenar todos os logs do processamento
  const logs = [];
  const addLog = (message) => {
    writeLog(message);
    logs.push(message);
  };

  // Verificar se os dados necessários foram enviados
  if (!req.body || !req.body.Prestador || !req.body.IdentificacaoRps) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      error: 'O corpo da requisição deve conter os dados do Prestador e IdentificacaoRps'
    });
  }

  // Identificar o CNPJ para selecionar o certificado correto
  const cnpj = req.body.Prestador.Cnpj || req.query.cnpj;
  if (!cnpj) {
    return res.status(400).json({
      success: false,
      message: 'CNPJ não informado',
      error: 'É necessário informar o CNPJ no corpo da requisição ou como parâmetro de consulta'
    });
  }
  addLog(`CNPJ identificado: ${cnpj}`);

  // 2. Gerar XML da consulta
  addLog("Gerando XML da consulta de NFS-e por RPS...");
  const xml = buildConsultarNfseRpsXml(req.body);
  addLog('[DEBUG] XML gerado:');
  if (!xml || xml.trim().length === 0) {
    addLog('[ERRO] XML gerado está vazio!');
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const saveXML = path.join(consultasDir, `consulta_nfse_rps_${consultaData.IdentificacaoRps?.Numero || "numero"}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML, xml, 'utf8');
  addLog("   ✓ XML gerado com sucesso");

  // Validação do XML contra o schema XSD
  addLog("Validando XML contra o schema XSD...");
  const validationResult = await validateXsdGlobal({
    xmlContent: xml,
    addLog,
    xsdSchemaPath: process.env.XSD_SCHEMA_PATH
  });

  if (!validationResult.success) {
    addLog("Erro de validação do XML:");
    addLog(`Detalhes do erro: ${JSON.stringify(validationResult.detalhes, null, 2)}`);
    return res.status(400).json({
      success: false,
      message: "Erro na validação do XML",
      logs,
      error: "Erro na validação do XML",
      details: validationResult.detalhes,
    });
  }
  addLog("   ✓ XML validado com sucesso");

  // Criar envelope SOAP
  addLog("Envelopando XML...");
  const soapEnvelope = createSoapEnvelopeMetodo3(xml);
  addLog("   ✓ XML envelopado com sucesso");

  // Enviar para a Prefeitura
  addLog("Enviando consulta para a Prefeitura...");
  const requestUrl = BHISS_URLS[req.body.ambiente || 2];

  addLog(soapEnvelope);
  
  console.log(requestUrl);
  
  // Configuração do agente HTTPS
  
  // O CNPJ já foi identificado anteriormente
  // Não precisamos declarar novamente
  
  let certificadoPath;
  try {
    // Usar a função utilitária para encontrar o certificado
    certificadoPath = findCertificatePath(cnpj);
    addLog(`Certificado encontrado: ${certificadoPath}`);
  } catch (err) {
    addLog(`[ERRO] ${err.message}`);
    return res.status(400).json({
      success: false,
      message: err.message,
      logs,
      error: err.message
    });
  }
  
  const certificadoSenha = process.env.CERT_PASSWORD;
  
  if (!certificadoSenha) {
    addLog(`[ERRO] Senha do certificado não configurada nas variáveis de ambiente`);
    return res.status(400).json({
      success: false,
      message: "Senha do certificado não configurada",
      logs,
      error: "Senha do certificado não configurada nas variáveis de ambiente (CERT_PASSWORD)."
    });
  }
  
  const agent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: false,
    timeout: 180000,
    pfx: fs.readFileSync(certificadoPath),
    passphrase: certificadoSenha
  });

  // Chamada HTTP direta para a Prefeitura
  const axiosConfig = {
    method: "post",
    url: requestUrl,
    data: soapEnvelope,
    headers: SOAP_HEADERS,
    httpsAgent: agent,
    maxRedirects: 0,
    timeout: 180000,
    validateStatus: (status) => status < 600,
    // Configurações adicionais para melhor tratamento de erros
    proxy: false, // Desabilita proxy para evitar problemas de DNS
    retry: 3, // Tenta 3 vezes em caso de erro
    retryDelay: 1000 // Espera 1 segundo entre tentativas
  };

  try {
    const response = await axios(axiosConfig);
    // Se não houver erro SOAP, continua com o processamento normal
    addLog("Resposta do WebService:");
    addLog(`Status HTTP: ${response.status}`);
    addLog(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
    addLog("Conteúdo da resposta completa:");
    addLog(typeof response.data === "string" ? response.data : "[objeto]");
    return res.status(200).json({
      success: true,
      message: "Consulta processada com sucesso",
      logs
    });
  } catch (error) {
    addLog("Erro ao processar consulta:");
    addLog(error.message);
    addLog(error.stack);
    return res.status(200).json({
      success: false,
      message: "Erro ao processar consulta",
      logs,
      error: error.message,
      stack: error.stack,
    });
  }
}
