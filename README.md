# Gestão Contábil - Sistema de Gerenciamento para Escritórios Contábeis

Plataforma completa para escritórios de contabilidade gerenciarem clientes, documentos, mensagens e avisos com segurança e organização.

---

## 🚀 Como iniciar o projeto

### Pré-requisitos
- **Node.js** 18+
- **Docker** (para o banco de dados PostgreSQL local)
- **npm**

### Passo 1: Subir o banco de dados PostgreSQL

```bash
docker run --name pg-contabil \
  -e POSTGRES_USER=contabil \
  -e POSTGRES_PASSWORD=contabil123 \
  -e POSTGRES_DB=sistema_contabil \
  -p 5432:5432 \
  -d postgres:16
```

### Passo 2: Configurar variáveis de ambiente

O arquivo `.env` já está configurado para desenvolvimento local. Verifique se contém:

```
DATABASE_URL="postgresql://contabil:contabil123@localhost:5432/sistema_contabil?connect_timeout=15"
NEXTAUTH_SECRET="QnaOlaZOtH64yN4mWwUvwYVo7P5kYTln"
```

> ⚠️ **Importante**: O arquivo `.env` não é versionado no Git. Em produção, configure as variáveis de ambiente adequadamente.

### Passo 3: Instalar dependências

```bash
cd nextjs_space
npm install --legacy-peer-deps
```

### Passo 4: Gerar o Prisma Client e rodar as migrations

```bash
npx prisma generate
npx prisma db push
```

### Passo 5: Popular o banco com dados de exemplo (seed)

```bash
npx tsx --require dotenv/config scripts/seed.ts
```

### Passo 6: Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔐 Credenciais de Acesso

### Conta de Administrador (Contador Principal)

| Campo | Valor |
|---|---|
| **E-mail** | `john@doe.com` |
| **Senha** | `johndoe123` |
| **Palavra secreta** | `abacaxi` |
| **Dica da palavra secreta** | `fruta amarela` |
| **Função** | Contador (acesso total) |

### Contas de Clientes (dados de exemplo)

| Empresa | E-mail | Senha | Status |
|---|---|---|---|
| Padaria Bom Sabor | `contato@padariabomsabor.com.br` | `cliente123` | Ativo |
| TechLog Soluções em TI | `financeiro@techlog.com.br` | `cliente123` | Ativo |
| Constructa Engenharia | `admin@constructa.com.br` | `cliente123` | Suspenso |

---

## 🔄 Recuperação de Senha

### Para contadores (na tela de login):
1. Clique em **"Esqueceu a senha? (somente contador)"**
2. Informe seu **e-mail** e a **palavra secreta**
3. Se a palavra secreta estiver correta, uma nova senha será exibida
4. Se errar a palavra secreta, a **dica** será exibida
5. Use a nova senha para fazer login

### Para clientes:
- Clientes **não conseguem** recuperar senha sozinhos
- O contador deve acessar **Clientes → selecionar o cliente → Resetar senha**
- Uma nova senha será gerada e exibida

---

## 👥 Funções do Sistema

### Contador (Administrador)
- Painel com visão geral (clientes ativos, documentos, mensagens)
- Cadastrar, editar e gerenciar clientes
- Resetar senha de clientes
- Gerenciar documentos por cliente, ano e mês
- Chat direto com cada cliente
- Publicar avisos gerais e acompanhar leituras
- Cadastrar outros contadores auxiliares
- Configurar identidade do escritório (nome, logo)
- Definir palavra secreta para recuperação de senha

### Cliente
- Visualizar seus documentos organizados por ano e mês
- Chat direto com o contador
- Visualizar avisos do escritório
- Confirmar leitura de avisos
- Acesso restrito apenas aos seus próprios dados

---

## 🗂️ Estrutura do Projeto

```
nextjs_space/
├── app/                    # Rotas e páginas (App Router)
│   ├── (contador)/         # Rotas do contador
│   │   ├── dashboard/      # Painel principal
│   │   ├── clientes/       # Gestão de clientes
│   │   ├── documentos/     # Central de documentos
│   │   ├── mensagens/      # Chat com clientes
│   │   ├── avisos/         # Publicação de avisos
│   │   └── configuracoes/  # Configurações do sistema
│   ├── (cliente)/portal/   # Portal do cliente
│   ├── api/                # Rotas de API
│   └── login/              # Página de login
├── components/             # Componentes reutilizáveis
│   └── ui/                 # Biblioteca de UI (Radix + Tailwind)
├── lib/                    # Lógica de negócio e utilitários
├── prisma/                 # Schema e migrations
└── scripts/                # Scripts (seed, etc.)
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework full-stack |
| TypeScript | Linguagem |
| Prisma | ORM para PostgreSQL |
| NextAuth.js | Autenticação (JWT + Credentials) |
| Tailwind CSS | Estilização |
| Radix UI | Componentes acessíveis |
| Framer Motion | Animações |
| Docker | Banco de dados local |

---

## 📝 Notas

- O sistema suporta **múltiplos contadores** no mesmo escritório (contadores auxiliares)
- Documentos são armazenados em **AWS S3** (as credenciais AWS devem ser configuradas no `.env` para upload funcionar)
- O chat utiliza **polling** a cada 10-15 segundos (não usa WebSockets)
- Para produção, altere `NEXTAUTH_SECRET` e configure um banco PostgreSQL real