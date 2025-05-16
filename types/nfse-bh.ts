// Interfaces para os serviços da NFSe BH

// Tipos comuns
export interface CpfCnpj {
  Cpf?: string;
  Cnpj?: string;
}

export interface Endereco {
  Endereco?: string;
  Numero?: string;
  Complemento?: string;
  Bairro?: string;
  CodigoMunicipio: string;
  Uf: string;
  Cep: string;
}

export interface Contato {
  Telefone?: string;
  Email?: string;
}

// RecepcionarLoteRps
export interface RpsIdentificacao {
  Numero: string;
  Serie: string;
  Tipo: string;
}

export interface RpsServico {
  Valores: {
    ValorServicos: string;
    ValorDeducoes?: string;
    ValorPis?: string;
    ValorCofins?: string;
    ValorInss?: string;
    ValorIr?: string;
    ValorCsll?: string;
    IssRetido: string;
    ValorIss?: string;
    ValorIssRetido?: string;
    OutrasRetencoes?: string;
    BaseCalculo: string;
    Aliquota: string;
    ValorLiquidoNfse: string;
    DescontoIncondicionado?: string;
    DescontoCondicionado?: string;
  };
  ItemListaServico: string;
  CodigoTributacaoMunicipio?: string;
  Discriminacao: string;
  CodigoMunicipio: string;
  ExigibilidadeISS?: string;
  MunicipioIncidencia?: string;
}

export interface RpsInfRps {
  Id: string;
  IdentificacaoRps: RpsIdentificacao;
  DataEmissao: string;
  NaturezaOperacao: string;
  RegimeEspecialTributacao?: string;
  OptanteSimplesNacional: string;
  IncentivadorCultural: string;
  Status: string;
  Servico: RpsServico;
  Prestador: {
    CpfCnpj: CpfCnpj;
    InscricaoMunicipal: string;
  };
  Tomador: {
    IdentificacaoTomador?: {
      CpfCnpj?: CpfCnpj;
      InscricaoMunicipal?: string;
    };
    RazaoSocial?: string;
    Endereco?: Endereco;
    Contato?: Contato;
  };
}

export interface RpsLoteRps {
  Id: string;
  versao: string;
  NumeroLote: string;
  CpfCnpj: CpfCnpj;
  InscricaoMunicipal: string;
  QuantidadeRps: number;
  ListaRps: {
    Rps: {
      InfRps: RpsInfRps;
    };
  };
}

// ConsultarSituacaoLoteRps
export interface ConsultaSituacaoLoteRps {
  Prestador: {
    CpfCnpj: CpfCnpj;
    InscricaoMunicipal: string;
  };
  Protocolo: string;
}

// ConsultarNfse
export interface ConsultaNfse {
  Prestador: {
    CpfCnpj: CpfCnpj;
    InscricaoMunicipal: string;
  };
  NumeroNfse?: string;
  PeriodoEmissao?: {
    DataInicial: string;
    DataFinal: string;
  };
  Tomador?: {
    CpfCnpj?: CpfCnpj;
    InscricaoMunicipal?: string;
  };
  IntermediarioServico?: {
    CpfCnpj?: CpfCnpj;
    InscricaoMunicipal?: string;
  };
}

// ConsultarLoteRps
export interface ConsultaLoteRps {
  Prestador: {
    CpfCnpj: CpfCnpj;
    InscricaoMunicipal: string;
  };
  Protocolo: string;
}

// CancelarNfse
export interface CancelamentoNfse {
  Pedido: {
    InfPedidoCancelamento: {
      IdentificacaoNfse: {
        Numero: string;
        CpfCnpj: CpfCnpj;
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      CodigoCancelamento: string;
    };
  };
}

// Interface para a API Gateway
export interface NfseApiRequest {
  nfseData: any; // Dados do template nfseDataTemplate
  emitente: {
    identificacao: string; // CNPJ ou CPF
    tipo: 'CPF' | 'CNPJ';
  };
  ambiente: 1 | 2; // 1 = Produção, 2 = Homologação
  token: string; // Token de autenticação
}

export interface NfseApiResponse {
  success: boolean;
  message: string;
  protocolo?: string;
  numeroNfse?: string;
  error?: string;
  webserviceResponse?: string;
  requestXml?: string;
  requestUrl?: string;
  logs?: string[];
  debugInfo?: {
    originalSize?: number;
    signedSize?: number;
  };
}
