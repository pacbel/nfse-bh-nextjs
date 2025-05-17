import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import forge from "node-forge";

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
      console.log("Criando diretório temporário:", tmpDir);
      fs.mkdirSync(tmpDir, { recursive: true });
      console.log("Diretório temporário criado com sucesso");
    }

    const form = formidable({
      uploadDir: tmpDir,
      keepExtensions: true,
    });

    console.log("Iniciando processamento do formulário de upload");
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Erro ao processar formulário:", err);
          reject(err);
        }
        console.log("Formulário processado com sucesso");
        resolve([fields, files]);
      });
    });

    const certificateFile = Array.isArray(files.certificate)
      ? files.certificate[0]
      : files.certificate;
    // Sempre usar a senha do .env.local
    const password = process.env.CERT_PASSWORD;

    if (!certificateFile || !password) {
      console.log("Arquivo ou senha não fornecidos:", {
        certificateFile,
        password,
      });
      return res
        .status(400)
        .json({ error: "Arquivo do certificado e senha são obrigatórios" });
    }

    // Criar diretório do certificado se não existir
    const cnpj = process.env.CERT_CNPJ;
    const certDir = path.join(process.cwd(), "certs", cnpj);
    if (!fs.existsSync(certDir)) {
      console.log(
        "Criando diretório para armazenamento do certificado:",
        certDir
      );
      fs.mkdirSync(certDir, { recursive: true });
      console.log("Diretório criado com sucesso");
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

      const fileStats = fs.statSync(certificateFile.filepath);
      console.log("Tamanho do arquivo:", fileStats.size, "bytes");
      if (fileStats.size === 0) {
        throw new Error("Arquivo do certificado está vazio");
      }

      console.log("Lendo arquivo do certificado (.pfx)...");
      const pfxBuffer = fs.readFileSync(certificateFile.filepath);
      console.log("Arquivo lido com sucesso. Salvando arquivo PFX...");

      // Obter o nome do arquivo original e garantir que termine com .pfx
      const originalFilename = certificateFile.originalFilename || "certificate.pfx";
      const filename = originalFilename.toLowerCase().endsWith(".pfx") 
        ? originalFilename 
        : `${originalFilename}.pfx`;
      
      // Caminho de saída para o arquivo PFX
      const pfxPath = path.join(certDir, filename);
      try {
        // Salvar o arquivo PFX original
        fs.writeFileSync(pfxPath, pfxBuffer);
        console.log("Arquivo PFX salvo em:", pfxPath);
        
        // Verificar se o certificado é válido tentando abri-lo
        try {
          // Converter o buffer para formato binário
          const pfxData = Buffer.from(pfxBuffer).toString('binary');
          
          // Criar buffer forge e parsear o PKCS#12
          const p12Asn1 = forge.asn1.fromDer(pfxData);
          const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
          
          // Extrair chaves e certificados para validação
          const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
          const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
          
          if (!keyBags || !keyBags[0] || !certBags || !certBags[0]) {
            throw new Error('Não foi possível extrair a chave privada ou certificado do arquivo PFX');
          }
          
          console.log("Certificado validado com sucesso");
        } catch (validationError) {
          console.error('Erro ao validar certificado:', validationError);
          throw new Error(`Certificado inválido ou senha incorreta: ${validationError.message}`);
        }
        
        console.log("Certificado salvo com sucesso em:", pfxPath);
        res.status(200).json({ success: true, message: "Certificado enviado com sucesso" });
      } catch (err) {
        console.error('Erro ao processar o certificado:', err);
        res.status(400).json({ error: 'Falha ao processar o certificado: ' + err.message });
      } finally {
        // Limpar arquivo temporário
        if (fs.existsSync(certificateFile.filepath)) {
          try {
            fs.unlinkSync(certificateFile.filepath);
            console.log("Arquivo temporário removido com sucesso:", certificateFile.filepath);
          } catch (e) {
            console.warn("Falha ao remover arquivo temporário:", certificateFile.filepath, e);
          }
        }
      }
      return;
    } catch (err) {
      console.error("Erro ao processar certificado:", err);
      res.status(400).json({ error: "Falha ao processar o certificado: " + err.message });
    }
  } catch (err) {
    console.error("Erro ao processar requisição:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
