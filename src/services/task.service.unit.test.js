const Task = require("../models/Task");
const { createTask } = require("./task.service");

jest.mock("../models/Task");

describe("task.service - createTask", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a task associated to the authenticated user with status pendente", async () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = createdAt;

    Task.create.mockImplementation(async (payload) => ({
      _id: { toString: () => "task-id-1" },
      ...payload,
      createdAt,
      updatedAt,
    }));

    const result = await createTask("user-id-abc", {
      title: "  Minha tarefa ",
      description: "  descricao ",
    });

    expect(Task.create).toHaveBeenCalledWith({
      title: "Minha tarefa",
      description: "descricao",
      status: "pendente",
      user: "user-id-abc",
    });
    expect(result).toMatchObject({
      id: "task-id-1",
      title: "Minha tarefa",
      description: "descricao",
      status: "pendente",
      userId: "user-id-abc",
      createdAt,
      updatedAt,
    });
  });

  it("rejects missing title", async () => {
    await expect(createTask("user-id-abc", { description: "x" })).rejects.toThrow(
      "O título é obrigatório."
    );
    expect(Task.create).not.toHaveBeenCalled();
  });

  it("rejects empty or whitespace-only title", async () => {
    await expect(createTask("user-id-abc", { title: "" })).rejects.toThrow(
      "O título é obrigatório."
    );
    await expect(
      createTask("user-id-abc", { title: "   " })
    ).rejects.toThrow("O título é obrigatório.");
    expect(Task.create).not.toHaveBeenCalled();
  });
});
