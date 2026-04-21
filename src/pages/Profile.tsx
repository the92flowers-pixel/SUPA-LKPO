import React, { useState } from 'react';
import { User, ShieldCheck, ShieldAlert, Mail, Key, Loader2 } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import ImageUploader from '@/components/ui/ImageUploader';

const FALLBACK_AVATAR = "https://jurbamusic.iceiy.com/profileavatar.png";

const Profile = () => {
  const { user, setAuth } = useAuthStore();
  const { updateUser, users } = useDataStore();
  
  const currentUser = users.find(u => u.id === user?.id) || user;
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateUser(currentUser.id, currentUser);
      showSuccess('Профіль оновлено');
    } catch (error) {
      showError('Помилка при збереженні');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    const updated = { ...currentUser, [field]: value };
    setAuth(updated as any);
  };

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
                path={`profiles/${currentUser?.id}`}
                currentLocalUrl={currentUser?.avatarLocal}
                currentExternalUrl={currentUser?.avatarUrl}
                onUpload={(url) => updateField('avatarLocal', url)}
                onExternalUrlChange={(url) => updateField('avatarUrl', url)}
                onRemove={() => updateField('avatarLocal', null)}
                label="Аватар профілю"
                className="w-full"
              />
              
              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Статус</span>
                  {currentUser?.isVerified ? (
                    <span className="text-[10px] font-black uppercase text-green-500 flex items-center gap-2">
                      <ShieldCheck size={14} /> Верифіковано
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase text-red-700 flex items-center gap-2">
                      <ShieldAlert size={14} /> Не верифіковано
                    </span>
                  )}
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
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сценічне ім'я</Label>
                  <Input 
                    value={currentUser?.artistName || ''} 
                    onChange={(e) => updateField('artistName', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</Label>
                  <Input 
                    value={currentUser?.email || ''} 
                    disabled
                    className="bg-black/40 border-white/5 rounded-none h-12 opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Біографія</Label>
                <Textarea 
                  value={currentUser?.bio || ''} 
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
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                Зберегти зміни
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;