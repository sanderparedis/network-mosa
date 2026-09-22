import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  AlertTriangle,
  Calendar,
  MapPin,
  Tag,
  Globe,
  Cpu,
  Building2,
  Network,
  Plus,
  Trash2
} from 'lucide-react';
import { FysiekeServer, Vestiging, InfrastructureDatabase, ServerNic } from '../../types';
import { validateIpAddress, formatMacAddress } from '../../utils/ipHelper';
import { VlanSelector } from '../VlanSelector';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FysiekeServer>) => Promise<void>;
  initialData?: FysiekeServer | null;
  defaultVestigingId?: string;
  vestigingen: Vestiging[];
  db: InfrastructureDatabase;
  onOpenAddGebouw?: (vestigingId: string) => void;
  onOpenAddVlan?: () => void;
}

export const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultVestigingId,
  vestigingen,
  db,
  onOpenAddGebouw,
  onOpenAddVlan
}) => {
  const [vestigingId, setVestigingId] = useState('');
  const [gebouwId, setGebouwId] = useState('');
  const [naam, setNaam] = useState('');
  const [merkModel, setMerkModel] = useState('');
  const [serienummer, setSerienummer] = useState('');
  const [ipAdres, setIpAdres] = useState('');
  const [locatie, setLocatie] = useState('');
  const [aankoopdatum, setAankoopdatum] = useState('');
  const [garantieEinddatum, setGarantieEinddatum] = useState('');
  const [notities, setNotities] = useState('');
  const [status, setStatus] = useState<'actief' | 'onderhoud' | 'inactief'>('actief');
  const [nicAantal, setNicAantal] = useState<number>(2);
  const [nics, setNics] = useState<ServerNic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVestigingId(initialData.vestigingId);
      setGebouwId(initialData.gebouwId || '');
      setNaam(initialData.naam || '');
      setMerkModel(initialData.merkModel || '');
      setSerienummer(initialData.serienummer || '');
      setIpAdres(initialData.ipAdres || '');
      setLocatie(initialData.locatie || '');
      setAankoopdatum(initialData.aankoopdatum || '');
      setGarantieEinddatum(initialData.garantieEinddatum || '');
      setNotities(initialData.notities || '');
      setStatus(initialData.status || 'actief');

      if (initialData.nics && initialData.nics.length > 0) {
        setNics(initialData.nics);
        setNicAantal(initialData.nicAantal || initialData.nics.length);
      } else {
        // Create 2 default NICs with primary IP if available
        const defaultNics: ServerNic[] = [
          {
            id: 'nic-1',
            naam: 'NIC 1 (Beheer / iDRAC)',
            ipAdres: initialData.ipAdres || '',
            macAdres: '',
            vlan: '10 (Beheer)',
            snelheid: '1 GbE RJ45'
          },
          {
            id: 'nic-2',
            naam: 'NIC 2 (LAN / Productie)',
            ipAdres: '',
            macAdres: '',
            vlan: '20 (Servers)',
            snelheid: '10 GbE SFP+'
          }
        ];
        setNics(defaultNics);
        setNicAantal(initialData.nicAantal || 2);
      }
    } else {
      const vId = defaultVestigingId || (vestigingen[0]?.id || '');
      setVestigingId(vId);
      setGebouwId('');
      setNaam('');
      setMerkModel('');
      setSerienummer('');
      setIpAdres('');
      setLocatie('');
      setAankoopdatum('');
      setGarantieEinddatum('');
      setNotities('');
      setStatus('actief');
      setNicAantal(2);
      setNics([
        {
          id: 'nic-1',
          naam: 'NIC 1 (Beheer / iDRAC)',
          ipAdres: '',
          macAdres: '',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-2',
          naam: 'NIC 2 (LAN / Productie)',
          ipAdres: '',
          macAdres: '',
          vlan: '20 (Servers)',
          snelheid: '10 GbE SFP+'
        }
      ]);
    }
    setError(null);
  }, [initialData, defaultVestigingId, vestigingen, isOpen]);

  if (!isOpen) return null;

  // Filter buildings for the selected vestiging
  const beschikbareGebouwen = (db.gebouwen || []).filter(g => g.vestigingId === vestigingId);

  // Check for duplicate IP warnings in real time for primary IP
  const ipCheck = validateIpAddress(ipAdres, vestigingId, initialData?.id, db);

  // Sync NIC count changes
  const handleNicAantalChange = (newCount: number) => {
    const count = Math.max(1, Math.min(16, newCount || 1));
    setNicAantal(count);

    setNics(prev => {
      const updated = [...prev];
      if (updated.length < count) {
        // Add additional NICs
        for (let i = updated.length; i < count; i++) {
          updated.push({
            id: `nic-${Date.now()}-${i + 1}`,
            naam: `NIC ${i + 1}`,
            ipAdres: '',
            macAdres: '',
            vlan: '',
            snelheid: '10 GbE SFP+'
          });
        }
      } else if (updated.length > count) {
        // Shrink array
        return updated.slice(0, count);
      }
      return updated;
    });
  };

  const handleUpdateNic = (index: number, field: keyof ServerNic, value: string) => {
    setNics(prev => {
      const copy = [...prev];
      if (field === 'macAdres') {
        copy[index] = { ...copy[index], [field]: formatMacAddress(value) };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const handleAddNic = () => {
    const nextIndex = nics.length + 1;
    setNics(prev => [
      ...prev,
      {
        id: `nic-${Date.now()}-${nextIndex}`,
        naam: `NIC ${nextIndex}`,
        ipAdres: '',
        macAdres: '',
        vlan: '',
        snelheid: '10 GbE SFP+'
      }
    ]);
    setNicAantal(prev => prev + 1);
  };

  const handleRemoveNic = (index: number) => {
    if (nics.length <= 1) return;
    setNics(prev => prev.filter((_, i) => i !== index));
    setNicAantal(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vestigingId) {
      setError('Selecteer een vestiging.');
      return;
    }
    if (!naam.trim()) {
      setError('Servernaam is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // If primary ipAdres is empty but NIC 1 has an IP, use NIC 1 as primary
      const resolvedPrimaryIp = ipAdres.trim() || (nics[0]?.ipAdres?.trim() || '');

      await onSave({
        vestigingId,
        gebouwId: gebouwId || undefined,
        naam: naam.trim(),
        merkModel: merkModel.trim(),
        serienummer: serienummer.trim(),
        ipAdres: resolvedPrimaryIp,
        locatie: locatie.trim(),
        aankoopdatum,
        garantieEinddatum,
        notities: notities.trim(),
        status,
        nicAantal: nics.length,
        nics: nics.map(nic => ({
          ...nic,
          naam: nic.naam.trim(),
          ipAdres: (nic.ipAdres || '').trim(),
          macAdres: (nic.macAdres || '').trim(),
          vlan: (nic.vlan || '').trim()
        }))
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="server-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Fysieke Server Bewerken' : 'Nieuwe Fysieke Server Toevoegen'}
            </h2>
          </div>
          <button
            id="close-server-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* Basisidentificatie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Vestiging <span className="text-rose-500">*</span>
              </label>
              <select
                id="server-vestiging-select"
                value={vestigingId}
                onChange={e => {
                  setVestigingId(e.target.value);
                  setGebouwId(''); // reset gebouw when vestiging changes
                }}
                required
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              >
                {vestigingen.length === 0 && (
                  <option value="">(Geen vestigingen - voeg eerst een vestiging toe)</option>
                )}
                {vestigingen.map(v => (
                  <option key={v.id} value={v.id}>{v.naam}</option>
                ))}
              </select>
            </div>

            {/* Gebouw Selectie */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Gebouw / Vleugel
                </label>
                {onOpenAddGebouw && (
                  <button
                    type="button"
                    onClick={() => onOpenAddGebouw(vestigingId)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Nieuw gebouw
                  </button>
                )}
              </div>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  id="server-gebouw-select"
                  value={gebouwId}
                  onChange={e => setGebouwId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
                >
                  <option value="">-- Geen specifiek gebouw / n.v.t. --</option>
                  {beschikbareGebouwen.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.naam} {g.code ? `(${g.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {beschikbareGebouwen.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Nog geen gebouwen gedefinieerd voor deze vestiging.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Server Hostnaam <span className="text-rose-500">*</span>
              </label>
              <input
                id="server-naam-input"
                type="text"
                required
                placeholder="bv. SRV-CENTRUM-HYPERV01"
                value={naam}
                onChange={e => setNaam(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Merk & Model
              </label>
              <div className="relative">
                <Cpu className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="server-merk-model-input"
                  type="text"
                  placeholder="bv. Dell PowerEdge R750 of HPE DL380"
                  value={merkModel}
                  onChange={e => setMerkModel(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Serienummer / Service Tag
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="server-serienummer-input"
                  type="text"
                  placeholder="bv. 8X9B2K3"
                  value={serienummer}
                  onChange={e => setSerienummer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Locatie / Rack positie
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="server-locatie-input"
                  type="text"
                  placeholder="bv. Rack A (U14-U16) of Patchkast 1e verdieping"
                  value={locatie}
                  onChange={e => setLocatie(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Primair Beheer IP */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Primair Beheer IP-adres (iDRAC / iLO / Host IP)
              </label>
              {nics.length > 0 && nics[0].ipAdres && ipAdres !== nics[0].ipAdres && (
                <button
                  type="button"
                  onClick={() => setIpAdres(nics[0].ipAdres || '')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Overnemen van NIC 1 ({nics[0].ipAdres})
                </button>
              )}
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="server-ip-input"
                type="text"
                placeholder="bv. 10.10.1.10 of 192.168.1.10"
                value={ipAdres}
                onChange={e => setIpAdres(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 text-slate-800 font-mono ${
                  ipCheck.isDuplicate
                    ? 'border-amber-400 bg-amber-50/30 focus:ring-amber-500'
                    : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
            </div>

            {ipCheck.isDuplicate && (
              <div id="server-ip-warning" className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">
                    {ipCheck.isSameVestiging
                      ? 'Waarschuwing: Dubbel IP-adres binnen deze vestiging!'
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
                    . U kunt dit opslaan als dit opzettelijk is.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* NETWERKKAARTEN (NIC'S) SECTIE */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    Netwerkinterfaces (NIC&apos;s, MAC, IP &amp; VLAN)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configureer het aantal fysieke netwerkpoorten met IP-adres, MAC-adres en bijbehorende VLAN.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Aantal NIC&apos;s:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => handleNicAantalChange(nicAantal - 1)}
                    disabled={nicAantal <= 1}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 text-sm font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={nicAantal}
                    onChange={e => handleNicAantalChange(parseInt(e.target.value, 10) || 1)}
                    className="w-10 text-center text-xs font-semibold py-1 focus:outline-none border-x border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleNicAantalChange(nicAantal + 1)}
                    disabled={nicAantal >= 16}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddNic}
                  className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> NIC toevoegen
                </button>
              </div>
            </div>

            {/* List of configured NICs */}
            <div className="space-y-3">
              {nics.map((nic, idx) => {
                const nicIpCheck = nic.ipAdres
                  ? validateIpAddress(nic.ipAdres, vestigingId, initialData?.id, db)
                  : { isDuplicate: false, isSameVestiging: false, conflicts: [] };

                return (
                  <div
                    key={nic.id || idx}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={nic.naam}
                          onChange={e => handleUpdateNic(idx, 'naam', e.target.value)}
                          placeholder={`NIC ${idx + 1} (bv. Beheer of LAN)`}
                          className="px-2 py-1 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {nics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveNic(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Verwijder deze NIC"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* IP-adres */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          IP-Adres
                        </label>
                        <input
                          type="text"
                          value={nic.ipAdres || ''}
                          onChange={e => handleUpdateNic(idx, 'ipAdres', e.target.value)}
                          placeholder="bv. 10.10.1.10"
                          className={`w-full px-2.5 py-1.5 text-xs font-mono bg-white border rounded-md focus:outline-none focus:ring-1 ${
                            nicIpCheck.isDuplicate
                              ? 'border-amber-400 bg-amber-50/20 focus:ring-amber-500'
                              : 'border-slate-200 focus:ring-indigo-500'
                          }`}
                        />
                      </div>

                      {/* MAC-adres */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          MAC-Adres
                        </label>
                        <input
                          type="text"
                          value={nic.macAdres || ''}
                          onChange={e => handleUpdateNic(idx, 'macAdres', e.target.value)}
                          onBlur={e => handleUpdateNic(idx, 'macAdres', formatMacAddress(e.target.value))}
                          placeholder="00:15:5D:XX:XX:XX"
                          className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
                        />
                      </div>

                      {/* VLAN */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                          VLAN (Koppeling)
                        </label>
                        <VlanSelector
                          value={nic.vlan || ''}
                          onChange={val => handleUpdateNic(idx, 'vlan', val)}
                          vlans={db.vlans || []}
                          vestigingId={vestigingId}
                          onOpenAddVlan={onOpenAddVlan}
                          idPrefix={`server-nic-${idx}-vlan`}
                          placeholder="bv. 10 (Beheer) of Trunk"
                        />
                      </div>
                    </div>

                    {/* Duplicate IP warning for this specific NIC */}
                    {nicIpCheck.isDuplicate && (
                      <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>IP {nic.ipAdres} is al in gebruik bij {nicIpCheck.conflicts[0]?.naam}!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details & Garantie */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Aankoopdatum
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="server-aankoop-input"
                  type="date"
                  value={aankoopdatum}
                  onChange={e => setAankoopdatum(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Garantie Einddatum
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="server-garantie-input"
                  type="date"
                  value={garantieEinddatum}
                  onChange={e => setGarantieEinddatum(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                id="server-status-select"
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
              >
                <option value="actief">Actief (Productie)</option>
                <option value="onderhoud">In Onderhoud</option>
                <option value="inactief">Buiten Dienst / Reserve</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notities &amp; Technische Details
            </label>
            <textarea
              id="server-notities-input"
              rows={3}
              placeholder="bv. Hyper-V Cluster configuratie, SAN LUN koppelingen, RAID configuratie, back-upplanning..."
              value={notities}
              onChange={e => setNotities(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="cancel-server-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              id="save-server-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {loading ? 'Opslaan...' : initialData ? 'Wijzigingen Opslaan' : 'Server Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
