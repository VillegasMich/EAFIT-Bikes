const eventRepository = require("../repositories/eventRepository");

const eventService = {
  async getAllEvents(filters) {
    return await eventRepository.findAll(filters);
  },

  async getEventById(id) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new Error("Evento no encontrado");
    }
    return event;
  },

  async createEvent(eventData) {
    if (new Date(eventData.fecha_fin) < new Date(eventData.fecha_inicio)) {
      throw new Error(
        "La fecha de fin debe ser posterior a la fecha de inicio",
      );
    }

    if (eventData.capacidad_maxima <= 0) {
      throw new Error("La capacidad máxima debe ser mayor a 0");
    }

    return await eventRepository.create(eventData);
  },

  async updateEvent(id, eventData) {
    if (eventData.fecha_fin && eventData.fecha_inicio) {
      if (new Date(eventData.fecha_fin) < new Date(eventData.fecha_inicio)) {
        throw new Error(
          "La fecha de fin debe ser posterior a la fecha de inicio",
        );
      }
    }

    const event = await eventRepository.update(id, eventData);
    if (!event) {
      throw new Error("Evento no encontrado");
    }
    return event;
  },

  async deleteEvent(id) {
    const result = await eventRepository.delete(id);
    if (!result) {
      throw new Error("Evento no encontrado");
    }
    return true;
  },
};

module.exports = eventService;
