'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { today } from '@/lib/pmo-utils';
import type { Risk, Project } from '@/types/pmo';

interface RiskFormProps {
  item?: Partial<Risk>;
  projects: Project[];
  onSave: (data: Omit<Risk, 'id'>) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Risk, 'id'> = {
  projectId: '', title: '', probability: 'medium', impact: 'medium',
  response: '', owner: '', status: 'open', date: today(),
};

const LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function RiskForm({ item, projects, onSave, onCancel }: RiskFormProps) {
  const [f, setF] = useState<Omit<Risk, 'id'>>({ ...EMPTY, ...item });
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">โครงการ</Label>
        <Select value={f.projectId} onValueChange={v => v && set('projectId', v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="— เลือก —" /></SelectTrigger>
          <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">ชื่อ Risk</Label>
        <Input value={f.title} onChange={e => set('title', e.target.value)} placeholder="อธิบายความเสี่ยง" className="mt-1" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Probability</Label>
          <Select value={f.probability} onValueChange={v => set('probability', v as Risk['probability'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Impact</Label>
          <Select value={f.impact} onValueChange={v => set('impact', v as Risk['impact'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Status</Label>
          <Select value={f.status} onValueChange={v => set('status', v as Risk['status'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="mitigated">Mitigated</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Owner</Label>
        <Input value={f.owner} onChange={e => set('owner', e.target.value)} placeholder="ผู้รับผิดชอบ" className="mt-1" />
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">แผนตอบสนอง</Label>
        <Textarea value={f.response} onChange={e => set('response', e.target.value)} rows={3} className="mt-1" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button onClick={() => { if (!f.title || !f.projectId) return; onSave(f); }} className="bg-[#D4382C] text-white hover:bg-[#c03020]">💾 บันทึก</Button>
      </div>
    </div>
  );
}
