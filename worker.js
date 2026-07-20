import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
let JWT_SECRET_KEY = 'change-me-in-production';

function uid() {
  return crypto.randomUUID();
}

function stripPassword(row) {
  if (!row) return null;
  const { password, ...rest } = row;
  return rest;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(msg, status = 400) {
  return json({ message: msg }, status);
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

async function signJwt(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(JWT_SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const h = b64(header);
  const p = b64(payload);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`));
  const s = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${h}.${p}.${s}`;
}

async function verifyJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(JWT_SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );
    const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, enc.encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    return JSON.parse(atob(parts[1]));
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

async function authenticate(request) {
  const token = getToken(request);
  if (!token) return null;
  return verifyJwt(token);
}

function requireRole(user, roles) {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.some(r => r.toUpperCase() === user.role?.toUpperCase());
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_MAP = { Sun: 'SUNDAY', Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY', Sat: 'SATURDAY' };

function getJakartaDate() {
  const now = new Date();
  return new Date(now.getTime() + 7 * 60 * 60 * 1000);
}

function getJakartaDateStr() {
  const j = getJakartaDate();
  return `${j.getUTCFullYear()}-${String(j.getUTCMonth() + 1).padStart(2, '0')}-${String(j.getUTCDate()).padStart(2, '0')}`;
}

function getDayOfWeek() {
  const j = getJakartaDate();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return DAY_MAP[days[j.getUTCDay()]];
}

function nowISO() {
  return new Date().toISOString();
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const searchParams = url.searchParams;
  const user = await authenticate(request);
  const DB = env.DB;

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
    const { username, email, password } = body;
    if (!password) return error('Password is required');
    let emp;
    if (username) {
      emp = await DB.prepare('SELECT * FROM employees WHERE username = ?').bind(username).first();
    } else if (email) {
      emp = await DB.prepare('SELECT * FROM employees WHERE email = ?').bind(email).first();
    } else {
      return error('Username or email is required');
    }
    if (!emp) return error('Invalid credentials', 401);
    const pwdValid = await bcrypt.compare(password, emp.password);
    if (!pwdValid) return error('Invalid credentials', 401);
    const userObj = stripPassword(emp);
    const token = await signJwt({
      id: userObj.id, username: userObj.username,
      email: userObj.email, role: userObj.role, employeeId: userObj.employeeId,
    });
    const response = json({ token, user: userObj });
    response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax; Secure`);
    return response;
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const response = json({ message: 'Logged out' });
    response.headers.append('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    return response;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const emp = await DB.prepare('SELECT * FROM employees WHERE id = ?').bind(user.id).first();
    if (!emp) return error('User not found', 404);
    return json(stripPassword(emp));
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
    body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
    const { password, ...rest } = body;
    const cols = ['id', ...Object.keys(rest)];
    const vals = ['?', ...Object.keys(rest).map(() => '?')];
    const sql = `INSERT INTO employees (${cols.join(',')}) VALUES (${vals.join(',')})`;
    const params = [id, ...Object.values(rest)];
    await DB.prepare(sql).bind(...params).run();
    return json({ id, ...body }, 201);
  }

  const empMatch = path.match(/^\/api\/employees\/([^/]+)$/);
  if (empMatch) {
    const empId = empMatch[1];
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.password) body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
      else delete body.password;
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      const params = [...Object.values(body), empId];
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
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results.map(parseJsonFields));
  }

  if (path === '/api/menus' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    stringifyJsonFields(body);
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO menus (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const menuMatch = path.match(/^\/api\/menus\/([^/]+)$/);
  if (menuMatch) {
    const menuId = menuMatch[1];
    if (method === 'GET') {
      const doc = await DB.prepare('SELECT * FROM menus WHERE id = ?').bind(menuId).first();
      if (!doc) return error('Not found', 404);
      return json(parseJsonFields(doc));
    }
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      stringifyJsonFields(body);
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE menus SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), menuId).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await DB.prepare('DELETE FROM menus WHERE id = ?').bind(menuId).run();
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // CATEGORIES
  // ===================================================================
  if (path === '/api/categories' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    return json(results);
  }

  if (path === '/api/categories' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const id = uid();
    await DB.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').bind(id, body.name).run();
    return json({ id, name: body.name }, 201);
  }

  const catMatch = path.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await DB.prepare('DELETE FROM categories WHERE id = ?').bind(catMatch[1]).run();
    return json({ message: 'Deleted' });
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
      return json({ id, shopName: 'Siap Nyafe', websiteTitle: 'Siap Nyafe - Excellent Coffee', marqueeText: 'Welcome to Siap Nyafe Coffee Shop!', infoTitle: 'Our Story', infoContent: 'Born in Jakarta, brewed for the bold.', infoFooter1: 'EST. 2024', infoFooter2: 'JAKARTA' });
    }
    return json(parseJsonFields(config));
  }

  if (path === '/api/config' && method === 'PUT') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    stringifyJsonFields(body);
    const existing = await DB.prepare('SELECT * FROM shop_config LIMIT 1').first();
    if (existing) {
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE shop_config SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), existing.id).run();
    } else {
      const id = uid();
      const cols = ['id', ...Object.keys(body)];
      const vals = ['?', ...Object.keys(body).map(() => '?')];
      await DB.prepare(`INSERT INTO shop_config (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    }
    return json({ message: 'Config updated' });
  }

  // ===================================================================
  // ORDERS
  // ===================================================================
  if (path === '/api/orders' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
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
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results.map(parseJsonFields));
  }

  if (path === '/api/orders' && method === 'POST') {
    if (!body.orderNumber) {
      const r = Math.random().toString(36).substring(2, 11).toUpperCase();
      body.orderNumber = `ORD-${r}`;
    }
    const totalPrice = body.totalPrice || body.totalAmount || 0;
    const tax = body.tax || 0;
    body.totalPrice = totalPrice;
    body.grandTotal = parseFloat(totalPrice) + parseFloat(tax);
    body.status = body.status || 'PENDING';
    body.createdAt = nowISO();
    if (body.totalAmount) delete body.totalAmount;
    stringifyJsonFields(body);
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO orders (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      if (body.items) {
        body.totalPrice = body.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        const existing = await DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
        const tax = existing?.tax || 0;
        body.grandTotal = body.totalPrice + tax;
      }
      body.updatedAt = nowISO();
      stringifyJsonFields(body);
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE orders SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), orderId).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await DB.prepare('DELETE FROM orders WHERE id = ?').bind(orderId).run();
      return json({ message: 'Deleted' });
    }
  }

  const orderStatusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    if (!user) return error('Unauthorized', 401);
    const status = searchParams.get('status') || body.status || '';
    await DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status.toUpperCase(), orderStatusMatch[1]).run();
    return json({ message: 'Status updated' });
  }

  // ===================================================================
  // POSTS
  // ===================================================================
  if (path === '/api/posts' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM posts ORDER BY createdAt DESC').all();
    return json(results.map(parseJsonFields));
  }

  if (path === '/api/posts/published' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM posts WHERE status = ? ORDER BY publishedAt DESC').bind('PUBLISHED').all();
    return json(results.map(parseJsonFields));
  }

  if (path === '/api/posts' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    if (!body.slug) body.slug = (body.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    if (body.status === 'PUBLISHED') body.publishedAt = nowISO();
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO posts (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch) {
    const postId = postMatch[1];
    if (method === 'GET') {
      const doc = await DB.prepare('SELECT * FROM posts WHERE id = ?').bind(postId).first();
      if (!doc) return error('Not found', 404);
      return json(parseJsonFields(doc));
    }
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.status === 'PUBLISHED' && !body.publishedAt) body.publishedAt = nowISO();
      body.updatedAt = nowISO();
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE posts SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), postId).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await DB.prepare('DELETE FROM posts WHERE id = ?').bind(postId).run();
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // SHIFTS
  // ===================================================================
  if (path === '/api/shifts' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const { results } = await DB.prepare('SELECT * FROM shift_schedules').all();
    return json(results);
  }

  if (path === '/api/shifts' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const shifts = body.shifts || body;
    if (Array.isArray(shifts)) {
      await DB.prepare('DELETE FROM shift_schedules').run();
      for (const s of shifts) {
        const id = uid();
        await DB.prepare('INSERT INTO shift_schedules (id, employeeId, employeeName, role, position, dayOfWeek, shiftType) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(id, s.employeeId, s.employeeName, s.role, s.position, s.dayOfWeek, s.shiftType).run();
      }
    }
    return json({ message: 'Shifts saved' });
  }

  // ===================================================================
  // TRANSACTIONS
  // ===================================================================
  if (path === '/api/transactions' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    if (searchParams.get('type')) {
      sql += ' AND type = ?';
      params.push(searchParams.get('type'));
    }
    sql += ' ORDER BY date DESC';
    const { results } = await DB.prepare(sql).bind(...params).all();
    return json(results);
  }

  if (path === '/api/transactions' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    body.date = body.date || nowISO();
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO transactions (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  // ===================================================================
  // INGREDIENTS
  // ===================================================================
  if (path === '/api/ingredients' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const { results } = await DB.prepare('SELECT * FROM ingredients').all();
    return json(results);
  }

  if (path === '/api/ingredients' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO ingredients (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const ingMatch = path.match(/^\/api\/ingredients\/([^/]+)$/);
  if (ingMatch) {
    const ingId = ingMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      body.updatedAt = nowISO();
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE ingredients SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), ingId).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await DB.prepare('DELETE FROM ingredients WHERE id = ?').bind(ingId).run();
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTES
  // ===================================================================
  if (path === '/api/notes' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const { results } = await DB.prepare('SELECT * FROM notes').all();
    return json(results);
  }

  if (path === '/api/notes/dashboard' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const existing = await DB.prepare('SELECT * FROM notes LIMIT 1').first();
    if (existing) return json(existing);
    const id = uid();
    await DB.prepare('INSERT INTO notes (id, content, lastUpdatedBy, updatedAt) VALUES (?, ?, ?, ?)')
      .bind(id, 'Welcome to Siap Nyafe!', 'system', nowISO()).run();
    return json({ id, content: 'Welcome to Siap Nyafe!', lastUpdatedBy: 'system', updatedAt: nowISO() });
  }

  if (path === '/api/notes/dashboard' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const existing = await DB.prepare('SELECT * FROM notes LIMIT 1').first();
    const noteData = { content: body.content, lastUpdatedBy: user.username || 'unknown', updatedAt: nowISO() };
    if (existing) {
      const setClauses = Object.keys(noteData).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE notes SET ${setClauses} WHERE id = ?`).bind(...Object.values(noteData), existing.id).run();
    } else {
      const id = uid();
      const cols = ['id', ...Object.keys(noteData)];
      const vals = ['?', ...Object.keys(noteData).map(() => '?')];
      await DB.prepare(`INSERT INTO notes (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(noteData)).run();
    }
    return json({ message: 'Note saved' });
  }

  if (path === '/api/notes' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const id = uid();
    body.lastUpdatedBy = user.username || 'unknown';
    body.updatedAt = nowISO();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO notes (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const noteMatch = path.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch) {
    const noteId = noteMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      body.updatedAt = nowISO();
      body.lastUpdatedBy = user.username || 'unknown';
      const setClauses = Object.keys(body).map(k => `${k} = ?`).join(', ');
      await DB.prepare(`UPDATE notes SET ${setClauses} WHERE id = ?`).bind(...Object.values(body), noteId).run();
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await DB.prepare('DELETE FROM notes WHERE id = ?').bind(noteId).run();
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================
  if (path === '/api/notifications' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const { results } = await DB.prepare('SELECT * FROM notifications WHERE read = 0 ORDER BY timestamp DESC LIMIT 50').all();
    return json(results);
  }

  if (path === '/api/notifications' && method === 'POST') {
    const id = uid();
    body.timestamp = nowISO();
    body.read = 0;
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO notifications (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const notifMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === 'PUT') {
    if (!user) return error('Unauthorized', 401);
    await DB.prepare('UPDATE notifications SET read = 1 WHERE id = ?').bind(notifMatch[1]).run();
    return json({ message: 'Marked as read' });
  }

  // ===================================================================
  // FEEDBACKS
  // ===================================================================
  if (path === '/api/feedbacks' && method === 'GET') {
    const { results } = await DB.prepare('SELECT * FROM feedbacks ORDER BY timestamp DESC').all();
    return json(results.map(parseJsonFields));
  }

  if (path === '/api/feedbacks' && method === 'POST') {
    const jakarta = getJakartaDate();
    const h = jakarta.getUTCHours();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = DAY_MAP[dayNames[jakarta.getUTCDay()]];
    let shiftType = 'MORNING';
    if (h >= 15 && h < 22) shiftType = 'AFTERNOON';
    else if (h >= 22 || h < 7) shiftType = 'EVENING';
    const { results: shiftDocs } = await DB.prepare('SELECT * FROM shift_schedules WHERE dayOfWeek = ? AND shiftType = ?').bind(dayOfWeek, shiftType).all();
    body.shiftEmployees = JSON.stringify(shiftDocs.map(s => s.employeeName).filter(Boolean));
    body.timestamp = nowISO();
    const id = uid();
    const cols = ['id', ...Object.keys(body)];
    const vals = ['?', ...Object.keys(body).map(() => '?')];
    await DB.prepare(`INSERT INTO feedbacks (${cols.join(',')}) VALUES (${vals.join(',')})`).bind(id, ...Object.values(body)).run();
    return json({ id, ...body }, 201);
  }

  const fbMatch = path.match(/^\/api\/feedbacks\/([^/]+)$/);
  if (fbMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await DB.prepare('DELETE FROM feedbacks WHERE id = ?').bind(fbMatch[1]).run();
    return json({ message: 'Deleted' });
  }

  // ===================================================================
  // ATTENDANCE
  // ===================================================================
  if (path === '/api/attendance' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const { results } = await DB.prepare(`
      SELECT ar.*, e.employeeId, e.name AS employeeName, e.position
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      ORDER BY ar.date DESC
    `).all();
    return json(results);
  }

  const attHistoryMatch = path.match(/^\/api\/attendance\/history\/([^/]+)$/);
  if (attHistoryMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(attHistoryMatch[1]).first();
    if (!emp) return error('Not found', 404);
    const { results } = await DB.prepare(`
      SELECT ar.*, e.employeeId, e.name AS employeeName, e.position
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE e.employeeId = ?
      ORDER BY ar.date DESC
    `).bind(attHistoryMatch[1]).all();
    return json(results);
  }

  const attTodayMatch = path.match(/^\/api\/attendance\/today\/([^/]+)$/);
  if (attTodayMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(attTodayMatch[1]).first();
    if (!emp) return json(null);
    const today = getJakartaDateStr();
    const rec = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    return json(rec || null);
  }

  if (path === '/api/attendance/clock-in' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    if (!emp) return error('Employee not found', 404);

    const today = getJakartaDateStr();
    const existingToday = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    if (existingToday) return error('Already clocked in today', 400);

    const jDate = getJakartaDate();
    const totalMin = jDate.getUTCHours() * 60 + jDate.getUTCMinutes();
    const dayOfWeek = getDayOfWeek();
    const scheduledShift = await DB.prepare('SELECT * FROM shift_schedules WHERE employeeId = ? AND dayOfWeek = ?').bind(employeeId, dayOfWeek).first();
    let shiftType = 'UNSCHEDULED';
    let isLate = false;
    let minutesLate = 0;
    if (scheduledShift) {
      shiftType = scheduledShift.shiftType || 'UNSCHEDULED';
      const expectedStart = { MORNING: 8, AFTERNOON: 15, EVENING: 22 }[shiftType];
      if (expectedStart !== undefined) {
        const expectedMin = expectedStart * 60 + 15;
        if (totalMin > expectedMin) {
          isLate = true;
          minutesLate = totalMin - expectedStart * 60;
        }
      }
    }

    const id = uid();
    await DB.prepare(
      'INSERT INTO attendance_records (id, employee_id, date, present, clockInTime, shiftType, status, minutesLate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, emp.id, today, 1, jDate.toISOString(), shiftType, isLate ? 'LATE' : (shiftType === 'UNSCHEDULED' ? 'UNSCHEDULED' : 'ON_TIME'), minutesLate, '').run();

    return json({ message: 'Clocked in', record: { id, date: today, present: true, clockInTime: jDate.toISOString(), shiftType, status: isLate ? 'LATE' : (shiftType === 'UNSCHEDULED' ? 'UNSCHEDULED' : 'ON_TIME'), minutesLate } });
  }

  if (path === '/api/attendance/clock-out' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    if (!emp) return error('Employee not found', 404);

    const today = getJakartaDateStr();
    const record = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    if (!record) return error('No clock-in record found for today', 400);

    const jDate = getJakartaDate();
    const clockIn = record.clockInTime;
    if (clockIn) {
      const diffMs = jDate.getTime() - new Date(clockIn).getTime();
      const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      let statusAlert = null;
      if (hoursWorked < 7.75 && record.status !== 'UNSCHEDULED') {
        statusAlert = 'TOO_EARLY';
      }
      await DB.prepare('UPDATE attendance_records SET clockOutTime = ?, hoursWorked = ?, status_alert = ? WHERE id = ?')
        .bind(jDate.toISOString(), hoursWorked, statusAlert, record.id).run();
    }
    return json({ message: 'Clocked out' });
  }

  // ===================================================================
  // IMAGE UPLOAD (R2)
  // ===================================================================
  if (path === '/api/uploads' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);

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

    if (!fileArrayBuffer) return error('No file uploaded', 400);

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

    return json({ url: `/api/images/${id}` }, 201);
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

    const empId = uid();
    const hash = await bcrypt.hash('manager123', SALT_ROUNDS);
    await DB.prepare(
      'INSERT INTO employees (id, employeeId, username, email, password, name, phone, position, salary, role, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(empId, 'EMP-MAN-001', 'manager', 'manager@americano.com', hash, 'Manager', '08123456789', 'Manager', 5000000, 'Manager', 1).run();

    const cashierId = uid();
    const cashierHash = await bcrypt.hash('cashier123', SALT_ROUNDS);
    await DB.prepare(
      'INSERT INTO employees (id, employeeId, username, email, password, name, phone, position, salary, role, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(cashierId, 'EMP-CSH-001', 'cashier', 'cashier@americano.com', cashierHash, 'Cashier', '08123456788', 'Cashier', 3000000, 'Cashier', 1).run();

    const configId = uid();
    await DB.prepare(
      'INSERT INTO shop_config (id, shopName, websiteTitle, faviconUrl, address, phoneNumber, marqueeText, heroImageUrl, badgeText1, badgeText2, infoTitle, infoContent, infoFooter1, infoFooter2, techSpec1, techSpec2, techSpec3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(configId, 'Siap Nyafe', 'Siap Nyafe - Excellent Coffee', '', 'Jakarta, Indonesia', '021-12345678', 'Welcome to Siap Nyafe Coffee Shop!',
      '', 'EST 2024', 'JAKARTA', 'Our Story', 'Born in Jakarta, brewed for the bold.', 'EST. 2024', 'JAKARTA',
      '// EST 2024', '// JKT_ID', '// V.1.0'
    ).run();

    const categories = ['Coffee', 'Non-Coffee', 'Featured', 'Snack', 'Food'];
    for (const cat of categories) {
      await DB.prepare('INSERT INTO categories (id, name) VALUES (?, ?)').bind(uid(), cat).run();
    }

    return json({ message: 'Database seeded successfully. Login: manager / manager123' });
  }

  // ===================================================================
  // PING
  // ===================================================================
  if (path === '/api/ping') {
    return json({ message: 'Siap Nyafe API is running (Cloudflare Worker + D1)' });
  }

  return json({ message: 'API Route Not Found' }, 404);
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
        return json({ message: err.message || 'Internal error', stack: err.stack }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
