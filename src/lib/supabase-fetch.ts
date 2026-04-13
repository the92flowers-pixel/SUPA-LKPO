/**
 * Расширенный API клиент Supabase.
 * Добавлена поддержка Смарт-линков, Сайтов артистов и Админ-панели.
 */

const supabaseUrl = 'https://dhouzqxqsmchbxmxrhnh.supabase.co';
const supabaseAnonKey = 'sb_publishable_dOp-xTq5eAZYnUrdedlfTA_WwaNV84P';

async function apiRequest(path, method = 'GET', body = null, jwt = null) {
  const headers = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${supabaseUrl}${path}`, options);
  const data = await res.json();
  
  if (!res.ok) {
    return { error: data.message || data.error_description || data.error || 'API Request failed', data: null };
  }
  
  return { data, error: null };
}

export const supabaseApi = {
  auth: {
    async signInWithPassword(email, password) {
      return await apiRequest('/auth/v1/token?grant_type=password', 'POST', { email, password });
    },
    async signUp(email, password, artistName) {
      return await apiRequest('/auth/v1/signup', 'POST', { 
        email, 
        password,
        options: { data: { artistName } }
      });
    }
  },
  
  profiles: {
    async get(userId, jwt) {
      const { data, error } = await apiRequest(`/rest/v1/profiles?id=eq.${userId}&select=*`, 'GET', null, jwt);
      return { data: data?.[0], error };
    },
    async listAll(jwt) {
      return await apiRequest('/rest/v1/profiles?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async update(userId, updates, jwt) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'PATCH', updates, jwt);
    }
  },

  releases: {
    async list(jwt) {
      return await apiRequest('/rest/v1/releases?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async listAllAdmin(jwt) {
      return await apiRequest('/rest/v1/releases?select=*,profiles(artist_name)&order=created_at.desc', 'GET', null, jwt);
    },
    async create(release, jwt) {
      return await apiRequest('/rest/v1/releases', 'POST', release, jwt);
    },
    async update(id, updates, jwt) {
      return await apiRequest(`/rest/v1/releases?id=eq.${id}`, 'PATCH', updates, jwt);
    }
  },

  smartLinks: {
    async list(jwt) {
      return await apiRequest('/rest/v1/smart_links?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async getBySlug(slug) {
      const { data, error } = await apiRequest(`/rest/v1/smart_links?slug=eq.${slug}&select=*`, 'GET');
      return { data: data?.[0], error };
    },
    async create(link, jwt) {
      return await apiRequest('/rest/v1/smart_links', 'POST', link, jwt);
    },
    async delete(id, jwt) {
      return await apiRequest(`/rest/v1/smart_links?id=eq.${id}`, 'DELETE', null, jwt);
    }
  },

  artistWebsites: {
    async list(jwt) {
      return await apiRequest('/rest/v1/artist_websites?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async getBySlug(slug) {
      const { data, error } = await apiRequest(`/rest/v1/artist_websites?slug=eq.${slug}&select=*`, 'GET');
      return { data: data?.[0], error };
    },
    async create(site, jwt) {
      return await apiRequest('/rest/v1/artist_websites', 'POST', site, jwt);
    }
  },

  settings: {
    async get(key) {
      const { data, error } = await apiRequest(`/rest/v1/system_settings?key=eq.${key}&select=value`, 'GET');
      return { data: data?.[0]?.value, error };
    },
    async update(key, value, jwt) {
      return await apiRequest(`/rest/v1/system_settings?key=eq.${key}`, 'UPSERT', { key, value }, jwt);
    }
  }
};
