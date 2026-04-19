import React, { useState } from 'react';
import { ListTodo, Plus, Trash2, Edit2, GripVertical, Save, X } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Statuses = () => {
  const { statuses, updateStatuses, addStatus, deleteStatus } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: 'gray',
    order: 1,
    isDefault: false
  });

  const handleOpenDialog = (status: any = null) => {
    if (status) {
      setEditingStatus(status);
      setFormData({ ...status });
    } else {
      setEditingStatus(null);
      setFormData({
        name: '',
        color: 'gray',
        order: statuses.length + 1,
        isDefault: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      showError('Вкажіть назву статусу');
      return;
    }

    if (editingStatus) {
      const newStatuses = statuses.map(s => s.id === editingStatus.id ? { ...formData, id: s.id } : s);
      updateStatuses(newStatuses);
      showSuccess('Статус оновлено');
    } else {
      addStatus({ ...formData, id: Date.now() });
      showSuccess('Статус додано');
    }
    setIsDialogOpen(false);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'yellow': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'red': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'blue': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Статуси</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Життєвий цикл релізів</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-8 rounded-none h-12">
          <Plus size={18} className="mr-2" />
          Новий статус
        </Button>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
            <ListTodo size={18} className="text-red-700" /> Список статусів
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {statuses.sort((a, b) => (a.order || 0) - (b.order || 0)).map((status) => (
              <div key={status.id} className="flex items-center gap-6 p-6 hover:bg-white/5 transition-colors group">
                <div className="cursor-grab text-zinc-800 hover:text-zinc-600">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-white uppercase tracking-wider text-sm">{status.name}</span>
                    <Badge variant="outline" className={cn("px-3 py-0.5 text-[9px] font-black uppercase tracking-widest", getColorClass(status.color))}>
                      {status.color}
                    </Badge>
                    {status.isDefault && (
                      <Badge className="bg-red-900/20 text-red-500 border-none text-[9px] uppercase font-black tracking-widest">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1 font-bold uppercase tracking-widest">Порядок: {status.order || 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 hover:bg-white/10 text-zinc-500"
                    onClick={() => handleOpenDialog(status)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 text-red-900 hover:text-red-500 hover:bg-red-900/10"
                    onClick={() => deleteStatus(status.id)}
                    disabled={status.isDefault}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingStatus ? 'Редагувати статус' : 'Новий статус'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва статусу</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Колір</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({...formData, color: v})}>
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="gray">Сірий (pending)</SelectItem>
                    <SelectItem value="yellow">Жовтий</SelectItem>
                    <SelectItem value="blue">Синій</SelectItem>
                    <SelectItem value="green">Зелений (published)</SelectItem>
                    <SelectItem value="red">Червоний (rejected)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Порядок</Label>
                <Input 
                  type="number"
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 1})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/5">
              <input 
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="w-4 h-4"
              />
              <Label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
                Статус за замовчуванням (для нових релізів)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 rounded-none h-12">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Statuses;