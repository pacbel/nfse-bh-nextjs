
# Manual Técnico - Sistema de Emissão de NFS-e BH

## 1. Visão Geral

O sistema de emissão de NFS-e BH é uma aplicação Next.js que permite a emissão e gerenciamento de Notas Fiscais de Serviço Eletrônicas para a Prefeitura de Belo Horizonte. O sistema implementa todos os métodos da API da NFSe-BH conforme especificação da ABRASF 1.0.

### 1.1 Tecnologias Utilizadas

- Next.js
- TypeScript
- TailwindCSS
- XML Digital Signature

## 2. Estrutura do Projeto

```
nfse-bh-nextjs/
├── components/        # Componentes React reutilizáveis
├── pages/            # Páginas da aplicação e APIs
│   ├── api/          # Endpoints da API
│   └── emitir-nfse/  # Páginas de emissão
├── types/            # Interfaces TypeScript
├── utils/            # Utilitários e funções auxiliares
├── src/              # Código fonte principal
├── styles/           # Estilos CSS e TailwindCSS
└── documentacao/     # Documentação do projeto
    ├── jsons/        # Exemplos de requisições JSON para cada método
    └── nfse_schemas10/ # Schemas XSD da ABRASF 1.0
```

## 3. APIs Disponíveis

### 3.1 Métodos NFSe Implementados

O sistema implementa todos os 6 métodos da especificação ABRASF 1.0 para NFSe:

1. **Recepção e Processamento de Lote de RPS** (`/api/emitir-nfse-direct`)
2. **Consulta de Situação de Lote de RPS** (`/api/consultar-situacao-lote-rps`)
3. **Consulta de NFS-e por RPS** (`/api/consultar-nfse-por-rps`)
4. **Consulta de Lote de RPS** (`/api/consultar-lote-rps`)
5. **Consulta de NFS-e** (`/api/consultar-nfse`)
6. **Cancelamento de NFS-e** (`/api/cancelar-nfse`)

Para cada método, existe um arquivo JSON de exemplo na pasta `documentacao/jsons/` que demonstra o formato correto de requisição.

### 3.2 API Gateway (/api/nfse-gateway)

Endpoint principal para emissão de NFS-e.

#### Requisição
```typescript
POST /api/nfse-gateway
Content-Type: application/json
{
  "nfseData": object,    // Dados da nota fiscal
  "emitente": {
    "identificacao": string,  // CNPJ ou CPF
    "tipo": "CPF" | "CNPJ"
  },
  "ambiente": 1 | 2,     // 1=Produção, 2=Homologação
  "token": string        // Token de autenticação
}
```

#### Resposta
```typescript
{
  "success": boolean,
  "message": string,
  "protocolo"?: string,
  "numeroNfse"?: string,
  "error"?: string,
  "webserviceResponse"?: string,
  "requestXml"?: string,
  "requestUrl"?: string,
  "logs"?: string[]
}
```

## 4. Detalhamento dos Métodos

### 4.1 Método 1: Recepção e Processamento de Lote de RPS

**Endpoint:** `/api/emitir-nfse-direct`

**Descrição:** Permite a emissão de NFS-e a partir de um lote de RPS (Recibo Provisório de Serviços).

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "NumeroLote": "string"  // Número do lote (opcional)
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/emitir-nfse-direct.json`

### 4.2 Método 2: Consulta de Situação de Lote de RPS

**Endpoint:** `/api/consultar-situacao-lote-rps`

**Descrição:** Permite consultar a situação de um lote de RPS enviado anteriormente.

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "Protocolo": "string"  // Protocolo recebido na emissão do lote
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/consultar-situacao-lote-rps.json`

### 4.3 Método 3: Consulta de NFS-e por RPS

**Endpoint:** `/api/consultar-nfse-por-rps`

**Descrição:** Permite consultar uma NFS-e a partir do RPS que a originou.

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "IdentificacaoRps": {
    "Numero": "string",  // Número do RPS
    "Serie": "string",  // Série do RPS
    "Tipo": "string"    // Tipo do RPS (1=RPS)
  }
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/consultar-nfse-por-rps.json`

### 4.4 Método 4: Consulta de Lote de RPS

**Endpoint:** `/api/consultar-lote-rps`

**Descrição:** Permite consultar os detalhes de um lote de RPS enviado anteriormente.

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "Protocolo": "string"  // Protocolo recebido na emissão do lote
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/consultar-lote-rps.json`

### 4.5 Método 5: Consulta de NFS-e

**Endpoint:** `/api/consultar-nfse`

**Descrição:** Permite consultar NFS-e por diversos critérios.

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "PeriodoEmissao": {
    "DataInicial": "YYYY-MM-DD",  // Data inicial
    "DataFinal": "YYYY-MM-DD"    // Data final
  },
  "NumeroNfse": "string",  // Número da NFS-e (opcional)
  "Tomador": {  // Dados do tomador (opcional)
    "CpfCnpj": {
      "Cpf": "string" | "Cnpj": "string"
    }
  }
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/consultar-nfse.json`

### 4.6 Método 6: Cancelamento de NFS-e

**Endpoint:** `/api/cancelar-nfse`

**Descrição:** Permite cancelar uma NFS-e emitida anteriormente.

**Parâmetros:**
```json
{
  "ambiente": 1 | 2,  // 1=Produção, 2=Homologação
  "Pedido": {
    "InfPedidoCancelamento": {
      "IdentificacaoNfse": {
        "Numero": "string"  // Número da NFS-e a ser cancelada
      }
    }
  }
}
```

**Exemplo completo:** Ver arquivo `documentacao/jsons/cancelar-nfse.json`

## 5. Fluxo de Processamento

1. Validação dos dados de entrada
2. Construção do XML (xmlBuilder.ts e builders específicos para cada método)
3. Assinatura digital quando necessário (utilizando as classes SignerRps, SignerLote e SignerEnvio)
4. Criação do envelope SOAP (soapBuilder.ts e soapBuilderMetodos.ts)
5. Envio ao webservice da Prefeitura
6. Processamento da resposta

## 6. Documentação de Exemplos

### 6.1 Exemplos JSON

Na pasta `documentacao/jsons/` estão disponíveis exemplos completos de requisições para cada método da API:

- `emitir-nfse-direct.json`: Exemplo de emissão de NFS-e
- `consultar-situacao-lote-rps.json`: Exemplo de consulta de situação de lote
- `consultar-nfse-por-rps.json`: Exemplo de consulta de NFS-e por RPS
- `consultar-lote-rps.json`: Exemplo de consulta de lote de RPS
- `consultar-nfse.json`: Exemplo de consulta de NFS-e
- `cancelar-nfse.json`: Exemplo de cancelamento de NFS-e

Estes exemplos podem ser utilizados como base para a implementação de chamadas à API.

## 6. Segurança

### 6.1 Autenticação
- Token baseado em API_TOKEN nas variáveis de ambiente
- Validação de token em todas as requisições

### 6.2 Certificado Digital
- Necessário para assinatura XML
- Armazenado de forma segura
- Configurado via interface administrativa

## 7. Ambientes

### 7.1 Homologação
- URL: https://bhisshomologacao.pbh.gov.br/bhiss-ws/nfse
- Usado para testes e validação

### 7.2 Produção
- URL: https://bhissdigital.pbh.gov.br/bhiss-ws/nfse
- Ambiente de produção oficial

## 8. Tratamento de Erros

O sistema implementa tratamento de erros em múltiplas camadas:
1. Validação de entrada
2. Erros de processamento XML
3. Erros de comunicação com webservice
4. Erros de resposta do webservice

## 9. Manutenção

### 9.1 Logs
- Logs detalhados de cada operação
- Armazenamento de XMLs de requisição/resposta
- Rastreamento de erros

### 9.2 Monitoramento
- Status do webservice
- Taxa de sucesso de emissão
- Tempo de resposta

## 10. Configuração

### 10.1 Variáveis de Ambiente
```env
API_TOKEN=seu-token-secreto
CERT_PATH=/caminho/para/certificado.pfx
CERT_PASSWORD=senha-do-certificado
```

## 11. Desenvolvimento

### 11.1 Instalação
```bash
npm install
npm run dev
```

### 11.2 Build
```bash
npm run build
npm start
```

### 11.3 Testes
```bash
npm test
```



# Manual do Usuário - Sistema de Emissão de NFS-e BH

## 1. Introdução

O Sistema de Emissão de NFS-e BH é uma solução completa para emissão e gerenciamento de Notas Fiscais de Serviço Eletrônicas para a Prefeitura de Belo Horizonte. Este manual irá guiá-lo através das principais funcionalidades do sistema, que agora implementa todos os 6 métodos da especificação ABRASF 1.0.

## 2. Acesso ao Sistema

1. Acesse o sistema através do navegador web
2. Faça login com suas credenciais
3. Você será direcionado para a página inicial

## 3. Métodos Disponíveis

O sistema agora oferece todos os 6 métodos da especificação ABRASF 1.0 para NFSe:

### 3.1 Método 1: Recepção e Processamento de Lote de RPS

Permite a emissão de NFS-e a partir de um lote de RPS (Recibo Provisório de Serviços).

**Endpoint:** `/api/emitir-nfse-direct`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "NumeroLote": "123"
}
```

### 3.2 Método 2: Consulta de Situação de Lote de RPS

Permite consultar a situação de um lote de RPS enviado anteriormente.

**Endpoint:** `/api/consultar-situacao-lote-rps`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "Protocolo": "ABC123456789"
}
```

### 3.3 Método 3: Consulta de NFS-e por RPS

Permite consultar uma NFS-e a partir do RPS que a originou.

**Endpoint:** `/api/consultar-nfse-por-rps`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "IdentificacaoRps": {
    "Numero": "15",
    "Serie": "HOMOL",
    "Tipo": "1"
  }
}
```

### 3.4 Método 4: Consulta de Lote de RPS

Permite consultar os detalhes de um lote de RPS enviado anteriormente.

**Endpoint:** `/api/consultar-lote-rps`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "Protocolo": "ABC123456789"
}
```

### 3.5 Método 5: Consulta de NFS-e

Permite consultar NFS-e por diversos critérios como período de emissão ou número da NFS-e.

**Endpoint:** `/api/consultar-nfse`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "PeriodoEmissao": {
    "DataInicial": "2025-05-01",
    "DataFinal": "2025-05-16"
  },
  "NumeroNfse": "202500000000001"
}
```

### 3.6 Método 6: Cancelamento de NFS-e

Permite cancelar uma NFS-e emitida anteriormente.

**Endpoint:** `/api/cancelar-nfse`

**Exemplo de uso:**
```json
{
  "ambiente": 2,
  "Pedido": {
    "InfPedidoCancelamento": {
      "IdentificacaoNfse": {
        "Numero": "202500000000001"
      }
    }
  }
}
```

## 4. Página de Teste dos Métodos

O sistema oferece uma página para testar todos os métodos implementados:

1. Acesse a página `/teste-metodos` no navegador
2. Selecione o método desejado no menu suspenso
3. Preencha os campos específicos para o método selecionado
4. Clique em "Executar Método"
5. Visualize o resultado da execução e os logs detalhados

## 5. Emissão de NFS-e

### 5.1 Emissão via Interface Web

1. Acesse o menu "Emitir NFS-e"
2. Preencha os dados da nota fiscal:
   - Dados do tomador
   - Valor do serviço
   - Descrição do serviço
   - Demais informações necessárias
3. Clique em "Emitir NFS-e"
4. Aguarde o processamento
5. Visualize o resultado da emissão

### 5.2 Emissão via API

Para integração com outros sistemas, utilize a API:

1. Endpoint: `/api/nfse-gateway`
2. Método: POST
3. Headers necessários:
   - Content-Type: application/json
4. Corpo da requisição:
```json
{
  "nfseData": {
    // Dados da nota fiscal
  },
  "emitente": {
    "identificacao": "CNPJ_OU_CPF",
    "tipo": "CNPJ"
  },
  "ambiente": 2,
  "token": "seu-token-de-acesso"
}
```

## 4. Consulta de NFS-e

### 4.1 Consulta por Número
1. Acesse "Consultar NFS-e"
2. Digite o número da nota
3. Clique em "Consultar"

### 4.2 Consulta por Período
1. Acesse "Consultar NFS-e"
2. Selecione o período desejado
3. Clique em "Consultar"

## 5. Cancelamento de NFS-e

1. Localize a nota fiscal desejada
2. Clique em "Cancelar NFS-e"
3. Informe o motivo do cancelamento
4. Confirme o cancelamento

## 6. Ambientes

### 6.1 Homologação
- Usado para testes
- Não gera notas fiscais válidas
- Identificado como "Ambiente de Teste"

### 6.2 Produção
- Ambiente oficial
- Gera notas fiscais válidas
- Use com atenção

## 7. Monitoramento

### 7.1 Status de Processamento
- Acompanhe o status em tempo real
- Visualize logs de processamento
- Identifique possíveis erros

### 7.2 Histórico
- Consulte notas emitidas
- Visualize XMLs gerados
- Acesse logs anteriores

## 8. Solução de Problemas

### 8.1 Erros Comuns

1. **Erro 552 - GoCache**
   - Possível indisponibilidade do servidor
   - Aguarde alguns minutos e tente novamente

2. **Erro de Certificado**
   - Verifique se o certificado está válido
   - Contate o suporte técnico

3. **Erro de Validação**
   - Verifique os dados informados
   - Consulte as regras de validação

### 8.2 Suporte

Em caso de dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os logs de erro
3. Contate o suporte técnico

## 9. Boas Práticas

1. **Antes de Emitir**
   - Confira todos os dados
   - Verifique o ambiente selecionado
   - Certifique-se do valor correto

2. **Após a Emissão**
   - Guarde o protocolo
   - Salve o XML gerado
   - Confirme o recebimento

3. **Cancelamento**
   - Use apenas quando necessário
   - Informe o motivo correto
   - Observe os prazos legais

## 10. Glossário

- **NFS-e**: Nota Fiscal de Serviços Eletrônica
- **XML**: Formato do arquivo da nota fiscal
- **Protocolo**: Número de identificação do processamento
- **Homologação**: Ambiente de testes
- **Produção**: Ambiente oficial




https://www.pacbel.com.br  

**Carlos Pacheco**  
carlos.pacheco@pacbel.com.br  
(31)3191-9870 (WhatsApp)

## Referências

http://www.pbh.gov.br/bhissdigital/portal/print.php?content=nfse/documentacao.php

