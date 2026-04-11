import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, User, Shield } from 'lucide-react';
import { initialFields } from '@/lib/mockData';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess } from '@/utils/toast';

const Fields = () => {
  const [fields, setFields] = useState(initialFields);

  const renderFieldsList = (section: string) => {
    const sectionFields = fields.filter(f => f.section === section).sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-4">
        {sectionFields.map((field) => (
          <Card key={field.id} className="bg-[#1a1a1a] border-white/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="cursor-grab text-gray-600">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{field.label}</span>
                  <Badge variant="secondary" className="text-[10px] bg-white/5 text-gray-400">
                    {field.type}
                  </Badge>
                  {field.required && (
                    <span className="text-red-500 text-xs font-bold">*</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-mono">{field.name}</span>
                  <span className="flex items-center gap-1">
                    {field.forRole === 'admin' ? <Shield size={12} /> : <User size={12} />}
                    {field.forRole === 'admin' ? 'Тільки адмін' : 'Артист'}
                  </span>
                  <span className="flex items-center gap-1">
                    {field.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    {field.visible ? 'Видиме' : 'Приховане'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400">
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Управління полями</h1>
          <p className="text-gray-500">Налаштуйте динамічні форми для релізів та профілів</p>
        </div>
        <Button className="bg-violet-600 hover:bg-violet-700">
          <Plus size={18} className="mr-2" /> Додати поле
        </Button>
      </div>

      <Tabs defaultValue="release" className="w-full">
        <TabsList className="bg-[#1a1a1a] border border-white/5 p-1 mb-6">
          <TabsTrigger value="release" className="data-[state=active]:bg-violet-500">Поля релізу</TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-violet-500">Поля профілю</TabsTrigger>
        </TabsList>
        
        <TabsContent value="release">
          {renderFieldsList('release')}
        </TabsContent>
        
        <TabsContent value="profile">
          {renderFieldsList('profile')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Fields;