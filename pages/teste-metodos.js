import { useState } from 'react';
import axios from 'axios';

export default function TesteMetodos() {
  const [metodo, setMetodo] = useState('1');
  const [protocolo, setProtocolo] = useState('');
  const [numeroRps, setNumeroRps] = useState('15');
  const [serieRps, setSerieRps] = useState('HOMOL');
  const [dataInicial, setDataInicial] = useState('2025-05-01');
  const [dataFinal, setDataFinal] = useState('2025-05-16');
  const [numeroNfse, setNumeroNfse] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    try {
      let endpoint = '';
      let payload = {};

      switch (metodo) {
        case '1':
          endpoint = '/api/emitir-nfse-direct';
          payload = {};
          break;
        case '2':
          endpoint = '/api/consultar-situacao-lote-rps';
          payload = {
            Protocolo: protocolo
          };
          break;
        case '3':
          endpoint = '/api/consultar-nfse-por-rps';
          payload = {
            IdentificacaoRps: {
              Numero: numeroRps,
              Serie: serieRps,
              Tipo: '1'
            }
          };
          break;
        case '4':
          endpoint = '/api/consultar-lote-rps';
          payload = {
            Protocolo: protocolo
          };
          break;
        case '5':
          endpoint = '/api/consultar-nfse';
          payload = {
            PeriodoEmissao: {
              DataInicial: dataInicial,
              DataFinal: dataFinal
            }
          };
          if (numeroNfse) {
            payload.NumeroNfse = numeroNfse;
          }
          break;
        case '6':
          endpoint = '/api/cancelar-nfse';
          payload = {
            Pedido: {
              InfPedidoCancelamento: {
                IdentificacaoNfse: {
                  Numero: numeroNfse
                }
              }
            }
          };
          break;
        default:
          alert('Método não implementado');
          setLoading(false);
          return;
      }

      const response = await axios.post(endpoint, payload);
      setResultado(response.data);
    } catch (error) {
      console.error('Erro ao executar método:', error);
      setResultado({
        success: false,
        message: 'Erro ao executar método',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Métodos NFSe Belo Horizonte</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">Método:</label>
          <select 
            value={metodo} 
            onChange={(e) => setMetodo(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="1">1 - Recepção e Processamento de Lote de RPS</option>
            <option value="2">2 - Consulta de Situação de Lote de RPS</option>
            <option value="3">3 - Consulta de NFS-e por RPS</option>
            <option value="4">4 - Consulta de Lote de RPS</option>
            <option value="5">5 - Consulta de NFS-e</option>
            <option value="6">6 - Cancelamento de NFS-e</option>
          </select>
        </div>

        {(metodo === '2' || metodo === '4') && (
          <div className="mb-4">
            <label className="block mb-2">Protocolo:</label>
            <input 
              type="text" 
              value={protocolo} 
              onChange={(e) => setProtocolo(e.target.value)}
              className="border p-2 w-full"
              placeholder="Informe o protocolo"
            />
          </div>
        )}

        {metodo === '3' && (
          <>
            <div className="mb-4">
              <label className="block mb-2">Número do RPS:</label>
              <input 
                type="text" 
                value={numeroRps} 
                onChange={(e) => setNumeroRps(e.target.value)}
                className="border p-2 w-full"
                placeholder="Informe o número do RPS"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Série do RPS:</label>
              <input 
                type="text" 
                value={serieRps} 
                onChange={(e) => setSerieRps(e.target.value)}
                className="border p-2 w-full"
                placeholder="Informe a série do RPS"
              />
            </div>
          </>
        )}

        {metodo === '5' && (
          <>
            <div className="mb-4">
              <label className="block mb-2">Data Inicial:</label>
              <input 
                type="date" 
                value={dataInicial} 
                onChange={(e) => setDataInicial(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Data Final:</label>
              <input 
                type="date" 
                value={dataFinal} 
                onChange={(e) => setDataFinal(e.target.value)}
                className="border p-2 w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Número da NFSe (opcional):</label>
              <input 
                type="text" 
                value={numeroNfse} 
                onChange={(e) => setNumeroNfse(e.target.value)}
                className="border p-2 w-full"
                placeholder="Informe o número da NFSe (opcional)"
              />
            </div>
          </>
        )}

        {metodo === '6' && (
          <div className="mb-4">
            <label className="block mb-2">Número da NFSe:</label>
            <input 
              type="text" 
              value={numeroNfse} 
              onChange={(e) => setNumeroNfse(e.target.value)}
              className="border p-2 w-full"
              placeholder="Informe o número da NFSe"
            />
          </div>
        )}

        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Processando...' : 'Executar Método'}
        </button>
      </form>

      {resultado && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Resultado:</h2>
          <div className={`p-4 rounded ${resultado.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-bold">{resultado.message}</p>
            {resultado.error && <p className="text-red-600">{resultado.error}</p>}
          </div>
          
          {resultado.logs && (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Logs:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {resultado.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
