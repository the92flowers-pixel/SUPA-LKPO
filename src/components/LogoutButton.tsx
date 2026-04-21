"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuth(null);
      showSuccess('Ви вийшли з системи');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="ghost"
      className="text-zinc-500 hover:text-white"
    >
      <LogOut size={18} className="mr-2" />
      Вийти
    </Button>
  );
};

export default LogoutButton;