const path = require("path");
const YAML = require("yamljs");

function loadSwaggerSpec() {
  const swaggerPath = path.resolve(__dirname, "../docs/swagger.yaml");
  return YAML.load(swaggerPath);
}

module.exports = { loadSwaggerSpec };
