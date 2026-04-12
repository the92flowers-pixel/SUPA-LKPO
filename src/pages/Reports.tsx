import React from 'react';
import { FileText, Download, Music, Calendar } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sanitizeUrl } from '@/utils/security';

const Reports = () => {
  const { user } = useAuthStore();
  const { quarterlyReports, settings } = useDataStore();
  
  const userReports = quarterlyReports.filter(r => r.userId === user?.id);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Звіти</h1>
        <p className="text-zinc-500 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Ваша квартальна аналітика</p>
      </div>

      <Card className="bg-black/40 border-white/5 rounded-none shadow-2xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
            <FileText size={18} className="text-red-700" /> Квартальні звіти
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] uppercase text-zinc-500 font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Виконавець</th>
                <th className="px-8 py-5">Квартал</th>
                <th className="px-8 py-5 text-right">Дія</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {userReports.length > 0 ? (
                userReports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Music size={14} className="text-red-700" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {user?.artistName || settings.siteName}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-zinc-600" />
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                          {report.quarter} квартал {report.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Button 
                        variant="outline"
                        onClick={() => window.open(sanitizeUrl(report.fileUrl), '_blank')}
                        className="border-red-900/30 text-red-500 hover:bg-red-900/10 text-[10px] font-black uppercase tracking-widest h-10 rounded-none px-6"
                      >
                        <Download size={14} className="mr-2" /> Завантажити
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-zinc-800 text-[10px] font-black uppercase tracking-widest">
                    Звітів ще не додано
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;