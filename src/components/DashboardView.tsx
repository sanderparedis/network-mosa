import React from 'react';
import {
  Building2,
  Server,
  Layers,
  Network,
  Globe,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Clock,
  ExternalLink,
  Plus
} from 'lucide-react';
import { InfrastructureDatabase, IpConflict, Vestiging } from '../types';

interface DashboardViewProps {
  db: InfrastructureDatabase;
  conflicts: IpConflict[];
  onSelectVestiging: (vestigingId: string) => void;
  onOpenAddVestiging: () => void;
  onOpenAddServer: () => void;
  onOpenAddVm: () => void;
  onOpenAddApparaat: () => void;
  onOpenExport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  conflicts,
  onSelectVestiging,
  onOpenAddVestiging,
  onOpenAddServer,
  onOpenAddVm,
  onOpenAddApparaat,
  onOpenExport
}) => {
  const { vestigingen, servers, vms, apparaten } = db;

  // Total IP addresses in use
  const ipCount = new Set([
    ...servers.map(s => s.ipAdres).filter(Boolean),
    ...vms.map(v => v.ipAdres).filter(Boolean),
    ...apparaten.map(a => a.ipAdres).filter(Boolean)
  ]).size;

  // Hardware warranty monitoring (check expiring or expired warranties)
  const now = new Date();
  const expiringServers = servers.filter(s => {
    if (!s.garantieEinddatum) return false;
    const end = new Date(s.garantieEinddatum);
    const diffMonths = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths < 6; // within 6 months or expired
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Infrastructuur Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Centraal overzicht van de fysieke en virtuele ICT-infrastructuur van de scholengemeenschap.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="dashboard-export-report-btn"
              onClick={onOpenExport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Rapport Genereren (PDF/CSV)
            </button>
            <button
              id="dashboard-new-server-btn"
              onClick={onOpenAddServer}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Nieuwe Server
            </button>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 pt-5">
          {/* Vestigingen */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Vestigingen</span>
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{vestigingen.length}</div>
            <p className="text-xs text-slate-500 mt-1">Actieve schoollocaties</p>
          </div>

          {/* Fysieke Servers */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Servers (Hosts)</span>
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{servers.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {servers.filter(s => s.status === 'actief').length} actief in productie
            </p>
          </div>

          {/* Virtuele Machines */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">VM&apos;s</span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{vms.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Gem. {(vms.length / (servers.length || 1)).toFixed(1)} VM&apos;s per server
            </p>
          </div>

          {/* Netwerkapparaten */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Netwerk</span>
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Network className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{apparaten.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {apparaten.filter(a => a.type === 'switch').length} switches, {apparaten.filter(a => a.type === 'firewall').length} firewalls
            </p>
          </div>

          {/* IP-adressen */}
          <div className="col-span-2 lg:col-span-1 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">IP-adressen</span>
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{ipCount}</div>
            <p className="text-xs text-slate-500 mt-1">
              {conflicts.length > 0 ? (
                <span className="text-amber-600 font-semibold">{conflicts.length} conflict(en)</span>
              ) : (
                'Geen IP-conflicten'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* IP Conflict Warning Banner if conflicts exist */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">
              Opgelet: {conflicts.length} IP-adres conflict(en) gedetecteerd
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Meerdere apparaten of virtuele machines zijn geregistreerd met hetzelfde IP-adres binnen dezelfde vestiging.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {conflicts.map(c => (
                <span key={c.ipAdres + c.vestigingId} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-300 rounded-md text-xs font-mono text-amber-900 font-medium">
                  <strong>{c.ipAdres}</strong> op {c.vestigingNaam} ({c.items.length}x)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tellingen per vestiging tabel (Core Requirement 6) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Overzicht per Vestiging</h2>
            <p className="text-xs text-slate-500">Tellingen en bezetting per schoolcampus</p>
          </div>
          <button
            id="dashboard-add-vestiging-btn"
            onClick={onOpenAddVestiging}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Nieuwe Vestiging Toevoegen
          </button>
        </div>

        {vestigingen.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Database is blanco</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
              Er zijn momenteel geen vestigingen geregistreerd. U kunt direct uw eigen schoolvestigingen, gebouwen, servers en netwerkapparatuur toevoegen om uw documentatie op te bouwen.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                id="empty-dashboard-add-vestiging-btn"
                onClick={onOpenAddVestiging}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Eerste Vestiging Toevoegen
              </button>
              <button
                id="empty-dashboard-open-db-manage-btn"
                onClick={onOpenExport}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Database Beheer / Back-up
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Vestiging</th>
                  <th className="py-3 px-4 text-center">Gebouwen</th>
                  <th className="py-3 px-4 text-center">Fysieke Servers</th>
                  <th className="py-3 px-4 text-center">Virtuele Machines</th>
                  <th className="py-3 px-4 text-center">Netwerkapparaten</th>
                  <th className="py-3 px-6">Contactpersoon ICT</th>
                  <th className="py-3 px-6 text-right">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vestigingen.map(v => {
                  const vestGebouwen = (db.gebouwen || []).filter(g => g.vestigingId === v.id);
                  const vestServers = servers.filter(s => s.vestigingId === v.id);
                  const vestServerIds = new Set(vestServers.map(s => s.id));
                  const vestVms = vms.filter(vm => vestServerIds.has(vm.serverId));
                  const vestApparaten = apparaten.filter(a => a.vestigingId === v.id);

                  return (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        <div className="font-semibold text-slate-900">{v.naam}</div>
                        <div className="text-xs text-slate-400 font-normal">{v.adres}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {vestGebouwen.length > 0 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {vestGebouwen.length} {vestGebouwen.length === 1 ? 'gebouw' : 'gebouwen'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {vestServers.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {vestVms.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          {vestApparaten.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">
                        <div>{v.contactpersoon || 'Geen contactpersoon'}</div>
                        {v.telefoon && <div className="text-slate-400">{v.telefoon}</div>}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => onSelectVestiging(v.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Bekijk Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Garantie Status & Onderhoud Signalering */}
      {expiringServers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Garantie- &amp; Vervangingssignalering
              </h2>
              <p className="text-xs text-slate-500">
                Fysieke servers met verlopen garantie of garantie die binnen 6 maanden afloopt
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expiringServers.map(s => {
              const vest = vestigingen.find(v => v.id === s.vestigingId);
              const endDate = new Date(s.garantieEinddatum!);
              const isPast = endDate < now;

              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isPast ? 'bg-rose-50/50 border-rose-200' : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{s.naam}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isPast ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPast ? 'Garantie Verlopen' : 'Verloopt Binnenkort'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {s.merkModel} &bull; {vest?.naam || 'Vestiging'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Garantiedatum: {s.garantieEinddatum}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectVestiging(s.vestigingId)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
                    title="Ga naar server"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
