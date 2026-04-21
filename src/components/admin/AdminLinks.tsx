"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Link as LinkIcon, ExternalLink, Loader2, GripVertical, AlertCircle } from 'lucide-react';
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
    try {
      const { data, error } = await supabase
        .from('admin_links')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      if (data) setLinks(data);
    } catch (err: any) {
      showError(`Помилка завантаження: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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

    try {
      const { error } = await supabase.from('admin_links').delete().eq('id', id);
      if (error) throw error;
      setLinks(links.filter(l => l.id !== id));
      showSuccess('Посилання видалено');
    } catch (err: any) {
      showError(`Помилка видалення: ${err.message}`);
    }
  };

  const handleSave = async () => {
    // Валідація
    const invalidLinks = links.filter(l => !l.title.trim() || !l.url.trim());
    if (invalidLinks.length > 0) {
      showError('Заповніть назву та URL для всіх посилань');
      return;
    }

    setIsSaving(true);
    try {
      const newLinks = links.filter(l => l.id.startsWith('temp-'));
      const existingLinks = links.filter(l => !l.id.startsWith('temp-'));

      // 1. Зберігаємо нові
      if (newLinks.length > 0) {
        const toInsert = newLinks.map(({ id, ...data }) => data);
        const { error: insertError } = await supabase.from('admin_links').insert(toInsert);
        if (insertError) throw insertError;
      }

      // 2. Оновлюємо існуючі
      if (existingLinks.length > 0) {
        for (const link of existingLinks) {
          const { id, ...data } = link;
          const { error: updateError } = await supabase
            .from('admin_links')
            .update(data)
            .eq('id', id);
          if (updateError) throw updateError;
        }
      }

      showSuccess('Всі зміни успішно збережено');
      await fetchLinks();
      
      // Невеликий тайм-аут перед релоадом, щоб користувач побачив успіх
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      console.error('Save error:', err);
      showError(`Помилка збереження: ${err.message}`);
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
          <Button 
            onClick={handleAdd} 
            variant="outline" 
            disabled={isSaving}
            className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
          >
            <Plus size={14} className="mr-2" /> Додати
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isLoading} 
            className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-none min-w-[160px]"
          >
            {isSaving ? (
              <><Loader2 className="animate-spin mr-2" size={14} /> Збереження...</>
            ) : (
              <><Save size={14} className="mr-2" /> Зберегти все</>
            )}
          </Button>
        </div>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-20 text-center">
              <Loader2 className="animate-spin mx-auto text-red-700 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Завантаження даних...</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {links.map((link, index) => (
                <div key={link.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="text-zinc-800 group-hover:text-zinc-600">
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
                      <Label className="text-[9px] font-black uppercase text-zinc-600">Назва *</Label>
                      <Input 
                        value={link.title} 
                        onChange={(e) => handleUpdate(link.id, 'title', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-bold uppercase"
                        placeholder="Наприклад: Google Drive"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-zinc-600">URL *</Label>
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
                      <div className="space-y-1">
                        <Label className="text-[7px] font-black uppercase text-zinc-700 block text-center">Порядок</Label>
                        <Input 
                          type="number"
                          value={link.sort_order} 
                          onChange={(e) => handleUpdate(link.id, 'sort_order', parseInt(e.target.value) || 0)}
                          className="w-16 bg-black/40 border-white/5 rounded-none h-10 text-xs text-center"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-10 w-10 rounded-none mt-4"
                        onClick={() => handleRemove(link.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {links.length === 0 && (
                <div className="p-20 text-center">
                  <LinkIcon className="mx-auto text-zinc-800 mb-4" size={48} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Список посилань порожній</p>
                  <Button onClick={handleAdd} variant="link" className="text-red-700 mt-2 uppercase text-[10px] font-black">Додати перше посилання</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-6 bg-amber-900/5 border border-amber-900/10 flex items-start gap-4">
        <AlertCircle className="text-amber-700 shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Інструкція</p>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            Після натискання "Зберегти все", посилання будуть записані в базу даних. Сторінка автоматично оновиться через секунду, щоб нові пункти з'явилися в бічному меню зліва.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLinks;