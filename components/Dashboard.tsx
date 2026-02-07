import React, { useState, useEffect } from 'react';

interface ChangelogEntry {
  version: string;
  date: string;
  status: 'Latest' | 'Stable' | 'Legacy';
  changes: string[];
}

interface DashboardProps {
  user: { email: string; username: string; id?: string };
  onSignOut: () => void;
}

const CHANGELOG_URL = 'https://raw.githubusercontent.com/saintydevz/Avionupdates/refs/heads/main/Updates.json';

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const [showChangelog, setShowChangelog] = useState(false);
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hwid] = useState<string>('AVION-MOCK-HWID-7721');

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setLoading(true);
        const response = await fetch(CHANGELOG_URL);
        const data = await response.json();
        setChangelogs(data);
      } catch (err) {
        setChangelogs([
          {
            version: "Build 2.4.1",
            date: "Feb 2026",
            status: "Latest",
            changes: [
              "Complete 100% UNC compliance for the latest engine patches.",
              "New 'Phantom Execution' mode for undetected background runs.",
              "Automated HWID reset system integrated directly into the dashboard."
            ]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchChangelog();
  }, []);

  return (
    <div className="w-full max-w-5xl mt-48 px-4 flex flex-col items-center">
      {showChangelog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowChangelog(false)} />
          <div className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/[0.08] rounded-[40px] p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ad92ff] to-transparent" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold hero-heading">What's New</h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-1">Avion Version History</p>
              </div>
              <button onClick={() => setShowChangelog(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-zinc-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-10 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
              {!loading && changelogs.map((log, index) => (
                <div key={index} className={`space-y-4 ${log.status !== 'Latest' ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${log.status === 'Latest' ? 'bg-[#ad92ff]/10 text-[#ad92ff]' : 'bg-white/5 text-zinc-500'}`}>
                      {log.status}
                    </span>
                    <span className="text-zinc-400 text-sm font-bold">{log.version} ({log.date})</span>
                  </div>
                  <ul className="space-y-4 text-zinc-500 text-[15px] font-medium leading-relaxed">
                    {log.changes.map((change, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-3">
                        <span className={`${log.status === 'Latest' ? 'text-[#ad92ff]' : 'text-zinc-700'} mt-1.5 w-1.5 h-1.5 rounded-full bg-current`} />
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={() => setShowChangelog(false)} className="w-full mt-10 bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-5xl font-bold hero-heading mb-2">Hello, {user.username}.</h2>
          <p className="text-zinc-500 font-medium">Welcome back to Avion.</p>
        </div>
        <button onClick={onSignOut} className="bg-white/5 border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/10 px-8 py-3 rounded-2xl font-bold text-sm transition-all">
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
        <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Membership</div>
          <div className="text-2xl font-bold text-[#ad92ff]">Lifetime Premium</div>
          <div className="text-zinc-600 text-sm mt-2">Active access granted.</div>
        </div>

        <div className="bg-[#0d0d14] border border-white/[0.05] p-8 rounded-[32px] shadow-xl md:col-span-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Hardware Identifier (HWID)</div>
          <div className="text-xl font-mono text-zinc-400 select-all">{hwid}</div>
          <div className="text-zinc-600 text-xs mt-2 italic">* Automatically synced with your system.</div>
        </div>
      </div>

      <div className="w-full bg-[#ad92ff]/5 border border-[#ad92ff]/20 p-10 rounded-[40px] flex flex-col items-center text-center shadow-lg">
        <div className="w-16 h-16 bg-[#ad92ff] text-[#1a1a2e] rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1V11.719H0V3.449ZM0 12.332H9.75V21.9L0 20.551V12.332ZM10.706 1.969L24 0V11.719H10.706V1.969ZM10.706 12.332H24V24L10.706 22.031V12.332Z" />
          </svg>
        </div>
        <h3 className="text-3xl font-bold mb-4">Latest Execution Build</h3>
        <p className="text-zinc-500 max-w-md mb-10 leading-relaxed">
          Download the stable client (v2.4.1). Avion provides 100% UNC support for a smooth experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button className="flex-1 bg-[#ad92ff] text-[#1a1a2e] font-bold py-4 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3">
            Download
          </button>
          <button onClick={() => setShowChangelog(true)} className="flex-1 bg-white/5 border border-white/[0.1] text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all">
            Changelog
          </button>
        </div>
      </div>
    </div>
  );
};
