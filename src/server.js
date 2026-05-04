require("dotenv").config();
const app = require("./app");
const { connectDatabase } = require("./config/database");
const Task = require("./models/Task");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

async function bootstrap() {
  try {
    await connectDatabase();
    await Task.syncIndexes();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running at ${BASE_URL}`);
      // eslint-disable-next-line no-console
      console.log(`Swagger docs at ${BASE_URL}/api-docs`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start application:", error.message);
    process.exit(1);
  }
}

bootstrap();
