const assert = require("assert");
const path = require("path");
const supertest = require("supertest");

function clearSrcModules() {
  const srcRoot = path.resolve(__dirname, "..", "src") + path.sep;

  for (const cacheKey of Object.keys(require.cache)) {
    if (cacheKey.startsWith(srcRoot)) {
      delete require.cache[cacheKey];
    }
  }
}

function loadAppWithMocks(relativeMocks = {}) {
  const srcRoot = path.resolve(__dirname, "..", "src");
  const mockEntries = new Map();

  clearSrcModules();

  for (const [relativePath, mockExports] of Object.entries(relativeMocks)) {
    const absolutePath = require.resolve(path.join(srcRoot, relativePath));
    mockEntries.set(absolutePath, {
      id: absolutePath,
      filename: absolutePath,
      loaded: true,
      exports: mockExports,
      children: [],
      paths: [],
    });
  }

  for (const [absolutePath, mockModule] of mockEntries.entries()) {
    require.cache[absolutePath] = mockModule;
  }

  const appPath = require.resolve(path.join(srcRoot, "app.js"));
  delete require.cache[appPath];

  return require(appPath);
}

function buildAuthMiddlewareMock(userId = "user-123") {
  return {
    authMiddleware: (req, res, next) => {
      req.userId = userId;
      next();
    },
  };
}

function authServiceMock(overrides = {}) {
  return {
    registerUser: async () => {
      throw new Error("not used in this test");
    },
    loginUser: async () => {
      throw new Error("not used in this test");
    },
    getUserProfile: async () => {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

function taskServiceMock(overrides = {}) {
  return {
    createTask: async () => {
      throw new Error("not used in this test");
    },
    listTasksForUser: async () => {
      throw new Error("not used in this test");
    },
    ...overrides,
  };
}

describe("TaskBoard API user stories", () => {
  it("US01 - registrar usuario retorna 201 com usuario e token", async () => {
    const registerCalls = [];
    const app = loadAppWithMocks({
      "services/auth.service.js": authServiceMock({
        registerUser: async (payload) => {
          registerCalls.push(payload);
          return {
            user: {
              id: "user-1",
              name: "Ana Silva",
              email: "ana@example.com",
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z",
            },
            token: "token-register-123",
          };
        },
      }),
      "services/task.service.js": taskServiceMock(),
    });

    const response = await supertest(app)
      .post("/api/auth/register")
      .send({
        name: "Ana Silva",
        email: "ana@example.com",
        password: "12345678",
      });

    assert.strictEqual(response.status, 201);
    assert.deepStrictEqual(registerCalls, [
      {
        name: "Ana Silva",
        email: "ana@example.com",
        password: "12345678",
      },
    ]);
    assert.deepStrictEqual(response.body, {
      user: {
        id: "user-1",
        name: "Ana Silva",
        email: "ana@example.com",
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z",
      },
      token: "token-register-123",
    });
  });

  it("US02 - login retorna 200 com token JWT", async () => {
    const loginCalls = [];
    const app = loadAppWithMocks({
      "services/auth.service.js": authServiceMock({
        loginUser: async (payload) => {
          loginCalls.push(payload);
          return {
            user: {
              id: "user-1",
              name: "Ana Silva",
              email: "ana@example.com",
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z",
            },
            token: "token-login-123",
          };
        },
      }),
      "services/task.service.js": taskServiceMock(),
    });

    const response = await supertest(app)
      .post("/api/auth/login")
      .send({
        email: "ana@example.com",
        password: "12345678",
      });

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(loginCalls, [
      {
        email: "ana@example.com",
        password: "12345678",
      },
    ]);
    assert.deepStrictEqual(response.body, {
      user: {
        id: "user-1",
        name: "Ana Silva",
        email: "ana@example.com",
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z",
      },
      token: "token-login-123",
    });
  });

  it("US03 - cadastrar tarefa retorna 201 com a tarefa do usuario autenticado", async () => {
    const createCalls = [];
    const app = loadAppWithMocks({
      "middlewares/auth.middleware.js": buildAuthMiddlewareMock("user-123"),
      "services/auth.service.js": authServiceMock(),
      "services/task.service.js": taskServiceMock({
        createTask: async (userId, payload) => {
          createCalls.push({ userId, payload });
          return {
            id: "task-1",
            title: "Preparar test suite",
            description: "Criar a automacao da TaskBoard API",
            status: "pendente",
            userId: "user-123",
            createdAt: "2026-05-14T00:00:00.000Z",
            updatedAt: "2026-05-14T00:00:00.000Z",
          };
        },
      }),
    });

    const response = await supertest(app)
      .post("/api/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "Preparar test suite",
        description: "Criar a automacao da TaskBoard API",
      });

    assert.strictEqual(response.status, 201);
    assert.deepStrictEqual(createCalls, [
      {
        userId: "user-123",
        payload: {
          title: "Preparar test suite",
          description: "Criar a automacao da TaskBoard API",
        },
      },
    ]);
    assert.deepStrictEqual(response.body, {
      task: {
        id: "task-1",
        title: "Preparar test suite",
        description: "Criar a automacao da TaskBoard API",
        status: "pendente",
        userId: "user-123",
        createdAt: "2026-05-14T00:00:00.000Z",
        updatedAt: "2026-05-14T00:00:00.000Z",
      },
    });
  });

  it("US04 - listar tarefas retorna 200 com apenas as tarefas do usuario", async () => {
    const listCalls = [];
    const app = loadAppWithMocks({
      "middlewares/auth.middleware.js": buildAuthMiddlewareMock("user-123"),
      "services/auth.service.js": authServiceMock(),
      "services/task.service.js": taskServiceMock({
        listTasksForUser: async (userId) => {
          listCalls.push(userId);
          return [
            {
              id: "task-1",
              title: "Preparar test suite",
              description: "Criar a automacao da TaskBoard API",
              status: "pendente",
              userId: "user-123",
              createdAt: "2026-05-14T00:00:00.000Z",
              updatedAt: "2026-05-14T00:00:00.000Z",
            },
          ];
        },
      }),
    });

    const response = await supertest(app)
      .get("/api/tasks")
      .set("Authorization", "Bearer valid-token");

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(listCalls, ["user-123"]);
    assert.deepStrictEqual(response.body, {
      tasks: [
        {
          id: "task-1",
          title: "Preparar test suite",
          description: "Criar a automacao da TaskBoard API",
          status: "pendente",
          userId: "user-123",
          createdAt: "2026-05-14T00:00:00.000Z",
          updatedAt: "2026-05-14T00:00:00.000Z",
        },
      ],
    });
  });
});
