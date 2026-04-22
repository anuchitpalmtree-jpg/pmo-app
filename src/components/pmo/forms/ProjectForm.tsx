'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { today } from '@/lib/pmo-utils';
import { STATUS_MAP } from '@/lib/pmo-utils';
import type { Project, Portfolio, Program } from '@/types/pmo';

interface ProjectFormProps {
  item?: Partial<Project>;
  portfolios: Portfolio[];
  programs: Program[];
  onSave: (data: Omit<Project, 'id'>) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Project, 'id'> = {
  name: '', programId: '', portfolioId: '', pm: '', status: 'planning',
  progress: 0, budget: 0, spent: 0, startDate: today(), endDate: '',
  priority: 'P3', spi: 1, cpi: 1, description: '',
};

export function ProjectForm({ item, portfolios, programs, onSave, onCancel }: ProjectFormProps) {
  const [f, setF] = useState<Omit<Project, 'id'>>({ ...EMPTY, ...item });
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(prev => ({ ...prev, [k]: v }));

  const filteredPrograms = programs.filter(p => !f.portfolioId || p.portfolioId === f.portfolioId);

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">ชื่อโครงการ</Label>
        <Input value={f.name} onChange={e => set('name', e.target.value)} placeholder="ชื่อโครงการ" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Portfolio</Label>
          <Select value={f.portfolioId} onValueChange={v => v && set('portfolioId', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="— เลือก —" /></SelectTrigger>
            <SelectContent>{portfolios.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Program</Label>
          <Select value={f.programId} onValueChange={v => v && set('programId', v)}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="— เลือก —" /></SelectTrigger>
            <SelectContent>{filteredPrograms.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">PM</Label>
          <Input value={f.pm} onChange={e => set('pm', e.target.value)} placeholder="ชื่อ PM" className="mt-1" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Priority</Label>
          <Select value={f.priority} onValueChange={v => set('priority', v as Project['priority'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="P1">P1 — Critical</SelectItem>
              <SelectItem value="P2">P2 — High</SelectItem>
              <SelectItem value="P3">P3 — Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Status</Label>
          <Select value={f.status} onValueChange={v => set('status', v as Project['status'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {([['progress', 'ความคืบหน้า (%)'], ['budget', 'งบ (ลบ.)'], ['spent', 'ใช้แล้ว (ลบ.)'], ['spi', 'SPI']] as const).map(([key, label]) => (
          <div key={key}>
            <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">{label}</Label>
            <Input type="number" value={f[key]} onChange={e => set(key, Number(e.target.value))} className="mt-1" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">CPI</Label>
          <Input type="number" value={f.cpi} onChange={e => set('cpi', Number(e.target.value))} className="mt-1" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">วันเริ่ม</Label>
          <Input type="date" value={f.startDate} onChange={e => set('startDate', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">วันสิ้นสุด</Label>
          <Input type="date" value={f.endDate} onChange={e => set('endDate', e.target.value)} className="mt-1" />
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">รายละเอียด</Label>
        <Textarea value={f.description} onChange={e => set('description', e.target.value)} placeholder="คำอธิบายโครงการ" className="mt-1" rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button onClick={() => { if (!f.name) return; onSave(f); }} className="bg-[#D4382C] text-white hover:bg-[#c03020]">💾 บันทึก</Button>
      </div>
    </div>
  );
}
