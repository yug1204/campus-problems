import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: String,
  studentName: String,
  title: String,
  description: String,
  category: String,
  priority: String,
  status: String,
  location: String,
  assignedTo: String,
  assignedName: String,
  timestamp: String,
  slaDeadline: String,
  department: String,
  resolvedAt: String,
  rating: Number,
  comments: [{
    author: String,
    authorRole: String,
    text: String,
    timestamp: String
  }],
  statusHistory: [{
    to: String,
    by: String,
    at: String
  }]
}, { collection: 'tickets' });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
  name: String,
  avatar: String,
  joined: String,
  department: String,
  title: String
}, { collection: 'users' });

const announcementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  message: String,
  type: String,
  author: String,
  timestamp: String
}, { collection: 'announcements' });

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  ticketId: String,
  message: String,
  type: String,
  read: Boolean,
  timestamp: String
}, { collection: 'notifications' });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export const db = {
  async getTickets() {
    return await Ticket.find({}).lean();
  },
  async saveTickets(tickets) {
    await Ticket.deleteMany({});
    if (tickets.length > 0) {
      await Ticket.insertMany(tickets);
    }
  },
  async getUsers() {
    return await User.find({}).lean();
  },
  async getAnnouncements() {
    return await Announcement.find({}).lean();
  },
  async saveAnnouncements(announcements) {
    await Announcement.deleteMany({});
    if (announcements.length > 0) {
      await Announcement.insertMany(announcements);
    }
  },
  async getNotifications() {
    return await Notification.find({}).lean();
  },
  async saveNotifications(notifications) {
    await Notification.deleteMany({});
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }
};

export async function seedDatabaseIfEmpty() {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log("Seeding database with default users and tickets...");
    await User.insertMany([
      { id: 'S001', password: '1234', role: 'student', name: 'Alice Sharma', avatar: 'AS', joined: 'Aug 2023' },
      { id: 'S002', password: '1234', role: 'student', name: 'Bob Singh', avatar: 'BS', joined: 'Sep 2023' },
      { id: 'S003', password: '1234', role: 'student', name: 'Charlie Gupta', avatar: 'CG', joined: 'Jul 2022' },
      { id: 'S004', password: '1234', role: 'student', name: 'David Lee', avatar: 'DL', joined: 'Aug 2024' },
      { id: 'ADM001', password: 'admin123', role: 'admin', name: 'Super Admin', avatar: 'AD' },
      { id: 'STF001', password: 'staff123', role: 'staff', name: 'Ramesh Verma', department: 'Maintenance & Facilities', avatar: 'RV' },
      { id: 'STF002', password: 'staff123', role: 'staff', name: 'Sita Patel', department: 'IT Operations', avatar: 'SP' },
      { id: 'STF003', password: 'staff123', role: 'staff', name: 'John Doe', department: 'Security', avatar: 'JD' },
      { id: 'DEAN001', password: 'dean123', role: 'dean', name: 'Dr. Emily Chen', title: 'Dean of Student Affairs', avatar: 'EC' },
    ]);
    
    await Ticket.insertMany([
      { id: 'TKT-1001', studentId: 'S001', studentName: 'Alice Sharma', title: 'Leaking AC in Seminar Hall', description: 'Water is dripping from the AC unit near the stage.', category: 'Maintenance', priority: 'High', status: 'In Progress', location: 'Seminar Hall 2', assignedTo: 'STF001', assignedName: 'Ramesh Verma', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), slaDeadline: new Date(Date.now() + 3600000 * 19).toISOString(), department: 'Maintenance & Facilities', comments: [{ author: 'Admin', authorRole: 'admin', text: 'Assigned to Ramesh.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }] },
      { id: 'TKT-1002', studentId: 'S002', studentName: 'Bob Singh', title: 'Wifi drops in Hostel B', description: 'No internet access on the 3rd floor.', category: 'IT & Network', priority: 'High', status: 'Pending', location: 'Hostel B, 3rd Floor', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), slaDeadline: new Date(Date.now() + 3600000 * 6).toISOString(), department: 'IT Operations', comments: [] }
    ]);
    
    await Announcement.insertMany([
      { id: 'A001', title: 'Scheduled Power Cut', message: 'There will be a power cut in Block A from 2 PM to 4 PM on Friday for maintenance.', type: 'warning', author: 'Facilities', timestamp: new Date().toISOString() }
    ]);
  }
}
