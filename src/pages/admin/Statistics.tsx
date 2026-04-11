import React from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Upload, History, User, Music } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Statistics = () => {
  const { register, handleSubmit, setValue } = useForm();

  const onSubmit = (data: any) => {
    console.log('Stats Update:', data);
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
        <p className="text-gray-500">Оновлення даних про прослуховування</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-[#1a1a1a] border-white/5 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload size={20} className="text-violet-500" />
              Оновити дані
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
                <Label>Дата</Label>
                <Input type="date" {...register('date')} className="bg-[#0a0a0a] border-white/10" />
              </div>

              <div className="space-y-2">
                <Label>Кількість прослуховувань</Label>
                <Input type="number" {...register('count')} className="bg-[#0a0a0a] border-white/10" placeholder="0" />
              </div>

              <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 mt-4">
                Оновити статистику
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History size={20} className="text-violet-500" />
              Останні оновлення
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Трек</th>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Кількість</th>
                  <th className="px-6 py-4">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUpdates.map((update) => (
                  <tr key={update.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-violet-500/10 flex items-center justify-center text-violet-500">
                          <Music size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{update.track}</p>
                          <p className="text-[10px] text-gray-500">{update.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{update.date}</td>
                    <td className="px-6 py-4 text-sm font-bold text-violet-400">+{update.count}</td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-white">
                        Скасувати
                      </Button>
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