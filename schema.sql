CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  employeeId TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT,
  contact TEXT,
  role TEXT NOT NULL DEFAULT 'Cashier',
  image TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  date TEXT NOT NULL,
  present INTEGER DEFAULT 1,
  clockInTime TEXT,
  clockOutTime TEXT,
  shiftType TEXT,
  status TEXT,
  minutesLate INTEGER DEFAULT 0,
  status_alert TEXT,
  hoursWorked REAL,
  notes TEXT DEFAULT '',
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price REAL NOT NULL,
  description TEXT,
  image TEXT,
  available INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shop_config (
  id TEXT PRIMARY KEY,
  shopName TEXT,
  websiteTitle TEXT,
  marqueeText TEXT,
  infoTitle TEXT,
  infoContent TEXT,
  infoFooter1 TEXT,
  infoFooter2 TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  orderNumber TEXT,
  items TEXT,
  totalPrice REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  grandTotal REAL DEFAULT 0,
  status TEXT DEFAULT 'PENDING',
  paymentMethod TEXT,
  paymentAmount REAL,
  changeAmount REAL,
  employeeId TEXT,
  tableNumber TEXT,
  orderType TEXT,
  notes TEXT,
  customerName TEXT,
  createdAt TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT,
  slug TEXT UNIQUE,
  content TEXT,
  excerpt TEXT,
  author TEXT,
  status TEXT DEFAULT 'DRAFT',
  image TEXT,
  category TEXT,
  tags TEXT,
  publishedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shift_schedules (
  id TEXT PRIMARY KEY,
  employeeId TEXT,
  employeeName TEXT,
  role TEXT,
  position TEXT,
  dayOfWeek TEXT,
  shiftType TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT,
  category TEXT,
  amount REAL,
  description TEXT,
  date TEXT,
  employeeId TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  name TEXT,
  category TEXT,
  stock REAL DEFAULT 0,
  unit TEXT,
  minStock REAL DEFAULT 0,
  price REAL,
  supplier TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  lastUpdatedBy TEXT,
  updatedAt TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT,
  message TEXT,
  type TEXT,
  read INTEGER DEFAULT 0,
  timestamp TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  customerName TEXT,
  rating INTEGER,
  message TEXT,
  shiftEmployees TEXT,
  timestamp TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  filename TEXT,
  mimetype TEXT,
  originalName TEXT,
  size INTEGER,
  r2Key TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);
