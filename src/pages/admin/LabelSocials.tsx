import React from 'react';
import { useForm } from 'react-hook-form';
import { Globe, Instagram, Send, Youtube, Save } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess } from '@/utils/toast';

const LabelSocials = () => {
  const { labelSocials, updateLabelSocials } = useDataStore();
  const { register, handleSubmit } = useForm({ defaultValues: labelSocials });

  const onSubmit = (data: any) => {
    updateLabelSocials(data);
    showSuccess('Соцмережі лейбла оновлено!');
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase">Соцмережі лейбла</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Глобальні посилання для всіх смартлінків</p>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Контактні дані</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Instagram size={14} /> Instagram
              </Label>
              <Input {...register('instagram')} className="bg-black/40 border-white/5 rounded-none h-12" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Send size={14} /> Telegram
              </Label>
              <Input {...register('telegram')} className="bg-black/40 border-white/5 rounded-none h-12" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Youtube size={14} /> YouTube
              </Label>
              <Input {...register('youtube')} className="bg-black/40 border-white/5 rounded-none h-12" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Globe size={14} /> Website
              </Label>
              <Input {...register('website')} className="bg-black/40 border-white/5 rounded-none h-12" />
            </div>
            <Button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest h-14 rounded-none">
              <Save size={18} className="mr-2" /> Зберегти зміни
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelSocials;