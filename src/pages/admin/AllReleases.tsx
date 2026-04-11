import React, { useState } from 'react';
import { Music, Edit2, Trash2, Search, Filter, Eye, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const AllReleases = () => {
  const { releases, updateRelease, statuses, fields } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRelease, setEditingRelease] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredReleases = releases.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (release: any) => {
    setEditingRelease({ ...release });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    updateRelease(editingRelease.id, editingRelease);
    showSuccess('Дані релізу оновлено');
    setIsDialogOpen(false);
  };

  const exportToExcel = () => {
    const data = releases.map(r => ({
      ID: r.id,
      Назва: r.title,
      Артист: r.artist,
      Жанр: r.genre,
      Статус: r.status,
      Стріми: r.streams,
      Дата_релізу: r.releaseDate,
      User_ID: r.userId,
      Створено: new Date(r.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Releases");
    XLSX.writeFile(wb, `all_releases_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccess('Експорт завершено!');
  };

  const getStatusBadge = (statusName: string) => {
    const status = statuses.find(s => s.name === statusName);
    const color = status?.color || 'gray';
    
    const colors: Record<string, string> = {
      green: "bg-green-500/10 text-green-500 border-green-500/20",
      yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      red: "bg-red-500/10 text-red-500 border-red-500/20",
      blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      gray: "bg-gray-500/10 text-gray-500 border-gray-500/20"
    };

    return (
      <Badge variant="outline" className={colors[color]}>
        {statusName}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Всі релізи</h1>
          <p className="text-gray-500">Керування каталогом усіх артистів ({releases.length})</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-6 rounded-none hover:bg-white/10"
          >
            <Download size={14} className="mr-2 text-red-700" />
            Export XLSX
          </Button>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <Input 
              placeholder="Пошук..." 
              className="bg-[#1a1a1a] border-white/10 pl-10 h-12 rounded-none" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden rounded-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Реліз</th>
                <th className="px-6 py-4">Артист</th>
                <th className="px-6 py-4">Жанр</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={release.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                      <span className="font-medium">{release.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{release.artist}</td>
                  <td className="px-6 py-4 text-gray-400">{release.genre}</td>
                  <td className="px-6 py-4">{getStatusBadge(release.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{release.releaseDate}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(release)}>
                      <Edit2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Редагувати реліз</DialogTitle>
          </DialogHeader>
          {editingRelease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Статус релізу</Label>
                  <Select 
                    value={editingRelease.status} 
                    onValueChange={(v) => setEditingRelease({...editingRelease, status: v})}
                  >
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {statuses.map(s => (
                        <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Назва</Label>
                  <Input value={editingRelease.title} onChange={(e) => setEditingRelease({...editingRelease, title: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Артист</Label>
                  <Input value={editingRelease.artist} onChange={(e) => setEditingRelease({...editingRelease, artist: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Жанр</Label>
                  <Input value={editingRelease.genre} onChange={(e) => setEditingRelease({...editingRelease, genre: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Обкладинка (URL)</Label>
                  <Input value={editingRelease.coverUrl} onChange={(e) => setEditingRelease({...editingRelease, coverUrl: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Аудіо (URL)</Label>
                  <Input value={editingRelease.audioUrl} onChange={(e) => setEditingRelease({...editingRelease, audioUrl: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Дата релізу</Label>
                  <Input type="date" value={editingRelease.releaseDate} onChange={(e) => setEditingRelease({...editingRelease, releaseDate: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="pt-4">
                  <img src={editingRelease.coverUrl} className="w-full aspect-square object-cover rounded-none border border-white/10" alt="Preview" />
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4">
                <h3 className="text-sm font-bold mb-4 text-zinc-400 uppercase tracking-widest">Додаткові поля</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.filter(f => f.section === 'release' && !['title', 'artist', 'genre', 'releaseDate', 'coverUrl', 'audioUrl'].includes(f.name)).map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input 
                        value={editingRelease[field.name] || ''} 
                        onChange={(e) => setEditingRelease({...editingRelease, [field.name]: e.target.value})} 
                        className="bg-black/40 border-white/5 rounded-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 rounded-none px-8">Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllReleases;