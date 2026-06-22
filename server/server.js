import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── TICKETS ───
app.get('/api/tickets', async (req, res) => {
  const tickets = await db.getTickets();
  res.json(tickets);
});

app.post('/api/tickets', async (req, res) => {
  const tickets = await db.getTickets();
  const newTicket = req.body;
  tickets.unshift(newTicket);
  await db.saveTickets(tickets);
  res.status(201).json(newTicket);
});

app.put('/api/tickets/:id', async (req, res) => {
  const tickets = await db.getTickets();
  const index = tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });
  tickets[index] = { ...tickets[index], ...req.body };
  await db.saveTickets(tickets);
  res.json(tickets); // return all to sync
});

app.delete('/api/tickets/:id', async (req, res) => {
  let tickets = await db.getTickets();
  tickets = tickets.filter(t => t.id !== req.params.id);
  await db.saveTickets(tickets);
  res.json(tickets);
});

// ─── USERS ───
app.get('/api/users', async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
});

// ─── ANNOUNCEMENTS ───
app.get('/api/announcements', async (req, res) => {
  const announcements = await db.getAnnouncements();
  res.json(announcements);
});

app.post('/api/announcements', async (req, res) => {
  const announcements = await db.getAnnouncements();
  const newAnn = req.body;
  announcements.unshift(newAnn);
  await db.saveAnnouncements(announcements);
  res.status(201).json(announcements);
});

app.delete('/api/announcements/:id', async (req, res) => {
  let announcements = await db.getAnnouncements();
  announcements = announcements.filter(a => a.id !== req.params.id);
  await db.saveAnnouncements(announcements);
  res.json(announcements);
});

// ─── NOTIFICATIONS ───
app.get('/api/notifications', async (req, res) => {
  const notifications = await db.getNotifications();
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const notifications = await db.getNotifications();
  const newNotif = req.body;
  notifications.unshift(newNotif);
  await db.saveNotifications(notifications);
  res.status(201).json(newNotif);
});

app.put('/api/notifications/read', async (req, res) => {
  const { userId } = req.body;
  let notifications = await db.getNotifications();
  notifications = notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
  await db.saveNotifications(notifications);
  res.json(notifications);
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend API running at http://localhost:${PORT}`);
});
