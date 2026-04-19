import React, { useEffect } from 'react';
import { Trash2, Check, X, Music, User, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showSuccess, showError } from '@/utils/toast';

const FALLBACK_IMAGE = "https://jurbamusic.iceiy.com/releasepreview.png";

const DeletionRequests = () => {
  const { releases, fetchReleases, approveReleaseDeletion, rejectReleaseDeletion, users, fetchUsers } = useDataStore();

  useEffect(() => {
    fetchReleases();
    fetchUsers();
  }, [fetchReleases, fetchUsers]);

  const requests = releases.filter(r => r.deletion_status === 'pending');

  const handleApprove = async (id: string) => {
    if (confirm('Ви впевнені, що хочете схвалити видалення цього релізу? Статус зміниться на "Видаляється".')) {
      await approveReleaseDeletion(id);
      showSuccess('Запит схвалено. Статус: Видаляється');
    }
  };

  const handleReject = async (id: string) => {
    await rejectReleaseDeletion(id);
    showSuccess('Запит на видалення відхилено');
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.artistName || user?.login || 'Невідомий';
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Запити на видалення</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Керування запитами від артистів ({requests.length})</p>
        </div>
        <Button 
          onClick={() => fetchReleases()} 
          variant="outline" 
          className="border-white/10 text-[10px] font-black uppercase tracking-widest h-12 rounded-none"
        >
          <RefreshCw size={14} className="mr-2" /> Оновити
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5">
          <Check size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Запитів немає</h3>
          <p className="text-zinc-600 mt-2 text-xs font-bold uppercase tracking-widest">
            Всі релізи в безпеці
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {requests.map((release) => (
            <Card key={release.id} className="bg-black/40 border-white/5 rounded-none overflow-hidden flex flex-col group hover:border-red-700/30 transition-all duration-300">
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={release.coverUrl || FALLBACK_IMAGE} 
                  alt={release.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-900/80 text-white border-none text-[9px] font-black uppercase tracking-widest rounded-none">
                    <AlertTriangle size={10} className="mr-1" /> Очікує видалення
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wider truncate">{release.title}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{release.artist}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <User size={14} /> {getUserName(release.userId)}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                    {new Date(release.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>

              <div className="p-6 pt-0 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-white rounded-none text-[10px] font-black uppercase tracking-widest h-12"
                  onClick={() => handleReject(release.id)}
                >
                  <X size={16} className="mr-2" /> Відхилити
                </Button>
                <Button 
                  className="bg-red-700 hover:bg-red-800 text-white rounded-none text-[10px] font-black uppercase tracking-widest h-12"
                  onClick={() => handleApprove(release.id)}
                >
                  <Trash2 size={16} className="mr-2" /> Схвалити
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletionRequests;