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
    Prestador: {
      CpfCnpj: {
        Cnpj: ''
      },
      InscricaoMunicipal: '',
      RazaoSocial: ''
    },
    Tomador: {
      CpfCnpj: {
        Cnpj: ''
      },
      RazaoSocial: '',
      Endereco: {
        Endereco: '',
        Numero: '',
        Complemento: '',
        Bairro: '',
        CodigoMunicipio: '3106200', // Belo Horizonte
        Uf: 'MG',
        Cep: ''
      },
      Contato: {
        Email: ''
      }
    },
    Servico: {
      Valores: {
        ValorServicos: '',
        IssRetido: '2', // 1=Sim, 2=Não
        ValorIss: '',
        BaseCalculo: '',
        Aliquota: ''
      },
      ItemListaServico: '',
      CodigoTributacaoMunicipio: '',
      Discriminacao: '',
      CodigoMunicipio: '3106200' // Belo Horizonte
    },
    Serie: 'NFE',
    Tipo: '1',
    DataEmissao: new Date().toISOString().split('T')[0]
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
        Prestador: {
          ...formData.Prestador,
          CpfCnpj: {
            Cnpj: value
          }
        }
      });
    } else if (name === 'InscricaoMunicipal') {
      setFormData({
        ...formData,
        Prestador: {
          ...formData.Prestador,
          InscricaoMunicipal: value
        }
      });
    } else if (name === 'RazaoSocial_Prestador') {
      setFormData({
        ...formData,
        Prestador: {
          ...formData.Prestador,
          RazaoSocial: value
        }
      });
    } else if (name === 'Cnpj_Tomador') {
      setFormData({
        ...formData,
        Tomador: {
          ...formData.Tomador,
          CpfCnpj: {
            Cnpj: value
          }
        }
      });
    } else if (name === 'RazaoSocial_Tomador') {
      setFormData({
        ...formData,
        Tomador: {
          ...formData.Tomador,
          RazaoSocial: value
        }
      });
    } else if (name === 'Email_Tomador') {
      setFormData({
        ...formData,
        Tomador: {
          ...formData.Tomador,
          Contato: {
            ...formData.Tomador.Contato,
            Email: value
          }
        }
      });
    } else if (name === 'ValorServicos') {
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          Valores: {
            ...formData.Servico.Valores,
            ValorServicos: value,
            BaseCalculo: value // Por padrão, a base de cálculo é igual ao valor do serviço
          }
        }
      });
    } else if (name === 'IssRetido') {
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          Valores: {
            ...formData.Servico.Valores,
            IssRetido: value
          }
        }
      });
    } else if (name === 'Aliquota') {
      const aliquota = parseFloat(value);
      const valorServicos = parseFloat(formData.Servico.Valores.ValorServicos) || 0;
      const valorIss = (valorServicos * (aliquota / 100)).toFixed(2);
      
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          Valores: {
            ...formData.Servico.Valores,
            Aliquota: value,
            ValorIss: valorIss
          }
        }
      });
    } else if (name === 'ItemListaServico') {
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          ItemListaServico: value
        }
      });
    } else if (name === 'CodigoTributacaoMunicipio') {
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          CodigoTributacaoMunicipio: value
        }
      });
    } else if (name === 'Discriminacao') {
      setFormData({
        ...formData,
        Servico: {
          ...formData.Servico,
          Discriminacao: value
        }
      });
    } else if (name === 'Serie') {
      setFormData({
        ...formData,
        Serie: value
      });
    } else if (name === 'Tipo') {
      setFormData({
        ...formData,
        Tipo: value
      });
    } else if (name === 'DataEmissao') {
      setFormData({
        ...formData,
        DataEmissao: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post('/api/emitir-nfse-direct', {
        ambiente: formData.ambiente,
        Prestador: formData.Prestador,
        Tomador: formData.Tomador,
        Servico: formData.Servico,
        Serie: formData.Serie,
        Tipo: formData.Tipo,
        DataEmissao: formData.DataEmissao
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

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
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
                      value={formData.Prestador.CpfCnpj.Cnpj}
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
                      value={formData.Prestador.InscricaoMunicipal}
                      onChange={handleChange}
                      placeholder="Inscrição Municipal"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="razaoSocialPrestador">
                      Razão Social do Prestador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="razaoSocialPrestador"
                      type="text"
                      name="RazaoSocial_Prestador"
                      value={formData.Prestador.RazaoSocial}
                      onChange={handleChange}
                      placeholder="Razão Social"
                      required
                    />
                  </div>

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
                      value={formData.Tomador.CpfCnpj.Cnpj}
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
                      value={formData.Tomador.RazaoSocial}
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
                      value={formData.Tomador.Contato.Email}
                      onChange={handleChange}
                      placeholder="Email"
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
                      value={formData.Servico.Valores.ValorServicos}
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
                          checked={formData.Servico.Valores.IssRetido === '2'}
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
                          checked={formData.Servico.Valores.IssRetido === '1'}
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
                      value={formData.Servico.Valores.Aliquota}
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
                      value={formData.Servico.ItemListaServico}
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
                      value={formData.Servico.CodigoTributacaoMunicipio}
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
                      value={formData.Servico.Discriminacao}
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
                <pre className="mt-2 text-sm overflow-x-auto">
                  {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                </pre>
              </div>
            )}

            {response && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                <h3 className="font-bold">Resposta:</h3>
                <pre className="mt-2 text-sm overflow-x-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmitirNfse;
