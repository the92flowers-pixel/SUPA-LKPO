import React, { useState } from 'react';
import { FileText, Plus, Trash2, Search, User, Calendar, Link as LinkIcon } from 'lucide-react';
import { useDataStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showSuccess } from '@/utils/toast';

const AdminReports = () => {
  const { quarterlyReports, users, addReport, deleteReport } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    quarter: '1',
    year: '2026',
    fileUrl: '',
    fileName: ''
  });

  const handleAddReport = () => {
    if (!formData.userId || !formData.fileUrl) return;
    addReport({
      userId: formData.userId,
      quarter: parseInt(formData.quarter),
      year: parseInt(formData.year),
      fileUrl: formData.fileUrl,
      fileName: formData.fileName
    });
    showSuccess('Звіт успішно додано');
    setIsModalOpen(false);
    setFormData({ userId: '', quarter: '1', year: '2026', fileUrl: '', fileName: '' });
  };

  const years = ['2026', '2027', '2028', '2029', '2030'];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Управління звітами</h1>
          <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Квартальна звітність артистів</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none"
        >
          <Plus size={14} className="mr-2" /> Додати звіт
        </Button>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
            <FileText size={18} className="text-red-700" /> Список звітів
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Користувач</th>
                <th className="px-6 py-4">Квартал</th>
                <th className="px-6 py-4">Файл</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quarterlyReports.length > 0 ? (
                quarterlyReports.map((report) => {
                  const user = users.find(u => u.id === report.userId);
                  return (
                    <tr key={report.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-[10px] font-mono text-zinc-600">#{report.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-white uppercase">{user?.artistName || user?.login}</p>
                        <p className="text-[9px] text-zinc-600 font-mono">{user?.login}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {report.quarter} кв {report.year}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a href={report.fileUrl} target="_blank" className="text-[10px] text-red-700 hover:underline font-mono truncate max-w-[150px] block">
                          {report.fileName || 'view_file'}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteReport(report.id)}
                          className="text-red-900 hover:text-red-500 hover:bg-red-900/10 rounded-none"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-800 text-[10px] font-black uppercase tracking-widest">
                    Звітів ще не додано
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#050505] border-white/5 text-white max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter">Додати звіт</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Виберіть користувача *</Label>
              <Select onValueChange={(v) => setFormData({...formData, userId: v})}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 focus:ring-0">
                  <SelectValue placeholder="Пошук за email або імені" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                  {users.filter(u => u.role === 'artist').map(u => (
                    <SelectItem key={u.id} value={u.id} className="uppercase font-bold text-[10px]">{u.artistName || u.login}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Квартал *</Label>
                <Select onValueChange={(v) => setFormData({...formData, quarter: v})} defaultValue="1">
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    <SelectItem value="1" className="uppercase font-bold text-[10px]">1 квартал</SelectItem>
                    <SelectItem value="2" className="uppercase font-bold text-[10px]">2 квартал</SelectItem>
                    <SelectItem value="3" className="uppercase font-bold text-[10px]">3 квартал</SelectItem>
                    <SelectItem value="4" className="uppercase font-bold text-[10px]">4 квартал</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Рік *</Label>
                <Select onValueChange={(v) => setFormData({...formData, year: v})} defaultValue="2026">
                  <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
                    {years.map(y => (
                      <SelectItem key={y} value={y} className="uppercase font-bold text-[10px]">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Посилання на файл звіту *</Label>
              <Input 
                value={formData.fileUrl}
                onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:ring-0 focus:border-red-700"
                placeholder="Google Drive, Dropbox, або пряме посилання"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Назва файлу (опціонально)</Label>
              <Input 
                value={formData.fileName}
                onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                className="bg-black/40 border-white/5 rounded-none h-12 focus:ring-0 focus:border-red-700"
                placeholder="Наприклад: zvit_q1_2024.pdf"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest rounded-none">Відміна</Button>
            <Button 
              onClick={handleAddReport}
              disabled={!formData.userId || !formData.fileUrl}
              className="bg-red-700 hover:bg-red-800 text-[10px] font-black uppercase tracking-widest px-10 h-12 rounded-none"
            >
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReports;