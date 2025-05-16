import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import nfseConfig from "../../nfse.config.js";
import { buildNfseXml } from "../../utils/xmlBuilder";
import { handleXmlValidation } from "../../utils/xmlValidationHandler";
import { writeLog } from "./logs";
import { nfseDataTemplate } from "../../utils/nfseDataTemplate";
import { assinarXmlNfsePbh } from "../../utils/assinador";
import { createSoapEnvelope } from "../../utils/soapBuilder";

// Parâmetros do arquivo de configuração
const BHISS_URLS = {
  1: process.env.API_URL_PRDUCTION, // Produção
  2: process.env.API_URL // Homologação
};

export default async function handler(req, res) {

  // Array para armazenar todos os logs do processamento
  const logs = [];
  const addLog = (message) => {
    writeLog(message);
    logs.push(message);
  };

  // 1. Validar e preparar o diretório para os XMLs
  const notasFiscaisDir = path.resolve("notas-fiscais");
  if (!fs.existsSync(notasFiscaisDir)) {
    fs.mkdirSync(notasFiscaisDir, { recursive: true });
  }

  const assinadasDir = path.resolve("notas-fiscais", "assinadas");
  if (!fs.existsSync(assinadasDir)) {
    fs.mkdirSync(assinadasDir, { recursive: true });
  }

  const originalDir = path.resolve("notas-fiscais", "original");
  if (!fs.existsSync(originalDir)) {
    fs.mkdirSync(originalDir, { recursive: true });
  }

  const signedDir = path.resolve("notas-fiscais", "signed");
  if (!fs.existsSync(signedDir)) {
    fs.mkdirSync(signedDir, { recursive: true });
  }

  const soapDir = path.resolve("notas-fiscais", "soap");
  if (!fs.existsSync(soapDir)) {
    fs.mkdirSync(soapDir, { recursive: true });
  }

  // FIM DO PREPARO DO DIRETORIO

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

  // Validação do XML
  // addLog("Validar XML sem assinatura contra o schema XSD...");
  // const validationResult = await handleXmlValidation({
  //   xmlContent: xml,
  //   addLog,
  // });

  // if (!validationResult.success) {
  //   addLog("Erro de validação do XML:");
  //   addLog(`Detalhes do erro: ${JSON.stringify(validationResult.errors, null, 2)}`);
  //   return res.status(400).json({
  //     success: false,
  //     message: "Erro na validação do XML",
  //     logs,
  //     error: "Erro na validação do XML",
  //     details: validationResult.errors,
  //   });
  // }

  // Assinar o XML
  addLog("Assinando XML...");
  const certificadoPath = path.resolve("certs", "05065736000161", "336724062546f53e.pfx");
  const certificadoSenha = "Camgfv!@#2024";
  const xmlSigned = assinarXmlNfsePbh(xml, certificadoPath, certificadoSenha);
  const saveXML02 = path.join(assinadasDir, `nfse_assinada_${req.body.NumeroLote || "1"}_${timestamp}.xml`);
  await fs.promises.writeFile(saveXML02, xmlSigned, 'utf8');
  addLog("   ✓ XML assinado com sucesso");

  // // Validação do XML
  // addLog("Validar XML sem assinatura contra o schema XSD...");
  // const validationSignedResult = await handleXmlValidation({
  //   xmlContent: xmlSigned,
  //   addLog,
  // });

  // addLog(xmlSigned);
  
  // if (!validationSignedResult.success) {
  //   addLog("Erro de validação do XML:");
  //   addLog(`Detalhes do erro: ${JSON.stringify(validationSignedResult.errors, null, 2)}`);
  //   return res.status(400).json({
  //     success: false,
  //     message: "Erro na validação do XML",
  //     logs,
  //     error: "Erro na validação do XML",
  //     details: validationSignedResult.errors,
  //   });
  // }

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
      SOAPAction: nfseConfig.headers.SOAPAction + "RecepcionarLoteRps",
    },
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
