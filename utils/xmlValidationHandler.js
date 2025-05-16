import { validateXml } from "./xmlValidate";

/**
 * Função que encapsula toda a lógica de validação do XML, incluindo o agrupamento de erros
 * e a geração de sugestões de correção.
 * @param {Object} params - Parâmetros da validação
 * @param {string} params.xmlContent - Conteúdo XML a ser validado
 * @param {Function} params.addLog - Função para adicionar logs
 * @returns {Object} Resultado da validação com status e logs
 */
export async function handleXmlValidation({ xmlContent, addLog }) {

  const validationResult = await validateXml({
    xmlContent,
    throwOnError: false,
  });

  if (validationResult.isValid) {
    addLog("✓ XML VALIDADO COM SUCESSO");
    addLog("- Estrutura do XML está em conformidade com o schema XSD");
    addLog("- Todos os campos obrigatórios estão presentes");
    addLog("- Tipos de dados estão corretos");
    return { success: true };
  }

  addLog("✕ ERROS ENCONTRADOS NA VALIDAÇÃO DO XML:");

  // Agrupar erros por tipo
  const errorsGrouped = validationResult.errors.reduce((acc, error) => {
    const group = acc[error.code] || [];
    group.push(error);
    acc[error.code] = group;
    return acc;
  }, {});

  // Exibir erros agrupados
  Object.entries(errorsGrouped).forEach(([code, errors]) => {
    addLog(`\n[${code}]`);
    errors.forEach((error, index) => {
      const location = error.path ? ` em ${error.path}` : "";
      const found = error.found ? ` (encontrado: ${error.found})` : "";
      const expected = error.expected ? ` (esperado: ${error.expected})` : "";
      addLog(`  ${index + 1}. ${error.message}${location}${found}${expected}`);
    });
  });

  // Sugestões específicas baseadas nos tipos de erro
  addLog("\nℹ SUGESTÕES DE CORREÇÃO:");

  if (errorsGrouped.MISSING_REQUIRED) {
    addLog("- Adicione os campos obrigatórios que estão faltando");
  }
  if (errorsGrouped.INVALID_VALUE || errorsGrouped.INVALID_PATTERN) {
    addLog("- Corrija os valores inválidos para o formato esperado");
  }
  if (errorsGrouped.INVALID_FORMAT) {
    addLog("- Verifique o formato dos campos (datas, números, etc)");
  }
  if (errorsGrouped.SCHEMA_NOT_FOUND) {
    addLog("- Verifique se o arquivo XSD está presente no diretório correto");
  }

  const result = {
    success: false,
    error: "Erro na validação do XML",
    detalhes: validationResult.errors
  };
  return result;
}
