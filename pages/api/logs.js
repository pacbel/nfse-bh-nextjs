import fs from 'fs';
import path from 'path';

// Caminho para o arquivo de log
const LOG_FILE = path.resolve('./logs/nfse-api.log');

// Garantir que o diretório de logs existe
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

// Função para escrever no arquivo de log
export function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}

// Função para ler os logs mais recentes
export function readLogs(lines = 100) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    return content.split('\n')
      .filter(line => line.trim() !== '')
      .slice(-lines);
  } catch (error) {
    console.error('Erro ao ler logs:', error);
    return [];
  }
}

// Handler da API
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Obter o número de linhas a retornar (padrão: 100)
    const lines = parseInt(req.query.lines || '100', 10);
    
    // Ler os logs
    const logs = readLogs(lines);
    
    // Retornar os logs
    return res.status(200).json({ logs });
  } else if (req.method === 'POST') {
    // Adicionar novo log
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mensagem não fornecida' });
    }
    
    writeLog(message);
    return res.status(200).json({ success: true });
  } else {
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
