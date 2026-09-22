import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, User, Phone, Mail, FileText } from 'lucide-react';
import { Vestiging } from '../../types';

interface VestigingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Vestiging>) => Promise<void>;
  initialData?: Vestiging | null;
}

export const VestigingModal: React.FC<VestigingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [naam, setNaam] = useState('');
  const [adres, setAdres] = useState('');
  const [contactpersoon, setContactpersoon] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [email, setEmail] = useState('');
  const [notities, setNotities] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setNaam(initialData.naam || '');
      setAdres(initialData.adres || '');
      setContactpersoon(initialData.contactpersoon || '');
      setTelefoon(initialData.telefoon || '');
      setEmail(initialData.email || '');
      setNotities(initialData.notities || '');
    } else {
      setNaam('');
      setAdres('');
      setContactpersoon('');
      setTelefoon('');
      setEmail('');
      setNotities('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naam.trim()) {
      setError('Naam van de vestiging is verplicht.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSave({
        naam: naam.trim(),
        adres: adres.trim(),
        contactpersoon: contactpersoon.trim(),
        telefoon: telefoon.trim(),
        email: email.trim(),
        notities: notities.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="vestiging-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-800">
              {initialData ? 'Vestiging Bewerken' : 'Nieuwe Vestiging Toevoegen'}
            </h2>
          </div>
          <button
            id="close-vestiging-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Vestigingsnaam <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="vestiging-naam-input"
                type="text"
                required
                placeholder="bv. Campus Centrum of Junior Middenschool"
                value={naam}
                onChange={e => setNaam(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Adres & Locatie
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="vestiging-adres-input"
                type="text"
                placeholder="Straat, nummer, postcode en stad"
                value={adres}
                onChange={e => setAdres(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Lokale ICT Contactpersoon
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="vestiging-contact-input"
                type="text"
                placeholder="bv. Jan Peeters (Systeembeheerder)"
                value={contactpersoon}
                onChange={e => setContactpersoon(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telefoonnummer
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vestiging-tel-input"
                  type="text"
                  placeholder="02 555 1200"
                  value={telefoon}
                  onChange={e => setTelefoon(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                E-mailadres ICT
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="vestiging-email-input"
                  type="email"
                  placeholder="ict.locatie@school.be"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notities & Toegangsdetails
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                id="vestiging-notities-input"
                rows={3}
                placeholder="bv. Toegangscode serverruimte, patchkasten locatie, noodprocedure..."
                value={notities}
                onChange={e => setNotities(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              id="cancel-vestiging-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              id="save-vestiging-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              {loading ? 'Opslaan...' : initialData ? 'Wijzigingen Opslaan' : 'Vestiging Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
