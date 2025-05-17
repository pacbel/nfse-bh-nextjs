const fs = require('fs');
const path = require('path');
const forge = require('node-forge');

// Função para testar se conseguimos abrir o certificado com a senha fornecida
function testarCertificado(pfxPath, senha) {
  console.log(`Testando certificado: ${pfxPath}`);
  console.log(`Senha fornecida: ${senha}`);
  
  try {
    // Verificar se o arquivo existe
    if (!fs.existsSync(pfxPath)) {
      console.error(`Arquivo de certificado não encontrado: ${pfxPath}`);
      return false;
    }
    
    // Ler o arquivo do certificado
    const pfxBuffer = fs.readFileSync(pfxPath);
    console.log(`Tamanho do buffer do certificado: ${pfxBuffer.length} bytes`);
    
    try {
      // Converter para ASN.1
      const p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString('binary')));
      console.log('ASN1 decodificado com sucesso');
      
      try {
        // Tentar abrir o certificado com a senha
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
        console.log('PKCS12 decodificado com sucesso');
        
        // Tentar extrair a chave privada e o certificado
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        
        const keyObj = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
        const certObj = certBags[forge.pki.oids.certBag][0];
        
        if (!keyObj || !certObj) {
          console.error('Não foi possível extrair a chave privada ou o certificado');
          return false;
        }
        
        console.log('Chave privada e certificado extraídos com sucesso');
        return true;
      } catch (err) {
        console.error('Erro ao processar PKCS12:', err);
        return false;
      }
    } catch (err) {
      console.error('Erro ao decodificar ASN1:', err);
      return false;
    }
  } catch (err) {
    console.error('Erro ao ler o arquivo do certificado:', err);
    return false;
  }
}

// Caminho para o certificado
const certificadoPath = path.join(process.cwd(), 'certs', '05065736000161', '336724062546f53e.pfx');

// Testar com a senha do .env.local
const senha = "Camgfv!@#2024";

// Executar o teste
const resultado = testarCertificado(certificadoPath, senha);
console.log(`Resultado do teste: ${resultado ? 'SUCESSO' : 'FALHA'}`);
