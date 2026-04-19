import React, { useState, useEffect } from 'react';
import { Music, Edit2, Trash2, Search, Filter, Eye, CheckCircle, XCircle, Clock, RefreshCw, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/supabase';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const AllReleases = () => {
  const { releases, updateRelease, updateReleaseStatus, statuses, fetchReleases, users } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingRelease, setEditingRelease] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const filteredReleases = releases.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (release: any) => {
    setEditingRelease({ ...release });
    setIsDialogOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingRelease) return;

    setIsUploading(true);
    try {
      const fileName = `${editingRelease.userId}/${Date.now()}-${file.name}`;
      const publicUrl = await uploadFile('covers', fileName, file);
      setEditingRelease({ ...editingRelease, coverUrl: publicUrl });
      showSuccess('Обкладинку оновлено');
    } catch (error) {
      showError('Помилка завантаження');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (editingRelease) {
      await updateRelease(editingRelease.id, editingRelease);
      showSuccess('Дані релізу оновлено');
      setIsDialogOpen(false);
    }
  };

  const handleQuickAction = async (id: string, newStatus: string) => {
    await updateReleaseStatus(id, newStatus);
    showSuccess(`Статус оновлено на "${newStatus}"`);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.artistName || user?.login || 'Невідомий';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      'На модерації': { bg: 'bg-amber-500/10', text: 'text-amber-500' },
      'Опубліковано': { bg: 'bg-green-500/10', text: 'text-green-500' },
      'Відхилено': { bg: 'bg-red-500/10', text: 'text-red-500' },
    };
    const config = statusConfig[status] || statusConfig['На модерації'];
    return (
      <Badge className={cn("border-none text-[9px] uppercase font-black tracking-widest rounded-none", config.bg, config.text)}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Всі релізи</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування каталогом ({releases.length})</p>
        </div>
        <Button 
          onClick={() => fetchReleases()} 
          variant="outline" 
          className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
        >
          <RefreshCw size={14} className="mr-2" /> Оновити
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <Input 
            placeholder="Пошук за назвою або артистом..." 
            className="bg-black/40 border-white/5 pl-10 h-12 rounded-none text-[10px] font-bold uppercase tracking-widest" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-black/40 border-white/5 w-48 h-12 rounded-none text-[10px] font-black uppercase tracking-widest">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">Всі статуси</SelectItem>
            {statuses.map(s => (
              <SelectItem key={s.id} value={s.name} className="text-[10px] font-bold uppercase">{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Реліз</th>
                <th className="px-6 py-5">Артист</th>
                <th className="px-6 py-5">Жанр</th>
                <th className="px-6 py-5">Власник</th>
                <th className="px-6 py-5">Статус</th>
                <th className="px-6 py-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReleases.map((release) => (
                <tr key={release.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img 
                        src={release.coverUrl || FALLBACK_IMAGE} 
                        className="w-12 h-12 rounded-none object-cover border border-white/5" 
                        alt="" 
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                      />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{release.title}</p>
                        <p className="text-[9px] text-zinc-600 font-mono">ID: {release.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-zinc-400">{release.artist}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{release.genre || 'Другое'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{getUserName(release.userId)}</span>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(release.status)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {release.status === 'На модерації' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleQuickAction(release.id, 'Опубліковано')}
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-none"
                            title="Схвалити"
                          >
                            <CheckCircle size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleQuickAction(release.id, 'Відхилено')}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-none"
                            title="Відхилити"
                          >
                            <XCircle size={16} />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(release)}
                        className="text-zinc-500 hover:text-white rounded-none"
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-3xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Редагувати реліз</DialogTitle>
          </DialogHeader>
          {editingRelease && (
            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва</Label>
                  <Input 
                    value={editingRelease.title} 
                    onChange={(e) => setEditingRelease({...editingRelease, title: e.target.value})} 
                    className="bg-black/40 border-white/5 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист</Label>
                  <Input 
                    value={editingRelease.artist} 
                    onChange={(e) => setEditingRelease({...editingRelease, artist: e.target.value})} 
                    className="bg-black/40 border-white/5 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Жанр</Label>
                  <Input 
                    value={editingRelease.genre} 
                    onChange={(e) => setEditingRelease({...editingRelease, genre: e.target.value})} 
                    className="bg-black/40 border-white/5 rounded-none h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Статус</Label>
                  <Select value={editingRelease.status} onValueChange={(v) => setEditingRelease({...editingRelease, status: v})}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {statuses.map(s => (
                        <SelectItem key={s.id} value={s.name} className="text-xs font-bold uppercase">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Обкладинка</Label>
                  <div className="aspect-square border border-white/5 overflow-hidden relative group">
                    <img 
                      src={editingRelease.coverUrl || FALLBACK_IMAGE} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <input type="file" id="admin-cover-upload" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploading} />
                      <label htmlFor="admin-cover-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                        <span className="text-[10px] font-black uppercase">Змінити файл</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Дата релізу</Label>
                  <Input 
                    type="date" 
                    value={editingRelease.releaseDate || ''} 
                    onChange={(e) => setEditingRelease({...editingRelease, releaseDate: e.target.value})} 
                    className="bg-black/40 border-white/5 rounded-none h-12" 
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-black uppercase tracking-widest rounded-none">Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none">Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllReleases;