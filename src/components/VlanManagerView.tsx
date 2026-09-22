import React, { useState, useMemo } from 'react';
import {
  Network,
  Plus,
  Search,
  Filter,
  Server,
  Cpu,
  Layers,
  Edit2,
  Trash2,
  Globe2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Radio
} from 'lucide-react';
import { InfrastructureDatabase, Vlan, Vestiging, FysiekeServer, VirtueleMachine, Netwerkapparaat } from '../types';

interface VlanManagerViewProps {
  db: InfrastructureDatabase;
  onOpenAddVlan: (defaultVestigingId?: string) => void;
  onEditVlan: (vlan: Vlan) => void;
  onDeleteVlan: (vlan: Vlan) => Promise<void>;
  onAddPresetVlans?: () => Promise<void>;
  onSelectVestiging: (vestigingId: string) => void;
}

export const VlanManagerView: React.FC<VlanManagerViewProps> = ({
  db,
  onOpenAddVlan,
  onEditVlan,
  onDeleteVlan,
  onAddPresetVlans,
  onSelectVestiging
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVestigingFilter, setSelectedVestigingFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteVlan, setConfirmDeleteVlan] = useState<Vlan | null>(null);

  const vlans = db.vlans || [];
  const vestigingen = db.vestigingen || [];
  const servers = db.servers || [];
  const vms = db.vms || [];
  const apparaten = db.apparaten || [];

  // Helper to get connected items for a VLAN
  const getConnectedEntities = (vlan: Vlan) => {
    const vlanTagStr = String(vlan.vlanId);

    // Connected Server NICs
    const connectedNics: Array<{ server: FysiekeServer; nicName: string; ip?: string }> = [];
    servers.forEach(srv => {
      if (srv.nics) {
        srv.nics.forEach(nic => {
          if (nic.vlan) {
            // Check if string contains the VLAN number or matches
            const match = nic.vlan === vlanTagStr ||
              nic.vlan.includes(`VLAN ${vlanTagStr}`) ||
              nic.vlan.includes(`vlan ${vlanTagStr}`) ||
              nic.vlan.startsWith(`${vlanTagStr} `) ||
              nic.vlan.includes(`(${vlanTagStr})`);
            if (match) {
              connectedNics.push({ server: srv, nicName: nic.naam, ip: nic.ipAdres });
            }
          }
        });
      }
    });

    // Connected VMs
    const connectedVms = vms.filter(vm => {
      if (!vm.vlan) return false;
      return (
        vm.vlan === vlanTagStr ||
        vm.vlan.includes(`VLAN ${vlanTagStr}`) ||
        vm.vlan.includes(`vlan ${vlanTagStr}`) ||
        vm.vlan.startsWith(`${vlanTagStr} `) ||
        vm.vlan.includes(`(${vlanTagStr})`)
      );
    });

    // Connected Network Devices
    const connectedApparaten = apparaten.filter(app => {
      if (!app.vlan) return false;
      return (
        app.vlan === vlanTagStr ||
        app.vlan.includes(`VLAN ${vlanTagStr}`) ||
        app.vlan.includes(`vlan ${vlanTagStr}`) ||
        app.vlan.startsWith(`${vlanTagStr} `) ||
        app.vlan.includes(`(${vlanTagStr})`)
      );
    });

    return { connectedNics, connectedVms, connectedApparaten };
  };

  // Filtered VLANs
  const filteredVlans = useMemo(() => {
    return vlans.filter(vlan => {
      // Vestiging filter
      if (selectedVestigingFilter !== 'all') {
        if (vlan.vestigingId && vlan.vestigingId !== selectedVestigingFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = String(vlan.vlanId).includes(q);
        const matchesName = vlan.naam.toLowerCase().includes(q);
        const matchesSubnet = (vlan.subnet || '').toLowerCase().includes(q);
        const matchesGateway = (vlan.gateway || '').toLowerCase().includes(q);
        const matchesDesc = (vlan.beschrijving || '').toLowerCase().includes(q);
        return matchesId || matchesName || matchesSubnet || matchesGateway || matchesDesc;
      }

      return true;
    }).sort((a, b) => a.vlanId - b.vlanId);
  }, [vlans, selectedVestigingFilter, searchQuery]);

  // Overall statistics
  const totalNicsLinked = useMemo(() => {
    let count = 0;
    servers.forEach(s => {
      (s.nics || []).forEach(n => {
        if (n.vlan && n.vlan.trim() !== '') count++;
      });
    });
    return count;
  }, [servers]);

  const totalVmsLinked = useMemo(() => {
    return vms.filter(v => v.vlan && v.vlan.trim() !== '').length;
  }, [vms]);

  const handleDelete = async (vlan: Vlan) => {
    try {
      setDeletingId(vlan.id);
      await onDeleteVlan(vlan);
      setConfirmDeleteVlan(null);
    } finally {
      setDeletingId(null);
    }
  };

  const getColorClasses = (colorName?: string) => {
    switch (colorName) {
      case 'indigo':
        return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', tag: 'bg-indigo-600 text-white' };
      case 'blue':
        return { badge: 'bg-blue-50 text-blue-700 border-blue-200', tag: 'bg-blue-600 text-white' };
      case 'emerald':
        return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', tag: 'bg-emerald-600 text-white' };
      case 'amber':
        return { badge: 'bg-amber-50 text-amber-800 border-amber-200', tag: 'bg-amber-600 text-white' };
      case 'purple':
        return { badge: 'bg-purple-50 text-purple-700 border-purple-200', tag: 'bg-purple-600 text-white' };
      case 'rose':
        return { badge: 'bg-rose-50 text-rose-700 border-rose-200', tag: 'bg-rose-600 text-white' };
      case 'cyan':
        return { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', tag: 'bg-cyan-600 text-white' };
      default:
        return { badge: 'bg-slate-100 text-slate-800 border-slate-200', tag: 'bg-slate-700 text-white' };
    }
  };

  return (
    <div id="vlan-manager-container" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                VLAN Beheer &amp; Netwerksegmentatie
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {vlans.length} {vlans.length === 1 ? 'VLAN' : 'VLAN\'s'}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Beheer alle virtuele netwerken (VLAN tags, subnets, gateways) van uw scholengemeenschap. 
                Eenmaal aangemaakt kunt u ze eenvoudig en consistent selecteren bij server-NIC&apos;s, virtuele machines en netwerkswitches.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-add-vlan-top"
              type="button"
              onClick={() => onOpenAddVlan()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nieuw VLAN Toevoegen
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Geconfigureerde VLAN&apos;s</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{vlans.length}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Server NIC Toewijzingen</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{totalNicsLinked}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Virtuele Machine Interfaces</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{totalVmsLinked}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actieve Vestigingen</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{vestigingen.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="vlan-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Zoek op VLAN ID, naam, subnet of gateway..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
            />
          </div>

          {/* Vestiging Filter */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="vlan-vestiging-filter"
              value={selectedVestigingFilter}
              onChange={e => setSelectedVestigingFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
            >
              <option value="all">Alle scopes (Centraal &amp; Per vestiging)</option>
              {vestigingen.map(v => (
                <option key={v.id} value={v.id}>
                  Vestiging: {v.naam}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 shrink-0">
          Weergave: <strong>{filteredVlans.length}</strong> van <strong>{vlans.length}</strong> VLAN&apos;s
        </div>
      </div>

      {/* VLAN Cards / List */}
      {filteredVlans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Network className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {vlans.length === 0 ? 'Geen VLAN\'s aangemaakt' : 'Geen VLAN\'s gevonden voor deze zoekopdracht'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {vlans.length === 0
              ? 'Begin met het definiëren van uw VLAN\'s (zoals VLAN 10 voor beheer of VLAN 20 voor servers). Daarna kunt u ze direct met één klik toewijzen aan server netwerkpoorten.'
              : 'Probeer een andere zoekterm of pas het vestigingsfilter aan.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-empty-add-vlan"
              type="button"
              onClick={() => onOpenAddVlan()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Eerste VLAN Aanmaken
            </button>

            {vlans.length === 0 && onAddPresetVlans && (
              <button
                id="btn-empty-add-presets"
                type="button"
                onClick={onAddPresetVlans}
                className="px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Standaard Schoolnetwerk Templates Inladen
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVlans.map(vlan => {
            const colors = getColorClasses(vlan.kleur);
            const { connectedNics, connectedVms, connectedApparaten } = getConnectedEntities(vlan);
            const linkedVestiging = vlan.vestigingId ? vestigingen.find(v => v.id === vlan.vestigingId) : null;

            return (
              <div
                key={vlan.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: VLAN ID badge & Scope & Actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wide shadow-2xs flex items-center gap-1.5 ${colors.tag}`}>
                        <Hash className="w-3 h-3 opacity-80" />
                        VLAN {vlan.vlanId}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {vlan.naam}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        title="VLAN Bewerken"
                        onClick={() => onEditVlan(vlan)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="VLAN Verwijderen"
                        onClick={() => setConfirmDeleteVlan(vlan)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Scope badge */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                    {linkedVestiging ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <Building2 className="w-3 h-3" />
                        Vestiging: {linkedVestiging.naam}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Globe2 className="w-3 h-3 text-slate-500" />
                        Geldig voor alle vestigingen
                      </span>
                    )}

                    {vlan.subnet && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-50 text-slate-700 border border-slate-200">
                        Subnet: {vlan.subnet}
                      </span>
                    )}
                  </div>

                  {/* Network parameters details */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs mb-3">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Gateway</div>
                      <div className="font-mono text-slate-800 font-medium truncate">
                        {vlan.gateway || <span className="text-slate-400 font-normal italic">Niet opgegeven</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">DHCP Pool</div>
                      <div className="font-mono text-slate-800 font-medium truncate">
                        {vlan.dhcpRange || <span className="text-slate-400 font-normal italic">Statisch / Geen</span>}
                      </div>
                    </div>
                  </div>

                  {/* Description if present */}
                  {vlan.beschrijving && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {vlan.beschrijving}
                    </p>
                  )}
                </div>

                {/* Connected resources footer */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Gekoppelde Interfaces ({connectedNics.length + connectedVms.length + connectedApparaten.length})</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {connectedNics.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200" title={`${connectedNics.length} server NIC interfaces`}>
                        <Server className="w-3 h-3" />
                        {connectedNics.length} {connectedNics.length === 1 ? 'Server NIC' : 'Server NIC\'s'}
                      </span>
                    )}

                    {connectedVms.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title={`${connectedVms.length} virtuele machines`}>
                        <Cpu className="w-3 h-3" />
                        {connectedVms.length} {connectedVms.length === 1 ? 'VM' : 'VM\'s'}
                      </span>
                    )}

                    {connectedApparaten.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200" title={`${connectedApparaten.length} netwerkapparaten`}>
                        <Layers className="w-3 h-3" />
                        {connectedApparaten.length} {connectedApparaten.length === 1 ? 'Apparaat' : 'Apparaten'}
                      </span>
                    )}

                    {connectedNics.length === 0 && connectedVms.length === 0 && connectedApparaten.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        Nog niet gekoppeld aan NIC&apos;s of VM&apos;s
                      </span>
                    )}
                  </div>

                  {/* Connected NIC preview tags */}
                  {connectedNics.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-50 flex flex-wrap gap-1">
                      {connectedNics.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          <Server className="w-2.5 h-2.5 text-slate-400" />
                          <span className="font-semibold">{item.server.naam}</span>: {item.nicName}
                        </span>
                      ))}
                      {connectedNics.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{connectedNics.length - 3} meer
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteVlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  VLAN {confirmDeleteVlan.vlanId} verwijderen?
                </h3>
                <p className="text-xs text-slate-500">
                  Weet u zeker dat u &apos;{confirmDeleteVlan.naam}&apos; wilt verwijderen?
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Reeds gekoppelde NIC&apos;s en apparaten behouden hun tekstwaarde, maar dit VLAN zal niet meer als suggestie verschijnen in de dropdowns.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteVlan(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                id="btn-confirm-delete-vlan"
                type="button"
                disabled={deletingId === confirmDeleteVlan.id}
                onClick={() => handleDelete(confirmDeleteVlan)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingId === confirmDeleteVlan.id ? 'Bezig met verwijderen...' : 'Ja, Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
