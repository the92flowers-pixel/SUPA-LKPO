import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';

const Fields = () => {
  const { fields, updateFields, addField, deleteField } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'release' | 'profile'>('release');
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    section: 'release',
    forRole: 'artist',
    order: 1,
    visible: true,
    options: '',
    fileTypes: '',
    maxSize: '5'
  });

  const handleOpenDialog = (field: any = null) => {
    if (field) {
      setEditingField(field);
      setFormData({
        ...field,
        fileTypes: field.fileTypes || '',
        maxSize: field.maxSize || '5'
      });
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        label: '',
        type: 'text',
        required: false,
        section: activeTab,
        forRole: 'artist',
        order: fields.length + 1,
        visible: true,
        options: '',
        fileTypes: '',
        maxSize: '5'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.label) {
      showError('Заповніть всі обов\'язкові поля');
      return;
    }

    if (editingField) {
      const newFields = fields.map((f: any) => f.id === editingField.id ? { ...formData, id: f.id } : f);
      updateFields(newFields);
      showSuccess('Поле оновлено');
    } else {
      addField({ ...formData, id: Date.now() });
      showSuccess('Поле додано');
    }
    setIsDialogOpen(false);
  };

  const toggleVisibility = (id: number) => {
    const newFields = fields.map((f: any) => f.id === id ? { ...f, visible: !f.visible } : f);
    updateFields(newFields);
  };

  const renderFieldList = (section: string) => {
    const sectionFields = fields.filter((f: any) => f.section === section).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    
    if (sectionFields.length === 0) {
      return (
        <div className="p-12 text-center">
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            Поля не знайдено
          </p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-white/5">
        {sectionFields.map((field: any) => (
          <div key={field.id} className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors">
            <div className="cursor-grab text-zinc-700 hover:text-zinc-500">
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-black text-white uppercase tracking-wider text-sm">{field.label}</span>
                <Badge variant="secondary" className="bg-white/5 text-zinc-500 border-none text-[9px] uppercase font-black tracking-widest">
                  {field.type}
                </Badge>
                {field.required && (
                  <span className="text-red-800 text-[9px] font-black uppercase tracking-widest">*</span>
                )}
                {!field.visible && (
                  <span className="text-zinc-700 text-[9px] font-black uppercase tracking-widest">[Сховано]</span>
                )}
              </div>
              <p className="text-[10px] text-zinc-600 mt-1 font-mono">ID: {field.name}</p>
              {field.type === 'select' && field.options && (
                <p className="text-[9px] text-zinc-700 mt-1">Опції: {field.options}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-white/10 text-zinc-500"
                onClick={() => toggleVisibility(field.id)}
              >
                {field.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-zinc-800" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-white/10 text-zinc-500"
                onClick={() => handleOpenDialog(field)}
              >
                <Edit2 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-red-900 hover:text-red-500 hover:bg-red-900/10"
                onClick={() => deleteField(field.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Управління полями</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Налаштування динамічних форм</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-8 rounded-none h-12">
          <Plus size={18} className="mr-2" />
          Додати поле
        </Button>
      </div>

      <div className="bg-black/40 border border-white/5 rounded-none">
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('release')}
            className={`flex-1 px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'release' 
                ? 'bg-red-700 text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            Поля релізу
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-10 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'profile' 
                ? 'bg-red-700 text-white' 
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            Поля профілю
          </button>
        </div>
        <div className="p-0">
          {activeTab === 'release' && renderFieldList('release')}
          {activeTab === 'profile' && renderFieldList('profile')}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingField ? 'Редагувати поле' : 'Нове поле'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва (ID) *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                  placeholder="field_name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Заголовок (Label) *</Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Тип поля</Label>
                <Select value={formData.type} onValueChange={(v: string) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="text">Текст</SelectItem>
                    <SelectItem value="textarea">Довгий текст</SelectItem>
                    <SelectItem value="select">Список (Select)</SelectItem>
                    <SelectItem value="number">Число</SelectItem>
                    <SelectItem value="date">Дата</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="file">Файл (Upload)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Секція</Label>
                <Select value={formData.section} onValueChange={(v: string) => setFormData({...formData, section: v})}>
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="release">Реліз</SelectItem>
                    <SelectItem value="profile">Профіль</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {formData.type === 'select' && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опції (через кому)</Label>
                <Input 
                  value={formData.options} 
                  onChange={(e) => setFormData({...formData, options: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                  placeholder="Опція 1, Опція 2, Опція 3"
                />
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5">
              <input 
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData({...formData, required: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="required" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
                Обов'язкове поле
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none">Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 rounded-none h-12">
              <Save size={16} className="mr-2" /> Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Fields;