const sequelize = require("../config/database");
const Event = require("./Event");
const Enrollment = require("./Enrollment");

Event.hasMany(Enrollment, {
  foreignKey: "event_id",
  as: "enrollments",
});

Enrollment.belongsTo(Event, {
  foreignKey: "event_id",
  as: "event",
});

module.exports = {
  sequelize,
  Event,
  Enrollment,
};
