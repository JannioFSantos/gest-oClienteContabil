# Gestão Contábil - Sistema de Gerenciamento para Escritórios Contábeis

Plataforma para escritórios de contabilidade gerenciarem clientes, documentos, mensagens e avisos.

## Como iniciar o projeto

### Pré-requisitos

- Node.js 18+
- Docker (para PostgreSQL local)
- npm

### Passo 1: Banco de dados PostgreSQL

```bash
docker run --name pg-contabil \
  -e POSTGRES_USER=contabil \
  -e POSTGRES_PASSWORD=contabil123 \
  -e POSTGRES_DB=sistema_contabil \
  -p 5432:5432 \
  -d postgres:16
```

### Passo 2: Variáveis de ambiente

O arquivo `.env` já está configurado para desenvolvimento local:

```
DATABASE_URL="postgresql://contabil:contabil123@localhost:5432/sistema_contabil?connect_timeout=15"
NEXTAUTH_SECRET="QnaOlaZOtH64yN4mWwUvwYVo7P5kYTln"
```

O `.env` não é versionado. Em produção, configure as variáveis no ambiente.

### Passo 3: Instalar dependências

```bash
cd nextjs_space
npm install --legacy-peer-deps
```

### Passo 4: Prisma Client e migrations

```bash
npx prisma generate
npx prisma db push
```

### Passo 5: Popular o banco (seed)

```bash
npx tsx --require dotenv/config scripts/seed.ts
```

### Passo 6: Iniciar o servidor

```bash
npm run dev
```

Acessar em `http://localhost:3000`.

## Credenciais de Acesso

### Conta de Administrador (Contador Principal)

| Campo | Valor |
|---|---|
| E-mail | `john@doe.com` |
| Senha | `johndoe123` |
| Palavra secreta | `abacaxi` |
| Dica da palavra secreta | `fruta amarela` |
| Perfil | Contador (acesso total) |

### Contas de Clientes (dados de exemplo)

| Empresa | E-mail | Senha | Status |
|---|---|---|---|
| Padaria Bom Sabor | `contato@padariabomsabor.com.br` | `cliente123` | Ativo |
| TechLog Soluções em TI | `financeiro@techlog.com.br` | `cliente123` | Ativo |
| Constructa Engenharia | `admin@constructa.com.br` | `cliente123` | Suspenso |

## Recuperação de Senha

**Contador**: na tela de login, clique em "Esqueceu a senha?". Informe e-mail e palavra secreta. Se corretos, uma nova senha é exibida. Se a palavra secreta estiver errada, a dica cadastrada aparece.

**Cliente**: não possui recuperação automática. O contador deve acessar Clientes, selecionar o cliente e usar o botão "Resetar senha". Uma nova senha será gerada e exibida.

## Perfis de Acesso

### Contador (Administrador)

- Dashboard com total de clientes ativos, documentos e mensagens não lidas
- CRUD completo de clientes com geração automática de credenciais
- Reset de senha de clientes
- Gestão de documentos por cliente, ano e mês (upload/download)
- Chat com cada cliente
- Publicação de avisos com controle de leitura
- Cadastro de contadores auxiliares (compartilham acesso aos clientes)
- Configuração do escritório (nome, logo)
- Definição de palavra secreta para recuperação de senha

### Cliente

- Acesso apenas aos seus documentos, mensagens e avisos
- Upload de documentos para o contador
- Chat com o contador
- Confirmação de leitura de avisos

## Estrutura do Projeto

```
nextjs_space/
├── app/
│   ├── (contador)/
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   ├── documentos/
│   │   ├── mensagens/
│   │   ├── avisos/
│   │   └── configuracoes/
│   ├── (cliente)/portal/
│   ├── api/
│   └── login/
├── components/
│   └── ui/
├── lib/
├── prisma/
└── scripts/
```

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | Framework |
| TypeScript | Linguagem |
| Prisma | ORM / PostgreSQL |
| NextAuth.js | Autenticação JWT |
| Tailwind CSS | Estilização |
| Radix UI | Componentes |
| Framer Motion | Animações |

## Observações

- Múltiplos contadores podem acessar o mesmo escritório (contadores auxiliares)
- Armazenamento de arquivos via AWS S3 (configurar credenciais no `.env`)
- Chat utiliza polling (15s), não WebSockets
- Para produção: alterar `NEXTAUTH_SECRET` e apontar para um banco PostgreSQL real