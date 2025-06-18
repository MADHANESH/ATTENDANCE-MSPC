import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import ExcelJS from 'exceljs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors({
  origin: [
    "https://attendance-mspc.vercel.app/", // Your frontend
   // For local development
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// User schema and model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Employee schema
const employeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  designation: { type: String, required: true },
  salary: { type: Number, required: true },
  overtimeSalary: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for individual user data
});

const Employee = mongoose.model('Employee', employeeSchema);

// Attendance schema
const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  status: { type: String, enum: ['present', 'absent'], required: true },
  overtime: { type: Boolean, default: false },
  overtimeHours: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

// Holiday schema
const holidaySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: 'YYYY-MM-DD'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Holiday = mongoose.model('Holiday', holidaySchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Protected route: get current user's data
app.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add employee route (protected)
app.post('/addemployee', authenticateToken, async (req, res) => {
  try {
    const { employeeName, designation, salary, overtimeSalary } = req.body;
    const employee = new Employee({
      employeeName,
      designation,
      salary,
      overtimeSalary,
      createdBy: req.user.userId, // associate with logged-in user
    });
    await employee.save();
    console.log('Employee added:', employee); // Log the added employee
    res.status(201).json({ message: 'Employee added successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get employees route (protected)
app.get('/employees', authenticateToken, async (req, res) => {
  try {
    // Only fetch employees created by the logged-in user
    const employees = await Employee.find({ createdBy: req.user.userId });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.delete('/employees/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Delete request for employee ID:', req.params.id, 'by user:', req.user.userId);
    const emp = await Employee.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });
    if (!emp) {
      console.log('Employee not found or not authorized to delete.');
      return res.status(404).json({ message: 'Employee not found.' });
    }
    console.log('Employee deleted:', emp);
    res.json({ message: 'Employee deleted.' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Attendance marking route
app.post('/attendance', authenticateToken, async (req, res) => {
  try {
    const { date, attendance } = req.body; // attendance: { employeeId: { status, overtime, overtimeHours } }
    const createdBy = req.user.userId;

    // Remove existing attendance for this date and user to avoid duplicates
    await Attendance.deleteMany({ date, createdBy });

    // Prepare attendance records
    const records = Object.entries(attendance).map(([employee, value]) => ({
      employee,
      date,
      status: value.status,
      overtime: value.overtime,
      overtimeHours: value.overtime ? Number(value.overtimeHours) : 0,
      createdBy
    }));

    // Insert new attendance records
    await Attendance.insertMany(records);

    res.json({ message: 'Attendance saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Attendance Excel export route
app.get('/attendance/excel', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query; // e.g., '2024-06'
    const createdBy = req.user.userId;

    // 1. Get all employees for the user
    const employees = await Employee.find({ createdBy });

    // 2. Get all attendance records for the month
    const regex = new RegExp(`^${month}`);
    const records = await Attendance.find({ date: regex, createdBy });

    // 3. Get all unique dates in the month (sorted)
    const datesSet = new Set(records.map(r => r.date));
    const dates = Array.from(datesSet).sort();

    // 4. Build a map: { employeeId: { date: status } }
    const attendanceMap = {};
    employees.forEach(emp => {
      attendanceMap[emp._id] = {};
    });
    records.forEach(r => {
      if (attendanceMap[r.employee]) {
        attendanceMap[r.employee][r.date] = r.status === 'present' ? 'P' : 'A';
      }
    });

    // 5. Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // 6. Build header row: Employee Name, date1, date2, ...
    const headerRow = ['Employee Name', ...dates];
    worksheet.addRow(headerRow);

    // 7. Add employee rows
    employees.forEach(emp => {
      const row = [emp.employeeName];
      dates.forEach(date => {
        row.push(attendanceMap[emp._id][date] || '');
      });
      worksheet.addRow(row);
    });

    // 8. Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${month}.xlsx`);

    // 9. Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update salary route
app.put('/employees/:id/salary', authenticateToken, async (req, res) => {
  try {
    const { salary, overtimeSalary } = req.body;
    const emp = await Employee.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      { salary, overtimeSalary },
      { new: true }
    );
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Salary updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Attendance retrieval for an employee
app.get('/attendance/employee/:id', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query; // e.g., '2024-06'
    const createdBy = req.user.userId;
    const regex = new RegExp(`^${month}`);
    const records = await Attendance.find({
      employee: req.params.id,
      date: regex,
      createdBy
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Backend: Get holidays for a month
app.get('/holidays', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query; // e.g., '2024-06'
    const createdBy = req.user.userId;
    const regex = new RegExp(`^${month}`);
    const holidays = await Holiday.find({ date: regex, createdBy });
    res.json(holidays.map(h => h.date));
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Example route
app.get('/', (req, res) => {
  res.send('✅Server is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

