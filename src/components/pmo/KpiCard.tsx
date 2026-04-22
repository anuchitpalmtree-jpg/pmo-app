interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  borderColor: string;
}

export function KpiCard({ label, value, sub, borderColor }: KpiCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-4 border border-[#E4E0D8] transition-transform duration-150 cursor-default hover:-translate-y-0.5"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="text-[11px] font-bold text-[#7A8699] uppercase tracking-wide mb-1.5">{label}</div>
      <div className="font-mono text-[26px] font-black text-[#1A2744] leading-none">{value}</div>
      {sub && <div className="text-[11px] text-[#7A8699] mt-1">{sub}</div>}
    </div>
  );
}
