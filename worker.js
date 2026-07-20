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

function getYesterdayJakartaDateStr() {
  const j = getJakartaDate();
  j.setUTCDate(j.getUTCDate() - 1);
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
    const { employeeId, email, password } = body;
    if (!password) return error('Password is required');
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
      return error('Employee ID or email is required');
    }
    if (!emp) return error('Invalid credentials', 401);
    const pwdValid = await bcrypt.compare(password, emp.password);
    if (!pwdValid) return error('Invalid credentials', 401);
    const userObj = stripPassword(emp);
    const token = await signJwt({
      id: userObj.id,
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
    const allowedDays = ['SATURDAY', 'SUNDAY', 'MONDAY'];
    const todayDay = getDayOfWeek();
    if (!allowedDays.includes(todayDay)) {
      return error('Shift schedule hanya bisa disimpan hari Sabtu, Minggu, atau Senin', 400);
    }
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

  if (path === '/api/shifts/randomize' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
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
        return error(`Tidak ada karyawan aktif dengan role ${role}`, 400);
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

    return json(newShifts);
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
    const noteData = { content: body.content, lastUpdatedBy: user.email || user.name || 'unknown', updatedAt: nowISO() };
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
      body.lastUpdatedBy = user.email || user.name || 'unknown';
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
    body.lastUpdatedBy = user.email || user.name || 'unknown';
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

  // ===================================================================
  // ATTENDANCE LOGIC
  // Shift windows (matching ShiftPage display):
  //   MORNING:   07:00 - 15:00
  //   AFTERNOON: 15:00 - 23:00
  //   EVENING:   23:00 - 07:00
  // Clock-in:
  //   [start -10min, start]         → ON_TIME
  //   (start, start + 2hr]          → LATE (alert "anda terlambat")
  //   > start + 2hr                 → auto-record TIDAK ABSEN MASUK
  // Clock-out:
  //   [end, end + 2hr]              → normal clock-out
  //   > end + 2hr                   → auto-record TIDAK ABSEN KELUAR
  // ===================================================================
  const SHIFT_START = { MORNING: 7, AFTERNOON: 15, EVENING: 23 };
  const SHIFT_END   = { MORNING: 15, AFTERNOON: 23, EVENING: 7 };

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
    let status = 'UNSCHEDULED';
    let minutesLate = 0;
    let lateAlert = false;
    let clockInTime = jDate.toISOString();
    let present = 1;

    if (scheduledShift) {
      shiftType = scheduledShift.shiftType || 'UNSCHEDULED';
      const startHour = SHIFT_START[shiftType];
      if (startHour !== undefined) {
        const earliestMin = startHour * 60 - 10;
        const shiftStartMin = startHour * 60;
        const autoAbsenMin = shiftStartMin + 120; // 2 jam setelah shift start

        if (totalMin < earliestMin) {
          return error('Belum waktu clock in. Clock in dapat dilakukan 10 menit sebelum jam shift dimulai.', 400);
        }

        if (totalMin > autoAbsenMin) {
          // > 2 jam: auto-record tidak absen masuk
          status = 'TIDAK ABSEN MASUK';
          clockInTime = '';
          present = 0;
        } else if (totalMin > shiftStartMin) {
          // 1 menit - 2 jam: LATE
          minutesLate = totalMin - shiftStartMin;
          status = 'LATE';
          lateAlert = true;
        } else {
          status = 'ON_TIME';
        }
      }
    }

    const id = uid();
    await DB.prepare(
      'INSERT INTO attendance_records (id, employee_id, date, present, clockInTime, shiftType, status, minutesLate, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, emp.id, today, present, clockInTime, shiftType, status, minutesLate, '').run();

    const record = { id, date: today, present, clockInTime, shiftType, status, minutesLate, lateAlert };
    return json({ message: status === 'TIDAK ABSEN MASUK' ? 'Tidak absen masuk' : 'Clocked in', record });
  }

  if (path === '/api/attendance/clock-out' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');
    const emp = await DB.prepare('SELECT * FROM employees WHERE employeeId = ?').bind(employeeId).first();
    if (!emp) return error('Employee not found', 404);

    const jDate = getJakartaDate();
    const today = getJakartaDateStr();
    const totalMin = jDate.getUTCHours() * 60 + jDate.getUTCMinutes();

    // Try today's record; if early morning (before 12:00), also try yesterday
    // (handles EVENING shift ending at 07:00 next day, and AFTERNOON clock-out past midnight)
    let record = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, today).first();
    if (!record && totalMin < 720) {
      const yesterdayDate = getYesterdayJakartaDateStr();
      record = await DB.prepare('SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?').bind(emp.id, yesterdayDate).first();
    }
    if (!record) return error('No clock-in record found', 400);

    const shiftType = record.shiftType || 'UNSCHEDULED';
    if (shiftType !== 'UNSCHEDULED') {
      const endHour = SHIFT_END[shiftType];
      if (endHour !== undefined) {
        const endMin = endHour * 60;
        const maxOutMin = endMin + 120; // 2 jam setelah shift selesai

        if (totalMin < endMin) {
          return error('Belum waktu clock out. Tunggu sampai jam shift selesai.', 400);
        }

        if (totalMin > maxOutMin) {
          // > 2 jam: auto-record tidak absen keluar
          await DB.prepare('UPDATE attendance_records SET clockOutTime = ?, hoursWorked = NULL, status = ? WHERE id = ?')
            .bind('', 'TIDAK ABSEN KELUAR', record.id).run();
          return json({ message: 'Tidak absen keluar', record: { ...record, clockOutTime: '', hoursWorked: null, status: 'TIDAK ABSEN KELUAR' } });
        }
      }
    }

    const clockIn = record.clockInTime;
    let hoursWorked = null;
    if (clockIn) {
      const diffMs = jDate.getTime() - new Date(clockIn).getTime();
      hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    }
    await DB.prepare('UPDATE attendance_records SET clockOutTime = ?, hoursWorked = ? WHERE id = ?')
      .bind(jDate.toISOString(), hoursWorked, record.id).run();

    return json({ message: 'Clocked out', record: { ...record, clockOutTime: jDate.toISOString(), hoursWorked } });
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

    return json({ message: 'Database seeded with 14 employees. Example logins: EMP-MAN-001 / manager123, EMP-BAR-001 / barista123, EMP-CSH-001 / cashier123, EMP-KIT-001 / kitchen123, EMP-WAI-001 / waiter123' });
  }

  if (path === '/api/seed-content' && method === 'POST') {
    const { secret } = body;
    if (!env.SEED_SECRET || secret !== env.SEED_SECRET) return error('Invalid secret', 401);

    const now = nowISO();

    const menus = [
      { name: 'Espresso', category: 'Coffee', price: 25000, description: 'Single shot espresso murni dengan rasa kuat dan aroma khas.' },
      { name: 'Double Espresso', category: 'Coffee', price: 35000, description: 'Double shot espresso untuk sensasi kafein yang lebih intens.' },
      { name: 'Americano', category: 'Coffee', price: 30000, description: 'Espresso dengan tambahan air panas, ringan dan nikmat.' },
      { name: 'Long Black', category: 'Coffee', price: 32000, description: 'American版本 dengan crema yang lebih tebal.' },
      { name: 'Cappuccino', category: 'Coffee', price: 38000, description: 'Espresso dengan steamed milk dan foam susu yang lembut.' },
      { name: 'Cafe Latte', category: 'Coffee', price: 38000, description: 'Espresso dengan susu steam yang creamy dan sedikit foam.' },
      { name: 'Flat White', category: 'Coffee', price: 40000, description: 'Double espresso dengan microfoam susu yang velvety.' },
      { name: 'Mocha', category: 'Coffee', price: 42000, description: 'Perpaduan espresso, coklat, dan steamed milk.' },
      { name: 'Caramel Macchiato', category: 'Coffee', price: 45000, description: 'Layered vanilla latte dengan drizzle karamel di atasnya.' },
      { name: 'Vanilla Latte', category: 'Coffee', price: 42000, description: 'Classic latte dengan sentuhan vanilla syrup.' },
      { name: 'Hazelnut Latte', category: 'Coffee', price: 42000, description: 'Latte dengan hazelnut syrup yang manis dan harum.' },
      { name: 'Affogato', category: 'Coffee', price: 40000, description: 'Scoop es krim vanilla disiram espresso panas.' },
      { name: 'Cold Brew', category: 'Coffee', price: 35000, description: 'Kopi seduh dingin 12 jam, smooth dan rendah asam.' },
      { name: 'Nitro Cold Brew', category: 'Coffee', price: 42000, description: 'Cold brew dengan infus nitrogen, tekstur creamy dan creamy head.' },
      { name: 'Iced Latte', category: 'Coffee', price: 36000, description: 'Latte segar dengan es batu.' },
      { name: 'Iced Mocha', category: 'Coffee', price: 40000, description: 'Mocha dingin dengan es batu.' },
      { name: 'Iced Caramel Macchiato', category: 'Coffee', price: 43000, description: 'Caramel macchiato versi dingin.' },
      { name: 'Espresso Con Panna', category: 'Coffee', price: 30000, description: 'Espresso dengan whipped cream di atasnya.' },
      { name: 'Cortado', category: 'Coffee', price: 32000, description: 'Espresso dengan sedikit susu hangat, rasanya seimbang.' },
      { name: 'Piccolo Latte', category: 'Coffee', price: 30000, description: 'Small latte dengan rasa espresso yang kuat.' },
      { name: 'Irish Coffee', category: 'Coffee', price: 50000, description: 'Kopi hitam dengan Irish whiskey dan whipped cream.' },
      { name: 'Cafe Bombon', category: 'Coffee', price: 35000, description: 'Espresso dengan susu kental manis, khas Spanyol.' },
      { name: 'Kopi Susu Gula Aren', category: 'Coffee', price: 35000, description: 'Kopi susu kekinian dengan gula aren asli.' },
      { name: 'Kopi Hitam', category: 'Coffee', price: 20000, description: 'Kopi hitam tradisional Indonesia pilihan.' },
      { name: 'Vietnamese Drip', category: 'Coffee', price: 35000, description: 'KopiVietnam slow drip dengan susu kental manis.' },
      { name: 'Matcha Latte', category: 'Non-Coffee', price: 40000, description: 'Matcha bubuk premium dengan steamed milk.' },
      { name: 'Taro Latte', category: 'Non-Coffee', price: 38000, description: 'Minuman taro creamy dengan aroma vanilla.' },
      { name: 'Chocolate', category: 'Non-Coffee', price: 35000, description: 'Segelas coklat panas creamy dan menghangatkan.' },
      { name: 'White Chocolate Mocha', category: 'Non-Coffee', price: 42000, description: 'White chocolate dan susu steam, manis dan lembut.' },
      { name: 'Strawberry Latte', category: 'Non-Coffee', price: 38000, description: 'Fresh strawberry puree dengan susu.' },
      { name: 'Blue Latte', category: 'Non-Coffee', price: 40000, description: 'Minuman bunga telang biru yang cantik dan menenangkan.' },
      { name: 'Red Velvet Latte', category: 'Non-Coffee', price: 40000, description: 'Red velvet dengan susu steam, manis dan creamy.' },
      { name: 'Japanese Tea', category: 'Non-Coffee', price: 25000, description: 'Green tea Jepang premium.' },
      { name: 'Earl Grey', category: 'Non-Coffee', price: 25000, description: 'Teh Earl Grey dengan aroma bergamot klasik.' },
      { name: 'Chamomile Tea', category: 'Non-Coffee', price: 25000, description: 'Teh chamomile menenangkan, tanpa kafein.' },
      { name: 'Lemon Tea', category: 'Non-Coffee', price: 20000, description: 'Teh hitam dengan perasan lemon segar.' },
      { name: 'Fresh Orange Juice', category: 'Non-Coffee', price: 28000, description: 'Jus jeruk segar tanpa gula tambahan.' },
      { name: 'Mango Smoothie', category: 'Non-Coffee', price: 32000, description: 'Smoothie mangga segar dengan yogurt.' },
      { name: 'Strawberry Smoothie', category: 'Non-Coffee', price: 32000, description: 'Smoothie stroberi segar dengan yogurt.' },
      { name: 'Mineral Water', category: 'Non-Coffee', price: 10000, description: 'Air mineral berkualitas.' },
      { name: 'Soda', category: 'Non-Coffee', price: 15000, description: 'Minuman soda pilihan.' },
      { name: 'Croissant', category: 'Snack', price: 25000, description: 'Croissant klasik Prancis, buttery dan flaky.' },
      { name: 'Butter Croissant', category: 'Snack', price: 28000, description: 'Croissant dengan lapisan mentega ekstra.' },
      { name: 'Almond Croissant', category: 'Snack', price: 32000, description: 'Croissant isi almond paste dan topping almond slice.' },
      { name: 'Banana Bread', category: 'Snack', price: 20000, description: 'Roti pisang homemade, moist dan penuh rasa.' },
      { name: 'Blueberry Muffin', category: 'Snack', price: 22000, description: 'Muffin blueberry dengan topping streusel.' },
      { name: 'Chocolate Muffin', category: 'Snack', price: 22000, description: 'Muffin coklat fudge yang rich dan moist.' },
      { name: 'Cheesecake', category: 'Snack', price: 35000, description: 'New York style cheesecake creamy dengan base graham.' },
      { name: 'Tiramisu', category: 'Snack', price: 38000, description: 'Classic Italian tiramisu dengan mascarpone.' },
      { name: 'Black Forest Cake', category: 'Snack', price: 35000, description: 'Cake coklat dengan cherry dan whipped cream.' },
      { name: 'Carrot Cake', category: 'Snack', price: 32000, description: 'Carrot cake dengan cream cheese frosting.' },
      { name: 'French Fries', category: 'Food', price: 25000, description: 'Kentang goreng crispy dengan saus pilihan.' },
      { name: 'Nachos', category: 'Food', price: 35000, description: 'Nachos dengan keju leleh, salsa, dan sour cream.' },
      { name: 'Chicken Wings', category: 'Food', price: 40000, description: 'Sayap ayam goreng dengan saus BBQ pedas.' },
      { name: 'Sandwich', category: 'Food', price: 35000, description: 'Sandwich roti gandum dengan isian ayam dan sayur segar.' },
      { name: 'Toast', category: 'Food', price: 25000, description: 'Roti panggang dengan butter dan selai.' },
      { name: 'Pasta Carbonara', category: 'Food', price: 45000, description: 'Fettuccine carbonara creamy dengan bacon dan parmesan.' },
      { name: 'Pasta Aglio Olio', category: 'Food', price: 42000, description: 'Spaghetti aglio olio dengan bawang putih dan cabai.' },
      { name: 'Nasi Goreng', category: 'Food', price: 40000, description: 'Nasi goreng kampung dengan telur dan kerupuk.' },
      { name: 'Mie Goreng', category: 'Food', price: 35000, description: 'Mie goreng jawa dengan sayuran dan telur.' },
      { name: 'Pisang Goreng', category: 'Food', price: 20000, description: 'Pisang goreng crispy dengan topping coklat dan keju.' },
    ];

    for (const m of menus) {
      await DB.prepare(
        'INSERT INTO menus (id, name, category, price, description, available, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, ?, ?)'
      ).bind(uid(), m.name, m.category, m.price, m.description, now, now).run();
    }

    const posts = [
      { title: 'Grand Opening Siap Nyafe Coffee', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Akhirnya Siap Nyafe Coffee resmi hadir di Jakarta!', content: 'Kami dengan bangga mengumumkan pembukaan Siap Nyafe Coffee di pusat kota Jakarta. Hadir dengan konsep modern industrial yang nyaman, kami menyajikan berbagai pilihan kopi berkualitas dari biji kopi pilihan petani lokal Indonesia. Mulai dari espresso klasik hingga minuman kopi kekinian seperti Kopi Susu Gula Aren dan Cold Brew. Dukung terus kopi lokal Indonesia!', createdAt: '2026-06-15T08:00' },
      { title: 'Welcome to the Family: Our Story', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Cerita di balik lahirnya Siap Nyafe Coffee.', content: 'Berawal dari kecintaan terhadap kopi Nusantara, kami mendirikan Siap Nyafe Coffee dengan misi memperkenalkan cita rasa kopi Indonesia ke seluruh dunia. Setiap cangkir yang kami sajikan adalah hasil seleksi ketat dari petani kopi terbaik di Sumatera, Jawa, Bali, dan Sulawesi. Kami percaya bahwa secangkir kopi yang baik bisa membawa kebahagiaan dan menyatukan orang-orang.', createdAt: '2026-06-15T09:00' },
      { title: 'Meet Our Barista Team', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Kenalan dengan para barista handal Siap Nyafe.', content: 'Tim barista kami adalah para profesional yang telah terlatih dan bersertifikat. Mereka tidak hanya ahli dalam meracik kopi, tetapi juga passionate dalam memberikan pengalaman terbaik bagi setiap pelanggan. Dari latte art yang indah hingga rekomendasi kopi yang tepat sesuai selera Anda, barista kami siap melayani.', createdAt: '2026-06-20T10:00' },
      { title: 'The Art of Latte Art', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Belajar seni latte art dari barista profesional.', content: 'Latte art bukan sekadar hiasan di atas kopi, tetapi sebuah bentuk seni yang membutuhkan keahlian dan latihan. Barista kami telah menguasai berbagai teknik pouring untuk menciptakan rosetta, tulip, swan, dan berbagai motif lainnya. Setiap cangkir latte art adalah karya seni yang unik untuk Anda!', createdAt: '2026-06-25T11:00' },
      { title: 'Kopi Indonesia: Dari Petani ke Cangkir', category: 'NEWS', status: 'PUBLISHED', excerpt: 'Perjalanan biji kopi dari kebun hingga ke cangkir Anda.', content: 'Indonesia adalah salah satu penghasil kopi terbaik di dunia. Kopi Gayo dari Aceh dengan karakter earthy dan spicy, Kopi Java dengan body yang smooth dan hints of chocolate, serta Kopi Toraja dengan kompleksitas rasa yang kaya. Di Siap Nyafe, kami bangga menyajikan kopi-kopi terbaik Nusantara dengan metode seduh yang tepat.', createdAt: '2026-07-01T08:00' },
      { title: 'New Cold Brew Arrival', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Cold brew baru dengan rasa lebih smooth!', content: 'Kami menghadirkan Cold Brew baru yang diseduh selama 12 jam untuk menghasilkan rasa yang lebih smooth, rendah asam, dan full-bodied. Tersedia juga Nitro Cold Brew dengan tekstur creamy berkat infus nitrogen. Nikmati kesegaran Cold Brew di hari yang panas!', createdAt: '2026-07-05T09:00' },
      { title: 'Buy 1 Get 1 Every Monday', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Senin ceria dengan promo Buy 1 Get 1 untuk semua minuman.', content: 'Setiap hari Senin, kami memberikan promo spesial Buy 1 Get 1 untuk semua menu minuman. Ajak teman atau kolega Anda dan nikmati kopi favorit berdua dengan harga yang lebih hemat. Promo berlaku sepanjang hari untuk dine-in maupun takeaway. Syarat dan ketentuan berlaku.', createdAt: '2026-07-10T10:00' },
      { title: 'Happy Hour 3-5 PM', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Diskon 20% untuk semua menu setiap jam 3-5 sore!', content: 'Butuh penyemangat di sore hari? Nikmati Happy Hour setiap hari pukul 15.00 - 17.00 dengan diskon 20% untuk semua menu minuman. Cocok untuk melepas penat setelah seharian beraktivitas. Jangan lewatkan promo spesial ini!', createdAt: '2026-07-12T14:00' },
      { title: 'Weekly Special: New Menu Launch', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Coba menu-menu baru kami yang lebih variatif!', content: 'Setiap minggu kami menghadirkan menu spesial baru yang siap memanjakan lidah Anda. Mulai dari minuman seasonal hingga makanan ringan pendamping kopi. Follow Instagram kami untuk update menu spesial minggu ini!', createdAt: '2026-07-15T08:00' },
      { title: 'Student Discount 15%', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Pelajar dan mahasiswa dapat diskon 15% setiap hari.', content: 'Tunjukkan kartu pelajar atau mahasiswa Anda dan dapatkan diskon 15% untuk semua pembelian. Kami ingin mendukung generasi muda Indonesia untuk lebih produktif dengan secangkir kopi berkualitas. Promo berlaku setiap hari selama jam operasional.', createdAt: '2026-07-18T09:00' },
      { title: 'New Menu: Healthy Options', category: 'PROMO', status: 'PUBLISHED', excerpt: 'Menu sehat baru untuk gaya hidup sadar kesehatan.', content: 'Kini hadir pilihan menu sehat untuk Anda yang peduli dengan kesehatan. Smoothie bowl dengan buah segar, oatmeal latte, serta minuman rendah kalori. Nikmati kopi favorit Anda tanpa rasa bersalah! Tersedia juga opsi susu alternatif seperti oat milk, almond milk, dan soy milk.', createdAt: '2026-07-20T10:00' },
      { title: 'Live Music Every Friday', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Nikmati live music setiap Jumat malam di Siap Nyafe.', content: 'Setiap hari Jumat pukul 19.00 - 21.00, kami menghadirkan live music dengan berbagai genre musik akustik. Nikmati kopi favorit Anda ditemani alunan musik yang menenangkan. Bawa teman dan keluarga untuk pengalaman ngopi yang lebih berkesan!', createdAt: '2026-06-18T10:00' },
      { title: 'Coffee Brewing Workshop', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Belajar teknik brewing kopi yang benar.', content: 'Ikuti workshop brewing kopi kami setiap hari Sabtu pukul 10.00 - 12.00. Pelajari berbagai metode brewing mulai dari V60, Aeropress, French Press, hingga Cold Brew. Cocok untuk pemula hingga enthusiast yang ingin memperdalam ilmu kopi. Biaya pendaftaran Rp 100.000 termasuk alat dan bahan.', createdAt: '2026-06-22T10:00' },
      { title: 'Open Mic Night', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Tunjukkan bakat Anda di panggung open mic!', content: 'Setiap hari Rabu malam, Siap Nyafe menjadi tempat bagi para kreator untuk mengekspresikan diri melalui open mic. Puisi, komedi, musik, storytelling — semua boleh tampil! Daftarkan diri Anda di kasir atau melalui Instagram kami. Tiket masuk gratis dengan minimum pemesanan satu minuman.', createdAt: '2026-07-08T10:00' },
      { title: 'Year-End Celebration', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Rayakan akhir tahun bersama Siap Nyafe!', content: 'Mari rayakan akhir tahun bersama Siap Nyafe Coffee! Akan ada live music spesial, games berhadiah, dan menu spesial akhir tahun. Datang dan nikmati momen kebersamaan di penghujung tahun. Reserve tempat Anda sekarang karena kapasitas terbatas!', createdAt: '2026-07-15T12:00' },
      { title: 'Barista Competition 2026', category: 'EVENT', status: 'PUBLISHED', excerpt: 'Ikuti kompetisi barista antar kafe se-Jakarta!', content: 'Siap Nyafe menjadi tuan rumah kompetisi barista antar kafe se-Jakarta. Adu skill latte art, brewing, dan speed challenge Anda. Hadiah utamaRp 5.000.000 + trophy. Pendaftaran dibuka sampai 31 Juli 2026. Hubungi kami untuk informasi lebih lanjut.', createdAt: '2026-07-18T10:00' },
    ];

    for (const p of posts) {
      const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      await DB.prepare(
        'INSERT INTO posts (id, title, slug, content, excerpt, category, status, publishedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(uid(), p.title, slug, p.content, p.excerpt, p.category, p.status, p.status === 'PUBLISHED' ? now : null, p.createdAt, now).run();
    }

    return json({ message: `Seeded ${menus.length} menu items and ${posts.length} blog posts` });
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
