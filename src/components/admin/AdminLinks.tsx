"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Link as LinkIcon, ExternalLink, Loader2, GripVertical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { showSuccess, showError } from '@/utils/toast';

interface AdminLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

const AdminLinks = () => {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLinks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_links')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (!error && data) setLinks(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAdd = () => {
    const newLink: AdminLink = {
      id: `temp-${Date.now()}`,
      title: '',
      url: '',
      icon: '🔗',
      sort_order: links.length,
      is_active: true
    };
    setLinks([...links, newLink]);
  };

  const handleUpdate = (id: string, field: keyof AdminLink, value: any) => {
    setLinks(links.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleRemove = async (id: string) => {
    if (id.startsWith('temp-')) {
      setLinks(links.filter(l => l.id !== id));
      return;
    }

    const { error } = await supabase.from('admin_links').delete().eq('id', id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
      showSuccess('Посилання видалено');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const link of links) {
        const { id, ...data } = link;
        if (id.startsWith('temp-')) {
          await supabase.from('admin_links').insert(data);
        } else {
          await supabase.from('admin_links').update(data).eq('id', id);
        }
      }
      showSuccess('Всі зміни збережено');
      fetchLinks();
    } catch (error) {
      showError('Помилка при збереженні');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Адмін-посилання</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Швидкий доступ до зовнішніх ресурсів</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleAdd} variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none">
            <Plus size={14} className="mr-2" /> Додати
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-none">
            {isSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save size={14} className="mr-2" />}
            Зберегти все
          </Button>
        </div>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {links.map((link, index) => (
              <div key={link.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="cursor-grab text-zinc-800 group-hover:text-zinc-600">
                    <GripVertical size={20} />
                  </div>
                  <Input 
                    value={link.icon} 
                    onChange={(e) => handleUpdate(link.id, 'icon', e.target.value)}
                    className="w-12 h-12 text-center bg-black/40 border-white/5 rounded-none text-xl"
                    placeholder="🔗"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-600">Назва</Label>
                    <Input 
                      value={link.title} 
                      onChange={(e) => handleUpdate(link.id, 'title', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-bold uppercase"
                      placeholder="Наприклад: Google Drive"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-zinc-600">URL</Label>
                    <Input 
                      value={link.url} 
                      onChange={(e) => handleUpdate(link.id, 'url', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-mono"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="flex items-center gap-3">
                    <Label className="text-[9px] font-black uppercase text-zinc-600">Активне</Label>
                    <Switch 
                      checked={link.is_active} 
                      onCheckedChange={(val) => handleUpdate(link.id, 'is_active', val)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number"
                      value={link.sort_order} 
                      onChange={(e) => handleUpdate(link.id, 'sort_order', parseInt(e.target.value))}
                      className="w-16 bg-black/40 border-white/5 rounded-none h-10 text-xs text-center"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-10 w-10 rounded-none"
                      onClick={() => handleRemove(link.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {links.length === 0 && !isLoading && (
              <div className="p-20 text-center">
                <LinkIcon className="mx-auto text-zinc-800 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Список посилань порожній</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLinks;