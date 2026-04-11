import React from 'react';
import { Layers, Plus, Trash2, Edit2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Fields = () => {
  const { fields, updateFields } = useDataStore();

  const handleDelete = (id: number) => {
    const newFields = fields.filter(f => f.id !== id);
    updateFields(newFields);
    showSuccess('Поле видалено');
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
            <div className="cursor-grab text-gray-600 hover:text-gray-400">
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold">{field.label}</span>
                <Badge variant="secondary" className="bg-white/5 text-gray-400 border-none text-[10px] uppercase">
                  {field.type}
                </Badge>
                {field.required && (
                  <span className="text-red-500 text-xs font-bold">* Обов'язкове</span>
                )}
                <Badge className={cn(
                  "text-[10px] uppercase tracking-widest border-none",
                  field.forRole === 'admin' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  {field.forRole === 'admin' ? 'Тільки адмін' : 'Артист'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-mono">ID: {field.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 hover:bg-white/10"
                onClick={() => toggleVisibility(field.id)}
              >
                {field.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-600" />}
              </Button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-white/10">
                <Edit2 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={() => handleDelete(field.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управління полями</h1>
          <p className="text-gray-500">Налаштування динамічних форм релізів та профілю</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" />
          Додати поле
        </Button>
      </div>

      <Tabs defaultValue="release" className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-white/5 p-1 h-12">
          <TabsTrigger value="release" className="px-8 data-[state=active]:bg-violet-600">Поля релізу</TabsTrigger>
          <TabsTrigger value="profile" className="px-8 data-[state=active]:bg-violet-600">Поля профілю</TabsTrigger>
        </TabsList>
        
        <Card className="bg-[#1a1a1a] border-white/5 mt-6">
          <TabsContent value="release" className="m-0">
            {renderFieldList('release')}
          </TabsContent>
          <TabsContent value="profile" className="m-0">
            {renderFieldList('profile')}
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default Fields;