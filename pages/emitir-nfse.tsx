import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

const EmitirNfse = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    ambiente: 2, // 1=Produção, 2=Homologação
    LoteRps: {
      Id: 'lote',
      versao: '1.00',
      NumeroLote: '1',
      Cnpj: '05065736000161',
      InscricaoMunicipal: '01733890014',
      QuantidadeRps: 1,
      ListaRps: {
        Rps: {
          InfRps: {
            IdentificacaoRps: {
              Numero: '16',
              Serie: 'HOMOL',
              Tipo: '1'
            },
            DataEmissao: new Date().toISOString().split('.')[0],
            NaturezaOperacao: '1',
            OptanteSimplesNacional: '2',
            IncentivadorCultural: '2',
            Status: '1',
            Servico: {
              Valores: {
                ValorServicos: '2800.80',
                BaseCalculo: '2800.80',
                ValorDeducoes: '0',
                ValorPis: '0',
                ValorCofins: '0',
                ValorInss: '0',
                ValorIr: '0',
                ValorCsll: '0',
                IssRetido: '2', // 1=Sim, 2=Não
                OutrasRetencoes: '0',
                Aliquota: '2.5',
                DescontoIncondicionado: '0',
                DescontoCondicionado: '0'
              },
              ItemListaServico: '1.03',
              CodigoTributacaoMunicipio: '10300188',
              Discriminacao: 'LICENCIAMENTO OU CESSÃO DE DIREITOS DE USO DE PROGRAMAS DE COMPUTADOR',
              CodigoMunicipio: '3106200' // Belo Horizonte
            },
            Prestador: {
              Cnpj: '05065736000161',
              InscricaoMunicipal: '01733890014'
            },
            Tomador: {
              IdentificacaoTomador: {
                CpfCnpj: {
                  Cnpj: '11273147000171'
                }
              },
              RazaoSocial: 'ESCRITORIO CONTABIL CSC-SP LTDA',
              Endereco: {
                Endereco: 'Praca Dom Jose Gaspar',
                Numero: '134',
                Bairro: 'Republica',
                CodigoMunicipio: '3550308',
                Uf: 'SP',
                Cep: '01047010'
              },
              Contato: {
                Email: 'vanessa@captacao.net',
                Telefone: ''
              }
            }
          }
        }
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ambiente') {
      setFormData({
        ...formData,
        ambiente: parseInt(value)
      });
    } else if (name === 'Cnpj_Prestador') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          Cnpj: value,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Prestador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Prestador,
                  Cnpj: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'InscricaoMunicipal') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          InscricaoMunicipal: value,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Prestador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Prestador,
                  InscricaoMunicipal: value
                }
              }
            }
          }
        }
      });
      /* Função que tratava o campo de razão social do prestador removida pois não é utilizada na API */
    } else if (name === 'Cnpj_Tomador') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Tomador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador,
                  IdentificacaoTomador: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador.IdentificacaoTomador,
                    CpfCnpj: {
                      ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador.IdentificacaoTomador.CpfCnpj,
                      Cnpj: value
                    }
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'RazaoSocial_Tomador') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Tomador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador,
                  RazaoSocial: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'Email_Tomador') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Tomador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador,
                  Contato: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador.Contato,
                    Email: value
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'Telefone_Tomador') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Tomador: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador,
                  Contato: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Tomador.Contato,
                    Telefone: value
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'ValorServicos') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  Valores: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores,
                    ValorServicos: value,
                    BaseCalculo: value // Por padrão, a base de cálculo é igual ao valor do serviço
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'IssRetido') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  Valores: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores,
                    IssRetido: value
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'Aliquota') {
      const aliquota = parseFloat(value) / 100; // Converte para decimal (ex: 2.5% -> 0.025)
      const valorServicos = parseFloat(formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.ValorServicos) || 0;

      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  Valores: {
                    ...formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores,
                    Aliquota: aliquota.toString()
                  }
                }
              }
            }
          }
        }
      });
    } else if (name === 'ItemListaServico') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  ItemListaServico: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'CodigoTributacaoMunicipio') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  CodigoTributacaoMunicipio: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'Discriminacao') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                Servico: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.Servico,
                  Discriminacao: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'Numero') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                IdentificacaoRps: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps,
                  Numero: value
                }
              }
            }
          }
        }
      });
    } else if (name === 'Serie') {
      setFormData({
        ...formData,
        LoteRps: {
          ...formData.LoteRps,
          ListaRps: {
            ...formData.LoteRps.ListaRps,
            Rps: {
              ...formData.LoteRps.ListaRps.Rps,
              InfRps: {
                ...formData.LoteRps.ListaRps.Rps.InfRps,
                IdentificacaoRps: {
                  ...formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps,
                  Serie: value
                }
              }
            }
          }
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Enviar o objeto LoteRps completo para a API
      const res = await axios.post('/api/emitir-nfse-direct', {
        ambiente: formData.ambiente,
        LoteRps: formData.LoteRps
      });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>Emitir NFSe - Sistema NFSe BH</title>
      </Head>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="w-full">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">Emitir NFSe</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Ambiente */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-gray-700 text-sm font-bold mb-3">Ambiente</label>
                  <div className="flex gap-6">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="ambiente"
                        value="2"
                        checked={formData.ambiente === 2}
                        onChange={handleChange}
                      />
                      <span className="ml-2">Homologação</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600"
                        name="ambiente"
                        value="1"
                        checked={formData.ambiente === 1}
                        onChange={handleChange}
                      />
                      <span className="ml-2">Produção</span>
                    </label>
                  </div>
                </div>

                {/* Dados do Prestador */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Dados do Prestador</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpjPrestador">
                        CNPJ do Prestador
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="cnpjPrestador"
                        type="text"
                        name="Cnpj_Prestador"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Prestador.Cnpj}
                        onChange={handleChange}
                        placeholder="CNPJ (apenas números)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inscricaoMunicipal">
                        Inscrição Municipal
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="inscricaoMunicipal"
                        type="text"
                        name="InscricaoMunicipal"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Prestador.InscricaoMunicipal}
                        onChange={handleChange}
                        placeholder="Inscrição Municipal"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Tomador */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Dados do Tomador</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpjTomador">
                        CNPJ do Tomador
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="cnpjTomador"
                        type="text"
                        name="Cnpj_Tomador"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.IdentificacaoTomador.CpfCnpj.Cnpj}
                        onChange={handleChange}
                        placeholder="CNPJ (apenas números)"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailTomador">
                        Email do Tomador
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="emailTomador"
                        type="email"
                        name="Email_Tomador"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.Contato.Email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="razaoSocialTomador">
                        Razão Social do Tomador
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="razaoSocialTomador"
                        type="text"
                        name="RazaoSocial_Tomador"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.RazaoSocial}
                        onChange={handleChange}
                        placeholder="Razão Social"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do RPS */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Dados do RPS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numeroRps">
                        Número do RPS
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="numeroRps"
                        type="text"
                        name="Numero"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps.Numero}
                        onChange={handleChange}
                        placeholder="Número do RPS"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serieRps">
                        Série
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="serieRps"
                        type="text"
                        name="Serie"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps.Serie}
                        onChange={handleChange}
                        placeholder="Série do RPS"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Serviço */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Dados do Serviço</h3>

                  {/* Valores e ISS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valorServicos">
                        Valor dos Serviços (R$)
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="valorServicos"
                        type="number"
                        step="0.01"
                        name="ValorServicos"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.ValorServicos}
                        onChange={handleChange}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aliquota">
                        Alíquota (%)
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="aliquota"
                        type="number"
                        step="0.01"
                        name="Aliquota"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.Aliquota}
                        onChange={handleChange}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">ISS Retido</label>
                      <div className="flex gap-4 mt-8">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            name="IssRetido"
                            value="2"
                            checked={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.IssRetido === '2'}
                            onChange={handleChange}
                          />
                          <span className="ml-2">Não</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-blue-600"
                            name="IssRetido"
                            value="1"
                            checked={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.IssRetido === '1'}
                            onChange={handleChange}
                          />
                          <span className="ml-2">Sim</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Códigos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemListaServico">
                        Item da Lista de Serviço
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="itemListaServico"
                        type="text"
                        name="ItemListaServico"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.ItemListaServico}
                        onChange={handleChange}
                        placeholder="Ex: 01.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codigoTributacao">
                        Código de Tributação
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        id="codigoTributacao"
                        type="text"
                        name="CodigoTributacaoMunicipio"
                        value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.CodigoTributacaoMunicipio}
                        onChange={handleChange}
                        placeholder="Código de Tributação"
                        required
                      />
                    </div>
                  </div>

                  {/* Discriminação */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discriminacao">
                      Discriminação do Serviço
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                      id="discriminacao"
                      name="Discriminacao"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Discriminacao}
                      onChange={handleChange}
                      placeholder="Descrição detalhada do serviço prestado"
                      rows={4}
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </span>
                    ) : (
                      'Emitir NFSe'
                    )}
                  </button>

                  <Link href="/">
                    <button
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                      type="button"
                    >
                      Voltar ao Menu Principal
                    </button>
                  </Link>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Erro:</h3>
                <div className="mt-2 text-sm overflow-x-auto max-h-96 bg-white p-3 rounded border">
                  {typeof error === 'object' && error.message ? (
                    <div className="font-semibold">{error.message}</div>
                  ) : (
                    <pre className="whitespace-pre-wrap">
                      {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                    </pre>
                  )}
                </div>

                {error.logs && Array.isArray(error.logs) && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Logs:</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 font-mono text-sm">
                      {error.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                )}

                {error.soapEnvelope && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Envelope SOAP:</h4>
                    <div className="bg-gray-900 text-yellow-400 p-4 rounded overflow-auto" style={{ maxHeight: '500px' }}>
                      <pre className="whitespace-pre-wrap text-xs font-mono">{error.soapEnvelope}</pre>
                    </div>
                    <div className="mt-3">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm transition duration-200"
                        onClick={() => {
                          navigator.clipboard.writeText(error.soapEnvelope);
                          alert('Envelope SOAP copiado para a área de transferência!');
                        }}
                      >
                        Copiar Envelope SOAP
                      </button>
                    </div>
                  </div>
                )}

                {error.data && typeof error.data === 'string' && error.data.includes('<!DOCTYPE html>') && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Resposta HTML:</h4>
                    <div className="bg-white border border-gray-300 p-4 rounded overflow-auto max-h-96">
                      <iframe
                        srcDoc={error.data}
                        style={{ width: '100%', height: '300px', border: '1px solid #ddd' }}
                        title="Resposta HTML"
                        className="rounded"
                      />
                      <details className="mt-3">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Ver código HTML</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 overflow-auto rounded font-mono">{error.data}</pre>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            )}

            {response && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Resposta:</h3>
                <pre className="mt-2 text-sm overflow-x-auto bg-white p-3 rounded border font-mono">
                  {JSON.stringify(response, null, 2)}
                </pre>

                {response.soapEnvelope && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Envelope SOAP:</h4>
                    <div className="bg-gray-900 text-yellow-400 p-4 rounded overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap font-mono text-sm">{response.soapEnvelope}</pre>
                    </div>
                  </div>
                )}

                {response.logs && Array.isArray(response.logs) && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Logs:</h4>
                    <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 font-mono text-sm">
                      {response.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmitirNfse;
