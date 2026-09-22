import React, { useState, useEffect } from 'react';
import { X, Network, AlertTriangle, Globe, MapPin, Tag, Building2 } from 'lucide-react';
import { Netwerkapparaat, NetwerkapparaatType, Vestiging, InfrastructureDatabase } from '../../types';
import { validateIpAddress, formatMacAddress } from '../../utils/ipHelper';
import { VlanSelector } from '../VlanSelector';

interface ApparaatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Netwerkapparaat>) => Promise<void>;
  initialData?: Netwerkapparaat | null;
  defaultVestigingId?: string;
  vestigingen: Vestiging[];
  db: InfrastructureDatabase;
  onOpenAddVlan?: () => void;
}

export const ApparaatModal: React.FC<ApparaatModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultVestigingId,
  vestigingen,
  db,
  onOpenAddVlan
}) => {
  const [vestigingId, setVestigingId] = useState('');
  const [gebouwId, setGebouwId] = useState('');
  const [naam, setNaam] = useState('');
  const [type, setType] = useState<NetwerkapparaatType>('switch');
  const [merkModel, setMerkModel] = useState('');
  const [ipAdres, setIpAdres] = useState('');
  const [macAdres, setMacAdres] = useState('');
  const [vlan, setVlan] = useState('');
  const [locatie, setLocatie] = useState('');
  const [poorten, setPoorten] = useState('');
  const [notities, setNotities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVestigingId(initialData.vestigingId);
      setGebouwId(initialData.gebouwId || '');
      setNaam(initialData.naam || '');
      setType(initialData.type || 'switch');
      setMerkModel(initialData.merkModel || '');
      setIpAdres(initialData.ipAdres || '');
      setMacAdres(initialData.macAdres || '');
      setVlan(initialData.vlan || '');
      setLocatie(initialData.locatie || '');
      setPoorten(initialData.poorten || '');
      setNotities(initialData.notities || '');
    } else {
      setVestigingId(defaultVestigingId || (vestigingen[0]?.id || ''));
      setGebouwId('');
      setNaam('');
      setType('switch');
      setMerkModel('');
      setIpAdres('');
      setMacAdres('');
      setVlan('10 (Beheer)');
      setLocatie('');
      setPoorten('48x 1GE PoE+, 4x SFP+');
      setNotities('');
    }
    setError(null);
  }, [initialData, defaultVestigingId, vestigingen, isOpen]);

  if (!isOpen) return null;

  const beschikbareGebouwen = (db.gebouwen || []).filter(g => g.vestigingId === vestigingId);

  // Real-time IP collision check
  const ipCheck = validateIpAddress(ipAdres, vestigingId, initialData?.id, db);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vestigingId) {
      setError('Selecteer een vestiging.');
      return;
    }
    if (!naam.trim()) {
      setError('Naam van het netwerkapparaat is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        vestigingId,
        gebouwId: gebouwId || undefined,
        naam: naam.trim(),
        type,
        merkModel: merkModel.trim(),
        ipAdres: ipAdres.trim(),
        macAdres: macAdres.trim().toUpperCase(),
        vlan: vlan.trim(),
        locatie: locatie.trim(),
        poorten: poorten.trim(),
        notities: notities.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="apparaat-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Netwerkapparaat Bewerken' : 'Nieuw Netwerkapparaat Toevoegen'}
            </h2>
          </div>
          <button
            id="close-apparaat-modal-btn"
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
                Vestiging <span className="text-rose-500">*</span>
              </label>
              <select
                id="apparaat-vestiging-select"
                value={vestigingId}
                onChange={e => {
                  setVestigingId(e.target.value);
                  setGebouwId('');
                }}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white"
              >
                {vestigingen.length === 0 && (
                  <option value="">(Geen vestigingen - voeg eerst een vestiging toe)</option>
                )}
                {vestigingen.map(v => (
                  <option key={v.id} value={v.id}>{v.naam}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gebouw / Vleugel
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="apparaat-gebouw-select"
                  value={gebouwId}
                  onChange={e => setGebouwId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white"
                >
                  <option value="">-- Geen specifiek gebouw --</option>
                  {beschikbareGebouwen.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.naam} {g.code ? `(${g.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Apparaattype
              </label>
              <select
                id="apparaat-type-select"
                value={type}
                onChange={e => setType(e.target.value as NetwerkapparaatType)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white font-medium"
              >
                <option value="switch">Switch (Core / Edge / Distributie)</option>
                <option value="firewall">Firewall / Security Gateway</option>
                <option value="router">Router / WAN Gateway</option>
                <option value="access-point">Access Point (Wi-Fi)</option>
                <option value="overig">Overig Netwerkapparaat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Naam / Hostnaam <span className="text-rose-500">*</span>
              </label>
              <input
                id="apparaat-naam-input"
                type="text"
                required
                placeholder="bv. SW-CENTRUM-CORE01 of AP-NOORD-01"
                value={naam}
                onChange={e => setNaam(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Merk & Model
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="apparaat-merk-model-input"
                  type="text"
                  placeholder="bv. Aruba CX 6200F of Cisco Catalyst"
                  value={merkModel}
                  onChange={e => setMerkModel(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Poorten / Capaciteit
              </label>
              <input
                id="apparaat-poorten-input"
                type="text"
                placeholder="bv. 48x 1GE PoE+, 4x 10G SFP+"
                value={poorten}
                onChange={e => setPoorten(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Beheer IP-adres
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="apparaat-ip-input"
                  type="text"
                  placeholder="bv. 10.10.1.2 of 192.168.1.2"
                  value={ipAdres}
                  onChange={e => setIpAdres(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 text-slate-800 font-mono ${
                    ipCheck.isDuplicate
                      ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500'
                      : 'border-slate-200 focus:ring-purple-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                MAC-adres
              </label>
              <input
                id="apparaat-mac-input"
                type="text"
                placeholder="20:4C:03:D4:55:10"
                value={macAdres}
                onChange={e => setMacAdres(formatMacAddress(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Beheer VLAN
              </label>
              <VlanSelector
                value={vlan}
                onChange={setVlan}
                vlans={db.vlans || []}
                vestigingId={vestigingId}
                onOpenAddVlan={onOpenAddVlan}
                idPrefix="apparaat-vlan-selector"
                placeholder="bv. 10 (Beheer) of Trunk"
              />
            </div>
          </div>

          {/* Validation warning */}
          {ipCheck.isDuplicate && (
            <div id="apparaat-ip-warning" className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">
                  {ipCheck.isSameVestiging
                    ? 'Waarschuwing: IP-adres is al in gebruik binnen deze vestiging!'
                    : 'Let op: Dit IP-adres is al in gebruik op een andere vestiging!'}
                </span>
                <p className="mt-0.5 text-amber-700">
                  Al in gebruik bij:{' '}
                  {ipCheck.conflicts.map((c, i) => (
                    <span key={c.id}>
                      {i > 0 && ', '}
                      <strong>{c.typeLabel} &quot;{c.naam}&quot;</strong> ({c.vestigingNaam})
                    </span>
                  ))}
                  . (Niet hard geblokkeerd).
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Locatie / Patchkast
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="apparaat-locatie-input"
                  type="text"
                  placeholder="bv. Patchkast 1e verdieping Vleugel B"
                  value={locatie}
                  onChange={e => setLocatie(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Poorten / Capaciteit
              </label>
              <input
                id="apparaat-poorten-input"
                type="text"
                placeholder="bv. 48x 1GE PoE+, 4x 10GE SFP+"
                value={poorten}
                onChange={e => setPoorten(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notities, VLANs & Beheer
            </label>
            <textarea
              id="apparaat-notities-input"
              rows={3}
              placeholder="bv. Uplink poort 49 naar core, VLAN 10 (Admin), VLAN 20 (Leerlingen), VLAN 30 (VoIP)..."
              value={notities}
              onChange={e => setNotities(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="cancel-apparaat-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              id="save-apparaat-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {loading ? 'Opslaan...' : initialData ? 'Wijzigingen Opslaan' : 'Apparaat Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
