import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Plus, History, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Statistics = () => {
  const { releases, updateReleaseStreams } = useDataStore();
  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      trackId: '',
      count: '',
      date: new Date().toISOString().split('T')[0]
    }
  });
  const [searchQuery, setSearchQuery] = useState('');

  const onSubmit = (data: any) => {
    updateReleaseStreams(data.trackId, parseInt(data.count), data.date);
    showSuccess('Статистику успішно оновлено!');
    reset({ 
      trackId: '',
      count: '',
      date: data.date 
    });
  };

  const publishedReleases = releases.filter(r => r.status === 'Опубліковано');
  
  const filteredReleases = publishedReleases.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Керування статистикою</h1>
        <p className="text-gray-500">Оновлення даних про прослуховування за конкретні дати</p>
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
                <Label>Реліз</Label>
                <Select onValueChange={(v) => setValue('trackId', v)}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue placeholder="Оберіть трек" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {publishedReleases.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title} — {r.artist}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Дата періоду</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <Input 
                    id="date" 
                    type="date" 
                    {...register('date', { required: true })} 
                    className="bg-[#0a0a0a] border-white/10 pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Кількість нових стрімів</Label>
                <Input 
                  id="count" 
                  type="number" 
                  {...register('count', { required: true })} 
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
              Поточні показники
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <Input 
                placeholder="Пошук треку або артиста..." 
                className="bg-[#0a0a0a] border-white/10 pl-10 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Трек</th>
                  <th className="px-6 py-4">Артист</th>
                  <th className="px-6 py-4">Останнє оновлення</th>
                  <th className="px-6 py-4">Всього стрімів</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReleases.length > 0 ? (
                  filteredReleases.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium">{r.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{r.artist}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {r.history.length > 0 ? r.history[r.history.length - 1].date : 'Немає даних'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-violet-400 font-bold">{r.streams.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Нічого не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;