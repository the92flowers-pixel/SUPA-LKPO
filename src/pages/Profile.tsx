import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Save, Shield, Camera, ShieldCheck, ShieldAlert, Globe, Plus, Trash2, ExternalLink, Upload, Loader2, X, Key, Mail } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/supabase';

const FALLBACK_AVATAR = "https://jurbamusic.iceiy.com/profileavatar.png";

const PLATFORMS_LIST = [
  "Instagram", "Telegram", "YouTube", "TikTok", "Spotify", "Apple Music", "SoundCloud", "Website"
];

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { updateUser, fields, users, artistWebsites, addArtistWebsite, updateArtistWebsite } = useDataStore();
  
  const currentUser = users.find(u => u.id === user?.id) || user;
  const userWebsite = artistWebsites.find(w => w.userId === currentUser?.id);

  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);
  
  const [newEmail, setNewEmail] = useState(currentUser?.login || '');
  const [newPassword, setNewPassword] = useState('');

  const [websiteData, setWebsiteData] = useState<any>({
    slug: '',
    stageName: '',
    bio: '',
    photoUrl: FALLBACK_AVATAR,
    links: [{ id: '1', name: 'Instagram', url: '' }]
  });

  useEffect(() => {
    if (isWebsiteModalOpen) {
      if (userWebsite) {
        setWebsiteData({ ...userWebsite });
      } else {
        setWebsiteData({
          slug: '',
          stageName: currentUser?.artistName || '',
          bio: '',
          photoUrl: FALLBACK_AVATAR,
          links: [{ id: '1', name: 'Instagram', url: '' }]
        });
      }
    }
  }, [isWebsiteModalOpen, userWebsite, currentUser]);

  const { register, handleSubmit, setValue, watch } = useForm<any>({
    defaultValues: {
      artistName: currentUser?.artistName || '',
      bio: currentUser?.bio || 'Український виконавець.',
      ...currentUser 
    }
  });

  const profileFields = fields.filter(f => f.section === 'profile' && f.visible);

  const onSubmit = async (data: any) => {
    if (currentUser) {
      await updateUser(currentUser.id, data);
      setAuth({ ...currentUser, ...data }, 'mock-jwt');
      showSuccess('Профіль успішно оновлено!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const loadingId = showLoading('Оновлення аватарки...');
    try {
      const path = `avatars/${currentUser?.id}/${Date.now()}-${file.name}`;
      const url = await uploadFile('avatars', path, file);
      await updateUser(currentUser?.id || '', { avatarUrl: url });
      setAuth({ ...currentUser, avatarUrl: url } as any);
      showSuccess('Аватарку оновлено!');
    } catch (err) {
      showError('Помилка завантаження');
    } finally {
      setIsUploadingAvatar(false);
      dismissToast(loadingId);
    }
  };

  const handleUpdateAuth = async () => {
    setIsAuthLoading(true);
    try {
      const updates: any = {};
      if (newEmail !== currentUser?.login) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      if (Object.keys(updates).length === 0) {
        showError('Змін не виявлено');
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) throw error;

      if (updates.email) {
        showSuccess('Email оновлено. Перевірте пошту для підтвердження.');
      }
      if (updates.password) {
        showSuccess('Пароль успішно змінено');
        setNewPassword('');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const fileName = `artists/${currentUser?.id}/${Date.now()}-${file.name}`;
      const publicUrl = await uploadFile('avatars', fileName, file);
      setWebsiteData({ ...websiteData, photoUrl: publicUrl });
      showSuccess('Фото завантажено');
    } catch (error) {
      showError('Помилка завантаження');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveWebsite = async () => {
    if (!websiteData.slug) {
      showError('Вкажіть адресу сайту');
      return;
    }

    const isSlugTaken = artistWebsites.some(w => w.slug === websiteData.slug && w.id !== userWebsite?.id);
    if (isSlugTaken) {
      showError('Цей URL вже зайнятий');
      return;
    }

    setIsSavingWebsite(true);
    try {
      if (userWebsite) {
        await updateArtistWebsite(userWebsite.id, websiteData);
        showSuccess('Сайт оновлено!');
      } else {
        await addArtistWebsite({
          ...websiteData,
          userId: currentUser?.id || '',
        });
        showSuccess('Сайт створено!');
      }
      setIsWebsiteModalOpen(false);
    } catch (error) {
      showError('Помилка при збереженні сайту');
    } finally {
      setIsSavingWebsite(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Профіль</h1>
          <p className="text-zinc-500 mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Ваша ідентичність у системі</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {userWebsite && (
            <Button 
              variant="outline"
              onClick={() => window.open(`/a/${userWebsite.slug}`, '_blank')}
              className="bg-red-900/10 border-red-900/20 text-red-500 hover:bg-red-900/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 sm:px-6 h-10 sm:h-12 rounded-none"
            >
              <ExternalLink size={14} className="mr-2" />
              Перейти на сайт
            </Button>
          )}
          
          <Button 
            onClick={() => setIsWebsiteModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-4 sm:px-6 h-10 sm:h-12 rounded-none"
          >
            <Globe size={14} className="mr-2 text-red-700" />
            {userWebsite ? 'Редагувати сайт' : 'Створити сайт'}
          </Button>
          
          {currentUser?.isVerified ? (
            <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-900/10 border border-red-900/20 rounded-none text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldCheck size={14} />
              ВЕРИФІКОВАНИЙ
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-zinc-900/50 border border-white/5 rounded-none text-zinc-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
              <ShieldAlert size={14} />
              ОЧІКУЄ ВЕРИФІКАЦІЇ
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl h-fit">
            <CardContent className="pt-8 sm:pt-12 flex flex-col items-center text-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-red-900/5 border border-white/5 flex items-center justify-center mb-6 sm:mb-8 relative overflow-hidden group">
                <img src={currentUser?.avatarUrl || FALLBACK_AVATAR} className="w-full h-full object-cover" alt="Avatar" />
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isUploadingAvatar ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                </label>
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider truncate max-w-full px-4">{currentUser?.artistName || currentUser?.login}</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-2 uppercase font-bold tracking-[0.3em]">{currentUser?.role}</p>
              
              <div className="w-full h-px bg-white/5 my-6 sm:my-8" />
              
              <div className="space-y-4 sm:space-y-6 w-full text-left px-4">
                <div>
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">ID Артиста</p>
                  <p className="text-[10px] sm:text-xs font-mono text-red-800">#ZH-{currentUser?.id?.slice(0, 8) || '000'}</p>
                </div>
                <div>
                  <p className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black tracking-widest mb-1">Дата реєстрації</p>
                  <p className="text-[10px] sm:text-xs font-bold text-zinc-400">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-4 sm:pb-6">
              <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Shield size={14} className="text-red-700" /> Безпека
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 sm:pt-8 space-y-6">
              <div className="space-y-3">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Новий Email</Label>
                <div className="relative">
                  <Input 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 pl-10 text-white text-sm"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Новий Пароль</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 pl-10 text-white text-sm"
                    placeholder="••••••••"
                  />
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={16} />
                </div>
              </div>
              <Button 
                onClick={handleUpdateAuth}
                disabled={isAuthLoading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest h-10 sm:h-12 rounded-none"
              >
                {isAuthLoading ? <Loader2 className="animate-spin" size={16} /> : 'Оновити дані входу'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2 bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-4 sm:pb-6">
            <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="space-y-3">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
                <Input 
                  {...register('artistName')} 
                  className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 focus:border-red-900/50 text-white text-sm"
                />
              </div>

              {profileFields.map((field) => (
                <div key={field.id} className="space-y-3">
                  <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {field.label} {field.required && <span className="text-red-800">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      {...register(field.name, { required: field.required })} 
                      className="bg-black/40 border-white/5 rounded-none min-h-[120px] sm:min-h-[150px] focus:border-red-900/50 text-white text-sm resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <Select 
                      value={watch(field.name) || ''} 
                      onValueChange={(val) => setValue(field.name, val)}
                    >
                      <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 text-white text-sm">
                        <SelectValue placeholder={`Оберіть ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                        {field.options?.split(',').map((opt: string) => (
                          <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs uppercase font-bold">{opt.trim()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={field.type}
                      {...register(field.name, { required: field.required })} 
                      className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 focus:border-red-900/50 text-white text-sm"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 sm:pt-6">
                <Button type="submit" className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-[10px] sm:text-xs font-black uppercase tracking-widest px-10 h-12 rounded-none shadow-[0_0_20px_rgba(185,28,28,0.2)]">
                  <Save size={16} className="mr-3" />
                  Зберегти зміни
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Artist Website Modal */}
      <Dialog open={isWebsiteModalOpen} onOpenChange={setIsWebsiteModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">
              {userWebsite ? 'Редагувати сайт артиста' : 'Створити сайт артиста'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Персональне посилання (URL)</Label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-10 sm:h-12">
                  <span className="text-zinc-600 text-xs font-mono">/a/</span>
                  <input 
                    value={websiteData.slug} 
                    onChange={(e) => setWebsiteData({...websiteData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                    placeholder="artist-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне Ім'я</Label>
                <Input 
                  value={websiteData.stageName} 
                  onChange={(e) => setWebsiteData({...websiteData, stageName: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none h-10 sm:h-12 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">БІО</Label>
              <Textarea 
                value={websiteData.bio} 
                onChange={(e) => setWebsiteData({...websiteData, bio: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none min-h-[100px] text-sm resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Фото артиста</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 bg-black/40 shrink-0">
                  <img src={websiteData.photoUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="w-full flex-1 space-y-3">
                  <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                  <label htmlFor="photo-upload" className={cn(
                    "flex items-center justify-center gap-2 w-full h-10 sm:h-12 border border-dashed border-white/20 hover:border-red-700/50 hover:bg-red-900/5 cursor-pointer transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                    isUploadingPhoto && "opacity-50 cursor-not-allowed"
                  )}>
                    {isUploadingPhoto ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    {isUploadingPhoto ? 'Завантаження...' : 'Завантажити файл'}
                  </label>
                  <Input 
                    value={websiteData.photoUrl} 
                    onChange={(e) => setWebsiteData({...websiteData, photoUrl: e.target.value})}
                    className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                    placeholder="Або вкажіть URL..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання та соцмережі</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setWebsiteData({...websiteData, links: [...websiteData.links, { id: Date.now().toString(), name: 'Instagram', url: '' }]})}
                  className="border-white/10 text-[8px] sm:text-[9px] font-black uppercase tracking-widest h-8"
                >
                  <Plus size={12} className="mr-1 sm:mr-2" /> Додати
                </Button>
              </div>
              
              <div className="space-y-3">
                {websiteData.links.map((link: any, index: number) => (
                  <div key={link.id} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end p-3 sm:p-4 bg-white/5 border border-white/5">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                      <Select value={link.name} onValueChange={(val) => {
                        const newLinks = [...websiteData.links];
                        newLinks[index].name = val;
                        setWebsiteData({...websiteData, links: newLinks});
                      }}>
                        <SelectTrigger className="bg-black/40 border-white/5 h-10 text-xs rounded-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                          {PLATFORMS_LIST.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-[2] space-y-2 flex gap-2 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[8px] sm:text-[9px] text-zinc-600 uppercase font-black">URL</Label>
                        <Input 
                          value={link.url} 
                          onChange={(e) => {
                            const newLinks = [...websiteData.links];
                            newLinks[index].url = e.target.value;
                            setWebsiteData({...websiteData, links: newLinks});
                          }}
                          className="bg-black/40 border-white/5 h-10 text-xs rounded-none"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-900 h-10 w-10 shrink-0"
                        onClick={() => setWebsiteData({...websiteData, links: websiteData.links.filter((_: any, i: number) => i !== index)})}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsWebsiteModalOpen(false)} className="w-full sm:w-auto rounded-none text-[10px] font-black uppercase tracking-widest">Скасувати</Button>
            <Button 
              onClick={handleSaveWebsite} 
              disabled={isSavingWebsite}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none"
            >
              {isSavingWebsite ? <Loader2 className="animate-spin" size={16} /> : 'Зберегти сайт'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;