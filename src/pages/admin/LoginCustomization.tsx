import React from 'react';
import { useForm } from 'react-hook-form';
import { Palette, Image as ImageIcon, Type, Save, RefreshCw } from 'lucide-react';
import { initialLoginPageContent } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const LoginCustomization = () => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: initialLoginPageContent
  });

  const onSubmit = (data: any) => {
    console.log('Login Customization Update:', data);
    showSuccess('Дизайн сторінки входу оновлено!');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дизайн входу</h1>
          <p className="text-gray-500">Налаштування зовнішнього вигляду сторінки авторизації</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => reset()} className="border-white/10">
            <RefreshCw size={18} className="mr-2" />
            Скинути
          </Button>
          <Button onClick={handleSubmit(onSubmit)} className="bg-violet-600 hover:bg-violet-700">
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
                <Type size={20} className="text-violet-500" />
                Текстовий контент
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
              <div className="space-y-2">
                <Label>Головний заголовок (зліва)</Label>
                <Input {...register('leftTitle')} className="bg-[#0a0a0a] border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Опис (зліва)</Label>
                <Textarea {...register('leftText2')} className="bg-[#0a0a0a] border-white/10 min-h-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette size={20} className="text-violet-500" />
                Кольори та Стиль
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Акцентний колір (Primary)</Label>
                <div className="flex gap-2">
                  <Input type="color" {...register('primaryColor')} className="w-12 h-10 p-1 bg-[#0a0a0a] border-white/10" />
                  <Input {...register('primaryColor')} className="flex-1 bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Фоновий колір (Secondary)</Label>
                <div className="flex gap-2">
                  <Input type="color" {...register('secondaryColor')} className="w-12 h-10 p-1 bg-[#0a0a0a] border-white/10" />
                  <Input {...register('secondaryColor')} className="flex-1 bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-[#1a1a1a] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon size={20} className="text-violet-500" />
                Медіа та Фішки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Фішка 1</Label>
                  <Input {...register('feature1')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Фішка 2</Label>
                  <Input {...register('feature2')} className="bg-[#0a0a0a] border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Фішка 3</Label>
                  <Input {...register('feature3')} className="bg-[#0a0a0a] border-white/10" />
                </div>
              </div>
              <div className="pt-4">
                <Label className="mb-2 block">Попередній перегляд іконок соцмереж</Label>
                <div className="flex flex-wrap gap-2 p-4 bg-[#0a0a0a] rounded-lg border border-white/5">
                  {initialLoginPageContent.socialIcons.map(icon => (
                    <span key={icon} className="px-3 py-1 bg-white/5 rounded text-xs text-gray-400">{icon}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-xl">
            <h3 className="font-semibold mb-2">Живий перегляд</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Зміни застосовуються миттєво після збереження. Ви можете відкрити сторінку входу в новому вікні, щоб побачити результат.
            </p>
            <Button variant="link" className="p-0 h-auto text-violet-400 mt-4" onClick={() => window.open('/login', '_blank')}>
              Переглянути сторінку входу
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCustomization;