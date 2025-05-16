import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import nfseConfig from "../../nfse.config.js";
import { buildConsultarLoteRpsXml } from "../../utils/xmlBuilderMetodo4";
import { writeLog } from "./logs";
import { nfseDataTemplateMetodo4 } from "../../utils/nfseDataTemplateMetodo4";
import { createSoapEnvelopeMetodo4 } from "../../utils/soapBuilderMetodos";

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

  const consultasDir = path.resolve("notas-fiscais", "consultas");
  if (!fs.existsSync(consultasDir)) {
    fs.mkdirSync(consultasDir, { recursive: true });
  }

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
      SOAPAction: nfseConfig.headers.SOAPAction + "ConsultarLoteRps",
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
