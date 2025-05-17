export function createSoapEnvelope(xmlContent: string): string {
  // Remover a declaração XML do conteúdo, pois ela já está no envelope
  const cleanXml = xmlContent.replace(/^<\?xml[^>]+\?>/, '');

  // Criar o cabeçalho da NFSe (sem declaração XML)
  const cabecalho = `<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>`;

  let envelope = `<?xml version='1.0' encoding='UTF-8'?>`;
  envelope += `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" `;
  envelope += `xmlns:ws="http://ws.bhiss.pbh.gov.br">`;
  envelope += `<soapenv:Header/>`;
  envelope += `<soapenv:Body>`;
  envelope += `<ws:RecepcionarLoteRpsRequest>`;
  envelope += `<nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>`;
  envelope += `<nfseDadosMsg><![CDATA[${cleanXml}]]></nfseDadosMsg>`;
  envelope += `</ws:RecepcionarLoteRpsRequest>`;
  envelope += `</soapenv:Body>`;
  envelope += `</soapenv:Envelope>`;

  return envelope;
}



