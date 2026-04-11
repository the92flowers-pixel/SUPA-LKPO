import React, { useState } from 'react';
import { Users as UsersIcon, UserCog, Trash2, Mail, Shield, Music, Save } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';

const Users = () => {
  const { users, releases, updateUser, deleteUser } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredUsers = users.filter(u => 
    u.login.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTracksCount = (userId: string) => {
    return releases.filter(r => r.userId === userId).length;
  };

  const handleEdit = (user: any) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    updateUser(editingUser.id, editingUser);
    showSuccess('Дані користувача оновлено');
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      deleteUser(id);
      showSuccess('Користувача видалено');
    }
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
                <th className="px-6 py-4">Релізи</th>
                <th className="px-6 py-4">Дата реєстрації</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
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
                      {getTracksCount(user.id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-white/10"
                        onClick={() => handleEdit(user)}
                      >
                        <UserCog size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white">
          <DialogHeader>
            <DialogTitle>Редагувати користувача</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Логін (Email)</Label>
                <Input 
                  value={editingUser.login} 
                  onChange={(e) => setEditingUser({...editingUser, login: e.target.value})}
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>Сценічне ім'я</Label>
                <Input 
                  value={editingUser.artistName} 
                  onChange={(e) => setEditingUser({...editingUser, artistName: e.target.value})}
                  className="bg-black/40 border-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(v) => setEditingUser({...editingUser, role: v})}
                >
                  <SelectTrigger className="bg-black/40 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white">
                    <SelectItem value="admin">Адмін</SelectItem>
                    <SelectItem value="artist">Артист</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
              <Save size={16} className="mr-2" /> Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;