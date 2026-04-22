import type { Portfolio, Program, Project, Risk, Issue, Milestone, WeeklyNote } from '@/types/pmo';

const today = () => new Date().toISOString().split('T')[0];
const weekNum = () => {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
};

export const PORTFOLIOS_SEED: Portfolio[] = [
  { id: 'pf1', name: 'Digital Transformation', icon: '🚀', color: '#3498DB' },
  { id: 'pf2', name: 'Logistics Excellence', icon: '📦', color: '#E67E22' },
  { id: 'pf3', name: 'Infrastructure Modernization', icon: '🏢', color: '#1ABC9C' },
  { id: 'pf4', name: 'People & Capability', icon: '🎓', color: '#9B59B6' },
  { id: 'pf5', name: 'Revenue Growth', icon: '💰', color: '#F39C12' },
];

export const PROGRAMS_SEED: Program[] = [
  { id: 'pg1', name: 'Smart Post Office', portfolioId: 'pf1' },
  { id: 'pg2', name: 'E-Logistics Platform', portfolioId: 'pf2' },
  { id: 'pg3', name: 'ERP & Core Systems', portfolioId: 'pf3' },
  { id: 'pg4', name: 'Talent Development', portfolioId: 'pf4' },
  { id: 'pg5', name: 'New Business', portfolioId: 'pf5' },
];

export const PROJECTS_SEED: Project[] = [
  { id: 'p1', name: 'Track & Trace v3', programId: 'pg1', portfolioId: 'pf1', pm: 'คุณสมชาย', status: 'critical', progress: 55, budget: 120, spent: 78, startDate: '2025-10-01', endDate: '2026-06-30', priority: 'P1', spi: 0.82, cpi: 0.91, description: 'ระบบติดตามพัสดุแบบ Real-time เวอร์ชัน 3' },
  { id: 'p2', name: 'E-Commerce Gateway', programId: 'pg5', portfolioId: 'pf5', pm: 'คุณวิภา', status: 'critical', progress: 38, budget: 85, spent: 52, startDate: '2026-01-15', endDate: '2026-08-31', priority: 'P1', spi: 0.72, cpi: 0.82, description: 'เชื่อมต่อระบบ E-Commerce กับ Marketplace' },
  { id: 'p3', name: 'Last-mile AI Routing', programId: 'pg2', portfolioId: 'pf2', pm: 'คุณพิชัย', status: 'at-risk', progress: 60, budget: 95, spent: 55, startDate: '2025-11-01', endDate: '2026-07-31', priority: 'P2', spi: 0.88, cpi: 0.95, description: 'AI เพิ่มประสิทธิภาพจัดส่ง Last-mile' },
  { id: 'p4', name: 'Smart Locker Network', programId: 'pg1', portfolioId: 'pf3', pm: 'คุณนภา', status: 'on-track', progress: 85, budget: 150, spent: 120, startDate: '2025-06-01', endDate: '2026-05-31', priority: 'P2', spi: 1.05, cpi: 0.97, description: 'ตู้ล็อกเกอร์อัจฉริยะ 200 จุดทั่ว กทม.' },
  { id: 'p5', name: 'Fleet Management System', programId: 'pg2', portfolioId: 'pf2', pm: 'คุณธนา', status: 'at-risk', progress: 48, budget: 70, spent: 48, startDate: '2026-02-01', endDate: '2026-09-30', priority: 'P2', spi: 0.85, cpi: 0.89, description: 'ระบบบริหารจัดการยานพาหนะ GPS + IoT' },
  { id: 'p6', name: 'ERP SAP S/4HANA', programId: 'pg3', portfolioId: 'pf3', pm: 'คุณอรุณ', status: 'on-track', progress: 72, budget: 280, spent: 195, startDate: '2025-04-01', endDate: '2026-12-31', priority: 'P1', spi: 0.98, cpi: 1.02, description: 'อัพเกรดระบบ ERP สู่ SAP S/4HANA' },
  { id: 'p7', name: 'Mobile App v4', programId: 'pg1', portfolioId: 'pf1', pm: 'คุณกมล', status: 'on-track', progress: 90, budget: 35, spent: 30, startDate: '2025-12-01', endDate: '2026-04-30', priority: 'P2', spi: 1.10, cpi: 1.05, description: 'แอปมือถือไปรษณีย์ไทยเวอร์ชัน 4' },
  { id: 'p8', name: 'PM Academy & Certification', programId: 'pg4', portfolioId: 'pf4', pm: 'คุณสุดา', status: 'on-track', progress: 65, budget: 15, spent: 8, startDate: '2026-01-01', endDate: '2026-12-31', priority: 'P3', spi: 0.95, cpi: 1.00, description: 'โปรแกรมพัฒนาทักษะ PM + PMP Certification' },
];

export const RISKS_SEED: Risk[] = [
  { id: 'r1', projectId: 'p1', title: 'Vendor API ส่งมอบล่าช้า', probability: 'high', impact: 'high', response: 'ประสานงาน Vendor ด่วน, เตรียม Backup Plan', owner: 'CTO', status: 'open', date: '2026-04-15' },
  { id: 'r2', projectId: 'p2', title: 'Integration กับ Shopee/Lazada ไม่ผ่าน UAT', probability: 'high', impact: 'high', response: 'เพิ่ม Dev 3 คน, ขยาย Sprint', owner: 'VP Digital', status: 'open', date: '2026-04-18' },
  { id: 'r3', projectId: 'p5', title: 'งบประมาณเกิน 12%', probability: 'medium', impact: 'high', response: 'จัดทำ CR ขอเพิ่มงบ 8.5 ลบ.', owner: 'CFO', status: 'open', date: '2026-04-10' },
  { id: 'r4', projectId: 'p4', title: 'ขาดพื้นที่ติดตั้ง Smart Locker ในต่างจังหวัด', probability: 'medium', impact: 'medium', response: 'สำรวจพื้นที่ร่วมกับ อปท.', owner: 'COO', status: 'mitigated', date: '2026-03-20' },
];

export const ISSUES_SEED: Issue[] = [
  { id: 'i1', projectId: 'p1', title: 'Vendor ยังไม่ส่งมอบ API Documentation', severity: 'high', assignee: 'CTO', status: 'open', date: '2026-04-20', resolution: '' },
  { id: 'i2', projectId: 'p2', title: 'Payment Gateway Integration Error', severity: 'high', assignee: 'VP Digital', status: 'open', date: '2026-04-19', resolution: '' },
  { id: 'i3', projectId: 'p6', title: 'UAT Phase 2 พบ 22 bugs ต้องแก้ไข', severity: 'medium', assignee: 'VP IT', status: 'in-progress', date: '2026-04-17', resolution: 'กำลังแก้ไข คาดเสร็จ 25 เม.ย.' },
];

export const MILESTONES_SEED: Milestone[] = [
  { id: 'm1', projectId: 'p4', title: 'ติดตั้ง Smart Locker 50 จุดใน กทม.', dueDate: '2026-04-21', status: 'completed' },
  { id: 'm2', projectId: 'p6', title: 'UAT Phase 2 Sign-off', dueDate: '2026-04-22', status: 'pending' },
  { id: 'm3', projectId: 'p7', title: 'Release to App Store', dueDate: '2026-04-23', status: 'on-track' },
  { id: 'm4', projectId: 'p8', title: 'PMP Bootcamp Batch 3 เปิดรับ', dueDate: '2026-04-24', status: 'on-track' },
  { id: 'm5', projectId: 'p3', title: 'Pilot พื้นที่ กทม. ตะวันออก', dueDate: '2026-04-25', status: 'on-track' },
];

export const WEEKLY_NOTES_SEED: WeeklyNote[] = [
  {
    id: 'wn1',
    weekNumber: weekNum(),
    year: 2026,
    decisions: '1. อนุมัติขยาย Timeline Track&Trace 4 สัปดาห์\n2. อนุมัติ CR เพิ่มงบ Fleet Mgmt +8.5 ลบ.',
    achievements: 'Smart Locker 50 จุดเสร็จ\nMobile App ผ่าน Security Audit',
    nextWeekFocus: 'Gate Review ERP SAP Phase 2\nVendor Meeting Track&Trace',
    createdAt: today(),
  },
];

export const DEFAULT_PMO_DATA = {
  portfolios: PORTFOLIOS_SEED,
  programs: PROGRAMS_SEED,
  projects: PROJECTS_SEED,
  risks: RISKS_SEED,
  issues: ISSUES_SEED,
  milestones: MILESTONES_SEED,
  weeklyNotes: WEEKLY_NOTES_SEED,
};
