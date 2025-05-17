import * as fs from 'fs';
import * as path from 'path';
import { handleXmlValidation } from './xmlValidationHandler';

interface ValidationOptions {
  xmlContent: string;
  addLog: (message: string) => void;
  xsdSchemaPath?: string;
}

/**
 * Função global para validação de XML contra XSD
 * Pode ser usada em todos os endpoints da API
 * @param options Opções de validação
 * @returns Resultado da validação
 */
export async function validateXsdGlobal(options: ValidationOptions) {
  const { xmlContent, addLog, xsdSchemaPath } = options;
  
  // Verificar se o XML está vazio
  if (!xmlContent || xmlContent.trim().length === 0) {
    addLog('[ERRO] XML a ser validado está vazio!');
    return {
      success: false,
      message: 'XML vazio',
      errors: [{ message: 'XML vazio' }]
    };
  }

  // Obter caminho do XSD das variáveis de ambiente
  let schemaPath = xsdSchemaPath;
  
  if (!schemaPath) {
    // Obter do ambiente
    schemaPath = process.env.XSD_SCHEMA_PATH;
  }
  
  if (!schemaPath) {
    // Caminho padrão
    schemaPath = path.join(process.cwd(), 'documentacao', 'nfse_schemas10', 'nfse.xsd');
    addLog(`[AVISO] Variável de ambiente XSD_SCHEMA_PATH não definida, usando caminho padrão: ${schemaPath}`);
  }
  
  // Verificar se o arquivo XSD existe
  if (!fs.existsSync(schemaPath)) {
    addLog(`[ERRO] Arquivo XSD não encontrado em: ${schemaPath}`);
    return {
      success: false,
      message: 'Arquivo XSD não encontrado',
      errors: [{ message: `Arquivo XSD não encontrado em: ${schemaPath}` }]
    };
  }
  
  addLog(`Validando XML contra o schema XSD: ${schemaPath}`);
  
  // Usar a função de validação existente
  const validationResult = await handleXmlValidation({
    xmlContent,
    addLog,
  });
  
  if (!validationResult.success) {
    addLog('Erro de validação do XML:');
    if (validationResult.detalhes) {
      addLog(`Detalhes do erro: ${JSON.stringify(validationResult.detalhes, null, 2)}`);
    }
    return validationResult;
  }
  
  addLog('✓ XML validado com sucesso contra o schema XSD');
  return validationResult;
}
