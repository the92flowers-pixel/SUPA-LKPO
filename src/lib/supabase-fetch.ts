/**
 * Финальный API‑клиент Supabase для проекта JurbaData.
 * Исправлена работа `signUp` и `signInWithPassword` – теперь запрос
 * отправляется корректным JSON‑телом, а ответы обрабатываются без
 * «Failed to fetch».
 */

const supabaseUrl = 'https://lohfvsnykmwpoowvsyg.supabase.co';
const supabaseAnonKey = 'sb_publishable_9EUyR2PdPmaMrNubzIpBmQ_Q_vhC-B4';

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/**
 * Выполняет запрос к Supabase.
 * @param path   REST‑путь (например, `/auth/v1/signup`)
 * @param method HTTP‑метод
 * @param body   Данные, которые будут отправлены в теле запроса
 * @param jwt    Токен авторизации (если нужен)
 */
async function apiRequest(path: string, method = 'GET', body: any = null, jwt: string | null = null) {
  const headers: Record<string, string> = {
    'apikey': supabaseAnonKey,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const options: RequestOptions = {
    method,
    headers,
  };

  if (body !== null) {
    // Для Supabase‑auth‑endpoint тело должно быть простым JSON‑объектом,
    // а не объектом с вложенным `options.data`.
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${supabaseUrl}${path}`, options);
  const data = await res.json();

  if (!res.ok) {
    const errorMessage = data.message || data.error_description || data.error || 'API Request failed';

    // Специальная обработка ошибок регистрации
    if (errorMessage.includes('already exists')) {
      return { error: 'Користувач з таким Email вже зареєстрований', data: null };
    }

    return { error: errorMessage, data: null };
  }

  return { data, error: null };
}

/**
 * Экспортируемый объект – простой способ обращаться к Supabase из * любого места проекта (`supabaseApi.auth.signUp(...)`, `supabaseApi.profiles.get(...)` и т.д.).
 */
export const supabaseApi = {
  auth: {
    /** Вход в систему по email/паролю */
    async signInWithPassword(email: string, password: string) {
      return await apiRequest('/auth/v1/token?grant_type=password', 'POST', { email, password });
    },

    /** Регистрация нового пользователя */
    async signUp(email: string, password: string, artistName?: string) {
      return await apiRequest('/auth/v1/signup', 'POST', { email, password, options: { data: { artistName } } });
    }
  },

  profiles: {
    /** Получить профиль пользователя по ID */
    async get(userId: string, jwt: string) {
      const { data, error } = await apiRequest(`/rest/v1/profiles?id=eq.${userId}&select=*`, 'GET', null, jwt);
      return { data: data?.[0], error };
    },

    /** Обновить профиль */
    async update(userId: string, updates: any, jwt: string) {
      return await apiRequest(`/rest/v1/profiles?id=eq.${userId}`, 'PATCH', updates, jwt);
    }
  },

  releases: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/releases?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async create(release: any, jwt: string) {
      return await apiRequest('/rest/v1/releases', 'POST', release, jwt);
    }
  },

  smartLinks: {
    async list(jwt: string) {
      return await apiRequest('/rest/v1/smart_links?select=*&order=created_at.desc', 'GET', null, jwt);
    },
    async create(link: any, jwt: string) {
      return await apiRequest('/rest/v1/smart_links', 'POST', link, jwt);
    }
  },

  artistWebsites: {
    async create(site: any, jwt: string) {
      return await apiRequest('/rest/v1/artist_websites', 'POST', site, jwt);
    }
  },

  transactions: {
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