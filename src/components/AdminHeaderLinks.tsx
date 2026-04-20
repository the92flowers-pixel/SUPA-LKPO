"use client";

import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface AdminLink {
  id: string;
  title: string;
  url: string;
  icon: string;
}

const AdminHeaderLinks = () => {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<AdminLink[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchLinks = async () => {
      const { data } = await supabase
        .from('admin_links')
        .select('id, title, url, icon')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (data) setLinks(data);
    };

    fetchLinks();
  }, [user]);

  if (user?.role !== 'admin' || links.length === 0) return null;

  return (
    <div className="hidden md:flex items-center gap-4 px-6 border-l border-white/5 ml-4">
      {links.map((link) => (
        <a 
          key={link.id} 
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors group"
          title={link.title}
        >
          <span className="text-sm">{link.icon}</span>
          <span className="hidden lg:inline">{link.title}</span>
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
};

export default AdminHeaderLinks;