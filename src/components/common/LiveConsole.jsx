export default function LiveConsole() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#101827] p-4 text-slate-100 shadow-md">
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-7 text-sky-200">
{`ubuntu@VM-01:~$ uptime
11:09:21 up 2 days, 4 hours, 12 minutes
ubuntu@VM-01:~$ vmstat 1 3
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
r  b   swpd   free   buff   cache   si   so   bi   bo   in   cs us sy id wa st
0  0      0  2048  342  6892    0    0    1    0  212  205  7  3 90  0  0`}
      </pre>
    </div>
  );
}
