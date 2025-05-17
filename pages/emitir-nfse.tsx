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
              Numero: '15',
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
                  Cnpj: '12345678000199'
                }
              },
              RazaoSocial: 'Cliente Teste LTDA',
              Endereco: {
                Endereco: 'Rua Teste',
                Numero: '123',
                Complemento: 'Apto 101',
                Bairro: 'Bairro Teste',
                CodigoMunicipio: '3106200', // Belo Horizonte
                Uf: 'MG',
                Cep: ''
              },
              Contato: {
                Email: 'cliente@teste.com',
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

      <div className="container mx-auto px-4">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="w-full">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">Emitir NFSe</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="divide-y divide-gray-200">
                <div className="py-4 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Ambiente</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
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
                          className="form-radio"
                          name="ambiente"
                          value="1"
                          checked={formData.ambiente === 1}
                          onChange={handleChange}
                        />
                        <span className="ml-2">Produção</span>
                      </label>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Dados do Prestador</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpjPrestador">
                      CNPJ do Prestador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="cnpjPrestador"
                      type="text"
                      name="Cnpj_Prestador"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Prestador.Cnpj}
                      onChange={handleChange}
                      placeholder="CNPJ (apenas números)"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inscricaoMunicipal">
                      Inscrição Municipal
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="inscricaoMunicipal"
                      type="text"
                      name="InscricaoMunicipal"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Prestador.InscricaoMunicipal}
                      onChange={handleChange}
                      placeholder="Inscrição Municipal"
                      required
                    />
                  </div>

                  {/* Campo de Razão Social do Prestador removido pois não é utilizado na API */}

                  <h3 className="text-lg font-semibold mt-4 mb-2">Dados do Tomador</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpjTomador">
                      CNPJ do Tomador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="cnpjTomador"
                      type="text"
                      name="Cnpj_Tomador"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.IdentificacaoTomador.CpfCnpj.Cnpj}
                      onChange={handleChange}
                      placeholder="CNPJ (apenas números)"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="razaoSocialTomador">
                      Razão Social do Tomador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="razaoSocialTomador"
                      type="text"
                      name="RazaoSocial_Tomador"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.RazaoSocial}
                      onChange={handleChange}
                      placeholder="Razão Social"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailTomador">
                      Email do Tomador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="emailTomador"
                      type="email"
                      name="Email_Tomador"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Tomador.Contato.Email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                    />
                  </div>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Dados do RPS</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numeroRps">
                      Número do RPS
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="numeroRps"
                      type="text"
                      name="Numero"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps.Numero}
                      onChange={handleChange}
                      placeholder="Número do RPS"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serieRps">
                      Série
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="serieRps"
                      type="text"
                      name="Serie"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.IdentificacaoRps.Serie}
                      onChange={handleChange}
                      placeholder="Série do RPS"
                      required
                    />
                  </div>

                  <h3 className="text-lg font-semibold mt-4 mb-2">Dados do Serviço</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="valorServicos">
                      Valor dos Serviços
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="valorServicos"
                      type="number"
                      step="0.01"
                      name="ValorServicos"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.ValorServicos}
                      onChange={handleChange}
                      placeholder="Valor dos Serviços"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">ISS Retido</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
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
                          className="form-radio"
                          name="IssRetido"
                          value="1"
                          checked={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.IssRetido === '1'}
                          onChange={handleChange}
                        />
                        <span className="ml-2">Sim</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aliquota">
                      Alíquota (%)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="aliquota"
                      type="number"
                      step="0.01"
                      name="Aliquota"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Valores.Aliquota}
                      onChange={handleChange}
                      placeholder="Alíquota"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemListaServico">
                      Item da Lista de Serviço
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="itemListaServico"
                      type="text"
                      name="ItemListaServico"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.ItemListaServico}
                      onChange={handleChange}
                      placeholder="Item da Lista de Serviço"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codigoTributacao">
                      Código de Tributação
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="codigoTributacao"
                      type="text"
                      name="CodigoTributacaoMunicipio"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.CodigoTributacaoMunicipio}
                      onChange={handleChange}
                      placeholder="Código de Tributação"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discriminacao">
                      Discriminação do Serviço
                    </label>
                    <textarea
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="discriminacao"
                      name="Discriminacao"
                      value={formData.LoteRps.ListaRps.Rps.InfRps.Servico.Discriminacao}
                      onChange={handleChange}
                      placeholder="Discriminação do Serviço"
                      rows={4}
                      required
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Emitir NFSe'}
                    </button>
                  </div>
                  
                  <div className="pt-4">
                    <Link href="/">
                      <button
                        className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                      >
                        Voltar ao Menu Principal
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-bold">Erro:</h3>
                <div className="mt-2 text-sm overflow-x-auto max-h-96 bg-white p-2 rounded">
                  {typeof error === 'object' && error.message ? (
                    <div className="font-bold">{error.message}</div>
                  ) : (
                    <pre className="whitespace-pre-wrap">
                      {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                    </pre>
                  )}
                </div>
                
                {error.logs && Array.isArray(error.logs) && (
                  <div className="mt-4">
                    <h3 className="font-bold">Logs:</h3>
                    <div className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
                      {error.logs.map((log, index) => (
                        <div key={index} className="mb-1">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
                
                {error.soapEnvelope && (
                  <div className="mt-4">
                    <h3 className="font-bold">Envelope SOAP:</h3>
                    <div className="bg-gray-900 text-yellow-400 p-4 rounded overflow-auto" style={{ maxHeight: '500px' }}>
                      <pre className="whitespace-pre-wrap text-xs">{error.soapEnvelope}</pre>
                    </div>
                    <div className="mt-2">
                      <button 
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
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
                    <h3 className="font-bold">Resposta HTML:</h3>
                    <div className="bg-white border border-gray-300 p-4 rounded overflow-auto max-h-96">
                      <iframe 
                        srcDoc={error.data} 
                        style={{ width: '100%', height: '300px', border: '1px solid #ddd' }} 
                        title="Resposta HTML"
                      />
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">Ver código HTML</summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 overflow-auto">{error.data}</pre>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            )}

            {response && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <h3 className="font-bold">Resposta:</h3>
                <pre className="mt-2 text-sm overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
                
                {response.soapEnvelope && (
                  <div className="mt-4">
                    <h3 className="font-bold">Envelope SOAP:</h3>
                    <div className="bg-gray-900 text-yellow-400 p-4 rounded overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap">{response.soapEnvelope}</pre>
                    </div>
                  </div>
                )}
                
                {response.logs && Array.isArray(response.logs) && (
                  <div className="mt-4">
                    <h3 className="font-bold">Logs:</h3>
                    <div className="bg-gray-800 text-green-400 p-4 rounded overflow-auto max-h-96">
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
