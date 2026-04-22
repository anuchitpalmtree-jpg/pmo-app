'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { today } from '@/lib/pmo-utils';
import type { Milestone, Project } from '@/types/pmo';

interface MilestoneFormProps {
  item?: Partial<Milestone>;
  projects: Project[];
  onSave: (data: Omit<Milestone, 'id'>) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Milestone, 'id'> = {
  projectId: '', title: '', dueDate: today(), status: 'on-track',
};

export function MilestoneForm({ item, projects, onSave, onCancel }: MilestoneFormProps) {
  const [f, setF] = useState<Omit<Milestone, 'id'>>({ ...EMPTY, ...item });
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
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Milestone</Label>
        <Input value={f.title} onChange={e => set('title', e.target.value)} placeholder="ชื่อ Milestone" className="mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">กำหนดส่ง</Label>
          <Input type="date" value={f.dueDate} onChange={e => set('dueDate', e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Status</Label>
          <Select value={f.status} onValueChange={v => set('status', v as Milestone['status'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="on-track">On Track</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button onClick={() => { if (!f.title || !f.projectId) return; onSave(f); }} className="bg-[#D4382C] text-white hover:bg-[#c03020]">💾 บันทึก</Button>
      </div>
    </div>
  );
}
