const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM("competencia", "ciclovia", "ruta_recreativa"),
      allowNull: false,
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("activo", "finalizado", "cancelado"),
      allowNull: false,
      defaultValue: "activo",
    },
    ubicacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "events",
    timestamps: true,
    indexes: [
      { fields: ["tipo"] },
      { fields: ["estado"] },
      { fields: ["fecha_inicio"] },
    ],
  },
);

module.exports = Event;
