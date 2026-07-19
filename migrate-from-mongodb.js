import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGO_DB = 'test';
const OUTPUT_FILE = 'migration.sql';

function uid() {
  return randomUUID();
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number' && !Number.isNaN(val)) return val.toString();
  if (typeof val === 'boolean') return val ? '1' : '0';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function toISO(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

function jsonStr(val) {
  if (!val) return null;
  return typeof val === 'string' ? val : JSON.stringify(val);
}

// Field mapping: MongoDB field -> D1 field (or null to skip)
const FIELD_MAP = {
  employees: {
    'phoneNumber': 'phone',
    'phone': 'phone',
    'salary': 'salary',
    'contact': 'contact',
    '_id': null,
    '__v': null,
    'attendanceRecord': null,
    'createdAt': 'createdAt',
    'updatedAt': 'updatedAt',
  },
  menus: {
    'imageUrl': 'imageUrl',
    'image': 'image',
    'gallery': 'gallery',
    '_id': null,
    '__v': null,
    'createdAt': 'createdAt',
    'updatedAt': 'updatedAt',
  },
  shop_config: {
    'faviconUrl': 'faviconUrl',
    'address': 'address',
    'phoneNumber': 'phoneNumber',
    'instagramUrl': 'instagramUrl',
    'facebookUrl': 'facebookUrl',
    'twitterUrl': 'twitterUrl',
    'socialLinks': 'socialLinks',
    'heroImageUrl': 'heroImageUrl',
    'badgeText1': 'badgeText1',
    'badgeText2': 'badgeText2',
    'galleryImages': 'galleryImages',
    'techSpec1': 'techSpec1',
    'techSpec2': 'techSpec2',
    'techSpec3': 'techSpec3',
    '_id': null,
    '__v': null,
  },
  orders: {
    'totalAmount': 'totalAmount',
    'totalPrice': 'totalPrice',
    'shiftStaff': 'shiftStaff',
    '_id': null,
    '__v': null,
  },
  posts: {
    'featuredImage': 'featuredImage',
    'image': 'image',
    '_id': null,
    '__v': null,
  },
  ingredients: {
    'quantity': 'quantity',
    'minThreshold': 'minThreshold',
    'stock': 'stock',
    'minStock': 'minStock',
    '_id': null,
    '__v': null,
  },
  notes: {
    'updatedBy': 'updatedBy',
    'lastUpdatedBy': 'lastUpdatedBy',
    '_id': null,
    '__v': null,
  },
  notifications: {
    'tableNumber': 'tableNumber',
    '_id': null,
    '__v': null,
  },
  feedbacks: {
    'shiftEmployees': 'shiftEmployees',
    '_id': null,
    '__v': null,
  },
};

function mapFields(collection, doc) {
  const mapped = {};
  const map = FIELD_MAP[collection] || {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id' || key === '__v') continue;
    if (map[key] === null) continue;
    const targetKey = map[key] || key;
    mapped[targetKey] = value;
  }
  return mapped;
}

function isDateField(key) {
  return ['createdAt', 'updatedAt', 'publishedAt', 'date', 'timestamp', 'clockInTime', 'clockOutTime'].includes(key);
}

function needsJson(key) {
  return ['items', 'gallery', 'galleryImages', 'socialLinks', 'tags', 'shiftEmployees', 'shiftStaff'].includes(key);
}

function makeInsert(table, data) {
  const keys = Object.keys(data);
  const vals = keys.map(k => {
    const v = data[k];
    if (isDateField(k)) return esc(toISO(v));
    if (needsJson(k)) return esc(jsonStr(v));
    return esc(v);
  });
  return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${vals.join(', ')});\n`;
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);

  let sql = `-- Migration from MongoDB to D1\n-- Generated: ${new Date().toISOString()}\n\n`;

  // 1. EMPLOYEES
  const employees = await db.collection('employees').find({}).toArray();
  const empMap = new Map();
  sql += `-- Employees (${employees.length})\n`;
  for (const emp of employees) {
    const newId = uid();
    empMap.set(emp._id.toString(), newId);
    const data = mapFields('employees', emp);
    data.id = newId;
    if (data.active !== undefined) data.active = data.active ? 1 : 0;
    sql += makeInsert('employees', data);
  }
  sql += '\n';

  // 2. ATTENDANCE RECORDS
  let attCount = 0;
  sql += `-- Attendance Records\n`;
  for (const emp of employees) {
    const newEmpId = empMap.get(emp._id.toString());
    if (!newEmpId) continue;
    const records = emp.attendanceRecord || [];
    for (const rec of records) {
      const data = mapFields('attendance_records', rec);
      data.id = uid();
      data.employee_id = newEmpId;
      if (rec.date) data.date = rec.date instanceof Date ? rec.date.toISOString().slice(0, 10) : String(rec.date).slice(0, 10);
      if (data.present !== undefined) data.present = data.present ? 1 : 0;
      sql += makeInsert('attendance_records', data);
      attCount++;
    }
  }
  sql += `-- Total attendance records: ${attCount}\n\n`;

  // 3. MENUS
  const menus = await db.collection('menus').find({}).toArray();
  sql += `-- Menus (${menus.length})\n`;
  for (const doc of menus) {
    const data = mapFields('menus', doc);
    data.id = uid();
    if (data.available !== undefined) data.available = data.available ? 1 : 0;
    if (data.gallery && Array.isArray(data.gallery)) data.gallery = JSON.stringify(data.gallery);
    sql += makeInsert('menus', data);
  }
  sql += '\n';

  // 4. CATEGORIES
  const categories = await db.collection('categories').find({}).toArray();
  sql += `-- Categories (${categories.length})\n`;
  for (const doc of categories) {
    const data = mapFields('categories', doc);
    data.id = uid();
    sql += makeInsert('categories', data);
  }
  sql += '\n';

  // 5. SHOP CONFIG
  const configs = await db.collection('shop_config').find({}).toArray();
  sql += `-- Shop Config (${configs.length})\n`;
  for (const doc of configs) {
    const data = mapFields('shop_config', doc);
    data.id = uid();
    if (data.socialLinks && typeof data.socialLinks !== 'string') data.socialLinks = JSON.stringify(data.socialLinks);
    if (data.galleryImages && typeof data.galleryImages !== 'string') data.galleryImages = JSON.stringify(data.galleryImages);
    sql += makeInsert('shop_config', data);
  }
  sql += '\n';

  // 6. ORDERS
  const orders = await db.collection('orders').find({}).toArray();
  sql += `-- Orders (${orders.length})\n`;
  for (const doc of orders) {
    const data = mapFields('orders', doc);
    data.id = uid();
    if (data.items && typeof data.items !== 'string') data.items = JSON.stringify(data.items);
    if (data.shiftStaff && typeof data.shiftStaff !== 'string') data.shiftStaff = JSON.stringify(data.shiftStaff);
    sql += makeInsert('orders', data);
  }
  sql += '\n';

  // 7. POSTS
  const posts = await db.collection('posts').find({}).toArray();
  sql += `-- Posts (${posts.length})\n`;
  for (const doc of posts) {
    const data = mapFields('posts', doc);
    data.id = uid();
    if (data.tags && Array.isArray(data.tags)) data.tags = JSON.stringify(data.tags);
    sql += makeInsert('posts', data);
  }
  sql += '\n';

  // 8. SHIFT SCHEDULES
  const shifts = await db.collection('shift_schedules').find({}).toArray();
  sql += `-- Shift Schedules (${shifts.length})\n`;
  for (const doc of shifts) {
    const data = mapFields('shift_schedules', doc);
    data.id = uid();
    sql += makeInsert('shift_schedules', data);
  }
  sql += '\n';

  // 9. TRANSACTIONS
  const transactions = await db.collection('transactions').find({}).toArray();
  sql += `-- Transactions (${transactions.length})\n`;
  for (const doc of transactions) {
    const data = mapFields('transactions', doc);
    data.id = uid();
    sql += makeInsert('transactions', data);
  }
  sql += '\n';

  // 10. INGREDIENTS
  const ingredients = await db.collection('ingredients').find({}).toArray();
  sql += `-- Ingredients (${ingredients.length})\n`;
  for (const doc of ingredients) {
    const data = mapFields('ingredients', doc);
    data.id = uid();
    if (data.quantity !== undefined) data.quantity = Number(data.quantity);
    if (data.minThreshold !== undefined) data.minThreshold = Number(data.minThreshold);
    sql += makeInsert('ingredients', data);
  }
  sql += '\n';

  // 11. NOTES
  const notes = await db.collection('notes').find({}).toArray();
  sql += `-- Notes (${notes.length})\n`;
  for (const doc of notes) {
    const data = mapFields('notes', doc);
    if (Object.keys(data).length === 0) continue;
    data.id = uid();
    sql += makeInsert('notes', data);
  }
  sql += '\n';

  // 12. NOTIFICATIONS
  const notifications = await db.collection('notifications').find({}).toArray();
  sql += `-- Notifications (${notifications.length})\n`;
  for (const doc of notifications) {
    const data = mapFields('notifications', doc);
    data.id = uid();
    if (data.read !== undefined) data.read = data.read ? 1 : 0;
    sql += makeInsert('notifications', data);
  }
  sql += '\n';

  // 13. FEEDBACKS
  const feedbacks = await db.collection('feedbacks').find({}).toArray();
  sql += `-- Feedbacks (${feedbacks.length})\n`;
  for (const doc of feedbacks) {
    const data = mapFields('feedbacks', doc);
    data.id = uid();
    if (data.shiftEmployees && Array.isArray(data.shiftEmployees)) data.shiftEmployees = JSON.stringify(data.shiftEmployees);
    sql += makeInsert('feedbacks', data);
  }
  sql += '\n';

  // 14. IMAGES (metadata only)
  const images = await db.collection('images').find({}).toArray();
  sql += `-- Images (${images.length}) - metadata only\n`;
  for (const doc of images) {
    if (!doc.mimetype && !doc.originalName) continue;
    const id = uid();
    const r2Key = `${id}-${doc.originalName || 'unknown'}`;
    const mime = doc.mimetype || 'image/webp';
    const name = doc.originalName || 'unknown';
    const size = doc.size || 0;
    sql += `INSERT INTO images (id, filename, mimetype, originalName, size, r2Key) VALUES (${esc(id)}, ${esc(name)}, ${esc(mime)}, ${esc(name)}, ${size}, ${esc(r2Key)});\n`;
    sql += `-- NOTE: Upload this file manually: npx wrangler r2 object put siapnyafe-images/${r2Key} --file=<path>\n`;
  }

  writeFileSync(OUTPUT_FILE, sql);
  console.log(`Migration SQL written to ${OUTPUT_FILE}`);

  const counts = {
    employees: employees.length,
    attendance: attCount,
    menus: menus.length,
    categories: categories.length,
    configs: configs.length,
    orders: orders.length,
    posts: posts.length,
    shifts: shifts.length,
    transactions: transactions.length,
    ingredients: ingredients.length,
    notes: notes.length,
    notifications: notifications.length,
    feedbacks: feedbacks.length,
    images: images.length,
  };
  console.log('Records:', counts);

  await client.close();
}

main().catch(console.error);
