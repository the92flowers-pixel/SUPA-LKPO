import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, Shield } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess } from '@/utils/toast';

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { updateUser, fields } = useDataStore();
  
  const { register, handleSubmit } = useForm<any>({
    defaultValues: {
      artistName: user?.artistName || '',
      login: user?.login || '',
      bio: 'Український виконавець.'
    }
  });

  const profileFields = fields.filter(f => f.section === 'profile' && f.visible);

  const onSubmit = (data: any) => {
    if (user) {
      const updatedData = { artistName: data.artistName, ...data };
      updateUser(user.id, updatedData);
      setAuth({ ...user, ...updatedData }, 'mock-jwt');
      showSuccess('Профіль успішно оновлено!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Профіль артиста</h1>
          <p className="text-gray-500">Керуйте своєю публічною інформацією</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium">
          <Shield size={16} />
          {user?.role === 'admin' ? 'Адміністратор' : 'Верифікований артист'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 bg-[#1a1a1a] border-white/5 h-fit">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-violet-500/20 border-4 border-violet-500/10 flex items-center justify-center mb-4 relative group cursor-pointer">
              <User size={64} className="text-violet-500" />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-bold">Змінити</span>
              </div>
            </div>
            <h3 className="text-xl font-bold">{user?.artistName || user?.login}</h3>
            <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role}</p>
            <div className="w-full h-px bg-white/5 my-6" />
            <div className="space-y-4 w-full text-left">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">ID Артиста</p>
                <p className="text-sm font-mono text-violet-400">#ZH-{user?.id || '000'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Дата реєстрації</p>
                <p className="text-sm">15.05.2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="artistName">Сценічне ім'я</Label>
                  <Input 
                    id="artistName" 
                    {...register('artistName')} 
                    className="bg-[#0a0a0a] border-white/10 focus:border-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login">Email (Логін)</Label>
                  <Input 
                    id="login" 
                    disabled
                    {...register('login')} 
                    className="bg-[#0a0a0a] border-white/10 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {profileFields.map((field) => (
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

              <div className="pt-4">
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