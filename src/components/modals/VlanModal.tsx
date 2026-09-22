import React, { useState, useEffect } from 'react';
import { X, Network, Hash, Tag, Layers, Server, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import { Vlan, Vestiging } from '../../types';

interface VlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vlan>) => Promise<void>;
  initialData?: Vlan | null;
  defaultVestigingId?: string;
  vestigingen: Vestiging[];
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300', dot: 'bg-indigo-600' },
  { id: 'blue', label: 'Blauw', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-600' },
  { id: 'emerald', label: 'Groen', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-600' },
  { id: 'amber', label: 'Oranje/Geel', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-600' },
  { id: 'purple', label: 'Paars', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-600' },
  { id: 'rose', label: 'Rood/Roze', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300', dot: 'bg-rose-600' },
  { id: 'cyan', label: 'Cyaan', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300', dot: 'bg-cyan-600' },
  { id: 'slate', label: 'Grijs', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', dot: 'bg-slate-600' },
];

const PRESET_VLANS = [
  { id: 10, naam: 'Beheer & iDRAC / Netwerk', subnet: '10.x.1.0/24', kleur: 'indigo' },
  { id: 20, naam: 'Servers & Productie', subnet: '10.x.20.0/24', kleur: 'blue' },
  { id: 30, naam: 'Docenten & Administratie', subnet: '10.x.30.0/24', kleur: 'emerald' },
  { id: 40, naam: 'Leerlingen & Wi-Fi', subnet: '10.x.40.0/22', kleur: 'amber' },
  { id: 50, naam: 'Storage / SAN (iSCSI)', subnet: '10.x.50.0/24', kleur: 'purple' },
  { id: 60, naam: 'VoIP Telefonie', subnet: '10.x.60.0/24', kleur: 'cyan' },
  { id: 70, naam: 'Beveiliging & Camera\'s', subnet: '10.x.70.0/24', kleur: 'rose' },
  { id: 99, naam: 'Gastennetwerk (Geïsoleerd)', subnet: '172.16.99.0/24', kleur: 'slate' }
];

export const VlanModal: React.FC<VlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultVestigingId,
  vestigingen
}) => {
  const [vlanId, setVlanId] = useState<number | ''>(10);
  const [naam, setNaam] = useState('');
  const [vestigingId, setVestigingId] = useState<string>('all');
  const [subnet, setSubnet] = useState('');
  const [gateway, setGateway] = useState('');
  const [dhcpRange, setDhcpRange] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [kleur, setKleur] = useState('blue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVlanId(initialData.vlanId);
      setNaam(initialData.naam || '');
      setVestigingId(initialData.vestigingId || 'all');
      setSubnet(initialData.subnet || '');
      setGateway(initialData.gateway || '');
      setDhcpRange(initialData.dhcpRange || '');
      setBeschrijving(initialData.beschrijving || '');
      setKleur(initialData.kleur || 'blue');
    } else {
      setVlanId('');
      setNaam('');
      setVestigingId(defaultVestigingId || 'all');
      setSubnet('');
      setGateway('');
      setDhcpRange('');
      setBeschrijving('');
      setKleur('blue');
    }
    setError(null);
  }, [initialData, defaultVestigingId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numId = typeof vlanId === 'number' ? vlanId : parseInt(String(vlanId), 10);
    if (isNaN(numId) || numId < 1 || numId > 4094) {
      setError('VLAN ID moet een getal tussen 1 en 4094 zijn.');
      return;
    }
    if (!naam.trim()) {
      setError('VLAN naam is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        vlanId: numId,
        naam: naam.trim(),
        vestigingId: vestigingId === 'all' ? undefined : vestigingId,
        subnet: subnet.trim() || undefined,
        gateway: gateway.trim() || undefined,
        dhcpRange: dhcpRange.trim() || undefined,
        beschrijving: beschrijving.trim() || undefined,
        kleur
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan van VLAN.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_VLANS[0]) => {
    setVlanId(preset.id);
    setNaam(preset.naam);
    setSubnet(preset.subnet);
    setKleur(preset.kleur);
    if (!gateway && preset.subnet.includes('/24')) {
      const base = preset.subnet.split('.')[0] + '.' + preset.subnet.split('.')[1];
      setGateway(`${base}.${preset.id}.1`);
    }
  };

  return (
    <div id="vlan-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {initialData ? `VLAN ${initialData.vlanId} Bewerken` : 'Nieuw VLAN Aanmaken'}
              </h2>
              <p className="text-xs text-slate-500">
                Configureer het virtuele LAN zodat u dit direct kunt toewijzen aan server-NIC&apos;s, VM&apos;s en apparaten.
              </p>
            </div>
          </div>
          <button
            id="close-vlan-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets (only for new VLAN) */}
        {!initialData && (
          <div className="px-6 pt-3.5 pb-2 bg-slate-50/80 border-b border-slate-100">
            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Snel invullen vanuit schoolnetwerk standaarden:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_VLANS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2 py-0.5 text-[11px] font-medium rounded border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 transition-colors"
                >
                  VLAN {p.id}: {p.naam.split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* VLAN ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                VLAN ID (Tag) *
              </label>
              <input
                id="input-vlan-id"
                type="number"
                min="1"
                max="4094"
                value={vlanId}
                onChange={e => setVlanId(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="bv. 10, 20"
                required
                className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              />
              <span className="text-[10px] text-slate-400">1 - 4094 (IEEE 802.1Q)</span>
            </div>

            {/* VLAN Naam */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                VLAN Naam *
              </label>
              <input
                id="input-vlan-naam"
                type="text"
                value={naam}
                onChange={e => setNaam(e.target.value)}
                placeholder="bv. Beheer & iDRAC of Servers & Storage"
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* Vestiging Scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-slate-400" />
              Geldigheid / Vestiging
            </label>
            <select
              id="select-vlan-vestiging"
              value={vestigingId}
              onChange={e => setVestigingId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
            >
              <option value="all">🌐 Geldig voor alle vestigingen (Centraal VLAN schema)</option>
              {vestigingen.map(v => (
                <option key={v.id} value={v.id}>
                  📍 Alleen voor vestiging: {v.naam}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">
              Kies &apos;Alle vestigingen&apos; als hetzelfde VLAN-nummer schoolbreed wordt gehanteerd.
            </span>
          </div>

          {/* Subnet & Gateway */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IP Subnet / CIDR (optioneel)
              </label>
              <input
                id="input-vlan-subnet"
                type="text"
                value={subnet}
                onChange={e => setSubnet(e.target.value)}
                placeholder="bv. 10.10.10.0/24"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Gateway (optioneel)
              </label>
              <input
                id="input-vlan-gateway"
                type="text"
                value={gateway}
                onChange={e => setGateway(e.target.value)}
                placeholder="bv. 10.10.10.1 of Niet gerouteerd"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
              />
            </div>
          </div>

          {/* DHCP Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              DHCP Scope / Pool (optioneel)
            </label>
            <input
              id="input-vlan-dhcp"
              type="text"
              value={dhcpRange}
              onChange={e => setDhcpRange(e.target.value)}
              placeholder="bv. 10.10.10.100 - 10.10.10.250 of Geen (Statisch)"
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
            />
          </div>

          {/* Kleurselectie */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Badge Kleur (voor herkenbaarheid)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => {
                const isSelected = kleur === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setKleur(c.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                      isSelected
                        ? `${c.bg} ${c.text} ${c.border} ring-2 ring-indigo-500 ring-offset-1`
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Beschrijving */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Toelichting / Notities (optioneel)
            </label>
            <textarea
              id="input-vlan-beschrijving"
              rows={2}
              value={beschrijving}
              onChange={e => setBeschrijving(e.target.value)}
              placeholder="bv. Gekoppeld aan port-channels van core switch, Jumbo frames ingeschakeld, routing via FortiGate..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
            />
          </div>

          {/* Knoppen */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              id="save-vlan-btn"
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Network className="w-3.5 h-3.5" />
              {loading ? 'Bezig met opslaan...' : initialData ? 'VLAN Bijwerken' : 'VLAN Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
