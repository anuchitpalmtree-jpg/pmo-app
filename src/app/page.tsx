'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/pmo/tabs/Dashboard';
import { Projects } from '@/components/pmo/tabs/Projects';
import { RisksIssues } from '@/components/pmo/tabs/RisksIssues';
import { MilestonesTab } from '@/components/pmo/tabs/MilestonesTab';
import { Weekly } from '@/components/pmo/tabs/Weekly';
import { Alignment } from '@/components/pmo/tabs/Alignment';
import { DataManager } from '@/components/pmo/tabs/DataManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { storageGet, storageSet } from '@/lib/storage';
import { validateEditCredential } from '@/lib/edit-auth';
import {
  DEFAULT_PMO_DATA,
  ALIGNMENT_SETTINGS_SEED,
  STRATEGIC_GOALS_SEED,
  PROJECT_GOAL_ALIGNMENTS_SEED,
} from '@/data/seeds';
import { calculateProjectMetrics, uid, weekNum } from '@/lib/pmo-utils';
import type { PMOData, PMOStats, Project, Risk, Issue, Milestone, WeeklyNote } from '@/types/pmo';

export default function Page() {
  const [data, setData] = useState<PMOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const normalizeProjectFields = useCallback((project: Omit<Project, 'id'>): Omit<Project, 'id'> => {
    const targetProgress = typeof project.targetProgress === 'number' ? project.targetProgress : project.progress;
    const metrics = calculateProjectMetrics({ ...project, targetProgress });
    return {
      ...project,
      targetProgress,
      previousWeekProgress: typeof project.previousWeekProgress === 'number' ? project.previousWeekProgress : project.progress,
      weeklyProgressSummary: project.weeklyProgressSummary ?? '',
      currentStageStatus: project.currentStageStatus ?? '',
      blockersAndMitigation: project.blockersAndMitigation ?? '',
      executiveSupportNeeded: project.executiveSupportNeeded ?? '',
      requiredActions: project.requiredActions ?? '',
      managementConsiderations: project.managementConsiderations ?? '',
      spi: metrics.spi ?? 0,
      cpi: metrics.cpi ?? 0,
      status: metrics.autoStatus,
    };
  }, []);

  const normalizeProject = useCallback((project: Project): Project => {
    const normalized = normalizeProjectFields(project);
    return { ...normalized, id: project.id };
  }, [normalizeProjectFields]);

  useEffect(() => {
    (async () => {
      let d = await storageGet();
      if (!d) {
        d = {
          ...DEFAULT_PMO_DATA,
          projects: DEFAULT_PMO_DATA.projects.map(normalizeProject),
        };
        await storageSet(d);
      } else {
        const needsAlignmentSettings = !Array.isArray(d.alignmentSettings);
        const needsStrategicGoals = !Array.isArray(d.strategicGoals);
        const needsProjectGoalAlignments = !Array.isArray(d.projectGoalAlignments);
        const normalizedProjects = d.projects.map((project: Project) => normalizeProject(project));
        const needsProjectNormalization = JSON.stringify(normalizedProjects) !== JSON.stringify(d.projects);

        if (needsAlignmentSettings || needsStrategicGoals || needsProjectGoalAlignments || needsProjectNormalization) {
          d = {
            ...d,
            alignmentSettings: needsAlignmentSettings ? ALIGNMENT_SETTINGS_SEED : d.alignmentSettings,
            strategicGoals: needsStrategicGoals ? STRATEGIC_GOALS_SEED : d.strategicGoals,
            projectGoalAlignments: needsProjectGoalAlignments ? PROJECT_GOAL_ALIGNMENTS_SEED : d.projectGoalAlignments,
            projects: normalizedProjects,
          };
          await storageSet(d);
        }
      }
      setData(d);
      setLoading(false);
    })();
  }, [normalizeProject]);

  const save = useCallback(async (newData: PMOData) => {
    setData(newData);
    await storageSet(newData);
  }, []);

  const update = useCallback(<K extends keyof PMOData>(key: K, items: PMOData[K]) => {
    if (!data || !isEditMode) return;
    save({ ...data, [key]: items });
  }, [data, isEditMode, save]);

  const stats = useMemo<PMOStats>(() => {
    if (!data) return { total: 0, totalBudget: 0, totalSpent: 0, avgSPI: '0', avgCPI: '0', byStatus: {}, disbursement: 0 };
    const ps = data.projects;
    const totalBudget = ps.reduce((s, p) => s + (p.budget || 0), 0);
    const totalSpent = ps.reduce((s, p) => s + (p.spent || 0), 0);
    const calculated = ps.map(project => calculateProjectMetrics(project));
    const validSpi = calculated.map(m => m.spi).filter((v): v is number => v !== null);
    const validCpi = calculated.map(m => m.cpi).filter((v): v is number => v !== null);
    const avgSPI = validSpi.length ? (validSpi.reduce((s, value) => s + value, 0) / validSpi.length).toFixed(2) : '0';
    const avgCPI = validCpi.length ? (validCpi.reduce((s, value) => s + value, 0) / validCpi.length).toFixed(2) : '0';
    const byStatus: Record<string, number> = {};
    ps.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    return { total: ps.length, totalBudget, totalSpent, avgSPI, avgCPI, byStatus, disbursement: totalBudget ? Math.round(totalSpent / totalBudget * 100) : 0 };
  }, [data]);

  const addItem = <K extends keyof PMOData>(key: K, item: Omit<PMOData[K][number], 'id'>) => {
    if (!data || !isEditMode) return;
    if (key === 'projects') {
      const normalizedItem = normalizeProjectFields(item as Omit<Project, 'id'>);
      update(key, [...data[key], { ...normalizedItem, id: uid() }] as PMOData[K]);
      return;
    }
    update(key, [...data[key], { ...item, id: uid() }] as PMOData[K]);
  };

  const updateItem = <K extends keyof PMOData>(key: K, id: string, item: Omit<PMOData[K][number], 'id'>) => {
    if (!data || !isEditMode) return;
    if (key === 'projects') {
      update(
        key,
        (data[key] as Project[]).map(project => {
          if (project.id !== id) return project;
          return normalizeProject({ ...project, ...(item as Omit<Project, 'id'>) });
        }) as PMOData[K],
      );
      return;
    }
    update(key, (data[key] as Array<{ id: string }>).map(x => x.id === id ? { ...x, ...item } : x) as PMOData[K]);
  };

  const deleteItem = <K extends keyof PMOData>(key: K, id: string) => {
    if (!data || !isEditMode) return;
    update(key, (data[key] as Array<{ id: string }>).filter(x => x.id !== id) as PMOData[K]);
  };

  const handleLogOn = () => {
    if (validateEditCredential(username.trim(), password)) {
      setIsEditMode(true);
      setAuthOpen(false);
      setAuthError('');
      setPassword('');
      return;
    }
    setAuthError('Username หรือ Password ไม่ถูกต้อง');
  };

  const handleLogOff = () => {
    setIsEditMode(false);
    setUsername('');
    setPassword('');
    setAuthError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F0EDE6]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-20 w-44 overflow-hidden rounded-md bg-white/70 ring-1 ring-[#1A2744]/10">
            <Image
              src="/logo.png"
              alt="Thailand Post logo"
              width={1700}
              height={760}
              className="h-full w-full object-contain"
              priority
            />
          </div>
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
          <div className="h-10 w-28 overflow-hidden rounded-md bg-white/92 px-1 ring-1 ring-white/20">
            <Image
              src="/logo.png"
              alt="Thailand Post logo"
              width={1700}
              height={760}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-bold text-[15px]">ไปรษณีย์ไทย — PMO</div>
            <div className="text-[10px] opacity-60 tracking-widest">PROJECT MANAGEMENT OFFICE</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className={`px-2 py-1 rounded-md font-semibold ${isEditMode ? 'bg-[#2D9F5E] text-white' : 'bg-white/20 text-white'}`}>
            {isEditMode ? 'Edit Mode' : 'View Only'}
          </span>
          {isEditMode ? (
            <Button size="sm" variant="secondary" className="h-8 px-3" onClick={handleLogOff}>Log off</Button>
          ) : (
            <Button size="sm" className="h-8 px-3 bg-[#D4382C] text-white hover:bg-[#c03020]" onClick={() => setAuthOpen(true)}>Log on</Button>
          )}
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
              canEdit={isEditMode}
              onAdd={f => addItem('projects', f as Omit<Project, 'id'>)}
              onUpdate={(id, f) => updateItem('projects', id, f as Omit<Project, 'id'>)}
              onDelete={id => deleteItem('projects', id)}
            />
          </TabsContent>

          <TabsContent value="risks" className="mt-0">
            <RisksIssues
              data={data}
              canEdit={isEditMode}
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
              canEdit={isEditMode}
              onAdd={f => addItem('milestones', f)}
              onUpdate={(id, f) => updateItem('milestones', id, f)}
              onDelete={id => deleteItem('milestones', id)}
            />
          </TabsContent>

          <TabsContent value="weekly" className="mt-0">
            <Weekly
              data={data}
              stats={stats}
              canEdit={isEditMode}
              onSaveNote={notes => update('weeklyNotes', notes)}
            />
          </TabsContent>

          <TabsContent value="alignment" className="mt-0">
            <Alignment data={data} canEdit={isEditMode} onReplace={update} />
          </TabsContent>

          <TabsContent value="data-manager" className="mt-0">
            <DataManager data={data} canEdit={isEditMode} onReplace={update} />
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Log on เพื่อแก้ไขข้อมูล</DialogTitle>
            <DialogDescription>ระบบอยู่ใน View Only จนกว่าจะเข้าสู่ Edit Mode</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleLogOn();
                }}
              />
            </div>
            {authError && <p className="text-xs text-red-600">{authError}</p>}
            <Button onClick={handleLogOn} className="w-full bg-[#1A2744] text-white hover:bg-[#121d33]">Log on</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
