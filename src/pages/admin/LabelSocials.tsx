import React from 'react';
import { Globe, Instagram, Send, Youtube, Save, Plus, Trash2, Twitter, MessageCircle } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const PLATFORMS_LIST = [
  "Instagram", "Telegram", "YouTube", "TikTok", "Twitter", "Website"
];

const LabelSocials = () => {
  const { labelSocials, updateLabelSocials } = useDataStore();
  const [links, setLinks] = React.useState(labelSocials);

  const handleAdd = () => {
    setLinks([...links, { id: Date.now().toString(), name: 'Instagram', url: '' }]);
  };

  const handleRemove = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  const handleUpdate = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const onSave = () => {
    updateLabelSocials(links);
    showSuccess('Соцмережі лейбла оновлено!');
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Соцмережі лейбла</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Глобальні посилання для футера та смартлінків</p>
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none px-8"
        >
          <Plus size={16} className="mr-2 text-red-700" />
          Додати посилання
        </Button>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl max-w-3xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Список контактів</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {links.map((link, index) => (
            <div key={link.id} className="flex gap-4 items-end p-6 bg-white/5 border border-white/5 rounded-none group relative">
              <div className="flex-1 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Платформа</Label>
                <Select value={link.name} onValueChange={(val) => handleUpdate(index, 'name', val)}>
                  <SelectTrigger className="bg-black/40 border-white/5 h-12 text-xs rounded-none focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    {PLATFORMS_LIST.map(p => <SelectItem key={p} value={p} className="text-xs uppercase font-bold">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-[2] space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL посилання</Label>
                <Input 
                  value={link.url} 
                  onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                  className="bg-black/40 border-white/5 h-12 text-xs rounded-none focus:ring-0 focus:border-red-700"
                  placeholder="https://..."
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-12 w-12 rounded-none"
                onClick={() => handleRemove(link.id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}

          {links.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/5">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Список порожній</p>
            </div>
          )}

          <Button onClick={onSave} className="w-full bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest h-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)]">
            <Save size={18} className="mr-2" /> Зберегти всі зміни
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelSocials;