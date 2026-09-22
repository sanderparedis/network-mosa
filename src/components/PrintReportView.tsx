import React from 'react';
import { Printer, ArrowLeft, Building2, Server, Network, Download } from 'lucide-react';
import { InfrastructureDatabase, Vestiging } from '../types';
import { api } from '../services/api';

interface PrintReportViewProps {
  vestigingId?: string;
  db: InfrastructureDatabase;
  onClose: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  vestigingId,
  db,
  onClose
}) => {
  const { vestigingen, servers, vms, apparaten, lastUpdated } = db;
  const gebouwMap = new Map((db.gebouwen || []).map(g => [g.id, g.naam]));

  const targetVestigingen = vestigingId
    ? vestigingen.filter(v => v.id === vestigingId)
    : vestigingen;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(vestigingId);
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white text-slate-900">
      {/* Top Action Bar (hidden when printing) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar Applicatie
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            Download als CSV (Excel)
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            Afdrukken / Opslaan als PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 print:border-none print:shadow-none p-8 sm:p-12 print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Scholengemeenschap ICT-Beheer
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Infrastructuur Documentatiedossier
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Servers, Virtuele Machines, Netwerkapparaten &amp; IP/MAC-adressen
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>
              <strong>Gegenereerd op:</strong> {new Date().toLocaleDateString('nl-BE')} om {new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div>
              <strong>Bereik:</strong> {vestigingId ? (targetVestigingen[0]?.naam || 'Vestiging') : 'Alle 4 Vestigingen'}
            </div>
            <div>
              <strong>Laatste data-update:</strong> {new Date(lastUpdated).toLocaleDateString('nl-BE')}
            </div>
          </div>
        </div>

        {/* Content by Vestiging */}
        <div className="space-y-12">
          {targetVestigingen.map(v => {
            const vServers = servers.filter(s => s.vestigingId === v.id);
            const vServerIds = new Set(vServers.map(s => s.id));
            const vVms = vms.filter(vm => vServerIds.has(vm.serverId));
            const vApparaten = apparaten.filter(a => a.vestigingId === v.id);

            return (
              <div key={v.id} className="space-y-6 break-inside-avoid-page">
                {/* Vestiging Title Header */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-600 print:hidden" />
                      {v.naam}
                    </h2>
                    <div className="text-xs text-slate-600 mt-0.5">{v.adres}</div>
                  </div>
                  <div className="text-xs text-slate-600 sm:text-right">
                    <div>
                      <strong>Contact ICT:</strong> {v.contactpersoon || '-'}
                    </div>
                    {v.telefoon && <div>Tel: {v.telefoon}</div>}
                  </div>
                </div>

                {v.notities && (
                  <div className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200 p-3 rounded-lg">
                    <strong>Locatie- &amp; Toegangsnotities:</strong> {v.notities}
                  </div>
                )}

                {/* Servers & VMs */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <Server className="w-4 h-4 text-blue-600 print:hidden" />
                    Fysieke Servers &amp; Onderliggende VM&apos;s ({vServers.length} hosts, {vVms.length} VM&apos;s)
                  </h3>

                  {vServers.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Geen fysieke servers geregistreerd voor deze vestiging.</p>
                  ) : (
                    vServers.map(s => {
                      const hostVms = vms.filter(vm => vm.serverId === s.id);
                      const gebouwName = s.gebouwId ? gebouwMap.get(s.gebouwId) : undefined;

                      return (
                        <div key={s.id} className="border border-slate-300 rounded-lg overflow-hidden">
                          {/* Server Info Row */}
                          <div className="bg-slate-50 p-3 border-b border-slate-200 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-mono font-bold text-sm text-slate-950">{s.naam}</span>
                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                                  Fysieke Host ({s.merkModel})
                                </span>
                                {gebouwName && (
                                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold text-[10px]">
                                    {gebouwName}
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-slate-800">
                                <strong>Beheer IP:</strong> {s.ipAdres || '-'}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-slate-600 text-[11px]">
                              <div><strong>Locatie/Rack:</strong> {gebouwName ? `${gebouwName} - ${s.locatie || 'Rack'}` : (s.locatie || '-')}</div>
                              <div><strong>Serienummer:</strong> {s.serienummer || '-'}</div>
                              <div><strong>Garantie tot:</strong> {s.garantieEinddatum || '-'}</div>
                              <div><strong>Status:</strong> {s.status || 'Actief'}</div>
                            </div>

                            {/* NIC Interfaces */}
                            {s.nics && s.nics.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                  Netwerkinterfaces (NICs - {s.nicAantal || s.nics.length} poorten):
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {s.nics.map(nic => (
                                    <div key={nic.id} className="bg-white px-2 py-1 rounded border border-slate-200 text-[11px] font-mono flex items-center justify-between">
                                      <span className="font-bold text-slate-800">{nic.naam}:</span>
                                      <span className="text-slate-600">IP: {nic.ipAdres || 'geen'}</span>
                                      <span className="text-slate-500">MAC: {nic.macAdres || 'geen'}</span>
                                      {nic.vlan && <span className="text-indigo-600 font-semibold">VLAN {nic.vlan}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {s.notities && (
                              <div className="mt-1.5 text-slate-500 text-[11px]">
                                <em>{s.notities}</em>
                              </div>
                            )}
                          </div>

                          {/* Nested VMs Table */}
                          <div className="p-3">
                            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                              Virtuele Machines op deze host ({hostVms.length}):
                            </div>
                            {hostVms.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Geen VM&apos;s op deze server.</p>
                            ) : (
                              <table className="w-full text-left text-xs border border-slate-200">
                                <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                  <tr>
                                    <th className="p-2">VM Naam</th>
                                    <th className="p-2">Functie / Rol</th>
                                    <th className="p-2">OS</th>
                                    <th className="p-2 font-mono">IP-Adres</th>
                                    <th className="p-2 font-mono">MAC-Adres</th>
                                    <th className="p-2">Specificaties</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {hostVms.map(vm => (
                                    <tr key={vm.id}>
                                      <td className="p-2 font-mono font-bold text-slate-900">{vm.naam}</td>
                                      <td className="p-2 text-slate-700">{vm.functie || '-'}</td>
                                      <td className="p-2 text-slate-600">{vm.besturingssysteem || '-'}</td>
                                      <td className="p-2 font-mono font-semibold text-slate-900">{vm.ipAdres || '-'}</td>
                                      <td className="p-2 font-mono text-slate-600">{vm.macAdres || '-'}</td>
                                      <td className="p-2 text-slate-600">{vm.vcpu} | {vm.ram} | {vm.schijfgrootte}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Network Devices */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1.5">
                    <Network className="w-4 h-4 text-purple-600 print:hidden" />
                    Netwerkapparatuur ({vApparaten.length})
                  </h3>

                  {vApparaten.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Geen netwerkapparaten geregistreerd voor deze vestiging.</p>
                  ) : (
                    <table className="w-full text-left text-xs border border-slate-200">
                      <thead className="bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        <tr>
                          <th className="p-2">Type</th>
                          <th className="p-2">Naam</th>
                          <th className="p-2">Merk / Model</th>
                          <th className="p-2 font-mono">IP-Adres</th>
                          <th className="p-2 font-mono">MAC-Adres</th>
                          <th className="p-2">VLAN</th>
                          <th className="p-2">Gebouw / Locatie</th>
                          <th className="p-2">Poorten</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vApparaten.map(dev => {
                          const devGebouw = dev.gebouwId ? gebouwMap.get(dev.gebouwId) : undefined;
                          return (
                            <tr key={dev.id}>
                              <td className="p-2 uppercase font-bold text-[10px] text-purple-700">{dev.type}</td>
                              <td className="p-2 font-mono font-bold text-slate-900">{dev.naam}</td>
                              <td className="p-2 text-slate-700">{dev.merkModel || '-'}</td>
                              <td className="p-2 font-mono font-semibold text-slate-900">{dev.ipAdres || '-'}</td>
                              <td className="p-2 font-mono text-slate-600">{dev.macAdres || '-'}</td>
                              <td className="p-2 text-slate-700">{dev.vlan || '-'}</td>
                              <td className="p-2 text-slate-600">
                                {devGebouw ? `${devGebouw} - ${dev.locatie || 'Patchkast'}` : (dev.locatie || '-')}
                              </td>
                              <td className="p-2 text-slate-600">{dev.poorten || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-300 text-xs text-slate-400 text-center">
          Infrastructuuroverzicht Scholengemeenschap &bull; Vertrouwelijk IT-Beheersdocument &bull; Pagina 1 van 1
        </div>
      </div>
    </div>
  );
};
