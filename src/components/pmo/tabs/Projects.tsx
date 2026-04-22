'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge, PriorityBadge } from '@/components/pmo/StatusBadge';
import { ProgressBar } from '@/components/pmo/ProgressBar';
import { ProjectForm } from '@/components/pmo/forms/ProjectForm';
import { thaiDate, uid } from '@/lib/pmo-utils';
import type { PMOData, Project } from '@/types/pmo';

interface ProjectsProps {
  data: PMOData;
  onAdd: (item: Omit<Project, 'id'>) => void;
  onUpdate: (id: string, item: Omit<Project, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function Projects({ data, onAdd, onUpdate, onDelete }: ProjectsProps) {
  const [filter, setFilter] = useState({ status: '', portfolio: '', search: '' });
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editItem, setEditItem] = useState<Project | null>(null);

  const filtered = data.projects.filter(p => {
    if (filter.status && p.status !== filter.status) return false;
    if (filter.portfolio && p.portfolioId !== filter.portfolio) return false;
    if (filter.search && !p.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const getPortfolio = (id: string) => data.portfolios.find(p => p.id === id);
  const getProgram = (id: string) => data.programs.find(p => p.id === id);

  const inputCls = 'px-3.5 py-2 rounded-lg border border-[#E4E0D8] text-[13px] font-[inherit] bg-white text-[#1A2744]';

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <div className="text-xl font-black text-[#1A2744]">จัดการโครงการ</div>
          <div className="text-sm text-[#7A8699]">{data.projects.length} โครงการทั้งหมด</div>
        </div>
        <Button onClick={() => setModal('add')} className="bg-[#D4382C] text-white hover:bg-[#c03020]">+ เพิ่มโครงการใหม่</Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="🔍 ค้นหาโครงการ..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          className={`${inputCls} min-w-[200px]`}
        />
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className={inputCls}>
          <option value="">ทุกสถานะ</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="critical">Critical</option>
          <option value="completed">Completed</option>
          <option value="planning">Planning</option>
        </select>
        <select value={filter.portfolio} onChange={e => setFilter(f => ({ ...f, portfolio: e.target.value }))} className={inputCls}>
          <option value="">ทุก Portfolio</option>
          {data.portfolios.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#7A8699] bg-white rounded-xl border border-[#E4E0D8]">
          <div className="text-4xl mb-2">📂</div><div className="text-sm">ไม่พบโครงการ</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => {
            const pf = getPortfolio(p.portfolioId);
            const pg = getProgram(p.programId);
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-[#E4E0D8] p-4 transition-shadow duration-150 hover:shadow-md"
                style={{ borderLeft: `4px solid ${pf?.color || '#E4E0D8'}` }}
              >
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-black text-[#1A2744]">{p.name}</span>
                      <PriorityBadge priority={p.priority} />
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="text-xs text-[#7A8699] mb-2">
                      {pf?.icon} {pf?.name} → {pg?.name} · PM: {p.pm} · {thaiDate(p.startDate)} — {thaiDate(p.endDate)}
                    </div>
                    {p.description && <div className="text-xs text-[#7A8699]">{p.description}</div>}
                  </div>
                  <div className="flex gap-4 items-center flex-wrap">
                    <div className="min-w-[140px]">
                      <div className="text-[11px] text-[#7A8699] mb-1">ความคืบหน้า</div>
                      <ProgressBar value={p.progress} color={p.status === 'critical' ? '#C93B2E' : p.status === 'at-risk' ? '#D48A1A' : '#2D9F5E'} />
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-[#7A8699]">งบ</div>
                      <div className="font-mono text-[13px] font-bold">{p.spent}/{p.budget} <span className="text-[10px] font-normal">ลบ.</span></div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-[#7A8699]">SPI</div>
                      <div className={`font-mono text-sm font-bold ${p.spi < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{p.spi}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-[#7A8699]">CPI</div>
                      <div className={`font-mono text-sm font-bold ${p.cpi < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{p.cpi}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => { setEditItem(p); setModal('edit'); }}>✏️</Button>
                      <Button variant="outline" size="sm" onClick={() => { if (confirm('ต้องการลบรายการนี้?')) onDelete(p.id); }}>🗑️</Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modal === 'add'} onOpenChange={open => !open && setModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>เพิ่มโครงการใหม่</DialogTitle></DialogHeader>
          <ProjectForm portfolios={data.portfolios} programs={data.programs} onSave={f => { onAdd(f); setModal(null); }} onCancel={() => setModal(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit' && !!editItem} onOpenChange={open => { if (!open) { setModal(null); setEditItem(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>แก้ไขโครงการ</DialogTitle></DialogHeader>
          {editItem && (
            <ProjectForm item={editItem} portfolios={data.portfolios} programs={data.programs}
              onSave={f => { onUpdate(editItem.id, f); setModal(null); setEditItem(null); }}
              onCancel={() => { setModal(null); setEditItem(null); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
