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

  // Construir o XML interno primeiro (conteúdo do envelope SOAP)
  // Construir o XML completo primeiro (sem envelope SOAP)
  let xmlParts = [];
  
  // Iniciar o XML
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">');
  
  // LoteRps
  const versao = safeGet(LoteRps, 'versao') || '1.00';
  xmlParts.push(`<LoteRps Id="lote" versao="${versao}">`);
  
  // Campos obrigatórios do LoteRps
  const numeroLote = safeGet(LoteRps, 'NumeroLote');
  xmlParts.push(`<NumeroLote>${numeroLote}</NumeroLote>`);
  
  const cnpj = safeGet(LoteRps, 'Cnpj');
  xmlParts.push(`<Cnpj>${cnpj}</Cnpj>`);
  
  const inscricaoMunicipal = safeGet(LoteRps, 'InscricaoMunicipal');
  xmlParts.push(`<InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>`);
  
  const quantidadeRps = safeGet(LoteRps, 'QuantidadeRps') || '1';
  xmlParts.push(`<QuantidadeRps>${quantidadeRps}</QuantidadeRps>`);
  
  // ListaRps
  xmlParts.push('<ListaRps>');
  xmlParts.push('<Rps>');
  
  // InfRps
  const idRps = `rps:${InfRps.IdentificacaoRps.Numero}`;
  xmlParts.push(`<InfRps Id="${idRps}">`);
  
  // IdentificacaoRps
  xmlParts.push('<IdentificacaoRps>');
  const numeroRps = safeGet(InfRps, 'IdentificacaoRps.Numero');
  xmlParts.push(`<Numero>${numeroRps}</Numero>`);
  
  const serieRps = safeGet(InfRps, 'IdentificacaoRps.Serie');
  xmlParts.push(`<Serie>${serieRps}</Serie>`);
  
  const tipoRps = safeGet(InfRps, 'IdentificacaoRps.Tipo') || '1';
  xmlParts.push(`<Tipo>${tipoRps}</Tipo>`);
  xmlParts.push('</IdentificacaoRps>');
  
  // DataEmissao
  const dataEmissao = safeGet(InfRps, 'DataEmissao');
  xmlParts.push(`<DataEmissao>${dataEmissao}</DataEmissao>`);
  
  // NaturezaOperacao
  const naturezaOperacao = safeGet(InfRps, 'NaturezaOperacao') || '1';
  xmlParts.push(`<NaturezaOperacao>${naturezaOperacao}</NaturezaOperacao>`);
  
  // RegimeEspecialTributacao (opcional)
  const regimeEspecialTributacao = safeGet(InfRps, 'RegimeEspecialTributacao');
  if (shouldIncludeField(regimeEspecialTributacao)) {
    xmlParts.push(`<RegimeEspecialTributacao>${regimeEspecialTributacao}</RegimeEspecialTributacao>`);
  }
  
  // OptanteSimplesNacional (padrão 2 = Não)
  const optanteSimplesNacional = safeGet(InfRps, 'OptanteSimplesNacional') || '2';
  xmlParts.push(`<OptanteSimplesNacional>${optanteSimplesNacional}</OptanteSimplesNacional>`);
  
  // IncentivadorCultural (padrão 2 = Não)
  const incentivadorCultural = safeGet(InfRps, 'IncentivadorCultural') || '2';
  xmlParts.push(`<IncentivadorCultural>${incentivadorCultural}</IncentivadorCultural>`);
  
  // Status (padrão 1 = Normal)
  const status = safeGet(InfRps, 'Status') || '1';
  xmlParts.push(`<Status>${status}</Status>`);
  
  // Servico
  xmlParts.push('<Servico>');
  xmlParts.push('<Valores>');
  
  // Valores obrigatórios
  const valorServicos = safeGet(InfRps, 'Servico.Valores.ValorServicos') || '0';
  xmlParts.push(`<ValorServicos>${valorServicos}</ValorServicos>`);
  
  // Valores opcionais
  const valorDeducoes = safeGet(InfRps, 'Servico.Valores.ValorDeducoes');
  if (shouldIncludeField(valorDeducoes)) {
    xmlParts.push(`<ValorDeducoes>${valorDeducoes}</ValorDeducoes>`);
  }
  
  const valorPis = safeGet(InfRps, 'Servico.Valores.ValorPis');
  if (shouldIncludeField(valorPis)) {
    xmlParts.push(`<ValorPis>${valorPis}</ValorPis>`);
  }
  
  const valorCofins = safeGet(InfRps, 'Servico.Valores.ValorCofins');
  if (shouldIncludeField(valorCofins)) {
    xmlParts.push(`<ValorCofins>${valorCofins}</ValorCofins>`);
  }
  
  const valorInss = safeGet(InfRps, 'Servico.Valores.ValorInss');
  if (shouldIncludeField(valorInss)) {
    xmlParts.push(`<ValorInss>${valorInss}</ValorInss>`);
  }
  
  const valorIr = safeGet(InfRps, 'Servico.Valores.ValorIr');
  if (shouldIncludeField(valorIr)) {
    xmlParts.push(`<ValorIr>${valorIr}</ValorIr>`);
  }
  
  const valorCsll = safeGet(InfRps, 'Servico.Valores.ValorCsll');
  if (shouldIncludeField(valorCsll)) {
    xmlParts.push(`<ValorCsll>${valorCsll}</ValorCsll>`);
  }
  
  // IssRetido (padrão 2 = Não)
  const issRetido = safeGet(InfRps, 'Servico.Valores.IssRetido') || '2';
  xmlParts.push(`<IssRetido>${issRetido}</IssRetido>`);
  
  // Outros valores opcionais
  const valorIss = safeGet(InfRps, 'Servico.Valores.ValorIss');
  if (shouldIncludeField(valorIss)) {
    xmlParts.push(`<ValorIss>${valorIss}</ValorIss>`);
  } else if (shouldIncludeField(valorServicos)) {
    // Calcular ValorIss se não fornecido mas ValorServicos estiver presente
    const calculatedValorIss = (parseFloat(valorServicos) * 0.025).toFixed(2);
    xmlParts.push(`<ValorIss>${calculatedValorIss}</ValorIss>`);
  }
  
  const valorIssRetido = safeGet(InfRps, 'Servico.Valores.ValorIssRetido');
  if (shouldIncludeField(valorIssRetido)) {
    xmlParts.push(`<ValorIssRetido>${valorIssRetido}</ValorIssRetido>`);
  }
  
  const outrasRetencoes = safeGet(InfRps, 'Servico.Valores.OutrasRetencoes');
  if (shouldIncludeField(outrasRetencoes)) {
    xmlParts.push(`<OutrasRetencoes>${outrasRetencoes}</OutrasRetencoes>`);
  }
  
  const baseCalculo = safeGet(InfRps, 'Servico.Valores.BaseCalculo');
  if (shouldIncludeField(baseCalculo)) {
    xmlParts.push(`<BaseCalculo>${baseCalculo}</BaseCalculo>`);
  } else if (shouldIncludeField(valorServicos)) {
    // Usar ValorServicos como BaseCalculo se não fornecido
    xmlParts.push(`<BaseCalculo>${valorServicos}</BaseCalculo>`);
  }
  
  const aliquota = safeGet(InfRps, 'Servico.Valores.Aliquota') || '0.025';
  xmlParts.push(`<Aliquota>${aliquota}</Aliquota>`);
  
  const valorLiquidoNfse = safeGet(InfRps, 'Servico.Valores.ValorLiquidoNfse');
  if (shouldIncludeField(valorLiquidoNfse)) {
    xmlParts.push(`<ValorLiquidoNfse>${valorLiquidoNfse}</ValorLiquidoNfse>`);
  }
  
  const descontoIncondicionado = safeGet(InfRps, 'Servico.Valores.DescontoIncondicionado');
  if (shouldIncludeField(descontoIncondicionado)) {
    xmlParts.push(`<DescontoIncondicionado>${descontoIncondicionado}</DescontoIncondicionado>`);
  }
  
  const descontoCondicionado = safeGet(InfRps, 'Servico.Valores.DescontoCondicionado');
  if (shouldIncludeField(descontoCondicionado)) {
    xmlParts.push(`<DescontoCondicionado>${descontoCondicionado}</DescontoCondicionado>`);
  }
  
  xmlParts.push('</Valores>');
  
  // Campos obrigatórios do Serviço
  const itemListaServico = safeGet(InfRps, 'Servico.ItemListaServico');
  xmlParts.push(`<ItemListaServico>${itemListaServico}</ItemListaServico>`);
  
  // Campos opcionais do Serviço
  const codigoTributacaoMunicipio = safeGet(InfRps, 'Servico.CodigoTributacaoMunicipio');
  if (shouldIncludeField(codigoTributacaoMunicipio)) {
    xmlParts.push(`<CodigoTributacaoMunicipio>${codigoTributacaoMunicipio}</CodigoTributacaoMunicipio>`);
  }
  
  const discriminacao = safeGet(InfRps, 'Servico.Discriminacao');
  xmlParts.push(`<Discriminacao>${discriminacao}</Discriminacao>`);
  
  const codigoMunicipio = safeGet(InfRps, 'Servico.CodigoMunicipio');
  xmlParts.push(`<CodigoMunicipio>${codigoMunicipio}</CodigoMunicipio>`);
  
  xmlParts.push('</Servico>');
  
  // Prestador
  xmlParts.push('<Prestador>');
  const prestadorCnpj = safeGet(InfRps, 'Prestador.Cnpj');
  xmlParts.push(`<Cnpj>${prestadorCnpj}</Cnpj>`);
  
  const prestadorInscricaoMunicipal = safeGet(InfRps, 'Prestador.InscricaoMunicipal');
  xmlParts.push(`<InscricaoMunicipal>${prestadorInscricaoMunicipal}</InscricaoMunicipal>`);
  xmlParts.push('</Prestador>');
  
  // Tomador
  xmlParts.push('<Tomador>');
  
  // IdentificacaoTomador
  xmlParts.push('<IdentificacaoTomador>');
  xmlParts.push('<CpfCnpj>');
  
  const tomadorCpf = safeGet(InfRps, 'Tomador.IdentificacaoTomador.CpfCnpj.Cpf');
  const tomadorCnpj = safeGet(InfRps, 'Tomador.IdentificacaoTomador.CpfCnpj.Cnpj');
  
  if (shouldIncludeField(tomadorCpf)) {
    xmlParts.push(`<Cpf>${tomadorCpf}</Cpf>`);
  } else if (shouldIncludeField(tomadorCnpj)) {
    xmlParts.push(`<Cnpj>${tomadorCnpj}</Cnpj>`);
  }
  
  xmlParts.push('</CpfCnpj>');
  
  // InscricaoMunicipal do Tomador (opcional)
  const tomadorInscricaoMunicipal = safeGet(InfRps, 'Tomador.IdentificacaoTomador.InscricaoMunicipal');
  if (shouldIncludeField(tomadorInscricaoMunicipal)) {
    xmlParts.push(`<InscricaoMunicipal>${tomadorInscricaoMunicipal}</InscricaoMunicipal>`);
  }
  
  xmlParts.push('</IdentificacaoTomador>');
  
  // RazaoSocial do Tomador
  const tomadorRazaoSocial = safeGet(InfRps, 'Tomador.RazaoSocial');
  xmlParts.push(`<RazaoSocial>${tomadorRazaoSocial}</RazaoSocial>`);
  
  // Endereco do Tomador
  xmlParts.push('<Endereco>');
  
  // Campos do Endereco
  const enderecoLogradouro = safeGet(InfRps, 'Tomador.Endereco.Logradouro') || safeGet(InfRps, 'Tomador.Endereco.Endereco');
  if (shouldIncludeField(enderecoLogradouro)) {
    xmlParts.push(`<Endereco>${enderecoLogradouro}</Endereco>`);
  }
  
  const enderecoNumero = safeGet(InfRps, 'Tomador.Endereco.Numero');
  if (shouldIncludeField(enderecoNumero)) {
    xmlParts.push(`<Numero>${enderecoNumero}</Numero>`);
  }
  
  const enderecoComplemento = safeGet(InfRps, 'Tomador.Endereco.Complemento');
  if (shouldIncludeField(enderecoComplemento)) {
    xmlParts.push(`<Complemento>${enderecoComplemento}</Complemento>`);
  }
  
  const enderecoBairro = safeGet(InfRps, 'Tomador.Endereco.Bairro');
  if (shouldIncludeField(enderecoBairro)) {
    xmlParts.push(`<Bairro>${enderecoBairro}</Bairro>`);
  }
  
  const enderecoCodigoMunicipio = safeGet(InfRps, 'Tomador.Endereco.CodigoMunicipio');
  if (shouldIncludeField(enderecoCodigoMunicipio)) {
    xmlParts.push(`<CodigoMunicipio>${enderecoCodigoMunicipio}</CodigoMunicipio>`);
  }
  
  const enderecoUf = safeGet(InfRps, 'Tomador.Endereco.Uf');
  if (shouldIncludeField(enderecoUf)) {
    xmlParts.push(`<Uf>${enderecoUf}</Uf>`);
  }
  
  const enderecoCep = safeGet(InfRps, 'Tomador.Endereco.Cep');
  if (shouldIncludeField(enderecoCep)) {
    xmlParts.push(`<Cep>${enderecoCep}</Cep>`);
  }
  
  xmlParts.push('</Endereco>');
  
  // Contato do Tomador (opcional)
  const tomadorTelefone = safeGet(InfRps, 'Tomador.Contato.Telefone');
  const tomadorEmail = safeGet(InfRps, 'Tomador.Contato.Email');
  
  if (shouldIncludeField(tomadorTelefone) || shouldIncludeField(tomadorEmail)) {
    xmlParts.push('<Contato>');
    
    if (shouldIncludeField(tomadorTelefone)) {
      xmlParts.push(`<Telefone>${formatarTelefone(tomadorTelefone)}</Telefone>`);
    }
    
    if (shouldIncludeField(tomadorEmail)) {
      xmlParts.push(`<Email>${tomadorEmail}</Email>`);
    }
    
    xmlParts.push('</Contato>');
  }
  
  // Fechar as tags
  xmlParts.push('</Tomador>');
  xmlParts.push('</InfRps>');
  xmlParts.push('</Rps>');
  xmlParts.push('</ListaRps>');
  xmlParts.push('</LoteRps>');
  xmlParts.push('</EnviarLoteRpsEnvio>');
  
  // Juntar todas as partes do XML
  const completeXml = xmlParts.join('\n');

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