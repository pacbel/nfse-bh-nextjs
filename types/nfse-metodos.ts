// Interfaces para os métodos da NFSe de Belo Horizonte

// Método 2: Consulta de Situação de Lote de RPS
export interface ConsultarSituacaoLoteRpsEnvio {
  Prestador: {
    Cnpj: string;
    InscricaoMunicipal: string;
  };
  Protocolo: string;
}

// Método 3: Consulta de NFS-e por RPS
export interface ConsultarNfseRpsEnvio {
  IdentificacaoRps: {
    Numero: string;
    Serie: string;
    Tipo: string;
  };
  Prestador: {
    Cnpj: string;
    InscricaoMunicipal: string;
  };
}

// Método 4: Consulta de Lote de RPS
export interface ConsultarLoteRpsEnvio {
  Prestador: {
    Cnpj: string;
    InscricaoMunicipal: string;
  };
  Protocolo: string;
}

// Método 5: Consulta de NFS-e
export interface ConsultarNfseEnvio {
  Prestador: {
    Cnpj: string;
    InscricaoMunicipal: string;
  };
  PeriodoEmissao?: {
    DataInicial: string;
    DataFinal: string;
  };
  Tomador?: {
    CpfCnpj: {
      Cpf?: string;
      Cnpj?: string;
    };
    InscricaoMunicipal?: string;
  };
  IntermediarioServico?: {
    CpfCnpj: {
      Cpf?: string;
      Cnpj?: string;
    };
    InscricaoMunicipal?: string;
    RazaoSocial: string;
  };
  NumeroNfse?: string;
}

// Método 6: Cancelamento de NFS-e
export interface CancelarNfseEnvio {
  Pedido: {
    InfPedidoCancelamento: {
      Id: string;
      IdentificacaoNfse: {
        Numero: string;
        Cnpj: string;
        InscricaoMunicipal: string;
        CodigoMunicipio: string;
      };
      CodigoCancelamento: string;
    };
  };
}
