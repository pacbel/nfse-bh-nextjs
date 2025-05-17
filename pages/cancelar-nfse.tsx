import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

const CancelarNfse = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    Pedido: {
      InfPedidoCancelamento: {
        IdentificacaoNfse: {
          Numero: '',
          CodigoMunicipio: '3106200',
          CpfCnpj: {
            Cnpj: ''
          },
          InscricaoMunicipal: ''
        },
        CodigoCancelamento: '1'
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'Numero') {
      setFormData({
        ...formData,
        Pedido: {
          ...formData.Pedido,
          InfPedidoCancelamento: {
            ...formData.Pedido.InfPedidoCancelamento,
            IdentificacaoNfse: {
              ...formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse,
              Numero: value
            }
          }
        }
      });
    } else if (name === 'Cnpj') {
      setFormData({
        ...formData,
        Pedido: {
          ...formData.Pedido,
          InfPedidoCancelamento: {
            ...formData.Pedido.InfPedidoCancelamento,
            IdentificacaoNfse: {
              ...formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse,
              CpfCnpj: {
                Cnpj: value
              }
            }
          }
        }
      });
    } else if (name === 'InscricaoMunicipal') {
      setFormData({
        ...formData,
        Pedido: {
          ...formData.Pedido,
          InfPedidoCancelamento: {
            ...formData.Pedido.InfPedidoCancelamento,
            IdentificacaoNfse: {
              ...formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse,
              InscricaoMunicipal: value
            }
          }
        }
      });
    } else if (name === 'CodigoCancelamento') {
      setFormData({
        ...formData,
        Pedido: {
          ...formData.Pedido,
          InfPedidoCancelamento: {
            ...formData.Pedido.InfPedidoCancelamento,
            CodigoCancelamento: value
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
      const res = await axios.post('/api/cancelar-nfse', {
        CancelarNfseEnvio: formData
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
        <title>Cancelar NFSe - Sistema NFSe BH</title>
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">Cancelar NFSe</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="divide-y divide-gray-200">
                <div className="py-4 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numeroNfse">
                      Número da NFSe
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="numeroNfse"
                      type="text"
                      name="Numero"
                      value={formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse.Numero}
                      onChange={handleChange}
                      placeholder="Número da NFSe"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpj">
                      CNPJ do Prestador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="cnpj"
                      type="text"
                      name="Cnpj"
                      value={formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse.CpfCnpj.Cnpj}
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
                      value={formData.Pedido.InfPedidoCancelamento.IdentificacaoNfse.InscricaoMunicipal}
                      onChange={handleChange}
                      placeholder="Inscrição Municipal"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="codigoCancelamento">
                      Código de Cancelamento
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="codigoCancelamento"
                      name="CodigoCancelamento"
                      value={formData.Pedido.InfPedidoCancelamento.CodigoCancelamento}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1 - Erro na emissão</option>
                      <option value="2">2 - Serviço não prestado</option>
                      <option value="3">3 - Duplicidade da nota</option>
                      <option value="4">4 - Outros</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Cancelar NFSe'}
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

export default CancelarNfse;
