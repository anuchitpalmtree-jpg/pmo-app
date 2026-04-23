export type ProjectStatus = 'on-track' | 'at-risk' | 'critical' | 'completed' | 'planning';
export type Priority = 'P1' | 'P2' | 'P3';
export type Level = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'mitigated' | 'closed';
export type IssueStatus = 'open' | 'in-progress' | 'resolved';
export type MilestoneStatus = 'on-track' | 'pending' | 'completed' | 'delayed';

export interface Portfolio {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Program {
  id: string;
  name: string;
  portfolioId: string;
}

export interface Project {
  id: string;
  name: string;
  programId: string;
  portfolioId: string;
  pm: string;
  status: ProjectStatus;
  progress: number;
  targetProgress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  priority: Priority;
  spi: number;
  cpi: number;
  description: string;
}

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  probability: Level;
  impact: Level;
  response: string;
  owner: string;
  status: RiskStatus;
  date: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  severity: Level;
  assignee: string;
  status: IssueStatus;
  date: string;
  resolution: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
}

export interface WeeklyNote {
  id: string;
  weekNumber: number;
  year: number;
  decisions: string;
  achievements: string;
  nextWeekFocus: string;
  createdAt: string;
}

export interface AlignmentSetting {
  id: string;
  vision: string;
}

export interface StrategicGoal {
  id: string;
  name: string;
  order: number;
}

export interface ProjectGoalAlignment {
  id: string;
  projectId: string;
  goalId: string;
}

export interface PMOData {
  portfolios: Portfolio[];
  programs: Program[];
  projects: Project[];
  risks: Risk[];
  issues: Issue[];
  milestones: Milestone[];
  weeklyNotes: WeeklyNote[];
  alignmentSettings: AlignmentSetting[];
  strategicGoals: StrategicGoal[];
  projectGoalAlignments: ProjectGoalAlignment[];
}

export interface PMOStats {
  total: number;
  totalBudget: number;
  totalSpent: number;
  avgSPI: string;
  avgCPI: string;
  byStatus: Record<string, number>;
  disbursement: number;
}
