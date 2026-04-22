'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/pmo/StatusBadge';
import { MilestoneForm } from '@/components/pmo/forms/MilestoneForm';
import { thaiDate } from '@/lib/pmo-utils';
import type { PMOData, Milestone } from '@/types/pmo';

interface MilestonesTabProps {
  data: PMOData;
  onAdd: (item: Omit<Milestone, 'id'>) => void;
  onUpdate: (id: string, item: Omit<Milestone, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function MilestonesTab({ data, onAdd, onUpdate, onDelete }: MilestonesTabProps) {
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<Milestone | null>(null);

  const getProject = (id: string) => data.projects.find(p => p.id === id);
  const sorted = [...data.milestones].sort((a, b) => a.dueDate > b.dueDate ? 1 : -1);

  const thCls = 'text-left py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdCls = 'py-2.5 px-3 text-[13px]';

  const milestoneStatusMap = (status: Milestone['status']) => {
    if (status === 'delayed') return 'critical';
    if (status === 'pending') return 'at-risk';
    return status as Parameters<typeof StatusBadge>[0]['status'];
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="text-xl font-black text-[#1A2744]">Milestones Tracker</div>
          <div className="text-sm text-[#7A8699]">ติดตาม Milestone ของทุกโครงการ</div>
        </div>
        <Button onClick={() => setModal('add')} className="bg-[#D4382C] text-white hover:bg-[#c03020]">+ เพิ่ม Milestone</Button>
      </div>

      <Card className="border-[#E4E0D8]">
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <div className="text-center py-16 text-[#7A8699]"><div className="text-4xl mb-2">🏁</div><div className="text-sm">ไม่มี Milestone</div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>{['กำหนด', 'โครงการ', 'Milestone', 'สถานะ', 'Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {sorted.map(m => (
                    <tr key={m.id} className="border-b border-[#E4E0D8] hover:bg-[#F9F8F6]">
                      <td className={`${tdCls} font-mono text-xs font-semibold`}>{thaiDate(m.dueDate)}</td>
                      <td className={`${tdCls} font-semibold`}>{getProject(m.projectId)?.name || '-'}</td>
                      <td className={tdCls}>{m.title}</td>
                      <td className={tdCls}><StatusBadge status={milestoneStatusMap(m.status)} /></td>
                      <td className={tdCls}>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => { setEditItem(m); setModal('edit'); }}>✏️</Button>
                          <Button variant="outline" size="sm" onClick={() => { if (confirm('ต้องการลบ?')) onDelete(m.id); }}>🗑️</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modal === 'add'} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>เพิ่ม Milestone</DialogTitle></DialogHeader>
          <MilestoneForm projects={data.projects} onSave={f => { onAdd(f); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit' && !!editItem} onOpenChange={open => { if (!open) { setModal(null); setEditItem(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>แก้ไข Milestone</DialogTitle></DialogHeader>
          {editItem && (
            <MilestoneForm item={editItem} projects={data.projects}
              onSave={f => { onUpdate(editItem.id, f); setModal(null); setEditItem(null); }}
              onCancel={() => { setModal(null); setEditItem(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
