import { ConsultarLoteRpsEnvio } from '../types/nfse-metodos';
import { DOMParser } from 'xmldom';

export function buildConsultarLoteRpsXml(data: ConsultarLoteRpsEnvio): string {
  // Garantir que temos um objeto vu00e1lido
  if (!data || !data.Prestador || !data.Protocolo) {
    throw new Error('Dados invu00e1lidos: Prestador e Protocolo su00e3o obrigatu00f3rios');
  }

  // Funu00e7u00f5es auxiliares para acessar propriedades de forma segura
  const safeGet = (obj: any, path: string, defaultValue: string = ''): string => {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined && current !== null ? current : defaultValue;
  };

  // Construir o XML completo
  const completeXml = `<?xml version="1.0" encoding="UTF-8"?>
<ConsultarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
	<Prestador>
		<Cnpj>${safeGet(data, 'Prestador.Cnpj', '05065736000161')}</Cnpj>
		<InscricaoMunicipal>${safeGet(data, 'Prestador.InscricaoMunicipal', '01733890014')}</InscricaoMunicipal>
	</Prestador>
	<Protocolo>${safeGet(data, 'Protocolo', '')}</Protocolo>
</ConsultarLoteRpsEnvio>`;

  // Normalizar o XML removendo indentau00e7u00f5es e quebras de linha
  const normalizedXml = completeXml
    .replace(/>\s*</g, '><')  // Remove espau00e7os e quebras entre tags
    .replace(/\s+/g, ' ')     // Substitui mu00faltiplos espau00e7os por um u00fanico
    .trim();                  // Remove espau00e7os nas extremidades

  // Verificar se o XML u00e9 vu00e1lido
  try {
    // Usar a biblioteca @xmldom/xmldom para analisar o XML no lado do servidor
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(normalizedXml, 'text/xml');

    // Verificar se houve erros na anu00e1lise
    const errors = xmlDoc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      const errorMsg = errors[0].textContent || 'Erro desconhecido na anu00e1lise do XML';
      console.error('Erro na anu00e1lise do XML:', errorMsg);
      throw new Error(`XML invu00e1lido: ${errorMsg}`);
    }
  } catch (error) {
    console.error('Erro ao validar XML:', error);
    throw new Error(`XML invu00e1lido: ${error.message}`);
  }

  // Validar o XML antes de retornar
  if (!normalizedXml || normalizedXml.trim().length === 0) {
    console.error('XML gerado estu00e1 vazio');
    throw new Error('XML invu00e1lido: conteu00fado vazio apu00f3s gerau00e7u00e3o');
  }

  return normalizedXml;
}
