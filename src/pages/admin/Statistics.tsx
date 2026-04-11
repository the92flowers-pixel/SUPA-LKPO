import React from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Plus, History, Search } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Statistics = () => {
  const { releases, updateReleaseStreams, users } = useDataStore();
  const { register, handleSubmit, setValue, reset } = useForm();

  const onSubmit = (data: any) => {
    updateReleaseStreams(data.trackId, parseInt(data.count));
    showSuccess('Статистику успішно оновлено!');
    reset();
  };

  // Only show published releases for stats update
  const publishedReleases = releases.filter(r => r.status === 'Опубліковано');
  const artists = users.filter(u => u.role === 'artist');

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
                <Label>Реліз</Label>
                <Select onValueChange={(v) => setValue('trackId', v)}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue placeholder="Оберіть трек" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {publishedReleases.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.title} ({r.artist})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Кількість нових прослуховувань</Label>
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
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="px-6 py-4">Трек</th>
                  <th className="px-6 py-4">Артист</th>
                  <th className="px-6 py-4">Всього стрімів</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {publishedReleases.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{r.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{r.artist}</td>
                    <td className="px-6 py-4">
                      <span className="text-violet-400 font-bold">{r.streams.toLocaleString()}</span>
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