import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Vestiging, InfrastructureDatabase } from '../../types';
import { api } from '../../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vestigingen: Vestiging[];
  currentVestigingId?: string;
  db: InfrastructureDatabase;
  onOpenPrintReport: (vestigingId?: string) => void;
  onReloadData: () => Promise<void>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  vestigingen,
  currentVestigingId,
  db,
  onOpenPrintReport,
  onReloadData
}) => {
  const [selectedVestigingId, setSelectedVestigingId] = useState<string>(currentVestigingId || '');
  const [restoreStatus, setRestoreStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [confirmResetBlank, setConfirmResetBlank] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(selectedVestigingId || undefined);
    window.open(url, '_blank');
  };

  const handleOpenPrint = () => {
    onClose();
    onOpenPrintReport(selectedVestigingId || undefined);
  };

  const handleDownloadJsonBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `it_infrastructuur_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.vestigingen || !parsed.servers) {
          throw new Error('Bestand bevat geen geldige infrastructuurdatabase structuur.');
        }
        await api.restoreBackup(parsed);
        await onReloadData();
        setRestoreStatus({ success: 'Back-up succesvol hersteld en geladen!' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (err: any) {
        setRestoreStatus({ error: 'Fout bij herstellen: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleResetBlank = async () => {
    setIsResetting(true);
    try {
      await api.resetBlankDatabase();
      await onReloadData();
      setRestoreStatus({ success: 'Database is gewist. U kunt nu met een blanco exemplaar starten!' });
      setConfirmResetBlank(false);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setRestoreStatus({ error: 'Fout bij leegmaken: ' + err.message });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetSample = async () => {
    setIsResetting(true);
    try {
      await api.resetSampleData();
      await onReloadData();
      setRestoreStatus({ success: 'Voorbeelddata succesvol hersteld!' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setRestoreStatus({ error: 'Fout bij herstellen voorbeelddata: ' + err.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div id="export-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Rapportage & Export</h2>
            <p className="text-xs text-slate-500">Exporteer naar CSV, PDF of back-up voor offline documentatie</p>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Select scope */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Selecteer Vestiging voor Export
            </label>
            <select
              id="export-vestiging-select"
              value={selectedVestigingId}
              onChange={e => setSelectedVestigingId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
            >
              <option value="">Alle 4 Vestigingen (Volledig Scholengemeenschap Overzicht)</option>
              {vestigingen.map(v => (
                <option key={v.id} value={v.id}>
                  Alleen {v.naam}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSV Export Option */}
            <div className="p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">Excel / CSV Bestand</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gestructureerde export van alle servers, VM&apos;s, netwerkapparaten en IP&apos;s.
                </p>
              </div>
              <button
                id="export-csv-btn"
                type="button"
                onClick={handleDownloadCsv}
                className="mt-4 w-full py-2 px-3 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>

            {/* Print/PDF Export Option */}
            <div className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900">PDF / Print Rapport</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nette overzichtspagina voor afdrukken of opslaan als PDF (nooddocumentatiemap).
                </p>
              </div>
              <button
                id="export-pdf-btn"
                type="button"
                onClick={handleOpenPrint}
                className="mt-4 w-full py-2 px-3 text-xs font-medium text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Open PDF Weergave
              </button>
            </div>
          </div>

          {/* Backup & Restore section */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Lokale Back-up & Herstel
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                id="backup-json-btn"
                type="button"
                onClick={handleDownloadJsonBackup}
                className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                JSON Back-up Downloaden
              </button>
              <button
                id="restore-json-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Back-up Terugzetten
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileRestore}
              />
            </div>

            {restoreStatus?.success && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{restoreStatus.success}</span>
              </div>
            )}
            {restoreStatus?.error && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{restoreStatus.error}</span>
              </div>
            )}
          </div>

          {/* Database Beheer (Blanco starten & Demo data) */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Database Beheer &amp; Blanco Start
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Blanco Exemplaar Starten
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Wis alle demodata om zelf vanaf 0 vestigingen, servers en IP-adressen op te bouwen.
                  </div>
                </div>

                {!confirmResetBlank ? (
                  <button
                    id="btn-trigger-reset-blank"
                    type="button"
                    onClick={() => setConfirmResetBlank(true)}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Database Leegmaken
                  </button>
                ) : null}
              </div>

              {confirmResetBlank && (
                <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-lg text-xs space-y-2">
                  <p className="font-semibold text-rose-900">
                    Weet u zeker dat u alle huidige gegevens wilt wissen om met een lege blanco database te starten?
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Alle vestigingen, servers, VM&apos;s en apparaten worden verwijderd. Tip: download eventueel eerst een JSON-back-up hierboven.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="btn-confirm-reset-blank"
                      type="button"
                      disabled={isResetting}
                      onClick={handleResetBlank}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {isResetting ? 'Bezig met wissen...' : 'Ja, wis alles en start blanco'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetBlank(false)}
                      className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium rounded-md transition-colors"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Wilt u later toch de voorbeelden bekijken?
                </span>
                <button
                  id="btn-reset-sample-data"
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetSample}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Voorbeelddata laden
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            id="close-export-dialog-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
