/**
 * Финальный API клиент Supabase для проекта JurbaData.
 * Исправлены ошибки типизации TypeScript.
 */

const supabaseUrl = 'https://lohfvsnykmwpoowvsyg.supabase.co';
const supabaseAnonKey = 'sb_publishable_9EUyR2PdPmaMrNubzIpBmQ_Q_vhC-B4';

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

async function apiRequest(path: string, method = 'GET', body: any = null, jwt: string | null = null) {
  const headers: Record<string, string> = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const options: RequestOptions = { method, headers };
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
    async signInWithPassword(email: any, password: any) {
      return await apiRequest('/auth/v1/token?grant_type=password', 'POST', { email, password });
    },
    async signUp(email: any, password: any, artistName: any) {
      return await apiRequest('/auth/v1/signup', 'POST', { 
        email, 
        password,
        options: { data: { artistName } }
      });
    }
  },
  
  profiles: {
    async get(userId: string, jwt: string) {
      const { data, error } = await apiRequest(`/rest/v1/profiles?id=eq.${userId}&select=*`, 'GET', null, jwt);
      return { data: data?.[0], error };
    },
    async listAll(jwt: string) {
      return await apiRequest('/rest/v1/profiles?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async update(userId: string, updates: any, jwt: string) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'PATCH', updates, jwt);
    }
  },

  releases: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/releases?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async listAllAdmin(jwt: string) {
      return await apiRequest('/rest/v1/releases?select=*,profiles(artist_name)&order=created_at.desc', 'GET', null, jwt);
    },
    async create(release: any, jwt: string) {
      return await apiRequest('/rest/v1/releases', 'POST', release, jwt);
    },
    async update(id: string, updates: any, jwt: string) {
      return await apiRequest(`/rest/v1/releases?id=eq.${id}`, 'PATCH', updates, jwt);
    }
  },

  smartLinks: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/smart_links?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async getBySlug(slug: string) {
      const { data, error } = await apiRequest(`/rest/v1/smart_links?slug=eq.${slug}&select=*`, 'GET');
      return { data: data?.[0], error };
    },
    async create(link: any, jwt: string) {
      return await apiRequest('/rest/v1/smart_links', 'POST', link, jwt);
    },
    async delete(id: string, jwt: string) {
      return await apiRequest(`/rest/v1/smart_links?id=eq.${id}`, 'DELETE', null, jwt);
    }
  },

  artistWebsites: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/artist_websites?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async getBySlug(slug: string) {
      const { data, error } = await apiRequest(`/rest/v1/artist_websites?slug=eq.${slug}&select=*`, 'GET');
      return { data: data?.[0], error };
    },
    async create(site: any, jwt: string) {
      return await apiRequest('/rest/v1/artist_websites', 'POST', site, jwt);
    }
  },

  transactions: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/transactions?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async create(transaction: any, jwt: string) {
      return await apiRequest('/rest/v1/transactions', 'POST', transaction, jwt);
    }
  },

  reports: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/reports?select=*&order=created_at.desc', 'GET', null, jwt);
    }
  },

  settings: {
    async get(key: string) {
      const { data, error } = await apiRequest(`/rest/v1/system_settings?key=eq.${key}&select=value`, 'GET');
      return { data: data?.[0]?.value, error };
    },
    async update(key: string, value: any, jwt: string) {
      return await apiRequest(`/rest/v1/system_settings?key=eq.${key}`, 'UPSERT', { key, value }, jwt);
    }
  }
};
