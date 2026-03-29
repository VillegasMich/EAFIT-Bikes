const { Sequelize } = require("sequelize");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://admin:admin123@localhost:5432/eventsdb";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
