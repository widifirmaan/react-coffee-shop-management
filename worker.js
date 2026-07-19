import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const JWT_SECRET_KEY = 'siap-nyafe-jwt-secret-2024';

let cachedClient = null;
let cachedDb = null;

async function getDb(uri) {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db('coffeeshop');
  return cachedDb;
}

function docId(id) {
  return new ObjectId(id);
}

function fromDoc(doc) {
  if (!doc) return null;
  const { _id, __v, password, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

function fromDocList(docs) {
  return (docs || []).map(fromDoc);
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

async function handleApi(request, db) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const searchParams = url.searchParams;
  const user = await authenticate(request);

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
    const filter = {};
    if (username) filter.username = username;
    else if (email) filter.email = email;
    else return error('Username or email is required');

    const emp = await db.collection('employees').findOne(filter);
    if (!emp) return error('Invalid credentials', 401);
    const pwdValid = await bcrypt.compare(password, emp.password);
    if (!pwdValid) return error('Invalid credentials', 401);

    const userObj = fromDoc(emp);
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
    const emp = await db.collection('employees').findOne({ _id: docId(user.id) });
    if (!emp) return error('User not found', 404);
    return json(fromDoc(emp));
  }

  // ===================================================================
  // EMPLOYEES
  // ===================================================================
  if (path === '/api/employees' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('role')) filter.role = searchParams.get('role');
    if (searchParams.get('active') !== null) filter.active = searchParams.get('active') === 'true';
    if (searchParams.get('search')) {
      const s = searchParams.get('search');
      filter.$or = [{ name: { $regex: s, $options: 'i' } }, { employeeId: { $regex: s, $options: 'i' } }];
    }
    const docs = await db.collection('employees').find(filter).sort({ name: 1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/employees' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
    const result = await db.collection('employees').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const empMatch = path.match(/^\/api\/employees\/([^/]+)$/);
  if (empMatch) {
    const empId = empMatch[1];
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.password) body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
      else delete body.password;
      await db.collection('employees').updateOne({ _id: docId(empId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await db.collection('employees').deleteOne({ _id: docId(empId) });
      return json({ message: 'Deleted' });
    }
  }

  const empStatusMatch = path.match(/^\/api\/employees\/([^/]+)\/status$/);
  if (empStatusMatch && method === 'PATCH') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const emp = await db.collection('employees').findOne({ _id: docId(empStatusMatch[1]) });
    if (!emp) return error('Not found', 404);
    await db.collection('employees').updateOne(
      { _id: docId(empStatusMatch[1]) },
      { $set: { active: !emp.active } }
    );
    return json({ message: 'Status toggled', active: !emp.active });
  }

  // ===================================================================
  // MENUS
  // ===================================================================
  if (path === '/api/menus' && method === 'GET') {
    const filter = {};
    if (searchParams.get('category')) filter.category = searchParams.get('category');
    if (searchParams.get('search')) filter.name = { $regex: searchParams.get('search'), $options: 'i' };
    const docs = await db.collection('menus').find(filter).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/menus' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await db.collection('menus').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const menuMatch = path.match(/^\/api\/menus\/([^/]+)$/);
  if (menuMatch) {
    const menuId = menuMatch[1];
    if (method === 'GET') {
      const doc = await db.collection('menus').findOne({ _id: docId(menuId) });
      if (!doc) return error('Not found', 404);
      return json(fromDoc(doc));
    }
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      await db.collection('menus').updateOne({ _id: docId(menuId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await db.collection('menus').deleteOne({ _id: docId(menuId) });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // CATEGORIES
  // ===================================================================
  if (path === '/api/categories' && method === 'GET') {
    const docs = await db.collection('categories').find().sort({ name: 1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/categories' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await db.collection('categories').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const catMatch = path.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await db.collection('categories').deleteOne({ _id: docId(catMatch[1]) });
    return json({ message: 'Deleted' });
  }

  // ===================================================================
  // CONFIG
  // ===================================================================
  if (path === '/api/config' && method === 'GET') {
    let config = await db.collection('shop_config').findOne({});
    if (!config) {
      const defaultConfig = {
        shopName: 'Siap Nyafe', websiteTitle: 'Siap Nyafe - Excellent Coffee',
        marqueeText: 'Welcome to Siap Nyafe Coffee Shop!',
        infoTitle: 'Our Story', infoContent: 'Born in Jakarta, brewed for the bold.',
        infoFooter1: 'EST. 2024', infoFooter2: 'JAKARTA',
      };
      const result = await db.collection('shop_config').insertOne(defaultConfig);
      return json({ id: result.insertedId.toString(), ...defaultConfig });
    }
    return json(fromDoc(config));
  }

  if (path === '/api/config' && method === 'PUT') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const existing = await db.collection('shop_config').findOne({});
    if (existing) {
      await db.collection('shop_config').updateOne({ _id: existing._id }, { $set: body });
    } else {
      await db.collection('shop_config').insertOne(body);
    }
    return json({ message: 'Config updated' });
  }

  // ===================================================================
  // ORDERS
  // ===================================================================
  if (path === '/api/orders' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('status')) filter.status = searchParams.get('status').toUpperCase();
    if (searchParams.get('excludeStatus')) filter.status = { $ne: searchParams.get('excludeStatus').toUpperCase() };
    const docs = await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
    return json(fromDocList(docs));
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
    body.createdAt = new Date();
    if (body.totalAmount) delete body.totalAmount;
    const result = await db.collection('orders').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      if (body.items) {
        body.totalPrice = body.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        const existing = await db.collection('orders').findOne({ _id: docId(orderId) });
        const tax = existing?.tax || 0;
        body.grandTotal = body.totalPrice + tax;
      }
      await db.collection('orders').updateOne({ _id: docId(orderId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await db.collection('orders').deleteOne({ _id: docId(orderId) });
      return json({ message: 'Deleted' });
    }
  }

  const orderStatusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    if (!user) return error('Unauthorized', 401);
    const status = searchParams.get('status') || body.status || '';
    await db.collection('orders').updateOne(
      { _id: docId(orderStatusMatch[1]) },
      { $set: { status: status.toUpperCase() } }
    );
    return json({ message: 'Status updated' });
  }

  // ===================================================================
  // POSTS
  // ===================================================================
  if (path === '/api/posts' && method === 'GET') {
    const docs = await db.collection('posts').find().sort({ createdAt: -1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/posts/published' && method === 'GET') {
    const docs = await db.collection('posts').find({ status: 'PUBLISHED' }).sort({ publishedAt: -1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/posts' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    if (!body.slug) body.slug = (body.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    if (body.status === 'PUBLISHED') body.publishedAt = new Date();
    const result = await db.collection('posts').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch) {
    const postId = postMatch[1];
    if (method === 'GET') {
      const doc = await db.collection('posts').findOne({ _id: docId(postId) });
      if (!doc) return error('Not found', 404);
      return json(fromDoc(doc));
    }
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.status === 'PUBLISHED' && !body.publishedAt) body.publishedAt = new Date();
      await db.collection('posts').updateOne({ _id: docId(postId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await db.collection('posts').deleteOne({ _id: docId(postId) });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // SHIFTS
  // ===================================================================
  if (path === '/api/shifts' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const docs = await db.collection('shift_schedules').find().toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/shifts' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const shifts = body.shifts || body;
    if (Array.isArray(shifts)) {
      await db.collection('shift_schedules').deleteMany({});
      const cleaned = shifts.map(s => ({
        employeeId: s.employeeId, employeeName: s.employeeName,
        role: s.role, position: s.position, dayOfWeek: s.dayOfWeek, shiftType: s.shiftType,
      }));
      if (cleaned.length > 0) await db.collection('shift_schedules').insertMany(cleaned);
    }
    return json({ message: 'Shifts saved' });
  }

  // ===================================================================
  // TRANSACTIONS
  // ===================================================================
  if (path === '/api/transactions' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('type')) filter.type = searchParams.get('type');
    const docs = await db.collection('transactions').find(filter).sort({ date: -1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/transactions' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    body.date = body.date ? new Date(body.date) : new Date();
    const result = await db.collection('transactions').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  // ===================================================================
  // INGREDIENTS
  // ===================================================================
  if (path === '/api/ingredients' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const docs = await db.collection('ingredients').find().toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/ingredients' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await db.collection('ingredients').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const ingMatch = path.match(/^\/api\/ingredients\/([^/]+)$/);
  if (ingMatch) {
    const ingId = ingMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      await db.collection('ingredients').updateOne({ _id: docId(ingId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await db.collection('ingredients').deleteOne({ _id: docId(ingId) });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTES
  // ===================================================================
  if (path === '/api/notes' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const docs = await db.collection('notes').find().toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/notes/dashboard' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const existing = await db.collection('notes').findOne({ content: { $exists: true } });
    if (existing) return json(fromDoc(existing));
    const result = await db.collection('notes').insertOne({ content: 'Welcome to Siap Nyafe!', lastUpdatedBy: 'system', updatedAt: new Date() });
    return json({ id: result.insertedId.toString(), content: 'Welcome to Siap Nyafe!', lastUpdatedBy: 'system', updatedAt: new Date() });
  }

  if (path === '/api/notes/dashboard' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const existing = await db.collection('notes').findOne({ content: { $exists: true } });
    const noteData = { content: body.content, lastUpdatedBy: user.username || 'unknown', updatedAt: new Date() };
    if (existing) {
      await db.collection('notes').updateOne({ _id: existing._id }, { $set: noteData });
    } else {
      await db.collection('notes').insertOne(noteData);
    }
    return json({ message: 'Note saved' });
  }

  if (path === '/api/notes' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    body.lastUpdatedBy = user.username || 'unknown';
    body.updatedAt = new Date();
    const result = await db.collection('notes').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const noteMatch = path.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch) {
    const noteId = noteMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      body.updatedAt = new Date();
      body.lastUpdatedBy = user.username || 'unknown';
      await db.collection('notes').updateOne({ _id: docId(noteId) }, { $set: body });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await db.collection('notes').deleteOne({ _id: docId(noteId) });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTIFICATIONS
  // ===================================================================
  if (path === '/api/notifications' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const docs = await db.collection('notifications').find({ read: false }).sort({ timestamp: -1 }).limit(50).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/notifications' && method === 'POST') {
    body.timestamp = new Date();
    body.read = false;
    const result = await db.collection('notifications').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const notifMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === 'PUT') {
    if (!user) return error('Unauthorized', 401);
    await db.collection('notifications').updateOne({ _id: docId(notifMatch[1]) }, { $set: { read: true } });
    return json({ message: 'Marked as read' });
  }

  // ===================================================================
  // FEEDBACKS
  // ===================================================================
  if (path === '/api/feedbacks' && method === 'GET') {
    const docs = await db.collection('feedbacks').find().sort({ timestamp: -1 }).toArray();
    return json(fromDocList(docs));
  }

  if (path === '/api/feedbacks' && method === 'POST') {
    const jakarta = getJakartaDate();
    const h = jakarta.getUTCHours();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = DAY_MAP[dayNames[jakarta.getUTCDay()]];
    let shiftType = 'MORNING';
    if (h >= 15 && h < 22) shiftType = 'AFTERNOON';
    else if (h >= 22 || h < 7) shiftType = 'EVENING';
    const shiftDocs = await db.collection('shift_schedules').find({ dayOfWeek, shiftType }).toArray();
    body.shiftEmployees = shiftDocs.map(s => s.employeeName).filter(Boolean);
    body.timestamp = new Date();
    const result = await db.collection('feedbacks').insertOne(body);
    return json({ id: result.insertedId.toString(), ...body }, 201);
  }

  const fbMatch = path.match(/^\/api\/feedbacks\/([^/]+)$/);
  if (fbMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await db.collection('feedbacks').deleteOne({ _id: docId(fbMatch[1]) });
    return json({ message: 'Deleted' });
  }

  // ===================================================================
  // ATTENDANCE
  // ===================================================================
  if (path === '/api/attendance' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const employees = await db.collection('employees').find(
      {},
      { projection: { name: 1, employeeId: 1, position: 1, attendanceRecord: 1 } }
    ).toArray();
    const allRecords = [];
    for (const emp of employees) {
      for (const rec of (emp.attendanceRecord || [])) {
        allRecords.push({ ...fromDoc(rec), employeeId: emp.employeeId, employeeName: emp.name, position: emp.position });
      }
    }
    allRecords.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return json(allRecords);
  }

  const attHistoryMatch = path.match(/^\/api\/attendance\/history\/([^/]+)$/);
  if (attHistoryMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const emp = await db.collection('employees').findOne({ employeeId: attHistoryMatch[1] });
    if (!emp) return error('Not found', 404);
    const records = (emp.attendanceRecord || []).map(r => ({ ...fromDoc(r), employeeId: emp.employeeId, employeeName: emp.name, position: emp.position }));
    records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return json(records);
  }

  const attTodayMatch = path.match(/^\/api\/attendance\/today\/([^/]+)$/);
  if (attTodayMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const emp = await db.collection('employees').findOne({ employeeId: attTodayMatch[1] });
    if (!emp) return json(null);
    const today = getJakartaDateStr();
    const todayRec = (emp.attendanceRecord || []).find(r => {
      if (!r.date) return false;
      const ds = typeof r.date === 'string' ? r.date.slice(0, 10) : new Date(r.date).toISOString().slice(0, 10);
      return ds === today;
    });
    return json(todayRec ? fromDoc(todayRec) : null);
  }

  if (path === '/api/attendance/clock-in' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');
    const emp = await db.collection('employees').findOne({ employeeId });
    if (!emp) return error('Employee not found', 404);

    const today = getJakartaDateStr();
    const existingToday = (emp.attendanceRecord || []).find(r => {
      if (!r.date) return false;
      const ds = typeof r.date === 'string' ? r.date.slice(0, 10) : new Date(r.date).toISOString().slice(0, 10);
      return ds === today;
    });
    if (existingToday) return error('Already clocked in today', 400);

    const jDate = getJakartaDate();
    const totalMin = jDate.getUTCHours() * 60 + jDate.getUTCMinutes();
    const dayOfWeek = getDayOfWeek();
    const scheduledShift = await db.collection('shift_schedules').findOne({ employeeId, dayOfWeek });
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

    const newRecord = {
      date: new Date(today),
      present: true,
      clockInTime: jDate,
      shiftType,
      status: isLate ? 'LATE' : (shiftType === 'UNSCHEDULED' ? 'UNSCHEDULED' : 'ON_TIME'),
      minutesLate,
      notes: '',
    };

    await db.collection('employees').updateOne(
      { employeeId },
      { $push: { attendanceRecord: newRecord } }
    );
    return json({ message: 'Clocked in', record: newRecord });
  }

  if (path === '/api/attendance/clock-out' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');
    const emp = await db.collection('employees').findOne({ employeeId });
    if (!emp) return error('Employee not found', 404);

    const today = getJakartaDateStr();
    const records = emp.attendanceRecord || [];
    const idx = records.findIndex(r => {
      if (!r.date) return false;
      const ds = typeof r.date === 'string' ? r.date.slice(0, 10) : new Date(r.date).toISOString().slice(0, 10);
      return ds === today;
    });
    if (idx === -1) return error('No clock-in record found for today', 400);

    const jDate = getJakartaDate();
    const record = records[idx];
    const clockIn = record.clockInTime;
    if (clockIn) {
      const diffMs = jDate.getTime() - new Date(clockIn).getTime();
      const hoursWorked = diffMs / (1000 * 60 * 60);
      const setFields = {
        [`attendanceRecord.${idx}.clockOutTime`]: jDate,
        [`attendanceRecord.${idx}.hoursWorked`]: Math.round(hoursWorked * 100) / 100,
      };
      if (hoursWorked < 7.75 && record.status !== 'UNSCHEDULED') {
        setFields[`attendanceRecord.${idx}.status_alert`] = 'TOO_EARLY';
      }
      await db.collection('employees').updateOne({ employeeId }, { $set: setFields });
    }
    return json({ message: 'Clocked out' });
  }

  // ===================================================================
  // IMAGE UPLOAD
  // ===================================================================
  if (path === '/api/uploads' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);

    // Parse multipart form data
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

    // Also check JSON body for oldFile
    if (!oldFileId && body.oldFile) {
      oldFileId = body.oldFile;
    }

    if (!fileArrayBuffer) return error('No file uploaded', 400);

    // Delete old image if specified
    if (oldFileId) {
      const cleanId = oldFileId.replace(/^\/api\/images\//, '');
      try {
        await db.collection('images').deleteOne({ _id: docId(cleanId) });
      } catch { /* ignore */ }
    }

    const doc = {
      data: Buffer.from(fileArrayBuffer),
      mimetype: fileMime || 'image/webp',
      originalName: fileName || 'upload',
      size: fileArrayBuffer.byteLength,
      createdAt: new Date(),
    };
    const result = await db.collection('images').insertOne(doc);
    return json({ url: `/api/images/${result.insertedId.toString()}` }, 201);
  }

  // ===================================================================
  // SERVE IMAGE
  // ===================================================================
  const imageMatch = path.match(/^\/api\/images\/([^/]+)$/);
  if (imageMatch && method === 'GET') {
    const imageId = imageMatch[1];
    const img = await db.collection('images').findOne({ _id: docId(imageId) });
    if (!img) return error('Image not found', 404);

    const mimeType = img.mimetype || 'image/webp';
    let buffer;

    if (img.data && img.data._bsontype === 'Binary') {
      buffer = img.data.buffer;
    } else if (img.data && img.data.buffer) {
      buffer = img.data.buffer;
    } else if (img.data && typeof img.data === 'object' && img.data.type === 'Buffer') {
      buffer = Buffer.from(img.data);
    } else if (Buffer.isBuffer(img.data)) {
      buffer = img.data;
    } else {
      return error('Invalid image data', 500);
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // ===================================================================
  // PING
  // ===================================================================
  if (path === '/api/ping') {
    return json({ message: 'Siap Nyafe API is running (Cloudflare Worker)' });
  }

  return json({ message: 'API Route Not Found' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        const db = await getDb(env.MONGODB_URI);
        return await handleApi(request, db);
      } catch (err) {
        console.error('API Error:', err);
        return json({ message: err.message || 'Internal error' }, 500);
      }
    }

    return env.ASSETS.fetch(request);
  }
};
