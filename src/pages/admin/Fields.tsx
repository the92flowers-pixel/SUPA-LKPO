import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, GripVertical, Eye, EyeOff, Save } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Fields = () => {
  const { fields, updateFields, addField, deleteField } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    section: 'release',
    forRole: 'artist',
    order: 1,
    visible: true,
    options: ''
  });

  const handleOpenDialog = (field: any = null) => {
    if (field) {
      setEditingField(field);
      setFormData(field);
    } else {
      setEditingField(null);
      setFormData({
        name: '',
        label: '',
        type: 'text',
        required: false,
        section: 'release',
        forRole: 'artist',
        order: fields.length + 1,
        visible: true,
        options: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingField) {
      const newFields = fields.map(f => f.id === editingField.id ? { ...formData, id: f.id } : f);
      updateFields(newFields);
      showSuccess('Поле оновлено');
    } else {
      addField(formData);
      showSuccess('Поле додано');
    }
    setIsDialogOpen(false);
  };

  const toggleVisibility = (id: number) => {
    const newFields = fields.map(f => f.id === id ? { ...f, visible: !f.visible } : f);
    updateFields(newFields);
  };

  const renderFieldList = (section: string) => (
    <div className="divide-y divide-white/5">
      {fields
        .filter(f => f.section === section)
        .sort((a, b) => a.order - b.order)
        .map((field) => (
          <div key={field.id} className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group">
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
                  <span className="text-red-800 text-[9px] font-black uppercase tracking-widest">* Обов'язкове</span>
                )}
                <Badge className={cn(
                  "text-[9px] uppercase tracking-widest border-none rounded-none",
                  field.forRole === 'admin' ? "bg-amber-900/20 text-amber-500" : "bg-red-900/20 text-red-500"
                )}>
                  {field.forRole === 'admin' ? 'Тільки адмін' : 'Артист'}
                </Badge>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1 font-mono uppercase tracking-tighter">ID: {field.name}</p>
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
              <div className="w-px h-4 bg-white/10 mx-1" />
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

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Управління полями</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Налаштування динамічних форм релізів та профілю</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-8 rounded-none h-12">
          <Plus size={18} className="mr-2" />
          Додати поле
        </Button>
      </div>

      <Tabs defaultValue="release" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 h-14 rounded-none">
          <TabsTrigger value="release" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Поля релізу</TabsTrigger>
          <TabsTrigger value="profile" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Поля профілю</TabsTrigger>
        </TabsList>
        
        <Card className="bg-black/40 border-white/5 mt-8 rounded-none shadow-2xl">
          <TabsContent value="release" className="m-0">
            {renderFieldList('release')}
          </TabsContent>
          <TabsContent value="profile" className="m-0">
            {renderFieldList('profile')}
          </TabsContent>
        </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">{editingField ? 'Редагувати поле' : 'Нове поле'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва (ID)</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12"
                placeholder="title_uk"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Заголовок (Label)</Label>
              <Input 
                value={formData.label} 
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12"
                placeholder="Назва треку"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Тип поля</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="textarea">Довгий текст</SelectItem>
                  <SelectItem value="select">Список (Select)</SelectItem>
                  <SelectItem value="date">Дата</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="number">Число</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Секція</Label>
              <Select value={formData.section} onValueChange={(v) => setFormData({...formData, section: v})}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                  <SelectItem value="release">Реліз</SelectItem>
                  <SelectItem value="profile">Профіль</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === 'select' && (
              <div className="col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опції (JSON масив)</Label>
                <Input 
                  value={formData.options} 
                  onChange={(e) => setFormData({...formData, options: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                  placeholder='["Rock", "Pop", "Jazz"]'
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-none">Скасувати</Button>
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