export default function VMDetailsCard({ vm }) {
  const details = [
    ['Name', vm.name],
    ['Status', vm.status],
    ['Operating System', vm.os],
    ['IP Address', vm.ipAddress],
    ['MAC Address', vm.macAddress],
    ['Created On', vm.createdAt],
    ['Uptime', vm.uptime],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-lg font-semibold text-slate-800">VM Details</div>
      <div className="space-y-3">
        {details.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-b-0 last:pb-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
