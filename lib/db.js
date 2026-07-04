const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_FILE = path.join(process.cwd(), 'lib', 'db.json');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function initializeDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = {
      users: [
        {
          employeeId: "EMP-001",
          email: "admin@hrms.com",
          passwordHash: hashPassword("admin123"),
          name: "System Administrator",
          role: "admin",
          phone: "+1 (555) 0199",
          address: "123 Admin Way, Tech City",
          profilePicture: "",
          jobDetails: {
            title: "Chief HR Officer",
            department: "Human Resources",
            joiningDate: "2020-01-01",
            status: "Active"
          },
          salaryStructure: {
            basic: 8000,
            hra: 3000,
            lta: 1500,
            allowances: 2000,
            deductions: 500
          },
          documents: [
            { name: "Employment Contract.pdf", uploadDate: "2020-01-01", url: "#" }
          ]
        },
        {
          employeeId: "EMP-002",
          email: "jane@hrms.com",
          passwordHash: hashPassword("jane123"),
          name: "Jane Doe",
          role: "employee",
          phone: "+1 (555) 0144",
          address: "456 Employee Lane, Tech City",
          profilePicture: "",
          jobDetails: {
            title: "Senior UX Designer",
            department: "Design",
            joiningDate: "2022-06-15",
            status: "Active"
          },
          salaryStructure: {
            basic: 5000,
            hra: 2000,
            lta: 1000,
            allowances: 1500,
            deductions: 300
          },
          documents: [
            { name: "Offer Letter.pdf", uploadDate: "2022-06-10", url: "#" },
            { name: "ID Card.pdf", uploadDate: "2022-06-15", url: "#" }
          ]
        }
      ],
      attendance: [
        {
          id: "att-1",
          employeeId: "EMP-002",
          date: "2026-07-02",
          checkIn: "2026-07-02T09:05:00.000Z",
          checkOut: "2026-07-02T17:30:00.000Z",
          status: "Present"
        },
        {
          id: "att-2",
          employeeId: "EMP-002",
          date: "2026-07-03",
          checkIn: "2026-07-03T08:55:00.000Z",
          checkOut: "2026-07-03T18:05:00.000Z",
          status: "Present"
        }
      ],
      leaves: [
        {
          id: "leave-1",
          employeeId: "EMP-002",
          employeeName: "Jane Doe",
          type: "Sick",
          startDate: "2026-07-10",
          endDate: "2026-07-11",
          remarks: "Dental checkup and recovery",
          status: "Pending",
          adminComment: null
        }
      ],
      sessions: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function readData() {
  initializeDb();
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  hashPassword,
  getUsers: () => readData().users,
  getAttendance: () => readData().attendance,
  getLeaves: () => readData().leaves,
  getSessions: () => readData().sessions,

  saveUser: (user) => {
    const data = readData();
    const idx = data.users.findIndex(u => u.employeeId === user.employeeId);
    if (idx >= 0) {
      data.users[idx] = { ...data.users[idx], ...user };
    } else {
      data.users.push(user);
    }
    writeData(data);
    return user;
  },

  deleteUser: (employeeId) => {
    const data = readData();
    data.users = data.users.filter(u => u.employeeId !== employeeId);
    writeData(data);
  },

  saveAttendance: (record) => {
    const data = readData();
    const idx = data.attendance.findIndex(r => r.id === record.id);
    if (idx >= 0) {
      data.attendance[idx] = { ...data.attendance[idx], ...record };
    } else {
      data.attendance.push(record);
    }
    writeData(data);
    return record;
  },

  saveLeave: (leave) => {
    const data = readData();
    const idx = data.leaves.findIndex(l => l.id === leave.id);
    if (idx >= 0) {
      data.leaves[idx] = { ...data.leaves[idx], ...leave };
    } else {
      data.leaves.push(leave);
    }
    writeData(data);
    return leave;
  },

  saveSession: (session) => {
    const data = readData();
    data.sessions = data.sessions.filter(s => s.expiresAt > Date.now());
    data.sessions.push(session);
    writeData(data);
    return session;
  },

  getSession: (sessionId) => {
    const data = readData();
    return data.sessions.find(s => s.id === sessionId && s.expiresAt > Date.now());
  },

  deleteSession: (sessionId) => {
    const data = readData();
    data.sessions = data.sessions.filter(s => s.id !== sessionId);
    writeData(data);
  }
};
