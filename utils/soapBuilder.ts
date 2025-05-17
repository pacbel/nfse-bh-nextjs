export function createSoapEnvelope(xmlContent: string): string {
  // Remover a declaração XML do conteúdo, pois ela já está no envelope
  const cleanXml = xmlContent.replace(/^<\?xml[^>]+\?>/, '');

  // Criar o cabeçalho da NFSe (sem declaração XML)
  const cabecalho = `<cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="1.00"><versaoDados>1.00</versaoDados></cabecalho>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Header/>
  <soap:Body>
    <RecepcionarLoteRps xmlns="http://ws.bhiss.pbh.gov.br">
    <nfseCabecMsg><![CDATA[${cabecalho}]]></nfseCabecMsg>
    <nfseDadosMsg><![CDATA[${cleanXml}]]></nfseDadosMsg>
    </RecepcionarLoteRps>    
  </soap:Body>
</soap:Envelope>`;
}
