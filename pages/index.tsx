import React from "react";
import Head from "next/head";
import Link from "next/link";

const Home = () => {
  const menuItems = [
    { title: "Emitir NFSe", path: "/emitir-nfse", description: "Emissão de Nota Fiscal de Serviços Eletrônica" },
    { title: "Consultar NFSe", path: "/consultar-nfse", description: "Consulta de Notas Fiscais emitidas" },
    { title: "Consultar NFSe por RPS", path: "/consultar-nfse-por-rps", description: "Consulta de NFSe a partir do RPS" },
    { title: "Consultar Situação Lote RPS", path: "/consultar-situacao-lote-rps", description: "Verifica o status de processamento de um lote" },
    { title: "Consultar Lote RPS", path: "/consultar-lote-rps", description: "Consulta detalhes de um lote de RPS" },
    { title: "Cancelar NFSe", path: "/cancelar-nfse", description: "Cancelamento de Notas Fiscais emitidas" },
    { title: "Gerenciar Certificados", path: "/certificado", description: "Upload e gerenciamento de certificados digitais" },
    { title: "Logs do Sistema", path: "/logs", description: "Visualização de logs de operações" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Sistema NFSe BH - Prefeitura de Belo Horizonte</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema NFSe BH</h1>
          <p className="text-lg text-gray-600">
            Emissão e gerenciamento de Notas Fiscais de Serviços Eletrônicas para Belo Horizonte
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link href={item.path} key={index}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer h-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h2>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                <div className="bg-blue-500 px-6 py-2 text-right">
                  <span className="text-white text-sm font-medium">Acessar →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} - Sistema NFSe BH - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
