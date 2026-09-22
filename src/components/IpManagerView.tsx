import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Globe,
  Network,
  Copy,
  Check,
  Building2,
  Server,
  Layers,
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { InfrastructureDatabase, IpConflict } from '../types';

interface IpManagerViewProps {
  db: InfrastructureDatabase;
  conflicts: IpConflict[];
  onNavigateToItem: (vestigingId: string, category: 'server' | 'vm' | 'apparaat', itemId: string) => void;
}

interface IpRow {
  ipAdres: string;
  macAdres?: string;
  naam: string;
  type: 'server' | 'vm' | 'apparaat';
  typeLabel: string;
  vestigingId: string;
  vestigingNaam: string;
  locatieOfHost: string;
  id: string;
  isConflict: boolean;
}

export const IpManagerView: React.FC<IpManagerViewProps> = ({
  db,
  conflicts,
  onNavigateToItem
}) => {
  const [selectedVestigingFilter, setSelectedVestigingFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showConflictsOnly, setShowConflictsOnly] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const vestigingMap = useMemo(() => new Map(db.vestigingen.map(v => [v.id, v.naam])), [db.vestigingen]);
  const gebouwMap = useMemo(() => new Map((db.gebouwen || []).map(g => [g.id, g.naam])), [db.gebouwen]);
  const serverMap = useMemo(() => new Map(db.servers.map(s => [s.id, s])), [db.servers]);

  // Conflict IP set
  const conflictIpSet = useMemo(() => new Set(conflicts.map(c => `${c.vestigingId}_${c.ipAdres}`)), [conflicts]);

  // Aggregate all IP addresses into a clean list
  const allIpRows = useMemo(() => {
    const rows: IpRow[] = [];

    // Servers
    for (const s of db.servers) {
      const gebouwName = s.gebouwId ? gebouwMap.get(s.gebouwId) : undefined;
      const baseLoc = gebouwName ? `${gebouwName} - ${s.locatie || 'Serverruimte'}` : (s.locatie || 'Serverruimte');

      // Management IP
      if (s.ipAdres && s.ipAdres.trim()) {
        const key = `${s.vestigingId}_${s.ipAdres.trim()}`;
        rows.push({
          ipAdres: s.ipAdres.trim(),
          macAdres: undefined,
          naam: s.naam,
          type: 'server',
          typeLabel: 'Fysieke Server (Beheer IP)',
          vestigingId: s.vestigingId,
          vestigingNaam: vestigingMap.get(s.vestigingId) || 'Onbekend',
          locatieOfHost: baseLoc,
          id: s.id,
          isConflict: conflictIpSet.has(key)
        });
      }

      // Configured NICs with IP
      if (s.nics && Array.isArray(s.nics)) {
        for (const nic of s.nics) {
          if (!nic.ipAdres || !nic.ipAdres.trim()) continue;
          if (nic.ipAdres.trim() === s.ipAdres?.trim()) continue; // avoid exact duplicate of mgmt IP
          const key = `${s.vestigingId}_${nic.ipAdres.trim()}`;
          const vlanInfo = nic.vlan ? ` | VLAN ${nic.vlan}` : '';
          rows.push({
            ipAdres: nic.ipAdres.trim(),
            macAdres: nic.macAdres,
            naam: `${s.naam} (${nic.naam})`,
            type: 'server',
            typeLabel: `Server NIC (${nic.naam}${vlanInfo})`,
            vestigingId: s.vestigingId,
            vestigingNaam: vestigingMap.get(s.vestigingId) || 'Onbekend',
            locatieOfHost: baseLoc,
            id: s.id,
            isConflict: conflictIpSet.has(key)
          });
        }
      }
    }

    // VMs
    for (const vm of db.vms) {
      if (!vm.ipAdres || !vm.ipAdres.trim()) continue;
      const srv = serverMap.get(vm.serverId);
      const vestId = srv ? srv.vestigingId : '';
      const srvGebouw = srv?.gebouwId ? gebouwMap.get(srv.gebouwId) : undefined;
      const key = `${vestId}_${vm.ipAdres.trim()}`;
      const vlanInfo = vm.vlan ? ` | VLAN ${vm.vlan}` : '';
      rows.push({
        ipAdres: vm.ipAdres.trim(),
        macAdres: vm.macAdres,
        naam: vm.naam,
        type: 'vm',
        typeLabel: `Virtuele Machine${vlanInfo}`,
        vestigingId: vestId,
        vestigingNaam: vestigingMap.get(vestId) || 'Onbekend',
        locatieOfHost: srv ? `Host: ${srv.naam}${srvGebouw ? ` (${srvGebouw})` : ''}` : 'Geen host',
        id: vm.id,
        isConflict: conflictIpSet.has(key)
      });
    }

    // Apparaten
    for (const dev of db.apparaten) {
      if (!dev.ipAdres || !dev.ipAdres.trim()) continue;
      const key = `${dev.vestigingId}_${dev.ipAdres.trim()}`;
      const gebouwName = dev.gebouwId ? gebouwMap.get(dev.gebouwId) : undefined;
      const locText = gebouwName ? `${gebouwName} - ${dev.locatie || 'Patchkast'}` : (dev.locatie || 'Patchkast');
      const vlanInfo = dev.vlan ? ` | VLAN ${dev.vlan}` : '';
      rows.push({
        ipAdres: dev.ipAdres.trim(),
        macAdres: dev.macAdres,
        naam: dev.naam,
        type: 'apparaat',
        typeLabel: `Netwerk (${dev.type}${vlanInfo})`,
        vestigingId: dev.vestigingId,
        vestigingNaam: vestigingMap.get(dev.vestigingId) || 'Onbekend',
        locatieOfHost: locText,
        id: dev.id,
        isConflict: conflictIpSet.has(key)
      });
    }

    // Natural IP sort (numerical octet sorting)
    return rows.sort((a, b) => {
      const octA = a.ipAdres.split('.').map(n => parseInt(n, 10));
      const octB = b.ipAdres.split('.').map(n => parseInt(n, 10));
      for (let i = 0; i < 4; i++) {
        const valA = isNaN(octA[i]) ? 0 : octA[i];
        const valB = isNaN(octB[i]) ? 0 : octB[i];
        if (valA !== valB) return valA - valB;
      }
      return a.naam.localeCompare(b.naam);
    });
  }, [db, vestigingMap, serverMap, conflictIpSet]);

  const filteredRows = useMemo(() => {
    return allIpRows.filter(r => {
      if (showConflictsOnly && !r.isConflict) return false;
      if (selectedVestigingFilter !== 'all' && r.vestigingId !== selectedVestigingFilter) return false;
      if (selectedTypeFilter !== 'all' && r.type !== selectedTypeFilter) return false;
      return true;
    });
  }, [allIpRows, showConflictsOnly, selectedVestigingFilter, selectedTypeFilter]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                IP- &amp; MAC-Adresbeheer
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Volledig overzicht van alle geregistreerde IP- en MAC-adressen en controle op dubbele adressen.
            </p>
          </div>

          {/* Quick stats on IP */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-400 font-medium">Totaal adressen:</span>{' '}
              <strong className="text-slate-900 font-bold">{allIpRows.length}</strong>
            </div>

            <div
              className={`px-3.5 py-2 border rounded-lg text-xs flex items-center gap-1.5 ${
                conflicts.length > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {conflicts.length > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <strong>{conflicts.length} IP-conflict(en)</strong>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <strong>Geen conflicten</strong>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>

          {/* Vestiging filter */}
          <select
            value={selectedVestigingFilter}
            onChange={e => setSelectedVestigingFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="all">Alle Vestigingen</option>
            {db.vestigingen.map(v => (
              <option key={v.id} value={v.id}>
                {v.naam}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="all">Alle Categorieën</option>
            <option value="server">Fysieke Servers</option>
            <option value="vm">Virtuele Machines</option>
            <option value="apparaat">Netwerkapparaten</option>
          </select>

          {/* Conflict toggle */}
          {conflicts.length > 0 && (
            <button
              onClick={() => setShowConflictsOnly(!showConflictsOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                showConflictsOnly
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Alleen conflicten tonen ({conflicts.length})
            </button>
          )}
        </div>
      </div>

      {/* Conflicts explanation banner */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Gedetecteerde IP-adres Conflicten
              </h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Volgens de validatievoorschriften mogen IP-adressen binnen dezelfde vestiging niet dubbel worden gebruikt om netwerkstoringen te voorkomen.
              </p>

              <div className="mt-3 space-y-2">
                {conflicts.map(conflict => (
                  <div
                    key={conflict.ipAdres + conflict.vestigingId}
                    className="p-3 bg-white border border-amber-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-950 text-sm">
                        {conflict.ipAdres}
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                        {conflict.vestigingNaam}
                      </span>
                      <span className="text-amber-700 text-[11px]">
                        ({conflict.items.length} toewijzingen)
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      {conflict.items.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                        >
                          <div>
                            <span className="font-bold">{item.naam}</span>{' '}
                            <span className="text-slate-500">({item.typeLabel})</span>
                            <div className="text-[11px] text-slate-400">{item.locatieOfHost}</div>
                          </div>
                          <button
                            onClick={() => onNavigateToItem(conflict.vestigingId, item.type, item.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold p-1"
                          >
                            Bekijk
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main IP Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-mono">IP-Adres</th>
                <th className="py-3 px-4 font-mono">MAC-Adres</th>
                <th className="py-3 px-4">Naam / Hostnaam</th>
                <th className="py-3 px-4">Categorie</th>
                <th className="py-3 px-4">Vestiging</th>
                <th className="py-3 px-4">Locatie / Host</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map(row => (
                <tr
                  key={`${row.vestigingId}-${row.id}-${row.ipAdres}`}
                  className={`transition-colors ${
                    row.isConflict ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{row.ipAdres}</span>
                      <button
                        onClick={() => copyToClipboard(row.ipAdres, `ip-${row.id}`)}
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title="Kopieer IP"
                      >
                        {copiedKey === `ip-${row.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    {row.macAdres ? (
                      <div className="flex items-center gap-1.5">
                        <span>{row.macAdres}</span>
                        <button
                          onClick={() => copyToClipboard(row.macAdres!, `mac-${row.id}`)}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                          title="Kopieer MAC"
                        >
                          {copiedKey === `mac-${row.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {row.naam}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        row.type === 'server'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : row.type === 'vm'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {row.typeLabel}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {row.vestigingNaam}
                  </td>

                  <td className="py-3 px-4 text-slate-500">
                    {row.locatieOfHost}
                  </td>

                  <td className="py-3 px-4">
                    {row.isConflict ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3" />
                        Dubbel IP
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        Uniek
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateToItem(row.vestigingId, row.type, row.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
                    >
                      Bekijk
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
