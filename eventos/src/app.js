const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { sequelize } = require("./models");
const routes = require("./routes");
const swaggerSpec = require("./config/swagger");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/", routes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();
    console.log("Database synchronized.");

    app.listen(PORT, () => {
      console.log(`Events service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

startServer();
