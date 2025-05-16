export interface Valores {
  ValorServicos: number;
  ValorDeducoes: number;
  ValorPis: number;
  ValorCofins: number;
  ValorInss: number;
  ValorIr: number;
  ValorCsll: number;
  IssRetido: 1 | 2; // 1: Sim, 2: Não
  ValorIss: number;
  ValorIssRetido: number;
  BaseCalculo: number;
  Aliquota: number;
  ValorLiquidoNfse: number;
}

export interface Servico {
  Valores: Valores;
  ItemListaServico: string;
  CodigoTributacaoMunicipio: string;
  Discriminacao: string;
  CodigoMunicipio: string;
}

export interface Endereco {
  Endereco: string;
  Numero: string;
  Complemento?: string;
  Bairro: string;
  CodigoMunicipio: string;
  Uf: string;
  Cep: string;
}

export interface CpfCnpj {
  Cnpj: string;
}

export interface Prestador {
  CpfCnpj: CpfCnpj;
  InscricaoMunicipal: string;
  RazaoSocial: string;
  Endereco: Endereco;
}

export interface IdentificacaoTomador {
  CpfCnpj: CpfCnpj;
}

export interface Contato {
  Telefone?: string;
  Email?: string;
}

export interface Tomador {
  IdentificacaoTomador: IdentificacaoTomador;
  RazaoSocial: string;
  Endereco: Endereco;
  Contato?: Contato;
}

export interface IdentificacaoRps {
  Numero: string;
  Serie: string;
  Tipo: string;
}

export interface InfRps {
  Id: string;
  IdentificacaoRps: IdentificacaoRps;
  DataEmissao: string;
  NaturezaOperacao: string;
  RegimeEspecialTributacao: string;
  OptanteSimplesNacional: 1 | 2;
  IncentivadorCultural: 1 | 2;
  Status: 1 | 2;
  Servico: Servico;
  Prestador: Prestador;
  Tomador: Tomador;
}

export interface Rps {
  InfRps: InfRps;
}

export interface LoteRps {
  Id: string;
  versao: string;
  NumeroLote: string;
  CpfCnpj: CpfCnpj;
  InscricaoMunicipal: string;
  QuantidadeRps: number;
  ListaRps: {
    Rps: Rps;
  };
}

export interface EnviarLoteRpsEnvio {
  LoteRps: LoteRps;
}
