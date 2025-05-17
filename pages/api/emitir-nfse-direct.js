import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildNfseXml } from "../../utils/xmlBuilder";
import { writeLog } from "./logs";
import { nfseDataTemplate } from "../../utils/nfseDataTemplate";
import { assinarXmlNfsePbh } from "../../utils/assinador";
import { createSoapEnvelope } from "../../utils/soapBuilder";
import { validateXsdGlobal } from "../../utils/validateXsdGlobal";

// Parâmetros de configuração das variáveis de ambiente
const BHISS_URLS = {
  1: process.env.API_URL_PRODUCTION, // Produção
  2: process.env.API_URL // Homologação
};

// Headers SOAP
const SOAP_HEADERS = {
  'Content-Type': process.env.CONTENT_TYPE || 'text/xml;charset=UTF-8',
  'SOAPAction': process.env.SOAP_ACTION + 'RecepcionarLoteRps',
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


  // 2. Gerar XML da NFS-e
  addLog("Gerando XML da NFS-e...");
  const xml = buildNfseXml(nfseDataTemplate);
  addLog('[DEBUG] XML gerado:');
  if (!xml || xml.trim().length === 0) {
    addLog('[ERRO] XML gerado está vazio!');
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const saveXML01 = path.join(originalDir, `nfse_${req.body.NumeroLote || "1"}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML01, xml, 'utf8');
  addLog("   ✓ XML gerado com sucesso");

  // Validação do XML sem assinatura contra o schema XSD
  addLog("Validando XML sem assinatura contra o schema XSD...");
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
  addLog("   ✓ XML sem assinatura validado com sucesso");

  // Assinar o XML
  addLog("Assinando XML...");
  const certificadoPath = path.resolve("certs", "05065736000161", "336724062546f53e.pfx");
  const certificadoSenha = "Camgfv!@#2024";
  const xmlSigned = assinarXmlNfsePbh(xml, certificadoPath, certificadoSenha);
  const saveXML02 = path.join(assinadasDir, `nfse_assinada_${req.body.NumeroLote || "1"}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML02, xmlSigned, 'utf8');
  addLog("   ✓ XML assinado com sucesso");

  // Validação do XML assinado contra o schema XSD
  addLog("Validando XML assinado contra o schema XSD...");
  const validationSignedResult = await validateXsdGlobal({
    xmlContent: xmlSigned,
    addLog,
    xsdSchemaPath: process.env.XSD_SCHEMA_PATH
  });

  if (!validationSignedResult.success) {
    addLog("Erro de validação do XML assinado:");
    addLog(`Detalhes do erro: ${JSON.stringify(validationSignedResult.detalhes, null, 2)}`);
    return res.status(400).json({
      success: false,
      message: "Erro na validação do XML assinado",
      logs,
      error: "Erro na validação do XML assinado",
      details: validationSignedResult.detalhes,
    });
  }
  addLog("   ✓ XML assinado validado com sucesso");

  // Criar envelope SOAP
  addLog("Envelopando XML...");
  const soapEnvelope = createSoapEnvelope(xmlSigned);
  addLog("   ✓ XML envelopado com sucesso");

  // 8. Enviar diretamente para a Prefeitura
  addLog("Enviando diretamente para a Prefeitura...");
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
      message: "Processado com sucesso",
      logs
    });
  } catch (error) {
    addLog("Erro ao processar NFSe:");
    addLog(error.message);
    addLog(error.stack);
    return res.status(200).json({
      success: false,
      message: "Erro ao processar NFSe",
      logs,
      error: error.message,
      stack: error.stack,
    });
  }
}
