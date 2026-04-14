const supabaseUrl = 'https://wzjuctqbwsfnakltjzxk.supabase.co';
const supabaseAnonKey = 'sb_publishable_E-Lfn2U5i6wkKCNL6RaOlw_C-Q_csqu';

async function apiRequest(path: string, method = 'GET', body: any = null, jwt: string | null = null) {
  const headers: Record<string, string> = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;

  const options: any = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  const res = await fetch(`${supabaseUrl}${path}`, options);
  if (res.status === 204) return { data: null, error: null };
  
  const data = await res.json();
  if (!res.ok) return { error: data.message || 'API Error', data: null };
  return { data, error: null };
}

export const supabaseApi = {
  auth: {
    async signInWithPassword(email: string, password: string) {
      return await apiRequest('/auth/v1/token?grant_type=password', 'POST', { email, password });
    },
    async signUp(email: string, password: string, artistName: string) {
      return await apiRequest('/auth/v1/signup', 'POST', { email, password, options: { data: { artistName } } });
    }
  },
  profiles: {
    async list(jwt: string) { return await apiRequest('/rest/v1/profiles?select=*', 'GET', null, jwt); },
    async get(userId: string, jwt: string) {
      const { data, error } = await apiRequest(`/rest/v1/profiles?id=eq.${userId}&select=*`, 'GET', null, jwt);
      return { data: data?.[0], error };
    },
    async update(userId: string, updates: any, jwt: string) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'PATCH', updates, jwt);
    },
    async delete(userId: string, jwt: string) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'DELETE', null, jwt);
    }
  },
  releases: {
    async list(jwt: string) { return await apiRequest('/rest/v1/releases?select=*&order=created_at.desc', 'GET', null, jwt); },
    async create(release: any, jwt: string) { return await apiRequest('/rest/v1/releases', 'POST', release, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/releases?id=eq.${id}`, 'PATCH', updates, jwt); }
  },
  smartLinks: {
    async list(jwt: string) { return await apiRequest('/rest/v1/smart_links?select=*', 'GET', null, jwt); },
    async create(link: any, jwt: string) { return await apiRequest('/rest/v1/smart_links', 'POST', link, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/smart_links?id=eq.${id}`, 'PATCH', updates, jwt); },
    async delete(id: string, jwt: string) { return await apiRequest(`/rest/v1/smart_links?id=eq.${id}`, 'DELETE', null, jwt); }
  },
  artistWebsites: {
    async list(jwt: string) { return await apiRequest('/rest/v1/artist_websites?select=*', 'GET', null, jwt); },
    async create(site: any, jwt: string) { return await apiRequest('/rest/v1/artist_websites', 'POST', site, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/artist_websites?id=eq.${id}`, 'PATCH', updates, jwt); },
    async delete(id: string, jwt: string) { return await apiRequest(`/rest/v1/artist_websites?id=eq.${id}`, 'DELETE', null, jwt); }
  },
  transactions: {
    async list(jwt: string) { return await apiRequest('/rest/v1/transactions?select=*&order=created_at.desc', 'GET', null, jwt); },
    async create(tx: any, jwt: string) { return await apiRequest('/rest/v1/transactions', 'POST', tx, jwt); }
  },
  withdrawals: {
    async list(jwt: string) { return await apiRequest('/rest/v1/withdrawal_requests?select=*&order=created_at.desc', 'GET', null, jwt); },
    async create(req: any, jwt: string) { return await apiRequest('/rest/v1/withdrawal_requests', 'POST', req, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/withdrawal_requests?id=eq.${id}`, 'PATCH', updates, jwt); }
  },
  reports: {
    async list(jwt: string) { return await apiRequest('/rest/v1/reports?select=*&order=created_at.desc', 'GET', null, jwt); },
    async create(report: any, jwt: string) { return await apiRequest('/rest/v1/reports', 'POST', report, jwt); },
    async delete(id: string, jwt: string) { return await apiRequest(`/rest/v1/reports?id=eq.${id}`, 'DELETE', null, jwt); }
  },
  settings: {
    async list() { return await apiRequest('/rest/v1/system_settings?select=*', 'GET'); },
    async update(key: string, value: any, jwt: string) {
      return await apiRequest(`/rest/v1/system_settings?key=eq.${key}`, 'PATCH', { value }, jwt);
    }
  },
  fields: {
    async list() { return await apiRequest('/rest/v1/dynamic_fields?select=*&order=sort_order.asc', 'GET'); },
    async create(field: any, jwt: string) { return await apiRequest('/rest/v1/dynamic_fields', 'POST', field, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/dynamic_fields?id=eq.${id}`, 'PATCH', updates, jwt); },
    async delete(id: string, jwt: string) { return await apiRequest(`/rest/v1/dynamic_fields?id=eq.${id}`, 'DELETE', null, jwt); }
  },
  statuses: {
    async list() { return await apiRequest('/rest/v1/release_statuses?select=*&order=sort_order.asc', 'GET'); },
    async create(status: any, jwt: string) { return await apiRequest('/rest/v1/release_statuses', 'POST', status, jwt); },
    async update(id: string, updates: any, jwt: string) { return await apiRequest(`/rest/v1/release_statuses?id=eq.${id}`, 'PATCH', updates, jwt); },
    async delete(id: string, jwt: string) { return await apiRequest(`/rest/v1/release_statuses?id=eq.${id}`, 'DELETE', null, jwt); }
  }
};