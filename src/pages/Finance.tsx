import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, History, CreditCard, Download } from 'lucide-react';
import { useAuthStore, useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const Finance = () => {
  const { user } = useAuthStore();
  const { transactions, users } = useDataStore();
  
  const currentUser = users.find(u => u.id === user?.id);
  const userTransactions = transactions.filter(t => t.userId === user?.id);

  const totalEarned = userTransactions
    .filter(t => t.type === 'royalty')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Фінанси</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваші роялті та виплати</p>
        </div>
        <Button className="bg-red-700 hover:bg-red-800 text-xs font-bold tracking-widest uppercase px-8 rounded-none border border-red-500/50">
          Замовити виплату
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Доступний баланс</CardTitle>
            <Wallet className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-white tracking-tighter">
              ${currentUser?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[9px] text-zinc-600 mt-4 font-black uppercase tracking-widest">Оновлено щойно</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Всього зароблено</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-white tracking-tighter">
              ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[9px] text-green-600 mt-4 font-black uppercase tracking-widest">За весь час</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
            <History size={18} className="text-red-700" />
            Історія транзакцій
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <Download size={14} className="mr-2" /> Експорт PDF
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
                <tr>
                  <th className="px-8 py-5">Дата</th>
                  <th className="px-8 py-5">Опис</th>
                  <th className="px-8 py-5">Тип</th>
                  <th className="px-8 py-5 text-right">Сума</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userTransactions.length > 0 ? (
                  userTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6 text-xs font-bold text-zinc-400">{tx.date}</td>
                      <td className="px-8 py-6 text-xs font-bold text-white">{tx.description}</td>
                      <td className="px-8 py-6">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase tracking-widest rounded-none border-none",
                          tx.type === 'royalty' ? "bg-green-900/20 text-green-500" : "bg-red-900/20 text-red-500"
                        )}>
                          {tx.type === 'royalty' ? 'Нарахування' : 'Виплата'}
                        </Badge>
                      </td>
                      <td className={cn(
                        "px-8 py-6 text-right font-black text-sm",
                        tx.type === 'royalty' ? "text-green-500" : "text-red-500"
                      )}>
                        {tx.type === 'royalty' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest">
                      Транзакцій не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;