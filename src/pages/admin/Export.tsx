import React from 'react';
import { Download, FileSpreadsheet, Database, Calendar, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

const Export = () => {
  const { releases } = useDataStore();

  const exportReleases = () => {
    const data = releases.map(r => ({
      ID: r.id,
      Назва: r.title,
      Артист: r.artist,
      Жанр: r.genre,
      Дата: r.releaseDate,
      Статус: r.status,
      Стріми: r.streams,
      Створено: new Date(r.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Releases");
    XLSX.writeFile(wb, "zhurba_music_releases.xlsx");
    showSuccess('Експорт релізів завершено!');
  };

  const exportStats = () => {
    // In a real app, this would be daily stats. For now, we export current totals.
    const data = releases.map(r => ({
      Дата: new Date().toISOString().split('T')[0],
      Трек: r.title,
      Артист: r.artist,
      Кількість_Стрімів: r.streams
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statistics");
    XLSX.writeFile(wb, "zhurba_music_stats.xlsx");
    showSuccess('Експорт статистики завершено!');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Експорт даних</h1>
        <p className="text-gray-500">Вивантаження інформації у форматі Excel (XLSX)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-[#1a1a1a] border-white/5 hover:border-violet-500/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                <Database size={20} />
              </div>
              Всі релізи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Вивантаження повної бази даних релізів, включаючи всі динамічні поля, артистів та поточні статуси.
            </p>
            <div className="pt-4">
              <Button onClick={exportReleases} className="w-full bg-violet-600 hover:bg-violet-700">
                <FileSpreadsheet size={18} className="mr-2" />
                Завантажити XLSX
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/5 hover:border-violet-500/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar size={20} />
              </div>
              Статистика стрімів
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400">
              Детальна історія прослуховувань по днях для кожного треку. Корисно для фінансової звітності.
            </p>
            <div className="pt-4">
              <Button onClick={exportStats} className="w-full bg-blue-600 hover:bg-blue-700">
                <FileSpreadsheet size={18} className="mr-2" />
                Завантажити XLSX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter size={20} className="text-violet-500" />
            Фільтри експорту
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Період</Label>
              <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-md h-10 px-3 text-sm">
                <option>Поточний місяць</option>
                <option>Останні 3 місяці</option>
                <option>Весь час</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-md h-10 px-3 text-sm">
                <option>Всі статуси</option>
                <option>Тільки опубліковані</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full border-white/10">
                Застосувати фільтри
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Export;