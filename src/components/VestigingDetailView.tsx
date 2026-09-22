import React, { useState } from 'react';
import {
  Building2,
  Server,
  Layers,
  Network,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  MapPin,
  User,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Download,
  Info,
  Filter
} from 'lucide-react';
import { Vestiging, Gebouw, FysiekeServer, VirtueleMachine, Netwerkapparaat, IpConflict } from '../types';

interface VestigingDetailViewProps {
  vestiging: Vestiging;
  servers: FysiekeServer[];
  vms: VirtueleMachine[];
  apparaten: Netwerkapparaat[];
  gebouwen: Gebouw[];
  conflicts: IpConflict[];
  onEditVestiging: (vestiging: Vestiging) => void;
  onDeleteVestiging: (vestiging: Vestiging) => void;
  onAddGebouw: (vestigingId: string) => void;
  onEditGebouw: (gebouw: Gebouw) => void;
  onDeleteGebouw: (gebouw: Gebouw) => void;
  onAddServer: (vestigingId: string) => void;
  onEditServer: (server: FysiekeServer) => void;
  onDeleteServer: (server: FysiekeServer) => void;
  onAddVm: (serverId: string) => void;
  onEditVm: (vm: VirtueleMachine) => void;
  onDeleteVm: (vm: VirtueleMachine) => void;
  onAddApparaat: (vestigingId: string) => void;
  onEditApparaat: (apparaat: Netwerkapparaat) => void;
  onDeleteApparaat: (apparaat: Netwerkapparaat) => void;
  onOpenExport: (vestigingId: string) => void;
}

export const VestigingDetailView: React.FC<VestigingDetailViewProps> = ({
  vestiging,
  servers,
  vms,
  apparaten,
  gebouwen,
  conflicts,
  onEditVestiging,
  onDeleteVestiging,
  onAddGebouw,
  onEditGebouw,
  onDeleteGebouw,
  onAddServer,
  onEditServer,
  onDeleteServer,
  onAddVm,
  onEditVm,
  onDeleteVm,
  onAddApparaat,
  onEditApparaat,
  onDeleteApparaat,
  onOpenExport
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'servers' | 'apparaten'>('servers');
  // State for expanded server accordions (default: all servers expanded)
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});
  // Selected building filter: 'all' | 'unassigned' | gebouwId
  const [selectedGebouwFilter, setSelectedGebouwFilter] = useState<string>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!vestiging) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-2xs mt-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Geen vestiging geselecteerd</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Er zijn momenteel geen vestigingen aanwezig in de database. Maak uw eerste schoolvestiging aan om te beginnen.
        </p>
      </div>
    );
  }

  // Toggle server accordion
  const toggleServer = (serverId: string) => {
    setExpandedServers(prev => ({
      ...prev,
      [serverId]: prev[serverId] === false ? true : false
    }));
  };

  const isServerExpanded = (serverId: string) => {
    return expandedServers[serverId] !== false; // default true
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  // Filter items for this vestiging
  const vestGebouwen = gebouwen.filter(g => g.vestigingId === vestiging.id);
  const gebouwMap = new Map(vestGebouwen.map(g => [g.id, g]));

  const vestServers = servers.filter(s => s.vestigingId === vestiging.id);
  const vestServerIds = new Set(vestServers.map(s => s.id));
  const vestVms = vms.filter(vm => vestServerIds.has(vm.serverId));
  const vestApparaten = apparaten.filter(a => a.vestigingId === vestiging.id);

  // Apply building filter
  const filteredServers = vestServers.filter(s => {
    if (selectedGebouwFilter === 'all') return true;
    if (selectedGebouwFilter === 'unassigned') return !s.gebouwId;
    return s.gebouwId === selectedGebouwFilter;
  });

  const filteredApparaten = vestApparaten.filter(a => {
    if (selectedGebouwFilter === 'all') return true;
    if (selectedGebouwFilter === 'unassigned') return !a.gebouwId;
    return a.gebouwId === selectedGebouwFilter;
  });

  // Conflicts on this vestiging
  const vestConflicts = conflicts.filter(c => c.vestigingId === vestiging.id);

  return (
    <div className="space-y-6">
      {/* Vestiging Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {vestiging.naam}
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vestiging.adres || 'Geen adres opgegeven'}</span>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  <strong>Contactpersoon:</strong> {vestiging.contactpersoon || 'Geen contactpersoon'}
                </span>
              </div>
              {vestiging.telefoon && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{vestiging.telefoon}</span>
                </div>
              )}
              {vestiging.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`mailto:${vestiging.email}`} className="text-indigo-600 hover:underline">
                    {vestiging.email}
                  </a>
                </div>
              )}
            </div>

            {vestiging.notities && (
              <div className="mt-3 text-xs text-slate-600 bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">Locatie / Toegang: </span>
                  <span className="text-amber-800">{vestiging.notities}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons for Vestiging */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <button
              id="export-current-vestiging-btn"
              onClick={() => onOpenExport(vestiging.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Exporteer Vestiging
            </button>
            <button
              id="edit-vestiging-btn"
              onClick={() => onEditVestiging(vestiging)}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors"
              title="Vestiging bewerken"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              id="delete-vestiging-btn"
              onClick={() => onDeleteVestiging(vestiging)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
              title="Vestiging verwijderen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* IP Conflict Warning Banner for this branch */}
        {vestConflicts.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Waarschuwing: Dubbel IP-adres gedetecteerd op deze vestiging!</span>
              <p className="mt-0.5">
                {vestConflicts.map(c => (
                  <span key={c.ipAdres} className="block">
                    IP <strong>{c.ipAdres}</strong> is toegewezen aan {c.items.map(i => `${i.typeLabel} "${i.naam}"`).join(' en ')}.
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}

        {/* ================= GEBOUWEN BEHEER BAR ================= */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Gebouwen op deze vestiging ({vestGebouwen.length})
              </h3>
            </div>
            <button
              id="add-gebouw-btn"
              onClick={() => onAddGebouw(vestiging.id)}
              className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors self-start sm:self-auto inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Gebouw toevoegen
            </button>
          </div>

          {vestGebouwen.length === 0 ? (
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-dashed border-slate-200 flex items-center justify-between">
              <span>Nog geen gebouwen gedefinieerd voor deze vestiging (alle apparatuur staat direct onder deze vestiging).</span>
              <button
                onClick={() => onAddGebouw(vestiging.id)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + Gebouw toevoegen
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {vestGebouwen.map(gebouw => {
                const srvCount = vestServers.filter(s => s.gebouwId === gebouw.id).length;
                const devCount = vestApparaten.filter(d => d.gebouwId === gebouw.id).length;

                return (
                  <div
                    key={gebouw.id}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800">{gebouw.naam}</span>
                      {gebouw.code && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                          {gebouw.code}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 ml-1">
                        ({srvCount} srv / {devCount} net)
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
                      <button
                        onClick={() => onEditGebouw(gebouw)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                        title="Gebouw bewerken"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteGebouw(gebouw)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                        title="Gebouw verwijderen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Building Filter Bar (if there are buildings) */}
      {vestGebouwen.length > 0 && (
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-600 shrink-0">Filter op gebouw:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedGebouwFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedGebouwFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle gebouwen ({vestServers.length} srv)
            </button>
            {vestGebouwen.map(g => {
              const count = vestServers.filter(s => s.gebouwId === g.id).length;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelectedGebouwFilter(g.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    selectedGebouwFilter === g.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g.naam} {g.code ? `(${g.code})` : ''} ({count})
                </button>
              );
            })}
            <button
              onClick={() => setSelectedGebouwFilter('unassigned')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedGebouwFilter === 'unassigned'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Zonder gebouw ({vestServers.filter(s => !s.gebouwId).length})
            </button>
          </div>
        </div>
      )}

      {/* Sub Tabs: Servers & VM's vs Netwerkapparatuur */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            id="tab-servers-vms"
            onClick={() => setActiveSubTab('servers')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSubTab === 'servers'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" />
            Fysieke Servers &amp; VM&apos;s
            <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-white/20 text-white">
              {filteredServers.length} srv / {vestVms.length} vm
            </span>
          </button>

          <button
            id="tab-netwerkapparaten"
            onClick={() => setActiveSubTab('apparaten')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
              activeSubTab === 'apparaten'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Network className="w-4 h-4" />
            Netwerkapparatuur
            <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-white/20 text-white">
              {filteredApparaten.length}
            </span>
          </button>
        </div>

        <div>
          {activeSubTab === 'servers' ? (
            <button
              id="add-server-to-current-vestiging-btn"
              onClick={() => onAddServer(vestiging.id)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nieuwe Fysieke Server
            </button>
          ) : (
            <button
              id="add-apparaat-to-current-vestiging-btn"
              onClick={() => onAddApparaat(vestiging.id)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nieuw Netwerkapparaat
            </button>
          )}
        </div>
      </div>

      {/* ================= SECTION 1: SERVERS & VMS ================= */}
      {activeSubTab === 'servers' && (
        <div className="space-y-4">
          {filteredServers.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <Server className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                {selectedGebouwFilter !== 'all'
                  ? 'Geen servers gevonden voor dit geselecteerde gebouw'
                  : 'Nog geen fysieke servers gedocumenteerd'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {selectedGebouwFilter !== 'all'
                  ? 'Pas het gebouwfilter hierboven aan of voeg een server toe aan dit gebouw.'
                  : 'Er zijn nog geen servers toegevoegd aan deze vestiging. Voeg een fysieke host server toe om hierop virtuele machines te documenteren.'}
              </p>
              <button
                onClick={() => onAddServer(vestiging.id)}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Server Toevoegen
              </button>
            </div>
          ) : (
            filteredServers.map(server => {
              const serverVms = vms.filter(vm => vm.serverId === server.id);
              const expanded = isServerExpanded(server.id);
              const gebouw = server.gebouwId ? gebouwMap.get(server.gebouwId) : null;
              const nics = server.nics || [];

              return (
                <div
                  key={server.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  {/* Server Header Bar */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleServer(server.id)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors mt-0.5"
                        title={expanded ? 'Klap VM lijst in' : 'Klap VM lijst uit'}
                      >
                        {expanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-700" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-700" />
                        )}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-base text-slate-900">
                            {server.naam}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-800 rounded-md">
                            Fysieke Server
                          </span>
                          {/* Gebouw badge if assigned */}
                          {gebouw && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                              <Building2 className="w-3 h-3 text-indigo-600" />
                              {gebouw.naam} {gebouw.code ? `(${gebouw.code})` : ''}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                              server.status === 'actief'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {server.status === 'actief' ? 'Actief' : server.status}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-200 text-slate-700 rounded-md">
                            {serverVms.length} {serverVms.length === 1 ? 'VM' : "VM's"}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                            {nics.length > 0 ? `${nics.length} NIC's` : `${server.nicAantal || 1} NIC's`}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="font-medium text-slate-700">{server.merkModel}</span>
                          {server.serienummer && (
                            <span className="font-mono text-slate-600">
                              SN: {server.serienummer}
                            </span>
                          )}
                          {server.locatie && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {server.locatie}
                            </span>
                          )}
                          {server.garantieEinddatum && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Garantie tot: {server.garantieEinddatum}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Server Action & IP Bar */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {/* IP Badge with copy */}
                      {server.ipAdres && (
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                          <span className="text-slate-400 mr-1.5 font-medium">Beheer IP:</span>
                          <span className="font-mono font-semibold text-slate-900 mr-2">
                            {server.ipAdres}
                          </span>
                          <button
                            onClick={() => copyToClipboard(server.ipAdres, `srv-ip-${server.id}`)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                            title="Kopieer IP-adres"
                          >
                            {copiedText === `srv-ip-${server.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      <button
                        id={`add-vm-to-server-${server.id}-btn`}
                        onClick={() => onAddVm(server.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                        title="Virtuele Machine toevoegen op deze host"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>VM Toevoegen</span>
                      </button>

                      <button
                        onClick={() => onEditServer(server)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                        title="Server bewerken"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteServer(server)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                        title="Server verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Server Notes if present */}
                  {server.notities && (
                    <div className="px-5 py-2 text-xs text-slate-600 bg-slate-50/30 border-b border-slate-100">
                      <strong>Notities:</strong> {server.notities}
                    </div>
                  )}

                  {/* ================= SERVER NIC DETAILS SECTION ================= */}
                  <div className="px-5 py-3 bg-slate-50/40 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Netwerkinterfaces ({nics.length > 0 ? nics.length : (server.nicAantal || 1)} NIC&apos;s)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        IP, MAC en VLAN configuratie per fysieke poort
                      </span>
                    </div>

                    {nics.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {nics.map((nic, idx) => (
                          <div
                            key={nic.id || idx}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 truncate">
                                {nic.naam || `NIC ${idx + 1}`}
                              </span>
                              {nic.vlan ? (
                                <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium font-mono">
                                  VLAN {nic.vlan}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Geen VLAN</span>
                              )}
                            </div>

                            <div className="space-y-1 text-[11px]">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">IP:</span>
                                <span className="font-mono font-semibold text-slate-800">
                                  {nic.ipAdres || '-'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">MAC:</span>
                                <span className="font-mono text-slate-600 text-[10px]">
                                  {nic.macAdres || '-'}
                                </span>
                              </div>
                              {nic.snelheid && (
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span className="text-slate-400">Snelheid:</span>
                                  <span>{nic.snelheid}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        {server.nicAantal ? `${server.nicAantal} netwerkpoorten aanwezig (klik op bewerken om IP/MAC/VLAN per NIC in te stellen)` : 'Geen specifieke netwerkkaarten gedocumenteerd.'}
                      </p>
                    )}
                  </div>

                  {/* Expandable Virtual Machines List */}
                  {expanded && (
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Virtuele Machines op deze host ({serverVms.length})
                          </h4>
                        </div>
                        <button
                          onClick={() => onAddVm(server.id)}
                          className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          VM Toevoegen
                        </button>
                      </div>

                      {serverVms.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            Geen virtuele machines gekoppeld aan deze server.
                          </p>
                          <button
                            onClick={() => onAddVm(server.id)}
                            className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                          >
                            + Virtuele machine toevoegen
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                              <tr>
                                <th className="py-2.5 px-3">VM Naam</th>
                                <th className="py-2.5 px-3">Functie / Rol</th>
                                <th className="py-2.5 px-3">Besturingssysteem</th>
                                <th className="py-2.5 px-3 font-mono">IP-Adres</th>
                                <th className="py-2.5 px-3 font-mono">MAC-Adres</th>
                                <th className="py-2.5 px-3">VLAN</th>
                                <th className="py-2.5 px-3">Specs (vCPU/RAM/Disk)</th>
                                <th className="py-2.5 px-3">Notities</th>
                                <th className="py-2.5 px-3 text-right">Acties</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {serverVms.map(vm => (
                                <tr key={vm.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                      {vm.naam}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {vm.functie}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">
                                    {vm.besturingssysteem}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                                    {vm.ipAdres ? (
                                      <div className="flex items-center gap-1">
                                        <span>{vm.ipAdres}</span>
                                        <button
                                          onClick={() => copyToClipboard(vm.ipAdres, `vm-ip-${vm.id}`)}
                                          className="text-slate-400 hover:text-slate-700 p-0.5"
                                          title="Kopieer IP"
                                        >
                                          {copiedText === `vm-ip-${vm.id}` ? (
                                            <Check className="w-3 h-3 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                                    {vm.macAdres ? (
                                      <div className="flex items-center gap-1">
                                        <span>{vm.macAdres}</span>
                                        <button
                                          onClick={() => copyToClipboard(vm.macAdres, `vm-mac-${vm.id}`)}
                                          className="text-slate-400 hover:text-slate-700 p-0.5"
                                          title="Kopieer MAC"
                                        >
                                          {copiedText === `vm-mac-${vm.id}` ? (
                                            <Check className="w-3 h-3 text-emerald-600" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    {vm.vlan ? (
                                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-medium">
                                        {vm.vlan}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600">
                                    <div className="flex items-center gap-1 text-[11px]">
                                      <span className="font-semibold text-slate-700">{vm.vcpu} vCPU</span>
                                      <span className="text-slate-300">/</span>
                                      <span className="font-semibold text-slate-700">{vm.ram}</span>
                                      <span className="text-slate-300">/</span>
                                      <span>{vm.schijfgrootte}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                                    {vm.notities || '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => onEditVm(vm)}
                                        className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="VM Bewerken"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteVm(vm)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                        title="VM Verwijderen"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= SECTION 2: NETWERKAPPARATUUR ================= */}
      {activeSubTab === 'apparaten' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Netwerkapparatuur op {vestiging.naam}
              </h3>
              <p className="text-xs text-slate-500">
                Overzicht van switches, routers, firewalls en Wi-Fi access points
                {selectedGebouwFilter !== 'all' && ' (gefilterd op gebouw)'}
              </p>
            </div>
            <button
              onClick={() => onAddApparaat(vestiging.id)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Apparaat Toevoegen
            </button>
          </div>

          {filteredApparaten.length === 0 ? (
            <div className="p-12 text-center">
              <Network className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-800">
                {selectedGebouwFilter !== 'all'
                  ? 'Geen apparaten gevonden voor dit gebouw'
                  : 'Nog geen netwerkapparaten geregistreerd'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Registreer switches, gateways of access points voor deze schoollocatie.
              </p>
              <button
                onClick={() => onAddApparaat(vestiging.id)}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Apparaat Toevoegen
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Apparaatnaam</th>
                    <th className="py-3 px-4">Gebouw</th>
                    <th className="py-3 px-4">Merk &amp; Model</th>
                    <th className="py-3 px-4 font-mono">IP-Adres</th>
                    <th className="py-3 px-4 font-mono">MAC-Adres</th>
                    <th className="py-3 px-4">VLAN</th>
                    <th className="py-3 px-4">Locatie / Patchkast</th>
                    <th className="py-3 px-4">Poorten / Specificatie</th>
                    <th className="py-3 px-4">Notities</th>
                    <th className="py-3 px-4 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApparaten.map(dev => {
                    const gebouw = dev.gebouwId ? gebouwMap.get(dev.gebouwId) : null;

                    return (
                      <tr key={dev.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wide ${
                              dev.type === 'switch'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : dev.type === 'firewall'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : dev.type === 'access-point'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {dev.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {dev.naam}
                        </td>
                        <td className="py-3 px-4">
                          {gebouw ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                              <Building2 className="w-3 h-3 text-indigo-600" />
                              {gebouw.naam}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {dev.merkModel || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {dev.ipAdres ? (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900">{dev.ipAdres}</span>
                              <button
                                onClick={() => copyToClipboard(dev.ipAdres, `dev-ip-${dev.id}`)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Kopieer IP"
                              >
                                {copiedText === `dev-ip-${dev.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {dev.macAdres ? (
                            <div className="flex items-center gap-1">
                              <span>{dev.macAdres}</span>
                              <button
                                onClick={() => copyToClipboard(dev.macAdres, `dev-mac-${dev.id}`)}
                                className="text-slate-400 hover:text-slate-700 p-0.5"
                                title="Kopieer MAC"
                              >
                                {copiedText === `dev-mac-${dev.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {dev.vlan ? (
                            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-medium">
                              {dev.vlan}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {dev.locatie || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {dev.poorten || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {dev.notities || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onEditApparaat(dev)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                              title="Bewerken"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteApparaat(dev)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Verwijderen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
