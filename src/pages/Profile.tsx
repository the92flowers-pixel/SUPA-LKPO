"use client";

import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, ShieldAlert, Save as SaveIcon, Loader2, Globe, Plus, Trash2, Edit2, ExternalLink, Music, Link as LinkIcon, Check, AlertTriangle } from 'lucide-react';
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
  { name: "Spotify", icon: "spotify" },
  { name: "Apple Music", icon: "apple" },
  { name: "YouTube", icon: "youtube" },
  { name: "Instagram", icon: "instagram" },
  { name: "Telegram", icon: "telegram" },
  { name: "TikTok", icon: "tiktok" },
  { name: "SoundCloud", icon: "soundcloud" },
  { name: "Bandcamp", icon: "bandcamp" },
  { name: "Deezer", icon: "deezer" },
  { name: "Twitter", icon: "twitter" },
];

interface AppUser {
  id: string;
  email?: string;
  login: string;
  role: 'admin' | 'artist';
  artistName: string | null;
  balance: number;
  isVerified: boolean;
  bio?: string;
  avatarUrl?: string;
  avatarLocal?: string;
}

interface ArtistWebsiteFormData {
  id?: string;
  title: string;
  slug: string;
  bio: string;
  photoUrl: string;
  siteAvatarLocal: string;
  links: { id: string; name: string; url: string }[];
}

const Profile: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const { users, fetchUsers, artistWebsites, addArtistWebsite, updateArtistWebsite, deleteArtistWebsite } = useDataStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<Partial<AppUser> | null>(null);
  
  // Artist Website State
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<ArtistWebsiteFormData | null>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
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
            setAuth(appProfile);
          } else {
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
      
      if (error) throw error;

      if (data) {
        const appProfile = toAppProfile(data);
        setAuth(appProfile);
        await fetchUsers();
        setProfileData(prev => prev ? { ...prev, ...appProfile } : null);
        showSuccess('Профіль оновлено!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Помилка при збереженні профілю');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setProfileData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const handleAvatarUpload = (url: string) => {
    updateField('avatarLocal', url);
    updateField('avatarUrl', url);
  };

  const handleAvatarDelete = () => {
    updateField('avatarLocal', '');
    updateField('avatarUrl', '');
  };

  // Artist Website Functions
  const userWebsite = artistWebsites.find(w => w.userId === user?.id);
  const hasWebsite = !!userWebsite;
  
  const handleOpenWebsiteDialog = (website?: typeof userWebsite) => {
    if (website) {
      setEditingWebsite({
        id: website.id,
        title: website.stageName || website.title || '',
        slug: website.slug || '',
        bio: website.bio || '',
        photoUrl: website.photoUrl || '',
        siteAvatarLocal: website.siteAvatarLocal || '',
        links: website.links?.length > 0 ? website.links : [
          { id: Date.now().toString(), name: 'Spotify', url: '' },
          { id: (Date.now() + 1).toString(), name: 'Instagram', url: '' },
        ],
      });
    } else {
      setEditingWebsite({
        title: profileData?.artistName || '',
        slug: (profileData?.artistName || '').toLowerCase().replace(/\s+/g, '-'),
        bio: '',
        photoUrl: '',
        siteAvatarLocal: '',
        links: [
          { id: Date.now().toString(), name: 'Spotify', url: '' },
          { id: (Date.now() + 1).toString(), name: 'Instagram', url: '' },
          { id: (Date.now() + 2).toString(), name: 'YouTube', url: '' },
        ],
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

    if (!editingWebsite.title) {
      showError('Вкажіть назву артиста');
      return;
    }

    try {
      const websiteData = {
        stageName: editingWebsite.title,
        slug: editingWebsite.slug.toLowerCase().replace(/\s+/g, '-'),
        bio: editingWebsite.bio,
        photoUrl: editingWebsite.siteAvatarLocal || editingWebsite.photoUrl,
        links: editingWebsite.links.filter(l => l.url.trim() !== ''),
      };

      if (editingWebsite.id) {
        await updateArtistWebsite(editingWebsite.id, websiteData);
        showSuccess('Сайт оновлено!');
      } else {
        await addArtistWebsite(websiteData);
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
    if (!editingWebsite) return;
    setEditingWebsite({
      ...editingWebsite,
      links: [...editingWebsite.links, { id: Date.now().toString(), name: 'Spotify', url: '' }],
    });
  };

  const removeWebsiteLink = (id: string) => {
    if (!editingWebsite) return;
    setEditingWebsite({
      ...editingWebsite,
      links: editingWebsite.links.filter(l => l.id !== id),
    });
  };

  const updateWebsiteLink = (index: number, field: 'name' | 'url', value: string) => {
    if (!editingWebsite) return;
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
        {/* Left Column - Avatar & Quick Stats */}
        <div className="lg:col-span-1">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardContent className="pt-12 flex flex-col items-center">
              <div className="w-full max-w-[200px]">
                <ImageUploader 
                  bucket="avatars"
                  userId={profileData?.id || ''}
                  entityType="profile"
                  currentUrl={profileData?.avatarLocal || profileData?.avatarUrl}
                  onUpload={handleAvatarUpload}
                  onDelete={handleAvatarDelete}
                  label="Аватар профілю"
                  className="w-full"
                  aspectRatio="square"
                />
              </div>
              
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

        {/* Right Column - Form Fields */}
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

          {/* Artist Website Section */}
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-red-700" />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Персональний сайт артиста</h3>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Один сайт на артиста</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleOpenWebsiteDialog(userWebsite)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-none",
                    hasWebsite 
                      ? "bg-white/5 hover:bg-white/10 border border-white/10" 
                      : "bg-red-700 hover:bg-red-800"
                  )}
                >
                  {hasWebsite ? (
                    <>
                      <Edit2 size={14} className="mr-2" /> Редагувати сайт
                    </>
                  ) : (
                    <>
                      <Plus size={14} className="mr-2" /> Створити сайт
                    </>
                  )}
                </Button>
              </div>

              {hasWebsite ? (
                <div className="p-4 bg-white/5 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={userWebsite.siteAvatarLocal || userWebsite.photoUrl || FALLBACK_AVATAR} 
                      className="w-12 h-12 object-cover border border-white/10" 
                      alt=""
                      onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_AVATAR; }}
                    />
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">{userWebsite.stageName || userWebsite.title}</p>
                      <a 
                        href={`/a/${userWebsite.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-red-700 font-mono hover:text-red-500"
                      >
                        /a/{userWebsite.slug} <ExternalLink size={10} className="inline ml-1" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="font-black uppercase">{userWebsite.links?.length || 0} посилань</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteWebsite(userWebsite.id)}
                      className="text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-none ml-4"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
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
              {editingWebsite?.id ? 'Редагувати сайт артиста' : 'Створити сайт артиста'}
            </DialogTitle>
          </DialogHeader>
          {editingWebsite && (
            <div className="space-y-6 py-4">
              {/* Avatar Upload */}
              <ImageUploader 
                bucket="artist-sites"
                userId={user?.id || ''}
                entityType="profile"
                currentUrl={editingWebsite.siteAvatarLocal || editingWebsite.photoUrl}
                onUpload={(url) => setEditingWebsite({ ...editingWebsite, siteAvatarLocal: url, photoUrl: url })}
                onDelete={() => setEditingWebsite({ ...editingWebsite, siteAvatarLocal: '', photoUrl: '' })}
                label="Фото профілю (квадратне, мін. 1400x1400px)"
                className="max-w-xs mx-auto"
                aspectRatio="square"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я *</Label>
                  <Input 
                    value={editingWebsite.title} 
                    onChange={(e) => setEditingWebsite({ ...editingWebsite, title: e.target.value })}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL сайту (Slug)</Label>
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
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Біографія</Label>
                <Textarea 
                  value={editingWebsite.bio} 
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, bio: e.target.value })}
                  className="bg-black/40 border-white/5 rounded-none min-h-[80px] resize-none"
                  placeholder="Розкажіть про вашу музику..."
                />
              </div>

              {/* Links Section */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <LinkIcon size={14} /> Посилання на платформи
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
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {editingWebsite.links.map((link, index) => (
                    <div key={link.id} className="flex gap-3 items-end p-4 bg-white/5 border border-white/5">
                      <div className="flex-1 space-y-2">
                        <Label className="text-[9px] text-zinc-600 uppercase font-black">Платформа</Label>
                        <select
                          value={link.name}
                          onChange={(e) => updateWebsiteLink(index, 'name', e.target.value)}
                          className="w-full bg-black/40 border border-white/5 h-10 px-3 text-xs text-white rounded-none"
                        >
                          {PLATFORMS_LIST.map(p => (
                            <option key={p.name} value={p.name} className="bg-[#0a0a0a]">{p.name}</option>
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
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-2">
                    <Check size={14} />
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