// Arquivo de template para parametrização dos dados enviados no XML da NFS-e BH
// Edite os campos abaixo conforme necessário para cada emissão

export const nfseDataTemplate = {
  LoteRps: {
    Id: 'lote',
    versao: '1.00',
    NumeroLote: '1',
    Cnpj: '23456789000123',
    InscricaoMunicipal: '12345678901',
    QuantidadeRps: 1,
    ListaRps: {
      Rps: {
        Id: '22TESTE',
        InfRps: {
          Id: 'rps:22TESTE', 
          IdentificacaoRps: {
            Numero: '22',
            Serie: 'TESTE',
            Tipo: '1',
          },
          DataEmissao: '2025-05-17T10:15:00',
          NaturezaOperacao: '1',
          OptanteSimplesNacional: '2',
          IncentivadorCultural: '2',
          Status: '1',
          Servico: {
            Valores: {
              ValorServicos: '3500.50',
              BaseCalculo: '3500.50',
              ValorDeducoes: '0',
              ValorPis: '0',
              ValorCofins: '0',
              ValorInss: '0',
              ValorIr: '0',
              ValorCsll: '0',
              IssRetido: '2',
              OutrasRetencoes: '0',
              Aliquota: '0.025',
              DescontoIncondicionado: '0',
              DescontoCondicionado: '0',
            },
            ItemListaServico: '1.03',
            CodigoTributacaoMunicipio: '10300188',
            Discriminacao: 'DESENVOLVIMENTO E LICENCIAMENTO DE SOFTWARE PERSONALIZADO',
            CodigoMunicipio: '3106200',
          },
          Prestador: {
            Cnpj: '23456789000123',
            InscricaoMunicipal: '12345678901',
          },
          Tomador: {
            IdentificacaoTomador: {
              CpfCnpj: {
                Cpf: '52998224725',
              },
              InscricaoMunicipal: '',
            },
            RazaoSocial: 'MARIA SILVA CONSULTORIA',
            Endereco: {
              Endereco: 'Avenida Afonso Pena',
              Numero: '1500',
              Complemento: 'Sala 302',
              Bairro: 'Centro',
              CodigoMunicipio: '3106200',
              Uf: 'MG',
              Cep: '30130001',
            },
            Contato: {
              Telefone: '3133334444',
              Email: 'contato@mariasilva.com.br',
            },
          },
        },
      },
    },
  },
};
