'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateProjectMetrics, today } from '@/lib/pmo-utils';
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
  progress: 0, targetProgress: 0, budget: 0, spent: 0, startDate: today(), endDate: '',
  priority: 'P3', spi: 0, cpi: 0, description: '',
  previousWeekProgress: 0,
  weeklyProgressSummary: '',
  currentStageStatus: '',
  blockersAndMitigation: '',
  executiveSupportNeeded: '',
  requiredActions: '',
  managementConsiderations: '',
};

export function ProjectForm({ item, portfolios, programs, onSave, onCancel }: ProjectFormProps) {
  const [f, setF] = useState<Omit<Project, 'id'>>({ ...EMPTY, ...item });
  const set = <K extends keyof typeof f>(k: K, v: typeof f[K]) => setF(prev => ({ ...prev, [k]: v }));
  const metrics = calculateProjectMetrics(f);

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
          <div className="mt-1 rounded-md border border-[#E4E0D8] bg-[#F7F7F5] px-3 py-2 text-sm font-semibold text-[#1A2744]">
            {STATUS_MAP[metrics.autoStatus].label} (Auto)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {([['progress', 'ความคืบหน้าจริง (%)'], ['targetProgress', 'เป้าหมายตามแผน (%)'], ['budget', 'งบ (ลบ.)'], ['spent', 'ใช้แล้ว (ลบ.)']] as const).map(([key, label]) => (
          <div key={key}>
            <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">{label}</Label>
            <Input type="number" value={f[key]} onChange={e => set(key, Number(e.target.value))} className="mt-1" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">
            SPI (คำนวณอัตโนมัติ)
            <span className="ml-1 cursor-help text-[#2E86C1]" title="SPI = %ความคืบหน้าจริง ÷ %เป้าหมายการดำเนินงานปัจจุบัน">ⓘ</span>
          </Label>
          <Input value={metrics.spi ?? '-'} disabled className="mt-1 bg-[#F7F7F5]" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">
            CPI (คำนวณอัตโนมัติ)
            <span className="ml-1 cursor-help text-[#2E86C1]" title="CPI = (งบประมาณ x %ความคืบหน้าจริง) ÷ มูลค่าใช้จ่ายจริง">ⓘ</span>
          </Label>
          <Input value={metrics.cpi ?? '-'} disabled className="mt-1 bg-[#F7F7F5]" />
        </div>
        <div>
          <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">ความคืบหน้าสัปดาห์ก่อน (%)</Label>
          <Input type="number" value={f.previousWeekProgress ?? 0} onChange={e => set('previousWeekProgress', Number(e.target.value))} className="mt-1" />
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

      {!metrics.isComplete && (
        <div className="rounded-lg border border-[#F3D5D2] bg-[#FFF3F1] px-3 py-2 text-xs text-[#A82A1F]">
          กรุณากรอกข้อมูลให้ครบเพื่อคำนวณ SPI/CPI อัตโนมัติ: {metrics.missingFields.join(', ')}
        </div>
      )}

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">รายละเอียด</Label>
        <Textarea value={f.description} onChange={e => set('description', e.target.value)} placeholder="คำอธิบายโครงการ" className="mt-1" rows={3} />
      </div>

      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">สรุปความคืบหน้ารายสัปดาห์</Label>
        <Textarea value={f.weeklyProgressSummary ?? ''} onChange={e => set('weeklyProgressSummary', e.target.value)} placeholder="เช่น ความคืบหน้าเพิ่มขึ้นจากสัปดาห์ก่อน หรือเหตุผลที่คืบหน้าเท่าเดิม" className="mt-1" rows={2} />
      </div>
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">สถานะขั้นตอนปัจจุบัน</Label>
        <Textarea value={f.currentStageStatus ?? ''} onChange={e => set('currentStageStatus', e.target.value)} placeholder="รายละเอียดสถานะงาน ณ ปัจจุบัน" className="mt-1" rows={3} />
      </div>
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">ปัญหา/อุปสรรค และแนวทางแก้ไข</Label>
        <Textarea value={f.blockersAndMitigation ?? ''} onChange={e => set('blockersAndMitigation', e.target.value)} placeholder="ระบุปัญหา ความเสี่ยง และมาตรการแก้ไข" className="mt-1" rows={3} />
      </div>
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">สิ่งที่ขอรับการสนับสนุนจากผู้บริหาร</Label>
        <Textarea value={f.executiveSupportNeeded ?? ''} onChange={e => set('executiveSupportNeeded', e.target.value)} placeholder="สิ่งที่ต้องการให้ผู้บริหารสนับสนุน/สั่งการ" className="mt-1" rows={2} />
      </div>
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">เรื่องที่จำเป็นต้องดำเนินการ</Label>
        <Textarea value={f.requiredActions ?? ''} onChange={e => set('requiredActions', e.target.value)} placeholder="Action ที่ต้องเร่งดำเนินการ" className="mt-1" rows={2} />
      </div>
      <div>
        <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide">ข้อพิจารณา</Label>
        <Textarea value={f.managementConsiderations ?? ''} onChange={e => set('managementConsiderations', e.target.value)} placeholder="ข้อเสนอเพื่อประกอบการพิจารณาของผู้บริหาร" className="mt-1" rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>ยกเลิก</Button>
        <Button
          onClick={() => {
            if (!f.name || !metrics.isComplete) return;
            onSave({ ...f, status: metrics.autoStatus, spi: metrics.spi ?? 0, cpi: metrics.cpi ?? 0 });
          }}
          className="bg-[#D4382C] text-white hover:bg-[#c03020]"
          disabled={!f.name || !metrics.isComplete}
        >
          💾 บันทึก
        </Button>
      </div>
    </div>
  );
}
