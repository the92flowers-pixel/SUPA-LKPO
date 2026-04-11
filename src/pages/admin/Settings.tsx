import React from 'react';
import { useForm } from 'react-hook-form';
import { Settings as SettingsIcon, Globe, Shield, Bell, Save, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Settings = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      siteName: 'ЖУРБА MUSIC',
      contactEmail: 'support@zhurba.music',
      genres: 'Hip-Hop, Pop, Electronic, Rock, Sad Rap',
      maintenanceMode: false,
      registrationEnabled: true
    }
  });

  const onSubmit = (data: any) => {
    console.log('Settings Update:', data);
    showSuccess('Налаштування сайту збережено!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Налаштування</h1>
          <p className="text-gray-500">Глобальні параметри платформи</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} className="bg-violet-600 hover:bg-violet-700">
          <Save size={18} className="mr-2" />
          Зберегти все
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-violet-500" />
                Загальні
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Назва платформи</Label>
                  <Input {...register('siteName')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Email для підтримки</Label>
                  <Input {...register('contactEmail')} className="bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Music size={16} className="text-violet-400" />
                  Доступні жанри (через кому)
                </Label>
                <Textarea {...register('genres')} className="bg-[#0a0a0a] border-white/10 min-h-[80px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-violet-500" />
                Безпека та Доступ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Реєстрація нових артистів</Label>
                  <p className="text-sm text-gray-500">Дозволити користувачам створювати акаунти самостійно</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                <div className="space-y-0.5">
                  <Label className="text-base">Режим технічного обслуговування</Label>
                  <p className="text-sm text-gray-500">Закрити доступ до сайту для всіх, крім адміністраторів</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} className="text-violet-500" />
                Сповіщення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch id="notify-new-release" defaultChecked />
                <Label htmlFor="notify-new-release">Нові релізи на email</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="notify-moderation" defaultChecked />
                <Label htmlFor="notify-moderation">Результати модерації</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="notify-stats" />
                <Label htmlFor="notify-stats">Щотижнева статистика</Label>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-xl">
            <h3 className="font-semibold text-amber-500 mb-2">Увага</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Зміна деяких налаштувань може вплинути на роботу існуючих користувачів. Будьте обережні з режимом обслуговування.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;