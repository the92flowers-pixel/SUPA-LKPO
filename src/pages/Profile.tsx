import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, Shield, Camera } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Профіль</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваша ідентичність у системі</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-2 bg-red-900/10 border border-red-900/20 rounded-none text-red-500 text-[10px] font-black uppercase tracking-widest">
          <Shield size={14} />
          {user?.role === 'admin' ? 'Адміністратор' : 'Верифікований артист'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <Card className="lg:col-span-1 bg-black/40 border-white/5 rounded-none shadow-2xl h-fit">
          <CardContent className="pt-12 flex flex-col items-center text-center">
            <div className="w-40 h-40 rounded-none bg-red-900/5 border border-white/5 flex items-center justify-center mb-8 relative group cursor-pointer overflow-hidden">
              <User size={80} className="text-zinc-800 group-hover:text-red-900 transition-colors duration-500" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-500">
                <Camera size={24} className="text-red-700 mb-2" />
                <span className="text-[9px] font-black uppercase tracking-widest">Змінити</span>
              </div>
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{user?.artistName || user?.login}</h3>
            <p className="text-[10px] text-zinc-600 mt-2 uppercase font-bold tracking-[0.3em]">{user?.role}</p>
            
            <div className="w-full h-px bg-white/5 my-8" />
            
            <div className="space-y-6 w-full text-left">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">ID Артиста</p>
                <p className="text-xs font-mono text-red-800">#ZH-{user?.id || '000'}</p>
              </div>
              <div>
                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Дата реєстрації</p>
                <p className="text-xs font-bold text-zinc-400">15.05.2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
                  <Input 
                    {...register('artistName')} 
                    className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email (Логін)</Label>
                  <Input 
                    disabled
                    {...register('login')} 
                    className="bg-black/20 border-white/5 rounded-none h-12 opacity-40 cursor-not-allowed text-zinc-500"
                  />
                </div>
              </div>

              {profileFields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{field.label}</Label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      {...register(field.name)} 
                      className="bg-black/40 border-white/5 rounded-none min-h-[150px] focus:border-red-900/50 text-white resize-none"
                    />
                  ) : (
                    <Input 
                      type={field.type}
                      {...register(field.name)} 
                      className="bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white"
                    />
                  )}
                </div>
              ))}

              <div className="pt-6">
                <Button type="submit" className="bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-10 h-12 rounded-none shadow-[0_0_20px_rgba(185,28,28,0.2)]">
                  <Save size={16} className="mr-3" />
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