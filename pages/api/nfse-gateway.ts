import { NextApiRequest, NextApiResponse } from 'next';
import { NfseApiRequest, NfseApiResponse } from '../../types/nfse-bh';
import { ISignatureResult } from '../../types/xmlSigner';

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import https from "https";
import { buildNfseXml } from '../../utils/xmlBuilder';
import { writeLog } from "./logs";
import { createSoapEnvelope } from '../../utils/soapBuilder';
import { validateXsdGlobal } from '../../utils/validateXsdGlobal';
import { findCertificatePath } from "../../utils/certificateUtils";

// Token secreto para autenticação (deve ser configurado em variáveis de ambiente)
const API_TOKEN = process.env.API_TOKEN || '123456';

// URLs dos ambientes
const URLS = {
  1: process.env.API_URL_PRDUCTION!, // Produção
  2: process.env.API_URL! // Homologação
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NfseApiResponse>
) {
  let signedXmlResult: ISignatureResult | null = null;

  // Verifica método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido',
      error: 'Apenas POST é aceito'
    });
  }

  try {
    const {
      nfseData,
      emitente,
      ambiente,
      token
    } = req.body as NfseApiRequest;

    // Validação do token
    if (!token || token !== API_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado',
        error: 'Token inválido ou não fornecido'
      });
    }

    // Validação dos dados obrigatórios
    if (!nfseData || !emitente || !ambiente) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    // Validação do ambiente
    if (ambiente !== 1 && ambiente !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Ambiente inválido',
        error: 'O ambiente deve ser 1 (Produção) ou 2 (Homologação)'
      });
    }

    // Validação do emitente
    if (!emitente.identificacao || !emitente.tipo) {
      return res.status(400).json({
        success: false,
        message: 'Dados do emitente inválidos',
        error: 'Identificação ou tipo do emitente não fornecidos'
      });
    }

    // Usa a função utilitária para encontrar o certificado do emitente
    let certificadoPath: string;
    try {
      certificadoPath = findCertificatePath(emitente.identificacao);
      console.log(`Certificado encontrado: ${certificadoPath}`);
    } catch (err) {
      const error = err as Error;
      console.error(`[ERRO] ${error.message}`);
      return res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
    
    // Verifica se a senha do certificado está configurada
    const certificadoSenha = process.env.CERT_PASSWORD;
    if (!certificadoSenha) {
      return res.status(400).json({
        success: false,
        message: "Senha do certificado não configurada",
        error: "Senha do certificado não configurada nas variáveis de ambiente (CERT_PASSWORD)."
      });
    }

    // Gera o XML da NFSe
    const requestXml = buildNfseXml(nfseData);

    // Gera um timestamp para identificar os arquivos
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Assinar o XML com múltiplas assinaturas
    // signedXmlResult = await signMultipleElements(requestXml, [
    //   { id: 'rps:1', isLote: false },
    //   { id: 'lote', isLote: true }
    // ], {
    //   certificatePath: certPath,
    //   keyPath: keyPath
    // });

    // XML assinado para debug (comentado para evitar erros)
    // const xmlSignedPath = path.join(
    //   process.cwd(), 'debug', 'signed',
    //   `nfse_signed_${nfseData.LoteRps?.NumeroLote || 'sem-lote'}_${timestamp}.xml`
    // );
    // fs.mkdirSync(path.dirname(xmlSignedPath), { recursive: true });
    // fs.writeFileSync(xmlSignedPath, signedXmlResult.signedXml);

    // Cria o envelope SOAP com o XML original
    const xmlSoap = createSoapEnvelope(requestXml);

    // Envelope SOAP para debug (comentado para evitar erros)
    // const xmlSoapPath = path.join(
    //   process.cwd(), 'debug', 'soap',
    //   `nfse_soap_${nfseData.LoteRps?.NumeroLote || 'sem-lote'}_${timestamp}.xml`
    // );
    // fs.mkdirSync(path.dirname(xmlSoapPath), { recursive: true });
    // fs.writeFileSync(xmlSoapPath, xmlSoap);

    // Configuração do agente HTTPS
    // Usamos o certificado PFX diretamente, sem precisar de arquivos .crt e .key separados
    // O Node.js/HTTPS suporta certificados PFX diretamente
    const agent = new https.Agent({
      rejectUnauthorized: true,
      keepAlive: false,
      timeout: 180000,
      pfx: fs.readFileSync(certificadoPath),
      passphrase: certificadoSenha
    });

    // Headers SOAP
    const SOAP_HEADERS = {
      'Content-Type': process.env.CONTENT_TYPE || 'text/xml;charset=UTF-8',
      'SOAPAction': (process.env.SOAP_ACTION || 'http://ws.bhiss.pbh.gov.br/') + 'RecepcionarLoteRps',
      'Accept': process.env.ACCEPT || 'text/xml, application/xml',
      'User-Agent': process.env.USER_AGENT || 'Apache-HttpClient/4.5.5 (Java/1.8.0_144)',
      'Connection': 'close',
      'Cache-Control': 'no-cache'
    };

    const axiosConfig = {
      method: "post",
      url: URLS[ambiente],
      data: xmlSoap,
      headers: SOAP_HEADERS,
      httpsAgent: agent,
      maxRedirects: 0,
      timeout: 180000,
      validateStatus: (status: number) => status < 600,
      proxy: false as const // Desabilita proxy para evitar problemas de DNS
    };

    const response = await axios(axiosConfig);

    return res.status(200).json({
      success: true,
      message: 'NFS-e processada com sucesso',
      webserviceResponse: response.data,
      requestXml: signedXmlResult?.signedXml,
      requestUrl: URLS[ambiente]
    });

  } catch (error) {
    console.error('Erro ao processar NFS-e:', error);

    // Tenta extrair ambiente do request body
    let ambiente: number;
    try {
      const body = req.body as NfseApiRequest;
      ambiente = body.ambiente;
    } catch {
      ambiente = 2; // Usa homologação como fallback
    }

    // Se for um erro do Axios com resposta
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Erro na comunicação com o webservice',
        error: error.message,
        webserviceResponse: error.response.data,
        requestXml: signedXmlResult?.signedXml,
        requestUrl: URLS[ambiente]
      });
    }

    // Se for um erro de timeout ou conexão
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'Timeout na comunicação com o webservice',
        error: error.message,
        requestXml: signedXmlResult?.signedXml,
        requestUrl: URLS[ambiente]
      });
    }

    // Erro genérico
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
      requestXml: signedXmlResult?.signedXml,
      requestUrl: URLS[ambiente],
      debugInfo: signedXmlResult?.debugInfo
    });
  }
}
