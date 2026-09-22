import React, { useState, useEffect } from 'react';
import { X, Building2, Tag, FileText } from 'lucide-react';
import { Gebouw, Vestiging } from '../../types';

interface GebouwModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Gebouw>) => Promise<void>;
  initialData?: Gebouw | null;
  defaultVestigingId?: string;
  vestigingen: Vestiging[];
}

export const GebouwModal: React.FC<GebouwModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultVestigingId,
  vestigingen
}) => {
  const [vestigingId, setVestigingId] = useState('');
  const [naam, setNaam] = useState('');
  const [code, setCode] = useState('');
  const [notities, setNotities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setVestigingId(initialData.vestigingId);
      setNaam(initialData.naam || '');
      setCode(initialData.code || '');
      setNotities(initialData.notities || '');
    } else {
      setVestigingId(defaultVestigingId || (vestigingen[0]?.id || ''));
      setNaam('');
      setCode('');
      setNotities('');
    }
    setError(null);
  }, [initialData, defaultVestigingId, vestigingen, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vestigingId) {
      setError('Selecteer een vestiging.');
      return;
    }
    if (!naam.trim()) {
      setError('Naam van het gebouw is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        vestigingId,
        naam: naam.trim(),
        code: code.trim(),
        notities: notities.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fout bij opslaan van gebouw.');
    } finally {
      setLoading(false);
    }
  };

  const currentVestiging = vestigingen.find(v => v.id === vestigingId);

  return (
    <div id="gebouw-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Gebouw Bewerken' : 'Nieuw Gebouw Toevoegen'}
            </h2>
          </div>
          <button
            id="close-gebouw-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Vestiging *
            </label>
            <select
              id="gebouw-vestiging-select"
              value={vestigingId}
              onChange={e => setVestigingId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {vestigingen.map(v => (
                <option key={v.id} value={v.id}>
                  {v.naam}
                </option>
              ))}
            </select>
            {currentVestiging && (
              <p className="mt-1 text-xs text-slate-500">
                Dit gebouw wordt gekoppeld aan {currentVestiging.naam}.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Naam van het Gebouw *
            </label>
            <input
              id="gebouw-naam-input"
              type="text"
              required
              value={naam}
              onChange={e => setNaam(e.target.value)}
              placeholder="bv. Hoofdgebouw, Wetenschapsvleugel, Sporthal, Techniekhal"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Gebouwcode / Vleugel (optioneel)
            </label>
            <div className="relative">
              <input
                id="gebouw-code-input"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="bv. A, B, WET, TECH"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Korte aanduiding voor badges en overzichten.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Notities & Locatie-instructies
            </label>
            <div className="relative">
              <textarea
                id="gebouw-notities-input"
                rows={3}
                value={notities}
                onChange={e => setNotities(e.target.value)}
                placeholder="bv. Serverruimte kelder K-04, patchkast 2e verdieping, badge vereist bij hoofdingang..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              id="cancel-gebouw-modal-btn"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              id="save-gebouw-modal-btn"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {loading ? 'Opslaan...' : initialData ? 'Wijzigingen Opslaan' : 'Gebouw Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
