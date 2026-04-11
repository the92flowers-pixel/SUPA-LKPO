import React, { useState } from 'react';
import { Wallet, ArrowDownRight, Check, X, User, Clock, MessageSquare, Plus, Search } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const AdminFinance = () => {
  const { withdrawalRequests, users, updateWithdrawalStatus, addTransaction } = useDataStore();
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositData, setDepositData] = useState({ userId: '', amount: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const handleAction = (id: string, status: 'paid' | 'rejected') => {
    updateWithdrawalStatus(id, status, adminComment);
    showSuccess(status === 'paid' ? 'Заявку схвалено та виплачено' : 'Заявку відхилено, кошти повернуто');
    setSelectedReq(null);
    setAdminComment('');
  };

  const handleDeposit = () => {
    if (!depositData.userId || !depositData.amount) return;
    addTransaction({
      userId: depositData.userId,
      amount: parseFloat(depositData.amount),
      type: 'deposit',
      status: 'completed',
      description: depositData.description || 'Поповнення балансу адміністратором'
    });
    showSuccess('Баланс успішно поповнено');
    setIsDepositModalOpen(false);
    setDepositData({ userId: '', amount: '', description: '' });
  };

  const filteredUsers = users.filter(u => 
    u.login.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.artistName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Управління фінансами</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Контроль виплат та балансів</p>
      </div>

      <Tabs defaultValue="withdrawals" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 h-14 rounded-none">
          <TabsTrigger value="withdrawals" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Заявки на вивід</TabsTrigger>
          <TabsTrigger value="balances" className="px-10 data-[state=active]:bg-red-700 data-[state=active]:text-white rounded-none text-[10px] font-black uppercase tracking-widest">Баланси користувачів</TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="mt-8">
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Користувач</th>
                    <th className="px-6 py-4">Сума</th>
                    <th className="px-6 py-4">Дата</th>
                    <th className="px-6 py-4">Статус</th>
                    <th className="px-6 py-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {withdrawalRequests.map((req) => {
                    const user = users.find(u => u.id === req.userId);
                    return (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-mono text-zinc-600">#{req.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white uppercase">{user?.artistName || user?.login}</p>
                          <p className="text-[9px] text-zinc-600 font-mono">{user?.login}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-red-700">{req.amount.toLocaleString()} ₴</td>
                        <td className="px-6 py-4 text-[10px] text-zinc-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "text-[9px] font-black uppercase tracking-widest border-none",
                            req.status === 'paid' ? "bg-green-500/10 text-green-500" : 
                            req.status === 'pending' ? "bg-amber-500/10 text-amber-500" : 
                            "bg-red-500/10 text-red-500"
                          )}>
                            {req.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setSelectedReq(req)}
                            className="text-zinc-500 hover:text-white"
                          >
                            Деталі
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <Input 
                placeholder="Пошук артиста..." 
                className="bg-black/40 border-white/5 pl-10 h-10 text-[10px] font-bold uppercase tracking-widest rounded-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsDepositModalOpen(true)}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-10 rounded-none"
            >
              <Plus size={14} className="mr-2" /> Нарахувати кошти
            </Button>
          </div>
          <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Користувач</th>
                    <th className="px-6 py-4">Роль</th>
                    <th className="px-6 py-4 text-right">Баланс</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-white uppercase">{u.artistName || u.login}</p>
                        <p className="text-[9px] text-zinc-600 font-mono">{u.login}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-white/10 text-zinc-500">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-black text-white">
                        {u.balance.toLocaleString()} ₴
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Detail Modal */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Заявка #{selectedReq?.id}</DialogTitle>
          </DialogHeader>
          {selectedReq && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold">
                <div className="space-y-1">
                  <p className="text-zinc-600">Користувач</p>
                  <p className="text-white">{users.find(u => u.id === selectedReq.userId)?.login}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-600">Сума</p>
                  <p className="text-red-700 text-lg font-black">{selectedReq.amount} ₴</p>
                </div>
                <div className="col-span-2 space-y-1 pt-2 border-t border-white/5">
                  <p className="text-zinc-600">Контактні дані</p>
                  <p className="text-white bg-white/5 p-3 font-mono lowercase">{selectedReq.contactInfo}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-zinc-600">Підтвердження</p>
                  <p className="text-green-500 flex items-center gap-2">
                    <Check size={14} /> ✅ Так, підтверджено користувачем
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Коментар адміна</Label>
                <Textarea 
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className="bg-black/40 border-white/5 rounded-none min-h-[80px] text-xs"
                  placeholder="Додайте коментар для користувача..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-3">
            <Button 
              variant="destructive" 
              onClick={() => handleAction(selectedReq.id, 'rejected')}
              className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border-none text-[10px] font-black uppercase tracking-widest px-6 h-12 rounded-none"
            >
              Відхилити (повернути кошти)
            </Button>
            <Button 
              onClick={() => handleAction(selectedReq.id, 'paid')}
              className="bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase tracking-widest px-6 h-12 rounded-none"
            >
              Схвалити та виплатити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Нарахувати кошти</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виберіть користувача</Label>
              <Select onValueChange={(v) => setDepositData({...depositData, userId: v})}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12">
                  <SelectValue placeholder="Оберіть артиста" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                  {users.filter(u => u.role === 'artist').map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.artistName || u.login}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Сума</Label>
              <Input 
                type="number"
                value={depositData.amount}
                onChange={(e) => setDepositData({...depositData, amount: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Опис</Label>
              <Input 
                value={depositData.description}
                onChange={(e) => setDepositData({...depositData, description: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12"
                placeholder="Наприклад: Роялті за Q1 2024"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDeposit} className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;