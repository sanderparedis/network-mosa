import React, { useState, useEffect } from 'react';
import { X, Layers, AlertTriangle, Globe, Network, Cpu, HardDrive, Terminal } from 'lucide-react';
import { VirtueleMachine, FysiekeServer, Vestiging, InfrastructureDatabase } from '../../types';
import { validateIpAddress, formatMacAddress } from '../../utils/ipHelper';
import { VlanSelector } from '../VlanSelector';

interface VmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VirtueleMachine>) => Promise<void>;
  initialData?: VirtueleMachine | null;
  defaultServerId?: string;
  servers: FysiekeServer[];
  vestigingen: Vestiging[];
  db: InfrastructureDatabase;
  onOpenAddVlan?: () => void;
}

export const VmModal: React.FC<VmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultServerId,
  servers,
  vestigingen,
  db,
  onOpenAddVlan
}) => {
  const [serverId, setServerId] = useState('');
  const [naam, setNaam] = useState('');
  const [functie, setFunctie] = useState('');
  const [besturingssysteem, setBesturingssysteem] = useState('');
  const [ipAdres, setIpAdres] = useState('');
  const [macAdres, setMacAdres] = useState('');
  const [vlan, setVlan] = useState('');
  const [vcpu, setVcpu] = useState('');
  const [ram, setRam] = useState('');
  const [schijfgrootte, setSchijfgrootte] = useState('');
  const [notities, setNotities] = useState('');
  const [status, setStatus] = useState<'actief' | 'gestopt' | 'inactief'>('actief');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vestigingMap = new Map(vestigingen.map(v => [v.id, v.naam]));

  useEffect(() => {
    if (initialData) {
      setServerId(initialData.serverId || '');
      setNaam(initialData.naam || '');
      setFunctie(initialData.functie || '');
      setBesturingssysteem(initialData.besturingssysteem || '');
      setIpAdres(initialData.ipAdres || '');
      setMacAdres(initialData.macAdres || '');
      setVlan(initialData.vlan || '');
      setVcpu(initialData.vcpu || '');
      setRam(initialData.ram || '');
      setSchijfgrootte(initialData.schijfgrootte || '');
      setNotities(initialData.notities || '');
      setStatus(initialData.status || 'actief');
    } else {
      setServerId(defaultServerId || (servers[0]?.id || ''));
      setNaam('');
      setFunctie('');
      setBesturingssysteem('Windows Server 2022');
      setIpAdres('');
      setMacAdres('');
      setVlan('');
      setVcpu('4 vCPU');
      setRam('16 GB');
      setSchijfgrootte('120 GB SSD');
      setNotities('');
      setStatus('actief');
    }
    setError(null);
  }, [initialData, defaultServerId, servers, isOpen]);

  if (!isOpen) return null;

  // Determine vestiging of the selected host server
  const selectedServer = servers.find(s => s.id === serverId);
  const targetVestigingId = selectedServer ? selectedServer.vestigingId : '';

  // Real-time IP collision check
  const ipCheck = validateIpAddress(ipAdres, targetVestigingId, initialData?.id, db);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverId) {
      setError('Selecteer een fysieke host server.');
      return;
    }
    if (!naam.trim()) {
      setError('VM-naam is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        serverId,
        naam: naam.trim(),
        functie: functie.trim(),
        besturingssysteem: besturingssysteem.trim(),
        ipAdres: ipAdres.trim(),
        macAdres: macAdres.trim().toUpperCase(),
        vlan: vlan.trim() || undefined,
        vcpu: vcpu.trim(),
        ram: ram.trim(),
        schijfgrootte: schijfgrootte.trim(),
        notities: notities.trim(),
        status
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan.');
    } finally {
      setLoading(false);
    }
  };

  const commonRoles = [
    'Domeincontroller (AD DS, DNS, DHCP)',
    'Bestandsserver (Documenten & Mappen)',
    'Printserver & Beheer',
    'Leerlingvolgsysteem / Administratie',
    'Backup & Replication (Veeam)',
    'Applicatieserver',
    'Webserver / Portaal',
    'SQL Databaseserver',
    'Licentieserver'
  ];

  return (
    <div id="vm-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Virtuele Machine (VM) Bewerken' : 'Nieuwe Virtuele Machine Toevoegen'}
            </h2>
          </div>
          <button
            id="close-vm-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fysieke Host Server <span className="text-rose-500">*</span>
              </label>
              <select
                id="vm-server-select"
                value={serverId}
                onChange={e => setServerId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
              >
                {servers.length === 0 ? (
                  <option value="">Geen servers beschikbaar - maak eerst een server aan</option>
                ) : (
                  servers.map(s => {
                    const vName = vestigingMap.get(s.vestigingId) || 'Vestiging';
                    return (
                      <option key={s.id} value={s.id}>
                        {s.naam} ({vName})
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                VM Naam <span className="text-rose-500">*</span>
              </label>
              <input
                id="vm-naam-input"
                type="text"
                required
                placeholder="bv. VM-CENTRUM-DC01"
                value={naam}
                onChange={e => setNaam(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Functie / Rol
              </label>
              <input
                id="vm-functie-input"
                type="text"
                list="vm-rollen-list"
                placeholder="bv. Domeincontroller (AD DS, DNS)"
                value={functie}
                onChange={e => setFunctie(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
              <datalist id="vm-rollen-list">
                {commonRoles.map(r => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Besturingssysteem (OS)
              </label>
              <div className="relative">
                <Terminal className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vm-os-input"
                  type="text"
                  placeholder="bv. Windows Server 2022 of Ubuntu 24.04"
                  value={besturingssysteem}
                  onChange={e => setBesturingssysteem(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Network: IP and MAC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                IP-adres
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vm-ip-input"
                  type="text"
                  placeholder="bv. 10.10.1.11"
                  value={ipAdres}
                  onChange={e => setIpAdres(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 text-slate-800 font-mono ${
                    ipCheck.isDuplicate
                      ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500'
                      : 'border-slate-200 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                MAC-adres
              </label>
              <div className="relative">
                <Network className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vm-mac-input"
                  type="text"
                  placeholder="00:15:5D:10:01:11"
                  value={macAdres}
                  onChange={e => setMacAdres(formatMacAddress(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* VLAN Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Netwerk VLAN (Virtueel LAN)
            </label>
            <VlanSelector
              value={vlan}
              onChange={setVlan}
              vlans={db.vlans || []}
              vestigingId={targetVestigingId}
              onOpenAddVlan={onOpenAddVlan}
              idPrefix="vm-vlan-selector"
              placeholder="Selecteer of typ een VLAN (bv. VLAN 20 (Servers))"
            />
          </div>

          {/* Duplicate IP Warning */}
          {ipCheck.isDuplicate && (
            <div id="vm-ip-warning" className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">
                  {ipCheck.isSameVestiging
                    ? 'Waarschuwing: IP-adres is al in gebruik binnen deze vestiging!'
                    : 'Let op: Dit IP-adres is in gebruik op een andere vestiging!'}
                </span>
                <p className="mt-0.5 text-amber-700">
                  Al in gebruik bij:{' '}
                  {ipCheck.conflicts.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ', '}
                      <strong>{c.typeLabel} &quot;{c.naam}&quot;</strong> ({c.vestigingNaam})
                    </span>
                  ))}
                  . (U kunt dit formulier wel gewoon opslaan).
                </p>
              </div>
            </div>
          )}

          {/* Specs: vCPU, RAM, Disk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                vCPU
              </label>
              <div className="relative">
                <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vm-vcpu-input"
                  type="text"
                  placeholder="bv. 4 vCPU"
                  value={vcpu}
                  onChange={e => setVcpu(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                RAM Geheugen
              </label>
              <input
                id="vm-ram-input"
                type="text"
                placeholder="bv. 16 GB"
                value={ram}
                onChange={e => setRam(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Schijfgrootte (Opslag)
              </label>
              <div className="relative">
                <HardDrive className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vm-disk-input"
                  type="text"
                  placeholder="bv. 120 GB SSD"
                  value={schijfgrootte}
                  onChange={e => setSchijfgrootte(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              id="vm-status-select"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="actief">Actief (Draaiend)</option>
              <option value="gestopt">Uitgeschakeld / Gestopt</option>
              <option value="inactief">Gearchiveerd / Niet in gebruik</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notities & Beheerinformatie
            </label>
            <textarea
              id="vm-notities-input"
              rows={3}
              placeholder="bv. Back-upschema, specifieke softwarelicenties, beheeraccounts, shares..."
              value={notities}
              onChange={e => setNotities(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="cancel-vm-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              id="save-vm-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {loading ? 'Opslaan...' : initialData ? 'Wijzigingen Opslaan' : 'VM Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
