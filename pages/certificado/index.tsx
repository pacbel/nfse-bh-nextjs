import React, { useState } from "react";
import type { CertificadoRequest } from "../../types/certificado";
import axios from "axios";
import CertificateUpload from "../../components/CertificateUpload";

// Função para formatar XML
function formatXML(xml: string): string {
  try {
    // Verificar se a string é XML
    if (!xml.trim().startsWith('<?xml') && !xml.trim().startsWith('<')) {
      return xml; // Não é XML, retornar como está
    }
    
    let formatted = '';
    let indent = '';
    const tab = '  '; // 2 espaços para indentação
    
    xml.split(/>[\s]*</g).forEach(function(node) {
      if (node.match(/^\//)) {
        // Se for tag de fechamento, diminuir indentação
        indent = indent.substring(tab.length);
      }
      
      formatted += indent + '<' + node + '>\n';
      
      if (node.match(/^<[\w][^>]*[^/]$/)) {
        // Se for tag de abertura, aumentar indentação
        indent += tab;
      }
    });
    
    return formatted.substring(1, formatted.length - 2);
  } catch (e) {
    console.error('Erro ao formatar XML:', e);
    return xml; // Em caso de erro, retornar o XML original
  }
}

// Função para detectar se a resposta contém um erro
function detectError(response: any): boolean {
  // Verificar se a resposta é uma string HTML contendo mensagem de erro
  if (typeof response === 'string' && 
      (response.includes('<title>Erro') || 
       response.includes('Erro ') || 
       response.includes('não foi possível'))) {
    return true;
  }
  
  // Verificar se a resposta é um objeto com propriedade de erro
  if (response && typeof response === 'object') {
    if (response.error || response.Erro || response.fault) {
      return true;
    }
  }
  
  return false;
}

export default function TesteEmissao() {
  const [status, setStatus] = useState("");
  const [response, setResponse] = useState("");

  const dadosNota: CertificadoRequest = {
    Prestador: {
      CpfCnpj: {
        Cnpj: "05065736000161"
      },
      InscricaoMunicipal: "01733890014",
      RazaoSocial: "PACBEL - PROGRAMAS PERSONALIZADOS LTDA",
      NomeFantasia: "SISTEMA VIRTUAL",
      Endereco: {
        Endereco: "RUA SOLANGE BERNARDES DECLIE",
        Numero: "150",
        Complemento: "CASA 2",
        Bairro: "Diamante",
        CodigoMunicipio: "3106200",
        Uf: "MG",
        Cep: "30627222",
      },
      Contato: {
        Telefone: "3196800154",
        Email: "financeiro@pacbel.com.br",
      },
    },
    Tomador: {
      CpfCnpj: {
        Cnpj: "23066373000160"
      },
      RazaoSocial: "ASSOCIACAO DO VIA CAFE GARDEN SHOPPING",
      Endereco: {
        Endereco: "Rua Humberto Pizzo",
        Numero: "999",
        Bairro: "Jardim Canaa",
        CodigoMunicipio: "3170701",
        Uf: "MG",
        Cep: "37026280",
      },
      Contato: {
        Email: "amanda.souza@viacafeshoppingcenter.com.br",
      },
    },
    Servico: {
      Valores: {
        ValorServicos: 950.0,
        IssRetido: 2,
        ValorIss: 23.75,
        BaseCalculo: 950.0,
        Aliquota: 0.025,
        ValorLiquidoNfse: 950.0,
      },
      ItemListaServico: "1.07",
      CodigoTributacaoMunicipio: "010700188",
      Discriminacao: "SERVICOS DE SUPORTE E MANUTENCAO EM PROGRAMAS DE COMPUTADOR, PERIODO DE 01/01/2023 A 31/01/2023",
      CodigoMunicipio: "3106200",
    },
  };

  const emitirNota = async () => {
    try {
      setStatus("Enviando requisição...");
      const response = await axios.post("/api/emitir-nfse", dadosNota);
      
      // Verificar se a resposta contém um erro, mesmo que o status seja 200
      const responseData = response.data;
      const isError = detectError(responseData.data);
      
      if (isError) {
        setStatus("Erro na resposta do servidor");
        
        // Se for XML ou HTML, formatar para melhor visualização
        if (typeof responseData.data === 'string' && 
            (responseData.data.includes('<?xml') || responseData.data.includes('<html'))) {
          setResponse(formatXML(responseData.data));
        } else {
          setResponse(JSON.stringify(responseData, null, 2));
        }
      } else {
        setStatus("Nota fiscal emitida com sucesso!");
        
        // Se for XML, formatar para melhor visualização
        if (typeof responseData.data === 'string' && responseData.data.includes('<?xml')) {
          setResponse(formatXML(responseData.data));
        } else {
          setResponse(JSON.stringify(responseData, null, 2));
        }
      }
    } catch (error) {
      setStatus("Erro ao emitir nota fiscal");
      
      // Tentar extrair a mensagem de erro mais detalhada
      let errorMessage = error.message;
      if (error.response?.data) {
        if (typeof error.response.data === 'string' && 
            (error.response.data.includes('<?xml') || error.response.data.includes('<html'))) {
          errorMessage = formatXML(error.response.data);
        } else if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        } else {
          errorMessage = error.response.data;
        }
      }
      
      setResponse(errorMessage);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teste de Emissão de NFS-e</h1>

      <div className="mb-6">
        <CertificateUpload />
      </div>

      <div className="mb-4">
        <button
          onClick={emitirNota}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Emitir Nota Fiscal
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Status:</h2>
        <div className="p-4 bg-gray-100 rounded">{status}</div>
      </div>

      {response && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Resposta:</h2>
          <div className="mb-2 flex justify-end">
            <button
              onClick={() => {
                // Copiar para a área de transferência
                navigator.clipboard.writeText(response);
                alert('Resposta copiada para a área de transferência!');
              }}
              className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-2 rounded"
            >
              Copiar
            </button>
          </div>
          <pre className="p-4 bg-gray-100 rounded overflow-auto text-sm max-h-[600px] whitespace-pre-wrap">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
