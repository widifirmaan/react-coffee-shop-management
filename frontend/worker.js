import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const JWT_SECRET_KEY = 'siap-nyafe-jwt-secret-2024';
const DB_NAME = 'coffeeshop';
const IMAGE_COLLECTION = 'images';

function getDataApiUrl(env) {
  return env.MONGODB_DATA_API_URL || 'https://data.mongodb-api.com/app/data-qwerty/endpoint/data/v1';
}

function getDataSource(env) {
  return env.MONGODB_DATA_SOURCE || 'Cluster0';
}

function getApiKey(env) {
  return env.MONGODB_DATA_API_KEY;
}

async function dataApi(env, action, collection, body = {}) {
  const url = `${getDataApiUrl(env)}/action/${action}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': getApiKey(env),
    },
    body: JSON.stringify({
      dataSource: getDataSource(env),
      database: DB_NAME,
      collection,
      ...body,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Data API error ${response.status}: ${text}`);
  }
  return response.json();
}

function docId(id) {
  return { $oid: id };
}

function fromDoc(doc) {
  if (!doc) return null;
  const result = { ...doc };
  if (result._id && result._id.$oid) {
    result.id = result._id.$oid;
  }
  delete result._id;
  delete result.__v;
  delete result.password;
  return result;
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

async function base64Encode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

async function authenticate(env, request) {
  const token = getToken(request);
  if (!token) return null;
  return verifyJwt(token);
}

function requireRole(user, roles) {
  if (!user) return false;
  if (!roles || roles.length === 0) return true;
  return roles.some(r => r.toUpperCase() === user.role?.toUpperCase());
}

function getIdFromPath(pathname, prefix) {
  const parts = pathname.replace(prefix, '').split('/');
  return parts[0] || null;
}

const COLLECTION_MAP = {
  menus: 'menus',
  categories: 'categories',
  posts: 'posts',
  employees: 'employees',
  orders: 'orders',
  ingredients: 'ingredients',
  transactions: 'transactions',
  notes: 'notes',
  notifications: 'notifications',
  feedbacks: 'feedbacks',
  config: 'shop_config',
  shifts: 'shift_schedules',
  attendance: 'employees',
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_MAP = { Sun: 'SUNDAY', Mon: 'MONDAY', Tue: 'TUESDAY', Wed: 'WEDNESDAY', Thu: 'THURSDAY', Fri: 'FRIDAY', Sat: 'SATURDAY' };

function getJakartaDate() {
  const now = new Date();
  const jakarta = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return jakarta;
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

function getJakartaHour() {
  const j = getJakartaDate();
  return j.getUTCHours();
}

async function handleApi(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;
  const searchParams = url.searchParams;
  const user = await authenticate(env, request);

  // Parse body for POST/PUT/PATCH
  let body = {};
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Handled separately in upload route
    } else if (contentType.includes('application/json')) {
      try { body = await request.json(); } catch { body = {}; }
    }
  }

  // ===================================================================
  // AUTH ROUTES
  // ===================================================================
  if (path === '/api/auth/login' && method === 'POST') {
    const { username, email, password } = body;
    if (!password) return error('Password is required');
    const filter = {};
    if (username) filter.username = username;
    else if (email) filter.email = email;
    else return error('Username or email is required');

    const result = await dataApi(env, 'findOne', 'employees', { filter });
    const emp = result?.document;
    if (!emp) return error('Invalid credentials', 401);

    const pwdValid = await bcrypt.compare(password, emp.password);
    if (!pwdValid) return error('Invalid credentials', 401);

    const userObj = fromDoc(emp);
    const token = await signJwt({
      id: userObj.id,
      username: userObj.username,
      email: userObj.email,
      role: userObj.role,
      employeeId: userObj.employeeId,
    });

    const responseData = { token, user: userObj };
    const response = json(responseData);
    response.headers.append('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    return response;
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const response = json({ message: 'Logged out' });
    response.headers.append('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
    return response;
  }

  if (path === '/api/auth/me' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'findOne', 'employees', { filter: { _id: docId(user.id) } });
    if (!result?.document) return error('User not found', 404);
    return json(fromDoc(result.document));
  }

  if (path === '/api/auth/check' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    return json({ valid: true, user });
  }

  // ===================================================================
  // EMPLOYEE ROUTES
  // ===================================================================
  if (path === '/api/employees' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('role')) filter.role = searchParams.get('role');
    if (searchParams.get('active') !== null) filter.active = searchParams.get('active') === 'true';
    if (searchParams.get('search')) {
      const s = searchParams.get('search');
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { employeeId: { $regex: s, $options: 'i' } },
      ];
    }
    const result = await dataApi(env, 'find', 'employees', { filter, sort: { name: 1 } });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/employees' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
    const result = await dataApi(env, 'insertOne', 'employees', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const empMatch = path.match(/^\/api\/employees\/([^/]+)$/);
  if (empMatch) {
    const empId = empMatch[1];
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.password) {
        body.password = await bcrypt.hash(body.password, SALT_ROUNDS);
      } else {
        delete body.password;
      }
      await dataApi(env, 'updateOne', 'employees', { filter: { _id: docId(empId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await dataApi(env, 'deleteOne', 'employees', { filter: { _id: docId(empId) } });
      return json({ message: 'Deleted' });
    }
  }

  const empStatusMatch = path.match(/^\/api\/employees\/([^/]+)\/status$/);
  if (empStatusMatch && method === 'PATCH') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const result = await dataApi(env, 'findOne', 'employees', { filter: { _id: docId(empStatusMatch[1]) } });
    if (!result?.document) return error('Not found', 404);
    const current = !result.document.active;
    await dataApi(env, 'updateOne', 'employees', { filter: { _id: docId(empStatusMatch[1]) }, update: { $set: { active: current } } });
    return json({ message: 'Status toggled', active: current });
  }

  // ===================================================================
  // MENU ROUTES
  // ===================================================================
  if (path === '/api/menus' && method === 'GET') {
    const filter = {};
    if (searchParams.get('category')) filter.category = searchParams.get('category');
    if (searchParams.get('search')) filter.name = { $regex: searchParams.get('search'), $options: 'i' };
    const result = await dataApi(env, 'find', 'menus', { filter });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/menus' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'insertOne', 'menus', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const menuMatch = path.match(/^\/api\/menus\/([^/]+)$/);
  if (menuMatch) {
    const menuId = menuMatch[1];
    if (method === 'GET') {
      const result = await dataApi(env, 'findOne', 'menus', { filter: { _id: docId(menuId) } });
      if (!result?.document) return error('Not found', 404);
      return json(fromDoc(result.document));
    }
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      await dataApi(env, 'updateOne', 'menus', { filter: { _id: docId(menuId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await dataApi(env, 'deleteOne', 'menus', { filter: { _id: docId(menuId) } });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // CATEGORY ROUTES
  // ===================================================================
  if (path === '/api/categories' && method === 'GET') {
    const result = await dataApi(env, 'find', 'categories', { sort: { name: 1 } });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/categories' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'insertOne', 'categories', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const catMatch = path.match(/^\/api\/categories\/([^/]+)$/);
  if (catMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await dataApi(env, 'deleteOne', 'categories', { filter: { _id: docId(catMatch[1]) } });
    return json({ message: 'Deleted' });
  }

  // ===================================================================
  // CONFIG ROUTES
  // ===================================================================
  if (path === '/api/config' && method === 'GET') {
    let result = await dataApi(env, 'findOne', 'shop_config', {});
    if (!result?.document) {
      const defaultConfig = {
        shopName: 'Siap Nyafe',
        websiteTitle: 'Siap Nyafe - Excellent Coffee',
        marqueeText: 'Welcome to Siap Nyafe Coffee Shop!',
        infoTitle: 'Our Story',
        infoContent: 'Born in Jakarta, brewed for the bold.',
        infoFooter1: 'EST. 2024',
        infoFooter2: 'JAKARTA',
      };
      const ins = await dataApi(env, 'insertOne', 'shop_config', { document: defaultConfig });
      return json(fromDoc(ins.document));
    }
    return json(fromDoc(result.document));
  }

  if (path === '/api/config' && method === 'PUT') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    const existing = await dataApi(env, 'findOne', 'shop_config', {});
    if (existing?.document) {
      await dataApi(env, 'updateOne', 'shop_config', { filter: { _id: existing.document._id }, update: { $set: body } });
    } else {
      await dataApi(env, 'insertOne', 'shop_config', { document: body });
    }
    return json({ message: 'Config updated' });
  }

  // ===================================================================
  // ORDER ROUTES
  // ===================================================================
  if (path === '/api/orders' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('status')) filter.status = searchParams.get('status').toUpperCase();
    if (searchParams.get('excludeStatus')) filter.status = { $ne: searchParams.get('excludeStatus').toUpperCase() };
    const result = await dataApi(env, 'find', 'orders', { filter, sort: { createdAt: -1 } });
    return json(fromDocList(result.documents));
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
    body.createdAt = new Date().toISOString();
    if (body.totalAmount) delete body.totalAmount;
    const result = await dataApi(env, 'insertOne', 'orders', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      if (body.items) {
        body.totalPrice = body.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
        const existing = await dataApi(env, 'findOne', 'orders', { filter: { _id: docId(orderId) } });
        const tax = existing?.document?.tax || 0;
        body.grandTotal = body.totalPrice + tax;
      }
      await dataApi(env, 'updateOne', 'orders', { filter: { _id: docId(orderId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await dataApi(env, 'deleteOne', 'orders', { filter: { _id: docId(orderId) } });
      return json({ message: 'Deleted' });
    }
  }

  const orderStatusMatch = path.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (orderStatusMatch && method === 'PATCH') {
    if (!user) return error('Unauthorized', 401);
    const status = searchParams.get('status') || body.status || '';
    await dataApi(env, 'updateOne', 'orders', { filter: { _id: docId(orderStatusMatch[1]) }, update: { $set: { status: status.toUpperCase() } } });
    return json({ message: 'Status updated' });
  }

  // ===================================================================
  // POST ROUTES
  // ===================================================================
  if (path === '/api/posts' && method === 'GET') {
    const result = await dataApi(env, 'find', 'posts', { sort: { createdAt: -1 } });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/posts/published' && method === 'GET') {
    const result = await dataApi(env, 'find', 'posts', {
      filter: { status: 'PUBLISHED' },
      sort: { publishedAt: -1 },
    });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/posts' && method === 'POST') {
    if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
    if (!body.slug) {
      body.slug = (body.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    }
    if (body.status === 'PUBLISHED') body.publishedAt = new Date().toISOString();
    const result = await dataApi(env, 'insertOne', 'posts', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch) {
    const postId = postMatch[1];
    if (method === 'GET') {
      const result = await dataApi(env, 'findOne', 'posts', { filter: { _id: docId(postId) } });
      if (!result?.document) return error('Not found', 404);
      return json(fromDoc(result.document));
    }
    if (method === 'PUT') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      if (body.title && !body.slug?.includes('-')) {
        body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      }
      if (body.status === 'PUBLISHED') body.publishedAt = new Date().toISOString();
      await dataApi(env, 'updateOne', 'posts', { filter: { _id: docId(postId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user || !requireRole(user, ['Manager'])) return error('Forbidden', 403);
      await dataApi(env, 'deleteOne', 'posts', { filter: { _id: docId(postId) } });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // SHIFT ROUTES
  // ===================================================================
  if (path === '/api/shifts' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'shift_schedules', {});
    return json(fromDocList(result.documents));
  }

  if (path === '/api/shifts' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const shifts = body.shifts || body;
    if (Array.isArray(shifts)) {
      await dataApi(env, 'deleteMany', 'shift_schedules', { filter: {} });
      const cleaned = shifts.map(s => ({
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        role: s.role,
        position: s.position,
        dayOfWeek: s.dayOfWeek,
        shiftType: s.shiftType,
      }));
      if (cleaned.length > 0) {
        await dataApi(env, 'insertMany', 'shift_schedules', { documents: cleaned });
      }
    }
    return json({ message: 'Shifts saved' });
  }

  // ===================================================================
  // TRANSACTION ROUTES
  // ===================================================================
  if (path === '/api/transactions' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const filter = {};
    if (searchParams.get('type')) filter.type = searchParams.get('type');
    const result = await dataApi(env, 'find', 'transactions', { filter, sort: { date: -1 } });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/transactions' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    body.date = body.date || new Date().toISOString();
    const result = await dataApi(env, 'insertOne', 'transactions', { document: body });
    return json(fromDoc(result.document), 201);
  }

  // ===================================================================
  // INGREDIENT ROUTES
  // ===================================================================
  if (path === '/api/ingredients' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'ingredients', {});
    return json(fromDocList(result.documents));
  }

  if (path === '/api/ingredients' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'insertOne', 'ingredients', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const ingMatch = path.match(/^\/api\/ingredients\/([^/]+)$/);
  if (ingMatch) {
    const ingId = ingMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      await dataApi(env, 'updateOne', 'ingredients', { filter: { _id: docId(ingId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await dataApi(env, 'deleteOne', 'ingredients', { filter: { _id: docId(ingId) } });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTE ROUTES
  // ===================================================================
  if (path === '/api/notes' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'notes', {});
    return json(fromDocList(result.documents));
  }

  if (path === '/api/notes/dashboard' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'notes', { filter: { content: { $exists: true } }, limit: 1 });
    if (result?.documents?.length > 0) {
      return json(fromDoc(result.documents[0]));
    }
    const ins = await dataApi(env, 'insertOne', 'notes', { document: { content: 'Welcome to Siap Nyafe!', lastUpdatedBy: 'system', updatedAt: new Date().toISOString() } });
    return json(fromDoc(ins.document));
  }

  if (path === '/api/notes/dashboard' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const existing = await dataApi(env, 'find', 'notes', { filter: { content: { $exists: true } }, limit: 1 });
    const noteData = { content: body.content, lastUpdatedBy: user.username || 'unknown', updatedAt: new Date().toISOString() };
    if (existing?.documents?.length > 0) {
      await dataApi(env, 'updateOne', 'notes', { filter: { _id: existing.documents[0]._id }, update: { $set: noteData } });
    } else {
      await dataApi(env, 'insertOne', 'notes', { document: noteData });
    }
    return json({ message: 'Note saved' });
  }

  if (path === '/api/notes' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    body.lastUpdatedBy = user.username || 'unknown';
    body.updatedAt = new Date().toISOString();
    const result = await dataApi(env, 'insertOne', 'notes', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const noteMatch = path.match(/^\/api\/notes\/([^/]+)$/);
  if (noteMatch) {
    const noteId = noteMatch[1];
    if (method === 'PUT') {
      if (!user) return error('Unauthorized', 401);
      body.updatedAt = new Date().toISOString();
      body.lastUpdatedBy = user.username || 'unknown';
      await dataApi(env, 'updateOne', 'notes', { filter: { _id: docId(noteId) }, update: { $set: body } });
      return json({ message: 'Updated' });
    }
    if (method === 'DELETE') {
      if (!user) return error('Unauthorized', 401);
      await dataApi(env, 'deleteOne', 'notes', { filter: { _id: docId(noteId) } });
      return json({ message: 'Deleted' });
    }
  }

  // ===================================================================
  // NOTIFICATION ROUTES
  // ===================================================================
  if (path === '/api/notifications' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'notifications', {
      filter: { read: false },
      sort: { timestamp: -1 },
      limit: 50,
    });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/notifications' && method === 'POST') {
    body.timestamp = new Date().toISOString();
    body.read = false;
    const result = await dataApi(env, 'insertOne', 'notifications', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const notifMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (notifMatch && method === 'PUT') {
    if (!user) return error('Unauthorized', 401);
    await dataApi(env, 'updateOne', 'notifications', { filter: { _id: docId(notifMatch[1]) }, update: { $set: { read: true } } });
    return json({ message: 'Marked as read' });
  }

  // ===================================================================
  // FEEDBACK ROUTES
  // ===================================================================
  if (path === '/api/feedbacks' && method === 'GET') {
    const result = await dataApi(env, 'find', 'feedbacks', { sort: { timestamp: -1 } });
    return json(fromDocList(result.documents));
  }

  if (path === '/api/feedbacks' && method === 'POST') {
    const now = new Date();
    const jakarta = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const h = jakarta.getUTCHours();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = DAY_MAP[dayNames[jakarta.getUTCDay()]];
    let shiftType = 'MORNING';
    if (h >= 15 && h < 22) shiftType = 'AFTERNOON';
    else if (h >= 22 || h < 7) shiftType = 'EVENING';

    const shiftResult = await dataApi(env, 'find', 'shift_schedules', { filter: { dayOfWeek, shiftType } });
    const staff = (shiftResult?.documents || []).map(s => s.employeeName).filter(Boolean);
    body.shiftEmployees = staff;
    body.timestamp = new Date().toISOString();
    const result = await dataApi(env, 'insertOne', 'feedbacks', { document: body });
    return json(fromDoc(result.document), 201);
  }

  const fbMatch = path.match(/^\/api\/feedbacks\/([^/]+)$/);
  if (fbMatch && method === 'DELETE') {
    if (!user) return error('Unauthorized', 401);
    await dataApi(env, 'deleteOne', 'feedbacks', { filter: { _id: docId(fbMatch[1]) } });
    return json({ message: 'Deleted' });
  }

  // ===================================================================
  // ATTENDANCE ROUTES
  // ===================================================================
  if (path === '/api/attendance' && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'find', 'employees', {
      filter: {},
      projection: { name: 1, employeeId: 1, position: 1, attendanceRecord: 1 },
    });
    const docs = result?.documents || [];
    const allRecords = [];
    for (const emp of docs) {
      const records = emp.attendanceRecord || [];
      for (const rec of records) {
        allRecords.push({
          ...fromDoc(rec),
          employeeId: emp.employeeId,
          employeeName: emp.name,
          position: emp.position,
        });
      }
    }
    allRecords.sort((a, b) => {
      const da = a.date?.$date || a.date;
      const db = b.date?.$date || b.date;
      return new Date(db) - new Date(da);
    });
    return json(allRecords);
  }

  const attHistoryMatch = path.match(/^\/api\/attendance\/history\/([^/]+)$/);
  if (attHistoryMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'findOne', 'employees', { filter: { employeeId: attHistoryMatch[1] } });
    if (!result?.document) return error('Not found', 404);
    const emp = result.document;
    const records = (emp.attendanceRecord || []).map(r => ({
      ...fromDoc(r),
      employeeId: emp.employeeId,
      employeeName: emp.name,
      position: emp.position,
    }));
    records.sort((a, b) => {
      const da = a.date?.$date || a.date;
      const db = b.date?.$date || b.date;
      return new Date(db) - new Date(da);
    });
    return json(records);
  }

  const attTodayMatch = path.match(/^\/api\/attendance\/today\/([^/]+)$/);
  if (attTodayMatch && method === 'GET') {
    if (!user) return error('Unauthorized', 401);
    const result = await dataApi(env, 'findOne', 'employees', { filter: { employeeId: attTodayMatch[1] } });
    if (!result?.document) return json(null);
    const today = getJakartaDateStr();
    const records = result.document.attendanceRecord || [];
    const todayRec = records.find(r => {
      const d = r.date?.$date || r.date;
      if (!d) return false;
      const ds = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
      return ds === today;
    });
    return json(todayRec ? fromDoc(todayRec) : null);
  }

  if (path === '/api/attendance/clock-in' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');

    const empResult = await dataApi(env, 'findOne', 'employees', { filter: { employeeId } });
    if (!empResult?.document) return error('Employee not found', 404);
    const emp = empResult.document;

    const today = getJakartaDateStr();
    const records = emp.attendanceRecord || [];
    const existingToday = records.find(r => {
      const d = r.date?.$date || r.date;
      if (!d) return false;
      const ds = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
      return ds === today;
    });
    if (existingToday) return error('Already clocked in today', 400);

    const jDate = getJakartaDate();
    const hour = jDate.getUTCHours();
    const min = jDate.getUTCMinutes();
    const totalMin = hour * 60 + min;

    const dayOfWeek = getDayOfWeek();
    const shiftResult = await dataApi(env, 'find', 'shift_schedules', {
      filter: { employeeId, dayOfWeek },
      limit: 1,
    });
    const scheduledShift = shiftResult?.documents?.[0];
    let shiftType = 'UNSCHEDULED';
    let isLate = false;
    let minutesLate = 0;

    if (scheduledShift) {
      shiftType = scheduledShift.shiftType || 'UNSCHEDULED';
      const expectedStart = { MORNING: 8, AFTERNOON: 15, EVENING: 22 }[shiftType];
      if (expectedStart !== undefined) {
        const expectedMin = expectedStart * 60;
        const graceMin = 15;
        if (totalMin > expectedMin + graceMin) {
          isLate = true;
          minutesLate = totalMin - expectedMin;
        }
      }
    }

    const clockInTime = jDate.toISOString();
    const status = isLate ? 'LATE' : (shiftType === 'UNSCHEDULED' ? 'UNSCHEDULED' : 'ON_TIME');

    const newRecord = {
      date: today,
      present: true,
      clockInTime,
      shiftType,
      status,
      minutesLate,
      notes: '',
    };

    await dataApi(env, 'updateOne', 'employees', {
      filter: { employeeId },
      update: { $push: { attendanceRecord: newRecord } },
    });

    return json({ message: 'Clocked in', record: newRecord });
  }

  if (path === '/api/attendance/clock-out' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);
    const { employeeId } = body;
    if (!employeeId) return error('employeeId required');

    const empResult = await dataApi(env, 'findOne', 'employees', { filter: { employeeId } });
    if (!empResult?.document) return error('Employee not found', 404);
    const emp = empResult.document;

    const today = getJakartaDateStr();
    const records = emp.attendanceRecord || [];
    const idx = records.findIndex(r => {
      const d = r.date?.$date || r.date;
      if (!d) return false;
      const ds = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
      return ds === today;
    });
    if (idx === -1) return error('No clock-in record found for today', 400);

    const jDate = getJakartaDate();
    const clockOutTime = jDate.toISOString();
    const record = records[idx];
    const clockIn = record.clockInTime?.$date || record.clockInTime;
    if (clockIn) {
      const diffMs = jDate.getTime() - new Date(clockIn).getTime();
      const hoursWorked = diffMs / (1000 * 60 * 60);
      const field = `attendanceRecord.${idx}.clockOutTime`;
      const fieldHours = `attendanceRecord.${idx}.hoursWorked`;
      const fieldAlert = `attendanceRecord.${idx}.status_alert`;
      const update = { $set: { [field]: clockOutTime, [fieldHours]: Math.round(hoursWorked * 100) / 100 } };
      if (hoursWorked < 7.75 && record.status !== 'UNSCHEDULED') {
        update.$set[fieldAlert] = 'TOO_EARLY';
      }
      await dataApi(env, 'updateOne', 'employees', {
        filter: { employeeId },
        update,
      });
    }

    return json({ message: 'Clocked out', clockOutTime });
  }

  // ===================================================================
  // IMAGE UPLOAD ROUTE
  // ===================================================================
  if (path === '/api/uploads' && method === 'POST') {
    if (!user) return error('Unauthorized', 401);

    // Delete old image if requested
    const oldFile = body.oldFile || '';
    if (oldFile.startsWith('/api/images/')) {
      const oldId = oldFile.replace('/api/images/', '');
      try {
        await dataApi(env, 'deleteOne', IMAGE_COLLECTION, { filter: { _id: docId(oldId) } });
      } catch { /* ignore */ }
    }

    // Parse multipart form data
    let fileBuffer = null;
    let fileMime = '';
    let fileName = '';
    try {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          fileBuffer = await value.arrayBuffer();
          fileMime = value.type;
          fileName = value.name;
          break;
        }
      }
    } catch { /* not multipart */ }

    if (!fileBuffer) return error('No file uploaded', 400);

    // Store as base64 in MongoDB Data API
    const b64 = await base64Encode(fileBuffer);
    const doc = {
      data: b64,
      mimetype: fileMime || 'image/webp',
      originalName: fileName || 'upload',
      size: fileBuffer.byteLength,
      createdAt: new Date().toISOString(),
    };
    const result = await dataApi(env, 'insertOne', IMAGE_COLLECTION, { document: doc });
    const insertedId = result?.document?._id?.$oid || result?.insertedId;
    return json({ url: `/api/images/${insertedId}` }, 201);
  }

  // ===================================================================
  // SERVE IMAGE
  // ===================================================================
  const imageMatch = path.match(/^\/api\/images\/([^/]+)$/);
  if (imageMatch && method === 'GET') {
    const imageId = imageMatch[1];
    const result = await dataApi(env, 'findOne', IMAGE_COLLECTION, { filter: { _id: docId(imageId) } });
    if (!result?.document) return error('Image not found', 404);
    const img = result.document;
    let binaryData = img.data;
    let mimeType = img.mimetype || 'image/webp';

    // Data API returns base64 strings
    if (typeof binaryData === 'string') {
      const binaryStr = atob(binaryData);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return new Response(bytes, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': bytes.length.toString(),
        },
      });
    }

    // Handle case where binary is already stored as binary in MongoDB
    if (binaryData && binaryData.buffer) {
      return new Response(binaryData.buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return error('Invalid image data', 500);
  }

  // ===================================================================
  // SEEDER ROUTE
  // ===================================================================
  if ((path === '/api/seeder/run' || path === '/api/seeder') && ['GET', 'POST'].includes(method)) {
    const employeeCount = await dataApi(env, 'find', 'employees', { limit: 1 });
    if (employeeCount?.documents?.length > 0) {
      return json({ message: 'Database already has data. Seeder skipped.' });
    }

    const employees = [
      { employeeId: 'EMP001', name: 'Budi Santoso', username: 'budi', password: await bcrypt.hash('budi123', SALT_ROUNDS), role: 'MANAGER', position: 'Manager', email: 'budi@siapnyafe.com', active: true, salary: 5000000 },
      { employeeId: 'EMP002', name: 'Siti Rahayu', username: 'siti', password: await bcrypt.hash('siti123', SALT_ROUNDS), role: 'BARISTA', position: 'Barista', email: 'siti@siapnyafe.com', active: true, salary: 3500000 },
      { employeeId: 'EMP003', name: 'Ahmad Hidayat', username: 'ahmad', password: await bcrypt.hash('ahmad123', SALT_ROUNDS), role: 'CASHIER', position: 'Cashier', email: 'ahmad@siapnyafe.com', active: true, salary: 3500000 },
      { employeeId: 'EMP004', name: 'Dewi Lestari', username: 'dewi', password: await bcrypt.hash('dewi123', SALT_ROUNDS), role: 'BAKER', position: 'Baker', email: 'dewi@siapnyafe.com', active: true, salary: 3500000 },
      { employeeId: 'EMP005', name: 'Rudi Hermawan', username: 'rudi', password: await bcrypt.hash('rudi123', SALT_ROUNDS), role: 'CLEANER', position: 'Cleaner', email: 'rudi@siapnyafe.com', active: true, salary: 3000000 },
    ];
    for (const emp of employees) {
      await dataApi(env, 'insertOne', 'employees', { document: emp });
    }

    const categories = [
      { name: 'Coffee' },
      { name: 'Non-Coffee' },
      { name: 'Snacks' },
    ];
    for (const cat of categories) {
      await dataApi(env, 'insertOne', 'categories', { document: cat });
    }

    const menus = [
      { name: 'Espresso', category: 'Coffee', price: 25000, available: true },
      { name: 'Cappuccino', category: 'Coffee', price: 35000, available: true },
      { name: 'Latte', category: 'Coffee', price: 40000, available: true },
      { name: 'Matcha Latte', category: 'Non-Coffee', price: 45000, available: true },
    ];
    for (const menu of menus) {
      await dataApi(env, 'insertOne', 'menus', { document: menu });
    }

    const config = { shopName: 'Siap Nyafe', websiteTitle: 'Siap Nyafe - Excellent Coffee', marqueeText: 'Welcome to Siap Nyafe Coffee Shop!', infoTitle: 'Our Story', infoContent: 'Born in Jakarta, brewed for the bold.', infoFooter1: 'EST. 2024', infoFooter2: 'JAKARTA' };
    await dataApi(env, 'insertOne', 'shop_config', { document: config });

    // Generate shifts
    const shifts = [];
    const allShifts = ['MORNING', 'AFTERNOON', 'EVENING'];
    for (const day of DAYS) {
      for (const emp of employees) {
        for (const st of allShifts) {
          shifts.push({ employeeId: emp.employeeId, employeeName: emp.name, role: emp.role, position: emp.position, dayOfWeek: day, shiftType: st });
        }
      }
    }
    if (shifts.length > 0) {
      await dataApi(env, 'insertMany', 'shift_schedules', { documents: shifts });
    }

    return json({ message: 'Database seeded successfully!' });
  }

  // ===================================================================
  // PING
  // ===================================================================
  if (path === '/api/ping') {
    return json({ message: 'Siap Nyafe API is running (Cloudflare Worker)' });
  }

  // ===================================================================
  // FALLBACK: 404 for unknown API routes
  // ===================================================================
  return json({ message: 'API Route Not Found' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, ctx);
      } catch (err) {
        console.error('API Error:', err);
        return new Response(JSON.stringify({ message: err.message || 'Internal error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
