const { Event } = require("../models");
const { Op } = require("sequelize");

const eventRepository = {
  async findAll(filters = {}) {
    const where = {};

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.fecha_inicio) {
      where.fecha_inicio = { [Op.gte]: filters.fecha_inicio };
    }

    return await Event.findAll({ where, order: [["fecha_inicio", "ASC"]] });
  },

  async findById(id) {
    return await Event.findByPk(id);
  },

  async findByIdWithLock(id, transaction) {
    return await Event.findByPk(id, {
      lock: transaction.LOCK.UPDATE,
      transaction,
    });
  },

  async create(eventData) {
    return await Event.create(eventData);
  },

  async update(id, eventData) {
    const event = await Event.findByPk(id);
    if (!event) return null;

    await event.update(eventData);
    return event;
  },

  async delete(id) {
    const event = await Event.findByPk(id);
    if (!event) return null;

    await event.destroy();
    return true;
  },
};

module.exports = eventRepository;
