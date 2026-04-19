import React, { useState, useEffect } from 'react';
import { Music, Edit2, Search, RefreshCw, CheckCircle, XCircle, Loader2, Save, X, Shield } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const AllReleases = () => {
  const { releases, updateRelease, updateReleaseStatus, statuses, fetchReleases, users, fields } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingRelease, setEditingRelease] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchReleases();
  }, [fetchReleases]);

  const releaseFields = fields.filter(f => f.section === 'release');

  const filteredReleases = releases.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.artist || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (release: any) => {
    setEditingRelease({ ...release });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingRelease) return;
    setIsSaving(true);
    try {
      await updateRelease(editingRelease.id, editingRelease);
      showSuccess('Дані релізу оновлено та синхронізовано');
      setIsDialogOpen(false);
    } catch (error) {
      showError('Помилка при збереженні');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Всі релізи</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування каталогом ({releases.length})</p>
        </div>
        <Button onClick={() => fetchReleases()} variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none">
          <RefreshCw size={14} className="mr-2" /> Оновити
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <Input placeholder="Пошук..." className="bg-black/40 border-white/5 pl-10 h-12 rounded-none text-[10px] font-bold uppercase" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-black/40 border-white/5 w-48 h-12 rounded-none text-[10px] font-black uppercase">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
            <SelectItem value="all" className="text-[10px] font-bold uppercase">Всі статуси</SelectItem>
            {statuses.map(s => <SelectItem key={s.id} value={s.name} className="text-[10px] font-bold uppercase">{s.name}</SelectItem>)}
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
                      <img src={release.coverUrl || FALLBACK_IMAGE} className="w-12 h-12 rounded-none object-cover border border-white/5" alt="" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{release.title}</p>
                        <p className="text-[9px] text-zinc-600 font-mono">ID: {release.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5"><p className="text-xs font-bold text-zinc-400">{release.artist}</p></td>
                  <td className="px-6 py-5"><span className="text-[10px] font-bold text-zinc-500 uppercase">{getUserName(release.userId)}</span></td>
                  <td className="px-6 py-5">
                    <Badge className={cn("border-none text-[9px] uppercase font-black tracking-widest rounded-none", release.status === 'Опубліковано' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500')}>
                      {release.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {release.status === 'На модерації' && (
                        <Button variant="ghost" size="sm" onClick={() => handleQuickAction(release.id, 'Опубліковано')} className="text-green-500 hover:bg-green-500/10 rounded-none"><CheckCircle size={16} /></Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(release)} className="text-zinc-500 hover:text-white rounded-none"><Edit2 size={16} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tighter">Редагування релізу (Адмін)</DialogTitle></DialogHeader>
          {editingRelease && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва релізу</Label>
                  <Input value={editingRelease.title} onChange={(e) => setEditingRelease({...editingRelease, title: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист (Псевдонім)</Label>
                  <Input value={editingRelease.artist} onChange={(e) => setEditingRelease({...editingRelease, artist: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виконавець (ПІБ)</Label>
                  <Input value={editingRelease.performer} onChange={(e) => setEditingRelease({...editingRelease, performer: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Композитор</Label>
                  <Input value={editingRelease.composer} onChange={(e) => setEditingRelease({...editingRelease, composer: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Жанр</Label>
                  <Input value={editingRelease.genre} onChange={(e) => setEditingRelease({...editingRelease, genre: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                
                {/* Dynamic Fields */}
                {releaseFields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea value={editingRelease[field.name] || ''} onChange={(e) => setEditingRelease({...editingRelease, [field.name]: e.target.value})} className="bg-black/40 border-white/5 rounded-none min-h-[100px]" />
                    ) : field.type === 'select' ? (
                      <Select value={editingRelease[field.name] || ''} onValueChange={(v) => setEditingRelease({...editingRelease, [field.name]: v})}>
                        <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                          {field.options?.split(',').map((opt: string) => (
                            <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs font-bold uppercase">{opt.trim()}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={editingRelease[field.name] || ''} onChange={(e) => setEditingRelease({...editingRelease, [field.name]: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                    )}
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Обкладинки</Label>
                  <Input value={editingRelease.coverUrl} onChange={(e) => setEditingRelease({...editingRelease, coverUrl: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Статус</Label>
                  <Select value={editingRelease.status} onValueChange={(v) => setEditingRelease({...editingRelease, status: v})}>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                      {statuses.map(s => <SelectItem key={s.id} value={s.name} className="text-xs font-bold uppercase">{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                    <Shield size={14} /> Авторські права (Докази)
                  </Label>
                  <Input value={editingRelease.copyrights} onChange={(e) => setEditingRelease({...editingRelease, copyrights: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" placeholder="Посилання на докази..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ISRC</Label>
                  <Input value={editingRelease.isrc} onChange={(e) => setEditingRelease({...editingRelease, isrc: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12 font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на файли (Drive/Dropbox)</Label>
                  <Input value={editingRelease.releaseUrl} onChange={(e) => setEditingRelease({...editingRelease, releaseUrl: e.target.value})} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опис / Нотатки</Label>
                  <Textarea value={editingRelease.description} onChange={(e) => setEditingRelease({...editingRelease, description: e.target.value})} className="bg-black/40 border-white/5 rounded-none min-h-[100px]" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none">Скасувати</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">
              {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Зберегти зміни</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllReleases;