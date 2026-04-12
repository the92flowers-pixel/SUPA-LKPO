/**
 * Альтернативный клиент Supabase, использующий стандартный fetch.
 * Не требует установки @supabase/supabase-js.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseApi = {
  auth: {
    async signInWithPassword(email, password) {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    },
    async signUp(email, password) {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      return res.json();
    },
    async signOut(jwt) {
      const res = await fetch(`${supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${jwt}`
        }
      });
      return res.ok;
    }
  },
  db: {
    async from(table) {
      return {
        select: async (jwt) => {
          const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'GET',
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${jwt}`
            }
          });
          return res.json();
        }
      };
    }
  }
};
