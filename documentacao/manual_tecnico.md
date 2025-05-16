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
└── documentacao/     # Documentação do projeto
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

## 5. Fluxo de Processamento

1. Validação dos dados de entrada
2. Construção do XML (xmlBuilder.ts e builders específicos para cada método)
3. Assinatura digital quando necessário (assinador.ts)
4. Criação do envelope SOAP (soapBuilder.ts e soapBuilderMetodos.ts)
5. Envio ao webservice da Prefeitura
6. Processamento da resposta

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
