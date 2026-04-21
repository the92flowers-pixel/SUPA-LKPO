"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Save, Link as LinkIcon, ExternalLink, Loader2, GripVertical, X, Check } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { validateUrl } from '@/utils/imageValidation';

interface AdminLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface SortableLinkProps {
  link: AdminLink;
  onEdit: (link: AdminLink) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onUpdateOrder: (id: string, newOrder: number) => void;
}

const SortableLink: React.FC<SortableLinkProps> = ({ link, onEdit, onDelete, onToggleActive, onUpdateOrder }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center gap-4 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-zinc-700 hover:text-zinc-500 active:cursor-grabbing">
        <GripVertical size={20} />
      </div>

      <div className="w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center text-lg shrink-0">
        {link.icon || '🔗'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white uppercase tracking-wider truncate">{link.title}</p>
        <p className="text-[9px] text-zinc-600 font-mono truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Label className="text-[9px] font-black uppercase text-zinc-600 cursor-pointer">Активне</Label>
          <Switch
            checked={link.is_active}
            onCheckedChange={(checked) => onToggleActive(link.id, checked)}
          />
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-white rounded-none"
            onClick={() => onEdit(link)}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-none"
            onClick={() => onDelete(link.id)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminLinks: React.FC = () => {
  const [links, setLinks] = useState<AdminLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AdminLink | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '', icon: '🔗' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('admin_links')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setLinks(data.map(l => ({
        id: l.id,
        title: l.title,
        url: l.url,
        icon: l.icon || '🔗',
        sort_order: l.sort_order,
        is_active: l.is_active,
      })));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update sort_order for all items
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index,
        }));
        
        // Save to database
        saveOrderUpdates(updatedItems);
        
        return updatedItems;
      });
    }
  };

  const saveOrderUpdates = async (items: AdminLink[]) => {
    setIsSaving(true);
    try {
      for (const item of items) {
        await supabase
          .from('admin_links')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      showError('Помилка при збереженні порядку');
      fetchLinks(); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = () => {
    setEditingLink(null);
    setFormData({ title: '', url: '', icon: '🔗' });
    setIsDialogOpen(true);
  };

  const handleEdit = (link: AdminLink) => {
    setEditingLink(link);
    setFormData({ title: link.title, url: link.url, icon: link.icon });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate
    if (!formData.title.trim()) {
      showError('Вкажіть назву посилання');
      return;
    }

    const urlValidation = validateUrl(formData.url);
    if (!urlValidation.valid) {
      showError(urlValidation.error || 'Недопустимий URL');
      return;
    }

    setIsSaving(true);
    try {
      const data = {
        title: formData.title.trim(),
        url: formData.url.trim(),
        icon: formData.icon || '🔗',
        sort_order: editingLink?.sort_order ?? links.length,
        is_active: editingLink?.is_active ?? true,
      };

      if (editingLink) {
        // Update existing
        const { error } = await supabase
          .from('admin_links')
          .update(data)
          .eq('id', editingLink.id);

        if (error) throw error;
        showSuccess('Посилання оновлено');
      } else {
        // Create new
        const { error } = await supabase
          .from('admin_links')
          .insert(data);

        if (error) throw error;
        showSuccess('Посилання додано');
      }

      setIsDialogOpen(false);
      fetchLinks();
    } catch (error) {
      console.error('Error saving link:', error);
      showError('Помилка при збереженні');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити це посилання?')) return;

    try {
      const { error } = await supabase
        .from('admin_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLinks(links.filter(l => l.id !== id));
      showSuccess('Посилання видалено');
    } catch (error) {
      showError('Помилка при видаленні');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_links')
        .update({ is_active: active })
        .eq('id', id);

      if (error) throw error;
      setLinks(links.map(l => l.id === id ? { ...l, is_active: active } : l));
      showSuccess(active ? 'Посилання активовано' : 'Посилання деактивовано');
    } catch (error) {
      showError('Помилка при оновленні');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Адмін-посилання</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">
            Швидкий доступ до зовнішніх ресурсів ({links.length})
          </p>
        </div>
        <Button 
          onClick={handleAdd} 
          className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-none"
        >
          <Plus size={14} className="mr-2" /> Додати посилання
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-700" size={40} />
        </div>
      ) : (
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            {links.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={links.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-white/5">
                    {links.map((link) => (
                      <SortableLink
                        key={link.id}
                        link={link}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onUpdateOrder={(id, order) => {
                          setLinks(links.map(l => l.id === id ? { ...l, sort_order: order } : l));
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="p-20 text-center">
                <LinkIcon className="mx-auto text-zinc-800 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Список посилань порожній
                </p>
                <p className="text-[9px] text-zinc-700 mt-2 uppercase tracking-wider">
                  Додайте своє перше посилання
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-black/80 border border-white/10 p-4 flex items-center gap-3">
          <Loader2 className="animate-spin text-red-700" size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Збереження...
          </span>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingLink ? 'Редагувати посилання' : 'Нове посилання'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-black/40 border-white/5 rounded-none h-12 text-xs font-bold uppercase"
                placeholder="Наприклад: Google Drive"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL *</Label>
              <Input
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-black/40 border-white/5 rounded-none h-12 text-xs font-mono"
                placeholder="https://..."
              />
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                URL має починатися з http:// або https://
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Іконка (емодзі)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="bg-black/40 border-white/5 rounded-none h-12 text-xl text-center"
                placeholder="🔗"
                maxLength={4}
              />
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider">
                Використовуйте один емодзі або символ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-none text-[10px] font-black uppercase tracking-widest"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save size={14} className="mr-2" />}
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLinks;