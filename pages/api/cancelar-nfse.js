import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildCancelarNfseXml } from "../../utils/xmlBuilderMetodo6";
import { writeLog } from "./logs";
import { nfseDataTemplateMetodo6 } from "../../utils/nfseDataTemplateMetodo6";
import { createSoapEnvelopeMetodo6 } from "../../utils/soapBuilderMetodos";
import { assinarXmlNfsePbh } from "../../utils/assinador";
import { validateXsdGlobal } from "../../utils/validateXsdGlobal";

// Paru00e2metros de configurau00e7u00e3o das variu00e1veis de ambiente
const BHISS_URLS = {
  1: process.env.API_URL_PRODUCTION, // Produu00e7u00e3o
  2: process.env.API_URL // Homologau00e7u00e3o
};

// Headers SOAP
const SOAP_HEADERS = {
  'Content-Type': process.env.CONTENT_TYPE || 'text/xml;charset=UTF-8',
  'SOAPAction': process.env.SOAP_ACTION + 'CancelarNfse',
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

  // Preparar os dados para o cancelamento
  const cancelamentoData = {
    ...nfseDataTemplateMetodo6,
    ...req.body
  };

  // 2. Gerar XML do cancelamento
  addLog("Gerando XML do cancelamento de NFS-e...");
  const xml = buildCancelarNfseXml(cancelamentoData);
  addLog('[DEBUG] XML gerado:');
  if (!xml || xml.trim().length === 0) {
    addLog('[ERRO] XML gerado está vazio!');
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const numeroNfse = cancelamentoData.Pedido?.InfPedidoCancelamento?.IdentificacaoNfse?.Numero || "numero";
  const saveXML01 = path.join(cancelamentosDir, `cancelamento_nfse_${numeroNfse}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML01, xml, 'utf8');
  addLog("   ✓ XML gerado com sucesso");

  // Validação do XML contra o schema XSD
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
  const certificadoPath = path.resolve(process.env.CERT_PATH || "certs/05065736000161/cert.pfx");
  const certificadoSenha = process.env.CERT_PASSWORD;
  const xmlSigned = assinarXmlNfsePbh(xml, certificadoPath, certificadoSenha);
  const saveXML02 = path.join(assinadasDir, `cancelamento_nfse_assinado_${numeroNfse}_${timestamp}.xml`);
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
  const soapEnvelope = createSoapEnvelopeMetodo6(xmlSigned);
  addLog("   u2713 XML envelopado com sucesso");

  // Enviar para a Prefeitura
  addLog("Enviando cancelamento para a Prefeitura...");
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
    // Se nu00e3o houver erro SOAP, continua com o processamento normal
    addLog("Resposta do WebService:");
    addLog(`Status HTTP: ${response.status}`);
    addLog(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
    addLog("Conteu00fado da resposta completa:");
    addLog(typeof response.data === "string" ? response.data : "[objeto]");
    return res.status(200).json({
      success: true,
      message: "Cancelamento processado com sucesso",
      logs
    });
  } catch (error) {
    addLog("Erro ao processar cancelamento:");
    addLog(error.message);
    addLog(error.stack);
    return res.status(200).json({
      success: false,
      message: "Erro ao processar cancelamento",
      logs,
      error: error.message,
      stack: error.stack,
    });
  }
}
