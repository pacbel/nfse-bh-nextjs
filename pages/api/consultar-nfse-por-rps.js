import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildConsultarNfseRpsXml } from "../../utils/xmlBuilderMetodo3";
import { writeLog } from "./logs";
import { nfseDataTemplateMetodo3 } from "../../utils/nfseDataTemplateMetodo3";
import { createSoapEnvelopeMetodo3 } from "../../utils/soapBuilderMetodos";
import { validateXsdGlobal } from "../../utils/validateXsdGlobal";

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

  // Preparar os dados para a consulta
  const consultaData = {
    ...nfseDataTemplateMetodo3,
    ...req.body
  };

  // 2. Gerar XML da consulta
  addLog("Gerando XML da consulta de NFS-e por RPS...");
  const xml = buildConsultarNfseRpsXml(consultaData);
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
  const agent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: false,
    timeout: 180000,
    cert: fs.existsSync(process.env.CERT_CRT_PATH)
      ? fs.readFileSync(process.env.CERT_CRT_PATH)
      : undefined,
    key: fs.existsSync(process.env.CERT_KEY_PATH)
      ? fs.readFileSync(process.env.CERT_KEY_PATH)
      : undefined
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
