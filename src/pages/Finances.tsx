import React, { useState } from 'react';
import { Wallet, TrendingUp, History } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Finances = () => {
  const { user } = useAuthStore();
  const { users, transactions, addWithdrawalRequest } = useDataStore();
  
  const currentUser = users.find(u => u.id === user?.id) || user;
  const userTransactions = transactions.filter(t => t.userId === currentUser?.id);
  
  const totalProfit = userTransactions
    .filter(t => t.type === 'deposit')
    .reduce((acc, t) => acc + t.amount, 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [contact, setContact] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 100) {
      showError('Мінімальна сума виводу: 100 ₴');
      return;
    }
    if (val > (currentUser?.balance || 0)) {
      showError('Недостатньо коштів на балансі');
      return;
    }
    if (!contact) {
      showError('Вкажіть контактні дані');
      return;
    }
    if (!agreed) {
      showError('Ви повинні підтвердити правильність даних');
      return;
    }

    addWithdrawalRequest({
      userId: currentUser?.id || '',
      amount: val,
      contactInfo: contact,
      confirmationAgreed: agreed
    });

    showSuccess('Заявку на вивід прийнято. Очікуйте підтвердження адміністратора');
    setIsModalOpen(false);
    setAmount('');
    setContact('');
    setAgreed(false);
  };

  const isBalanceZero = (currentUser?.balance || 0) <= 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">Фінанси</h1>
        <p className="text-zinc-500 mt-1 sm:mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Керування вашими активами</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Поточний баланс</CardTitle>
            <Wallet className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
              {currentUser?.balance?.toLocaleString() || 0} <span className="text-xl sm:text-2xl text-zinc-700">₴</span>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              disabled={isBalanceZero}
              className="mt-6 sm:mt-8 w-full bg-red-700 hover:bg-red-800 text-[10px] sm:text-xs font-black uppercase tracking-widest h-12 sm:h-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Запросити вивід
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Загальний прибуток</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
              {totalProfit.toLocaleString()} <span className="text-xl sm:text-2xl text-zinc-700">₴</span>
            </div>
            <p className="text-[8px] sm:text-[9px] text-zinc-600 mt-6 sm:mt-8 font-black uppercase tracking-widest">Сумарно за весь час</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
            <History size={18} className="text-red-700" /> Історія операцій
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-white/5 text-[9px] sm:text-[10px] uppercase text-zinc-500 font-black tracking-widest">
              <tr>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Дата</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Тип</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Сума</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {userTransactions.length > 0 ? (
                userTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-[9px] sm:text-[10px] text-zinc-500 font-mono">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6">
                      <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                        {t.type === 'deposit' ? 'Поповнення' : t.type === 'withdrawal' ? 'Вивід' : 'Коригування'}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6">
                      <span className={cn(
                        "text-xs sm:text-sm font-black tracking-tighter",
                        t.type === 'deposit' ? "text-green-500" : "text-red-700"
                      )}>
                        {t.type === 'deposit' ? '+' : '-'}{t.amount.toLocaleString()} ₴
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-5 sm:py-6 text-right">
                      <Badge className={cn(
                        "text-[8px] sm:text-[9px] font-black uppercase tracking-widest border-none rounded-none px-2 py-0.5",
                        t.status === 'completed' ? "bg-green-500/10 text-green-500" : 
                        t.status === 'pending' ? "bg-amber-500/10 text-amber-500" : 
                        "bg-red-500/10 text-red-500"
                      )}>
                        {t.status === 'completed' ? 'Виконано' : t.status === 'pending' ? 'Заявка' : 'Скасовано'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16 sm:py-20 text-center text-zinc-800 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                    Операцій ще не було
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white w-[95vw] max-w-md rounded-none p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tighter">Запросити вивід</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
            <div className="p-4 bg-red-900/5 border border-red-900/10 text-center">
              <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Доступно для виводу</p>
              <p className="text-xl sm:text-2xl font-black text-white">{currentUser?.balance?.toLocaleString() || 0} ₴</p>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Сума виводу *</Label>
              <div className="relative">
                <Input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-black/40 border-white/5 rounded-none h-12 pr-10 focus:ring-0 focus:border-red-700 text-sm"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 font-bold">₴</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Контакт для уточнення реквізитів *</Label>
              <Input 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="bg-black/40 border-white/5 rounded-none h-12 text-xs italic placeholder:text-zinc-800 focus:ring-0 focus:border-red-700"
                placeholder="Telegram: @username, Email: example@com"
              />
              <p className="text-[8px] sm:text-[9px] text-zinc-600 font-medium uppercase tracking-widest">⚡ Telegram, Email або інший зручний спосіб зв'язку</p>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-white/5 border border-white/5">
              <Checkbox 
                id="confirm" 
                checked={agreed} 
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1 border-zinc-800 data-[state=checked]:bg-red-700 data-[state=checked]:border-red-700 rounded-none shrink-0"
              />
              <Label htmlFor="confirm" className="text-[9px] sm:text-[10px] text-zinc-400 leading-relaxed font-bold uppercase tracking-wider cursor-pointer">
                Я підтверджую, що самостійно відправляю заявку на вивід коштів та всі дані, вказані в заявці, є правильними.
              </Label>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto text-[10px] font-black uppercase tracking-widest rounded-none">Відміна</Button>
            <Button 
              onClick={handleWithdraw}
              disabled={!amount || !contact || !agreed}
              className="w-full sm:w-auto bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none disabled:opacity-30"
            >
              Підтвердити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Finances;