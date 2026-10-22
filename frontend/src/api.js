const CANDIDATE_BASES = [
  import.meta.env?.VITE_API_BASE,
  "http://localhost:5000",
  "http://localhost",
].filter(Boolean);

let activeBaseUrl = CANDIDATE_BASES[0];

async function fetchWithFallback(path, options = {}) {
  // First attempt with currently active base
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${activeBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return res;
    // If it's a 429 or 400 from our API tester, return it so the caller gets response payload
    if (path.startsWith("/products") || path.startsWith("/profile") || path.startsWith("/login") || path.startsWith("/payment")) {
      return res;
    }
  } catch {
    // try fallback candidates
  }

  // Try the other candidates
  for (const candidate of CANDIDATE_BASES) {
    if (candidate === activeBaseUrl) continue;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${candidate}${path}`, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok || (res.status === 429)) {
        activeBaseUrl = candidate;
        return res;
      }
    } catch {
      // try next candidate
    }
  }

  // If all failed, make one standard request to throw regular error
  return fetch(`${activeBaseUrl}${path}`, options);
}

async function fetchJSON(path) {
  const res = await fetchWithFallback(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRules() {
  return fetchJSON("/api/dashboard/rules");
}

export async function fetchMetrics() {
  return fetchJSON("/api/dashboard/metrics");
}

export async function fetchRedisInfo() {
  return fetchJSON("/api/dashboard/redis");
}

export async function fetchArchitecture() {
  return fetchJSON("/api/dashboard/architecture");
}

export async function sendTestRequest(endpoint, method, headers = {}) {
  const res = await fetchWithFallback(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: method === "POST" ? JSON.stringify({}) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: res.statusText || `Status ${res.status}` };
  }

  return {
    statusCode: res.status,
    body: data,
    headers: Object.fromEntries(res.headers.entries()),
  };
}

export async function sendBurstRequests(endpoint, method, count, headers = {}) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const startTime = Date.now();
    try {
      const result = await sendTestRequest(endpoint, method, headers);
      results.push({
        index: i + 1,
        ...result,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      results.push({
        index: i + 1,
        statusCode: 0,
        body: { message: err.message },
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        error: true,
      });
    }
  }
  return results;
}
