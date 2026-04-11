import React, { useState } from 'react';
import { Globe, Search, Trash2, Edit2, ExternalLink, User, Calendar, Plus } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';

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

  const getCreator = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.login || 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Сайти артистів</h1>
          <p className="text-gray-500">Керування персональними сторінками ({artistWebsites.length})</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <Input 
            placeholder="Пошук за ім'ям або URL..." 
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
                <th className="px-6 py-4">Артист</th>
                <th className="px-6 py-4">URL (Slug)</th>
                <th className="px-6 py-4">Власник (Login)</th>
                <th className="px-6 py-4">Посилання</th>
                <th className="px-6 py-4">Дата створення</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWebsites.length > 0 ? (
                filteredWebsites.map((website) => (
                  <tr key={website.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={website.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <span className="font-medium text-sm">{website.stageName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`/a/${website.slug}`} 
                        target="_blank" 
                        className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm font-mono"
                      >
                        /a/{website.slug} <ExternalLink size={12} />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{getCreator(website.userId)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-white/5 text-[9px] uppercase font-bold">
                        {website.links.length} Links
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(website.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(website)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10"
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
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-600 uppercase text-xs font-bold tracking-widest">
                    Сайтів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle>Редагувати сайт артиста</DialogTitle>
          </DialogHeader>
          {editingWebsite && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Персональне посилання (URL)</Label>
                  <Input 
                    value={editingWebsite.slug} 
                    onChange={(e) => setEditingWebsite({...editingWebsite, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="bg-black/40 border-white/5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Сценічне Ім’я</Label>
                  <Input 
                    value={editingWebsite.stageName} 
                    onChange={(e) => setEditingWebsite({...editingWebsite, stageName: e.target.value})}
                    className="bg-black/40 border-white/5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>БІО</Label>
                <Textarea 
                  value={editingWebsite.bio} 
                  onChange={(e) => setEditingWebsite({...editingWebsite, bio: e.target.value})}
                  className="bg-black/40 border-white/5"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none">
              Зберегти зміни
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtistWebsitesManagement;