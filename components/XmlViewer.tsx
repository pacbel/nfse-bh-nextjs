import React, { useEffect, useRef } from 'react';
import styles from '../styles/XmlViewer.module.css';

interface XmlViewerProps {
  xml: string;
  title?: string;
}

const XmlViewer: React.FC<XmlViewerProps> = ({ xml, title }) => {
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.innerHTML = formatXml(xml);
    }
  }, [xml]);

  const formatXml = (xml: string): string => {
    try {
      // Se o XML estiver vazio, retornar mensagem
      if (!xml) return 'Nenhum XML para exibir';

      // Remover espaços em branco extras
      xml = xml.trim();

      // Criar um parser XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');

      // Verificar se há erros de parsing
      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        return 'XML inválido: ' + parserError[0].textContent;
      }

      // Formatar o XML com cores e indentação
      const formatted = xml
        .replace(/></g, '>\n<')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n')
        .map((line) => {
          const indent = line.match(/^([\s]*)</)?.[1]?.length || 0;
          const spaces = '  '.repeat(indent);
          return spaces + line.trim();
        })
        .join('\n')
        .replace(/&lt;(\/?[a-zA-Z0-9:-]+)([^&>]*)&gt;/g, (match, tag, attrs) => {
          const formattedAttrs = attrs ? attrs.replace(/([a-zA-Z0-9:-]+)=&quot;([^&]*)&quot;/g, ' $1="<span class="value">$2</span>"') : '';
          return `<span class="tag">&lt;${tag}</span>${formattedAttrs}<span class="tag">&gt;</span>`;
        });

      return formatted.replace('\n', '');
    } catch (error) {
      console.error('Erro ao formatar XML:', error);
      return 'Erro ao formatar XML: ' + (error as Error).message;
    }
  };

  const copyToClipboard = () => {
    if (xml) {
      navigator.clipboard.writeText(xml)
        .then(() => alert('XML copiado para a área de transferência!'))
        .catch(err => console.error('Erro ao copiar:', err));
    }
  };

  return (
    <div className={styles.xmlViewer}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.toolbar}>
        <button onClick={copyToClipboard} className={styles.copyButton}>
          Copiar XML
        </button>
      </div>
      <pre ref={preRef} className={styles.xmlContent} />
    </div>
  );
};

export default XmlViewer;
