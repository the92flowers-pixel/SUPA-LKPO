import React from 'react';
import { Users as UsersIcon, UserCog, Trash2, Mail, Shield, Music, Wallet, Save } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Users = () => {
  const { users, releases, updateUser, deleteUser } = useDataStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingUser, setEditingUser] = React.useState<any>(null);

  const filteredUsers = users.filter(u => 
    u.login.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTracksCount = (userId: string) => {
    return releases.filter(r => r.userId === userId).length;
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      artistName: formData.get('artistName') as string,
      login: formData.get('login') as string,
      role: formData.get('role') as 'admin' | 'artist',
      balance: parseFloat(formData.get('balance') as string) || 0,
    };
    updateUser(editingUser.id, data);
    showSuccess('Дані користувача оновлено');
    setEditingUser(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Користувачі</h1>
          <p className="text-gray-500">Керування всіма акаунтами платформи ({users.length})</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-64">
            <Input 
              placeholder="Пошук користувача..." 
              className="bg-[#1a1a1a] border-white/10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4">Користувач</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4">Баланс</th>
                <th className="px-6 py-4">Релізи</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-700/10 flex items-center justify-center text-red-700 font-bold">
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
                    <div className="flex items-center gap-1 text-sm font-bold text-green-500">
                      <Wallet size={14} />
                      ${user.balance.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Music size={14} />
                      {getTracksCount(user.id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-white/10"
                        onClick={() => setEditingUser(user)}
                      >
                        <UserCog size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => {
                          if(confirm('Видалити користувача?')) {
                            deleteUser(user.id);
                            showSuccess('Користувача видалено');
                          }
                        }}
                        disabled={user.role === 'admin'}
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

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Редагування користувача</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Сценічне ім'я</Label>
              <Input name="artistName" defaultValue={editingUser?.artistName} className="bg-[#0a0a0a] border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Email / Логін</Label>
              <Input name="login" defaultValue={editingUser?.login} className="bg-[#0a0a0a] border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select name="role" defaultValue={editingUser?.role}>
                  <SelectTrigger className="bg-[#0a0a0a] border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="artist">Артист</SelectItem>
                    <SelectItem value="admin">Адмін</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Баланс ($)</Label>
                <Input name="balance" type="number" step="0.01" defaultValue={editingUser?.balance} className="bg-[#0a0a0a] border-white/10" />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>Скасувати</Button>
              <Button type="submit" className="bg-red-700 hover:bg-red-800">
                <Save size={16} className="mr-2" /> Зберегти
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;