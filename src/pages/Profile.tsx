import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, Shield } from 'lucide-react';
import { initialFields } from '@/lib/mockData';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess } from '@/utils/toast';

const Profile = () => {
  const { user } = useAuthStore();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      artistName: user?.artistName || '',
      login: user?.login || '',
      bio: 'Український виконавець у жанрі Sad Rap. Пишу про те, що болить.'
    }
  });

  const fields = initialFields.filter(f => f.section === 'profile' && f.visible);

  const onSubmit = (data: any) => {
    console.log('Profile Update:', data);
    showSuccess('Профіль успішно оновлено!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Профіль артиста</h1>
          <p className="text-gray-500">Керуйте своєю публічною інформацією</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 text-violet-500 rounded-full text-sm font-medium">
          <Shield size={16} />
          Верифікований артист
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 bg-[#1a1a1a] border-white/5 h-fit">
          <CardContent className="pt-6 text-center">
            <div className="w-32 h-32 rounded-full bg-violet-500 mx-auto mb-4 flex items-center justify-center text-4xl font-bold">
              {user?.artistName?.[0] || user?.login[0].toUpperCase()}
            </div>
            <h3 className="text-xl font-bold">{user?.artistName || 'Артист'}</h3>
            <p className="text-sm text-gray-500 mb-6">{user?.login}</p>
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Змінити фото
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Основна інформація</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Сценічне ім'я</Label>
                  <Input 
                    id="artistName" 
                    {...register('artistName')} 
                    className="bg-[#0a0a0a] border-white/10 focus:border-violet-500"
                  />
                </div>
                
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea 
                        id={field.name} 
                        {...register(field.name)} 
                        className="bg-[#0a0a0a] border-white/10 focus:border-violet-500 min-h-[120px]"
                      />
                    ) : (
                      <Input 
                        id={field.name} 
                        type={field.type}
                        {...register(field.name)} 
                        className="bg-[#0a0a0a] border-white/10 focus:border-violet-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                  <Save size={18} className="mr-2" />
                  Зберегти зміни
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;