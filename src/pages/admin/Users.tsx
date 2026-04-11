import React from 'react';
import { Users as UsersIcon, UserCog, Trash2, Mail, Shield, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { showSuccess } from '@/utils/toast';

const Users = () => {
  const users = [
    { id: 1, login: 'admin@zhurba.music', role: 'admin', artistName: 'Адміністратор', createdAt: '01.01.2024', tracksCount: 0 },
    { id: 2, login: 'artist1@example.com', role: 'artist', artistName: 'Sad Boy', createdAt: '12.05.2024', tracksCount: 5 },
    { id: 3, login: 'artist2@example.com', role: 'artist', artistName: 'Lofi Girl', createdAt: '14.05.2024', tracksCount: 12 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Користувачі</h1>
          <p className="text-gray-500">Керування всіма акаунтами платформи</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Input placeholder="Пошук користувача..." className="bg-[#1a1a1a] border-white/10" />
          </div>
          <Button className="bg-violet-600 hover:bg-violet-700">
            Додати користувача
          </Button>
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Користувач</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Релізи</th>
                <th className="px-6 py-4">Дата реєстрації</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 font-bold">
                        {user.artistName?.[0] || user.login[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.artistName || 'Без імені'}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail size={12} /> {user.login}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={user.role === 'admin' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}>
                      <Shield size={12} className="mr-1" />
                      {user.role === 'admin' ? 'Адмін' : 'Артист'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Music size={14} />
                      {user.tracksCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/10">
                        <UserCog size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => showSuccess('Користувача видалено')}
                      >
                        <Trash2 size={16} />
                      </Button>
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

export default Users;