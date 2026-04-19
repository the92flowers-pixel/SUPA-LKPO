import React, { useState } from 'react';
import { Globe, Search, Trash2, Edit2, ExternalLink, User, Calendar, Plus, Image as ImageIcon, Link2 } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const PLATFORMS_LIST = [
  "Instagram", "Telegram", "YouTube", "TikTok", "Spotify", "Apple Music", "SoundCloud", "Website"
];

const ArtistWebsitesManagement = () => {
  const { artistWebsites, users, updateArtistWebsite, deleteArtistWebsite } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingWebsite, setEditingWebsite] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredWebsites = artistWebsites.filter(w => 
    w.stageName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (website: any) => {
    setEditingWebsite({ ...website });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingWebsite.slug) {
      showError('Вкажіть адресу сайту');
      return;
    }

    const isSlugTaken = artistWebsites.some(w => w.slug === editingWebsite.slug && w.id !== editingWebsite.id);
    if (isSlugTaken) {
      showError('Цей URL вже зайнятий');
      return;
    }

    updateArtistWebsite(editingWebsite.id, editingWebsite);
    showSuccess('Сайт артиста оновлено');
    setIsDialogOpen(false);
  };

  const addLink = () => {
    setEditingWebsite({
      ...editingWebsite,
      links: [...editingWebsite.links, { id: Date.now().toString(), name: 'Instagram', url: '' }]
    });
  };

  const removeLink = (id: string) => {
    setEditingWebsite({
      ...editingWebsite,
      links: editingWebsite.links.filter((l: any) => l.id !== id)
    });
  };

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...editingWebsite.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditingWebsite({ ...editingWebsite, links: newLinks });
  };

  const getCreator = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.login || 'Unknown';
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Сайти артистів</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування персональними сторінками ({artistWebsites.length})</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <Input 
            placeholder="Пошук..." 
            className="bg-black/40 border-white/5 pl-10 h-12 rounded-none text-[10px] font-bold uppercase tracking-widest" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
              <tr>
                <th className="px-6 py-5">Артист</th>
                <th className="px-6 py-5">URL (Slug)</th>
                <th className="px-6 py-5">Власник</th>
                <th className="px-6 py-5">Посилання</th>
                <th className="px-6 py-5 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWebsites.length > 0 ? (
                filteredWebsites.map((website) => (
                  <tr key={website.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img src={website.photoUrl} className="w-12 h-12 rounded-none object-cover border border-white/5" alt="" />
                        <span className="font-bold text-xs text-white uppercase tracking-wider">{website.stageName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a 
                        href={`/a/${website.slug}`} 
                        target="_blank" 
                        className="text-red-700 hover:text-red-500 flex items-center gap-2 text-[10px] font-mono"
                      >
                        /a/{website.slug} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-5 text-zinc-500 text-[10px] font-bold uppercase">{getCreator(website.userId)}</td>
                    <td className="px-6 py-5">
                      <Badge className="bg-white/5 text-zinc-500 border-none text-[9px] uppercase font-black tracking-widest rounded-none">
                        {website.links.length} Links
                      </Badge>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(website)} className="text-zinc-500 hover:text-white rounded-none">
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-none"
                          onClick={() => deleteArtistWebsite(website.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-800 uppercase text-[10px] font-black tracking-widest">
                    Сайтів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Редагувати сайт артиста</DialogTitle>
          </DialogHeader>
          {editingWebsite && (
            <div className="space-y-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Персональне посилання (URL)</Label>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-12">
                    <span className="text-zinc-600 text-xs font-mono">/a/</span>
                    <input 
                      value={editingWebsite.slug} 
                      onChange={(e) => setEditingWebsite({...editingWebsite, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне Ім’я</Label>
                  <Input 
                    value={editingWebsite.stageName} 
                    onChange={(e) => setEditingWebsite({...editingWebsite, stageName: e.target.value})}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">БІО</Label>
                <Textarea 
                  value={editingWebsite.bio} 
                  onChange={(e) => setEditingWebsite({...editingWebsite, bio: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <ImageIcon size={14} /> Посилання на фото (URL)
                </Label>
                <Input 
                  value={editingWebsite.photoUrl} 
                  onChange={(e) => setEditingWebsite({...editingWebsite, photoUrl: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-12"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Link2 size={14} /> Посилання та соцмережі
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addLink}
                    className="border-white/10 text-[9px] font-black uppercase tracking-widest h-8 rounded-none"
                  >
                    <Plus size={14} className="mr-2" /> Додати
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingWebsite.links.map((link: any, index: number) => (
                    <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end p-4 bg-white/5 border border-white/5 relative group">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                        <Select value={link.name} onValueChange={(val) => updateLink(index, 'name', val)}>
                          <SelectTrigger className="bg-black/40 border-white/5 h-10 text-xs rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                            {PLATFORMS_LIST.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-[2] space-y-2 flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[9px] text-zinc-600 uppercase font-black">URL</Label>
                          <Input 
                            value={link.url} 
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className="bg-black/40 border-white/5 h-10 text-xs rounded-none"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-10 w-10 rounded-none"
                          onClick={() => removeLink(link.id)}
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
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">
              Зберегти зміни
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtistWebsitesManagement;