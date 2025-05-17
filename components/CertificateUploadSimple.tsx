import React, { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function CertificateUploadSimple() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

      const response = await axios.post("/api/upload-certificate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus("Certificado enviado com sucesso!");
      setSuccess(true);
    } catch (err) {
      let errorMessage =
        err.response?.data?.error ||
        (err instanceof Error ? err.message : "Erro ao enviar certificado");
      
      if (
        errorMessage.includes("RC2") ||
        errorMessage.includes("legacy") ||
        errorMessage.includes("unsupported") ||
        errorMessage.includes("Unparsed DER bytes")
      ) {
        errorMessage =
          "Não foi possível processar o certificado. Isso ocorre porque ele foi exportado com um algoritmo não suportado (RC2-40-CBC). Por favor, exporte novamente escolhendo o algoritmo TripleDES-SHA1.";
      }
      setError(errorMessage);
      setStatus("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-2">Upload de Certificado Digital</h2>
      
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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

          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm"
              disabled={!file}
            >
              Enviar Certificado
            </button>
            
            <Link href="/certificado">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-sm"
              >
                Gerenciar Certificados
              </button>
            </Link>
          </div>
        </form>
      ) : (
        <div className="text-center">
          <div className="text-green-600 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Certificado enviado com sucesso!</p>
          </div>
          <div className="mt-4">
            <Link href="/certificado">
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md text-sm"
              >
                Gerenciar Certificados
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
