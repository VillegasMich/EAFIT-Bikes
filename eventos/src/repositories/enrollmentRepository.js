const { Enrollment } = require("../models");

const enrollmentRepository = {
  async findByEventId(eventId) {
    return await Enrollment.findAll({
      where: { event_id: eventId },
      order: [["fecha_inscripcion", "DESC"]],
    });
  },

  async findById(id) {
    return await Enrollment.findByPk(id);
  },

  async countConfirmedByEventId(eventId, transaction = null) {
    const options = {
      where: {
        event_id: eventId,
        estado: "confirmado",
      },
    };

    if (transaction) {
      options.transaction = transaction;
    }

    return await Enrollment.count(options);
  },

  async findByEventAndUser(eventId, userId) {
    return await Enrollment.findOne({
      where: {
        event_id: eventId,
        user_id: userId,
        estado: "confirmado",
      },
    });
  },

  async create(enrollmentData, transaction = null) {
    const options = transaction ? { transaction } : {};
    return await Enrollment.create(enrollmentData, options);
  },

  async cancel(id) {
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) return null;

    await enrollment.update({ estado: "cancelado" });
    return enrollment;
  },
};

module.exports = enrollmentRepository;
