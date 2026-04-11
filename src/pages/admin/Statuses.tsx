import React from 'react';
import { ListTodo, Plus, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const Statuses = () => {
  const { statuses, updateStatuses } = useDataStore();

  const handleDelete = (id: number) => {
    const newStatuses = statuses.filter(s => s.id !== id);
    updateStatuses(newStatuses);
    showSuccess('Статус видалено');
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управління статусами</h1>
          <p className="text-gray-500">Налаштування життєвого циклу релізів</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" />
          Новий статус
        </Button>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ListTodo size={20} className="text-violet-500" />
            Список статусів
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-white/5">
            {statuses.sort((a, b) => a.order - b.order).map((status) => (
              <div key={status.id} className="flex items-center gap-4 p-6 hover:bg-white/5 transition-colors group">
                <div className="cursor-grab text-gray-600 hover:text-gray-400">
                  <GripVertical size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{status.name}</span>
                    <Badge variant="outline" className={cn("px-3 py-0.5", getColorClass(status.color))}>
                      {status.color}
                    </Badge>
                    {status.isDefault && (
                      <Badge className="bg-violet-500/20 text-violet-400 border-none text-[10px] uppercase tracking-widest">
                        За замовчуванням
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Порядок: {status.order}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/10">
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => handleDelete(status.id)}
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

      <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-xl">
        <h3 className="font-semibold mb-2">Порада</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Статус "За замовчуванням" автоматично присвоюється кожному новому релізу, який створює артист. 
          Зазвичай це статус "На модерації".
        </p>
      </div>
    </div>
  );
};

export default Statuses;