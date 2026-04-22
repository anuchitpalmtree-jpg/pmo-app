'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskForm } from '@/components/pmo/forms/RiskForm';
import { IssueForm } from '@/components/pmo/forms/IssueForm';
import { LEVEL_COLORS } from '@/lib/pmo-utils';
import type { PMOData, Risk, Issue } from '@/types/pmo';

interface RisksIssuesProps {
  data: PMOData;
  onAddRisk: (item: Omit<Risk, 'id'>) => void;
  onUpdateRisk: (id: string, item: Omit<Risk, 'id'>) => void;
  onDeleteRisk: (id: string) => void;
  onAddIssue: (item: Omit<Issue, 'id'>) => void;
  onUpdateIssue: (id: string, item: Omit<Issue, 'id'>) => void;
  onDeleteIssue: (id: string) => void;
}

const LevelBadge = ({ value }: { value: string }) => {
  const colors = LEVEL_COLORS[value as keyof typeof LEVEL_COLORS] ?? LEVEL_COLORS.medium;
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: colors.bg, color: colors.color }}>{value}</span>;
};

const StatusBadge = ({ value, type }: { value: string; type: 'risk' | 'issue' }) => {
  const risk = type === 'risk'
    ? { open: { bg: '#FDECEB', color: '#C93B2E' }, mitigated: { bg: '#FFF3E0', color: '#D48A1A' }, closed: { bg: '#E8F8EE', color: '#2D9F5E' } }[value] ?? { bg: '#E8F8EE', color: '#2D9F5E' }
    : { open: { bg: '#FDECEB', color: '#C93B2E' }, 'in-progress': { bg: '#E3F0FA', color: '#2E86C1' }, resolved: { bg: '#E8F8EE', color: '#2D9F5E' } }[value] ?? { bg: '#E8F8EE', color: '#2D9F5E' };
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={risk}>{value}</span>;
};

export function RisksIssues({ data, onAddRisk, onUpdateRisk, onDeleteRisk, onAddIssue, onUpdateIssue, onDeleteIssue }: RisksIssuesProps) {
  const [tab, setTab] = useState<'risks' | 'issues'>('risks');
  const [modal, setModal] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<Risk | Issue | null>(null);

  const getProject = (id: string) => data.projects.find(p => p.id === id);

  const thCls = 'text-left py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdCls = 'py-2.5 px-3 text-[13px]';

  return (
    <div>
      <div className="text-xl font-black text-[#1A2744] mb-1">Risk & Issues Management</div>
      <div className="text-sm text-[#7A8699] mb-4">จัดการความเสี่ยงและประเด็นปัญหาของโครงการ</div>

      <div className="flex gap-2 mb-4">
        <Button variant={tab === 'risks' ? 'default' : 'outline'} onClick={() => setTab('risks')} className={tab === 'risks' ? 'bg-[#D4382C] text-white hover:bg-[#c03020]' : ''}>
          ⚠️ Risks ({data.risks.length})
        </Button>
        <Button variant={tab === 'issues' ? 'default' : 'outline'} onClick={() => setTab('issues')} className={tab === 'issues' ? 'bg-[#D4382C] text-white hover:bg-[#c03020]' : ''}>
          🐛 Issues ({data.issues.length})
        </Button>
      </div>

      {tab === 'risks' ? (
        <Card className="border-[#E4E0D8]">
          <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8] flex-row items-center justify-between">
            <CardTitle className="text-[15px] font-black text-[#1A2744]">Risk Register</CardTitle>
            <Button size="sm" onClick={() => setModal('add-risk')} className="bg-[#D4382C] text-white hover:bg-[#c03020]">+ เพิ่ม Risk</Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.risks.length === 0 ? (
              <div className="text-center py-10 text-[#7A8699]"><div className="text-4xl mb-2">🛡️</div><div className="text-sm">ไม่มี Risk</div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>{['โครงการ', 'Risk', 'Prob.', 'Impact', 'Owner', 'Status', 'Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.risks.map(r => (
                      <tr key={r.id} className="border-b border-[#E4E0D8] hover:bg-[#F9F8F6]">
                        <td className={`${tdCls} font-semibold text-xs`}>{getProject(r.projectId)?.name || '-'}</td>
                        <td className={tdCls}>{r.title}</td>
                        <td className={tdCls}><LevelBadge value={r.probability} /></td>
                        <td className={tdCls}><LevelBadge value={r.impact} /></td>
                        <td className={`${tdCls} text-xs`}>{r.owner}</td>
                        <td className={tdCls}><StatusBadge value={r.status} type="risk" /></td>
                        <td className={tdCls}>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => { setEditItem(r); setModal('edit-risk'); }}>✏️</Button>
                            <Button variant="outline" size="sm" onClick={() => { if (confirm('ต้องการลบ?')) onDeleteRisk(r.id); }}>🗑️</Button>
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
      ) : (
        <Card className="border-[#E4E0D8]">
          <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8] flex-row items-center justify-between">
            <CardTitle className="text-[15px] font-black text-[#1A2744]">Issue Log</CardTitle>
            <Button size="sm" onClick={() => setModal('add-issue')} className="bg-[#D4382C] text-white hover:bg-[#c03020]">+ เพิ่ม Issue</Button>
          </CardHeader>
          <CardContent className="p-0">
            {data.issues.length === 0 ? (
              <div className="text-center py-10 text-[#7A8699]"><div className="text-4xl mb-2">✅</div><div className="text-sm">ไม่มี Issue</div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>{['โครงการ', 'Issue', 'Severity', 'Assignee', 'Status', 'Resolution', 'Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.issues.map(i => (
                      <tr key={i.id} className="border-b border-[#E4E0D8] hover:bg-[#F9F8F6]">
                        <td className={`${tdCls} font-semibold text-xs`}>{getProject(i.projectId)?.name || '-'}</td>
                        <td className={tdCls}>{i.title}</td>
                        <td className={tdCls}><LevelBadge value={i.severity} /></td>
                        <td className={`${tdCls} text-xs`}>{i.assignee}</td>
                        <td className={tdCls}><StatusBadge value={i.status} type="issue" /></td>
                        <td className={`${tdCls} text-xs max-w-[200px] truncate`}>{i.resolution || '-'}</td>
                        <td className={tdCls}>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => { setEditItem(i); setModal('edit-issue'); }}>✏️</Button>
                            <Button variant="outline" size="sm" onClick={() => { if (confirm('ต้องการลบ?')) onDeleteIssue(i.id); }}>🗑️</Button>
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
      )}

      <Dialog open={modal === 'add-risk'} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>เพิ่ม Risk ใหม่</DialogTitle></DialogHeader>
          <RiskForm projects={data.projects} onSave={f => { onAddRisk(f); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit-risk'} onOpenChange={open => { if (!open) { setModal(null); setEditItem(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>แก้ไข Risk</DialogTitle></DialogHeader>
          {editItem && (
            <RiskForm item={editItem as Risk} projects={data.projects}
              onSave={f => { onUpdateRisk(editItem.id, f as Omit<Risk, 'id'>); setModal(null); setEditItem(null); }}
              onCancel={() => { setModal(null); setEditItem(null); }} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'add-issue'} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>เพิ่ม Issue ใหม่</DialogTitle></DialogHeader>
          <IssueForm projects={data.projects} onSave={f => { onAddIssue(f); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit-issue'} onOpenChange={open => { if (!open) { setModal(null); setEditItem(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>แก้ไข Issue</DialogTitle></DialogHeader>
          {editItem && (
            <IssueForm item={editItem as Issue} projects={data.projects}
              onSave={f => { onUpdateIssue(editItem.id, f as Omit<Issue, 'id'>); setModal(null); setEditItem(null); }}
              onCancel={() => { setModal(null); setEditItem(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
