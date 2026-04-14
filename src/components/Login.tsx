"use client";

import React from 'react';
import { useSupabase } from '@supabase/supabesdk';

const Login = () => {
  const { user, isLoading, error } = useSupabase();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={() => user.signOut()}>Logout</button>
    </div>
  );
};

export default Login;