import React, { useState } from 'react';
import { Users as UsersIcon, UserCog, Trash2, Mail, Shield, Music, Save, Key, CheckCircle, XCircle } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess } from '@/utils/toast';

const Users = () => {
  const { users, releases, updateUser, deleteUser, fields } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const profileFields = fields.filter(f => f.section === 'profile');

  const filteredUsers = users.filter(u => 
    u.login.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (user: any) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    updateUser(editingUser.id, editingUser);
    showSuccess('Дані користувача оновлено');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Користувачі</h1>
          <p className="text-gray-500">Керування всіма акаунтами та їх даними</p>
        </div>
        <Input 
          placeholder="Пошук..." 
          className="bg-[#1a1a1a] border-white/10 w-64" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">Користувач</th>
              <th className="px-6 py-4">Роль</th>
              <th className="px-6 py-4">Верифікація</th>
              <th className="px-6 py-4">Релізи</th>
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
                      <p className="text-xs text-gray-500">{user.login}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge className={user.role === 'admin' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"}>
                    {user.role === 'admin' ? 'Адмін' : 'Артист'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {user.isVerified ? (
                    <Badge className="bg-green-500/10 text-green-500 border-none flex items-center gap-1 w-fit">
                      <CheckCircle size={12} /> Верифікований
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 border-none flex items-center gap-1 w-fit">
                      <XCircle size={12} /> Неверифікований
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {releases.filter(r => r.userId === user.id).length}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                    <UserCog size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редагувати користувача</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Верифікація артиста</Label>
                  <p className="text-xs text-zinc-500">Надає статус верифікованого профілю</p>
                </div>
                <Switch 
                  checked={editingUser.isVerified} 
                  onCheckedChange={(checked) => setEditingUser({...editingUser, isVerified: checked})}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Логін (Email)</Label>
                  <Input value={editingUser.login} onChange={(e) => setEditingUser({...editingUser, login: e.target.value})} className="bg-black/40 border-white/5" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({...editingUser, role: v})}>
                  <SelectTrigger className="bg-black/40 border-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white">
                    <SelectItem value="admin">Адмін</SelectItem>
                    <SelectItem value="artist">Артист</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-bold mb-4 text-zinc-400 uppercase tracking-widest">Поля профілю</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Сценічне ім'я</Label>
                    <Input 
                      value={editingUser.artistName || ''} 
                      onChange={(e) => setEditingUser({...editingUser, artistName: e.target.value})} 
                      className="bg-black/40 border-white/5" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>БІО</Label>
                    <Textarea 
                      value={editingUser.bio || ''} 
                      onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})} 
                      className="bg-black/40 border-white/5 min-h-[100px]" 
                    />
                  </div>
                  {profileFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>
                      {field.type === 'textarea' ? (
                        <Textarea 
                          value={editingUser[field.name] || ''} 
                          onChange={(e) => setEditingUser({...editingUser, [field.name]: e.target.value})} 
                          className="bg-black/40 border-white/5 min-h-[100px]" 
                        />
                      ) : field.type === 'select' ? (
                        <Select 
                          value={editingUser[field.name] || ''} 
                          onValueChange={(v) => setEditingUser({...editingUser, [field.name]: v})}
                        >
                          <SelectTrigger className="bg-black/40 border-white/5"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white">
                            {field.options?.split(',').map((opt: string) => (
                              <SelectItem key={opt.trim()} value={opt.trim()}>{opt.trim()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          type={field.type}
                          value={editingUser[field.name] || ''} 
                          onChange={(e) => setEditingUser({...editingUser, [field.name]: e.target.value})} 
                          className="bg-black/40 border-white/5" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700"><Save size={16} className="mr-2" /> Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;