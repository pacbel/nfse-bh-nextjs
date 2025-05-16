import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import nfseConfig from "../../nfse.config.js";
import { buildCancelarNfseXml } from "../../utils/xmlBuilderMetodo6";
import { writeLog } from "./logs";
import { nfseDataTemplateMetodo6 } from "../../utils/nfseDataTemplateMetodo6";
import { createSoapEnvelopeMetodo6 } from "../../utils/soapBuilderMetodos";
import { assinarXmlNfsePbh } from "../../utils/assinador";

// Paru00e2metros do arquivo de configurau00e7u00e3o
const BHISS_URLS = {
  1: process.env.API_URL_PRDUCTION, // Produu00e7u00e3o
  2: process.env.API_URL // Homologau00e7u00e3o
};

export default async function handler(req, res) {

  // Array para armazenar todos os logs do processamento
  const logs = [];
  const addLog = (message) => {
    writeLog(message);
    logs.push(message);
  };

  // 1. Validar e preparar o diretu00f3rio para os XMLs
  const notasFiscaisDir = path.resolve("notas-fiscais");
  if (!fs.existsSync(notasFiscaisDir)) {
    fs.mkdirSync(notasFiscaisDir, { recursive: true });
  }

  const cancelamentosDir = path.resolve("notas-fiscais", "cancelamentos");
  if (!fs.existsSync(cancelamentosDir)) {
    fs.mkdirSync(cancelamentosDir, { recursive: true });
  }

  const assinadasDir = path.resolve("notas-fiscais", "assinadas");
  if (!fs.existsSync(assinadasDir)) {
    fs.mkdirSync(assinadasDir, { recursive: true });
  }

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
    addLog('[ERRO] XML gerado estu00e1 vazio!');
  }
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const numeroNfse = cancelamentoData.Pedido?.InfPedidoCancelamento?.IdentificacaoNfse?.Numero || "numero";
  const saveXML01 = path.join(cancelamentosDir, `cancelamento_nfse_${numeroNfse}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML01, xml, 'utf8');
  addLog("   u2713 XML gerado com sucesso");

  // Assinar o XML
  addLog("Assinando XML...");
  const certificadoPath = path.resolve("certs", "05065736000161", "336724062546f53e.pfx");
  const certificadoSenha = "Camgfv!@#2024";
  const xmlSigned = assinarXmlNfsePbh(xml, certificadoPath, certificadoSenha);
  const saveXML02 = path.join(assinadasDir, `cancelamento_nfse_assinado_${numeroNfse}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML02, xmlSigned, 'utf8');
  addLog("   u2713 XML assinado com sucesso");

  // Criar envelope SOAP
  addLog("Envelopando XML...");
  const soapEnvelope = createSoapEnvelopeMetodo6(xmlSigned);
  addLog("   u2713 XML envelopado com sucesso");

  // Enviar para a Prefeitura
  addLog("Enviando cancelamento para a Prefeitura...");
  const requestUrl = BHISS_URLS[req.body.ambiente || 2];

  addLog(soapEnvelope);
  
  console.log(requestUrl);
  
  // Configurau00e7u00e3o do agente HTTPS
  const agent = new https.Agent({
    rejectUnauthorized: true,
    keepAlive: false,
    timeout: 180000,
    cert: fs.existsSync(nfseConfig.certificado.cert)
      ? fs.readFileSync(nfseConfig.certificado.cert)
      : undefined,
    key: fs.existsSync(nfseConfig.certificado.key)
      ? fs.readFileSync(nfseConfig.certificado.key)
      : undefined,
    ca: fs.existsSync(nfseConfig.certificado.ca)
      ? fs.readFileSync(nfseConfig.certificado.ca)
      : undefined,
  });

  // Chamada HTTP direta para a Prefeitura
  const axiosConfig = {
    method: "post",
    url: "https://bhisshomologaws.pbh.gov.br/bhiss-ws/nfse",
    data: soapEnvelope,
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      SOAPAction: nfseConfig.headers.SOAPAction + "CancelarNfse",
    },
    httpsAgent: agent,
    maxRedirects: 0,
    timeout: 180000,
    validateStatus: (status) => status < 600,
    // Configurau00e7u00f5es adicionais para melhor tratamento de erros
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
