import React from 'react';
import { useForm } from 'react-hook-form';
import { Palette, Type, Save, RefreshCw, Layout } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const LoginCustomization = () => {
  const { loginPageConfig, updateLoginConfig } = useDataStore();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: loginPageConfig
  });

  const onSubmit = (data: any) => {
    updateLoginConfig(data);
    showSuccess('Контент лендингу оновлено!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Кастомізація лендингу</h1>
          <p className="text-gray-500">Повне управління контентом головної сторінки</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => reset()} className="border-white/10">
            <RefreshCw size={18} className="mr-2" />
            Скинути
          </Button>
          <Button onClick={handleSubmit(onSubmit)} className="bg-red-700 hover:bg-red-800">
            <Save size={18} className="mr-2" />
            Зберегти зміни
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout size={20} className="text-red-700" />
                Головний екран (Hero)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Заголовок 1</Label>
                  <Input {...register('heroTitle1')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Заголовок 2</Label>
                  <Input {...register('heroTitle2')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Заголовок 3</Label>
                  <Input {...register('heroTitle3')} className="bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Підзаголовок</Label>
                <Textarea {...register('heroSubtitle')} className="bg-[#0a0a0a] border-white/10 min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type size={20} className="text-red-700" />
                Сторінка входу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Текст логотипу</Label>
                <Input {...register('logoText')} className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Заголовок вітання</Label>
                  <Input {...register('welcomeTitle')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Підзаголовок</Label>
                  <Input {...register('welcomeSubtitle')} className="bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} className="text-red-700" />
                Переваги (Features)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <Label className="text-red-700 font-bold">Фішка 1</Label>
                <Input {...register('feature1Title')} placeholder="Заголовок" className="bg-[#0a0a0a] border-white/10" />
                <Textarea {...register('feature1Desc')} placeholder="Опис" className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <Label className="text-red-700 font-bold">Фішка 2</Label>
                <Input {...register('feature2Title')} placeholder="Заголовок" className="bg-[#0a0a0a] border-white/10" />
                <Textarea {...register('feature2Desc')} placeholder="Опис" className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="space-y-4 p-4 bg-white/5 rounded-lg">
                <Label className="text-red-700 font-bold">Фішка 3</Label>
                <Input {...register('feature3Title')} placeholder="Заголовок" className="bg-[#0a0a0a] border-white/10" />
                <Textarea {...register('feature3Desc')} placeholder="Опис" className="bg-[#0a0a0a] border-white/10" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginCustomization;