import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle, Save, Search, ListTodo, MessageSquare } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Tasks = () => {
  const { tasks, fetchTasks, addTask, updateTask, deleteTask } = useDataStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenDialog = (task: any = null) => {
    if (task) {
      setEditingTask({ ...task });
    } else {
      setEditingTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingTask.title) {
      showError('Вкажіть заголовок');
      return;
    }

    if (editingTask.id) {
      await updateTask(editingTask.id, editingTask);
      showSuccess('Завдання оновлено');
    } else {
      await addTask(editingTask);
      showSuccess('Завдання додано');
    }
    setIsDialogOpen(false);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'in_progress': return <Clock className="text-blue-500" size={16} />;
      default: return <AlertCircle className="text-amber-500" size={16} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] uppercase font-black">High</Badge>;
      case 'low': return <Badge className="bg-zinc-500/10 text-zinc-500 border-none text-[8px] uppercase font-black">Low</Badge>;
      default: return <Badge className="bg-blue-500/10 text-blue-500 border-none text-[8px] uppercase font-black">Medium</Badge>;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Завдання та Нотатки</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Внутрішній менеджер завдань адміністратора</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-8 h-12 rounded-none">
          <Plus size={18} className="mr-2" /> Нове завдання
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <Input 
            placeholder="Пошук завдань..." 
            className="bg-black/40 border-white/5 pl-10 h-12 rounded-none text-[10px] font-bold uppercase tracking-widest" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-black/40 border-white/5 w-48 h-12 rounded-none text-[10px] font-bold uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">Всі статуси</SelectItem>
            <SelectItem value="pending" className="text-[10px] font-bold uppercase">Очікує</SelectItem>
            <SelectItem value="in_progress" className="text-[10px] font-bold uppercase">В процесі</SelectItem>
            <SelectItem value="completed" className="text-[10px] font-bold uppercase">Виконано</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-black/40 border-white/5 rounded-none group hover:border-red-700/30 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-white truncate">{task.title}</CardTitle>
                </div>
                {getPriorityBadge(task.priority)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-3">{task.description || 'Без опису'}</p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] text-zinc-700 font-mono uppercase">{new Date(task.created_at).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(task)} className="h-8 w-8 p-0 text-zinc-500 hover:text-white">
                    <Edit2 size={14} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)} className="h-8 w-8 p-0 text-red-900 hover:text-red-500">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/5">
            <ListTodo className="mx-auto text-zinc-800 mb-4" size={48} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Завдань не знайдено</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingTask?.id ? 'Редагувати завдання' : 'Нове завдання'}
            </DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Заголовок *</Label>
                <Input 
                  value={editingTask.title} 
                  onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опис / Нотатки</Label>
                <Textarea 
                  value={editingTask.description} 
                  onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Статус</Label>
                  <Select value={editingTask.status} onValueChange={(v) => setEditingTask({...editingTask, status: v})}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      <SelectItem value="pending" className="text-xs uppercase font-bold">Очікує</SelectItem>
                      <SelectItem value="in_progress" className="text-xs uppercase font-bold">В процесі</SelectItem>
                      <SelectItem value="completed" className="text-xs uppercase font-bold">Виконано</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Пріоритет</Label>
                  <Select value={editingTask.priority} onValueChange={(v) => setEditingTask({...editingTask, priority: v})}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      <SelectItem value="low" className="text-xs uppercase font-bold">Низький</SelectItem>
                      <SelectItem value="medium" className="text-xs uppercase font-bold">Середній</SelectItem>
                      <SelectItem value="high" className="text-xs uppercase font-bold">Високий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;