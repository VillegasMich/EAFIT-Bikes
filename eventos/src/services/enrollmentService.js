const { sequelize } = require("../models");
const eventRepository = require("../repositories/eventRepository");
const enrollmentRepository = require("../repositories/enrollmentRepository");

const enrollmentService = {
  async getEnrollmentsByEventId(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new Error("Evento no encontrado");
    }

    return await enrollmentRepository.findByEventId(eventId);
  },

  async enrollParticipant(eventId, userId) {
    return await sequelize.transaction(async (t) => {
      const event = await eventRepository.findByIdWithLock(eventId, t);

      if (!event) {
        throw new Error("Evento no encontrado");
      }

      if (event.estado !== "activo") {
        throw new Error("El evento no está activo");
      }

      const existingEnrollment = await enrollmentRepository.findByEventAndUser(
        eventId,
        userId,
      );
      if (existingEnrollment) {
        throw new Error("El usuario ya está inscrito en este evento");
      }

      const currentCount = await enrollmentRepository.countConfirmedByEventId(
        eventId,
        t,
      );

      if (currentCount >= event.capacidad_maxima) {
        throw new Error("El evento ha alcanzado su capacidad máxima");
      }

      return await enrollmentRepository.create(
        {
          event_id: eventId,
          user_id: userId,
          fecha_inscripcion: new Date(),
          estado: "confirmado",
        },
        t,
      );
    });
  },

  async cancelEnrollment(eventId, enrollmentId) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Inscripción no encontrada");
    }

    if (enrollment.event_id !== parseInt(eventId)) {
      throw new Error("La inscripción no pertenece a este evento");
    }

    if (enrollment.estado === "cancelado") {
      throw new Error("La inscripción ya está cancelada");
    }

    return await enrollmentRepository.cancel(enrollmentId);
  },
};

module.exports = enrollmentService;
