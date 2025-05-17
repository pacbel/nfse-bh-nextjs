import { DOMParser, XMLSerializer } from 'xmldom';
import { SignedXml } from 'xml-crypto';
import forge from 'node-forge';
import fs from 'fs';

// Função para assinar XML usando diretamente o arquivo PFX

export function assinarXmlNfsePbh(xml: string, pfxPath: string, senha: string): string {
  try {
    console.log('1. Iniciando processo de assinatura');
    console.log(`Caminho do certificado: ${pfxPath}`);
    console.log(`Senha configurada: ${senha ? 'Sim' : 'Não'}`);
    
    if (!fs.existsSync(pfxPath)) {
      throw new Error(`Arquivo de certificado não encontrado: ${pfxPath}`);
    }
    
    // Extrair o certificado e a chave privada
    const pfxBuffer = fs.readFileSync(pfxPath);
    console.log(`Tamanho do buffer do certificado: ${pfxBuffer.length} bytes`);
    
    let p12Asn1;
    try {
      p12Asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString('binary')));
      console.log('ASN1 decodificado com sucesso');
    } catch (err) {
      console.error('Erro ao decodificar ASN1:', err);
      throw new Error(`Erro ao decodificar o certificado: ${err.message}`);
    }
    
    let p12, keyObj, certObj;
    try {
      p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
      console.log('PKCS12 decodificado com sucesso');
      
      keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];
      
      if (!keyObj || !certObj) {
        throw new Error('Não foi possível extrair a chave privada ou o certificado');
      }
    } catch (err) {
      console.error('Erro ao processar PKCS12:', err);
      throw new Error(`Senha do certificado inválida ou certificado corrompido: ${err.message}`);
    }

    const privateKey = keyObj.key;
    const certificate = forge.pki.certificateToPem(certObj.cert)
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\r?\n|\r/g, '');
    console.log('2. Certificado extraído com sucesso');
    
    // Abordagem mais simples: manipular o XML como string
    let xmlModificado = xml;
    
    // Verificar se o LoteRps já tem um ID
    if (xmlModificado.indexOf('<LoteRps Id=') === -1) {
      // Adicionar ID ao LoteRps
      xmlModificado = xmlModificado.replace('<LoteRps', '<LoteRps Id="lote"');
    }
    
    // Converter a chave privada para o formato PEM
    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    
    // Criar uma instância de SignedXml
    const SignedXml = require('xml-crypto').SignedXml;
    
    // Classe KeyInfo para ser reutilizada
    class KeyInfo {
      getKeyInfo() {
        return `<X509Data><X509Certificate>${certificate}</X509Certificate></X509Data>`;
      }
      getKey() {
        return privateKeyPem;
      }
    }
    
    // Primeiro, assinar o InfRps
    const xmlDocInfRps = new DOMParser().parseFromString(xmlModificado, 'text/xml');
    const infRpsElements = xmlDocInfRps.getElementsByTagName('InfRps');
    
    if (infRpsElements.length === 0) {
      throw new Error('Elemento InfRps não encontrado no XML');
    }
    
    // Assinar cada InfRps (normalmente apenas um)
    for (let i = 0; i < infRpsElements.length; i++) {
      const infRpsElement = infRpsElements[i];
      const infRpsId = infRpsElement.getAttribute('Id');
      
      if (!infRpsId) {
        console.warn('InfRps sem ID, não será assinado');
        continue;
      }
      
      const sigInfRps = new SignedXml();
      sigInfRps.signingKey = privateKeyPem;
      sigInfRps.addReference(
        `//*[@Id="${infRpsId}"]`,
        [
          'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
          'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
        ],
        'http://www.w3.org/2000/09/xmldsig#sha1'
      );
      
      sigInfRps.keyInfoProvider = new KeyInfo();
      
      // Serializar o elemento InfRps para assiná-lo
      const serializer = new XMLSerializer();
      const infRpsXml = serializer.serializeToString(infRpsElement);
      
      // Computar a assinatura do InfRps
      sigInfRps.computeSignature(infRpsXml);
      console.log(`3. Assinatura do InfRps ${infRpsId} computada com sucesso`);
      
      // Obter a assinatura como elemento XML
      const signatureXml = sigInfRps.getSignatureXml();
      const signatureDoc = new DOMParser().parseFromString(signatureXml, 'text/xml');
      
      // Adicionar a assinatura como filho do elemento Rps (pai do InfRps)
      const rpsElement = infRpsElement.parentNode;
      if (rpsElement) {
        rpsElement.appendChild(signatureDoc.documentElement);
      }
    }
    
    // Serializar o documento após assinar os InfRps
    const serializerInfRps = new XMLSerializer();
    xmlModificado = serializerInfRps.serializeToString(xmlDocInfRps);
    
    // Agora, assinar o LoteRps
    const xmlDocLoteRps = new DOMParser().parseFromString(xmlModificado, 'text/xml');
    const loteRpsElement = xmlDocLoteRps.getElementsByTagName('LoteRps')[0];
    
    if (!loteRpsElement) {
      throw new Error('Elemento LoteRps não encontrado no XML');
    }
    
    const sigLoteRps = new SignedXml();
    sigLoteRps.signingKey = privateKeyPem;
    sigLoteRps.addReference(
      '//*[@Id="lote"]',
      [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
      ],
      'http://www.w3.org/2000/09/xmldsig#sha1'
    );
    
    sigLoteRps.keyInfoProvider = new KeyInfo();
    
    // Computar a assinatura do LoteRps
    sigLoteRps.computeSignature(xmlModificado);
    console.log('4. Assinatura do LoteRps computada com sucesso');
    
    // Obter o XML final assinado
    const xmlAssinado = sigLoteRps.getSignedXml();
    console.log('5. XML completamente assinado com sucesso');
    
    return xmlAssinado;
  } catch (error) {
    console.error('ERRO FATAL durante o processo de assinatura:', error);
    throw error;
  }
}