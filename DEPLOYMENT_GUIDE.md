# MINTY - Guia Completo de Deployment

## 📋 Índice
1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Instalação Local](#instalação-local)
5. [Deploy em Produção](#deploy-em-produção)
6. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## Requisitos do Sistema

### Software Necessário
- **Node.js**: v18.0.0 ou superior
- **npm/pnpm**: v8.0.0 ou superior
- **MySQL**: v8.0.0 ou superior (ou MariaDB 10.5+)
- **Git**: Para controle de versão

### Recursos Recomendados
- **CPU**: 2+ cores
- **RAM**: 4GB mínimo (8GB recomendado)
- **Disco**: 20GB para aplicação + dados
- **Banda**: 10 Mbps upload/download

---

## Configuração do Banco de Dados

### 1. Criar Banco de Dados MySQL

```sql
-- Conectar ao MySQL
mysql -u root -p

-- Criar banco de dados
CREATE DATABASE minty_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário específico
CREATE USER 'minty_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';

-- Conceder permissões
GRANT ALL PRIVILEGES ON minty_production.* TO 'minty_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
SHOW GRANTS FOR 'minty_user'@'localhost';
```

### 2. Executar Migrações

```bash
# Instalar dependências
pnpm install

# Executar migrações Drizzle
pnpm db:push

# Verificar tabelas criadas
mysql -u minty_user -p minty_production -e "SHOW TABLES;"
```

### 3. Seed Inicial (Criar Admin Padrão)

```bash
# Criar script de seed
cat > seed.ts << 'EOF'
import { getDb } from './server/db';
import { getAdminAuthService } from './server/services/adminAuthService';

async function seed() {
  const adminAuthService = getAdminAuthService();
  
  // Criar admin padrão
  const admin = await adminAuthService.createAdmin(
    'Adilson Rocha',
    'adilson@minty.app',
    'tilibra4',
    'superadmin'
  );
  
  console.log('✅ Admin criado:', admin);
}

seed().catch(console.error);
EOF

# Executar seed
npx tsx seed.ts
```

---

## Variáveis de Ambiente

### Arquivo `.env.local` (Desenvolvimento)

```env
# Database
DATABASE_URL="mysql://minty_user:senha_segura@localhost:3306/minty_development"

# JWT & Auth
JWT_SECRET="sua_chave_secreta_muito_longa_aqui_minimo_32_caracteres"

# Web3 & Blockchain
ALCHEMY_API_KEY="sua_chave_alchemy_aqui"
INFURA_API_KEY="sua_chave_infura_aqui"

# OAuth (Manus)
VITE_APP_ID="seu_app_id_manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# PIX & Banco
PIX_BANK_PROVIDER="seu_provedor_pix"
PIX_API_KEY="sua_chave_pix"

# Sumsub KYC
SUMSUB_API_KEY="sua_chave_sumsub"
SUMSUB_API_URL="https://api.sumsub.com"

# Gnosis Pay
GNOSIS_PAY_API_KEY="sua_chave_gnosis"

# Admin
ADMIN_SECRET="sua_chave_admin_secreta"
```

### Arquivo `.env.production` (Produção)

```env
# Database
DATABASE_URL="mysql://minty_user:senha_muito_segura@db.production.com:3306/minty_production"

# JWT & Auth
JWT_SECRET="chave_secreta_super_longa_e_aleatoria_minimo_64_caracteres"

# Web3 & Blockchain
ALCHEMY_API_KEY="chave_alchemy_producao"
INFURA_API_KEY="chave_infura_producao"

# OAuth (Manus)
VITE_APP_ID="app_id_producao"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# PIX & Banco
PIX_BANK_PROVIDER="provedor_pix_producao"
PIX_API_KEY="chave_pix_producao"

# Sumsub KYC
SUMSUB_API_KEY="chave_sumsub_producao"
SUMSUB_API_URL="https://api.sumsub.com"

# Gnosis Pay
GNOSIS_PAY_API_KEY="chave_gnosis_producao"

# Admin
ADMIN_SECRET="chave_admin_super_secreta_producao"

# Node
NODE_ENV="production"
```

---

## Instalação Local

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/minty.git
cd minty
```

### 2. Instalar Dependências

```bash
# Usar pnpm (recomendado)
pnpm install

# Ou npm
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.local

# Editar com suas credenciais
nano .env.local
```

### 4. Configurar Banco de Dados

```bash
# Criar banco de dados
mysql -u root -p < scripts/create-db.sql

# Executar migrações
pnpm db:push

# Seed inicial (criar admin)
npx tsx scripts/seed.ts
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
# Terminal 1: Backend
pnpm dev

# Terminal 2: Frontend (se necessário)
cd client && pnpm dev
```

Acesse:
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/login
- **API**: http://localhost:3000/api/trpc

---

## Deploy em Produção

### Opção 1: Deploy no Render.com (Recomendado)

#### 1.1 Criar Conta no Render
- Acesse https://render.com
- Crie uma conta com GitHub
- Conecte seu repositório

#### 1.2 Criar Serviço Web

```yaml
# render.yaml
services:
  - type: web
    name: minty-app
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: minty-db
          property: connectionString
      - key: JWT_SECRET
        sync: false
      # ... outras variáveis

  - type: mysql
    name: minty-db
    plan: starter
    databaseName: minty_production
```

#### 1.3 Deploy

```bash
# Push para GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# Render detectará e fará deploy automaticamente
```

### Opção 2: Deploy em VPS (DigitalOcean, Linode, AWS)

#### 2.1 Preparar Servidor

```bash
# SSH no servidor
ssh root@seu_ip_vps

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
apt install -y mysql-server

# Instalar Nginx (reverse proxy)
apt install -y nginx

# Instalar PM2 (process manager)
npm install -g pm2
```

#### 2.2 Clonar e Configurar Aplicação

```bash
# Criar diretório
mkdir -p /var/www/minty
cd /var/www/minty

# Clonar repositório
git clone https://github.com/seu-usuario/minty.git .

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
nano .env.production

# Executar migrações
pnpm db:push
```

#### 2.3 Configurar PM2

```bash
# Criar arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'minty',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar startup
pm2 startup
```

#### 2.4 Configurar Nginx

```bash
# Criar configuração
cat > /etc/nginx/sites-available/minty << 'EOF'
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/minty /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

#### 2.5 Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificado
certbot certonly --nginx -d seu_dominio.com

# Renovação automática
systemctl enable certbot.timer
```

### Opção 3: Deploy no Docker

#### 3.1 Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3000

# Iniciar
CMD ["pnpm", "start"]
```

#### 3.2 Criar docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://minty_user:senha@db:3306/minty_production
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=minty_production
      - MYSQL_USER=minty_user
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### 3.3 Deploy com Docker

```bash
# Build e run
docker-compose up -d

# Verificar logs
docker-compose logs -f app

# Executar migrações
docker-compose exec app pnpm db:push
```

---

## Monitoramento e Manutenção

### 1. Logs e Debugging

```bash
# Ver logs em tempo real (PM2)
pm2 logs minty

# Ver logs específicos
tail -f /var/www/minty/logs/out.log
tail -f /var/www/minty/logs/err.log

# Com Docker
docker-compose logs -f app
```

### 2. Backup do Banco de Dados

```bash
# Backup manual
mysqldump -u minty_user -p minty_production > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u minty_user -p minty_production < backup_20240101.sql

# Backup automático (cron)
0 2 * * * mysqldump -u minty_user -p minty_production > /backups/minty_$(date +\%Y\%m\%d).sql
```

### 3. Monitoramento de Performance

```bash
# Verificar uso de recursos
pm2 monit

# Verificar conexões MySQL
mysql -u root -p -e "SHOW PROCESSLIST;"

# Verificar espaço em disco
df -h

# Verificar uso de memória
free -h
```

### 4. Atualizações de Segurança

```bash
# Atualizar dependências
pnpm update

# Verificar vulnerabilidades
pnpm audit

# Atualizar sistema
apt update && apt upgrade -y
```

### 5. Health Checks

```bash
# Verificar se aplicação está rodando
curl http://localhost:3000/api/health

# Verificar banco de dados
mysql -u minty_user -p minty_production -e "SELECT 1;"
```

---

## Troubleshooting

### Problema: Erro de conexão com banco de dados

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Verificar credenciais
mysql -u minty_user -p -h localhost

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Problema: Porta 3000 já em uso

```bash
# Encontrar processo usando porta
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm start
```

### Problema: Permissões de arquivo

```bash
# Corrigir permissões
chown -R www-data:www-data /var/www/minty
chmod -R 755 /var/www/minty
```

---

## Checklist de Deploy

- [ ] Banco de dados criado e migrado
- [ ] Variáveis de ambiente configuradas
- [ ] Admin padrão criado
- [ ] SSL/HTTPS configurado
- [ ] Backups automatizados
- [ ] Monitoramento ativado
- [ ] Logs configurados
- [ ] Health checks funcionando
- [ ] Testes de carga realizados
- [ ] Documentação atualizada

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação: https://docs.minty.app
- Issues: https://github.com/seu-usuario/minty/issues
- Email: support@minty.app

---

**Versão**: 1.0.0  
**Última atualização**: 2024-12-28
