import React, { useState, useEffect } from "react";
import XmlViewer from "../../components/XmlViewer";

const EmitirNFSeDirect = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [requestXml, setRequestXml] = useState<string | null>(null);
  const [webserviceResponse, setWebserviceResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("raw");
  const [ambiente, setAmbiente] = useState<1 | 2>(2); // Default para homologação
  const [specificLogs, setSpecificLogs] = useState<string[]>([]);
  const [htmlInterpretation, setHtmlInterpretation] = useState<{
    title: string;
    message: string;
    requestId: string;
    timestamp: string;
    details: string;
  } | null>(null);

  // Analisar HTML da resposta quando ela mudar
  useEffect(() => {
    if (webserviceResponse && webserviceResponse.includes("Erro 552")) {
      try {
        // Extrair informações do HTML de erro usando uma abordagem mais simples
        let title = "Erro 552 - GoCache";
        let message = "Erro de comunicação com o servidor";
        let requestId = "Indisponível";
        let timestamp = "Indisponível";
        let details = "";

        // Buscar título
        if (webserviceResponse.includes("<title>")) {
          const titleStart = webserviceResponse.indexOf("<title>") + 7;
          const titleEnd = webserviceResponse.indexOf("</title>");
          if (titleEnd > titleStart) {
            title = webserviceResponse.substring(titleStart, titleEnd);
          }
        }

        // Buscar mensagem
        if (webserviceResponse.includes('<p class="message">')) {
          const messageStart =
            webserviceResponse.indexOf('<p class="message">') + 19;
          const messageEnd = webserviceResponse.indexOf("</p>", messageStart);
          if (messageEnd > messageStart) {
            message = webserviceResponse.substring(messageStart, messageEnd);
          }
        }

        // Buscar ID da requisição
        if (webserviceResponse.includes("ID da requisição:")) {
          const idStart = webserviceResponse.indexOf("ID da requisição:") + 18;
          const idEnd = webserviceResponse.indexOf("</div>", idStart);
          if (idEnd > idStart) {
            requestId = webserviceResponse.substring(idStart, idEnd).trim();
          }
        }

        // Buscar timestamp
        if (webserviceResponse.includes("Data/Hora:")) {
          const timeStart = webserviceResponse.indexOf("Data/Hora:") + 10;
          const timeEnd = webserviceResponse.indexOf("</div>", timeStart);
          if (timeEnd > timeStart) {
            timestamp = webserviceResponse.substring(timeStart, timeEnd).trim();
          }
        }

        // Buscar detalhes técnicos
        if (webserviceResponse.includes('class="details">')) {
          const detailsStart =
            webserviceResponse.indexOf('class="details">') + 16;
          const detailsEnd = webserviceResponse.indexOf("</p>", detailsStart);
          if (detailsEnd > detailsStart) {
            details = webserviceResponse
              .substring(detailsStart, detailsEnd)
              .trim();
          }
        }

        console.log("Interpretação do HTML:", {
          title,
          message,
          requestId,
          timestamp,
          details,
        });

        setHtmlInterpretation({
          title,
          message,
          requestId,
          timestamp,
          details,
        });

        // Mudar automaticamente para a aba interpretada
        setActiveTab("parsed");
      } catch (error) {
        console.error("Erro ao interpretar HTML:", error);
      }
    }
  }, [webserviceResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);
    setResultado(null);
    setLogs([]);
    setRequestUrl(null);
    setRequestXml(null);
    setWebserviceResponse(null);
    setHtmlInterpretation(null);

    try {
      const response = await fetch("/api/emitir-nfse-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ambiente, // 1=Produção, 2=Homologação
          // Demais dados da nota fiscal aqui (usando valores padrão)
        }),
      });

      const data = await response.json();

      // Sempre exibe o resultado, mesmo em caso de erro
      setResultado(data);
      setLogs(data.logs || []);
      setRequestUrl(data.requestUrl || null);
      setRequestXml(data.requestXml || null);
      setWebserviceResponse(data.webserviceResponse || null);

      if (!data.success) {
        setErro(data.message || "Erro desconhecido ao processar a nota fiscal");
      }
    } catch (error) {
      setErro(`Erro ao enviar requisição: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Emissão Direta de NFS-e (sem fila)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna de formulário */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Emissão de NFS-e</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Ambiente
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="ambiente"
                    value="2"
                    checked={ambiente === 2}
                    onChange={(e) => setAmbiente(Number(e.target.value) as 2)}
                  />
                  <span className="ml-2">Homologação</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="ambiente"
                    value="1"
                    checked={ambiente === 1}
                    onChange={(e) => setAmbiente(Number(e.target.value) as 1)}
                  />
                  <span className="ml-2">Produção</span>
                </label>
              </div>
            </div>
            {/* Aqui você pode adicionar mais campos de formulário para personalizar a nota fiscal */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50"
            >
              {loading ? "Processando..." : "Emitir NFS-e Diretamente"}
            </button>
          </form>

          {erro && (
            <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-md">
              <h3 className="font-semibold">Erro:</h3>
              <p>{erro}</p>
            </div>
          )}

          {resultado?.success && (
            <div className="bg-green-50 border border-green-300 text-green-700 p-3 rounded-md">
              <h3 className="font-semibold">Sucesso:</h3>
              <p>{resultado.message}</p>
            </div>
          )}

          <XmlViewer title="XML Enviado" xml={requestXml} />
        </div>

        {/* Coluna de logs */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Log de Processamento
          </h2>

          {/* Área de detalhes do processamento */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">
              Passo a Passo do Processamento
            </h3>

            {/* URL chamada */}
            {requestUrl && (
              <div className="mb-2">
                <span className="font-semibold">URL chamada:</span>
                <pre className="bg-white border p-2 rounded text-xs text-blue-800 overflow-auto max-h-16 mt-1">
                  {requestUrl}
                </pre>
              </div>
            )}

            {/* Logs detalhados */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Logs detalhados:</h4>
              <ol className="list-decimal pl-6 space-y-1">
                {logs.map((log, index) => {
                  // Passos numerados e destaques
                  if (/^[0-9]+\./.test(log)) {
                    return (
                      <li key={index} className="text-green-800 font-bold">
                        {log}
                      </li>
                    );
                  }
                  if (log.toLowerCase().includes("erro")) {
                    return (
                      <li key={index} className="text-red-600 font-bold">
                        {log}
                      </li>
                    );
                  }
                  if (log.toLowerCase().includes("xml enviado")) {
                    return (
                      <li key={index} className="text-blue-700">
                        {log}
                      </li>
                    );
                  }
                  if (log.toLowerCase().includes("url chamada")) {
                    return (
                      <li key={index} className="text-blue-800">
                        {log}
                      </li>
                    );
                  }
                  if (
                    log.toLowerCase().includes("resposta do webservice") ||
                    log.toLowerCase().includes("resposta da prefeitura")
                  ) {
                    return (
                      <li key={index} className="text-purple-700">
                        {log}
                      </li>
                    );
                  }
                  // XML
                  if (log.startsWith("<?xml") || log.includes("</")) {
                    return (
                      <li
                        key={index}
                        className="text-blue-500 text-xs whitespace-pre-wrap"
                      >
                        {log}
                      </li>
                    );
                  }
                  // Headers
                  if (
                    log.includes("Content-Type") ||
                    log.includes("Cache-Control")
                  ) {
                    return (
                      <li key={index} className="text-purple-500 text-xs">
                        {log}
                      </li>
                    );
                  }
                  // Demais logs
                  return (
                    <li key={index} className="text-gray-700 text-xs">
                      {log}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmitirNFSeDirect;
