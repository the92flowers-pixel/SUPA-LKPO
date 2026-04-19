import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, Music, FileUp } from 'lucide-react';
import { useDataStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const NewRelease = () => {
  const { register, handleSubmit, setValue } = useForm();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fields, addRelease, statuses } = useDataStore();
  
  const releaseFields = fields.filter(f => f.section === 'release' && f.visible);
  const defaultStatus = statuses.find(s => s.isDefault)?.name || 'На модерації';

  const onSubmit = (data: any) => {
    addRelease({
      ...data,
      userId: user?.id || 'unknown',
      status: defaultStatus
    });
    showSuccess('Реліз успішно відправлено на модерацію!');
    navigate('/releases');
  };

  // Helper to parse options - handles both JSON array string and comma-separated string
  const parseOptions = (optionsStr: any): string[] => {
    if (!optionsStr || typeof optionsStr !== 'string') return [];
    try {
      // First try JSON parse
      return JSON.parse(optionsStr);
    } catch {
      // If that fails, assume it's comma-separated
      return optionsStr.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  };

  const renderField = (field: any) => {
    const commonProps = {
      id: field.name,
      ...register(field.name, { required: field.required }),
      className: "bg-black/40 border-white/5 rounded-none h-12 focus:border-red-900/50 text-white placeholder:text-zinc-800",
      placeholder: `Введіть ${field.label.toLowerCase()}...`
    };

    if (field.type === 'textarea') return <Textarea {...commonProps} className={cn(commonProps.className, "min-h-[120px] py-4 resize-none")} />;
    
    if (field.type === 'select') {
      const options = parseOptions(field.options);
      return (
        <Select onValueChange={(val) => setValue(field.name, val)}>
          <SelectTrigger className="bg-black/40 border-white/5 rounded-none h-12 text-white focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Оберіть варіант" />
          </SelectTrigger>
          <SelectContent className="bg-[#0a0a0a] border-white/5 text-white rounded-none">
            {options.map((opt: string) => <SelectItem key={opt} value={opt} className="focus:bg-red-900/20 focus:text-red-500">{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'file') {
      return (
        <div className="relative">
          <Input 
            type="file" 
            accept={field.fileTypes}
            className="hidden" 
            id={`file-${field.name}`}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > (field.maxSize || 5) * 1024 * 1024) {
                  alert(`Файл занадто великий. Максимум: ${field.maxSize}MB`);
                  e.target.value = '';
                  return;
                }
                setValue(field.name, file.name);
                showSuccess(`Файл ${file.name} обрано`);
              }
            }}
          />
          <Label 
            htmlFor={`file-${field.name}`}
            className="flex items-center justify-center gap-3 w-full h-12 bg-black/40 border border-white/5 border-dashed hover:border-red-900/50 cursor-pointer transition-colors text-zinc-500 text-xs font-bold uppercase tracking-widest"
          >
            <FileUp size={16} />
            Завантажити ({field.fileTypes || 'всі типи'})
          </Label>
        </div>
      );
    }

    return <Input type={field.type} {...commonProps} />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/10 border border-red-900/20 mb-4">
          <Music className="text-red-700" size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white uppercase">Новий реліз</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em]">Створення нового артефакту</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {releaseFields.sort((a, b) => a.order - b.order).map((field) => (
            <div key={field.id} className={cn("space-y-3", field.type === 'textarea' && "md:col-span-2")}>
              <Label htmlFor={field.name} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                {field.label} {field.required && <span className="text-red-800">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="p-10 bg-black/40 border border-white/5 rounded-none flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-700" />
          <div className="w-16 h-16 rounded-none bg-red-900/10 flex items-center justify-center text-red-700 border border-red-900/20">
            <Upload size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Готові до публікації?</h3>
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Перевірте правильність усіх метаданих. Після відправки реліз потрапить у чергу модерації.
            </p>
          </div>
          <Button type="submit" className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-xs font-black uppercase tracking-widest px-12 h-14 rounded-none shadow-[0_0_30px_rgba(185,28,28,0.3)]">
            Відправити на модерацію
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewRelease;