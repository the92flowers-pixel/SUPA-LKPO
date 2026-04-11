import React from 'react';
import { Check, X, Play, MoreVertical, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { showSuccess } from '@/utils/toast';

const Moderation = () => {
  const tracks = [
    { id: 1, title: 'Нічна варта', artist: 'Артист А', genre: 'Hip-Hop', date: '12.05.2024', status: 'На модерації' },
    { id: 2, title: 'Світанок', artist: 'Артист Б', genre: 'Pop', date: '14.05.2024', status: 'На модерації' },
    { id: 3, title: 'Журба', artist: 'Артист В', genre: 'Sad Rap', date: '15.05.2024', status: 'На модерації' },
  ];

  const handleAction = (id: number, action: string) => {
    showSuccess(`Трек #${id} ${action === 'approve' ? 'схвалено' : 'відхилено'}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Черга модерації</h1>
        <p className="text-gray-500">Перевірка нових релізів від артистів</p>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Реліз</th>
                <th className="px-6 py-4">Артист</th>
                <th className="px-6 py-4">Жанр</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-violet-500/20 flex items-center justify-center">
                        <Play size={16} className="text-violet-500" />
                      </div>
                      <span className="font-medium">{track.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{track.artist}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 h-8 px-3"
                        onClick={() => handleAction(track.id, 'approve')}
                      >
                        <Check size={16} className="mr-1" /> Схвалити
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-8 px-3"
                        onClick={() => handleAction(track.id, 'reject')}
                      >
                        <X size={16} className="mr-1" /> Відхилити
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10 text-white">
                          <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                            <ExternalLink size={14} className="mr-2" /> Деталі
                          </DropdownMenuItem>
                          <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                            Змінити статус
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Moderation;