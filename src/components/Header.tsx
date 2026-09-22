import React, { useState, useRef, useEffect } from 'react';
import {
  Server,
  Building2,
  Search,
  Plus,
  FileDown,
  Layers,
  Network,
  AlertTriangle,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import { Vestiging, IpConflict } from '../types';

interface HeaderProps {
  currentTab: 'dashboard' | 'vestigingen' | 'vlans' | 'ip-manager' | 'search' | 'print';
  onSelectTab: (tab: 'dashboard' | 'vestigingen' | 'vlans' | 'ip-manager' | 'search') => void;
  vestigingen: Vestiging[];
  selectedVestigingId: string;
  onSelectVestiging: (id: string) => void;
  conflicts: IpConflict[];
  vlansCount?: number;
  onOpenAddVestiging: () => void;
  onOpenAddServer: () => void;
  onOpenAddVm: () => void;
  onOpenAddApparaat: () => void;
  onOpenAddVlan?: () => void;
  onOpenExport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  vestigingen,
  selectedVestigingId,
  onSelectVestiging,
  conflicts,
  vlansCount = 0,
  onOpenAddVestiging,
  onOpenAddServer,
  onOpenAddVm,
  onOpenAddApparaat,
  onOpenAddVlan,
  onOpenExport,
  searchQuery,
  onSearchChange
}) => {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setAddMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
      {/* Top Banner with Brand and Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Server className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  IT-Infrastructuur
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-md">
                  Scholengemeenschap
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Centraal beheer van servers, virtuele machines &amp; IP-adressen
              </p>
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="header-quick-search-input"
                type="text"
                placeholder="Zoek direct op IP, MAC-adres of naam..."
                value={searchQuery}
                onChange={e => {
                  onSearchChange(e.target.value);
                  if (currentTab !== 'search' && e.target.value.trim().length > 0) {
                    onSelectTab('search');
                  }
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0 && currentTab !== 'search') {
                    onSelectTab('search');
                  }
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Wissen
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Add Menu */}
            <div className="relative" ref={addMenuRef}>
              <button
                id="header-add-button"
                onClick={() => setAddMenuOpen(!addMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Toevoegen</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {addMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Nieuw item registreren
                  </div>
                  <button
                    id="add-server-menu-item"
                    onClick={() => {
                      setAddMenuOpen(false);
                      onOpenAddServer();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1 rounded bg-blue-50 text-blue-600">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Fysieke Server</div>
                      <div className="text-[11px] text-slate-400">Dell / HPE host in rack</div>
                    </div>
                  </button>

                  <button
                    id="add-vm-menu-item"
                    onClick={() => {
                      setAddMenuOpen(false);
                      onOpenAddVm();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Virtuele Machine (VM)</div>
                      <div className="text-[11px] text-slate-400">Gekoppeld aan host server</div>
                    </div>
                  </button>

                  <button
                    id="add-apparaat-menu-item"
                    onClick={() => {
                      setAddMenuOpen(false);
                      onOpenAddApparaat();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1 rounded bg-purple-50 text-purple-600">
                      <Network className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Netwerkapparaat</div>
                      <div className="text-[11px] text-slate-400">Switch, router of firewall</div>
                    </div>
                  </button>

                  {onOpenAddVlan && (
                    <button
                      id="add-vlan-menu-item"
                      onClick={() => {
                        setAddMenuOpen(false);
                        onOpenAddVlan();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <div className="p-1 rounded bg-cyan-50 text-cyan-600">
                        <Network className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium">VLAN (Virtueel Netwerk)</div>
                        <div className="text-[11px] text-slate-400">VLAN ID, subnet &amp; gateway</div>
                      </div>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    id="add-vestiging-menu-item"
                    onClick={() => {
                      setAddMenuOpen(false);
                      onOpenAddVestiging();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  >
                    <div className="p-1 rounded bg-indigo-50 text-indigo-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Nieuwe Vestiging</div>
                      <div className="text-[11px] text-slate-400">Schoollocatie toevoegen</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Export / Rapport knop */}
            <button
              id="header-export-btn"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Exporteer naar CSV, PDF of back-up"
            >
              <FileDown className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Export / PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs and Branch Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-100 py-2 gap-3">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-sm">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>

            <button
              id="nav-vestigingen-btn"
              onClick={() => onSelectTab('vestigingen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                currentTab === 'vestigingen'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Vestigingen ({vestigingen.length})
            </button>

            <button
              id="nav-vlans-btn"
              onClick={() => onSelectTab('vlans')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                currentTab === 'vlans'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Network className="w-4 h-4" />
              VLAN&apos;s ({vlansCount})
            </button>

            <button
              id="nav-ip-manager-btn"
              onClick={() => onSelectTab('ip-manager')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                currentTab === 'ip-manager'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              IP &amp; MAC Beheer
              {conflicts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {conflicts.length}
                </span>
              )}
            </button>

            <button
              id="nav-search-btn"
              onClick={() => onSelectTab('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                currentTab === 'search'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              Zoeken
            </button>
          </nav>

          {/* Quick Vestiging Dropdown (Active when in Vestigingen tab) */}
          {currentTab === 'vestigingen' && vestigingen.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 font-medium">Actieve vestiging:</span>
              <select
                id="header-active-vestiging-select"
                value={selectedVestigingId}
                onChange={e => onSelectVestiging(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {vestigingen.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.naam}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
