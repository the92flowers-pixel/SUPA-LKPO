import React, { useState, useEffect } from 'react';
import { Check, X, Music, Info, User, Clock, RefreshCw, CheckCircle, ExternalLink, Save, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const Moderation = () => {
  const { releases, updateRelease, statuses, fetchReleases, users, fetchUsers, fields } = useDataStore();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReleases();
    fetchUsers();
  }, [fetchReleases, fetchUsers]);

  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';
  const publishedStatus = statuses.find(s => s.color === 'green')?.name || 'Опубліковано';
  const rejectedStatus = statuses.find(s => s.color === 'red')?.name || 'Відхилено';

  const pendingReleases = releases.filter(r => r.status === defaultStatus);
  const releaseFields = fields.filter(f => f.section === 'release');

  const handleAction = async (action: 'approve' | 'reject' | 'save') => {
    if (!selectedTrack) return;
    
    setIsLoading(true);
    try {
      const newStatus = action === 'approve' ? publishedStatus : action === 'reject' ? rejectedStatus : selectedTrack.status;
      
      const updatedData = {
        ...selectedTrack,
        status: newStatus
      };

      await updateRelease(selectedTrack.id, updatedData);
      
      if (action !== 'save') {
        showSuccess(`Реліз ${action === 'approve' ? 'схвалено' : 'відхилено'} та збережено`);
        setSelectedTrack(null);
      } else {
        showSuccess('Зміни збережено');
      }
    } catch (error) {
      showError('Помилка при синхронізації з БД');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.artistName || user?.login || 'Невідомий';
  };

  const updateField = (name: string, value: any) => {
    setSelectedTrack((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Модерація</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Перевірка та редагування ({pendingReleases.length})</p>
        </div>
        <Button 
          onClick={() => fetchReleases()} 
          variant="outline" 
          className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
        >
          <RefreshCw size={14} className="mr-2" /> Оновити
        </Button>
      </div>

      {pendingReleases.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Черга пуста</h3>
          <p className="text-zinc-600 mt-2 text-xs font-bold uppercase tracking-widest">
            Наразі немає релізів, що потребують перевірки
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pendingReleases.map((track) => (
            <Card key={track.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden flex flex-col group hover:border-amber-500/30 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={track.coverUrl || FALLBACK_IMAGE} 
                  alt={track.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-500/20 text-amber-500 border-none text-[9px] font-black uppercase tracking-widest rounded-none">
                    <Clock size={10} className="mr-1" /> На модерації
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{track.title}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{track.artist}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <User size={14} /> {getUserName(track.userId)}
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest">{track.genre || 'Другое'}</div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white rounded-none text-[10px] font-black uppercase tracking-widest"
                  onClick={() => setSelectedTrack({ ...track })}
                >
                  <Info size={14} className="mr-2" /> Деталі та Редагування
                </Button>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-none"
                    onClick={() => { setSelectedTrack({ ...track }); handleAction('approve'); }}
                  >
                    <Check size={16} />
                  </Button>
                  <Button 
                    className="flex-1 bg-red-900 hover:bg-red-800 text-white rounded-none"
                    onClick={() => { setSelectedTrack({ ...track }); handleAction('reject'); }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Moderation & Edit Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter">Перевірка та редагування релізу</DialogTitle>
                <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                  ID: {selectedTrack?.id?.slice(0, 8)} | Власник: {selectedTrack ? getUserName(selectedTrack.userId) : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
              <div className="space-y-6">
                <div className="aspect-square rounded-none overflow-hidden border border-white/5 shadow-2xl relative group">
                  <img 
                    src={selectedTrack.coverUrl || FALLBACK_IMAGE} 
                    alt={selectedTrack.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL Обкладинки</Label>
                    <Input 
                      value={selectedTrack.coverUrl} 
                      onChange={(e) => updateField('coverUrl', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на файли</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={selectedTrack.releaseUrl || ''} 
                        onChange={(e) => updateField('releaseUrl', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                        placeholder="Drive/Dropbox link"
                      />
                      {selectedTrack.releaseUrl && (
                        <Button size="icon" variant="outline" className="shrink-0 border-white/5" onClick={() => window.open(selectedTrack.releaseUrl, '_blank')}>
                          <ExternalLink size={14} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-red-900/5 border border-red-900/10 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-700 flex items-center gap-2">
                      Юридична інформація
                    </p>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Авторські права (Докази)</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={selectedTrack.copyrights || ''} 
                          onChange={(e) => updateField('copyrights', e.target.value)}
                          className="bg-black/40 border-white/5 rounded-none h-9 text-[10px]"
                          placeholder="Посилання на докази..."
                        />
                        {selectedTrack.copyrights && (
                          <Button size="icon" variant="ghost" className="h-9 w-9 text-red-700" onClick={() => window.open(selectedTrack.copyrights, '_blank')}>
                            <ExternalLink size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTrack.copyrightConfirmed ? (
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase tracking-widest rounded-none">
                          <ShieldCheck size={10} className="mr-1" /> Права підтверджено артистом
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] font-black uppercase tracking-widest rounded-none">
                          <ShieldAlert size={10} className="mr-1" /> Права не підтверджено
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва релізу</Label>
                    <Input 
                      value={selectedTrack.title} 
                      onChange={(e) => updateField('title', e.target.value)}
                      className="bg-black/40 border-white/5 rounded-none h-12 text-white font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Артист</Label>
                      <Input 
                        value={selectedTrack.artist} 
                        onChange={(e) => updateField('artist', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Жанр</Label>
                      <Input 
                        value={selectedTrack.genre} 
                        onChange={(e) => updateField('genre', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Додаткові поля</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виконавець (ПІБ)</Label>
                      <Input 
                        value={selectedTrack.performer || ''} 
                        onChange={(e) => updateField('performer', e.target.value)}
                        className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                      />
                    </div>
                    {releaseFields.map(field => (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea 
                            value={selectedTrack[field.name] || ''} 
                            onChange={(e) => updateField(field.name, e.target.value)}
                            className="bg-black/40 border-white/5 rounded-none min-h-[80px] text-xs"
                          />
                        ) : field.type === 'select' ? (
                          <Select value={selectedTrack[field.name] || ''} onValueChange={(v) => updateField(field.name, v)}>
                            <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-10 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                              {field.options?.split(',').map((opt: string) => (
                                <SelectItem key={opt.trim()} value={opt.trim()} className="text-xs uppercase font-bold">{opt.trim()}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            value={selectedTrack[field.name] || ''} 
                            onChange={(e) => updateField(field.name, e.target.value)}
                            className="bg-black/40 border-white/5 rounded-none h-10 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                    Опис / Нотатки модератора
                  </Label>
                  <Textarea 
                    value={selectedTrack.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    className="bg-black/40 border-white/5 rounded-none min-h-[100px] text-xs focus:ring-0 focus:border-red-700"
                    placeholder="Додайте коментар або опис..."
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-3 border-t border-white/5 pt-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedTrack(null)} 
              className="border-white/10 text-white rounded-none text-[10px] font-black uppercase tracking-widest h-12"
            >
              Скасувати
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleAction('save')}
              disabled={isLoading}
              className="bg-white/5 hover:bg-white/10 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-6 h-12"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Зберегти зміни</>}
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => handleAction('reject')}
                disabled={isLoading}
                className="bg-red-900 hover:bg-red-800 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 h-12"
              >
                <X size={16} className="mr-2" /> Відхилити
              </Button>
              <Button 
                onClick={() => handleAction('approve')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white rounded-none text-[10px] font-black uppercase tracking-widest px-8 h-12"
              >
                <Check size={16} className="mr-2" /> Схвалити
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Moderation;