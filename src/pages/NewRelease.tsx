import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
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

  const renderField = (field: any) => {
    const commonProps = {
      id: field.name,
      ...register(field.name, { required: field.required }),
      className: "bg-[#1a1a1a] border-white/10 focus:border-violet-500 text-white",
      placeholder: field.label
    };

    if (field.type === 'textarea') return <Textarea {...commonProps} />;
    if (field.type === 'select') {
      const options = JSON.parse(field.options || '[]');
      return (
        <Select onValueChange={(val) => setValue(field.name, val)}>
          <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
            <SelectValue placeholder="Оберіть варіант" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
            {options.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    return <Input type={field.type} {...commonProps} />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Новий реліз</h1>
        <p className="text-gray-500">Заповніть дані для дистрибуції вашого треку</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {releaseFields.sort((a, b) => a.order - b.order).map((field) => (
            <div key={field.id} className={cn("space-y-2", field.type === 'textarea' && "md:col-span-2")}>
              <Label htmlFor={field.name} className="flex items-center gap-2 text-gray-400">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
        </div>
        <div className="p-6 bg-violet-500/5 border border-violet-500/10 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-500"><Upload size={24} /></div>
          <div>
            <h3 className="font-semibold text-white">Готові до відправки?</h3>
            <p className="text-sm text-gray-500">Перевірте правильність усіх даних перед сабмітом.</p>
          </div>
          <Button type="submit" className="ml-auto bg-violet-600 hover:bg-violet-700">Відправити реліз</Button>
        </div>
      </form>
    </div>
  );
};

export default NewRelease;