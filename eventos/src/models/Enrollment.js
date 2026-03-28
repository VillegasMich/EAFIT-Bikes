const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Enrollment = sequelize.define(
  "Enrollment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha_inscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    estado: {
      type: DataTypes.ENUM("confirmado", "cancelado"),
      allowNull: false,
      defaultValue: "confirmado",
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
    indexes: [
      { fields: ["event_id"] },
      { fields: ["user_id"] },
      {
        unique: true,
        fields: ["event_id", "user_id"],
        where: { estado: "confirmado" },
      },
    ],
  },
);

module.exports = Enrollment;
