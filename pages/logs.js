import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState('');

  // Função para buscar logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logs?lines=500');
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configurar atualização automática
  useEffect(() => {
    fetchLogs();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 2000); // Atualizar a cada 2 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Filtrar logs
  const filteredLogs = filter
    ? logs.filter(log => log.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  // Determinar o tipo de log (info, success, error, warning)
  const getLogType = (log) => {
    const lowerLog = log.toLowerCase();
    if (lowerLog.includes('erro') || lowerLog.includes('falhou') || lowerLog.includes('✗')) {
      return 'error';
    } else if (lowerLog.includes('sucesso') || lowerLog.includes('✓')) {
      return 'success';
    } else if (lowerLog.includes('aviso') || lowerLog.includes('⚠️')) {
      return 'warning';
    } else {
      return 'info';
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Logs do Sistema</title>
        <meta name="description" content="Visualização de logs do sistema NFS-e" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="main">
        <h1 className="title">Logs do Sistema NFS-e</h1>

        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Filtrar logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="search-input"
            />
            {filter && (
              <button
                className="clear-button"
                onClick={() => setFilter('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="refresh-controls">
            <label className="auto-refresh">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
              Atualização automática
            </label>
            <button
              className="refresh-button"
              onClick={fetchLogs}
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        <div className="logs-container">
          {filteredLogs.length === 0 ? (
            <p className="empty-logs">
              {loading ? 'Carregando logs...' : 'Nenhum log encontrado.'}
            </p>
          ) : (
            <ul className="logs-list">
              {filteredLogs.map((log, index) => {
                const logType = getLogType(log);
                const timestamp = log.match(/\[(.*?)\]/);
                const logContent = timestamp
                  ? log.replace(timestamp[0], '')
                  : log;

                return (
                  <li key={index} className={`log-item ${logType}`}>
                    {timestamp && (
                      <span className="log-time">{timestamp[1]}</span>
                    )}
                    <span className="log-message">{logContent}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="status-bar">
          <div className="status-info">
            {filteredLogs.length} logs {filter ? 'filtrados' : 'encontrados'}
          </div>
          <div className="legend">
            <span className="legend-item info">Info</span>
            <span className="legend-item success">Sucesso</span>
            <span className="legend-item warning">Aviso</span>
            <span className="legend-item error">Erro</span>
          </div>
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
        }

        .main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          width: 100%;
          max-width: 1200px;
        }

        .title {
          margin: 0 0 1.5rem;
          line-height: 1.15;
          font-size: 2.5rem;
          text-align: center;
          color: #333;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 1rem;
          padding: 0 1rem;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          padding-right: 2.5rem;
        }

        .clear-button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #999;
          cursor: pointer;
        }

        .refresh-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auto-refresh {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #555;
          font-size: 0.9rem;
        }

        .refresh-button {
          padding: 0.5rem 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .refresh-button:hover {
          background-color: #0051a2;
        }

        .refresh-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .logs-container {
          width: 100%;
          height: calc(100vh - 250px);
          min-height: 400px;
          overflow-y: auto;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 0.5rem;
          background-color: #1e1e1e;
          color: #f0f0f0;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .logs-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .log-item {
          padding: 0.5rem;
          border-bottom: 1px solid #333;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .log-time {
          color: #888;
          margin-right: 0.5rem;
          font-weight: bold;
        }

        .log-item.info .log-message {
          color: #7cafc2;
        }

        .log-item.success .log-message {
          color: #a1c281;
        }

        .log-item.warning .log-message {
          color: #f7ca88;
        }

        .log-item.error .log-message {
          color: #f78c6c;
        }

        .empty-logs {
          color: #888;
          text-align: center;
          padding: 2rem;
        }

        .status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0.5rem 1rem;
          background-color: #f0f0f0;
          border-radius: 0 0 4px 4px;
          font-size: 0.9rem;
          color: #555;
        }

        .legend {
          display: flex;
          gap: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .legend-item::before {
          content: '';
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-item.info::before {
          background-color: #7cafc2;
        }

        .legend-item.success::before {
          background-color: #a1c281;
        }

        .legend-item.warning::before {
          background-color: #f7ca88;
        }

        .legend-item.error::before {
          background-color: #f78c6c;
        }
      `}</style>
    </div>
  );
}
