"use client";

import React from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';

const LogoutButton = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <Button onClick={handleLogout}>Logout</Button>
  );
};

export default LogoutButton;