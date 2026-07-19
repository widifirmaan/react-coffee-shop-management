import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGO_DB = 'coffeeshop';
const OUTPUT_FILE = 'migration.sql';

function uid() {
  return randomUUID();
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? '1' : '0';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function toISO(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  return new Date(val).toISOString();
}

async function main() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);

  let sql = `-- Migration from MongoDB to D1\n-- Generated: ${new Date().toISOString()}\n\n`;

  // 1. Migrate employees (without attendanceRecord)
  const employees = await db.collection('employees').find({}).toArray();
  sql += `-- Employees (${employees.length})\n`;
  for (const emp of employees) {
    const id = uid();
    const { _id, __v, attendanceRecord, createdAt, updatedAt, ...rest } = emp;
    const cols = ['id', ...Object.keys(rest)];
    const vals = [esc(id), ...Object.keys(rest).map(k => {
      if (k === 'createdAt' || k === 'updatedAt') return esc(toISO(rest[k]));
      if (k === 'active') return rest[k] ? '1' : '0';
      return esc(rest[k]);
    })];
    sql += `INSERT INTO employees (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 2. Migrate attendance records (from embedded array)
  sql += `-- Attendance Records\n`;
  let attCount = 0;
  for (const emp of employees) {
    const empId = emp.employeeId || emp._id.toString();
    const existing = employees.find(e => e.employeeId === empId || e._id.toString() === empId);
    if (!existing) {
      // Find the employee by the imported ID - we use the same employeeId mapping
      continue;
    }
    // We need to map the old _id to our new UUID for attendance foreign key
    // Actually we don't have that mapping yet. Let's store the employee id mapping.
  }
  // Actually, let's do a two-pass approach: first assign UUIDs to all employees, then process attendance
  const empMap = new Map(); // old _id string -> new UUID
  const empIdMap = new Map(); // employeeId string -> new UUID

  // Restart: collect all employees with new UUIDs
  for (const emp of employees) {
    const newId = uid();
    empMap.set(emp._id.toString(), newId);
    if (emp.employeeId) empIdMap.set(emp.employeeId, newId);
  }

  // Now generate employee SQL with deterministic UUIDs
  sql = `-- Migration from MongoDB to D1\n-- Generated: ${new Date().toISOString()}\n\n`;
  sql += `-- Employees (${employees.length})\n`;
  for (const emp of employees) {
    const newId = empMap.get(emp._id.toString());
    const { _id, __v, attendanceRecord, createdAt, updatedAt, ...rest } = emp;
    const restKeys = Object.keys(rest);
    const cols = ['id', ...restKeys];
    const vals = [esc(newId), ...restKeys.map(k => {
      if (k === 'createdAt' || k === 'updatedAt') return esc(toISO(rest[k]));
      if (k === 'active') return rest[k] ? '1' : '0';
      return esc(rest[k]);
    })];
    sql += `INSERT INTO employees (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 3. Attendance records
  sql += `-- Attendance Records\n`;
  for (const emp of employees) {
    const newEmpId = empMap.get(emp._id.toString());
    const records = emp.attendanceRecord || [];
    for (const rec of records) {
      const recId = uid();
      const date = rec.date ? (rec.date instanceof Date ? rec.date.toISOString().slice(0, 10) : String(rec.date).slice(0, 10)) : '';
      const clockIn = rec.clockInTime ? toISO(rec.clockInTime) : null;
      const clockOut = rec.clockOutTime ? toISO(rec.clockOutTime) : null;
      sql += `INSERT INTO attendance_records (id, employee_id, date, present, clockInTime, clockOutTime, shiftType, status, minutesLate, status_alert, hoursWorked, notes) VALUES (${esc(recId)}, ${esc(newEmpId)}, ${esc(date)}, ${rec.present ? '1' : '0'}, ${esc(clockIn)}, ${esc(clockOut)}, ${esc(rec.shiftType || null)}, ${esc(rec.status || null)}, ${rec.minutesLate || 0}, ${esc(rec.status_alert || null)}, ${rec.hoursWorked || 'NULL'}, ${esc(rec.notes || '')});\n`;
      attCount++;
    }
  }
  sql += `-- Total attendance records: ${attCount}\n\n`;

  // 4. Menus
  const menus = await db.collection('menus').find({}).toArray();
  sql += `-- Menus (${menus.length})\n`;
  for (const menu of menus) {
    const id = uid();
    const { _id, __v, createdAt, updatedAt, ...rest } = menu;
    const restKeys = Object.keys(rest);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => {
      if (k === 'createdAt' || k === 'updatedAt') return esc(toISO(rest[k]));
      if (k === 'available') return rest[k] ? '1' : '0';
      return esc(rest[k]);
    })];
    sql += `INSERT INTO menus (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 5. Categories
  const categories = await db.collection('categories').find({}).toArray();
  sql += `-- Categories (${categories.length})\n`;
  for (const cat of categories) {
    const id = uid();
    const { _id, __v, ...rest } = cat;
    const restKeys = Object.keys(rest);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(rest[k]))];
    sql += `INSERT INTO categories (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 6. Shop config
  const configs = await db.collection('shop_config').find({}).toArray();
  sql += `-- Shop Config (${configs.length})\n`;
  for (const cfg of configs) {
    const id = uid();
    const { _id, __v, ...rest } = cfg;
    const restKeys = Object.keys(rest);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(rest[k]))];
    sql += `INSERT INTO shop_config (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 7. Orders
  const orders = await db.collection('orders').find({}).toArray();
  sql += `-- Orders (${orders.length})\n`;
  for (const order of orders) {
    const id = uid();
    const { _id, __v, createdAt, updatedAt, items, ...rest } = order;
    const data = { ...rest };
    if (items) data.items = JSON.stringify(items);
    if (createdAt) data.createdAt = toISO(createdAt);
    if (updatedAt) data.updatedAt = toISO(updatedAt);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO orders (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 8. Posts
  const posts = await db.collection('posts').find({}).toArray();
  sql += `-- Posts (${posts.length})\n`;
  for (const post of posts) {
    const id = uid();
    const { _id, __v, createdAt, updatedAt, publishedAt, ...rest } = post;
    const data = { ...rest };
    if (createdAt) data.createdAt = toISO(createdAt);
    if (updatedAt) data.updatedAt = toISO(updatedAt);
    if (publishedAt) data.publishedAt = toISO(publishedAt);
    if (data.tags && Array.isArray(data.tags)) data.tags = JSON.stringify(data.tags);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO posts (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 9. Shift schedules
  const shifts = await db.collection('shift_schedules').find({}).toArray();
  sql += `-- Shift Schedules (${shifts.length})\n`;
  for (const s of shifts) {
    const id = uid();
    const { _id, __v, ...rest } = s;
    const restKeys = Object.keys(rest);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(rest[k]))];
    sql += `INSERT INTO shift_schedules (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 10. Transactions
  const transactions = await db.collection('transactions').find({}).toArray();
  sql += `-- Transactions (${transactions.length})\n`;
  for (const t of transactions) {
    const id = uid();
    const { _id, __v, createdAt, date, ...rest } = t;
    const data = { ...rest };
    if (date) data.date = toISO(date);
    if (createdAt) data.createdAt = toISO(createdAt);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO transactions (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 11. Ingredients
  const ingredients = await db.collection('ingredients').find({}).toArray();
  sql += `-- Ingredients (${ingredients.length})\n`;
  for (const ing of ingredients) {
    const id = uid();
    const { _id, __v, createdAt, updatedAt, ...rest } = ing;
    const data = { ...rest };
    if (createdAt) data.createdAt = toISO(createdAt);
    if (updatedAt) data.updatedAt = toISO(updatedAt);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO ingredients (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 12. Notes
  const notes = await db.collection('notes').find({}).toArray();
  sql += `-- Notes (${notes.length})\n`;
  for (const note of notes) {
    const id = uid();
    const { _id, __v, createdAt, updatedAt, ...rest } = note;
    const data = { ...rest };
    if (createdAt) data.createdAt = toISO(createdAt);
    if (updatedAt) data.updatedAt = toISO(updatedAt);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO notes (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 13. Notifications
  const notifications = await db.collection('notifications').find({}).toArray();
  sql += `-- Notifications (${notifications.length})\n`;
  for (const n of notifications) {
    const id = uid();
    const { _id, __v, createdAt, timestamp, read, ...rest } = n;
    const data = { ...rest };
    if (timestamp) data.timestamp = toISO(timestamp);
    if (createdAt) data.createdAt = toISO(createdAt);
    data.read = read ? 1 : 0;
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO notifications (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 14. Feedbacks
  const feedbacks = await db.collection('feedbacks').find({}).toArray();
  sql += `-- Feedbacks (${feedbacks.length})\n`;
  for (const fb of feedbacks) {
    const id = uid();
    const { _id, __v, createdAt, timestamp, shiftEmployees, ...rest } = fb;
    const data = { ...rest };
    if (timestamp) data.timestamp = toISO(timestamp);
    if (createdAt) data.createdAt = toISO(createdAt);
    if (shiftEmployees) data.shiftEmployees = JSON.stringify(shiftEmployees);
    const restKeys = Object.keys(data);
    const cols = ['id', ...restKeys];
    const vals = [esc(id), ...restKeys.map(k => esc(data[k]))];
    sql += `INSERT INTO feedbacks (${cols.join(', ')}) VALUES (${vals.join(', ')});\n`;
  }
  sql += '\n';

  // 15. Images (metadata only, actual data needs R2 migration separately)
  const images = await db.collection('images').find({}).toArray();
  sql += `-- Images (${images.length}) - metadata only, actual files need manual R2 upload\n`;
  for (const img of images) {
    const id = uid();
    const { _id, __v, data, mimetype, originalName, size, createdAt } = img;
    if (!mimetype && !originalName) continue; // skip if no useful metadata
    const r2Key = `${id}-${originalName || 'unknown'}`;
    sql += `INSERT INTO images (id, filename, mimetype, originalName, size, r2Key) VALUES (${esc(id)}, ${esc(originalName || 'unknown')}, ${esc(mimetype || 'image/webp')}, ${esc(originalName || 'unknown')}, ${size || 0}, ${esc(r2Key)});\n`;
    sql += `-- NOTE: Image ${id} (${originalName}) needs manual upload to R2 bucket 'siapnyafe-images' with key: ${r2Key}\n`;
  }

  writeFileSync(OUTPUT_FILE, sql);
  console.log(`Migration SQL written to ${OUTPUT_FILE}`);
  console.log(`Total records: ${employees.length} employees, ${attCount} attendance, ${menus.length} menus, ${categories.length} categories, ${configs.length} configs, ${orders.length} orders, ${posts.length} posts, ${shifts.length} shifts, ${transactions.length} transactions, ${ingredients.length} ingredients, ${notes.length} notes, ${notifications.length} notifications, ${feedbacks.length} feedbacks, ${images.length} images`);

  await client.close();
}

main().catch(console.error);
