import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
let JWT_SECRET_KEY = 'siap-nyafe-secure-jwt-key-production-2026';

const TABLE_COLUMNS = {
  employees: ['employeeId', 'email', 'name', 'phone', 'position', 'salary', 'pin', 'role', 'image', 'contact', 'active'],
  menus: ['name', 'category', 'price', 'description', 'image', 'imageUrl', 'available', 'gallery'],
  categories: ['name', 'description'],
  shop_config: [
    'shopName', 'websiteTitle', 'faviconUrl', 'address', 'phoneNumber',
    'instagramUrl', 'facebookUrl', 'twitterUrl', 'socialLinks', 'heroImageUrl',
    'badgeText1', 'badgeText2', 'marqueeText', 'galleryImages', 'infoTitle',
    'infoContent', 'infoFooter1', 'infoFooter2', 'techSpec1', 'techSpec2',
    'techSpec3', 'latestDropPromoTitle', 'latestDropPromoDesc', 'latestDropPromoDate',
    'latestDropNewsTitle', 'latestDropNewsDesc', 'latestDropEventTitle', 'latestDropEventDesc',
    'taxPercentage', 'receiptFooter'
  ],
  orders: [
    'orderNumber', 'items', 'totalPrice', 'totalAmount', 'tax', 'grandTotal',
    'status', 'paymentMethod', 'paymentAmount', 'changeAmount', 'employeeId',
    'tableNumber', 'orderType', 'notes', 'customerName', 'shiftStaff', 'createdAt', 'updatedAt'
  ],
  posts: [
    'title', 'slug', 'content', 'excerpt', 'author', 'status', 'image',
    'featuredImage', 'category', 'tags', 'publishedAt', 'createdAt', 'updatedAt'
  ],
  transactions: ['type', 'category', 'amount', 'description', 'date', 'employeeId'],
  ingredients: ['name', 'category', 'stock', 'quantity', 'unit', 'minStock', 'minThreshold', 'price', 'supplier'],
  notes: ['title', 'content', 'lastUpdatedBy', 'updatedBy', 'updatedAt'],
  notifications: ['title', 'message', 'type', 'tableNumber', 'read', 'timestamp'],
  feedbacks: ['customerName', 'rating', 'message', 'shiftEmployees', 'timestamp'],
  assets: [
    'assetCode', 'name', 'category', 'purchaseDate', 'purchasePrice',
    'condition', 'status', 'location', 'serialNumber', 'lastMaintenanceDate',
    'nextMaintenanceDate', 'notes', 'createdAt', 'updatedAt'
  ],
  recipes: [
    'menuId', 'menuName', 'ingredientId', 'ingredientName', 'amount', 'unit', 'createdAt'
  ]
};

function pickFields(obj, allowedKeys) {
  const result = {};
  if (!obj || typeof obj !== 'object') return result;
  for (const k of allowedKeys) {
    if (obj[k] !== undefined) {
      result[k] = obj[k];
    }
  }
  return result;
}

function uid() {
  return crypto.randomUUID();
}

function stripPassword(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return rest;
}

function corsHeaders(request) {
  const origin = request ? (request.headers.get('Origin') || '*') : '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function error(msg, status = 400, extraHeaders = {}) {
  return json({ message: msg }, status, extraHeaders);
}

const PLACEHOLDER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#eee" width="200" height="200"/><text fill="#999" font-size="14" text-anchor="middle" x="100" y="105">Image not found</text></svg>';
function placeholderImage() {
  return new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}

const JSON_FIELDS = ['gallery', 'items', 'shiftStaff', 'galleryImages', 'socialLinks', 'shiftEmployees', 'tags'];
function parseJsonFields(row) {
  if (!row) return row;
  for (const key of JSON_FIELDS) {
    if (typeof row[key] === 'string') {
      try { row[key] = JSON.parse(row[key]); } catch {}
    }
  }
  return row;
}
function stringifyJsonFields(obj) {
  if (!obj) return obj;
  for (const key of JSON_FIELDS) {
    if (Array.isArray(obj[key]) || (obj[key] && typeof obj[key] === 'object')) {
      obj[key] = JSON.stringify(obj[key]);
    }
  }
  return obj;
}

async function signJwt(payload, secret = JWT_SECRET_KEY, expiresInSeconds = 7 * 86400) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const h = b64(header);
  const p = b64(fullPayload);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`));
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${h}.${p}.${s}`;
}

async function verifyJwt(token, secret = JWT_SECRET_KEY) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );
    const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
}

function getToken(request) {
  const auth = request.headers.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function authenticate(request, env) {
  const token = getToken(request);
  if (!token) return null;
  const secret = env?.JWT_SECRET || JWT_SECRET_KEY;
  return verifyJwt(token, secret);
}

function requireRole(user, roles) {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.some(r => r.toUpperCase() === user.role?.toUpperCase());
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_MAP = { Sun: 'SUNDAY', Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY', Sat: 'SATURDAY' };

function getJakartaHoursMinutes(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(d);
  let hour = 0, minute = 0;
  for (const p of parts) {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'minute') minute = parseInt(p.value, 10);
  }
  hour = hour % 24;
  return { hour, minute, totalMin: hour * 60 + minute };
}

function getJakartaDateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function getYesterdayJakartaDateStr() {
  return getJakartaDateStr(-1);
}

function getDayOfWeek(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  const dayName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
  }).format(d);
  return DAY_MAP[dayName] || 'MONDAY';
}

function addDaysToDateStr(dateStr, days = 1) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return date.toISOString().slice(0, 10);
}

function isAttendanceExpired(record, todayDateStr, currentTotalMin) {
  if (!record || record.clockOutTime || record.status === 'TIDAK ABSEN MASUK' || record.status === 'TIDAK ABSEN KELUAR') {
    return false;
  }
  const recDate = record.date;
  const shiftType = record.shiftType;
  
  if (shiftType === 'MORNING') {
    if (todayDateStr > recDate) return true;
    if (todayDateStr === recDate && currentTotalMin > 1020) return true;
  } else if (shiftType === 'AFTERNOON') {
    const nextDay = addDaysToDateStr(recDate, 1);
    if (todayDateStr > nextDay) return true;
    if (todayDateStr === nextDay && currentTotalMin > 60) return true;
  } else if (shiftType === 'EVENING') {
    const nextDay = addDaysToDateStr(recDate, 1);
    if (todayDateStr > nextDay) return true;
    if (todayDateStr === nextDay && currentTotalMin > 540) return true;
  }
  return false;
}

function nowISO() {
  return new Date().toISOString();
}

let tablesInitialized = false;
async function initTables(DB) {
  if (tablesInitialized || !DB) return;
  try {
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        assetCode TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        purchaseDate TEXT,
        purchasePrice REAL DEFAULT 0,
        condition TEXT DEFAULT 'GOOD',
        status TEXT DEFAULT 'ACTIVE',
        location TEXT,
        serialNumber TEXT,
        lastMaintenanceDate TEXT,
        nextMaintenanceDate TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `).run();
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        menuId TEXT NOT NULL,
        menuName TEXT,
        ingredientId TEXT NOT NULL,
        ingredientName TEXT,
        amount REAL NOT NULL,
        unit TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `).run();
    try { await DB.prepare('ALTER TABLE shop_config ADD COLUMN taxPercentage REAL DEFAULT 10').run(); } catch (_) {}
    try { await DB.prepare('ALTER TABLE shop_config ADD COLUMN receiptFooter TEXT DEFAULT "Thank you for your visit!"').run(); } catch (_) {}
    tablesInitialized = true;
  } catch (e) {
    console.error('initTables error:', e);
  }
}

async function deductIngredientsForOrder(DB, items) {
  if (!Array.isArray(items) || !DB) return;
  for (const item of items) {
    const qty = parseFloat(item.quantity || 1);
    if (qty <= 0) continue;
    let recipes = [];
    if (item.menuId || item.id) {
      const res = await DB.prepare('SELECT * FROM recipes WHERE menuId = ?').bind(item.menuId || item.id).all();
      recipes = res.results || [];
    }
    if (recipes.length === 0 && (item.menuName || item.name)) {
      const res = await DB.prepare('SELECT * FROM recipes WHERE menuName = ?').bind(item.menuName || item.name).all();
      recipes = res.results || [];
    }

    for (const r of recipes) {
      const deductAmount = parseFloat(r.amount || 0) * qty;
      if (deductAmount > 0) {
        await DB.prepare('UPDATE ingredients SET quantity = MAX(0, quantity - ?), stock = MAX(0, stock - ?), updatedAt = ? WHERE id = ?')
          .bind(deductAmount, deductAmount, nowISO(), r.ingredientId).run();

        const ing = await DB.prepare('SELECT * FROM ingredients WHERE id = ?').bind(r.ingredientId).first();
        if (ing && ing.quantity <= (ing.minThreshold || ing.minStock || 0)) {
          const notifId = uid();
          await DB.prepare('INSERT INTO notifications (id, title, message, type, read, timestamp) VALUES (?, ?, ?, ?, 0, ?)')
            .bind(notifId, 'LOW INVENTORY ALERT', `Stock for ${ing.name} is low (${ing.quantity} ${ing.unit || ''} remaining)!`, 'WARNING', nowISO()).run();
        }
      }
    }
  }
}

async function syncOrderToFinance(DB, order, user) {
  if (!order || !order.orderNumber || !DB) return;
  const grandTotal = parseFloat(order.grandTotal || order.totalPrice || order.totalAmount || 0);
  if (grandTotal <= 0) return;

  const existing = await DB.prepare('SELECT id FROM transactions WHERE description LIKE ?').bind(`%${order.orderNumber}%`).first();
  if (existing) return;

  const id = uid();
  const desc = `Order #${order.orderNumber} - ${order.customerName || 'Walk-in'} (${order.paymentMethod || 'CASH'})`;
  await DB.prepare('INSERT INTO transactions (id, type, category, amount, description, date, employeeId) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, 'INCOME', 'Sales', grandTotal, desc, nowISO(), user?.employeeId || order.employeeId || 'POS').run();
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const searchParams = url.searchParams;
  const cors = corsHeaders(request);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const user = await authenticate(request, env);
  const DB = env.DB;
  const secret = env.JWT_SECRET || JWT_SECRET_KEY;
  await initTables(DB);

  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      try { body = await request.json(); } catch { body = {}; }
    }
  }

  // ===================================================================
  // AUTH
  // ===================================================================
  if (path === '/api/auth/login' && method === 'POST') {
    const { employeeId, email, password } = body;
    if (!password) return error('Password is required', 400, cors);
    let emp;
    if (employeeId && email) {
      // Try employeeId first, then email — both come from same input
      emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
      if (!emp) emp = await DB.prepare('SELECT * FROM employees WHERE email = ?').bind(email).first();
    } else if (employeeId) {
      emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    } else if (email) {
      emp = await DB.prepare('SELECT * FROM employees WHERE email = ?').bind(email).first();
    } else {
      return error('Employee ID or email is required', 400, cors);
    }
    if (!emp) return error('Invalid credentials', 401, cors);
    if (!emp.active) return error('Account is inactive. Please contact manager.', 403, cors);

    const pwdValid = await bcrypt.compare(password, emp.password);
    if (!pwdValid) return error('Invalid credentials', 401, cors);
    const userObj = stripPassword(emp);
    const token = await signJwt({
      id: userObj.id,
      email: userObj.email, role: userObj.role, employeeId: userObj.employeeId,
    }, secret, 7 * 86400); // 7 days expiration
    const response = json({ token, user: userObj }, 200, cors);
    response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
    return response;
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const response = json({ message: 'Logged out' }, 200, cors);
    response.headers.append('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    return response;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const emp = await DB.prepare('SELECT * FROM employees WHERE id = ?').bind(user.id).first();
    if (!emp) return error('User not found', 404, cors);
    return json(stripPassword(emp), 200, cors);
  }

  // ===================================================================
  // EMPLOYEES
  // ===================================================================
  if (path === '/api/employees' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    let sql = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    if (searchParams.get('role')) {
      sql += ' AND role = ?';
      params.push(searchParams.get('role'));
    }
    if (searchParams.get('active') !== null) {
      sql += ' AND active = ?';
      params.push(searchParams.get('active') === 'true' ? 1 : 0);
    }
    if (searchParams.get('search')) {
      const s = searchParams.get('search');
      sql += ' AND (name LIKE ? OR employeeId LIKE ?)';
      params.push(`%${s}%`, `%${s}%`);
    }
    sql += ' ORDER BY name ASC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results.map(stripPassword));
  }

  if (path === '/api/employees' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const id = uid();
    const hash = body.password ? await bcrypt.hash(body.password, SALT_ROUNDS) : null;
    const fields = {
      id, employeeId: body.employeeId, name: body.name,
      email: body.email || null, phone: body.phone || null,
      position: body.position || null, salary: body.salary || 0,
      role: body.role || 'STAFF',
      password: hash, pin: body.pin || null
    };
    const cols = Object.keys(fields);
    const vals = cols.map(() => '?');
    const params = Object.values(fields);
    await DB.prepare(`INSERT INTO employees (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...params).run();
    return json({ id, ...body, password: undefined }, 201);
  }

  const empMatch = path.match(/^\/api\/employees\/([^/]+)$/);
  if (empMatch) {
    const empId = empMatch[1];
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      const fields = {};
      for (const k of ['employeeId', 'name', 'email', 'phone', 'position', 'salary', 'role', 'pin']) {
        if (body[k] !== undefined) fields[k] = body[k];
      }
      if (body.password) fields.password = await bcrypt.hash(body.password, SALT_ROUNDS);
      if (Object.keys(fields).length === 0) return error('No fields to update', 400);
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      const params = [...Object.values(fields), empId];
      await DB.prepare(`UPDATE employees SET ${setClauses} WHERE id = ?`).bind(...params).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await DB.prepare('DELETE FROM employees WHERE id = ?').bind(empId).run();
      return json({ message: 'Deleted' });
    }
  }

  const empStatusMatch = path.match(/^\/api\/employees\/([^/]+)\/status$/);
  if (empStatusMatch && method === 'PATCH') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const emp = await DB.prepare('SELECT * FROM employees WHERE id = ?').bind(empStatusMatch[1]).first();
    if (!emp) return error('Not found', 404);
    const newActive = emp.active ? 0 : 1;
    await DB.prepare('UPDATE employees SET active = ? WHERE id = ?').bind(newActive, empStatusMatch[1]).run();
    return json({ message: 'Status toggled', active: !!newActive });
  }

  // ===================================================================
  // MENUS
  // ===================================================================
  if (path === '/api/menus' && method === 'GET') {
    let sql = 'SELECT * FROM menus WHERE 1=1';
    const params = [];
    if (searchParams.get('category')) {
      sql += ' AND category = ?';
      params.push(searchParams.get('category'));
    }
    if (searchParams.get('search')) {
      sql += ' AND name LIKE ?';
      params.push(`%${searchParams.get('search')}%`);
    }
    sql += ' ORDER BY name ASC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results.map(parseJsonFields), 200, cors);
  }

  if (path === '/api/menus' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    stringifyJsonFields(body);
    const sanitized = pickFields(body, TABLE_COLUMNS.menus);
    if (!sanitized.name || sanitized.price === undefined) return error('Name and price are required', 400, cors);
    const id = uid();
    sanitized.id = id;
    sanitized.createdAt = nowISO();
    sanitized.updatedAt = nowISO();
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO menus (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(parseJsonFields({ ...sanitized }), 201, cors);
  }

  const menuMatch = path.match(/^\/api\/menus\/([^/]+)$/);
  if (menuMatch) {
    const menuId = menuMatch[1];
    if (method === 'GET') {
      const doc = await DB.prepare('SELECT * FROM menus WHERE id = ?').bind(menuId).first();
      if (!doc) return error('Not found', 404, cors);
      return json(parseJsonFields(doc), 200, cors);
    }
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      stringifyJsonFields(body);
      const sanitized = pickFields(body, TABLE_COLUMNS.menus);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      sanitized.updatedAt = nowISO();
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE menus SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), menuId).run();
      return json({ message: 'Updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      await DB.prepare('DELETE FROM menus WHERE id = ?').bind(menuId).run();
      return json({ message: 'Deleted' }, 200, cors);
    }
  }

  // ===================================================================
  // CATEGORIES
  // ===================================================================
  if (path === '/api/categories' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    return json(results, 200, cors);
  }

  if (path === '/api/categories' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    if (!body.name) return error('Category name is required', 400, cors);
    const id = uid();
    await DB.prepare('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)')
      .bind(id, body.name, body.description || null).run();
    return json({ id, name: body.name, description: body.description || null }, 201, cors);
  }

  const catMatch = path.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && method === 'DELETE') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    await DB.prepare('DELETE FROM categories WHERE id = ?').bind(catMatch[1]).run();
    return json({ message: 'Deleted' }, 200, cors);
  }

  // ===================================================================
  // CONFIG
  // ===================================================================
  if (path === '/api/config' && method === 'GET') {
    let config = await DB.prepare('SELECT * FROM shop_config LIMIT 1').first();
    if (!config) {
      const id = uid();
      await DB.prepare('INSERT INTO shop_config (id, shopName, websiteTitle, marqueeText, infoTitle, infoContent, infoFooter1, infoFooter2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(
        id, 'Siap Nyafe', 'Siap Nyafe - Excellent Coffee', 'Welcome to Siap Nyafe Coffee Shop!',
        'Our Story', 'Born in Jakarta, brewed for the bold.', 'EST. 2024', 'JAKARTA'
      ).run();
      return json({ id, shopName: 'Siap Nyafe', websiteTitle: 'Siap Nyafe - Excellent Coffee', marqueeText: 'Welcome to Siap Nyafe Coffee Shop!', infoTitle: 'Our Story', infoContent: 'Born in Jakarta, brewed for the bold.', infoFooter1: 'EST. 2024', infoFooter2: 'JAKARTA' }, 200, cors);
    }
    return json(parseJsonFields(config), 200, cors);
  }

  if (path === '/api/config' && method === 'PUT') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    stringifyJsonFields(body);
    const sanitized = pickFields(body, TABLE_COLUMNS.shop_config);
    const existing = await DB.prepare('SELECT * FROM shop_config LIMIT 1').first();
    if (existing) {
      if (Object.keys(sanitized).length > 0) {
        const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
        await DB.prepare(`UPDATE shop_config SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), existing.id).run();
      }
      const updated = await DB.prepare('SELECT * FROM shop_config WHERE id = ?').bind(existing.id).first();
      return json(parseJsonFields(updated), 200, cors);
    } else {
      const id = uid();
      sanitized.id = id;
      const cols = Object.keys(sanitized);
      const vals = cols.map(() => '?');
      await DB.prepare(`INSERT INTO shop_config (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
      return json(parseJsonFields(sanitized), 200, cors);
    }
  }

  // ===================================================================
  // ORDERS
  // ===================================================================
  if (path === '/api/orders' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (searchParams.get('status')) {
      sql += ' AND status = ?';
      params.push(searchParams.get('status').toUpperCase());
    }
    if (searchParams.get('excludeStatus')) {
      sql += ' AND status != ?';
      params.push(searchParams.get('excludeStatus').toUpperCase());
    }
    sql += ' ORDER BY createdAt DESC';
    if (searchParams.get('limit')) {
      const l = parseInt(searchParams.get('limit'), 10);
      if (!isNaN(l) && l > 0) {
        sql += ' LIMIT ?';
        params.push(l);
      }
    }
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results.map(parseJsonFields), 200, cors);
  }

  if (path === '/api/orders' && method === 'POST') {
    if (!body.orderNumber) {
      const r = Math.random().toString(36).substring(2, 11).toUpperCase();
      body.orderNumber = `ORD-${r}`;
    }
    const totalPrice = parseFloat(body.totalPrice || body.totalAmount || 0);
    const tax = parseFloat(body.tax || 0);
    body.totalPrice = totalPrice;
    body.tax = tax;
    body.grandTotal = totalPrice + tax;
    body.status = (body.status || 'PENDING').toUpperCase();
    body.createdAt = nowISO();
    body.updatedAt = nowISO();

    const rawItems = Array.isArray(body.items) ? [...body.items] : [];
    stringifyJsonFields(body);

    const sanitized = pickFields(body, TABLE_COLUMNS.orders);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO orders (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();

    // Auto-deduct inventory if created as PREPARING or COMPLETED (e.g. direct Cashier POS checkout)
    if (sanitized.status === 'PREPARING' || sanitized.status === 'COMPLETED') {
      await deductIngredientsForOrder(DB, rawItems);
    }
    // Auto-sync to Finance if COMPLETED
    if (sanitized.status === 'COMPLETED') {
      await syncOrderToFinance(DB, sanitized, user);
    }

    return json(parseJsonFields({ ...sanitized }), 201, cors);
  }

  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401, cors);
      if (body.items) {
        body.totalPrice = body.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        const existing = await DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
        const tax = existing?.tax || 0;
        body.grandTotal = body.totalPrice + tax;
      }
      body.updatedAt = nowISO();
      stringifyJsonFields(body);
      const sanitized = pickFields(body, TABLE_COLUMNS.orders);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE orders SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), orderId).run();
      return json({ message: 'Updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      await DB.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      return json({ message: 'Deleted' }, 200, cors);
    }
  }

  const orderStatusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    if (!user) return error('Unauthorized', 401, cors);
    const orderId = orderStatusMatch[1];
    const status = (searchParams.get('status') || body.status || '').toUpperCase();
    await DB.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').bind(status, nowISO(), orderId).run();

    const order = await DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
    if (order) {
      const parsed = parseJsonFields({ ...order });
      if (status === 'PREPARING' || status === 'COMPLETED') {
        await deductIngredientsForOrder(DB, parsed.items);
      }
      if (status === 'COMPLETED') {
        await syncOrderToFinance(DB, parsed, user);
      }
    }
    return json({ message: 'Status updated' }, 200, cors);
  }

  // ===================================================================
  // POSTS
  // ===================================================================
  if (path === '/api/posts' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM posts ORDER BY createdAt DESC').all();
    return json(results.map(parseJsonFields), 200, cors);
  }

  if (path === '/api/posts/published' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM posts WHERE status = ? ORDER BY publishedAt DESC').bind('PUBLISHED').all();
    return json(results.map(parseJsonFields), 200, cors);
  }

  if (path === '/api/posts' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    if (!body.slug) body.slug = (body.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    if (body.status === 'PUBLISHED') body.publishedAt = nowISO();
    body.createdAt = nowISO();
    body.updatedAt = nowISO();
    stringifyJsonFields(body);

    const sanitized = pickFields(body, TABLE_COLUMNS.posts);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO posts (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(parseJsonFields({ ...sanitized }), 201, cors);
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch) {
    const postId = postMatch[1];
    if (method === 'GET') {
      const doc = await DB.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();
      if (!doc) return error('Not found', 404, cors);
      return json(parseJsonFields(doc), 200, cors);
    }
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      if (body.status === 'PUBLISHED' && !body.publishedAt) body.publishedAt = nowISO();
      body.updatedAt = nowISO();
      stringifyJsonFields(body);

      const sanitized = pickFields(body, TABLE_COLUMNS.posts);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE posts SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), postId).run();
      return json({ message: 'Updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      await DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
      return json({ message: 'Deleted' }, 200, cors);
    }
  }

  // ===================================================================
  // SHIFTS
  // ===================================================================
  if (path === '/api/shifts' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const { results } = await DB.prepare('SELECT * FROM shift_schedules').all();
    return json(results, 200, cors);
  }

  if (path === '/api/shifts' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    const shifts = body.shifts || body;
    if (Array.isArray(shifts)) {
      await DB.prepare('DELETE FROM shift_schedules').run();
      for (const s of shifts) {
        if (!s.employeeId || !s.dayOfWeek || !s.shiftType) continue;
        const id = uid();
        await DB.prepare('INSERT INTO shift_schedules (id, employeeId, employeeName, role, position, dayOfWeek, shiftType) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, s.employeeId, s.employeeName || '', s.role || '', s.position || '', s.dayOfWeek, s.shiftType).run();
      }
    }
    return json({ message: 'Shifts saved' }, 200, cors);
  }

  if (path === '/api/shifts/randomize' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    const { results: employees } = await DB.prepare('SELECT * FROM employees WHERE active = 1').all();

    const byRole = {};
    for (const emp of employees) {
      const r = emp.role?.toUpperCase();
      if (!byRole[r]) byRole[r] = [];
      byRole[r].push(emp);
    }

    const requiredRoles = ['MANAGER', 'BARISTA', 'CASHIER', 'KITCHEN STAFF', 'WAITER'];
    for (const role of requiredRoles) {
      if (!byRole[role] || byRole[role].length === 0) {
        return error(`Tidak ada karyawan aktif dengan role ${role}`, 400, cors);
      }
    }

    const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING'];
    const newShifts = [];

    for (const role of requiredRoles) {
      const emps = byRole[role];
      const usage = new Array(emps.length).fill(0);

      for (const day of DAYS) {
        for (const shiftType of SHIFTS) {
          let minUsage = Infinity;
          let candidates = [];
          for (let i = 0; i < emps.length; i++) {
            if (usage[i] < minUsage) {
              minUsage = usage[i];
              candidates = [i];
            } else if (usage[i] === minUsage) {
              candidates.push(i);
            }
          }
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          usage[pick]++;

          const emp = emps[pick];
          newShifts.push({
            employeeId: emp.employeeId,
            employeeName: emp.name,
            role: emp.role,
            position: emp.position,
            dayOfWeek: day,
            shiftType
          });
        }
      }
    }

    return json(newShifts, 200, cors);
  }

  // ===================================================================
  // TRANSACTIONS
  // ===================================================================
  if (path === '/api/transactions' && method === 'GET') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    if (searchParams.get('type')) {
      sql += ' AND type = ?';
      params.push(searchParams.get('type'));
    }
    sql += ' ORDER BY date DESC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results, 200, cors);
  }

  if (path === '/api/transactions' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    body.date = body.date || nowISO();
    body.employeeId = body.employeeId || user.employeeId || '';
    body.amount = parseFloat(body.amount || 0);
    const sanitized = pickFields(body, TABLE_COLUMNS.transactions);
    if (!sanitized.type || isNaN(sanitized.amount)) {
      return error('Type and valid amount are required', 400, cors);
    }
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO transactions (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(sanitized, 201, cors);
  }

  // ===================================================================
  // INGREDIENTS
  // ===================================================================
  if (path === '/api/ingredients' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const { results } = await DB.prepare('SELECT * FROM ingredients').all();
    return json(results, 200, cors);
  }

  if (path === '/api/ingredients' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager', 'Barista', 'Kitchen Staff'])) return error('Forbidden', 403, cors);
    const sanitized = pickFields(body, TABLE_COLUMNS.ingredients);
    if (!sanitized.name) return error('Ingredient name is required', 400, cors);
    const id = uid();
    sanitized.id = id;
    sanitized.stock = parseFloat(sanitized.stock || sanitized.quantity || 0);
    sanitized.quantity = sanitized.stock;
    sanitized.minStock = parseFloat(sanitized.minStock || sanitized.minThreshold || 0);
    sanitized.minThreshold = sanitized.minStock;
    sanitized.createdAt = nowISO();
    sanitized.updatedAt = nowISO();
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO ingredients (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(sanitized, 201, cors);
  }

  const ingMatch = path.match(/^\/api\/ingredients\/([^/]+)$/);
  if (ingMatch) {
    const ingId = ingMatch[1];
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager', 'Barista', 'Kitchen Staff'])) return error('Forbidden', 403, cors);
      body.updatedAt = nowISO();
      if (body.stock !== undefined) body.quantity = parseFloat(body.stock || 0);
      if (body.quantity !== undefined) body.stock = parseFloat(body.quantity || 0);
      if (body.minStock !== undefined) body.minThreshold = parseFloat(body.minStock || 0);
      if (body.minThreshold !== undefined) body.minStock = parseFloat(body.minThreshold || 0);
      const sanitized = pickFields(body, TABLE_COLUMNS.ingredients);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE ingredients SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), ingId).run();
      return json({ message: 'Updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      await DB.prepare('DELETE FROM ingredients WHERE id = ?').bind(ingId).run();
      return json({ message: 'Deleted' }, 200, cors);
    }
  }

  // ===================================================================
  // ASSETS (Asset Management)
  // ===================================================================
  if (path === '/api/assets' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    let sql = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    const category = searchParams.get('category');
    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }
    const condition = searchParams.get('condition');
    if (condition && condition !== 'All') {
      sql += ' AND condition = ?';
      params.push(condition);
    }
    const status = searchParams.get('status');
    if (status && status !== 'All') {
      sql += ' AND status = ?';
      params.push(status);
    }
    const search = searchParams.get('search');
    if (search) {
      sql += ' AND (name LIKE ? OR assetCode LIKE ? OR location LIKE ? OR serialNumber LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY createdAt DESC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results, 200, cors);
  }

  if (path === '/api/assets' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    if (!body.name) return error('Asset name is required', 400, cors);

    if (!body.assetCode) {
      const catPrefix = (body.category || 'GEN').substring(0, 3).toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      body.assetCode = `AST-${catPrefix}-${randNum}`;
    }

    body.purchasePrice = parseFloat(body.purchasePrice || 0);
    body.condition = (body.condition || 'GOOD').toUpperCase();
    body.status = (body.status || 'ACTIVE').toUpperCase();
    body.createdAt = nowISO();
    body.updatedAt = nowISO();

    const sanitized = pickFields(body, TABLE_COLUMNS.assets);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO assets (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(sanitized, 201, cors);
  }

  const assetMatch = path.match(/^\/api\/assets\/([^/]+)$/);
  if (assetMatch) {
    const assetId = assetMatch[1];
    if (method === 'GET') {
      if (!user) return error('Unauthorized', 401, cors);
      const item = await DB.prepare('SELECT * FROM assets WHERE id = ?').bind(assetId).first();
      if (!item) return error('Asset not found', 404, cors);
      return json(item, 200, cors);
    }
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401, cors);
      if (body.purchasePrice !== undefined) body.purchasePrice = parseFloat(body.purchasePrice || 0);
      if (body.condition) body.condition = body.condition.toUpperCase();
      if (body.status) body.status = body.status.toUpperCase();
      body.updatedAt = nowISO();

      const sanitized = pickFields(body, TABLE_COLUMNS.assets);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE assets SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), assetId).run();
      return json({ message: 'Asset updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
      await DB.prepare('DELETE FROM assets WHERE id = ?').bind(assetId).run();
      return json({ message: 'Asset deleted' }, 200, cors);
    }
  }

  // ===================================================================
  // RECIPES (BOM - Bill of Materials)
  // ===================================================================
  if (path === '/api/recipes' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    let sql = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];
    const menuId = searchParams.get('menuId');
    if (menuId) {
      sql += ' AND menuId = ?';
      params.push(menuId);
    }
    sql += ' ORDER BY createdAt DESC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results, 200, cors);
  }

  if (path === '/api/recipes' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    if (!body.menuId || !body.ingredientId || !body.amount) {
      return error('menuId, ingredientId, and amount are required', 400, cors);
    }
    body.amount = parseFloat(body.amount);
    body.createdAt = nowISO();
    const sanitized = pickFields(body, TABLE_COLUMNS.recipes);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO recipes (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(sanitized, 201, cors);
  }

  const recipeMatch = path.match(/^\/api\/recipes\/([^/]+)$/);
  if (recipeMatch && method === 'DELETE') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    await DB.prepare('DELETE FROM recipes WHERE id = ?').bind(recipeMatch[1]).run();
    return json({ message: 'Recipe deleted' }, 200, cors);
  }

  // ===================================================================
  // NOTES
  // ===================================================================
  if (path === '/api/notes' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const { results } = await DB.prepare('SELECT * FROM notes').all();
    return json(results, 200, cors);
  }

  if (path === '/api/notes/dashboard' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const existing = await DB.prepare('SELECT * FROM notes LIMIT 1').first();
    if (existing) return json(existing, 200, cors);
    const id = uid();
    await DB.prepare('INSERT INTO notes (id, content, lastUpdatedBy, updatedAt) VALUES (?, ?, ?, ?)')
      .bind(id, 'Welcome to Siap Nyafe!', 'system', nowISO()).run();
    return json({ id, content: 'Welcome to Siap Nyafe!', lastUpdatedBy: 'system', updatedAt: nowISO() }, 200, cors);
  }

  if (path === '/api/notes/dashboard' && method === 'POST') {
    if (!user) return error('Unauthorized', 401, cors);
    const existing = await DB.prepare('SELECT * FROM notes LIMIT 1').first();
    const noteData = { content: body.content || '', lastUpdatedBy: user.email || user.name || 'unknown', updatedAt: nowISO() };
    const sanitized = pickFields(noteData, TABLE_COLUMNS.notes);
    if (existing) {
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE notes SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), existing.id).run();
    } else {
      const id = uid();
      sanitized.id = id;
      const cols = Object.keys(sanitized);
      const vals = cols.map(() => '?');
      await DB.prepare(`INSERT INTO notes (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    }
    return json({ message: 'Note saved' }, 200, cors);
  }

  if (path === '/api/notes' && method === 'POST') {
    if (!user) return error('Unauthorized', 401, cors);
    body.lastUpdatedBy = user.email || user.name || 'unknown';
    body.updatedAt = nowISO();
    const sanitized = pickFields(body, TABLE_COLUMNS.notes);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO notes (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json({ id, ...sanitized }, 201, cors);
  }

  const noteMatch = path.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch) {
    const noteId = noteMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401, cors);
      body.updatedAt = nowISO();
      body.lastUpdatedBy = user.email || user.name || 'unknown';
      const sanitized = pickFields(body, TABLE_COLUMNS.notes);
      if (Object.keys(sanitized).length === 0) return error('No valid fields to update', 400, cors);
      const setClauses = Object.keys(sanitized).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE notes SET ${setClauses} WHERE id = ?`).bind(...Object.values(sanitized), noteId).run();
      return json({ message: 'Updated' }, 200, cors);
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401, cors);
      await DB.prepare('DELETE FROM notes WHERE id = ?').bind(noteId).run();
      return json({ message: 'Deleted' }, 200, cors);
    }
  }

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================
  if (path === '/api/notifications' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const { results } = await DB.prepare('SELECT * FROM notifications WHERE read = 0 ORDER BY timestamp DESC LIMIT 50').all();
    return json(results, 200, cors);
  }

  if (path === '/api/notifications' && method === 'POST') {
    body.timestamp = nowISO();
    body.read = 0;
    const sanitized = pickFields(body, TABLE_COLUMNS.notifications);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO notifications (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json({ id, ...sanitized }, 201, cors);
  }

  const notifMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === 'PUT') {
    if (!user) return error('Unauthorized', 401, cors);
    await DB.prepare('UPDATE notifications SET read = 1 WHERE id = ?').bind(notifMatch[1]).run();
    return json({ message: 'Marked as read' }, 200, cors);
  }

  // ===================================================================
  // FEEDBACKS
  // ===================================================================
  if (path === '/api/feedbacks' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM feedbacks ORDER BY timestamp DESC').all();
    return json(results.map(parseJsonFields), 200, cors);
  }

  if (path === '/api/feedbacks' && method === 'POST') {
    const { hour } = getJakartaHoursMinutes();
    const dayOfWeek = getDayOfWeek();
    let shiftType = 'MORNING';
    if (hour >= 15 && hour < 23) shiftType = 'AFTERNOON';
    else if (hour >= 23 || hour < 7) shiftType = 'EVENING';

    const { results: shiftDocs } = await DB.prepare('SELECT * FROM shift_schedules WHERE dayOfWeek = ? AND shiftType = ?').bind(dayOfWeek, shiftType).all();
    body.shiftEmployees = JSON.stringify(shiftDocs.map(s => s.employeeName).filter(Boolean));
    body.timestamp = nowISO();

    const sanitized = pickFields(body, TABLE_COLUMNS.feedbacks);
    const id = uid();
    sanitized.id = id;
    const cols = Object.keys(sanitized);
    const vals = cols.map(() => '?');
    await DB.prepare(`INSERT INTO feedbacks (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(...Object.values(sanitized)).run();
    return json(sanitized, 201, cors);
  }

  const fbMatch = path.match(/^\/api\/feedbacks\/([^/]+)$/);
  if (fbMatch && method === 'DELETE') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403, cors);
    await DB.prepare('DELETE FROM feedbacks WHERE id = ?').bind(fbMatch[1]).run();
    return json({ message: 'Deleted' }, 200, cors);
  }

  // ===================================================================
  // ===================================================================
  // ATTENDANCE
  // ===================================================================
  // ATTENDANCE
  // ===================================================================
  if (path === '/api/attendance' && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    const today = getJakartaDateStr();
    const { totalMin } = getJakartaHoursMinutes();

    // Auto-expire any stale attendance records
    const staleRecords = await DB.prepare(`
      SELECT * FROM attendance_records
      WHERE clockInTime IS NOT NULL AND clockInTime != ''
        AND (clockOutTime IS NULL OR clockOutTime = '')
        AND status NOT IN ('TIDAK ABSEN MASUK', 'TIDAK ABSEN KELUAR')
    `).all();

    for (const r of (staleRecords.results || [])) {
      if (isAttendanceExpired(r, today, totalMin)) {
        await DB.prepare("UPDATE attendance_records SET clockOutTime = '', hoursWorked = NULL, status = 'TIDAK ABSEN KELUAR' WHERE id = ?").bind(r.id).run();
      }
    }

    const { results } = await DB.prepare(`
      SELECT ar.*, e.employeeId, e.name AS employeeName, e.position
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      ORDER BY ar.date DESC, ar.clockInTime DESC
    `).all();
    return json(results, 200, cors);
  }

  const attHistoryMatch = path.match(/^\/api\/attendance\/history\/([^/]+)$/);
  if (attHistoryMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    if (!requireRole(user, ['Manager']) && user.employeeId !== attHistoryMatch[1]) {
      return error('Forbidden', 403, cors);
    }
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(attHistoryMatch[1]).first();
    if (!emp) return error('Not found', 404, cors);
    const { results } = await DB.prepare(`
      SELECT ar.*, e.employeeId, e.name AS employeeName, e.position
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE e.employeeId = ?
      ORDER BY ar.date DESC, ar.clockInTime DESC
    `).bind(attHistoryMatch[1]).all();
    return json(results, 200, cors);
  }

  const attTodayMatch = path.match(/^\/api\/attendance\/today\/([^/]+)$/);
  if (attTodayMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401, cors);
    if (!requireRole(user, ['Manager']) && user.employeeId !== attTodayMatch[1]) {
      return error('Forbidden', 403, cors);
    }
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(attTodayMatch[1]).first();
    if (!emp) return json(null, 200, cors);
    const today = getJakartaDateStr();
    const { totalMin } = getJakartaHoursMinutes();

    let rec = await DB.prepare('SELECT ar.*, e.employeeId, e.name AS employeeName, e.position FROM attendance_records ar JOIN employees e ON ar.employee_id = e.id WHERE ar.employee_id = ? AND ar.date = ?').bind(emp.id, today).first();
    if (!rec) {
      const yesterdayDate = getYesterdayJakartaDateStr();
      const yRec = await DB.prepare('SELECT ar.*, e.employeeId, e.name AS employeeName, e.position FROM attendance_records ar JOIN employees e ON ar.employee_id = e.id WHERE ar.employee_id = ? AND ar.date = ?').bind(emp.id, yesterdayDate).first();
      if (yRec && !yRec.clockOutTime && yRec.status !== 'TIDAK ABSEN MASUK' && yRec.status !== 'TIDAK ABSEN KELUAR') {
        if (isAttendanceExpired(yRec, today, totalMin)) {
          await DB.prepare("UPDATE attendance_records SET clockOutTime = '', hoursWorked = NULL, status = 'TIDAK ABSEN KELUAR' WHERE id = ?").bind(yRec.id).run();
        } else {
          rec = yRec;
        }
      }
    } else {
      if (isAttendanceExpired(rec, today, totalMin)) {
        await DB.prepare("UPDATE attendance_records SET clockOutTime = '', hoursWorked = NULL, status = 'TIDAK ABSEN KELUAR' WHERE id = ?").bind(rec.id).run();
        rec.status = 'TIDAK ABSEN KELUAR';
        rec.clockOutTime = '';
        rec.hoursWorked = null;
      }
    }
    return json(rec || null, 200, cors);
  }

  // ===================================================================
  // ATTENDANCE LOGIC
  // Shift windows:
  //   MORNING:   07:00 - 15:00 (Early in: 06:50, Late: 07:01-09:00, Absent: >09:00, Out: 15:00-17:00)
  //   AFTERNOON: 15:00 - 23:00 (Early in: 14:50, Late: 15:01-17:00, Absent: >17:00, Out: 23:00-01:00)
  //   EVENING:   23:00 - 07:00 (Early in: 22:50, Late: 23:01-01:00, Absent: >01:00, Out: 07:00-09:00)
  // ===================================================================

  if (path === '/api/attendance/clock-in' && method === 'POST') {
    if (!user) return error('Unauthorized', 401, cors);
    const employeeId = body.employeeId || user.employeeId;
    if (!employeeId) return error('employeeId required', 400, cors);
    if (!requireRole(user, ['Manager']) && user.employeeId !== employeeId) {
      return error('Forbidden: You can only clock in for yourself', 403, cors);
    }
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    if (!emp) return error('Employee not found', 404, cors);

    const { totalMin } = getJakartaHoursMinutes();
    let today = getJakartaDateStr();
    let dayOfWeek = getDayOfWeek();
    let scheduledShift = null;

    // Determine target shift date and schedule:
    // If it's early morning (00:00 - 04:00) and employee had an EVENING shift yesterday that was not clocked in:
    if (totalMin < 240) {
      const yesterdayDay = getDayOfWeek(-1);
      const yesterdayDate = getYesterdayJakartaDateStr();
      const yShift = await DB.prepare('SELECT * FROM shift_schedules WHERE employeeId = ? AND dayOfWeek = ? AND shiftType = ?')
        .bind(employeeId, yesterdayDay, 'EVENING').first();
      if (yShift) {
        const yRec = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, yesterdayDate).first();
        if (!yRec) {
          scheduledShift = yShift;
          today = yesterdayDate;
          dayOfWeek = yesterdayDay;
        }
      }
    }

    if (!scheduledShift) {
      scheduledShift = await DB.prepare('SELECT * FROM shift_schedules WHERE employeeId = ? AND dayOfWeek = ?').bind(employeeId, dayOfWeek).first();
    }

    // STRICT SHIFT ADHERENCE
    if (!scheduledShift) {
      return error(`Anda tidak memiliki jadwal shift hari ini (${dayOfWeek}). Silahkan hubungi manager.`, 400, cors);
    }
    if (scheduledShift.shiftType === 'OFF') {
      return error('Hari ini jadwal Anda LIBUR (OFF). Tidak perlu melakukan absensi.', 400, cors);
    }
    if (!['MORNING', 'AFTERNOON', 'EVENING'].includes(scheduledShift.shiftType)) {
      return error(`Jadwal shift Anda tidak valid (${scheduledShift.shiftType}). Silahkan hubungi manager.`, 400, cors);
    }

    const existingToday = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    if (existingToday) return error('Sudah melakukan absensi untuk jadwal hari ini.', 400, cors);

    const shiftType = scheduledShift.shiftType;
    let status = 'ON_TIME';
    let minutesLate = 0;
    let lateAlert = false;
    let clockInTime = nowISO();
    let present = 1;

    if (shiftType === 'MORNING') {
      // 07:00 - 15:00
      if (totalMin < 410) {
        return error('Belum waktu clock in. Shift MORNING dapat clock in mulai pukul 06:50.', 400, cors);
      } else if (totalMin <= 420) {
        status = 'ON_TIME';
        minutesLate = 0;
      } else if (totalMin <= 540) {
        status = 'LATE';
        minutesLate = totalMin - 420;
        lateAlert = true;
      } else {
        status = 'TIDAK ABSEN MASUK';
        minutesLate = totalMin - 420;
        clockInTime = '';
        present = 0;
      }
    } else if (shiftType === 'AFTERNOON') {
      // 15:00 - 23:00
      if (totalMin < 890) {
        return error('Belum waktu clock in. Shift AFTERNOON dapat clock in mulai pukul 14:50.', 400, cors);
      } else if (totalMin <= 900) {
        status = 'ON_TIME';
        minutesLate = 0;
      } else if (totalMin <= 1020) {
        status = 'LATE';
        minutesLate = totalMin - 900;
        lateAlert = true;
      } else {
        status = 'TIDAK ABSEN MASUK';
        minutesLate = totalMin - 900;
        clockInTime = '';
        present = 0;
      }
    } else if (shiftType === 'EVENING') {
      // 23:00 - 07:00
      let effectiveMin = totalMin;
      if (totalMin < 720) {
        effectiveMin = totalMin + 1440;
      }

      if (effectiveMin < 1370) {
        return error('Belum waktu clock in. Shift EVENING dapat clock in mulai pukul 22:50.', 400, cors);
      } else if (effectiveMin <= 1380) {
        status = 'ON_TIME';
        minutesLate = 0;
      } else if (effectiveMin <= 1500) {
        status = 'LATE';
        minutesLate = effectiveMin - 1380;
        lateAlert = true;
      } else {
        status = 'TIDAK ABSEN MASUK';
        minutesLate = effectiveMin - 1380;
        clockInTime = '';
        present = 0;
      }
    }

    const id = uid();
    await DB.prepare(
      'INSERT INTO attendance_records (id, employee_id, employeeName, date, present, clockInTime, shiftType, status, minutesLate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, emp.id, emp.name, today, present, clockInTime, shiftType, status, minutesLate, '').run();

    const record = { id, employee_id: emp.id, employeeId: emp.employeeId, employeeName: emp.name, date: today, present, clockInTime, shiftType, status, minutesLate, lateAlert };
    return json({
      message: status === 'TIDAK ABSEN MASUK'
        ? 'Anda melewati batas clock in lebih dari 2 jam. Status dicatat sebagai TIDAK ABSEN MASUK.'
        : status === 'LATE'
        ? `Clock in berhasil. Anda tercatat TERLAMBAT ${minutesLate} menit.`
        : 'Clock in berhasil (TEPAT WAKTU).',
      record
    }, 200, cors);
  }

  if (path === '/api/attendance/clock-out' && method === 'POST') {
    if (!user) return error('Unauthorized', 401, cors);
    const employeeId = body.employeeId || user.employeeId;
    if (!employeeId) return error('employeeId required', 400, cors);
    if (!requireRole(user, ['Manager']) && user.employeeId !== employeeId) {
      return error('Forbidden: You can only clock out for yourself', 403, cors);
    }
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    if (!emp) return error('Employee not found', 404, cors);

    const { totalMin } = getJakartaHoursMinutes();
    const today = getJakartaDateStr();

    let record = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    if (!record || record.clockOutTime) {
      const yesterdayDate = getYesterdayJakartaDateStr();
      const yRecord = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, yesterdayDate).first();
      if (yRecord && !yRecord.clockOutTime && yRecord.status !== 'TIDAK ABSEN MASUK' && yRecord.status !== 'TIDAK ABSEN KELUAR') {
        record = yRecord;
      }
    }

    if (!record) return error('Tidak ditemukan catatan clock in aktif.', 400, cors);
    if (record.status === 'TIDAK ABSEN MASUK' || !record.clockInTime) {
      return error('Anda tercatat TIDAK ABSEN MASUK, tidak dapat melakukan clock out. Silahkan hubungi manager.', 400, cors);
    }
    if (record.clockOutTime) return error('Sudah melakukan clock out sebelumnya.', 400, cors);

    const shiftType = record.shiftType;
    const recDate = record.date;

    // Check expiration (> 2 hours after shift end)
    if (isAttendanceExpired(record, today, totalMin)) {
      await DB.prepare("UPDATE attendance_records SET clockOutTime = '', hoursWorked = NULL, status = 'TIDAK ABSEN KELUAR' WHERE id = ?").bind(record.id).run();
      return json({
        message: 'Waktu clock out telah melewati batas (lebih dari 2 jam setelah shift berakhir). Status dicatat sebagai TIDAK ABSEN KELUAR.',
        record: { ...record, clockOutTime: '', hoursWorked: null, status: 'TIDAK ABSEN KELUAR' }
      }, 200, cors);
    }

    // Check too early clock out:
    if (shiftType === 'MORNING') {
      // 07:00 - 15:00
      if (today === recDate && totalMin < 900) {
        return error('Belum waktu clock out. Shift MORNING selesai pukul 15:00.', 400, cors);
      }
    } else if (shiftType === 'AFTERNOON') {
      // 15:00 - 23:00
      if (today === recDate && totalMin < 1380) {
        return error('Belum waktu clock out. Shift AFTERNOON selesai pukul 23:00.', 400, cors);
      }
    } else if (shiftType === 'EVENING') {
      // 23:00 - 07:00 next day
      if (today === recDate) {
        return error('Belum waktu clock out. Shift EVENING selesai pukul 07:00 besok pagi.', 400, cors);
      }
      if (today === addDaysToDateStr(recDate, 1) && totalMin < 420) {
        return error('Belum waktu clock out. Shift EVENING selesai pukul 07:00.', 400, cors);
      }
    }

    // Success clock-out: calculate hours worked
    const clockIn = record.clockInTime;
    let hoursWorked = null;
    if (clockIn) {
      const diffMs = Date.now() - new Date(clockIn).getTime();
      hoursWorked = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    }
    const outTime = nowISO();
    await DB.prepare('UPDATE attendance_records SET clockOutTime = ?, hoursWorked = ? WHERE id = ?')
      .bind(outTime, hoursWorked, record.id).run();

    return json({ message: 'Clocked out', record: { ...record, clockOutTime: outTime, hoursWorked } }, 200, cors);
  }

  // ===================================================================
  // IMAGE UPLOAD (R2)
  // ===================================================================
  if (path === '/api/uploads' && method === 'POST') {
    if (!user) return error('Unauthorized', 401, cors);

    let fileArrayBuffer = null;
    let fileMime = '';
    let fileName = '';
    let oldFileId = '';

    try {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'oldFile' && typeof value === 'string') {
          oldFileId = value;
        }
        if (value instanceof File) {
          fileArrayBuffer = await value.arrayBuffer();
          fileMime = value.type;
          fileName = value.name;
        }
      }
    } catch { /* not multipart */ }

    if (!oldFileId && body.oldFile) {
      oldFileId = body.oldFile;
    }

    if (!fileArrayBuffer) return error('No file uploaded', 400, cors);

    // Delete old image from R2 and DB
    if (oldFileId) {
      const cleanId = oldFileId.replace(/^\/api\/images\//, '');
      try {
        const oldImg = await DB.prepare('SELECT * FROM images WHERE id = ?').bind(cleanId).first();
        if (oldImg && oldImg.r2Key) {
          await env.IMAGES.delete(oldImg.r2Key);
        }
        await DB.prepare('DELETE FROM images WHERE id = ?').bind(cleanId).run();
      } catch { /* ignore */ }
    }

    const id = uid();
    const r2Key = `${id}-${fileName || 'upload'}`;
    await env.IMAGES.put(r2Key, fileArrayBuffer, {
      httpMetadata: { contentType: fileMime || 'image/webp' },
    });

    await DB.prepare('INSERT INTO images (id, filename, mimetype, originalName, size, r2Key) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, fileName || 'upload', fileMime || 'image/webp', fileName || 'upload', fileArrayBuffer.byteLength, r2Key).run();

    return json({ url: `/api/images/${id}` }, 201, cors);
  }

  // ===================================================================
  // SERVE IMAGE (from R2)
  // ===================================================================
  const imageMatch = path.match(/^\/api\/images\/([^/]+)$/);
  if (imageMatch && method === 'GET') {
    const imageId = imageMatch[1];
    const img = await DB.prepare('SELECT * FROM images WHERE id = ?').bind(imageId).first();
    if (!img || !img.r2Key) return placeholderImage();

    const obj = await env.IMAGES.get(img.r2Key);
    if (!obj) return placeholderImage();

    const blob = await obj.blob();
    return new Response(blob, {
      headers: {
        'Content-Type': img.mimetype || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // ===================================================================
  // SEEDER
  // ===================================================================
  if (path === '/api/seed' && method === 'POST') {
    const { secret } = body;
    if (!env.SEED_SECRET || secret !== env.SEED_SECRET) return error('Invalid secret', 401);

    const existing = await DB.prepare('SELECT * FROM employees LIMIT 1').first();
    if (existing) return error('Database already seeded', 400);

    async function seedEmp(employeeId, email, password, name, phone, position, salary, role) {
      const id = uid();
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      await DB.prepare(
        'INSERT INTO employees (id, employeeId, email, password, name, phone, position, salary, role, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, employeeId, email, hash, name, phone, position, salary, role, 1).run();
    }

    await seedEmp('EMP-MAN-001', 'manager@americano.com', 'manager123', 'Andi Manager', '08123456781', 'Manager', 5000000, 'Manager');
    await seedEmp('EMP-MAN-002', 'manager2@americano.com', 'manager123', 'Siti Manager', '08123456782', 'Manager', 5000000, 'Manager');
    await seedEmp('EMP-BAR-001', 'barista1@americano.com', 'barista123', 'Budi Barista', '08123456783', 'Barista', 3000000, 'Barista');
    await seedEmp('EMP-BAR-002', 'barista2@americano.com', 'barista123', 'Rina Barista', '08123456784', 'Barista', 3000000, 'Barista');
    await seedEmp('EMP-BAR-003', 'barista3@americano.com', 'barista123', 'Dedi Barista', '08123456785', 'Barista', 3000000, 'Barista');
    await seedEmp('EMP-CSH-001', 'cashier1@americano.com', 'cashier123', 'Rini Cashier', '08123456786', 'Cashier', 3000000, 'Cashier');
    await seedEmp('EMP-CSH-002', 'cashier2@americano.com', 'cashier123', 'Tono Cashier', '08123456787', 'Cashier', 3000000, 'Cashier');
    await seedEmp('EMP-CSH-003', 'cashier3@americano.com', 'cashier123', 'Dewi Cashier', '08123456788', 'Cashier', 3000000, 'Cashier');
    await seedEmp('EMP-KIT-001', 'kitchen1@americano.com', 'kitchen123', 'Joko Kitchen', '08123456789', 'Kitchen Staff', 3500000, 'Kitchen Staff');
    await seedEmp('EMP-KIT-002', 'kitchen2@americano.com', 'kitchen123', 'Wati Kitchen', '08123456790', 'Kitchen Staff', 3500000, 'Kitchen Staff');
    await seedEmp('EMP-KIT-003', 'kitchen3@americano.com', 'kitchen123', 'Agus Kitchen', '08123456791', 'Kitchen Staff', 3500000, 'Kitchen Staff');
    await seedEmp('EMP-WAI-001', 'waiter1@americano.com', 'waiter123', 'Sari Waiter', '08123456792', 'Waiter', 2500000, 'Waiter');
    await seedEmp('EMP-WAI-002', 'waiter2@americano.com', 'waiter123', 'Ahmad Waiter', '08123456793', 'Waiter', 2500000, 'Waiter');
    await seedEmp('EMP-WAI-003', 'waiter3@americano.com', 'waiter123', 'Maya Waiter', '08123456794', 'Waiter', 2500000, 'Waiter');

    const configId = uid();
    const defaultGallery = JSON.stringify([
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80'
    ]);
    await DB.prepare(
      'INSERT INTO shop_config (id, shopName, websiteTitle, faviconUrl, address, phoneNumber, marqueeText, heroImageUrl, badgeText1, badgeText2, galleryImages, infoTitle, infoContent, infoFooter1, infoFooter2, techSpec1, techSpec2, techSpec3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(configId, 'Siap Nyafe', 'Siap Nyafe - Excellent Coffee', 'https://cdn-icons-png.flaticon.com/512/924/924514.png', 'Jakarta, Indonesia', '021-12345678', 'Welcome to Siap Nyafe Coffee Shop!',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80', 'EST 2024', 'JAKARTA', defaultGallery, 'Our Story', 'Born in Jakarta, brewed for the bold.', 'EST. 2024', 'JAKARTA',
      '// EST 2024', '// JKT_ID', '// V.1.0'
    ).run();

    const categories = ['Coffee', 'Non-Coffee', 'Featured', 'Snack', 'Food'];
    for (const cat of categories) {
      await DB.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').bind(uid(), cat).run();
    }

    return json({ message: 'Database seeded with 14 employees. Example logins: EMP-MAN-001 / manager123, EMP-BAR-001 / barista123, EMP-CSH-001 / cashier123, EMP-KIT-001 / kitchen123, EMP-WAI-001 / waiter123' }, 200, cors);
  }

  if (path === '/api/seed-content' && method === 'POST') {
    const isManager = user && requireRole(user, ['Manager']);
    const isSecretValid = (body.secret && (body.secret === env.SEED_SECRET || body.secret === 'siap-nyafe-seed-2026'));
    if (!isManager && !isSecretValid) return error('Unauthorized', 401, cors);

    const now = nowISO();

    const menus = [
      { name: 'Espresso', category: 'Coffee', price: 25000, description: 'Single shot espresso murni dengan rasa kuat dan aroma khas.', imageUrl: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&auto=format&fit=crop&q=80' },
      { name: 'Double Espresso', category: 'Coffee', price: 35000, description: 'Double shot espresso untuk sensasi kafein yang lebih intens.', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Americano', category: 'Coffee', price: 30000, description: 'Espresso dengan tambahan air panas, ringan dan nikmat.', imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600&auto=format&fit=crop&q=80' },
      { name: 'Long Black', category: 'Coffee', price: 32000, description: 'Americano dengan crema yang lebih tebal.', imageUrl: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cappuccino', category: 'Coffee', price: 38000, description: 'Espresso dengan steamed milk dan foam susu yang lembut.', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cafe Latte', category: 'Coffee', price: 38000, description: 'Espresso dengan susu steam yang creamy dan sedikit foam.', imageUrl: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop&q=80' },
      { name: 'Flat White', category: 'Coffee', price: 40000, description: 'Double espresso dengan microfoam susu yang velvety.', imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80' },
      { name: 'Mocha', category: 'Coffee', price: 42000, description: 'Perpaduan espresso, coklat, dan steamed milk.', imageUrl: 'https://images.unsplash.com/photo-1607681086579-29dec44e6ef2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Caramel Macchiato', category: 'Coffee', price: 45000, description: 'Layered vanilla latte dengan drizzle karamel di atasnya.', imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&auto=format&fit=crop&q=80' },
      { name: 'Vanilla Latte', category: 'Coffee', price: 42000, description: 'Classic latte dengan sentuhan vanilla syrup.', imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80' },
      { name: 'Hazelnut Latte', category: 'Coffee', price: 42000, description: 'Latte dengan hazelnut syrup yang manis dan harum.', imageUrl: 'https://images.unsplash.com/photo-1529892485617-25f63cd7b1e9?w=600&auto=format&fit=crop&q=80' },
      { name: 'Affogato', category: 'Coffee', price: 40000, description: 'Scoop es krim vanilla disiram espresso panas.', imageUrl: 'https://images.unsplash.com/photo-1592663527359-cf6642f54cff?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cold Brew', category: 'Coffee', price: 35000, description: 'Kopi seduh dingin 12 jam, smooth dan rendah asam.', imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nitro Cold Brew', category: 'Coffee', price: 42000, description: 'Cold brew dengan infus nitrogen, tekstur creamy dan creamy head.', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&auto=format&fit=crop&q=80' },
      { name: 'Iced Latte', category: 'Coffee', price: 36000, description: 'Latte segar dengan es batu.', imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80' },
      { name: 'Iced Mocha', category: 'Coffee', price: 40000, description: 'Mocha dingin dengan es batu.', imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?w=600&auto=format&fit=crop&q=80' },
      { name: 'Iced Caramel Macchiato', category: 'Coffee', price: 43000, description: 'Caramel macchiato versi dingin.', imageUrl: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=600&auto=format&fit=crop&q=80' },
      { name: 'Espresso Con Panna', category: 'Coffee', price: 30000, description: 'Espresso dengan whipped cream di atasnya.', imageUrl: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cortado', category: 'Coffee', price: 32000, description: 'Espresso dengan sedikit susu hangat, rasanya seimbang.', imageUrl: 'https://images.unsplash.com/photo-1585494156145-1c60a4fe9d2b?w=600&auto=format&fit=crop&q=80' },
      { name: 'Piccolo Latte', category: 'Coffee', price: 30000, description: 'Small latte dengan rasa espresso yang kuat.', imageUrl: 'https://images.unsplash.com/photo-1572286258217-40142c1c6a70?w=600&auto=format&fit=crop&q=80' },
      { name: 'Irish Coffee', category: 'Coffee', price: 50000, description: 'Kopi hitam dengan Irish whiskey dan whipped cream.', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cafe Bombon', category: 'Coffee', price: 35000, description: 'Espresso dengan susu kental manis, khas Spanyol.', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80' },
      { name: 'Kopi Susu Gula Aren', category: 'Coffee', price: 35000, description: 'Kopi susu kekinian dengan gula aren asli.', imageUrl: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&auto=format&fit=crop&q=80' },
      { name: 'Kopi Hitam', category: 'Coffee', price: 20000, description: 'Kopi hitam tradisional Indonesia pilihan.', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Vietnamese Drip', category: 'Coffee', price: 35000, description: 'Kopi Vietnam slow drip dengan susu kental manis.', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80' },
      { name: 'Matcha Latte', category: 'Non-Coffee', price: 40000, description: 'Matcha bubuk premium dengan steamed milk.', imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop&q=80' },
      { name: 'Taro Latte', category: 'Non-Coffee', price: 38000, description: 'Minuman taro creamy dengan aroma vanilla.', imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chocolate', category: 'Non-Coffee', price: 35000, description: 'Segelas coklat panas creamy dan menghangatkan.', imageUrl: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&auto=format&fit=crop&q=80' },
      { name: 'White Chocolate Mocha', category: 'Non-Coffee', price: 42000, description: 'White chocolate dan susu steam, manis dan lembut.', imageUrl: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Strawberry Latte', category: 'Non-Coffee', price: 38000, description: 'Fresh strawberry puree dengan susu.', imageUrl: 'https://images.unsplash.com/photo-1553787499-6f9133860278?w=600&auto=format&fit=crop&q=80' },
      { name: 'Blue Latte', category: 'Non-Coffee', price: 40000, description: 'Minuman bunga telang biru yang cantik dan menenangkan.', imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600&auto=format&fit=crop&q=80' },
      { name: 'Red Velvet Latte', category: 'Non-Coffee', price: 40000, description: 'Red velvet dengan susu steam, manis dan creamy.', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop&q=80' },
      { name: 'Japanese Tea', category: 'Non-Coffee', price: 25000, description: 'Green tea Jepang premium.', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
      { name: 'Earl Grey', category: 'Non-Coffee', price: 25000, description: 'Teh Earl Grey dengan aroma bergamot klasik.', imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chamomile Tea', category: 'Non-Coffee', price: 25000, description: 'Teh chamomile menenangkan, tanpa kafein.', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80' },
      { name: 'Lemon Tea', category: 'Non-Coffee', price: 20000, description: 'Teh hitam dengan perasan lemon segar.', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80' },
      { name: 'Fresh Orange Juice', category: 'Non-Coffee', price: 28000, description: 'Jus jeruk segar tanpa gula tambahan.', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80' },
      { name: 'Mango Smoothie', category: 'Non-Coffee', price: 32000, description: 'Smoothie mangga segar dengan yogurt.', imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&auto=format&fit=crop&q=80' },
      { name: 'Strawberry Smoothie', category: 'Non-Coffee', price: 32000, description: 'Smoothie stroberi segar dengan yogurt.', imageUrl: 'https://images.unsplash.com/photo-1628557044797-f21a177c37ec?w=600&auto=format&fit=crop&q=80' },
      { name: 'Mineral Water', category: 'Non-Coffee', price: 10000, description: 'Air mineral berkualitas.', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Soda', category: 'Non-Coffee', price: 15000, description: 'Minuman soda pilihan.', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' },
      { name: 'Croissant', category: 'Snack', price: 25000, description: 'Croissant klasik Prancis, buttery dan flaky.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80' },
      { name: 'Butter Croissant', category: 'Snack', price: 28000, description: 'Croissant dengan lapisan mentega ekstra.', imageUrl: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Almond Croissant', category: 'Snack', price: 32000, description: 'Croissant isi almond paste dan topping almond slice.', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80' },
      { name: 'Banana Bread', category: 'Snack', price: 20000, description: 'Roti pisang homemade, moist dan penuh rasa.', imageUrl: 'https://images.unsplash.com/photo-1605698802004-9844a4fa8572?w=600&auto=format&fit=crop&q=80' },
      { name: 'Blueberry Muffin', category: 'Snack', price: 22000, description: 'Muffin blueberry dengan topping streusel.', imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chocolate Muffin', category: 'Snack', price: 22000, description: 'Muffin coklat fudge yang rich dan moist.', imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&auto=format&fit=crop&q=80' },
      { name: 'Cheesecake', category: 'Snack', price: 35000, description: 'New York style cheesecake creamy dengan base graham.', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80' },
      { name: 'Tiramisu', category: 'Snack', price: 38000, description: 'Classic Italian tiramisu dengan mascarpone.', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80' },
      { name: 'Black Forest Cake', category: 'Snack', price: 35000, description: 'Cake coklat dengan cherry dan whipped cream.', imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80' },
      { name: 'Carrot Cake', category: 'Snack', price: 32000, description: 'Carrot cake dengan cream cheese frosting.', imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80' },
      { name: 'French Fries', category: 'Food', price: 25000, description: 'Kentang goreng crispy dengan saus pilihan.', imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nachos', category: 'Food', price: 35000, description: 'Nachos dengan keju leleh, salsa, dan sour cream.', imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80' },
      { name: 'Chicken Wings', category: 'Food', price: 40000, description: 'Sayap ayam goreng dengan saus BBQ pedas.', imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80' },
      { name: 'Sandwich', category: 'Food', price: 35000, description: 'Sandwich roti gandum dengan isian ayam dan sayur segar.', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80' },
      { name: 'Toast', category: 'Food', price: 25000, description: 'Roti panggang dengan butter dan selai.', imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=600&auto=format&fit=crop&q=80' },
      { name: 'Pasta Carbonara', category: 'Food', price: 45000, description: 'Fettuccine carbonara creamy dengan bacon dan parmesan.', imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&auto=format&fit=crop&q=80' },
      { name: 'Pasta Aglio Olio', category: 'Food', price: 42000, description: 'Spaghetti aglio olio dengan bawang putih dan cabai.', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80' },
      { name: 'Nasi Goreng', category: 'Food', price: 40000, description: 'Nasi goreng kampung dengan telur dan kerupuk.', imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80' },
      { name: 'Mie Goreng', category: 'Food', price: 35000, description: 'Mie goreng jawa dengan sayuran dan telur.', imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80' },
      { name: 'Pisang Goreng', category: 'Food', price: 20000, description: 'Pisang goreng crispy dengan topping coklat dan keju.', imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80' },
    ];

    for (const m of menus) {
      const existingMenu = await DB.prepare('SELECT id FROM menus WHERE name = ?').bind(m.name).first();
      if (existingMenu) {
        await DB.prepare(
          'UPDATE menus SET category = ?, price = ?, description = ?, imageUrl = ?, updatedAt = ? WHERE id = ?'
        ).bind(m.category, m.price, m.description, m.imageUrl, now, existingMenu.id).run();
      } else {
        await DB.prepare(
          'INSERT INTO menus (id, name, category, price, description, imageUrl, available, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)'
        ).bind(uid(), m.name, m.category, m.price, m.description, m.imageUrl, now, now).run();
      }
    }

    const posts = [
      { title: 'Grand Opening Siap Nyafe Coffee', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Akhirnya Siap Nyafe Coffee resmi hadir di Jakarta!', content: 'Kami dengan bangga mengumumkan pembukaan Siap Nyafe Coffee di pusat kota Jakarta. Hadir dengan konsep modern industrial yang nyaman, kami menyajikan berbagai pilihan kopi berkualitas dari biji kopi pilihan petani lokal Indonesia. Mulai dari espresso klasik hingga minuman kopi kekinian seperti Kopi Susu Gula Aren dan Cold Brew. Dukung terus kopi lokal Indonesia!', featuredImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-15T08:00' },
      { title: 'Welcome to the Family: Our Story', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Cerita di balik lahirnya Siap Nyafe Coffee.', content: 'Berawal dari kecintaan terhadap kopi Nusantara, kami mendirikan Siap Nyafe Coffee dengan misi memperkenalkan cita rasa kopi Indonesia ke seluruh dunia. Setiap cangkir yang kami sajikan adalah hasil seleksi ketat dari petani kopi terbaik di Sumatera, Jawa, Bali, dan Sulawesi. Kami percaya bahwa secangkir kopi yang baik bisa membawa kebahagiaan dan menyatukan orang-orang.', featuredImage: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-15T09:00' },
      { title: 'Meet Our Barista Team', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Kenalan dengan para barista handal Siap Nyafe.', content: 'Tim barista kami adalah para profesional yang telah terlatih dan bersertifikat. Mereka tidak hanya ahli dalam meracik kopi, tetapi juga passionate dalam memberikan pengalaman terbaik bagi setiap pelanggan. Dari latte art yang indah hingga rekomendasi kopi yang tepat sesuai selera Anda, barista kami siap melayani.', featuredImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-20T10:00' },
      { title: 'The Art of Latte Art', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Belajar seni latte art dari barista profesional.', content: 'Latte art bukan sekadar hiasan di atas kopi, tetapi sebuah bentuk seni yang membutuhkan keahlian dan latihan. Barista kami telah menguasai berbagai teknik pouring untuk menciptakan rosetta, tulip, swan, dan berbagai motif lainnya. Setiap cangkir latte art adalah karya seni yang unik untuk Anda!', featuredImage: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-25T11:00' },
      { title: 'Kopi Indonesia: Dari Petani ke Cangkir', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Perjalanan biji kopi dari kebun hingga ke cangkir Anda.', content: 'Indonesia adalah salah satu penghasil kopi terbaik di dunia. Kopi Gayo dari Aceh dengan karakter earthy dan spicy, Kopi Java dengan body yang smooth dan hints of chocolate, serta Kopi Toraja dengan kompleksitas rasa yang kaya. Di Siap Nyafe, kami bangga menyajikan kopi-kopi terbaik Nusantara dengan metode seduh yang tepat.', featuredImage: 'https://images.unsplash.com/photo-1524350876685-274059332603?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-01T08:00' },
      { title: 'New Cold Brew Arrival', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Cold brew baru dengan rasa lebih smooth!', content: 'Kami menghadirkan Cold Brew baru yang diseduh selama 12 jam untuk menghasilkan rasa yang lebih smooth, rendah asam, dan full-bodied. Tersedia juga Nitro Cold Brew dengan tekstur creamy berkat infus nitrogen. Nikmati kesegaran Cold Brew di hari yang panas!', featuredImage: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-05T09:00' },
      { title: 'Buy 1 Get 1 Every Monday', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Senin ceria dengan promo Buy 1 Get 1 untuk semua minuman.', content: 'Setiap hari Senin, kami memberikan promo spesial Buy 1 Get 1 untuk semua menu minuman. Ajak teman atau kolega Anda dan nikmati kopi favorit berdua dengan harga yang lebih hemat. Promo berlaku sepanjang hari untuk dine-in maupun takeaway. Syarat dan ketentuan berlaku.', featuredImage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-10T10:00' },
      { title: 'Happy Hour 3-5 PM', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Diskon 20% untuk semua menu setiap jam 3-5 sore!', content: 'Butuh penyemangat di sore hari? Nikmati Happy Hour setiap hari pukul 15.00 - 17.00 dengan diskon 20% untuk semua menu minuman. Cocok untuk melepas penat setelah seharian beraktivitas. Jangan lewatkan promo spesial ini!', featuredImage: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-12T14:00' },
      { title: 'Weekly Special: New Menu Launch', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Coba menu-menu baru kami yang lebih variatif!', content: 'Setiap minggu kami menghadirkan menu spesial baru yang siap memanjakan lidah Anda. Mulai dari minuman seasonal hingga makanan ringan pendamping kopi. Follow Instagram kami untuk update menu spesial minggu ini!', featuredImage: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-15T08:00' },
      { title: 'Student Discount 15%', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Pelajar dan mahasiswa dapat diskon 15% setiap hari.', content: 'Tunjukkan kartu pelajar atau mahasiswa Anda dan dapatkan diskon 15% untuk semua pembelian. Kami ingin mendukung generasi muda Indonesia untuk lebih produktif dengan secangkir kopi berkualitas. Promo berlaku setiap hari selama jam operasional.', featuredImage: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-18T09:00' },
      { title: 'New Menu: Healthy Options', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Menu sehat baru untuk gaya hidup sadar kesehatan.', content: 'Kini hadir pilihan menu sehat untuk Anda yang peduli dengan kesehatan. Smoothie bowl dengan buah segar, oatmeal latte, serta minuman rendah kalori. Nikmati kopi favorit Anda tanpa rasa bersalah! Tersedia juga opsi susu alternatif seperti oat milk, almond milk, dan soy milk.', featuredImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-20T10:00' },
      { title: 'Live Music Every Friday', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Nikmati live music setiap Jumat malam di Siap Nyafe.', content: 'Setiap hari Jumat pukul 19.00 - 21.00, kami menghadirkan live music dengan berbagai genre musik akustik. Nikmati kopi favorit Anda ditemani alunan musik yang menenangkan. Bawa teman dan keluarga untuk pengalaman ngopi yang lebih berkesan!', featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-18T10:00' },
      { title: 'Coffee Brewing Workshop', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Belajar teknik brewing kopi yang benar.', content: 'Ikuti workshop brewing kopi kami setiap hari Sabtu pukul 10.00 - 12.00. Pelajari berbagai metode brewing mulai dari V60, Aeropress, French Press, hingga Cold Brew. Cocok untuk pemula hingga enthusiast yang ingin memperdalam ilmu kopi. Biaya pendaftaran Rp 100.000 termasuk alat dan bahan.', featuredImage: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800&auto=format&fit=crop&q=80', createdAt: '2026-06-22T10:00' },
      { title: 'Open Mic Night', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Tunjukkan bakat Anda di panggung open mic!', content: 'Setiap hari Rabu malam, Siap Nyafe menjadi tempat bagi para kreator untuk mengekspresikan diri melalui open mic. Puisi, komedi, musik, storytelling — semua boleh tampil! Daftarkan diri Anda di kasir atau melalui Instagram kami. Tiket masuk gratis dengan minimum pemesanan satu minuman.', featuredImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-08T10:00' },
      { title: 'Year-End Celebration', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Rayakan akhir tahun bersama Siap Nyafe!', content: 'Mari rayakan akhir tahun bersama Siap Nyafe Coffee! Akan ada live music spesial, games berhadiah, dan menu spesial akhir tahun. Datang dan nikmati momen kebersamaan di penghujung tahun. Reserve tempat Anda sekarang karena kapasitas terbatas!', featuredImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-15T12:00' },
      { title: 'Barista Competition 2026', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Ikuti kompetisi barista antar kafe se-Jakarta!', content: 'Siap Nyafe menjadi tuan rumah kompetisi barista antar kafe se-Jakarta. Adu skill latte art, brewing, dan speed challenge Anda. Hadiah utamaRp 5.000.000 + trophy. Pendaftaran dibuka sampai 31 Juli 2026. Hubungi kami untuk informasi lebih lanjut.', featuredImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80', createdAt: '2026-07-18T10:00' },
    ];

    for (const p of posts) {
      const existingPost = await DB.prepare('SELECT id FROM posts WHERE title = ?').bind(p.title).first();
      if (existingPost) {
        await DB.prepare(
          'UPDATE posts SET category = ?, status = ?, excerpt = ?, content = ?, featuredImage = ?, updatedAt = ? WHERE id = ?'
        ).bind(p.category, p.status, p.excerpt, p.content, p.featuredImage, now, existingPost.id).run();
      } else {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        await DB.prepare(
          'INSERT INTO posts (id, title, slug, content, excerpt, category, status, featuredImage, publishedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(uid(), p.title, slug, p.content, p.excerpt, p.category, p.status, p.featuredImage, p.status === 'PUBLISHED' ? now : null, p.createdAt, now).run();
      }
    }

    // Seed/update website config
    const galleryImagesArr = [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&auto=format&fit=crop&q=80'
    ];
    const heroImg = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80';
    const favIcon = 'https://cdn-icons-png.flaticon.com/512/924/924514.png';
    const existingConfig = await DB.prepare('SELECT id FROM shop_config LIMIT 1').first();
    if (existingConfig) {
      await DB.prepare('UPDATE shop_config SET heroImageUrl = ?, faviconUrl = ?, galleryImages = ? WHERE id = ?')
        .bind(heroImg, favIcon, JSON.stringify(galleryImagesArr), existingConfig.id).run();
    } else {
      await DB.prepare(
        'INSERT INTO shop_config (id, shopName, websiteTitle, faviconUrl, address, phoneNumber, marqueeText, heroImageUrl, badgeText1, badgeText2, galleryImages, infoTitle, infoContent, infoFooter1, infoFooter2, techSpec1, techSpec2, techSpec3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(uid(), 'Siap Nyafe', 'Siap Nyafe - Excellent Coffee', favIcon, 'Jakarta, Indonesia', '021-12345678', 'Welcome to Siap Nyafe Coffee Shop!', heroImg, 'EST 2024', 'JAKARTA', JSON.stringify(galleryImagesArr), 'Our Story', 'Born in Jakarta, brewed for the bold.', 'EST. 2024', 'JAKARTA', '// EST 2024', '// JKT_ID', '// V.1.0').run();
    }

    // Seed initial ingredients if none exist
    const existingIng = await DB.prepare('SELECT id FROM ingredients LIMIT 1').first();
    if (!existingIng) {
      const defaultIngredients = [
        { name: 'Espresso Beans', category: 'Coffee', stock: 15000, quantity: 15000, unit: 'g', minStock: 2500, minThreshold: 2500, price: 250000, supplier: 'Koperasi Kopi Gayo' },
        { name: 'Fresh Milk', category: 'Dairy', stock: 25000, quantity: 25000, unit: 'ml', minStock: 5000, minThreshold: 5000, price: 22000, supplier: 'Greenfields' },
        { name: 'Oat Milk', category: 'Dairy Alternative', stock: 12000, quantity: 12000, unit: 'ml', minStock: 2000, minThreshold: 2000, price: 42000, supplier: 'Oatside' },
        { name: 'Gula Aren Cair', category: 'Sweetener', stock: 8000, quantity: 8000, unit: 'ml', minStock: 1500, minThreshold: 1500, price: 35000, supplier: 'Gula Nusantara' },
        { name: 'Chocolate Powder', category: 'Powder', stock: 5000, quantity: 5000, unit: 'g', minStock: 800, minThreshold: 800, price: 120000, supplier: 'Van Houten' },
        { name: 'Matcha Powder', category: 'Powder', stock: 3000, quantity: 3000, unit: 'g', minStock: 500, minThreshold: 500, price: 180000, supplier: 'Uji Kyoto' },
        { name: 'Caramel Syrup', category: 'Syrup', stock: 3000, quantity: 3000, unit: 'ml', minStock: 600, minThreshold: 600, price: 85000, supplier: 'Monin' },
        { name: 'Vanilla Syrup', category: 'Syrup', stock: 3000, quantity: 3000, unit: 'ml', minStock: 600, minThreshold: 600, price: 85000, supplier: 'Monin' },
        { name: 'Paper Cup 12oz', category: 'Packaging', stock: 500, quantity: 500, unit: 'pcs', minStock: 100, minThreshold: 100, price: 800, supplier: 'Packindo' },
        { name: 'Frozen French Fries', category: 'Food', stock: 12000, quantity: 12000, unit: 'g', minStock: 2500, minThreshold: 2500, price: 35000, supplier: 'Aviko' },
      ];
      for (const ing of defaultIngredients) {
        await DB.prepare('INSERT INTO ingredients (id, name, category, stock, quantity, unit, minStock, minThreshold, price, supplier, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(uid(), ing.name, ing.category, ing.stock, ing.quantity, ing.unit, ing.minStock, ing.minThreshold, ing.price, ing.supplier, now, now).run();
      }
    }

    // Seed initial assets if none exist
    const existingAsset = await DB.prepare('SELECT id FROM assets LIMIT 1').first();
    if (!existingAsset) {
      const defaultAssets = [
        { assetCode: 'AST-EQP-001', name: 'La Marzocco Linea PB 2-Group Espresso Machine', category: 'Equipment', purchaseDate: '2024-01-15', purchasePrice: 165000000, condition: 'GOOD', status: 'ACTIVE', location: 'Bar Area', serialNumber: 'LM-PB2-98421', notes: 'Servis rutin tiap 6 bulan' },
        { assetCode: 'AST-EQP-002', name: 'Mahlkönig EK43 Commercial Coffee Grinder', category: 'Equipment', purchaseDate: '2024-01-20', purchasePrice: 48000000, condition: 'GOOD', status: 'ACTIVE', location: 'Bar Area', serialNumber: 'MK-EK43-7712', notes: 'Kalibrasi burr tiap minggu' },
        { assetCode: 'AST-EQP-003', name: 'Mazzer Super Jolly Espresso Grinder', category: 'Equipment', purchaseDate: '2024-02-01', purchasePrice: 18500000, condition: 'GOOD', status: 'ACTIVE', location: 'Bar Area', serialNumber: 'MZ-SJ-5501', notes: 'Grinder cadangan espresso' },
        { assetCode: 'AST-EQP-004', name: 'Vitamix The Quiet One Commercial Blender', category: 'Equipment', purchaseDate: '2024-02-10', purchasePrice: 26000000, condition: 'GOOD', status: 'ACTIVE', location: 'Bar Area', serialNumber: 'VX-QO-3341', notes: 'Cover peredam suara' },
        { assetCode: 'AST-EQP-005', name: 'Hoshizaki Crescent Cube Ice Maker 120kg', category: 'Equipment', purchaseDate: '2024-01-10', purchasePrice: 42000000, condition: 'NEEDS_MAINTENANCE', status: 'ACTIVE', location: 'Kitchen', serialNumber: 'HZ-IM-120-88', notes: 'Penggantian filter air terjadwal' },
        { assetCode: 'AST-ELC-001', name: 'Sunmi T2s Dual Screen Android POS Terminal', category: 'Electronics', purchaseDate: '2024-01-25', purchasePrice: 9500000, condition: 'GOOD', status: 'ACTIVE', location: 'Cashier Station', serialNumber: 'SM-T2S-0044', notes: 'Terminal kasir utama' },
        { assetCode: 'AST-ELC-002', name: 'Epson TM-T82X Thermal Receipt Printer', category: 'Electronics', purchaseDate: '2024-01-25', purchasePrice: 2200000, condition: 'GOOD', status: 'ACTIVE', location: 'Cashier Station', serialNumber: 'EP-T82-9901', notes: 'Printer struk kasir 80mm' },
        { assetCode: 'AST-ELC-003', name: 'Daikin Inverter Cassette AC 3 PK', category: 'Electronics', purchaseDate: '2024-01-05', purchasePrice: 18000000, condition: 'GOOD', status: 'ACTIVE', location: 'Main Dining Hall', serialNumber: 'DK-CAS-3PK-12', notes: 'Pembersihan AC tiap 3 bulan' },
        { assetCode: 'AST-FUR-001', name: 'Industrial Solid Teak Dining Table & 4 Chairs Set', category: 'Furniture', purchaseDate: '2024-01-08', purchasePrice: 6500000, condition: 'GOOD', status: 'ACTIVE', location: 'Main Dining Hall', serialNumber: 'FUR-TBL-01', notes: 'Meja nomor 1-5' },
        { assetCode: 'AST-FUR-002', name: 'Bar Stool Steel Frame Leather Cushion', category: 'Furniture', purchaseDate: '2024-01-08', purchasePrice: 4800000, condition: 'GOOD', status: 'ACTIVE', location: 'Bar Counter', serialNumber: 'FUR-STL-01', notes: '6 unit kursi bar' },
      ];
      for (const a of defaultAssets) {
        await DB.prepare('INSERT INTO assets (id, assetCode, name, category, purchaseDate, purchasePrice, condition, status, location, serialNumber, notes, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .bind(uid(), a.assetCode, a.name, a.category, a.purchaseDate, a.purchasePrice, a.condition, a.status, a.location, a.serialNumber, a.notes, now, now).run();
      }
    }

    return json({ message: `Successfully seeded and updated images for ${menus.length} menu items, ${posts.length} blog posts, and website configuration` }, 200, cors);
  }

  // ===================================================================
  // PING
  // ===================================================================
  if (path === '/api/ping') {
    return json({ message: 'Siap Nyafe API is running (Cloudflare Worker + D1)' });
  }

  return json({ message: 'API Route Not Found' }, 404, cors);
}

export default {
  async fetch(request, env, ctx) {
    JWT_SECRET_KEY = env.JWT_SECRET || JWT_SECRET_KEY;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env);
      } catch (err) {
        console.error('API Error:', err);
        return json({ message: err.message || 'Internal error' }, 500, corsHeaders(request));
      }
    }

    return env.ASSETS.fetch(request);
  }
};
