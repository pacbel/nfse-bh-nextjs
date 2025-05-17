import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildConsultarLoteRpsXml } from "../../utils/xmlBuilderMetodo4";
import { writeLog } from "./logs";
import { nfseDataTemplateMetodo4 } from "../../utils/nfseDataTemplateMetodo4";
import { createSoapEnvelopeMetodo4 } from "../../utils/soapBuilderMetodos";
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
  'SOAPAction': process.env.SOAP_ACTION + 'ConsultarLoteRps',
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

  // Preparar os dados para a consulta
  const consultaData = {
    ...nfseDataTemplateMetodo4,
    ...req.body
  };

  // 2. Gerar XML da consulta
  addLog("Gerando XML da consulta de lote RPS...");
  const xml = buildConsultarLoteRpsXml(consultaData);
  addLog('[DEBUG] XML gerado:');
  if (!xml || xml.trim().length === 0) {
    addLog('[ERRO] XML gerado está vazio!');
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const saveXML = path.join(consultasDir, `consulta_lote_rps_${consultaData.Protocolo || "protocolo"}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML, xml, 'utf8');
  addLog("   ✓ XML gerado com sucesso");

  // Criar envelope SOAP
  addLog("Envelopando XML...");
  const soapEnvelope = createSoapEnvelopeMetodo4(xml);
  addLog("   ✓ XML envelopado com sucesso");

  // Enviar para a Prefeitura
  addLog("Enviando consulta para a Prefeitura...");
  const requestUrl = BHISS_URLS[req.body.ambiente || 2];

  addLog(soapEnvelope);
  
  console.log(requestUrl);
  
  // Configuração do agente HTTPS
  
  // Obter o CNPJ do emitente a partir dos dados da requisição ou da variável de ambiente
  const cnpj = consultaData.Prestador?.Cnpj || 
               process.env.CERT_CNPJ || 
               "05065736000161";
  
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
