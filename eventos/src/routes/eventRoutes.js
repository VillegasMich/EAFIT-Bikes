const express = require("express");
const eventController = require("../controllers/eventController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - nombre
 *         - tipo
 *         - fecha_inicio
 *         - fecha_fin
 *         - capacidad_maxima
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: Ciclopaseo EAFIT
 *         descripcion:
 *           type: string
 *           example: Recorrido por el campus
 *         tipo:
 *           type: string
 *           enum: [competencia, ciclovia, ruta_recreativa]
 *           example: ciclovia
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           example: 2026-04-01
 *         fecha_fin:
 *           type: string
 *           format: date
 *           example: 2026-04-01
 *         estado:
 *           type: string
 *           enum: [activo, finalizado, cancelado]
 *           example: activo
 *         ubicacion:
 *           type: string
 *           example: Campus EAFIT
 *         capacidad_maxima:
 *           type: integer
 *           example: 50
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Lista todos los eventos
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [competencia, ciclovia, ruta_recreativa]
 *         description: Filtrar por tipo de evento
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, finalizado, cancelado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar eventos desde esta fecha
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get("/", eventController.getAll);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obtiene un evento por ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento no encontrado
 */
router.get("/:id", eventController.getById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crea un nuevo evento
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Evento creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Datos inválidos
 */
router.post("/", eventController.create);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Actualiza un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Evento actualizado
 *       404:
 *         description: Evento no encontrado
 */
router.put("/:id", eventController.update);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Elimina un evento
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento eliminado
 *       404:
 *         description: Evento no encontrado
 */
router.delete("/:id", eventController.delete);

module.exports = router;
