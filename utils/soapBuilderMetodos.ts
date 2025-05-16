export function createSoapEnvelopeMetodo2(xmlContent: string): string {
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
  envelope += `<ws:ConsultarSituacaoLoteRpsRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:ConsultarSituacaoLoteRpsRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}

export function createSoapEnvelopeMetodo3(xmlContent: string): string {
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
  envelope += `<ws:ConsultarNfseRpsRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:ConsultarNfseRpsRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}

export function createSoapEnvelopeMetodo4(xmlContent: string): string {
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
  envelope += `<ws:ConsultarLoteRpsRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:ConsultarLoteRpsRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}

export function createSoapEnvelopeMetodo5(xmlContent: string): string {
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
  envelope += `<ws:ConsultarNfseRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:ConsultarNfseRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}

export function createSoapEnvelopeMetodo6(xmlContent: string): string {
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
  envelope += `<ws:CancelarNfseRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXmlContent}]]></nfseDadosMsg>`;
  envelope += `</ws:CancelarNfseRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}
