import { ConsultarSituacaoLoteRpsEnvio } from '../types/nfse-metodos';
import { DOMParser } from 'xmldom';

export function buildConsultarSituacaoLoteRpsXml(data: ConsultarSituacaoLoteRpsEnvio): string {
  // Garantir que temos um objeto válido
  if (!data || !data.Prestador || !data.Protocolo) {
    throw new Error('Dados inválidos: Prestador e Protocolo são obrigatórios');
  }

  // Funções auxiliares para acessar propriedades de forma segura
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
<ConsultarSituacaoLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
	<Prestador>
		<Cnpj>${safeGet(data, 'Prestador.Cnpj', '05065736000161')}</Cnpj>
		<InscricaoMunicipal>${safeGet(data, 'Prestador.InscricaoMunicipal', '01733890014')}</InscricaoMunicipal>
	</Prestador>
	<Protocolo>${safeGet(data, 'Protocolo', '')}</Protocolo>
</ConsultarSituacaoLoteRpsEnvio>`;

  // Normalizar o XML removendo indentações e quebras de linha
  const normalizedXml = completeXml
    .replace(/>\s*</g, '><')  // Remove espaços e quebras entre tags
    .replace(/\s+/g, ' ')     // Substitui múltiplos espaços por um único
    .trim();                  // Remove espaços nas extremidades

  // Verificar se o XML é válido
  try {
    // Usar a biblioteca @xmldom/xmldom para analisar o XML no lado do servidor
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(normalizedXml, 'text/xml');

    // Verificar se houve erros na análise
    const errors = xmlDoc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      const errorMsg = errors[0].textContent || 'Erro desconhecido na análise do XML';
      console.error('Erro na análise do XML:', errorMsg);
      throw new Error(`XML inválido: ${errorMsg}`);
    }
  } catch (error) {
    console.error('Erro ao validar XML:', error);
    throw new Error(`XML inválido: ${error.message}`);
  }

  // Validar o XML antes de retornar
  if (!normalizedXml || normalizedXml.trim().length === 0) {
    console.error('XML gerado está vazio');
    throw new Error('XML inválido: conteúdo vazio após geração');
  }

  return normalizedXml;
}
