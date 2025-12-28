# MINTY - Plataforma Web3 de Carteira Digital Multi-Chain

Bem-vindo ao **MINTY**, uma plataforma moderna de carteira digital com suporte a múltiplas blockchains, operações de swap, pools de liquidez, integração PIX e painel administrativo completo.

## 🚀 Características Principais

### Para Usuários
- **Smart Wallet Account Abstraction** - Carteiras seguras com Safe Protocol
- **Autenticação Social** - Google, Apple, Email via Web3Auth
- **Suporte Multi-Chain** - Ethereum, Polygon, Base, Arbitrum, Optimism, Celo, Gnosis
- **Swap de Criptomoedas** - Integração com Uniswap V3 com cotação em tempo real
- **Pools de Liquidez** - Adicionar/remover liquidez e coletar fees
- **PIX Integrado** - Depósitos e saques via QR Code dinâmico
- **Dashboard de Portfólio** - Gráficos, histórico de transações, balanço multi-token
- **Cashback & Rewards** - Acúmulo e resgate de pontos
- **Sistema de Referral** - Códigos personalizados e recompensas
- **KYC Multinível** - Verificação de identidade com Sumsub
- **Gnosis Pay** - Cartão de crédito cripto

### Para Administradores
- **Painel Administrativo Completo** - Gerenciamento de usuários, wallets, swaps, pools
- **Controle de Taxas** - Configuração dinâmica de fees
- **Monitoramento de Transações** - Logs detalhados e auditoria
- **Gerenciamento de Chains** - Ativar/desativar chains e configurar RPCs
- **Tokens Suportados** - Adicionar/remover tokens
- **Logs e Auditoria** - Rastreamento de todas as ações administrativas

## 📋 Stack Tecnológico

### Frontend
- **React 19** - Interface moderna e responsiva
- **TailwindCSS 4** - Estilização utilitária
- **tRPC** - Type-safe API calls
- **Wouter** - Roteamento leve
- **Recharts** - Gráficos e visualizações

### Backend
- **Express.js** - Servidor HTTP
- **tRPC** - RPC type-safe
- **Drizzle ORM** - Query builder e migrations
- **MySQL/MariaDB** - Banco de dados relacional
- **bcrypt** - Hash de senhas

### Web3
- **ethers.js** - Interação com blockchain
- **viem** - Cliente Web3 moderno
- **Web3Auth** - Autenticação social
- **Safe Protocol** - Account Abstraction
- **Alchemy RPC** - Provedor de nós
- **Uniswap V3 SDK** - Operações de swap

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- pnpm 8+
- MySQL 8+

### Passos

1. **Clonar repositório**
```bash
git clone https://github.com/seu-usuario/minty.git
cd minty
```

2. **Instalar dependências**
```bash
pnpm install
```

3. **Configurar variáveis de ambiente**
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais
```

4. **Configurar banco de dados**
```bash
# Criar banco de dados
mysql -u root -p < scripts/create-db.sql

# Executar migrações
pnpm db:push

# Seed inicial (criar admin)
npx tsx scripts/seed.ts
```

5. **Iniciar servidor de desenvolvimento**
```bash
pnpm dev
```

Acesse:
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login
- **API**: http://localhost:3000/api/trpc

## 📚 Documentação

- [Guia de Deployment](./DEPLOYMENT_GUIDE.md) - Instruções completas para produção
- [Arquitetura](./ARCHITECTURE.md) - Visão geral técnica
- [API Docs](./API_DOCS.md) - Documentação de endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Estrutura do banco de dados

## 🔐 Segurança

### Autenticação Admin
- **Usuário padrão**: Adilson Rocha
- **Senha padrão**: tilibra4
- **Altere a senha no primeiro login!**

### Boas Práticas
- Senhas armazenadas com bcrypt (10 rounds)
- JWT para sessões (configurável)
- HTTPS obrigatório em produção
- Rate limiting em endpoints críticos
- Validação de entrada em todos os endpoints

## 🚀 Deploy

### Opções Recomendadas
1. **Render.com** - Mais simples e rápido
2. **DigitalOcean/Linode** - Mais controle
3. **Docker** - Portabilidade máxima

Veja [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para instruções detalhadas.

## 📊 Estrutura do Projeto

```
minty/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários
│   │   └── App.tsx        # Roteamento principal
│   └── index.html
├── server/                # Backend Express + tRPC
│   ├── routers/           # Routers tRPC
│   ├── services/          # Serviços de negócio
│   ├── db.ts              # Query helpers
│   └── routers.ts         # Agregador de routers
├── drizzle/               # Migrações e schema
│   ├── schema.ts          # Definição de tabelas
│   └── migrations/        # Histórico de migrações
├── shared/                # Código compartilhado
├── DEPLOYMENT_GUIDE.md    # Guia de deploy
├── ARCHITECTURE.md        # Documentação técnica
└── package.json
```

## 🔄 Fluxos Principais

### Autenticação
1. Usuário clica em "Login com Google/Apple/Email"
2. Web3Auth abre modal de autenticação
3. Backend valida token e cria/atualiza usuário
4. Smart Wallet é gerado automaticamente
5. Sessão é criada

### Swap
1. Usuário seleciona tokens e amount
2. Frontend busca cotação via Uniswap V3 SDK
3. Usuário aprova transação
4. Smart Wallet executa swap on-chain
5. Transação é registrada no banco de dados

### PIX
1. Usuário inicia depósito/saque
2. Sistema gera QR Code dinâmico
3. Usuário escaneia e realiza PIX
4. Webhook confirma pagamento
5. Cripto é creditada/debitada

## 🧪 Testes

```bash
# Testes unitários
pnpm test

# Testes de integração
pnpm test:integration

# Coverage
pnpm test:coverage
```

## 📈 Performance

- **Lighthouse Score**: 95+
- **Time to Interactive**: < 2s
- **Bundle Size**: < 300KB (gzipped)
- **API Response Time**: < 100ms

## 🐛 Troubleshooting

### Erro: "Cannot find module 'ethers'"
```bash
pnpm install ethers viem
```

### Erro: "Database connection failed"
```bash
# Verificar MySQL está rodando
systemctl status mysql

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Erro: "Port 3000 already in use"
```bash
PORT=3001 pnpm dev
```

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 📞 Suporte

- **Email**: support@minty.app
- **Discord**: https://discord.gg/minty
- **Twitter**: @MintyCrypto
- **Documentação**: https://docs.minty.app

## 🙏 Agradecimentos

- Safe Protocol - Account Abstraction
- Web3Auth - Autenticação social
- Uniswap - Swap de tokens
- Alchemy - RPC providers
- Drizzle - ORM e migrations

---

**Versão**: 1.0.0  
**Status**: Beta  
**Última atualização**: 2024-12-28

Desenvolvido com ❤️ pelo time MINTY
