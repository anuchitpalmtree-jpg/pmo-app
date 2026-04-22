'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { today } from '@/lib/pmo-utils';
import type { Issue, Project } from '@/types/pmo';

interface IssueFormProps {
  item?: Partial<Issue>;
  projects: Project[];
  onSave: (data: Omit<Issue, 'id'>) => void;
  onCancel: () => void;
}

const EMPTY: Omit<Issue, 'id'> = {
  projectId: '', title: '', severity: 'medium', assignee: '',
  status: 'open', date: today(), resolution: '',
};

export function IssueForm({ item, projects, onSave, onCancel }: IssueFormProps) {
  const [f, setF] = useState<Omit<Issue, 'id'>>({ ...EMPTY, ...item });
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
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Issue</Label>
        <Input value={f.title} onChange={e => set('title', e.target.value)} placeholder="อธิบายปัญหา" className="mt-1" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Severity</Label>
          <Select value={f.severity} onValueChange={v => set('severity', v as Issue['severity'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Assignee</Label>
          <Input value={f.assignee} onChange={e => set('assignee', e.target.value)} placeholder="ผู้รับผิดชอบ" className="mt-1" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Status</Label>
          <Select value={f.status} onValueChange={v => set('status', v as Issue['status'])}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">Resolution</Label>
        <Textarea value={f.resolution} onChange={e => set('resolution', e.target.value)} placeholder="แนวทางแก้ไข" rows={3} className="mt-1" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button onClick={() => { if (!f.title || !f.projectId) return; onSave(f); }} className="bg-[#D4382C] text-white hover:bg-[#c03020]">💾 บันทึก</Button>
      </div>
    </div>
  );
}
