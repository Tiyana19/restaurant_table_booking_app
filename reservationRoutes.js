const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware'); // make sure path is correct
const { PrismaClient } = require('@prisma/client'); // adjust if your prisma client is elsewhere
const prisma = new PrismaClient();

// GET /my-reservations
router.get('/my-reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { restaurant: true },
      orderBy: { date: 'desc' }
    });

    res.json(reservations);
  } catch (err) {
    console.error('Error fetching reservation history:', err);
    res.status(500).json({ message: 'Failed to load reservations' });
  }
});

module.exports = router;

  