import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

const ConsultarNfsePorRps = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    IdentificacaoPrestador: {
      Cnpj: '',
      InscricaoMunicipal: ''
    },
    IdentificacaoRps: {
      Numero: '',
      Serie: '',
      Tipo: '1'
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'Cnpj') {
      setFormData({
        ...formData,
        IdentificacaoPrestador: {
          ...formData.IdentificacaoPrestador,
          Cnpj: value
        }
      });
    } else if (name === 'InscricaoMunicipal') {
      setFormData({
        ...formData,
        IdentificacaoPrestador: {
          ...formData.IdentificacaoPrestador,
          InscricaoMunicipal: value
        }
      });
    } else if (name === 'Numero') {
      setFormData({
        ...formData,
        IdentificacaoRps: {
          ...formData.IdentificacaoRps,
          Numero: value
        }
      });
    } else if (name === 'Serie') {
      setFormData({
        ...formData,
        IdentificacaoRps: {
          ...formData.IdentificacaoRps,
          Serie: value
        }
      });
    } else if (name === 'Tipo') {
      setFormData({
        ...formData,
        IdentificacaoRps: {
          ...formData.IdentificacaoRps,
          Tipo: value
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
      const res = await axios.post('/api/consultar-nfse-por-rps', {
        ConsultarNfseRpsEnvio: {
          Prestador: {
            CpfCnpj: {
              Cnpj: formData.IdentificacaoPrestador.Cnpj
            },
            InscricaoMunicipal: formData.IdentificacaoPrestador.InscricaoMunicipal
          },
          IdentificacaoRps: formData.IdentificacaoRps
        }
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
        <title>Consultar NFSe por RPS - Sistema NFSe BH</title>
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-center mb-6">Consultar NFSe por RPS</h1>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="divide-y divide-gray-200">
                <div className="py-4 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cnpj">
                      CNPJ do Prestador
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="cnpj"
                      type="text"
                      name="Cnpj"
                      value={formData.IdentificacaoPrestador.Cnpj}
                      onChange={handleChange}
                      placeholder="CNPJ (apenas nu00fameros)"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="inscricaoMunicipal">
                      Inscriu00e7u00e3o Municipal
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="inscricaoMunicipal"
                      type="text"
                      name="InscricaoMunicipal"
                      value={formData.IdentificacaoPrestador.InscricaoMunicipal}
                      onChange={handleChange}
                      placeholder="Inscriu00e7u00e3o Municipal"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numeroRps">
                      Nu00famero do RPS
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="numeroRps"
                      type="text"
                      name="Numero"
                      value={formData.IdentificacaoRps.Numero}
                      onChange={handleChange}
                      placeholder="Nu00famero do RPS"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serieRps">
                      Su00e9rie do RPS
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="serieRps"
                      type="text"
                      name="Serie"
                      value={formData.IdentificacaoRps.Serie}
                      onChange={handleChange}
                      placeholder="Su00e9rie do RPS"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tipoRps">
                      Tipo do RPS
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="tipoRps"
                      name="Tipo"
                      value={formData.IdentificacaoRps.Tipo}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1 - RPS</option>
                      <option value="2">2 - Nota Fiscal Conjugada (Mista)</option>
                      <option value="3">3 - Cupom</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Consultando...' : 'Consultar NFSe por RPS'}
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

export default ConsultarNfsePorRps;
