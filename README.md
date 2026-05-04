# TaskBoard API

API REST em **Node.js** para o ecossistema TaskBoard: autenticação de usuários com **JWT**, persistência em **MongoDB** (via **Mongoose**) e documentação interativa com **Swagger UI**. O servidor expõe rotas sob o prefixo **`/api`** e carrega a especificação OpenAPI a partir de `src/docs/swagger.yaml`.

## O que a API oferece

- **Saúde do serviço** — `GET /api/health` para verificar se a API está no ar.
- **Cadastro e login** — registro com validações de nome, e-mail e senha; login com retorno de token JWT.
- **Perfil autenticado** — `GET /api/auth/me` com token Bearer para obter os dados do usuário logado.
- **Documentação** — interface Swagger em `/api-docs` com os contratos das rotas e exemplos de payload.

## Tecnologias

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| Runtime       | Node.js                             |
| Framework HTTP| Express                           |
| Banco de dados| MongoDB + Mongoose                  |
| Autenticação  | JWT (`jsonwebtoken`)                |
| Hash de senha | `bcryptjs`                          |
| Documentação  | `swagger-ui-express` + `yamljs`     |
| Testes        | Jest                                |

## Arquitetura

O código segue separação em **rotas → controladores → serviços → modelos**, facilitando evolução e testes unitários dos serviços com mocks de Mongoose e bibliotecas externas.

```text
src/
  app.js                 # Express, CORS, JSON, montagem de /api e /api-docs
  server.js              # Conexão ao MongoDB e subida do HTTP
  config/
    database.js          # mongoose.connect
    swagger.js           # Carrega swagger.yaml
  controllers/
    auth.controller.js   # HTTP: register, login, me
  docs/
    swagger.yaml         # Especificação OpenAPI
  middlewares/
    auth.middleware.js   # Validação JWT (Bearer)
  models/
    User.js              # Schema de usuário
  routes/
    auth.routes.js       # Rotas /auth/*
    index.js             # Agrega /health e /auth
  services/
    auth.service.js      # Regras de negócio de autenticação
    auth.service.unit.test.js   # Testes unitários (Jest)
```

## Pré-requisitos

- **Node.js** (recomendado: LTS atual).
- **MongoDB** acessível (local ou Atlas), com URI configurada em `MONGODB_URI`.

## Configuração

1. Clone o repositório e entre na pasta do projeto.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env` a partir do exemplo:

   - **Linux / macOS (Git Bash):**

     ```bash
     cp .env.example .env
     ```

   - **Windows (PowerShell):**

     ```powershell
     Copy-Item .env.example .env
     ```

4. Edite o `.env` com os valores do seu ambiente (veja a tabela abaixo).

## Variáveis de ambiente

| Variável         | Obrigatória | Descrição |
|------------------|------------|-----------|
| `NODE_ENV`       | Não        | Ex.: `development` ou `production`. |
| `PORT`           | Não        | Porta HTTP (padrão comum: `3000`). |
| `BASE_URL`       | Não        | URL base usada em logs (ex.: `http://localhost:3000`). |
| `MONGODB_URI`    | Sim        | URI de conexão do MongoDB. |
| `JWT_SECRET`     | Sim        | Segredo para assinar e validar JWTs. |
| `JWT_EXPIRES_IN` | Não        | Tempo de expiração do token (ex.: `1d`, `8h`). Padrão típico no código: `1d`. |

## Como executar a API

**Desenvolvimento** (reinicia ao salvar arquivos):

```bash
npm run dev
```

**Produção / execução direta** (sem `nodemon`):

```bash
npm start
```

Com a aplicação no ar, a API fica disponível em `http://localhost:<PORT>` (por exemplo `http://localhost:3000`). A documentação interativa:

- **Swagger UI:** `http://localhost:3000/api-docs`

## Endpoints (resumo)

Todas as rotas de negócio ficam sob **`/api`**.

| Método | Rota | Autenticação | Descrição |
|--------|------|----------------|-----------|
| `GET`  | `/api/health` | Não | Verificação de saúde. |
| `POST` | `/api/auth/register` | Não | Cadastro de usuário. |
| `POST` | `/api/auth/login` | Não | Login; retorna JWT. |
| `GET`  | `/api/auth/me` | Bearer JWT | Dados do usuário autenticado. |

Detalhes de corpos de requisição, códigos HTTP e schemas estão no **Swagger** (`/api-docs`) e no arquivo `src/docs/swagger.yaml`.

## Testes

Os testes são **unitários** (Jest), focados na camada de **serviço** — por exemplo `auth.service.unit.test.js` — com mocks de `User`, `bcrypt` e `jsonwebtoken`, sem subir servidor HTTP nem banco real.

### Executar todos os testes uma vez

```bash
npm test
```

### Executar em modo observação (reexecuta ao alterar arquivos)

```bash
npx jest --watch
```

### Executar apenas um arquivo de teste

```bash
npx jest src/services/auth.service.unit.test.js
```

### Saída mais verbosa (útil para depuração)

```bash
npx jest --verbose
```

Requisito: ter rodado `npm install` para instalar o Jest em `devDependencies`.

## Scripts npm

| Script        | Comando           | Descrição |
|---------------|-------------------|-----------|
| Desenvolvimento | `npm run dev`   | `nodemon` em `src/server.js`. |
| Início        | `npm start`       | `node src/server.js`. |
| Testes        | `npm test`        | Executa a suíte Jest. |

## Licença

ISC (conforme `package.json`).
