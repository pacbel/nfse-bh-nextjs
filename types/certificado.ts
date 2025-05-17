// Interface para o componente de certificado

export interface ValoresCertificado {
  ValorServicos: number;
  IssRetido: number;
  ValorIss: number;
  BaseCalculo: number;
  Aliquota: number;
  ValorLiquidoNfse: number;
}

export interface EnderecoCertificado {
  Endereco: string;
  Numero: string;
  Complemento?: string;
  Bairro: string;
  CodigoMunicipio: string;
  Uf: string;
  Cep: string;
}

export interface ContatoCertificado {
  Telefone?: string;
  Email?: string;
}

export interface CpfCnpjCertificado {
  Cnpj: string;
}

export interface ServicoCertificado {
  Valores: ValoresCertificado;
  ItemListaServico: string;
  CodigoTributacaoMunicipio: string;
  Discriminacao: string;
  CodigoMunicipio: string;
}

export interface PrestadorCertificado {
  CpfCnpj: CpfCnpjCertificado;
  InscricaoMunicipal: string;
  RazaoSocial: string;
  NomeFantasia?: string;
  Endereco: EnderecoCertificado;
  Contato?: ContatoCertificado;
}

export interface TomadorCertificado {
  CpfCnpj: CpfCnpjCertificado;
  RazaoSocial: string;
  Endereco: EnderecoCertificado;
  Contato?: ContatoCertificado;
}

export interface CertificadoRequest {
  Prestador: PrestadorCertificado;
  Tomador: TomadorCertificado;
  Servico: ServicoCertificado;
}
