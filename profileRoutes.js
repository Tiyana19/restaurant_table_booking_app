// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const authMiddleware = require('./authMiddleware');

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true }
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user info' });
  }
});

// Update profile
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Delete account
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({ message: 'User account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
