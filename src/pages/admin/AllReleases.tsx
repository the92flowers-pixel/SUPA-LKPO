import React from 'react';
import { Music, Edit2, Trash2, Search, Save, ExternalLink, Play } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const AllReleases = () => {
  const { releases, statuses, updateRelease } = useDataStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingRelease, setEditingRelease] = React.useState<any>(null);

  const filteredReleases = releases.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveRelease = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get('title') as string,
      artist: formData.get('artist') as string,
      genre: formData.get('genre') as string,
      status: formData.get('status') as string,
      releaseDate: formData.get('releaseDate') as string,
      coverUrl: formData.get('coverUrl') as string,
      audioUrl: formData.get('audioUrl') as string,
    };
    updateRelease(editingRelease.id, data);
    showSuccess('Дані релізу оновлено');
    setEditingRelease(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Всі релізи</h1>
          <p className="text-gray-500">Управління всім музичним каталогом ({releases.length})</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input 
            placeholder="Пошук релізу..." 
            className="bg-[#1a1a1a] border-white/10 pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Реліз</th>
                <th className="px-6 py-4">Жанр</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={release.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                      <div>
                        <p className="font-medium">{release.title}</p>
                        <p className="text-xs text-gray-500">{release.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{release.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{release.releaseDate}</td>
                  <td className="px-6 py-4">
                    <Badge className={release.status === 'Опубліковано' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                      {release.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-white/10"
                        onClick={() => setEditingRelease(release)}
                      >
                        <Edit2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!editingRelease} onOpenChange={() => setEditingRelease(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редагування релізу</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveRelease} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Назва треку</Label>
                <Input name="title" defaultValue={editingRelease?.title} className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Артист</Label>
                <Input name="artist" defaultValue={editingRelease?.artist} className="bg-[#0a0a0a] border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Жанр</Label>
                <Input name="genre" defaultValue={editingRelease?.genre} className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Дата релізу</Label>
                <Input name="releaseDate" type="date" defaultValue={editingRelease?.releaseDate} className="bg-[#0a0a0a] border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select name="status" defaultValue={editingRelease?.status}>
                <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {statuses.map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL Обкладинки</Label>
              <Input name="coverUrl" defaultValue={editingRelease?.coverUrl} className="bg-[#0a0a0a] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>URL Аудіо</Label>
              <Input name="audioUrl" defaultValue={editingRelease?.audioUrl} className="bg-[#0a0a0a] border-white/10" />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditingRelease(null)}>Скасувати</Button>
              <Button type="submit" className="bg-red-700 hover:bg-red-800">
                <Save size={16} className="mr-2" /> Зберегти зміни
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllReleases;