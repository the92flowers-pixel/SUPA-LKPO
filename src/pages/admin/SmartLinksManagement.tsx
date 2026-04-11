import React, { useState } from 'react';
import { Link as LinkIcon, Search, Trash2, Edit2, ExternalLink, User, Calendar, Music, Plus } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const PLATFORMS_LIST = [
  "Apple Music",
  "Deezer",
  "iTunes",
  "SoundCloud",
  "Spotify",
  "YouTube",
  "YouTube Music"
];

const SmartLinksManagement = () => {
  const { smartLinks, releases, users, updateSmartLink, deleteSmartLink } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLink, setEditingLink] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredLinks = smartLinks.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (link: any) => {
    setEditingLink({ ...link });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    updateSmartLink(editingLink.id, editingLink);
    showSuccess('Смартлінк оновлено');
    setIsDialogOpen(false);
  };

  const addPlatform = () => {
    const newPlatform = { id: Date.now().toString(), name: 'Spotify', url: '', icon: 'spotify' };
    setEditingLink({
      ...editingLink,
      platforms: [...editingLink.platforms, newPlatform]
    });
  };

  const removePlatform = (id: string) => {
    setEditingLink({
      ...editingLink,
      platforms: editingLink.platforms.filter((p: any) => p.id !== id)
    });
  };

  const updatePlatform = (index: number, field: string, value: string) => {
    const newPlatforms = [...editingLink.platforms];
    newPlatforms[index] = { ...newPlatforms[index], [field]: value };
    if (field === 'name') {
      newPlatforms[index].icon = value.toLowerCase().replace(/\s+/g, '-');
    }
    setEditingLink({ ...editingLink, platforms: newPlatforms });
  };

  const getCreator = (releaseId: string) => {
    const release = releases.find(r => r.id === releaseId);
    if (!release) return 'Unknown';
    const user = users.find(u => u.id === release.userId);
    return user?.artistName || user?.login || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Керування смартлінками</h1>
          <p className="text-gray-500">Перегляд та редагування всіх активних посилань ({smartLinks.length})</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input 
            placeholder="Пошук за назвою або URL..." 
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
                <th className="px-6 py-4">URL (Slug)</th>
                <th className="px-6 py-4">Автор</th>
                <th className="px-6 py-4">Платформи</th>
                <th className="px-6 py-4">Дата створення</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={link.coverUrl} className="w-10 h-10 rounded object-cover" alt="" />
                        <div>
                          <p className="font-medium text-sm">{link.title}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{link.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`/s/${link.slug}`} 
                        target="_blank" 
                        className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-sm font-mono"
                      >
                        /{link.slug} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <User size={14} /> {getCreator(link.releaseId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {link.platforms.map((p: any) => (
                          <Badge key={p.id} variant="secondary" className="bg-white/5 text-[9px] uppercase font-bold">
                            {p.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(link.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10"
                          onClick={() => deleteSmartLink(link.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-600 uppercase text-xs font-bold tracking-widest">
                    Смартлінків не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редагувати смартлінк</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 uppercase text-[10px] font-bold tracking-widest">URL Slug</Label>
                <Input 
                  value={editingLink.slug} 
                  onChange={(e) => setEditingLink({...editingLink, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                  className="bg-black/40 border-white/5 font-mono h-12" 
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-400 uppercase text-[10px] font-bold tracking-widest">Платформи та посилання</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addPlatform}
                    className="border-white/10 text-[10px] font-black uppercase tracking-widest h-8"
                  >
                    <Plus size={14} className="mr-2" /> Додати
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingLink.platforms.map((p: any, index: number) => (
                    <div key={p.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end p-4 bg-white/5 border border-white/5 relative group">
                      <div className="space-y-2">
                        <Label className="text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                        <Select value={p.name} onValueChange={(val) => updatePlatform(index, 'name', val)}>
                          <SelectTrigger className="bg-black/40 border-white/5 h-10 text-xs rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                            {PLATFORMS_LIST.map(plat => (
                              <SelectItem key={plat} value={plat} className="text-xs">{plat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2 space-y-2 flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[9px] text-zinc-600 uppercase font-black">URL посилання</Label>
                          <Input 
                            value={p.url} 
                            onChange={(e) => updatePlatform(index, 'url', e.target.value)}
                            className="bg-black/40 border-white/5 h-10 text-xs rounded-none"
                            placeholder="https://..."
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-10 w-10"
                          onClick={() => removePlatform(p.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none">Зберегти зміни</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartLinksManagement;