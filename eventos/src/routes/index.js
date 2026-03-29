const express = require("express");
const eventRoutes = require("./eventRoutes");
const enrollmentRoutes = require("./enrollmentRoutes");

const router = express.Router();

router.use("/events", eventRoutes);
router.use("/events/:eventId/enrollments", enrollmentRoutes);

module.exports = router;
