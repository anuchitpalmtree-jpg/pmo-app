'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/pmo/StatusBadge';
import { calculateProjectMetrics, thaiDate, weekNum, today, uid } from '@/lib/pmo-utils';
import type { PMOData, PMOStats, WeeklyNote } from '@/types/pmo';

interface WeeklyProps {
  data: PMOData;
  stats: PMOStats;
  canEdit: boolean;
  onSaveNote: (notes: WeeklyNote[]) => void;
}

export function Weekly({ data, stats, canEdit, onSaveNote }: WeeklyProps) {
  const currentNote = data.weeklyNotes?.[0] ?? {} as WeeklyNote;
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<Partial<WeeklyNote>>(currentNote);

  const getProject = (id: string) => data.projects.find(p => p.id === id);

  const criticals = data.projects.filter(p => p.status === 'critical' || p.status === 'at-risk');
  const upcoming = [...data.milestones]
    .filter(m => m.status !== 'completed')
    .sort((a, b) => a.dueDate > b.dueDate ? 1 : -1)
    .slice(0, 6);

  const pfBudgets = data.portfolios.map(pf => {
    const projs = data.projects.filter(p => p.portfolioId === pf.id);
    const metrics = projs.map(project => calculateProjectMetrics(project));
    const budget = projs.reduce((s, p) => s + (p.budget || 0), 0);
    const spent = projs.reduce((s, p) => s + (p.spent || 0), 0);
    const validSpi = metrics.map(m => m.spi).filter((v): v is number => v !== null);
    const validCpi = metrics.map(m => m.cpi).filter((v): v is number => v !== null);
    const avgSPI = validSpi.length ? (validSpi.reduce((s, value) => s + value, 0) / validSpi.length).toFixed(2) : '-';
    const avgCPI = validCpi.length ? (validCpi.reduce((s, value) => s + value, 0) / validCpi.length).toFixed(2) : '-';
    return { ...pf, budget, spent, spi: avgSPI, cpi: avgCPI, disbursement: budget ? Math.round(spent / budget * 100) : 0 };
  });

  const saveNote = () => {
    if (!canEdit) return;
    const notes = [...(data.weeklyNotes ?? [])];
    if (notes[0]) {
      notes[0] = { ...notes[0], ...note };
    } else {
      notes.unshift({ ...note, id: uid(), weekNumber: weekNum(), year: 2026, createdAt: today() } as WeeklyNote);
    }
    onSaveNote(notes);
    setEditing(false);
  };

  const thCls = 'py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdCls = 'py-2.5 px-3 text-[13px]';

  useEffect(() => {
    if (!canEdit) setEditing(false);
  }, [canEdit]);

  return (
    <div>
      <div className="text-xl font-black text-[#1A2744] mb-1">📋 รายงานประจำสัปดาห์</div>
      <div className="text-sm text-[#7A8699] mb-5">Weekly Executive Report — นำเสนอต่อผู้บริหารทุกวันอังคารเช้า</div>

      {/* Banner */}
      <div className="rounded-xl p-6 text-white mb-5" style={{ background: 'linear-gradient(135deg, #1A2744 0%, #2C4270 100%)' }}>
        <div className="text-lg font-black mb-0.5">สัปดาห์ที่ {weekNum()}/2569</div>
        <div className="text-xs opacity-70 mb-4">จัดทำโดย: PMO ไปรษณีย์ไทย | วันที่ {new Date().toLocaleDateString('th-TH')}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: 'โครงการรวม', value: stats.total, color: undefined },
            { label: 'On Track', value: `${stats.total ? Math.round(((stats.byStatus?.['on-track'] || 0) / stats.total) * 100) : 0}%`, color: '#2ECC71' },
            { label: 'At Risk', value: `${stats.total ? Math.round(((stats.byStatus?.['at-risk'] || 0) / stats.total) * 100) : 0}%`, color: '#F39C12' },
            { label: 'Critical', value: `${stats.total ? Math.round(((stats.byStatus?.['critical'] || 0) / stats.total) * 100) : 0}%`, color: '#E74C3C' },
            { label: 'Avg SPI', value: stats.avgSPI, color: undefined },
            { label: 'Avg CPI', value: stats.avgCPI, color: undefined },
          ].map((k, i) => (
            <div key={i} className="rounded-lg p-3 bg-white/10">
              <div className="text-[10px] opacity-70 uppercase tracking-wide mb-1">{k.label}</div>
              <div className="font-mono text-[22px] font-bold" style={{ color: k.color || 'white' }}>{k.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="border-[#E4E0D8]">
          <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
            <CardTitle className="text-[15px] font-black text-[#1A2744]">🔴 โครงการต้องเฝ้าระวัง</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-2">
            {criticals.length === 0 ? (
              <div className="text-center py-8 text-[#7A8699]"><div className="text-3xl mb-1">✅</div><div className="text-sm">ไม่มีโครงการ Critical</div></div>
            ) : criticals.map(p => {
              const metrics = calculateProjectMetrics(p);
              return (
              <div key={p.id} className="py-2.5 border-b border-[#E4E0D8] last:border-0 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="text-xs text-[#7A8699] mt-0.5">SPI: {metrics.spi ?? '-'} · CPI: {metrics.cpi ?? '-'} · งบ: {p.spent}/{p.budget} ลบ.</div>
              </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-[#E4E0D8]">
          <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
            <CardTitle className="text-[15px] font-black text-[#1A2744]">🏁 Milestones สัปดาห์นี้</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-2">
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-[#7A8699]"><div className="text-3xl mb-1">📅</div><div className="text-sm">ไม่มี Milestone</div></div>
            ) : upcoming.map(m => (
              <div key={m.id} className="py-2.5 border-b border-[#E4E0D8] last:border-0 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{getProject(m.projectId)?.name}</span>
                  <span className="font-mono text-[11px] text-[#7A8699]">{thaiDate(m.dueDate)}</span>
                </div>
                <div className="text-xs text-[#7A8699]">{m.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4 border-[#E4E0D8]">
        <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
          <CardTitle className="text-[15px] font-black text-[#1A2744]">💰 สรุปงบประมาณ Portfolio (ล้านบาท)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {['Portfolio', 'งบอนุมัติ', 'เบิกจ่ายแล้ว', '% เบิกจ่าย', 'SPI', 'CPI'].map((h, i) => (
                  <th key={h} className={`${thCls} ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pfBudgets.map(pf => (
                <tr key={pf.id} className="border-b border-[#E4E0D8]">
                  <td className={`${tdCls} font-bold`}>{pf.icon} {pf.name}</td>
                  <td className={`${tdCls} text-right font-mono text-xs`}>{pf.budget}</td>
                  <td className={`${tdCls} text-right font-mono text-xs`}>{pf.spent}</td>
                  <td className={`${tdCls} text-right font-mono text-xs`}>{pf.disbursement}%</td>
                  <td className={`${tdCls} text-right font-mono text-xs ${Number(pf.spi) < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{pf.spi}</td>
                  <td className={`${tdCls} text-right font-mono text-xs ${Number(pf.cpi) < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{pf.cpi}</td>
                </tr>
              ))}
              <tr className="font-bold bg-[#F0EDE6]">
                <td className={tdCls}>รวม</td>
                <td className={`${tdCls} text-right font-mono text-xs`}>{stats.totalBudget}</td>
                <td className={`${tdCls} text-right font-mono text-xs`}>{stats.totalSpent}</td>
                <td className={`${tdCls} text-right font-mono text-xs`}>{stats.disbursement}%</td>
                <td className={`${tdCls} text-right font-mono text-xs`}>{stats.avgSPI}</td>
                <td className={`${tdCls} text-right font-mono text-xs`}>{stats.avgCPI}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-[#E4E0D8]">
        <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8] flex-row items-center justify-between">
          <CardTitle className="text-[15px] font-black text-[#1A2744]">📝 บันทึกของ PMO</CardTitle>
          {editing ? (
            <Button size="sm" onClick={saveNote} className="bg-[#2D9F5E] text-white hover:bg-[#248a50]">💾 บันทึก</Button>
          ) : (
            canEdit && <Button variant="outline" size="sm" onClick={() => setEditing(true)}>✏️ แก้ไข</Button>
          )}
        </CardHeader>
        <CardContent className="p-5">
          {editing ? (
            <div className="space-y-3">
              {(['decisions', 'achievements', 'nextWeekFocus'] as const).map((field, i) => (
                <div key={field}>
                  <Label className="text-[11px] text-[#7A8699] uppercase tracking-wide mb-1 block">
                    {['📌 สิ่งที่ต้องตัดสินใจ (Decisions Required)', '✅ ความสำเร็จสัปดาห์นี้ (Achievements)', '🔮 Focus สัปดาห์หน้า'][i]}
                  </Label>
                  <Textarea value={(note[field] as string) || ''} onChange={e => setNote(n => ({ ...n, [field]: e.target.value }))} rows={3} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[
                { field: 'decisions', label: '📌 Decisions Required', color: '#D4382C' },
                { field: 'achievements', label: '✅ Achievements', color: '#2D9F5E' },
                { field: 'nextWeekFocus', label: '🔮 Next Week Focus', color: '#2E86C1' },
              ].map(({ field, label, color }) => (
                <div key={field}>
                  <div className="text-xs font-bold uppercase mb-2" style={{ color }}>{label}</div>
                  <pre className="text-[13px] whitespace-pre-wrap leading-relaxed font-[inherit] text-[#1A2744]">
                    {(currentNote as unknown as Record<string, string>)[field] || '— ยังไม่มีข้อมูล —'}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
