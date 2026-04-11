import React from 'react';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, Globe, Shield, Bell, Save, Music, Palette, Layout as LayoutIcon } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const { settings, updateSettings, homePageConfig, updateHomeConfig, adminPanelConfig, updateAdminConfig } = useDataStore();
  
  const generalForm = useForm({ defaultValues: settings });
  const homeForm = useForm({ defaultValues: homePageConfig });
  const adminForm = useForm({ defaultValues: adminPanelConfig });

  const onSaveGeneral = (data: any) => {
    updateSettings(data);
    showSuccess('Загальні налаштування збережено');
  };

  const onSaveHome = (data: any) => {
    updateHomeConfig(data);
    showSuccess('Дизайн головної сторінки оновлено');
  };

  const onSaveAdmin = (data: any) => {
    updateAdminConfig(data);
    showSuccess('Налаштування адмінки збережено');
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Налаштування</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Глобальні параметри платформи</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 h-14 rounded-none">
          <TabsTrigger value="general" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Загальні</TabsTrigger>
          <TabsTrigger value="home" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Головна сторінка</TabsTrigger>
          <TabsTrigger value="admin" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Адмін-панель</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                <Globe size={18} className="text-red-700" /> Загальні параметри
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва сайту</Label>
                  <Input {...generalForm.register('siteName')} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email підтримки</Label>
                  <Input {...generalForm.register('contactEmail')} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5">
                <div className="space-y-1">
                  <Label className="text-xs font-black uppercase tracking-widest">Реєстрація артистів</Label>
                  <p className="text-[10px] text-zinc-600 uppercase font-bold">Дозволити новим користувачам створювати акаунти</p>
                </div>
                <Switch 
                  defaultChecked={settings.registrationEnabled} 
                  onCheckedChange={(val) => generalForm.setValue('registrationEnabled', val)}
                />
              </div>
              <Button onClick={generalForm.handleSubmit(onSaveGeneral)} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">Зберегти</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="home" className="mt-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                <Palette size={18} className="text-red-700" /> Кастомізація Home
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Головний заголовок</Label>
                <Input {...homeForm.register('heroTitle')} className="bg-black/40 border-white/5 rounded-none h-12" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Підзаголовок</Label>
                <Textarea {...homeForm.register('heroSubtitle')} className="bg-black/40 border-white/5 rounded-none min-h-[100px]" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Текст кнопки</Label>
                  <Input {...homeForm.register('buttonText')} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Акцентний колір</Label>
                  <div className="flex gap-3">
                    <Input type="color" {...homeForm.register('primaryColor')} className="w-12 h-12 p-1 bg-black/40 border-white/5 rounded-none" />
                    <Input {...homeForm.register('primaryColor')} className="flex-1 bg-black/40 border-white/5 rounded-none h-12" />
                  </div>
                </div>
              </div>
              <Button onClick={homeForm.handleSubmit(onSaveHome)} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">Оновити дизайн</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="mt-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                <LayoutIcon size={18} className="text-red-700" /> Кастомізація Адмінки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Текст логотипу</Label>
                  <Input {...adminForm.register('logoText')} className="bg-black/40 border-white/5 rounded-none h-12" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Колір акценту</Label>
                  <div className="flex gap-3">
                    <Input type="color" {...adminForm.register('accentColor')} className="w-12 h-12 p-1 bg-black/40 border-white/5 rounded-none" />
                    <Input {...adminForm.register('accentColor')} className="flex-1 bg-black/40 border-white/5 rounded-none h-12" />
                  </div>
                </div>
              </div>
              <Button onClick={adminForm.handleSubmit(onSaveAdmin)} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">Зберегти</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;