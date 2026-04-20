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

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { updateUser, users, artistWebsites, addArtistWebsite, updateArtistWebsite } = useDataStore();
  
  const currentUser = users.find(u => u.id === user?.id) || user;
  const userWebsite = artistWebsites.find(w => w.userId === currentUser?.id);

  const [isWebsiteModalOpen, setIsWebsiteModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingWebsite, setIsSavingWebsite] = useState(false);
  
  const [websiteData, setWebsiteData] = useState<any>({
    slug: '',
    stageName: '',
    bio: '',
    photoUrl: FALLBACK_AVATAR,
    links: [{ id: '1', name: 'Instagram', url: '' }]
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Файл занадто великий. Максимальний розмір: 5 МБ');
      return;
    }

    setIsUploadingAvatar(true);
    const loadingId = showLoading('Завантаження аватарки в Supabase...');
    try {
      const path = `avatars/${currentUser?.id}/${Date.now()}-${file.name}`;
      const publicUrl = await uploadFile('avatars', path, file);
      
      // Оновлюємо базу даних та локальний стан прямим посиланням
      await updateUser(currentUser?.id || '', { avatarUrl: publicUrl });
      setAuth({ ...currentUser, avatarUrl: publicUrl } as any);
      
      showSuccess('Аватарку оновлено (Supabase Storage)');
    } catch (err) {
      showError('Помилка завантаження');
    } finally {
      setIsUploadingAvatar(false);
      dismissToast(loadingId);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Файл занадто великий. Максимальний розмір: 5 МБ');
      return;
    }

    setIsUploadingPhoto(true);
    const loadingId = showLoading('Завантаження фото артиста...');
    try {
      const fileName = `artists/${currentUser?.id}/${Date.now()}-${file.name}`;
      const publicUrl = await uploadFile('avatars', fileName, file);
      
      // Негайно оновлюємо стан для передпрогляду в модальному вікні
      setWebsiteData((prev: any) => ({ ...prev, photoUrl: publicUrl }));
      showSuccess('Фото завантажено в Supabase');
    } catch (error) {
      showError('Помилка завантаження');
    } finally {
      setIsUploadingPhoto(false);
      dismissToast(loadingId);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
      {/* ... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl h-fit">
            <CardContent className="pt-8 sm:pt-12 flex flex-col items-center text-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-red-900/5 border border-white/5 flex items-center justify-center mb-6 sm:mb-8 relative overflow-hidden group">
                {/* Передпрогляд аватарки: завжди береться з currentUser.avatarUrl, який оновлюється після завантаження */}
                <img 
                  src={currentUser?.avatarUrl || FALLBACK_AVATAR} 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                  onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                />
                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {isUploadingAvatar ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                </label>
                <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </div>
              {/* ... */}
            </CardContent>
          </Card>
          {/* ... */}
        </div>
        {/* ... */}
      </div>

      {/* Artist Website Modal */}
      <Dialog open={isWebsiteModalOpen} onOpenChange={setIsWebsiteModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-none p-4 sm:p-6">
          {/* ... */}
          <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
            {/* ... */}
            <div className="space-y-3">
              <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Фото артиста</Label>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 bg-black/40 shrink-0">
                  {/* Передпрогляд фото сайту: оновлюється через websiteData.photoUrl */}
                  <img 
                    src={websiteData.photoUrl || FALLBACK_AVATAR} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                  />
                </div>
                <div className="w-full flex-1 space-y-3">
                  <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                  <label htmlFor="photo-upload" className={cn(
                    "flex items-center justify-center gap-2 w-full h-10 sm:h-12 border border-dashed border-white/20 hover:border-red-700/50 hover:bg-red-900/5 cursor-pointer transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
                    isUploadingPhoto && "opacity-50 cursor-not-allowed"
                  )}>
                    {isUploadingPhoto ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
                    {isUploadingPhoto ? 'Завантаження в Supabase...' : 'Завантажити файл (макс. 5 МБ)'}
                  </label>
                  <Input 
                    value={websiteData.photoUrl} 
                    onChange={(e) => setWebsiteData({...websiteData, photoUrl: e.target.value})}
                    className="bg-black/40 border-white/5 rounded-none h-10 text-xs font-mono"
                    placeholder="URL з Supabase..."
                  />
                </div>
              </div>
            </div>
            {/* ... */}
          </div>
          {/* ... */}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;