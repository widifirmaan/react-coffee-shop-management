export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const apiBase = env.API_BASE_URL || 'http://localhost:3000';
      return fetch(apiBase + url.pathname + url.search, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      });
    }

    return env.ASSETS.fetch(request);
  }
};
