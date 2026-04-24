import { STATUS_MAP, calculateProjectMetrics, thaiDate } from '@/lib/pmo-utils';
import type { PMOData, Project } from '@/types/pmo';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const toParagraph = (value?: string) => {
  if (!value?.trim()) return '<p class="muted">- ไม่มีข้อมูล -</p>';
  const lines = value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<li>${escapeHtml(line)}</li>`)
    .join('');
  return lines ? `<ul>${lines}</ul>` : `<p>${escapeHtml(value)}</p>`;
};

const progressDeltaLabel = (project: Project): string => {
  const previous = typeof project.previousWeekProgress === 'number' ? project.previousWeekProgress : project.progress;
  const delta = Math.round((project.progress - previous) * 100) / 100;
  if (delta > 0) return `ความคืบหน้าเพิ่มขึ้น ${delta}% จากสัปดาห์ก่อน`;
  if (delta < 0) return `ความคืบหน้าลดลง ${Math.abs(delta)}% จากสัปดาห์ก่อน`;
  return 'ความคืบหน้าเทียบกับสัปดาห์ก่อนคงที่';
};

const projectSection = (project: Project, data: PMOData, index: number): string => {
  const metrics = calculateProjectMetrics(project);
  const program = data.programs.find(item => item.id === project.programId);
  const portfolio = data.portfolios.find(item => item.id === project.portfolioId);
  const risks = data.risks.filter(item => item.projectId === project.id);
  const issues = data.issues.filter(item => item.projectId === project.id);
  const milestones = data.milestones.filter(item => item.projectId === project.id).sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));
  const statusText = STATUS_MAP[project.status].label;

  return `
    <section class="project">
      <h2>${index}. ${escapeHtml(project.name)}</h2>
      <table>
        <tr><th>Portfolio / Program</th><td>${escapeHtml(portfolio?.name ?? '-')} / ${escapeHtml(program?.name ?? '-')}</td></tr>
        <tr><th>ผู้จัดการโครงการ (PM)</th><td>${escapeHtml(project.pm || '-')}</td></tr>
        <tr><th>สถานะโครงการ</th><td>${escapeHtml(statusText)}</td></tr>
        <tr><th>ความคืบหน้าจริงสะสม</th><td>${project.progress}%</td></tr>
        <tr><th>เป้าหมายตามแผนที่กำหนด</th><td>${project.targetProgress}%</td></tr>
        <tr><th>ส่วนต่างจากแผน (Actual - Plan)</th><td>${metrics.progressDelta}%</td></tr>
        <tr><th>SPI (ดัชนีประสิทธิภาพตามกำหนดเวลา)</th><td>${metrics.spi ?? '-'}</td></tr>
        <tr><th>CPI (ดัชนีประสิทธิภาพต้นทุน)</th><td>${metrics.cpi ?? '-'}</td></tr>
        <tr><th>งบประมาณ / ใช้แล้ว</th><td>${project.budget} / ${project.spent} ล้านบาท</td></tr>
        <tr><th>คาดการณ์แล้วเสร็จ 100%</th><td>${escapeHtml(thaiDate(project.endDate))}</td></tr>
      </table>
      <h3>สรุปความคืบหน้ารายสัปดาห์</h3>
      <p>${escapeHtml(project.weeklyProgressSummary?.trim() || progressDeltaLabel(project))}</p>
      <h3>สถานะขั้นตอนปัจจุบัน</h3>
      ${toParagraph(project.currentStageStatus || project.description)}
      <h3>ปัญหา/อุปสรรค และแนวทางการแก้ไข</h3>
      ${toParagraph(project.blockersAndMitigation)}
      <h3>ความเสี่ยง (Risk) และประเด็นปัญหา (Issue)</h3>
      <p><strong>Risk:</strong> ${risks.length ? risks.map(item => `${escapeHtml(item.title)} [${escapeHtml(item.status)}]`).join(', ') : '-'}</p>
      <p><strong>Issue:</strong> ${issues.length ? issues.map(item => `${escapeHtml(item.title)} [${escapeHtml(item.status)}]`).join(', ') : '-'}</p>
      <h3>Milestone ที่เกี่ยวข้อง</h3>
      <p>${milestones.length ? milestones.map(item => `${escapeHtml(item.title)} (${escapeHtml(thaiDate(item.dueDate))}, ${escapeHtml(item.status)})`).join(', ') : '-'}</p>
      <h3>สิ่งที่ขอรับการสนับสนุนจากผู้บริหาร</h3>
      ${toParagraph(project.executiveSupportNeeded)}
      <h3>เรื่องที่จำเป็นต้องดำเนินการ</h3>
      ${toParagraph(project.requiredActions)}
      <h3>ข้อพิจารณา</h3>
      ${toParagraph(project.managementConsiderations)}
    </section>
  `;
};

export const downloadWeeklyExecutiveDoc = (data: PMOData) => {
  const now = new Date();
  const buddhistYear = now.getFullYear() + 543;
  const week = Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
  const content = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: "TH Sarabun New", "Sarabun", sans-serif; color: #222; line-height: 1.35; font-size: 14pt; }
        h1 { color: #1A2744; margin: 0 0 8px 0; font-size: 24pt; }
        h2 { color: #1A2744; margin: 20px 0 8px 0; font-size: 18pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        h3 { margin: 10px 0 4px 0; font-size: 14pt; color: #333; }
        p { margin: 3px 0; }
        .muted { color: #777; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th, td { border: 1px solid #d9d9d9; padding: 5px 7px; vertical-align: top; }
        th { width: 34%; background: #f6f6f6; text-align: left; }
        ul { margin: 4px 0 8px 24px; }
        .legend { margin-top: 12px; padding: 8px; border: 1px solid #e0e0e0; background: #fafafa; }
      </style>
    </head>
    <body>
      <h1>รายงานสถานะโครงการ PMO รายสัปดาห์</h1>
      <p>สัปดาห์ที่ ${week}/${buddhistYear} | วันที่ออกรายงาน: ${escapeHtml(now.toLocaleDateString('th-TH'))}</p>
      ${data.projects.map((project, index) => projectSection(project, data, index + 1)).join('')}
      <div class="legend">
        <strong>คำย่อสำคัญ:</strong>
        <p>SPI (Schedule Performance Index) = ดัชนีประสิทธิภาพตามกำหนดเวลา</p>
        <p>CPI (Cost Performance Index) = ดัชนีประสิทธิภาพต้นทุน</p>
        <p>PM (Project Manager) = ผู้จัดการโครงการ</p>
      </div>
    </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Weekly_Report_PMO_wk${week}-${buddhistYear}.doc`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
