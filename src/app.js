const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const { loadSwaggerSpec } = require("./config/swagger");

const app = express();
const swaggerSpec = loadSwaggerSpec();

app.use(cors());
app.use(express.json());

app.use("/api", routes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
