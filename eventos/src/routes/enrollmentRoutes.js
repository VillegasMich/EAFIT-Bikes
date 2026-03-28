const express = require("express");
const enrollmentController = require("../controllers/enrollmentController");

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       required:
 *         - user_id
 *       properties:
 *         id:
 *           type: integer
 *         event_id:
 *           type: integer
 *         user_id:
 *           type: string
 *           example: user-uuid-123
 *         fecha_inscripcion:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *           enum: [confirmado, cancelado]
 *           example: confirmado
 */

/**
 * @swagger
 * /events/{eventId}/enrollments:
 *   get:
 *     summary: Lista inscripciones de un evento
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Lista de inscripciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       404:
 *         description: Evento no encontrado
 */
router.get("/", enrollmentController.getByEventId);

/**
 * @swagger
 * /events/{eventId}/enrollments:
 *   post:
 *     summary: Inscribe un participante en un evento
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: user-uuid-123
 *     responses:
 *       201:
 *         description: Inscripción exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Error (evento lleno, usuario ya inscrito, evento no activo)
 *       404:
 *         description: Evento no encontrado
 */
router.post("/", enrollmentController.enroll);

/**
 * @swagger
 * /events/{eventId}/enrollments/{id}:
 *   delete:
 *     summary: Cancela una inscripción
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la inscripción
 *     responses:
 *       200:
 *         description: Inscripción cancelada
 *       404:
 *         description: Inscripción no encontrada
 */
router.delete("/:id", enrollmentController.cancel);

module.exports = router;
