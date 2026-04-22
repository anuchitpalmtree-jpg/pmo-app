'use client';

import { KpiCard } from '@/components/pmo/KpiCard';
import { StatusBadge } from '@/components/pmo/StatusBadge';
import { ProgressBar } from '@/components/pmo/ProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PMOData, PMOStats } from '@/types/pmo';

interface DashboardProps {
  data: PMOData;
  stats: PMOStats;
}

export function Dashboard({ data, stats }: DashboardProps) {
  const getProject = (id: string) => data.projects.find(p => p.id === id);

  const portfolioStats = data.portfolios.map(pf => {
    const projs = data.projects.filter(p => p.portfolioId === pf.id);
    const budget = projs.reduce((s, p) => s + (p.budget || 0), 0);
    const spent = projs.reduce((s, p) => s + (p.spent || 0), 0);
    const avgProg = projs.length ? Math.round(projs.reduce((s, p) => s + (p.progress || 0), 0) / projs.length) : 0;
    const avgSPI = projs.length ? (projs.reduce((s, p) => s + (p.spi || 0), 0) / projs.length).toFixed(2) : '-';
    const avgCPI = projs.length ? (projs.reduce((s, p) => s + (p.cpi || 0), 0) / projs.length).toFixed(2) : '-';
    const worst = projs.reduce<string>((w, p) => {
      const rank: Record<string, number> = { critical: 3, 'at-risk': 2, 'on-track': 1, completed: 0, planning: 0 };
      return (rank[p.status] || 0) > (rank[w] || 0) ? p.status : w;
    }, 'on-track');
    return { ...pf, count: projs.length, budget, spent, avgProg, avgSPI, avgCPI, status: worst };
  });

  const criticalProjects = data.projects
    .filter(p => p.status === 'critical' || p.status === 'at-risk')
    .sort((a, b) => (a.status === 'critical' ? 0 : 1) - (b.status === 'critical' ? 0 : 1));

  const openRisks = data.risks.filter(r => r.status === 'open');
  const openIssues = data.issues.filter(i => i.status !== 'resolved');

  const thColClass = 'text-left py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdClass = 'py-3 px-3';

  return (
    <div>
      <div className="mb-5">
        <div className="text-xl font-black text-[#1A2744]">Executive Dashboard</div>
        <div className="text-sm text-[#7A8699]">
          ภาพรวมสถานะโครงการทั้งหมด — อัปเดต {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        <KpiCard label="โครงการทั้งหมด" value={stats.total} sub={`${stats.byStatus?.['on-track'] || 0} on track`} borderColor="#2E86C1" />
        <KpiCard label="On Track" value={stats.byStatus?.['on-track'] || 0} sub={`${stats.total ? Math.round(((stats.byStatus?.['on-track'] || 0) / stats.total) * 100) : 0}%`} borderColor="#2D9F5E" />
        <KpiCard label="At Risk" value={stats.byStatus?.['at-risk'] || 0} borderColor="#D48A1A" />
        <KpiCard label="Critical" value={stats.byStatus?.['critical'] || 0} borderColor="#C93B2E" />
        <KpiCard label="งบรวม (ลบ.)" value={stats.totalBudget} sub={`เบิกจ่าย ${stats.disbursement}%`} borderColor="#C4963A" />
        <KpiCard label="SPI เฉลี่ย" value={stats.avgSPI} sub={Number(stats.avgSPI) < 0.9 ? '⚠️ ต่ำกว่าเกณฑ์' : '✅ ปกติ'} borderColor={Number(stats.avgSPI) < 0.9 ? '#D48A1A' : '#2D9F5E'} />
        <KpiCard label="CPI เฉลี่ย" value={stats.avgCPI} sub={Number(stats.avgCPI) < 0.9 ? '⚠️ เกินงบ' : '✅ ปกติ'} borderColor={Number(stats.avgCPI) < 0.9 ? '#C93B2E' : '#2D9F5E'} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div>
          <Card className="mb-4 border-[#E4E0D8]">
            <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[15px] font-black text-[#1A2744]">สถานะแยกตาม Portfolio</CardTitle>
                <Badge variant="secondary">{data.portfolios.length} Portfolios</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {['Portfolio', 'โครงการ', 'ความคืบหน้า', 'งบ (ลบ.)', 'SPI', 'CPI', 'สถานะ'].map(h => (
                      <th key={h} className={thColClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolioStats.map(pf => (
                    <tr key={pf.id} className="border-b border-[#E4E0D8]">
                      <td className={`${tdClass} font-bold`}>{pf.icon} {pf.name}</td>
                      <td className={tdClass}>{pf.count}</td>
                      <td className={`${tdClass} min-w-[120px]`}><ProgressBar value={pf.avgProg} color={pf.color} /></td>
                      <td className={`${tdClass} font-mono text-xs`}>{pf.budget}</td>
                      <td className={`${tdClass} font-mono text-xs ${Number(pf.avgSPI) < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{pf.avgSPI}</td>
                      <td className={`${tdClass} font-mono text-xs ${Number(pf.avgCPI) < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{pf.avgCPI}</td>
                      <td className={tdClass}><StatusBadge status={pf.status as Parameters<typeof StatusBadge>[0]['status']} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="border-[#E4E0D8]">
            <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[15px] font-black text-[#1A2744]">โครงการที่ต้องเฝ้าระวัง</CardTitle>
                <Badge variant="secondary">{criticalProjects.length} โครงการ</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {criticalProjects.length === 0 ? (
                <div className="text-center py-10 text-[#7A8699]"><div className="text-4xl mb-2">✅</div><div className="text-sm">ไม่มีโครงการ Critical/At-Risk</div></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>{['โครงการ', 'PM', 'Progress', 'SPI', 'CPI', 'สถานะ', 'Priority'].map(h => <th key={h} className={thColClass}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {criticalProjects.map(p => (
                        <tr key={p.id} className="border-b border-[#E4E0D8]">
                          <td className={`${tdClass} font-bold`}>{p.name}</td>
                          <td className={`${tdClass} text-xs`}>{p.pm}</td>
                          <td className={`${tdClass} min-w-[100px]`}><ProgressBar value={p.progress} color={p.status === 'critical' ? '#C93B2E' : '#D48A1A'} /></td>
                          <td className={`${tdClass} font-mono text-xs ${p.spi < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{p.spi}</td>
                          <td className={`${tdClass} font-mono text-xs ${p.cpi < 0.9 ? 'text-[#C93B2E]' : 'text-[#2D9F5E]'}`}>{p.cpi}</td>
                          <td className={tdClass}><StatusBadge status={p.status} /></td>
                          <td className={tdClass}><span className={`font-mono font-black text-xs ${p.priority === 'P1' ? 'text-[#C93B2E]' : p.priority === 'P2' ? 'text-[#D48A1A]' : 'text-[#2E86C1]'}`}>{p.priority}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4 border-[#E4E0D8]">
            <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[15px] font-black text-[#1A2744]">Open Risks</CardTitle>
                <Badge variant="secondary">{openRisks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-2">
              {openRisks.length === 0 ? (
                <div className="text-center py-8 text-[#7A8699]"><div className="text-3xl mb-1">🛡️</div><div className="text-sm">ไม่มี Risk ที่เปิดอยู่</div></div>
              ) : openRisks.slice(0, 6).map(r => (
                <div key={r.id} className="flex gap-2.5 py-2.5 border-b border-[#E4E0D8] last:border-0 items-start">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${r.impact === 'high' ? 'bg-[#C93B2E]' : r.impact === 'medium' ? 'bg-[#D48A1A]' : 'bg-[#2D9F5E]'}`} />
                  <div>
                    <div className="text-[13px] font-semibold">{r.title}</div>
                    <div className="text-[11px] text-[#7A8699]">{getProject(r.projectId)?.name} · {r.owner}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-[#E4E0D8]">
            <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
              <div className="flex items-center gap-2">
                <CardTitle className="text-[15px] font-black text-[#1A2744]">Open Issues</CardTitle>
                <Badge variant="secondary">{openIssues.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-2">
              {openIssues.length === 0 ? (
                <div className="text-center py-8 text-[#7A8699]"><div className="text-3xl mb-1">✅</div><div className="text-sm">ไม่มี Issue ที่เปิดอยู่</div></div>
              ) : openIssues.slice(0, 6).map(i => (
                <div key={i.id} className="flex gap-2.5 py-2.5 border-b border-[#E4E0D8] last:border-0 items-start">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${i.severity === 'high' ? 'bg-[#C93B2E]' : i.severity === 'medium' ? 'bg-[#D48A1A]' : 'bg-[#2D9F5E]'}`} />
                  <div>
                    <div className="text-[13px] font-semibold">{i.title}</div>
                    <div className="text-[11px] text-[#7A8699]">{getProject(i.projectId)?.name} · {i.assignee} · <span className={i.status === 'in-progress' ? 'text-[#2E86C1]' : 'text-[#7A8699]'}>{i.status}</span></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
