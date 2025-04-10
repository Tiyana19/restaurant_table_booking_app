const express = require('express');
const authenticateToken = require('./authMiddleware');
const path = require('path');
const jwt = require('jsonwebtoken'); 
require('dotenv').config()
const SECRET = process.env.SECRET_KEY;
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator'); 
const rateLimit = require('express-rate-limit');
const { sendConfirmationEmail } = require('./services/mailService');
const { sendSMS } = require('./services/smsService');
const profileRoutes = require('./profileRoutes');
const reservationRoutes = require('./reservationRoutes');
const cors = require('cors');
const app = express();
app.use(cors());


app.use('/api', reservationRoutes);
app.use(reservationRoutes);

app.use(profileRoutes);

app.use(express.json()); 


app.use(express.static(path.join(__dirname, '../frontend')));


app.post('/test-sms', async (req, res) => {
  const { to, name, restaurant, date, time } = req.body;

  try {
    await sendSMS(
      to,
      `Hi ${name}, your test reservation at ${restaurant} for ${date} at ${time} is confirmed!`
    );

    res.json({ message: 'SMS sent!' });
  } catch (err) {
    console.error('SMS error:', err);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
});






const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again later"
});


app.use(limiter);

app.use(express.json());


const restaurants = [
    {
      id: 1,
      name: "Gypsy",
      location: "Jodhpur",
      cuisine: "Rajasthani"
    },
    {
      id: 2,
      name: "Pasta Palace",
      location: "Los Angeles",
      cuisine: "Italian"
    },
    {
      id: 3,
      name: "Curry House",
      location: "San Francisco",
      cuisine: "Indian"
    }
  ];
  


app.get('/', (req, res) => {
  res.send('Hello from your restaurant backend!');
});


app.post('/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});




app.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
  
      const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
        expiresIn: '1h'
      });
  
      res.json({ message: 'Logged in!', token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });
  


  app.post('/reserve', authenticateToken, async (req, res) => {
    const { restaurantId, date, time, numberOfGuests } = req.body;
  
    if (!restaurantId || !date || !time || !numberOfGuests) {
      return res.status(400).json({ message: 'Missing booking info' });
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email },
      });
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      // 🔐 Prevent double booking
      const existingBooking = await prisma.booking.findFirst({
        where: { restaurantId, date, time }
      });
  
      if (existingBooking) {
        return res.status(400).json({ message: 'This time slot is already booked.' });
      }
  
      // 📦 Create booking
      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          restaurantId,
          date,
          time,
          numberOfGuests,
        },
      });
  
      
      await sendConfirmationEmail(
        user.email,
        'Reservation Confirmed',
        `Hi ${user.name}, your reservation at restaurant ID ${restaurantId} for ${date} at ${time} is confirmed.`
      );

      await sendSMS(
        user.phoneNumber, // make sure you're storing this in the DB
        `Hi ${user.name}, your reservation at restaurant ID ${restaurantId} for ${date} at ${time} is confirmed.`
      );
      
      res.status(201).json({ message: 'Booking successful!', booking });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Booking failed' });
    }
  });
      


app.get('/restaurants', async (req, res) => {
    try {
      const restaurants = await prisma.restaurant.findMany();
      res.json(restaurants);
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });

app.get('/restaurants/search', (req, res) => {
    const { name, location, cuisine } = req.query;
  
    let results = restaurants;
  
    if (name) {
      results = results.filter(r =>
        r.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  
    if (location) {
      results = results.filter(r =>
        r.location.toLowerCase().includes(location.toLowerCase())
      );
    }
  
    if (cuisine) {
      results = results.filter(r =>
        r.cuisine.toLowerCase().includes(cuisine.toLowerCase())
      );
    }
  
    res.json(results);
  });
  


  app.get('/reservations', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.user.email },
      });
  
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: { restaurant: true },
      });
  
      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Something went wrong' });
    }
  });
  
  
  
app.post('/seed-restaurants', async (req, res) => {
  try {
    await prisma.restaurant.createMany({
        data: [
          { 
            name: "Sushi World", 
            location: "New York", 
            cuisine: "Japanese", 
            capacity: 40 
          },
          { 
            name: "Pasta Palace", 
            location: "Los Angeles", 
            cuisine: "Italian", 
            capacity: 60 
          },
          { 
            name: "Curry House", 
            location: "San Francisco", 
            cuisine: "Indian", 
            capacity: 50 
          }
        ],
        skipDuplicates: true
      });
      

    res.json({ message: 'Restaurants seeded!' });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


app.delete('/reservations/:id', authenticateToken, async (req, res) => {
    const reservationsId = parseInt(req.params.id);
  
    const user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });
  
    const reservation = await prisma.booking.findUnique({
      where: { id: reservationsId }
    });
  
    if (!reservation || reservation.userId !== user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
  
    await prisma.booking.delete({ where: { id: reservationsId } });
  
    res.json({ message: 'Booking cancelled' });
  });
  
  

app.listen(process.env.PORT, () => {
  console.log('Server running at http://localhost:3000');
});
