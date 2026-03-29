const eventService = require("../services/eventService");

const eventController = {
  async getAll(req, res) {
    try {
      const filters = {
        tipo: req.query.tipo,
        estado: req.query.estado,
        fecha_inicio: req.query.fecha_inicio,
      };

      const events = await eventService.getAllEvents(filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const event = await eventService.getEventById(req.params.id);
      res.json(event);
    } catch (error) {
      if (error.message === "Evento no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const event = await eventService.createEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const event = await eventService.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      if (error.message === "Evento no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await eventService.deleteEvent(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      if (error.message === "Evento no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = eventController;
