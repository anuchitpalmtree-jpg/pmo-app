'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/pmo/tabs/Dashboard';
import { Projects } from '@/components/pmo/tabs/Projects';
import { RisksIssues } from '@/components/pmo/tabs/RisksIssues';
import { MilestonesTab } from '@/components/pmo/tabs/MilestonesTab';
import { Weekly } from '@/components/pmo/tabs/Weekly';
import { Alignment } from '@/components/pmo/tabs/Alignment';
import { DataManager } from '@/components/pmo/tabs/DataManager';
import { storageGet, storageSet } from '@/lib/storage';
import { DEFAULT_PMO_DATA } from '@/data/seeds';
import { uid, weekNum } from '@/lib/pmo-utils';
import type { PMOData, PMOStats, Project, Risk, Issue, Milestone, WeeklyNote } from '@/types/pmo';

export default function Page() {
  const [data, setData] = useState<PMOData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let d = await storageGet();
      if (!d) {
        d = DEFAULT_PMO_DATA;
        await storageSet(d);
      }
      setData(d);
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (newData: PMOData) => {
    setData(newData);
    await storageSet(newData);
  }, []);

  const update = useCallback(<K extends keyof PMOData>(key: K, items: PMOData[K]) => {
    if (!data) return;
    save({ ...data, [key]: items });
  }, [data, save]);

  const stats = useMemo<PMOStats>(() => {
    if (!data) return { total: 0, totalBudget: 0, totalSpent: 0, avgSPI: '0', avgCPI: '0', byStatus: {}, disbursement: 0 };
    const ps = data.projects;
    const totalBudget = ps.reduce((s, p) => s + (p.budget || 0), 0);
    const totalSpent = ps.reduce((s, p) => s + (p.spent || 0), 0);
    const avgSPI = ps.length ? (ps.reduce((s, p) => s + (p.spi || 0), 0) / ps.length).toFixed(2) : '0';
    const avgCPI = ps.length ? (ps.reduce((s, p) => s + (p.cpi || 0), 0) / ps.length).toFixed(2) : '0';
    const byStatus: Record<string, number> = {};
    ps.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    return { total: ps.length, totalBudget, totalSpent, avgSPI, avgCPI, byStatus, disbursement: totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0 };
  }, [data]);

  const addItem = <K extends keyof PMOData>(key: K, item: Omit<PMOData[K][number], 'id'>) => {
    if (!data) return;
    update(key, [...data[key], { ...item, id: uid() }] as PMOData[K]);
  };

  const updateItem = <K extends keyof PMOData>(key: K, id: string, item: Omit<PMOData[K][number], 'id'>) => {
    if (!data) return;
    update(key, (data[key] as Array<{ id: string }>).map(x => x.id === id ? { ...x, ...item } : x) as PMOData[K]);
  };

  const deleteItem = <K extends keyof PMOData>(key: K, id: string) => {
    if (!data) return;
    update(key, (data[key] as Array<{ id: string }>).filter(x => x.id !== id) as PMOData[K]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0EDE6]">
        <div className="text-center">
          <div className="text-5xl mb-3">📮</div>
          <div className="text-lg font-bold text-[#1A2744]">กำลังโหลด PMO Dashboard...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F0EDE6] text-[#1A2744]">
      {/* Top Bar */}
      <div className="bg-[#1A2744] text-white px-6 h-14 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4382C] rounded-lg flex items-center justify-center font-black text-sm tracking-tight">TH</div>
          <div>
            <div className="font-bold text-[15px]">ไปรษณีย์ไทย — PMO</div>
            <div className="text-[10px] opacity-60 tracking-widest">PROJECT MANAGEMENT OFFICE</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="opacity-70">📅 Wk{weekNum()}/{new Date().getFullYear() + 543}</span>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full justify-start rounded-none bg-white border-b border-[#E4E0D8] h-auto px-0 overflow-x-auto">
          {[
            { value: 'dashboard', icon: '📊', label: 'Dashboard' },
            { value: 'projects', icon: '📁', label: 'โครงการ' },
            { value: 'risks', icon: '⚠️', label: 'Risk & Issues' },
            { value: 'milestones', icon: '🏁', label: 'Milestones' },
            { value: 'weekly', icon: '📋', label: 'รายงานสัปดาห์' },
            { value: 'alignment', icon: '🎯', label: 'Alignment' },
            { value: 'data-manager', icon: '🧪', label: 'Manage Data' },
          ].map(t => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#D4382C] data-[state=active]:bg-transparent data-[state=active]:text-[#1A2744] data-[state=active]:font-extrabold text-[#7A8699] font-medium px-5 py-3.5 text-[13px] whitespace-nowrap transition-all"
            >
              {t.icon} {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="max-w-[1400px] mx-auto px-6 py-5 pb-16">
          <TabsContent value="dashboard" className="mt-0">
            <Dashboard data={data} stats={stats} />
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <Projects
              data={data}
              onAdd={f => addItem('projects', f as Omit<Project, 'id'>)}
              onUpdate={(id, f) => updateItem('projects', id, f as Omit<Project, 'id'>)}
              onDelete={id => deleteItem('projects', id)}
            />
          </TabsContent>

          <TabsContent value="risks" className="mt-0">
            <RisksIssues
              data={data}
              onAddRisk={f => addItem('risks', f)}
              onUpdateRisk={(id, f) => updateItem('risks', id, f)}
              onDeleteRisk={id => deleteItem('risks', id)}
              onAddIssue={f => addItem('issues', f)}
              onUpdateIssue={(id, f) => updateItem('issues', id, f)}
              onDeleteIssue={id => deleteItem('issues', id)}
            />
          </TabsContent>

          <TabsContent value="milestones" className="mt-0">
            <MilestonesTab
              data={data}
              onAdd={f => addItem('milestones', f)}
              onUpdate={(id, f) => updateItem('milestones', id, f)}
              onDelete={id => deleteItem('milestones', id)}
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <Weekly
              data={data}
              stats={stats}
              onSaveNote={notes => update('weeklyNotes', notes)}
            />
          </TabsContent>

          <TabsContent value="alignment" className="mt-0">
            <Alignment data={data} />
          </TabsContent>

          <TabsContent value="data-manager" className="mt-0">
            <DataManager data={data} onReplace={update} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
