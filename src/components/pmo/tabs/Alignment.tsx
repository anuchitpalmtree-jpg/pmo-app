'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityBadge } from '@/components/pmo/StatusBadge';
import type { PMOData } from '@/types/pmo';

interface AlignmentProps {
  data: PMOData;
}

export function Alignment({ data }: AlignmentProps) {
  const getPortfolio = (id: string) => data.portfolios.find(p => p.id === id);

  const thCls = 'py-2.5 px-3 text-[11px] font-bold text-[#7A8699] uppercase border-b-2 border-[#E4E0D8] bg-[#F0EDE6]';
  const tdCls = 'py-2.5 px-3 text-[13px]';

  return (
    <div>
      <div className="text-xl font-black text-[#1A2744] mb-1">🎯 Project Alignment</div>
      <div className="text-sm text-[#7A8699] mb-5">ความสอดคล้องของโครงการกับยุทธศาสตร์องค์กร</div>

      <Card className="mb-4 border-[#E4E0D8]">
        <CardHeader className="py-3.5 px-5 border-b border-[#E4E0D8]">
          <CardTitle className="text-[15px] font-black text-[#1A2744]">Strategy Cascade — Portfolio → Program → Project</CardTitle>
        </CardHeader>
        <CardContent className="p-5 text-center">
          <div className="inline-block bg-[#1A2744] text-white px-8 py-3 rounded-xl text-[13px] font-bold mb-3">
            🏛️ วิสัยทัศน์: ผู้นำโลจิสติกส์และบริการไปรษณีย์ดิจิทัลของอาเซียน
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
          <CardTitle className="text-[15px] font-black text-[#1A2744]">Alignment Matrix — โครงการ vs เป้าหมายยุทธศาสตร์</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr>
                {['โครงการ', 'เพิ่มรายได้', 'ลดต้นทุน', 'ยกระดับบริการ', 'Digital First', 'พัฒนาคน', 'ESG', 'Portfolio', 'Priority'].map((h, i) => (
                  <th key={h} className={`${thCls} ${i === 0 || i === 7 ? 'text-left' : 'text-center'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.projects.map(p => {
                const align = {
                  revenue: ['p1', 'p2', 'p4', 'p7'].includes(p.id),
                  cost: ['p1', 'p3', 'p4', 'p5', 'p6'].includes(p.id),
                  service: ['p1', 'p2', 'p3', 'p4', 'p7'].includes(p.id),
                  digital: ['p1', 'p2', 'p3', 'p5', 'p6', 'p7'].includes(p.id),
                  people: ['p6', 'p8'].includes(p.id),
                  esg: ['p3', 'p4', 'p5'].includes(p.id),
                };
                return (
                  <tr key={p.id} className="border-b border-[#E4E0D8] hover:bg-[#F9F8F6]">
                    <td className={`${tdCls} font-bold`}>{p.name}</td>
                    {Object.values(align).map((v, i) => (
                      <td key={i} className={`${tdCls} text-center text-base`}>{v ? '◉' : '○'}</td>
                    ))}
                    <td className={`${tdCls} text-xs`}>{getPortfolio(p.portfolioId)?.name}</td>
                    <td className={tdCls}><PriorityBadge priority={p.priority} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-[11px] text-[#7A8699] px-3 py-2">◉ = สอดคล้องโดยตรง &nbsp;&nbsp; ○ = ไม่เกี่ยวข้องโดยตรง</div>
        </CardContent>
      </Card>
    </div>
  );
}
