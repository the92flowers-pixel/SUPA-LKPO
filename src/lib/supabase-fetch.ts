/**
 * Полный API клиент для работы с Supabase без SDK.
 * Реализует CRUD для всех основных сущностей приложения.
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
      const { data, error } = await apiRequest('/auth/v1/token?grant_type=password', 'POST', { email, password });
      return { data, error };
    },
    async signUp(email, password, artistName) {
      const { data, error } = await apiRequest('/auth/v1/signup', 'POST', { 
        email, 
        password,
        options: { data: { artistName } }
      });
      return { data, error };
    }
  },
  
  profiles: {
    async get(userId, jwt) {
      const { data, error } = await apiRequest(`/rest/v1/profiles?id=eq.${userId}&select=*`, 'GET', null, jwt);
      return { data: data?.[0], error };
    },
    async update(userId, updates, jwt) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'PATCH', updates, jwt);
    }
  },

  releases: {
    async list(jwt) {
      return await apiRequest('/rest/v1/releases?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async create(release, jwt) {
      return await apiRequest('/rest/v1/releases', 'POST', release, jwt);
    },
    async update(id, updates, jwt) {
      return await apiRequest(`/rest/v1/releases?id=eq.${id}`, 'PATCH', updates, jwt);
    }
  },

  transactions: {
    async list(jwt) {
      return await apiRequest('/rest/v1/transactions?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async create(transaction, jwt) {
      return await apiRequest('/rest/v1/transactions', 'POST', transaction, jwt);
    }
  },

  reports: {
    async list(jwt) {
      return await apiRequest('/rest/v1/reports?select=*&order=created_at.desc', 'GET', null, jwt);
    }
  }
};
