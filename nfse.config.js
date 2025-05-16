const path = require('path');

module.exports = {
  homologUrl: 'https://bhisshomologaws.pbh.gov.br/bhiss-ws/nfse',
  producaoUrl: 'https://bhissdigitalws.pbh.gov.br/bhiss-ws/nfse',
  tls: {
    minVersion: 'TLSv1',
    maxVersion: 'TLSv1.2',
    ciphers: [
      'ECDHE-RSA-AES256-SHA',
      'AES256-SHA',
      'ECDHE-RSA-AES128-SHA',
      'AES128-SHA',
      'DES-CBC3-SHA'
    ].join(':'),
    honorCipherOrder: true
  },
  headers: {
    'Content-Type': 'text/xml;charset=UTF-8',
    'SOAPAction': 'http://ws.bhiss.pbh.gov.br/',
    'Accept': 'text/xml, application/xml',
    'User-Agent': 'Apache-HttpClient/4.5.5 (Java/1.8.0_144)',
    'Connection': 'close',
    'Cache-Control': 'no-cache'
  },
  certificado: {
    cert: path.join(process.cwd(), 'certs', '05065736000161', 'certificate.crt'),
    key: path.join(process.cwd(), 'certs', '05065736000161', 'certificate.key'),
  }
};
