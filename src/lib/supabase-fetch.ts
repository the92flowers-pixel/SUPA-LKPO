/**
 * Альтернативный клиент Supabase, использующий стандартный fetch.
 * Не требует установки @supabase/supabase-js.
 */

const supabaseUrl = 'https://dhouzqxqsmchbxmxrhnh.supabase.co';
const supabaseAnonKey = 'sb_publishable_dOp-xTq5eAZYnUrdedlfTA_WwaNV84P';

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
      const data = await res.json();
      if (!res.ok) return { error: data.error_description || data.error || 'Login failed' };
      return data;
    },
    async signUp(email, password, artistName) {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password,
          options: {
            data: {
              artistName: artistName
            }
          }
        })
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error_description || data.error || 'Signup failed' };
      return data;
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
    async getProfile(userId, jwt) {
      const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${jwt}`,
          'Range': '0-0'
        }
      });
      const data = await res.json();
      if (!res.ok) return { error: data.message || 'Failed to fetch profile' };
      return { data: data[0] };
    }
  }
};
