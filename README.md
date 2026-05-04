# TaskBoard API

Estrutura inicial de uma API REST em JavaScript com Express, JWT e MongoDB.

## Tecnologias

- Node.js
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Swagger (`swagger-ui-express` + `yamljs`)

## Arquitetura de camadas

```text
src/
  app.js
  server.js
  config/
    database.js
    swagger.js
  controllers/
    auth.controller.js
    task.controller.js
  docs/
    swagger.yaml
  middlewares/
    auth.middleware.js
  models/
    User.js
    Task.js
  routes/
    auth.routes.js
    tasks.routes.js
    index.js
  services/
    auth.service.js
    task.service.js
```

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```bash
cp .env.example .env
```

Variaveis utilizadas:

- `NODE_ENV`
- `PORT`
- `BASE_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Scripts

- `npm run dev`: inicia com `nodemon` (reinicia automaticamente ao alterar arquivos)
- `npm start`: inicia de forma estatica
- `npm test`: executa os testes unitarios com Jest

## Como executar

1. Instale as dependencias:

   ```bash
   npm install
   ```

2. Configure o arquivo `.env`.

3. Inicie a API:

   ```bash
   npm run dev
   ```

## Endpoints iniciais

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT Bearer)
- `POST /api/tasks` (JWT Bearer) — criar tarefa pessoal
- `GET /api/tasks` (JWT Bearer) — listar tarefas do usuario autenticado

## Swagger

Com a API em execucao, acesse:

- `http://localhost:3000/api-docs`
