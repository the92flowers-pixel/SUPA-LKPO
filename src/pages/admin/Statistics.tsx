import React from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Plus, History, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Statistics = () => {
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = (data: any) => {
    console.log('Update Stats:', data);
    showSuccess('Статистику успішно оновлено!');
  };

  const recentUpdates = [
    { id: 1, track: 'Нічна варта', artist: 'Артист А', date: '20.05.2024', count: 1200 },
    { id: 2, track: 'Світанок', artist: 'Артист Б', date: '19.05.2024', count: 850 },
    { id: 3, track: 'Журба', artist: 'Артист В', date: '18.05.2024', count: 2100 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Керування статистикою</h1>
        <p className="text-gray-500">Оновлення даних про прослуховування вручну</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-[#1a1a1a] border-white/5 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} className="text-violet-500" />
              Додати дані
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Артист</Label>
                <Select onValueChange={(v) => setValue('artistId', v)}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue placeholder="Оберіть артиста" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="1">Артист А</SelectItem>
                    <SelectItem value="2">Артист Б</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Реліз</Label>
                <Select onValueChange={(v) => setValue('trackId', v)}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue placeholder="Оберіть трек" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="1">Нічна варта</SelectItem>
                    <SelectItem value="2">Світанок</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Дата</Label>
                <Input 
                  id="date" 
                  type="date" 
                  {...register('date')} 
                  className="bg-[#0a0a0a] border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Кількість прослуховувань</Label>
                <Input 
                  id="count" 
                  type="number" 
                  {...register('count')} 
                  className="bg-[#0a0a0a] border-white/10"
                  placeholder="0"
                />
              </div>
              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 mt-2">
                Оновити статистику
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History size={20} className="text-violet-500" />
              Останні оновлення
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <Input 
                placeholder="Пошук релізу..." 
                className="pl-10 bg-[#0a0a0a] border-white/10 h-9 text-sm"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Трек</th>
                  <th className="px-6 py-4">Артист</th>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Кількість</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUpdates.map((update) => (
                  <tr key={update.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{update.track}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{update.artist}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{update.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-violet-400 font-bold">+{update.count.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;