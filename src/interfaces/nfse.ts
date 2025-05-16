export interface NfseValues {
  valorServicos: number;
  issRetido: number;
  valorIss: number;
  baseCalculo: number;
  aliquota: number;
  valorLiquidoNfse: number;
}

export interface NfseServico {
  valores: NfseValues;
  itemListaServico: string;
  codigoTributacaoMunicipio: string;
  discriminacao: string;
  codigoMunicipio: string;
}

export interface NfsePrestador {
  cnpj: string;
  inscricaoMunicipal: string;
  razaoSocial: string;
  nomeFantasia?: string;
  endereco: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    codigoMunicipio: string;
    uf: string;
    cep: string;
  };
  contato?: {
    telefone?: string;
    email?: string;
  };
}

export interface NfseTomador {
  cnpj: string;
  razaoSocial: string;
  endereco: {
    endereco: string;
    numero: string;
    bairro: string;
    codigoMunicipio: string;
    uf: string;
    cep: string;
  };
  contato?: {
    email?: string;
  };
}

export interface NfseRequest {
  prestador: NfsePrestador;
  tomador: NfseTomador;
  servico: NfseServico;
}
