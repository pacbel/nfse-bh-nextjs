import React, { useState } from "react";
import axios from "axios";

interface CertificateUploadProps {
  onSuccess?: () => void;
}

export default function CertificateUpload({
  onSuccess,
}: CertificateUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      setError("Por favor, selecione um arquivo de certificado.");
      return;
    }

    try {
      setStatus("Enviando certificado...");
      const formData = new FormData();
      formData.append("certificate", file);
      formData.append("password", process.env.CERTIFICATE_PASSWORD);

      const response = await axios.post("/api/upload-certificate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Certificado enviado com sucesso!");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      let errorMessage =
        err.response?.data?.error ||
        (err instanceof Error ? err.message : "Erro ao enviar certificado");
      // Detecção de erro de algoritmo legacy/RC2
      if (
        errorMessage.includes("RC2") ||
        errorMessage.includes("legacy") ||
        errorMessage.includes("unsupported") ||
        errorMessage.includes("Unparsed DER bytes")
      ) {
        errorMessage =
          "Não foi possível processar o certificado. Isso ocorre porque ele foi exportado com um algoritmo não suportado (RC2-40-CBC). Por favor, exporte novamente escolhendo o algoritmo TripleDES-SHA1. Veja as instruções acima.";
      }
      setError(errorMessage);
      setStatus("");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        Upload de Certificado Digital
      </h2>

      {/* Instruções para exportação correta do .pfx */}
      <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
        <strong>Importante:</strong> Para garantir compatibilidade, exporte seu arquivo <code>.pfx</code> escolhendo o algoritmo <b>TripleDES-SHA1</b>.<br/>
        Não utilize opções RC2 (RC2-40, RC2-128, RC2-64).<br/>
        Caso encontre erro ao enviar, tente exportar novamente seguindo este procedimento.<br/>
        <a href="https://www.youtube.com/watch?v=8E0R4pU3Z9A" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Veja como exportar corretamente</a>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arquivo do Certificado (.pfx)
          </label>
          <input
            type="file"
            accept=".pfx"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        {status && <div className="text-green-600 text-sm">{status}</div>}

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Enviar Certificado
        </button>
      </form>
    </div>
  );
}
