import React, { useState } from 'react';
import { 
  TrendingUp, 
  Music, 
  Star, 
  ArrowUpRight, 
  PlayCircle,
  Info,
  Calendar,
  Tag,
  User as UserIcon,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const data = [
  { name: '01.05', streams: 400 },
  { name: '05.05', streams: 1200 },
  { name: '10.05', streams: 900 },
  { name: '15.05', streams: 1800 },
  { name: '20.05', streams: 2400 },
  { name: '25.05', streams: 2100 },
  { name: '30.05', streams: 3200 },
];

const pieData = [
  { name: 'Нічна варта', value: 45 },
  { name: 'Журба', value: 25 },
  { name: 'Світанок', value: 20 },
  { name: 'Інше', value: 10 },
];

const COLORS = ['#8b5cf6', '#6366f1', '#a855f7', '#d8b4fe'];

const Dashboard = () => {
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  const tracks = [
    { id: 1, title: 'Нічна варта', artist: 'Артист', genre: 'Hip-Hop', date: '12.05.2024', status: 'Опубліковано', streams: 5201, audioUrl: '#' },
    { id: 2, title: 'Світанок', artist: 'Артист', genre: 'Pop', date: '14.05.2024', status: 'На модерації', streams: 850, audioUrl: '#' },
    { id: 3, title: 'Журба', artist: 'Артист', genre: 'Sad Rap', date: '15.05.2024', status: 'На модерації', streams: 2100, audioUrl: '#' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <p className="text-gray-500">Огляд вашої музичної діяльності</p>
        </div>
        <Badge variant="outline" className="px-4 py-1 border-violet-500/30 text-violet-400">
          Травень 2024
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Цього місяця</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,482</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <ArrowUpRight size={12} className="mr-1" />
              +12.5% від минулого місяця
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Активних релізів</CardTitle>
            <Music className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Всі платформи доступні</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Топ реліз</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">Нічна варта</div>
            <p className="text-xs text-violet-400 mt-1">5,201 прослуховувань</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Динаміка прослуховувань</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Line type="monotone" dataKey="streams" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Розподіл за релізами</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 pr-8">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs text-gray-400">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Releases Table */}
      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Ваші релізи</CardTitle>
          <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 cursor-pointer">Всі релізи</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Обкладинка</th>
                <th className="px-6 py-4">Назва</th>
                <th className="px-6 py-4">Жанр</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tracks.map((track) => (
                <tr 
                  key={track.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTrack(track)}
                >
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center overflow-hidden">
                      <Music className="text-violet-500" size={20} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{track.title}</p>
                    <p className="text-xs text-gray-500">{track.artist}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{track.date}</td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      track.status === 'Опубліковано' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {track.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-violet-500/20 rounded-full text-violet-500 transition-colors">
                      <Info size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Track Details Modal */}
      <Dialog open={!!selectedTrack} onOpenChange={() => setSelectedTrack(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Music className="text-violet-500" />
              Деталі релізу
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Повна інформація про ваш трек та статус дистрибуції
            </DialogDescription>
          </DialogHeader>

          {selectedTrack && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="space-y-6">
                <div className="aspect-square rounded-xl bg-violet-500/10 flex items-center justify-center border border-white/5 overflow-hidden">
                  <Music size={80} className="text-violet-500/40" />
                </div>
                <div className="p-4 bg-[#0a0a0a] rounded-xl border border-white/5 space-y-3">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Аудіо-прев'ю</p>
                  <div className="flex items-center gap-4">
                    <Button size="icon" className="rounded-full bg-violet-600 hover:bg-violet-700">
                      <PlayCircle size={24} />
                    </Button>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-violet-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-400">0:45 / 3:20</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserIcon size={18} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Артист</p>
                      <p className="font-medium">{selectedTrack.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Жанр</p>
                      <p className="font-medium">{selectedTrack.genre}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Дата релізу</p>
                      <p className="font-medium">{selectedTrack.date}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Статус</span>
                    <Badge className={cn(
                      selectedTrack.status === 'Опубліковано' ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {selectedTrack.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Всього стрімів</span>
                    <span className="font-bold text-violet-400">{selectedTrack.streams.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">External ID</span>
                    <span className="text-xs font-mono text-gray-500">ZH-MOD-{selectedTrack.id}</span>
                  </div>
                </div>

                <Button className="w-full bg-white/5 hover:bg-white/10 border border-white/10">
                  <ExternalLink size={16} className="mr-2" />
                  Переглянути на платформах
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;