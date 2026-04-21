"use client";

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ShieldAlert, SaveIcon, Loader2, Globe, Plus, Trash2, Edit2, ExternalLink, Music, Link as LinkIcon, Check } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess, showError } from '@/utils/toast';
import { supabase, toAppProfile } from '@/lib/supabase';
import ImageUploader from '@/components/ui/ImageUploader';
import { cn } from '@/lib/utils';

const FALLBACK_AVATAR = "https://jurbamusic.iceiy.com/profileavatar.png";

const PLATFORMS_LIST = [
  "Instagram", "Telegram", "YouTube", "TikTok", "Spotify", "Apple Music", "SoundCloud", "Website", "Twitter", "Facebook"
];

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { users, updateUser, fetchUsers, artistWebsites, addArtistWebsite, updateArtistWebsite, deleteArtistWebsite } = useDataStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Artist Website State
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<any>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // First try to get from local store
        const localUser = users.find(u => u.id === user.id);
        if (localUser) {
          setProfileData({
            ...localUser,
            artistName: localUser.artistName || '',
            bio: localUser.bio || '',
            avatarUrl: localUser.avatarUrl || '',
            avatarLocal: localUser.avatarLocal || '',
          });
        } else {
          // Fetch from database
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            const appProfile = toAppProfile(data);
            setProfileData({
              ...appProfile,
              artistName: appProfile.artistName || '',
              bio: appProfile.bio || '',
              avatarUrl: appProfile.avatarUrl || '',
              avatarLocal: appProfile.avatarLocal || '',
            });
            // Update auth store with full profile
            setAuth(appProfile);
          } else if (error) {
            console.error('Error fetching profile:', error);
            // Use current user data as fallback
            setProfileData({
              id: user.id,
              email: user.email || user.login,
              login: user.login,
              role: user.role,
              artistName: user.artistName || '',
              balance: user.balance || 0,
              isVerified: user.isVerified || false,
              bio: user.bio || '',
              avatarUrl: user.avatarUrl || '',
              avatarLocal: user.avatarLocal || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Use current user data as fallback
        setProfileData({
          id: user.id,
          email: user.email || user.login,
          login: user.login,
          role: user.role,
          artistName: user.artistName || '',
          balance: user.balance || 0,
          isVerified: user.isVerified || false,
          bio: user.bio || '',
          avatarUrl: user.avatarUrl || '',
          avatarLocal: user.avatarLocal || '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, users]);

  const handleSave = async () => {
    if (!profileData || !user?.id) return;
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.artistName || null,
          artist_name: profileData.artistName || null,
          bio: profileData.bio || null,
          avatar_local: profileData.avatarLocal || null,
          avatar_url: profileData.avatarUrl || null,
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      if (data) {
        const appProfile = toAppProfile(data);
        setAuth(appProfile);
        await fetchUsers();
        // Update local profile data
        setProfileData(prev => prev ? {
          ...prev,
          ...appProfile,
        } : null);
        showSuccess('Профіль оновлено!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Помилка при збереженні профілю');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setProfileData((prev: any) => prev ? { ...prev, [field]: value } : null);
  };

  // Artist Website Functions
  const userWebsites = artistWebsites.filter(w => w.userId === user?.id);
  
  const handleOpenWebsiteDialog = (website: any = null) => {
    if (website) {
      setEditingWebsite({ ...website });
    } else {
      setEditingWebsite({
        title: profileData?.artistName || '',
        slug: (profileData?.artistName || '').toLowerCase().replace(/\s+/g, '-'),
        bio: '',
        photoUrl: profileData?.avatarLocal || profileData?.avatarUrl || '',
        links: [
          { id: Date.now().toString(), name: 'Instagram', url: '' },
          { id: (Date.now() + 1).toString(), name: 'Telegram', url: '' },
        ]
      });
    }
    setIsWebsiteDialogOpen(true);
  };

  const handleSaveWebsite = async () => {
    if (!editingWebsite) return;
    
    if (!editingWebsite.slug) {
      showError('Вкажіть адресу сайту');
      return;
    }

    try {
      if (editingWebsite.id) {
        // Update existing
        await updateArtistWebsite(editingWebsite.id, editingWebsite);
        showSuccess('Сайт оновлено!');
      } else {
        // Create new
        await addArtistWebsite(editingWebsite);
        showSuccess('Сайт створено!');
      }
      setIsWebsiteDialogOpen(false);
      setEditingWebsite(null);
    } catch (error) {
      console.error('Error saving website:', error);
      showError('Помилка при збереженні');
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей сайт?')) return;
    try {
      await deleteArtistWebsite(id);
      showSuccess('Сайт видалено');
    } catch (error) {
      showError('Помилка при видаленні');
    }
  };

  const addWebsiteLink = () => {
    setEditingWebsite({
      ...editingWebsite,
      links: [...(editingWebsite.links || []), { id: Date.now().toString(), name: 'Instagram', url: '' }]
    });
  };

  const removeWebsiteLink = (id: string) => {
    setEditingWebsite({
      ...editingWebsite,
      links: editingWebsite.links.filter((l: any) => l.id !== id)
    });
  };

  const updateWebsiteLink = (index: number, field: string, value: string) => {
    const newLinks = [...editingWebsite.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setEditingWebsite({ ...editingWebsite, links: newLinks });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Профіль</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваші персональні дані та налаштування</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-700" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Профіль</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваші персональні дані та налаштування</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardContent className="pt-12 flex flex-col items-center">
              <ImageUploader 
                bucket="avatars"
                path={`profiles/${profileData?.id}`}
                currentLocalUrl={profileData?.avatarLocal}
                currentExternalUrl={profileData?.avatarUrl}
                onUpload={(url) => updateField('avatarLocal', url)}
                onExternalUrlChange={(url) => updateField('avatarUrl', url)}
                onRemove={() => updateField('avatarLocal', null)}
                label="Аватар профілю"
                className="w-full"
                acceptedTypes="image/jpeg,image/jpg,image/png,image/webp,gif"
                maxSizeMB={5}
                minDimensions={{ width: 200, height: 200 }}
              />
              
              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Статус</span>
                  {profileData?.isVerified ? (
                    <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-2">
                      <ShieldCheck size={14} /> Верифіковано
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-red-700 flex items-center gap-2">
                      <ShieldAlert size={14} /> Не верифіковано
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Роль</span>
                  <span className="text-[10px] font-black uppercase text-zinc-400">
                    {profileData?.role === 'admin' ? 'Адмін' : 'Артист'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Баланс</span>
                  <span className="text-[10px] font-black uppercase text-red-700">
                    {profileData?.balance?.toLocaleString() || 0} ₴
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardContent className="pt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
                  <Input 
                    value={profileData?.email || profileData?.login || ''} 
                    disabled
                    className="bg-black/40 border-white/5 rounded-none h-12 opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
                  <Input 
                    value={profileData?.artistName || ''} 
                    onChange={(e) => updateField('artistName', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                    placeholder="Ваше сценічне ім'я"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Біографія</Label>
                <Textarea 
                  value={profileData?.bio || ''} 
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="bg-black/40 border-white/5 rounded-none min-h-[120px] resize-none"
                  placeholder="Розкажіть про себе..."
                />
              </div>

              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest h-14 rounded-none"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <SaveIcon className="mr-2" size={18} />}
                Зберегти зміни
              </Button>
            </CardContent>
          </Card>

          {/* Artist Websites Section */}
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-red-700" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Персональний сайт артиста</h3>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Створіть свою сторінку-посилання</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleOpenWebsiteDialog()}
                  className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-none"
                >
                  <Plus size={14} className="mr-2" /> Створити сайт
                </Button>
              </div>

              {userWebsites.length > 0 ? (
                <div className="space-y-4">
                  {userWebsites.map((website) => (
                    <div key={website.id} className="p-4 bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={website.siteAvatarLocal || website.photoUrl || FALLBACK_AVATAR} 
                          className="w-12 h-12 object-cover border border-white/10" 
                          alt=""
                        />
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">{website.stageName || website.title}</p>
                          <a 
                            href={`/a/${website.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-red-700 font-mono hover:text-red-500"
                          >
                            /a/{website.slug} <ExternalLink size={10} className="inline ml-1" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenWebsiteDialog(website)}
                          className="text-zinc-500 hover:text-white rounded-none"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteWebsite(website.id)}
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-none"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-white/5">
                  <Globe size={32} className="mx-auto text-zinc-800 mb-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">У вас ще немає персонального сайту</p>
                  <p className="text-[9px] text-zinc-700 mt-1">Створіть свою сторінку-посилання для соцмереж</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Website Dialog */}
      <Dialog open={isWebsiteDialogOpen} onOpenChange={setIsWebsiteDialogOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">
              {editingWebsite?.id ? 'Редагувати сайт' : 'Створити сайт артиста'}
            </DialogTitle>
          </DialogHeader>
          {editingWebsite && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Персональне посилання (URL)</Label>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 h-12">
                  <span className="text-zinc-600 text-xs font-mono">/a/</span>
                  <input 
                    value={editingWebsite.slug} 
                    onChange={(e) => setEditingWebsite({
                      ...editingWebsite, 
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    })}
                    className="bg-transparent border-none focus:ring-0 text-white text-xs font-mono flex-1"
                    placeholder="your-stage-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
                  <Input 
                    value={editingWebsite.title} 
                    onChange={(e) => setEditingWebsite({...editingWebsite, title: e.target.value})}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Фото (URL)</Label>
                  <Input 
                    value={editingWebsite.photoUrl} 
                    onChange={(e) => setEditingWebsite({...editingWebsite, photoUrl: e.target.value})}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">БІО</Label>
                <Textarea 
                  value={editingWebsite.bio} 
                  onChange={(e) => setEditingWebsite({...editingWebsite, bio: e.target.value})}
                  className="bg-black/40 border-white/5 rounded-none min-h-[80px] resize-none"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <LinkIcon size={14} /> Посилання на соцмережі
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addWebsiteLink}
                    className="border-white/10 text-[9px] font-black uppercase tracking-widest h-8 rounded-none"
                  >
                    <Plus size={14} className="mr-2" /> Додати
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {editingWebsite.links?.map((link: any, index: number) => (
                    <div key={link.id} className="flex gap-3 items-end p-4 bg-white/5 border border-white/5">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                        <select
                          value={link.name}
                          onChange={(e) => updateWebsiteLink(index, 'name', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs text-white rounded-none"
                        >
                          {PLATFORMS_LIST.map(p => (
                            <option key={p} value={p} className="bg-[#0a0a0a]">{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-[2] space-y-2 flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[9px] text-zinc-600 uppercase font-black">URL</Label>
                          <Input 
                            value={link.url} 
                            onChange={(e) => updateWebsiteLink(index, 'url', e.target.value)}
                            className="bg-black/40 border-white/5 h-10 text-xs rounded-none"
                            placeholder="https://..."
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 h-10 w-10 rounded-none"
                          onClick={() => removeWebsiteLink(link.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingWebsite.slug && (
                <div className="p-4 bg-green-900/10 border border-green-900/20">
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">
                    <Check size={14} className="inline mr-2" />
                    Ваш сайт буде доступний за адресою: /a/{editingWebsite.slug}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsWebsiteDialogOpen(false)} className="rounded-none">Скасувати</Button>
            <Button onClick={handleSaveWebsite} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;