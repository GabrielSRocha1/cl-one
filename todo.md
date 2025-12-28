# Chainless Clone - Project TODO

## Phase 1: Análise de Requisitos e Design Arquitetural
- [x] Documentar especificação técnica completa (APIs, fluxos, integrações)
- [x] Definir arquitetura de frontend (React + Web3 libs)
- [x] Definir arquitetura de backend (tRPC + Drizzle + Smart Contracts)
- [x] Mapear dependências Web3 (ethers.js, viem, Safe, Web3Auth)
- [x] Definir modelo de dados (users, wallets, transactions, pools, rewards)
- [x] Criar diagrama de fluxos de usuário

## Phase 2: Configurar Infraestrutura Web3 e Integrações Externas
- [x] Instalar e configurar Web3Auth (Google, Apple, Email)
- [x] Configurar Safe Account Abstraction (Safe SDK)
- [x] Integrar Alchemy RPC para múltiplas chains
- [x] Configurar Uniswap V3 SDK para Swap
- [ ] Integrar Aave/Compound para Pools de Liquidez
- [ ] Configurar Sumsub para KYC
- [ ] Integrar Gnosis Pay API
- [x] Configurar integração bancária (PIX provider)
- [ ] Setup variáveis de ambiente e secrets

## Phase 3: Implementar Autenticação e Smart Wallet Account Abstraction
- [ ] Criar fluxo de login social (Google, Apple, Email)
- [ ] Implementar Web3Auth integration
- [ ] Gerar e gerenciar Smart Wallet (Safe)
- [ ] Implementar session management
- [ ] Criar testes de autenticação
- [ ] Validar fluxo de onboarding

## Phase 4: Construir Sistema de Carteira Multi-chain e Gerenciamento de Tokens
- [x] Criar schema de carteiras e tokens
- [x] Implementar detecção de chains
- [x] Integrar RPC providers (Alchemy)
- [x] Implementar busca de saldo de tokens
- [ ] Criar lista de tokens suportados
- [ ] Implementar conversão de preços (USD/BRL)
- [ ] Criar UI de seleção de chain
- [x] Implementar histórico de transações on-chain

## Phase 5: Implementar Fluxos de Depósito/Saque PIX com Integração Bancária
- [ ] Integrar PIX provider (banco)
- [ ] Implementar geração de QR Code dinâmico
- [ ] Criar fluxo de depósito (fiat -> cripto)
- [ ] Criar fluxo de saque (cripto -> fiat)
- [ ] Implementar validação de conta bancária
- [ ] Criar UI de depósito/saque
- [ ] Implementar webhook para confirmação de pagamento
- [ ] Adicionar histórico de transações PIX

## Phase 6: Desenvolver Sistema de Swap e Pools de Liquidez
- [ ] Integrar Uniswap V3 para Swap
- [ ] Implementar busca de melhor rota de swap
- [ ] Criar UI de Swap com slippage configurável
- [ ] Implementar execução de swap on-chain
- [ ] Integrar Aave/Compound para Pools
- [ ] Criar UI de adição/remoção de liquidez
- [ ] Implementar coleta de fees
- [ ] Criar visualização de posições de liquidez

## Phase 7: Criar Dashboard de Portfólio e Histórico de Transações
- [ ] Criar dashboard principal com balanço total
- [ ] Implementar gráficos de preço (Chart.js/Recharts)
- [ ] Criar visualização de tokens por chain
- [ ] Implementar filtros de transações
- [ ] Criar histórico detalhado de transações
- [ ] Implementar busca de transações
- [ ] Criar exportação de relatórios
- [ ] Adicionar notificações de transações

## Phase 8: Implementar Sistema de Cashback, Rewards e Referral
- [ ] Criar schema de rewards e referrals
- [ ] Implementar acúmulo de cashback
- [ ] Criar sistema de pontos
- [ ] Implementar geração de código de referral
- [ ] Criar UI de referral com compartilhamento
- [ ] Implementar rastreamento de referidos
- [ ] Criar UI de resgate de rewards
- [ ] Implementar histórico de rewards

## Phase 9: Integrar Gnosis Pay, KYC/Sumsub e Compliance
- [ ] Integrar Gnosis Pay API
- [ ] Implementar fluxo de cartão cripto
- [ ] Integrar Sumsub para KYC
- [ ] Criar fluxo de verificação de identidade
- [ ] Implementar níveis de KYC (Basic, Advanced, Full)
- [ ] Criar UI de KYC
- [ ] Implementar validação de compliance
- [ ] Adicionar limites de transação por nível KYC

## Phase 10: Testes, Otimizações e Validação de Paridade Funcional
- [ ] Escrever testes unitários (vitest)
- [ ] Escrever testes de integração
- [ ] Testar fluxos de usuário end-to-end
- [ ] Validar paridade com APK original
- [ ] Otimizar performance de carregamento
- [ ] Otimizar consumo de RPC
- [ ] Testar em múltiplas chains
- [ ] Testar em diferentes navegadores

## Phase 11: Documentação Final e Entrega do Projeto
- [ ] Documentar arquitetura final
- [ ] Criar guia de deploy
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de uso para usuários
- [ ] Documentar APIs e contratos inteligentes
- [ ] Criar changelog
- [ ] Preparar entrega final
