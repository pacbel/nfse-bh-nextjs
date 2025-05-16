import { EnviarLoteRpsEnvio } from '../types/nfse';
import { DOMParser } from 'xmldom';

// Função para formatar o telefone conforme as regras da Prefeitura de BH
function formatarTelefone(telefone: string): string {
  // Remover todos os caracteres não numéricos
  const apenasNumeros = telefone.replace(/[^0-9]/g, '');
  
  // Se o telefone tiver 11 dígitos e começar com 0, manter como está
  if (apenasNumeros.length === 11 && apenasNumeros.startsWith('0')) {
    return apenasNumeros;
  }
  
  // Se o telefone tiver menos de 10 dígitos, preencher com zeros à esquerda
  // Se tiver mais de 10 dígitos e não for o caso especial acima, truncar para 10
  return apenasNumeros.padStart(10, '0').substring(0, 10);
}

export function buildNfseXml(data: EnviarLoteRpsEnvio): string {
  // Garantir que temos um objeto válido
  if (!data || !data.LoteRps) {
    throw new Error('Dados inválidos: LoteRps é obrigatório');
  }

  const { LoteRps } = data;

  // Verificar se ListaRps existe
  if (!LoteRps.ListaRps || !LoteRps.ListaRps.Rps || !LoteRps.ListaRps.Rps.InfRps) {
    throw new Error('Dados inválidos: ListaRps.Rps.InfRps é obrigatório');
  }

  const { ListaRps } = LoteRps;
  let { InfRps } = ListaRps.Rps;
  // Montar dinamicamente o Id do InfRps conforme o número real do RPS
  if (InfRps && InfRps.IdentificacaoRps && InfRps.IdentificacaoRps.Numero) {
    // Usar Id (maiúsculo) para o objeto TypeScript e para o XML final, conforme XSD
    InfRps.Id = `rps_${InfRps.IdentificacaoRps.Numero}`;
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

    // Se o valor for apenas hífen ou espaços, retorna undefined para que o campo seja omitido
    if (current === '-' || (typeof current === 'string' && current.trim() === '-')) {
      return undefined;
    }

    return current !== undefined && current !== null ? current : defaultValue;
  };

  const safeGetWithCheck = (obj: any, path: string, checkPath: string, defaultValue: string = ''): string => {
    const checkParts = checkPath.split('.');
    let checkCurrent = obj;

    for (const part of checkParts) {
      if (checkCurrent === undefined || checkCurrent === null) {
        return '';
      }
      checkCurrent = checkCurrent[part];
    }

    if (checkCurrent) {
      return safeGet(obj, path, defaultValue);
    }

    return '';
  };

  // Construir o XML interno primeiro (conteúdo do envelope SOAP)
  // Construir o XML completo primeiro (sem envelope SOAP)
  const completeXml = `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
<LoteRps Id="lote" versao="${safeGet(LoteRps, 'versao', '1.00')}">
<NumeroLote>${safeGet(LoteRps, 'NumeroLote', '1')}</NumeroLote>
<Cnpj>${safeGet(LoteRps, 'Cnpj', '05065736000161')}</Cnpj>
<InscricaoMunicipal>${safeGet(LoteRps, 'InscricaoMunicipal', '01733890014')}</InscricaoMunicipal>
<QuantidadeRps>${safeGet(LoteRps, 'QuantidadeRps', '1')}</QuantidadeRps>
<ListaRps>
<Rps>
<InfRps Id="${safeGet(InfRps.IdentificacaoRps.Numero, 'InfRps', 'rps:15HOMOL')}">
<IdentificacaoRps>
<Numero>${safeGet(InfRps, 'IdentificacaoRps.Numero', '1')}</Numero>
<Serie>${safeGet(InfRps, 'IdentificacaoRps.Serie', '1')}</Serie>
<Tipo>${safeGet(InfRps, 'IdentificacaoRps.Tipo', '1')}</Tipo>
</IdentificacaoRps>
<DataEmissao>${safeGet(InfRps, 'DataEmissao', new Date().toISOString().split('T')[0])}</DataEmissao>
<NaturezaOperacao>${safeGet(InfRps, 'NaturezaOperacao', '1')}</NaturezaOperacao>
<RegimeEspecialTributacao>6</RegimeEspecialTributacao>
<OptanteSimplesNacional>1</OptanteSimplesNacional>
<IncentivadorCultural>${safeGet(InfRps, 'IncentivadorCultural', '2')}</IncentivadorCultural>
<Status>${safeGet(InfRps, 'Status', '1')}</Status>
<Servico>
<Valores>
<ValorServicos>${safeGet(InfRps, 'Servico.Valores.ValorServicos', '0')}</ValorServicos>
<ValorDeducoes>${safeGet(InfRps, 'Servico.Valores.ValorDeducoes', '0')}</ValorDeducoes>
<ValorPis>${safeGet(InfRps, 'Servico.Valores.ValorPis', '0')}</ValorPis>
<ValorCofins>${safeGet(InfRps, 'Servico.Valores.ValorCofins', '0')}</ValorCofins>
<ValorInss>${safeGet(InfRps, 'Servico.Valores.ValorInss', '0')}</ValorInss>
<ValorIr>${safeGet(InfRps, 'Servico.Valores.ValorIr', '0')}</ValorIr>
<ValorCsll>${safeGet(InfRps, 'Servico.Valores.ValorCsll', '0')}</ValorCsll>
<IssRetido>${safeGet(InfRps, 'Servico.Valores.IssRetido', '2')}</IssRetido>
<ValorIss>${(parseFloat(safeGet(InfRps, 'Servico.Valores.ValorServicos', '0')) * 0.025).toFixed(2)}</ValorIss>
<ValorIssRetido>${safeGet(InfRps, 'Servico.Valores.ValorIssRetido', '0')}</ValorIssRetido>
<OutrasRetencoes>${safeGet(InfRps, 'Servico.Valores.OutrasRetencoes', '0')}</OutrasRetencoes>
<BaseCalculo>${safeGet(InfRps, 'Servico.Valores.BaseCalculo', '0')}</BaseCalculo>
<Aliquota>0.025</Aliquota>
<ValorLiquidoNfse>${safeGet(InfRps, 'Servico.Valores.ValorLiquidoNfse', '0')}</ValorLiquidoNfse>
<DescontoIncondicionado>${safeGet(InfRps, 'Servico.Valores.DescontoIncondicionado', '0')}</DescontoIncondicionado>
<DescontoCondicionado>${safeGet(InfRps, 'Servico.Valores.DescontoCondicionado', '0')}</DescontoCondicionado>
</Valores>
<ItemListaServico>${safeGet(InfRps, 'Servico.ItemListaServico', '')}</ItemListaServico>
<CodigoTributacaoMunicipio>${safeGet(InfRps, 'Servico.CodigoTributacaoMunicipio', '')}</CodigoTributacaoMunicipio>
<Discriminacao>${safeGet(InfRps, 'Servico.Discriminacao', '')}</Discriminacao>
<CodigoMunicipio>${safeGet(InfRps, 'Servico.CodigoMunicipio', '3106200')}</CodigoMunicipio>
</Servico>
<Prestador>
<Cnpj>${safeGet(InfRps, 'Prestador.CpfCnpj.Cnpj', '05065736000161')}</Cnpj>
<InscricaoMunicipal>${safeGet(InfRps, 'Prestador.InscricaoMunicipal', '01733890014')}</InscricaoMunicipal>
</Prestador>
<Tomador>
<IdentificacaoTomador>
<CpfCnpj>
${safeGet(InfRps, 'Tomador.IdentificacaoTomador.CpfCnpj.Cpf') ?
      `<Cpf>${safeGet(InfRps, 'Tomador.IdentificacaoTomador.CpfCnpj.Cpf')}</Cpf>` :
      `<Cnpj>${safeGet(InfRps, 'Tomador.IdentificacaoTomador.CpfCnpj.Cnpj')}</Cnpj>`}
</CpfCnpj>
</IdentificacaoTomador>
<RazaoSocial>${safeGet(InfRps, 'Tomador.RazaoSocial', '')}</RazaoSocial>
<Endereco>
${[
      `<Endereco>${safeGet(InfRps, 'Tomador.Endereco.Logradouro') || safeGet(InfRps, 'Tomador.Endereco.Endereco', '')}</Endereco>`,
      `<Numero>${safeGet(InfRps, 'Tomador.Endereco.Numero', '')}</Numero>`,
      safeGet(InfRps, 'Tomador.Endereco.Complemento') ? `<Complemento>${safeGet(InfRps, 'Tomador.Endereco.Complemento')}</Complemento>` : null,
      `<Bairro>${safeGet(InfRps, 'Tomador.Endereco.Bairro', '')}</Bairro>`,
      `<CodigoMunicipio>${safeGet(InfRps, 'Tomador.Endereco.CodigoMunicipio', '3106200')}</CodigoMunicipio>`,
      `<Uf>${safeGet(InfRps, 'Tomador.Endereco.Uf', 'MG')}</Uf>`,
      `<Cep>${safeGet(InfRps, 'Tomador.Endereco.Cep', '')}</Cep>`
    ].filter(Boolean).join('\n')}
</Endereco>
<Contato>
${[
      safeGet(InfRps, 'Tomador.Contato.Telefone') ? `<Telefone>${formatarTelefone(safeGet(InfRps, 'Tomador.Contato.Telefone'))}</Telefone>` : null,
      `<Email>${safeGet(InfRps, 'Tomador.Contato.Email', '')}</Email>`
    ].filter(Boolean).join('\n')}
</Contato>
</Tomador>
</InfRps>
</Rps>
</ListaRps>
</LoteRps>
</EnviarLoteRpsEnvio>`;

  // Agora, envolver o XML em um envelope SOAP
  // Primeiro, vamos assinar o XML completo (sem envelope SOAP)
  // A assinatura será feita na API, então retornamos apenas o XML completo

  // Normalizar o XML removendo indentações e quebras de linha
  const normalizedXml = completeXml
    .replace(/>[\s\r\n]+</g, '><')  // Remove espaços e quebras entre tags
    .replace(/[\s\r\n]+/g, ' ')     // Substitui múltiplos espaços por um único
    .trim();                        // Remove espaços nas extremidades

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