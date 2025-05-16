export function createSoapEnvelope(xmlContent: string): string {
  // Remove XML declarations from the content
  const cleanXmlContent = xmlContent.replace(/<\?xml[^>]*\?>/g, '');

  // Criar o cabeçalho da NFSe (sem declaração XML)
  const cabecalho = `<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>`;

  // Criar o envelope SOAP
  let envelope = `<?xml version='1.0' encoding='UTF-8'?>`;
  envelope += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" `;
  envelope += `xmlns:ws="http://ws.bhiss.pbh.gov.br">`;
  envelope += `<soapenv:Header/>`;
  envelope += `<soapenv:Body>`;
  envelope += `<ws:RecepcionarLoteRpsRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:RecepcionarLoteRpsRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;


  return envelope;
}
