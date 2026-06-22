import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

// Initial seed data
const initialData = {
  tickets: [
    { id: 'TKT-1001', studentId: 'S001', studentName: 'Alice Sharma', title: 'Leaking AC in Seminar Hall', description: 'Water is dripping from the AC unit near the stage.', category: 'Maintenance', priority: 'High', status: 'In Progress', location: 'Seminar Hall 2', assignedTo: 'STF001', assignedName: 'Ramesh Verma', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), slaDeadline: new Date(Date.now() + 3600000 * 19).toISOString(), department: 'Maintenance & Facilities', comments: [{ author: 'Admin', authorRole: 'admin', text: 'Assigned to Ramesh.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }] },
    { id: 'TKT-1002', studentId: 'S002', studentName: 'Bob Singh', title: 'Wifi drops in Hostel B', description: 'No internet access on the 3rd floor.', category: 'IT & Network', priority: 'High', status: 'Pending', location: 'Hostel B, 3rd Floor', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), slaDeadline: new Date(Date.now() + 3600000 * 6).toISOString(), department: 'IT Operations', comments: [] },
    { id: 'TKT-1003', studentId: 'S003', studentName: 'Charlie Gupta', title: 'Broken chair in Library', description: 'Chair leg is broken near the reference section.', category: 'Furniture', priority: 'Low', status: 'Resolved', location: 'Central Library', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), resolvedAt: new Date(Date.now() - 3600000 * 12).toISOString(), department: 'Carpentry & Furniture', rating: 4, comments: [] },
    { id: 'TKT-1004', studentId: 'S001', studentName: 'Alice Sharma', title: 'Projector not connecting', description: 'HDMI cable seems faulty.', category: 'IT & Network', priority: 'Medium', status: 'Escalated', location: 'Block A, Lab 4', timestamp: new Date(Date.now() - 3600000 * 10).toISOString(), slaDeadline: new Date(Date.now() - 3600000 * 2).toISOString(), department: 'IT Operations', statusHistory: [{ to: 'Escalated', by: 'System (SLA Breach)', at: new Date(Date.now() - 3600000 * 2).toISOString() }] },
    { id: 'TKT-1005', studentId: 'S004', studentName: 'David Lee', title: 'Unidentified person near gate', description: 'Someone without ID card is roaming.', category: 'Security', priority: 'High', status: 'Pending', location: 'Main Gate', timestamp: new Date(Date.now() - 1800000).toISOString(), slaDeadline: new Date(Date.now() + 5400000).toISOString(), department: 'Campus Security', comments: [] },
    { id: 'TKT-1006', studentId: 'S002', studentName: 'Bob Singh', title: 'Garbage not cleared', description: 'Dustbins overflowing.', category: 'Cleanliness', priority: 'Low', status: 'Resolved', location: 'Canteen', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), resolvedAt: new Date(Date.now() - 3600000 * 10).toISOString(), department: 'Housekeeping', comments: [] },
    { id: 'TKT-1007', studentId: 'S003', studentName: 'Charlie Gupta', title: 'Tap leaking in washroom', description: 'Continuous water leak.', category: 'Maintenance', priority: 'Medium', status: 'Pending', location: 'Block C, Ground Floor', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), slaDeadline: new Date(Date.now() + 3600000 * 23).toISOString(), department: 'Maintenance & Facilities', comments: [] },
  ],
  users: [
    { id: 'S001', password: '1234', role: 'student', name: 'Alice Sharma', avatar: 'AS', joined: 'Aug 2023' },
    { id: 'S002', password: '1234', role: 'student', name: 'Bob Singh', avatar: 'BS', joined: 'Sep 2023' },
    { id: 'S003', password: '1234', role: 'student', name: 'Charlie Gupta', avatar: 'CG', joined: 'Jul 2022' },
    { id: 'S004', password: '1234', role: 'student', name: 'David Lee', avatar: 'DL', joined: 'Aug 2024' },
    { id: 'ADM001', password: 'admin123', role: 'admin', name: 'Super Admin', avatar: 'AD' },
    { id: 'STF001', password: 'staff123', role: 'staff', name: 'Ramesh Verma', department: 'Maintenance & Facilities', avatar: 'RV' },
    { id: 'STF002', password: 'staff123', role: 'staff', name: 'Sita Patel', department: 'IT Operations', avatar: 'SP' },
    { id: 'STF003', password: 'staff123', role: 'staff', name: 'John Doe', department: 'Security', avatar: 'JD' },
    { id: 'DEAN001', password: 'dean123', role: 'dean', name: 'Dr. Emily Chen', title: 'Dean of Student Affairs', avatar: 'EC' },
  ],
  announcements: [
    { id: 'A001', title: 'Scheduled Power Cut', message: 'There will be a power cut in Block A from 2 PM to 4 PM on Friday for maintenance.', type: 'warning', author: 'Facilities', timestamp: new Date().toISOString() },
    { id: 'A002', title: 'New Helpdesk Portal Live', message: 'Students can now use this portal to track all campus issues with guaranteed SLA response times.', type: 'info', author: 'IT Admin', timestamp: new Date(Date.now() - 86400000).toISOString() },
  ],
  notifications: [
    { id: 'N001', userId: 'S001', ticketId: 'TKT-1001', message: 'Your ticket TKT-1001 has been assigned to Ramesh Verma', type: 'assigned', read: false, timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
    { id: 'N002', userId: 'S001', ticketId: 'TKT-1001', message: 'Admin commented on TKT-1001: "Assigned to Ramesh. Please fix today."', type: 'comment', read: false, timestamp: new Date(Date.now() - 3600000 * 19).toISOString() },
    { id: 'N003', userId: 'S001', ticketId: 'TKT-1004', message: '🚨 TKT-1004 was escalated — SLA deadline missed', type: 'escalation', read: false, timestamp: new Date(Date.now() - 3600000 * 28).toISOString() },
  ]
};

async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export const db = {
  async getTickets() {
    const data = await readData();
    return data.tickets;
  },
  async saveTickets(tickets) {
    const data = await readData();
    data.tickets = tickets;
    await writeData(data);
  },
  async getUsers() {
    const data = await readData();
    return data.users;
  },
  async getAnnouncements() {
    const data = await readData();
    return data.announcements;
  },
  async saveAnnouncements(announcements) {
    const data = await readData();
    data.announcements = announcements;
    await writeData(data);
  },
  async getNotifications() {
    const data = await readData();
    return data.notifications;
  },
  async saveNotifications(notifications) {
    const data = await readData();
    data.notifications = notifications;
    await writeData(data);
  }
};
