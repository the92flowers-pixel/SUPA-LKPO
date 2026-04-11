import React, { useState } from 'react';
import { Users as UsersIcon, UserCog, Trash2, Mail, Shield, Music, Save, Key, CheckCircle, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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

  const exportToExcel = () => {
    const data = users.map(u => ({
      ID: u.id,
      Логін: u.login,
      Імя_Артиста: u.artistName || '',
      Роль: u.role,
      Баланс: u.balance,
      Верифікований: u.isVerified ? 'Так' : 'Ні',
      Дата_реєстрації: new Date(u.createdAt).toLocaleDateString()
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccess('Експорт користувачів завершено!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Користувачі</h1>
          <p className="text-gray-500">Керування всіма акаунтами та їх даними</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            onClick={exportToExcel}
            variant="outline"
            className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-6 rounded-none hover:bg-white/10"
          >
            <Download size={14} className="mr-2 text-red-700" />
            Export XLSX
          </Button>
          <Input 
            placeholder="Пошук..." 
            className="bg-[#1a1a1a] border-white/10 w-full md:w-64 h-12 rounded-none" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-[#1a1a1a] border-white/5 overflow-hidden rounded-none">
        <div className="overflow-x-auto">
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
                      <div className="w-10 h-10 rounded-none bg-red-900/10 flex items-center justify-center text-red-700 font-bold border border-red-900/20">
                        {user.artistName?.[0] || user.login[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.artistName || 'Без імені'}</p>
                        <p className="text-xs text-gray-500">{user.login}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={user.role === 'admin' ? "bg-amber-500/10 text-amber-500 rounded-none" : "bg-blue-500/10 text-blue-500 rounded-none"}>
                      {user.role === 'admin' ? 'Адмін' : 'Артист'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {user.isVerified ? (
                      <Badge className="bg-green-500/10 text-green-500 border-none flex items-center gap-1 w-fit rounded-none">
                        <CheckCircle size={12} /> Верифікований
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500 border-none flex items-center gap-1 w-fit rounded-none">
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
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/5 text-white max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Редагувати користувача</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-none">
                <div className="space-y-0.5">
                  <Label className="text-base">Верифікація артиста</Label>
                  <p className="text-xs text-zinc-500">Надає статус верифікованого профілю</p>
                </div>
                <Switch 
                  checked={editingUser.isVerified} 
                  onCheckedChange={(checked) => setEditingUser({...editingUser, isVerified: checked})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Логін (Email)</Label>
                  <Input value={editingUser.login} onChange={(e) => setEditingUser({...editingUser, login: e.target.value})} className="bg-black/40 border-white/5 rounded-none" />
                </div>
                <div className="space-y-2">
                  <Label>Пароль</Label>
                  <div className="relative">
                    <Input type="text" value={editingUser.password || ''} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="bg-black/40 border-white/5 pl-10 rounded-none" />
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({...editingUser, role: v})}>
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="admin">Адмін</SelectItem>
                    <SelectItem value="artist">Артист</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-bold mb-4 text-zinc-400 uppercase tracking-widest">Поля профілю</h3>
                <div className="grid grid-cols-1 gap-4">
                  {profileFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>
                      <Input 
                        value={editingUser[field.name] || ''} 
                        onChange={(e) => setEditingUser({...editingUser, [field.name]: e.target.value})} 
                        className="bg-black/40 border-white/5 rounded-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave} className="bg-red-700 hover:bg-red-800 rounded-none px-8"><Save size={16} className="mr-2" /> Зберегти</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;