import { ConsultarLoteRpsEnvio } from '../types/nfse-metodos';
import { DOMParser } from 'xmldom';

export function buildConsultarLoteRpsXml(data: ConsultarLoteRpsEnvio): string {
  // Garantir que temos um objeto válido
  if (!data || !data.Prestador || !data.Protocolo) {
    throw new Error('Dados inválidos: Prestador e Protocolo são obrigatórios');
  }

  // Funções auxiliares para acessar propriedades de forma segura
  const safeGet = (obj: any, path: string, defaultValue?: string): string | undefined => {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === undefined || current === null) {
        return defaultValue;
      }
      current = current[part];
    }

    // Retorna undefined para valores vazios, hífen ou apenas espaços
    if (
      current === undefined || 
      current === null || 
      current === '-' || 
      (typeof current === 'string' && (current.trim() === '' || current.trim() === '-'))
    ) {
      return defaultValue;
    }

    return current;
  };

  // Função para verificar se um valor existe e deve ser incluído no XML
  const shouldIncludeField = (value: any): boolean => {
    return value !== undefined && value !== null && value !== '';
  };

  // Construir o XML completo
  const xmlParts: string[] = [];
  
  // Iniciar o XML
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<ConsultarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">');
  
  // Prestador (obrigatório)
  xmlParts.push('	<Prestador>');
  const cnpj = safeGet(data, 'Prestador.Cnpj');
  xmlParts.push(`		<Cnpj>${cnpj}</Cnpj>`);
  
  const inscricaoMunicipal = safeGet(data, 'Prestador.InscricaoMunicipal');
  xmlParts.push(`		<InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>`);
  xmlParts.push('	</Prestador>');
  
  // Protocolo (obrigatório)
  const protocolo = safeGet(data, 'Protocolo');
  xmlParts.push(`	<Protocolo>${protocolo}</Protocolo>`);
  
  // Fechar a tag principal
  xmlParts.push('</ConsultarLoteRpsEnvio>');
  
  // Juntar todas as partes do XML
  const completeXml = xmlParts.join('\n');

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
