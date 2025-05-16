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
