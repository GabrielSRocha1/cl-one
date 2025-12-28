# Chainless Clone - Especificação Técnica Completa

## 1. Visão Geral da Arquitetura

A aplicação Chainless Clone é uma carteira digital Web3 multi-chain com integração DeFi e bancária. Utiliza arquitetura **clean-room** com componentes completamente novos, replicando a funcionalidade do aplicativo original sem reutilizar código decompilado.

### Stack Tecnológico

| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Frontend** | React 19, TailwindCSS 4, TypeScript | Interface de usuário responsiva |
| **Backend** | Express 4, tRPC 11, Node.js | API e lógica de negócio |
| **Database** | MySQL, Drizzle ORM | Persistência de dados |
| **Web3** | ethers.js, viem, Safe SDK | Interação com blockchain |
| **RPC** | Alchemy | Acesso a múltiplas chains |
| **Autenticação** | Web3Auth, Manus OAuth | Login social e Web3 |
| **Carteira** | Safe (Account Abstraction) | Smart Wallet multi-sig |
| **DEX** | Uniswap V3 | Swap de tokens |
| **Lending** | Aave/Compound | Pools de liquidez |
| **Compliance** | Sumsub | KYC/AML |
| **Pagamentos** | Gnosis Pay | Cartão cripto |
| **Bancário** | PIX Provider | Depósito/saque fiat |

## 2. Arquitetura de Componentes

### 2.1 Frontend Architecture

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx                    # Dashboard principal
│   │   ├── Wallet.tsx                  # Gerenciamento de carteira
│   │   ├── Swap.tsx                    # Troca de tokens
│   │   ├── Liquidity.tsx               # Pools de liquidez
│   │   ├── Deposit.tsx                 # Depósito via PIX
│   │   ├── Withdraw.tsx                # Saque via PIX
│   │   ├── Portfolio.tsx               # Dashboard de portfólio
│   │   ├── Rewards.tsx                 # Cashback e rewards
│   │   ├── Referral.tsx                # Sistema de referral
│   │   ├── KYC.tsx                     # Verificação de identidade
│   │   └── Settings.tsx                # Configurações
│   ├── components/
│   │   ├── ChainSelector.tsx           # Seletor de blockchain
│   │   ├── TokenSelector.tsx           # Seletor de tokens
│   │   ├── PriceChart.tsx              # Gráficos de preço
│   │   ├── TransactionHistory.tsx      # Histórico de transações
│   │   ├── WalletBalance.tsx           # Exibição de saldo
│   │   ├── QRCodeGenerator.tsx         # Gerador de QR Code
│   │   └── NotificationCenter.tsx      # Centro de notificações
│   ├── hooks/
│   │   ├── useWeb3Auth.ts              # Hook para Web3Auth
│   │   ├── useSafeWallet.ts            # Hook para Safe
│   │   ├── useTokenBalance.ts          # Hook para saldo de tokens
│   │   ├── useSwap.ts                  # Hook para swap
│   │   ├── useLiquidity.ts             # Hook para pools
│   │   └── usePrice.ts                 # Hook para preços
│   ├── contexts/
│   │   ├── Web3Context.tsx             # Contexto Web3
│   │   ├── WalletContext.tsx           # Contexto de carteira
│   │   └── UserContext.tsx             # Contexto de usuário
│   └── lib/
│       ├── web3.ts                     # Utilitários Web3
│       ├── alchemy.ts                  # Cliente Alchemy
│       ├── uniswap.ts                  # Integração Uniswap
│       └── aave.ts                     # Integração Aave
```

### 2.2 Backend Architecture

```
server/
├── routers/
│   ├── auth.ts                         # Autenticação e sessão
│   ├── wallet.ts                       # Gerenciamento de carteira
│   ├── tokens.ts                       # Dados de tokens
│   ├── swap.ts                         # Execução de swaps
│   ├── liquidity.ts                    # Pools de liquidez
│   ├── transactions.ts                 # Histórico de transações
│   ├── deposit.ts                      # Depósito via PIX
│   ├── withdraw.ts                     # Saque via PIX
│   ├── portfolio.ts                    # Dashboard de portfólio
│   ├── rewards.ts                      # Cashback e rewards
│   ├── referral.ts                     # Sistema de referral
│   ├── kyc.ts                          # KYC/Sumsub
│   ├── gnosisPay.ts                    # Gnosis Pay
│   └── prices.ts                       # Preços de tokens
├── db.ts                               # Query helpers
├── services/
│   ├── web3Service.ts                  # Serviço Web3
│   ├── safeService.ts                  # Serviço Safe
│   ├── uniswapService.ts               # Serviço Uniswap
│   ├── aaveService.ts                  # Serviço Aave
│   ├── pixService.ts                   # Serviço PIX
│   ├── sumsubService.ts                # Serviço Sumsub
│   └── gnosisPayService.ts             # Serviço Gnosis Pay
└── webhooks/
    ├── pixWebhook.ts                   # Webhook de PIX
    └── transactionWebhook.ts           # Webhook de transações
```

### 2.3 Database Schema

```
users
├── id (PK)
├── openId (unique)
├── email
├── name
├── kycLevel (enum: NONE, BASIC, ADVANCED, FULL)
├── kycStatus (enum: PENDING, APPROVED, REJECTED)
├── referralCode (unique)
├── referredBy (FK)
├── createdAt
└── updatedAt

wallets
├── id (PK)
├── userId (FK)
├── address (Smart Wallet)
├── chainId
├── safeAddress
├── owners
├── threshold
├── isActive
├── createdAt
└── updatedAt

tokens
├── id (PK)
├── address
├── chainId
├── symbol
├── name
├── decimals
├── logoUrl
├── isActive
└── updatedAt

balances
├── id (PK)
├── walletId (FK)
├── tokenId (FK)
├── balance
├── updatedAt

transactions
├── id (PK)
├── userId (FK)
├── type (enum: SWAP, LIQUIDITY_ADD, LIQUIDITY_REMOVE, DEPOSIT, WITHDRAW)
├── fromToken
├── toToken
├── amount
├── hash
├── status
├── chainId
├── createdAt
└── updatedAt

pools
├── id (PK)
├── userId (FK)
├── poolAddress
├── token0
├── token1
├── liquidity
├── fee
├── createdAt
└── updatedAt

rewards
├── id (PK)
├── userId (FK)
├── type (enum: CASHBACK, REFERRAL, TRADING)
├── amount
├── status (enum: PENDING, CLAIMED)
├── claimedAt
└── createdAt

deposits
├── id (PK)
├── userId (FK)
├── pixKey
├── amount
├── status (enum: PENDING, CONFIRMED, FAILED)
├── txHash
├── createdAt
└── updatedAt

withdrawals
├── id (PK)
├── userId (FK)
├── pixKey
├── amount
├── status (enum: PENDING, CONFIRMED, FAILED)
├── txHash
├── createdAt
└── updatedAt
```

## 3. Fluxos de Usuário

### 3.1 Onboarding e Autenticação

1. **Login Social**: Usuário clica em "Google", "Apple" ou "Email"
2. **Web3Auth**: Integração com Web3Auth para gerar chaves Web3
3. **Smart Wallet**: Criação de Safe com Account Abstraction
4. **KYC Básico**: Coleta de informações básicas (nome, email, país)
5. **Dashboard**: Redirecionamento para dashboard principal

### 3.2 Fluxo de Swap

1. Usuário seleciona token de origem e destino
2. Sistema busca melhor rota via Uniswap V3
3. Exibe cotação e slippage configurável
4. Usuário confirma transação
5. Safe executa swap on-chain
6. Transação é registrada no banco de dados

### 3.3 Fluxo de Depósito PIX

1. Usuário clica em "Depositar"
2. Sistema gera QR Code dinâmico com PIX
3. Usuário escaneia com app bancário
4. Banco confirma pagamento via webhook
5. Sistema executa swap fiat -> cripto
6. Cripto é transferida para Smart Wallet
7. Notificação de sucesso

### 3.4 Fluxo de Pools de Liquidez

1. Usuário seleciona dois tokens
2. Sistema exibe dados da pool (APY, fees, TVL)
3. Usuário define quantidade de liquidez
4. Safe executa addLiquidity on-chain
5. NFT de posição é emitido
6. Usuário pode coletar fees periodicamente

## 4. Integrações Externas

### 4.1 Web3Auth

- **Endpoint**: https://web3auth.io
- **Métodos**: Google, Apple, Email
- **Fluxo**: OAuth2 -> Web3 Key Generation -> Session Management

### 4.2 Alchemy RPC

- **Chains Suportadas**: Polygon, Base, Ethereum, Arbitrum, Optimism, Celo, Gnosis
- **Endpoints**: https://g.alchemy.com/v2/{API_KEY}
- **Rate Limit**: 300 req/s (tier padrão)

### 4.3 Uniswap V3

- **Contratos**: Uniswap V3 Router, SwapRouter02
- **Fluxo**: getAmountsOut -> swap -> verificar slippage
- **Suporte**: Todas as chains EVM

### 4.4 Aave/Compound

- **Contratos**: Lending Pool, cToken
- **Fluxo**: deposit -> earn interest -> withdraw
- **Suporte**: Polygon, Ethereum, Arbitrum

### 4.5 Sumsub KYC

- **Endpoint**: https://api.sumsub.com
- **Fluxo**: Coleta de documentos -> Análise de IA -> Aprovação
- **Níveis**: Basic (selfie), Advanced (documento), Full (verificação bancária)

### 4.6 Gnosis Pay

- **Endpoint**: https://api.gnosisscan.io
- **Fluxo**: Integração de cartão cripto
- **Suporte**: Múltiplas chains

### 4.7 PIX Provider (Banco)

- **Endpoint**: Banco específico (ex: Nubank, Itaú)
- **Fluxo**: Geração de QR Code -> Confirmação de pagamento
- **Webhook**: Notificação de transação confirmada

## 5. Segurança

### 5.1 Autenticação

- **JWT**: Sessão com cookie seguro
- **Web3Auth**: Chaves criptográficas
- **Safe**: Multi-sig para transações críticas

### 5.2 Autorização

- **Role-based**: Admin, User
- **KYC-based**: Limites por nível de KYC

### 5.3 Proteção de Dados

- **Criptografia**: AES-256 para dados sensíveis
- **HTTPS**: Todos os endpoints
- **CORS**: Restrição de origem

### 5.4 Validação

- **Input**: Zod para validação de schemas
- **Transações**: Verificação de slippage, limites
- **Assinaturas**: Verificação de assinatura Web3

## 6. Performance

### 6.1 Otimizações Frontend

- **Code Splitting**: Lazy loading de rotas
- **Caching**: React Query para cache de dados
- **Memoization**: useMemo/useCallback para componentes pesados

### 6.2 Otimizações Backend

- **Database**: Índices em campos frequentemente consultados
- **RPC Caching**: Cache de respostas de RPC por 5 minutos
- **Batch Requests**: Agrupamento de chamadas RPC

### 6.3 Otimizações Blockchain

- **Multicall**: Agrupamento de chamadas de contrato
- **Subgraph**: Indexação de eventos on-chain
- **Gas Optimization**: Minimização de operações on-chain

## 7. Monitoramento e Logging

### 7.1 Métricas

- **Transações**: Taxa de sucesso, tempo médio
- **Usuários**: Ativos, novos, retidos
- **Performance**: Latência de API, uso de RPC

### 7.2 Alertas

- **Falhas de Transação**: Notificação ao usuário
- **Erros de RPC**: Fallback para outro provider
- **Anomalias**: Detecção de padrões suspeitos

## 8. Roadmap de Implementação

| Fase | Duração | Funcionalidades |
|------|---------|-----------------|
| 1 | 1 semana | Autenticação, Smart Wallet, Dashboard |
| 2 | 2 semanas | Gerenciamento de carteira, Histórico |
| 3 | 2 semanas | Swap, Pools de liquidez |
| 4 | 1 semana | Depósito/saque PIX |
| 5 | 1 semana | Rewards, Referral, Cashback |
| 6 | 1 semana | KYC/Sumsub, Gnosis Pay |
| 7 | 1 semana | Testes, otimizações, deploy |

**Total**: ~9 semanas para MVP completo

## 9. Referências Técnicas

- [Web3Auth Docs](https://web3auth.io/docs)
- [Safe SDK](https://github.com/safe-global/safe-core-sdk)
- [Alchemy API](https://docs.alchemy.com)
- [Uniswap V3 SDK](https://docs.uniswap.org/sdk/v3/overview)
- [Aave Protocol](https://docs.aave.com)
- [Sumsub API](https://developers.sumsub.com)
- [Gnosis Pay](https://gnosisscan.io)
