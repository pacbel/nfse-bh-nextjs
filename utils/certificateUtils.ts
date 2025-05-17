import * as fs from 'fs';
import * as path from 'path';

/**
 * Encontra o caminho do certificado PFX para um determinado CNPJ
 * @param cnpj CNPJ do emitente para localizar o certificado
 * @returns Caminho completo para o arquivo de certificado PFX
 * @throws Error se nenhum certificado for encontrado ou se múltiplos certificados forem encontrados
 */
export function findCertificatePath(cnpj: string): string {
  const certDir = path.resolve(process.cwd(), 'certs', cnpj);
  
  // Verifica se o diretório existe
  if (!fs.existsSync(certDir)) {
    throw new Error(`Diretório de certificados não encontrado para o CNPJ ${cnpj}`);
  }
  
  // Lista todos os arquivos .pfx no diretório
  const pfxFiles = fs.readdirSync(certDir).filter(file => file.toLowerCase().endsWith('.pfx'));
  
  // Verifica se encontrou exatamente um arquivo .pfx
  if (pfxFiles.length === 0) {
    throw new Error(`Nenhum certificado PFX encontrado para o CNPJ ${cnpj}`);
  }
  
  if (pfxFiles.length > 1) {
    throw new Error(`Múltiplos certificados PFX encontrados para o CNPJ ${cnpj}. Por favor, mantenha apenas um certificado válido.`);
  }
  
  // Retorna o caminho completo para o único arquivo .pfx encontrado
  return path.join(certDir, pfxFiles[0]);
}
