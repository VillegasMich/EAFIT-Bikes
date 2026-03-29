const enrollmentService = require("../services/enrollmentService");

const enrollmentController = {
  async getByEventId(req, res) {
    try {
      const enrollments = await enrollmentService.getEnrollmentsByEventId(
        req.params.eventId,
      );
      res.json(enrollments);
    } catch (error) {
      if (error.message === "Evento no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async enroll(req, res) {
    try {
      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: "El user_id es requerido" });
      }

      const enrollment = await enrollmentService.enrollParticipant(
        req.params.eventId,
        user_id,
      );
      res.status(201).json(enrollment);
    } catch (error) {
      if (error.message === "Evento no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      if (
        error.message === "El evento no está activo" ||
        error.message === "El usuario ya está inscrito en este evento" ||
        error.message === "El evento ha alcanzado su capacidad máxima"
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async cancel(req, res) {
    try {
      const enrollment = await enrollmentService.cancelEnrollment(
        req.params.eventId,
        req.params.id,
      );
      res.json(enrollment);
    } catch (error) {
      if (
        error.message === "Inscripción no encontrada" ||
        error.message === "La inscripción no pertenece a este evento"
      ) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === "La inscripción ya está cancelada") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = enrollmentController;
