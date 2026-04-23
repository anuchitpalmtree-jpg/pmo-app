'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PriorityBadge } from '@/components/pmo/StatusBadge';
import { uid } from '@/lib/pmo-utils';
import type { PMOData } from '@/types/pmo';

interface AlignmentProps {
  data: PMOData;
  onReplace: <K extends keyof PMOData>(key: K, items: PMOData[K]) => void;
}

export function Alignment({ data, onReplace }: AlignmentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const getPortfolio = (id: string) => data.portfolios.find(p => p.id === id);
  const goals = useMemo(
    () => [...data.strategicGoals].sort((a, b) => a.order - b.order),
    [data.strategicGoals]
  );
  const alignmentSettings = data.alignmentSettings[0];
  const visionText = alignmentSettings?.vision ?? '';

  const thCls = 'py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdCls = 'py-2.5 px-3 text-[13px]';
  const hasLink = (projectId: string, goalId: string) =>
    data.projectGoalAlignments.some(x => x.projectId === projectId && x.goalId === goalId);

  const setVision = (vision: string) => {
    const next = data.alignmentSettings.length
      ? data.alignmentSettings.map((item, i) => (i === 0 ? { ...item, vision } : item))
      : [{ id: uid(), vision }];
    onReplace('alignmentSettings', next);
  };

  const setGoalName = (id: string, name: string) => {
    onReplace(
      'strategicGoals',
      data.strategicGoals.map(g => (g.id === id ? { ...g, name } : g))
    );
  };

  const addGoal = () => {
    const maxOrder = goals.reduce((m, g) => Math.max(m, g.order), 0);
    onReplace('strategicGoals', [
      ...data.strategicGoals,
      { id: uid(), name: 'เป้าหมายใหม่', order: maxOrder + 1 },
    ]);
  };

  const removeGoal = (goalId: string) => {
    if (!confirm('ต้องการลบเป้าหมายนี้และการผูก Alignment ที่เกี่ยวข้องทั้งหมดหรือไม่?')) return;
    const remaining = goals.filter(g => g.id !== goalId).map((g, i) => ({ ...g, order: i + 1 }));
    onReplace('strategicGoals', remaining);
    onReplace('projectGoalAlignments', data.projectGoalAlignments.filter(x => x.goalId !== goalId));
  };

  const toggleLink = (projectId: string, goalId: string) => {
    const existing = data.projectGoalAlignments.find(x => x.projectId === projectId && x.goalId === goalId);
    if (existing) {
      onReplace('projectGoalAlignments', data.projectGoalAlignments.filter(x => x.id !== existing.id));
      return;
    }
    onReplace('projectGoalAlignments', [...data.projectGoalAlignments, { id: uid(), projectId, goalId }]);
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="text-xl font-black text-[#1A2744] mb-1">🎯 Project Alignment</div>
          <div className="text-sm text-[#7A8699]">ความสอดคล้องของโครงการกับยุทธศาสตร์องค์กร</div>
        </div>
        <Button
          onClick={() => setIsEditing(v => !v)}
          className={isEditing ? 'bg-[#1A2744] text-white hover:bg-[#121d33]' : 'bg-[#D4382C] text-white hover:bg-[#c03020]'}
        >
          {isEditing ? 'ปิดการแก้ไข' : 'Edit'}
        </Button>
      </div>

      <Card className="mb-4 border-[#E4E0D8]">
        <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
          <CardTitle className="text-[15px] font-black text-[#1A2744]">Strategy Cascade — Portfolio → Program → Project</CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <div className="inline-block bg-[#1A2744] text-white px-8 py-3 rounded-xl text-[13px] font-bold mb-3">
            🏛️ วิสัยทัศน์: {visionText || '—'}
          </div>
          <div className="h-4 w-0.5 bg-[#E4E0D8] mx-auto" />
          <div className="flex gap-2 justify-center flex-wrap mb-3 mt-2">
            {data.portfolios.map(pf => (
              <div key={pf.id} className="text-white px-4 py-2.5 rounded-lg text-xs font-bold min-w-[140px]" style={{ background: pf.color }}>
                {pf.icon} {pf.name}
                <div className="text-[10px] opacity-80 mt-0.5">{data.projects.filter(p => p.portfolioId === pf.id).length} โครงการ</div>
              </div>
            ))}
          </div>
          <div className="h-4 w-0.5 bg-[#E4E0D8] mx-auto" />
          <div className="flex gap-2 justify-center flex-wrap mb-3 mt-2">
            {data.programs.map(pg => (
              <div key={pg.id} className="text-white px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: '#D4382C' }}>
                📋 {pg.name}
              </div>
            ))}
          </div>
          <div className="h-4 w-0.5 bg-[#E4E0D8] mx-auto" />
          <div className="flex gap-1.5 justify-center flex-wrap mt-2">
            {data.projects.map(p => (
              <div key={p.id} className="bg-white px-3.5 py-1.5 rounded-lg text-[11px] font-semibold border-2" style={{ borderColor: getPortfolio(p.portfolioId)?.color || '#E4E0D8' }}>
                📌 {p.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#E4E0D8]">
        <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
          <CardTitle className="text-[15px] font-black text-[#1A2744]">Alignment Matrix — โครงการ vs เป้าหมายยุทธศาสตร์ (กดเพื่อแก้ไขได้)</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                <th className={`${thCls} text-left`}>โครงการ</th>
                {goals.map(h => <th key={h.id} className={`${thCls} text-center`}>{h.name}</th>)}
                <th className={`${thCls} text-left`}>Portfolio</th>
                <th className={thCls}>Priority</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map(p => {
                return (
                  <tr key={p.id} className="border-b border-[#E4E0D8] hover:bg-[#F9F8F6]">
                    <td className={`${tdCls} font-bold`}>{p.name}</td>
                    {goals.map(goal => {
                      const linked = hasLink(p.id, goal.id);
                      return (
                        <td key={goal.id} className={`${tdCls} text-center`}>
                          <button
                            type="button"
                            onClick={() => toggleLink(p.id, goal.id)}
                            className={`text-base leading-none transition-opacity ${linked ? 'text-[#1A2744] opacity-100' : 'text-[#7A8699] opacity-70 hover:opacity-100'}`}
                            title={linked ? 'คลิกเพื่อเอาออกจากความสอดคล้อง' : 'คลิกเพื่อกำหนดความสอดคล้อง'}
                          >
                            {linked ? '◉' : '○'}
                          </button>
                        </td>
                      );
                    })}
                    <td className={`${tdCls} text-xs`}>{getPortfolio(p.portfolioId)?.name}</td>
                    <td className={tdCls}><PriorityBadge priority={p.priority} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-[11px] text-[#7A8699] px-3 py-2">◉ = สอดคล้องโดยตรง (คลิกเพื่อสลับ) &nbsp;&nbsp; ○ = ไม่เกี่ยวข้องโดยตรง</div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card className="mt-4 border-[#E4E0D8]">
          <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
            <CardTitle className="text-[15px] font-black text-[#1A2744]">Alignment Editor (ส่วนปรับแก้ไข)</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="text-[11px] font-bold text-[#7A8699] uppercase mb-1">Vision</div>
              <Textarea
                value={visionText}
                onChange={e => setVision(e.target.value)}
                rows={2}
                placeholder="วิสัยทัศน์องค์กร"
                className="text-[13px]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-[11px] font-bold text-[#7A8699] uppercase">Strategic Goals</div>
                <Button size="sm" onClick={addGoal} className="bg-[#1A2744] text-white hover:bg-[#121d33]">+ เพิ่มเป้าหมาย</Button>
              </div>
              <div className="space-y-2">
                {goals.map(g => (
                  <div key={g.id} className="flex gap-2">
                    <Input value={g.name} onChange={e => setGoalName(g.id, e.target.value)} className="text-[13px]" />
                    <Button variant="outline" size="sm" onClick={() => removeGoal(g.id)}>ลบ</Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
