import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import forge from "node-forge";

// Função para extrair o CNPJ do certificado digital
function extractCNPJFromCertificate(p12: forge.pkcs12.Pkcs12Pfx): string {
  try {
    // Obter os certificados do arquivo PFX
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    if (!certBags || !certBags[0]) {
      throw new Error('Não foi possível encontrar o certificado no arquivo PFX');
    }
    
    // Obter o certificado
    const cert = certBags[0].cert;
    
    // Obter o subject do certificado
    const subject = cert.subject.getField('CN');
    if (!subject) {
      throw new Error('Não foi possível encontrar o campo CN no certificado');
    }
    
    // O campo CN geralmente contém o CNPJ no formato "NOME:CNPJ"
    const cnValue = subject.value;
    
    // Extrair apenas os dígitos do CNPJ
    const cnpjMatch = cnValue.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/g);
    if (!cnpjMatch || cnpjMatch.length === 0) {
      throw new Error(`Não foi possível extrair o CNPJ do certificado. CN: ${cnValue}`);
    }
    
    // Remover caracteres não numéricos do CNPJ
    const cnpj = cnpjMatch[0].replace(/[^0-9]/g, '');
    if (cnpj.length !== 14) {
      throw new Error(`CNPJ extraído não tem 14 dígitos: ${cnpj}`);
    }
    
    return cnpj;
  } catch (error) {
    console.error('Erro ao extrair CNPJ do certificado:', error);
    throw error;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("Método HTTP inválido recebido:", req.method);
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Garantir que o diretório temporário existe
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Configurar o formidable
    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
    });

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Verificar se o arquivo do certificado foi enviado
    if (!files.certificate) {
      return res.status(400).json({ error: "Nenhum arquivo de certificado enviado" });
    }

    // Obter o arquivo do certificado
    const certificateFile = Array.isArray(files.certificate)
      ? files.certificate[0]
      : files.certificate;

    // Obter a senha do certificado do campo ou da variável de ambiente
    const password = fields.password ? 
      Array.isArray(fields.password) ? fields.password[0] : fields.password : 
      process.env.CERT_PASSWORD || "";
      
    if (!password) {
      return res.status(400).json({ error: "Senha do certificado não fornecida" });
    }
    
    console.log("Lendo arquivo do certificado...");
    const pfxBuffer = fs.readFileSync(certificateFile.filepath);
    
    // Extrair o CNPJ do certificado
    let cnpj: string;
    try {
      console.log("Extraindo CNPJ do certificado...");
      // Converter o buffer para formato binário
      const pfxData = Buffer.from(pfxBuffer).toString('binary');
      
      // Criar buffer forge e parsear o PKCS#12
      const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxData));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
      
      // Extrair o CNPJ do certificado
      cnpj = extractCNPJFromCertificate(p12);
      console.log(`CNPJ extraído do certificado: ${cnpj}`);
    } catch (err) {
      console.error('Erro ao extrair CNPJ do certificado:', err);
      return res.status(400).json({ 
        error: `Erro ao extrair CNPJ do certificado: ${err instanceof Error ? err.message : 'Erro desconhecido'}` 
      });
    }
    
    // Criar o diretório de certificados baseado no CNPJ extraído
    const certDir = path.join(process.cwd(), "certs", cnpj);
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
      console.log(`Diretório criado: ${certDir}`);
    }

    // Processar o certificado
    try {
      console.log("Processando certificado...");
      console.log(
        "Verificando existência do arquivo temporário:",
        certificateFile.filepath
      );
      if (!fs.existsSync(certificateFile.filepath)) {
        throw new Error(
          `Arquivo temporário não encontrado: ${certificateFile.filepath}`
        );
      }
      
      // Obter o nome do arquivo original e garantir que termine com .pfx
      const originalFilename = certificateFile.originalFilename || "certificate.pfx";
      const filename = originalFilename.toLowerCase().endsWith(".pfx") 
        ? originalFilename 
        : `${originalFilename}.pfx`;
      
      // Caminho de saída para o arquivo PFX
      const pfxPath = path.join(certDir, filename);
      
      // Salvar o arquivo PFX original
      fs.writeFileSync(pfxPath, pfxBuffer);
      console.log("Arquivo PFX salvo em:", pfxPath);
      
      // Retornar sucesso com informações sobre o certificado
      res.status(200).json({ 
        success: true, 
        message: "Certificado enviado com sucesso",
        cnpj: cnpj,
        filename: filename,
        path: pfxPath.replace(process.cwd(), '').replace(/\\/g, '/') // Caminho relativo para exibição
      });
    } catch (err) {
      console.error("Erro ao processar certificado:", err);
      res.status(400).json({ error: "Falha ao processar o certificado: " + err.message });
    }
  } catch (err) {
    console.error("Erro ao processar requisição:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
