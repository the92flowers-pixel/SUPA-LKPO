import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Check } from 'lucide-react';
import { initialStatuses } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { showSuccess } from '@/utils/toast';

const Statuses = () => {
  const [statuses, setStatuses] = useState(initialStatuses);

  const colors = [
    { name: 'yellow', class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    { name: 'green', class: 'bg-green-500/10 text-green-500 border-green-500/20' },
    { name: 'red', class: 'bg-red-500/10 text-red-500 border-red-500/20' },
    { name: 'blue', class: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { name: 'gray', class: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  ];

  const handleDelete = (id: number) => {
    setStatuses(statuses.filter(s => s.id !== id));
    showSuccess('Статус видалено');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управління статусами</h1>
          <p className="text-gray-500">Налаштуйте життєвий цикл релізів</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" /> Додати статус
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {statuses.sort((a, b) => a.order - b.order).map((status) => (
          <Card key={status.id} className="bg-[#1a1a1a] border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="cursor-grab text-gray-600 hover:text-gray-400">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-1 flex items-center gap-4">
                <Badge className={colors.find(c => c.name === status.color)?.class}>
                  {status.name}
                </Badge>
                {status.isDefault && (
                  <Badge variant="outline" className="text-[10px] uppercase border-violet-500/30 text-violet-400">
                    За замовчуванням
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                  <Edit2 size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  onClick={() => handleDelete(status.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-violet-500/5 border-violet-500/10">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
            <Check size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-violet-400">Порада</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Статус "За замовчуванням" автоматично присвоюється кожному новому релізу, який створює артист. 
              Зазвичай це статус "На модерації".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statuses;