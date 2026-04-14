"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Music, UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error, data: authData } = await supabase.auth.signUp({
        email: data.login,
        password: data.password,
        options: {
          data: {
            full_name: data.artistName,
          }
        }
      });

      if (error) throw error;

      if (authData.user) {
        showSuccess('Акаунт створено! Перевірте пошту для підтвердження або увійдіть.');
        navigate('/login');
      }
    } catch (error: any) {
      showError(error.message || 'Помилка при реєстрації');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1a0505,transparent_70%)] opacity-30 pointer-events-none" />
      
      <div className="w-full max-w-md space-y-10 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src="https://jurbamusic.iceiy.com/whitemonster.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Приєднатися</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Почни свій шлях у ЖУРБА MUSIC</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white/5 p-8 border border-white/5">
          <div className="space-y-3">
            <Label htmlFor="artistName" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
            <Input 
              id="artistName" 
              {...register('artistName', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="Твій нікнейм" 
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="login" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Адреса</Label>
            <Input 
              id="login" 
              type="email" 
              {...register('login', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="name@example.com" 
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" title="Пароль" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пароль</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password', { required: true })} 
              className="bg-black/40 border-white/10 focus:border-red-700 h-14 rounded-none text-white text-sm" 
              placeholder="••••••••" 
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-red-700 hover:bg-red-800think
The user's previous request was cut off at the end of `src/pages/Register.tsx`. I need to complete that file and continue with the rest of the plan for Supabase integration if there's more to do, ensuring registration and login work perfectly.

Looking at the previous turn's output:
- `src/pages/Login.tsx` was written.
- `src/pages/Register.tsx` was started but cut off at `<Button type="submit" disabled={isLoading} className="w-full h-14 bg-red-700 hover:bg-red-800`.

I need to finish `src/pages/Register.tsx` and then ensure all other parts of the system (DB, RLS, Auth) are solid. The user wants to make sure registration and login work perfectly via Supabase.

I should also check if any other files need updating to handle the Supabase integration correctly (like `App.tsx` for auth persistence).

Let's finish the code for `Register.tsx`.

Then, I'll check `App.tsx` again to make sure it handles the session properly.

In `App.tsx`, the `fetchProfile` function looks for a `profiles` table. This table is created by the trigger `handle_new_user` described in the user's prompt (Step 3).

Wait, the user's prompt gave me the SQL but didn't actually *run* it. I am the AI editor, I should provide the code changes. But I can't run SQL in the user's Supabase dashboard. I can only provide the instructions and the frontend code. However, the user asked me to "Design the ideal DB and adapt the whole frontend". I've done the frontend part mostly.

One important thing: if the user registers, the `handle_new_user` trigger in Supabase (if they set it up) creates a profile. If they didn't set it up, the frontend might fail to find a profile. I should probably add a fallback or a check.

Also, I should ensure the `profiles` table has the `full_name` from `NEW.raw_user_meta_data->>'full_name'`.

Let's complete the `Register.tsx` and check `App.tsx`.

File `src/pages/Register.tsx` continuation:
```tsx
            className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-widest rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Зареєструватися <UserPlus className="ml-3" size={18} /></>}
          </Button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Вже маєте акаунт? <Link to="/login" className="text-red-700 hover:text-red-600 transition-colors ml-2 underline underline-offset-4">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
```

Now let's review `src/App.tsx`. It handles `onAuthStateChange`.
One issue: when a user registers, they might not be redirected automatically if the session doesn't trigger a redirect.
In `Login.tsx`, I added `navigate('/dashboard')`.
In `Register.tsx`, I added `navigate('/login')`.

Let's check `src/lib/store.ts` again. The `fetchInitialData` function loads data from Supabase.
One critical thing: `artists` table needs to be linked to the user.
The user prompt Step 3 only mentioned `profiles`. But Step 2 mentioned `artists`.
Usually, when a user registers as an artist, we need to create an entry in `artists` too.
In `NewRelease.tsx`, I see:
```ts
      const { data: artist } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();
```
If the user just registered, this `artist` record might not exist yet.
I should probably modify `Register.tsx` or `App.tsx` to ensure an artist record is created if the role is 'artist' (which is default in this app). Or better, a trigger in Supabase.
Since I can't write triggers in the user's DB directly, I'll provide the SQL in the chat and maybe a frontend fallback.

Actually, the user said "Design the ideal DB".
I'll provide the full `Register.tsx` first.

Wait, I should check if I need to update `src/lib/supabase.ts`. It's already good.

Let's look at `App.tsx` again.
It uses `fetchProfile`. If `profile` is found, it sets auth.
If a user just registered, `profiles` might be empty if the trigger isn't there.
I'll add a "Create Profile" logic if not found, just in case.

Actually, I'll stick to completing `Register.tsx` first.text-white font-black uppercase tracking-widest rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Зареєструватися <UserPlus className="ml-3" size={18} /></>}
          </Button>
        </form>
        <p className="text-center text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Вже маєте акаунт? <Link to="/login" className="text-red-700 hover:text-red-600 transition-colors ml-2 underline underline-offset-4">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;