import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  InfrastructureDatabase,
  Vestiging,
  Gebouw,
  FysiekeServer,
  VirtueleMachine,
  Netwerkapparaat,
  IpConflict
} from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { VestigingDetailView } from './components/VestigingDetailView';
import { GlobalSearchView } from './components/GlobalSearchView';
import { IpManagerView } from './components/IpManagerView';
import { PrintReportView } from './components/PrintReportView';

// Modals
import { VestigingModal } from './components/modals/VestigingModal';
import { GebouwModal } from './components/modals/GebouwModal';
import { ServerModal } from './components/modals/ServerModal';
import { VmModal } from './components/modals/VmModal';
import { ApparaatModal } from './components/modals/ApparaatModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { ExportModal } from './components/modals/ExportModal';

import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<InfrastructureDatabase | null>(null);
  const [conflicts, setConflicts] = useState<IpConflict[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'vestigingen' | 'search' | 'ip-manager' | 'print'>('dashboard');
  const [selectedVestigingId, setSelectedVestigingId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printVestigingId, setPrintVestigingId] = useState<string | undefined>(undefined);

  // Modal states
  const [vestigingModalOpen, setVestigingModalOpen] = useState(false);
  const [editingVestiging, setEditingVestiging] = useState<Vestiging | null>(null);

  const [gebouwModalOpen, setGebouwModalOpen] = useState(false);
  const [editingGebouw, setEditingGebouw] = useState<Gebouw | null>(null);
  const [gebouwDefaultVestigingId, setGebouwDefaultVestigingId] = useState<string>('');

  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<FysiekeServer | null>(null);
  const [serverDefaultVestigingId, setServerDefaultVestigingId] = useState<string>('');

  const [vmModalOpen, setVmModalOpen] = useState(false);
  const [editingVm, setEditingVm] = useState<VirtueleMachine | null>(null);
  const [vmDefaultServerId, setVmDefaultServerId] = useState<string>('');

  const [apparaatModalOpen, setApparaatModalOpen] = useState(false);
  const [editingApparaat, setEditingApparaat] = useState<Netwerkapparaat | null>(null);
  const [apparaatDefaultVestigingId, setApparaatDefaultVestigingId] = useState<string>('');

  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDescription?: string;
    warningNote?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {}
  });

  // Load database from backend
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDatabase();
      setDb(data);

      const detectedConflicts = await api.getIpConflicts();
      setConflicts(detectedConflicts);

      // Default selected vestiging
      if (data.vestigingen.length > 0 && !selectedVestigingId) {
        setSelectedVestigingId(data.vestigingen[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load database:', err);
      setError(err.message || 'Kan geen verbinding maken met de server.');
    } finally {
      setLoading(false);
    }
  }, [selectedVestigingId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ensure selectedVestigingId remains valid if vestigingen change
  useEffect(() => {
    if (db && db.vestigingen.length > 0) {
      const exists = db.vestigingen.some(v => v.id === selectedVestigingId);
      if (!exists) {
        setSelectedVestigingId(db.vestigingen[0].id);
      }
    }
  }, [db, selectedVestigingId]);

  // Navigate directly to an item from search or IP manager
  const handleNavigateToItem = (vestigingId: string, category: 'server' | 'vm' | 'apparaat', itemId: string) => {
    if (vestigingId) {
      setSelectedVestigingId(vestigingId);
    }
    setCurrentTab('vestigingen');
  };

  // Open Print / PDF View
  const handleOpenPrintReport = (vestigingId?: string) => {
    setPrintVestigingId(vestigingId);
    setCurrentTab('print');
  };

  // ------------------ CRUD HANDLERS ------------------
  // 1. Vestiging
  const handleSaveVestiging = async (data: Partial<Vestiging>) => {
    if (editingVestiging) {
      await api.updateVestiging(editingVestiging.id, data);
    } else {
      const created = await api.createVestiging(data);
      setSelectedVestigingId(created.id);
    }
    await loadData();
  };

  const handleDeleteVestiging = (vestiging: Vestiging) => {
    const attachedServers = db?.servers.filter(s => s.vestigingId === vestiging.id) || [];
    setDeleteModalState({
      isOpen: true,
      title: 'Vestiging Verwijderen',
      message: `Weet u zeker dat u de vestiging "${vestiging.naam}" wilt verwijderen?`,
      itemDescription: `${vestiging.naam} - ${vestiging.adres || 'Geen adres'}`,
      warningNote: attachedServers.length > 0
        ? `Let op: er zijn nog ${attachedServers.length} fysieke server(s) gekoppeld aan deze vestiging. Verwijder of verplaats deze eerst.`
        : undefined,
      onConfirm: async () => {
        await api.deleteVestiging(vestiging.id);
        await loadData();
      }
    });
  };

  // 1b. Gebouw
  const handleSaveGebouw = async (data: Partial<Gebouw>) => {
    if (editingGebouw) {
      await api.updateGebouw(editingGebouw.id, data);
    } else {
      await api.createGebouw(data);
    }
    await loadData();
  };

  const handleDeleteGebouw = (gebouw: Gebouw) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Gebouw Verwijderen',
      message: `Weet u zeker dat u het gebouw "${gebouw.naam}" wilt verwijderen? Gekoppelde servers en apparaten worden niet verwijderd, maar losgekoppeld van dit gebouw.`,
      itemDescription: `${gebouw.naam} ${gebouw.code ? `(${gebouw.code})` : ''}`,
      onConfirm: async () => {
        await api.deleteGebouw(gebouw.id);
        await loadData();
      }
    });
  };

  // 2. Fysieke Server
  const handleSaveServer = async (data: Partial<FysiekeServer>) => {
    if (editingServer) {
      await api.updateServer(editingServer.id, data);
    } else {
      await api.createServer(data);
    }
    await loadData();
  };

  const handleDeleteServer = (server: FysiekeServer) => {
    const attachedVms = db?.vms.filter(v => v.serverId === server.id) || [];
    setDeleteModalState({
      isOpen: true,
      title: 'Fysieke Server Verwijderen',
      message: `Weet u zeker dat u server "${server.naam}" wilt verwijderen?`,
      itemDescription: `Host: ${server.naam} (${server.merkModel}) - IP: ${server.ipAdres || 'geen'}`,
      warningNote: attachedVms.length > 0
        ? `Waarschuwing: ${attachedVms.length} virtuele machine(s) die op deze host draaien worden hierdoor ook definitief verwijderd!`
        : undefined,
      onConfirm: async () => {
        await api.deleteServer(server.id);
        await loadData();
      }
    });
  };

  // 3. Virtuele Machine (VM)
  const handleSaveVm = async (data: Partial<VirtueleMachine>) => {
    if (editingVm) {
      await api.updateVm(editingVm.id, data);
    } else {
      await api.createVm(data);
    }
    await loadData();
  };

  const handleDeleteVm = (vm: VirtueleMachine) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Virtuele Machine Verwijderen',
      message: `Weet u zeker dat u virtuele machine "${vm.naam}" wilt verwijderen?`,
      itemDescription: `VM: ${vm.naam} - Rol: ${vm.functie} - IP: ${vm.ipAdres || 'geen'}`,
      onConfirm: async () => {
        await api.deleteVm(vm.id);
        await loadData();
      }
    });
  };

  // 4. Netwerkapparaat
  const handleSaveApparaat = async (data: Partial<Netwerkapparaat>) => {
    if (editingApparaat) {
      await api.updateApparaat(editingApparaat.id, data);
    } else {
      await api.createApparaat(data);
    }
    await loadData();
  };

  const handleDeleteApparaat = (apparaat: Netwerkapparaat) => {
    setDeleteModalState({
      isOpen: true,
      title: 'Netwerkapparaat Verwijderen',
      message: `Weet u zeker dat u "${apparaat.naam}" (${apparaat.type}) wilt verwijderen?`,
      itemDescription: `${apparaat.naam} - ${apparaat.merkModel} - IP: ${apparaat.ipAdres || 'geen'}`,
      onConfirm: async () => {
        await api.deleteApparaat(apparaat.id);
        await loadData();
      }
    });
  };

  // If in Print Report Mode, render Print View directly
  if (currentTab === 'print' && db) {
    return (
      <PrintReportView
        vestigingId={printVestigingId}
        db={db}
        onClose={() => setCurrentTab('dashboard')}
      />
    );
  }

  // Loading state
  if (loading && !db) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Infrastructuurdata laden...</h2>
          <p className="text-xs text-slate-500 mt-1">
            Servers, virtuele machines en netwerkdocumentatie worden opgehaald
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !db) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl border border-rose-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Fout bij verbinden</h2>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Opnieuw Proberen
          </button>
        </div>
      </div>
    );
  }

  if (!db) return null;

  // Selected Vestiging Object
  const currentVestiging = db.vestigingen.find(v => v.id === selectedVestigingId) || db.vestigingen[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={tab => setCurrentTab(tab)}
        vestigingen={db.vestigingen}
        selectedVestigingId={selectedVestigingId}
        onSelectVestiging={id => {
          setSelectedVestigingId(id);
          setCurrentTab('vestigingen');
        }}
        conflicts={conflicts}
        onOpenAddVestiging={() => {
          setEditingVestiging(null);
          setVestigingModalOpen(true);
        }}
        onOpenAddServer={() => {
          setEditingServer(null);
          setServerDefaultVestigingId(selectedVestigingId || db.vestigingen[0]?.id || '');
          setServerModalOpen(true);
        }}
        onOpenAddVm={() => {
          setEditingVm(null);
          const defaultServer = db.servers.find(s => s.vestigingId === selectedVestigingId) || db.servers[0];
          setVmDefaultServerId(defaultServer ? defaultServer.id : '');
          setVmModalOpen(true);
        }}
        onOpenAddApparaat={() => {
          setEditingApparaat(null);
          setApparaatDefaultVestigingId(selectedVestigingId || db.vestigingen[0]?.id || '');
          setApparaatModalOpen(true);
        }}
        onOpenExport={() => setExportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={q => setSearchQuery(q)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: Dashboard */}
        {currentTab === 'dashboard' && (
          <DashboardView
            db={db}
            conflicts={conflicts}
            onSelectVestiging={id => {
              setSelectedVestigingId(id);
              setCurrentTab('vestigingen');
            }}
            onOpenAddVestiging={() => {
              setEditingVestiging(null);
              setVestigingModalOpen(true);
            }}
            onOpenAddServer={() => {
              setEditingServer(null);
              setServerDefaultVestigingId(selectedVestigingId || db.vestigingen[0]?.id || '');
              setServerModalOpen(true);
            }}
            onOpenAddVm={() => {
              setEditingVm(null);
              const defaultServer = db.servers.find(s => s.vestigingId === selectedVestigingId) || db.servers[0];
              setVmDefaultServerId(defaultServer ? defaultServer.id : '');
              setVmModalOpen(true);
            }}
            onOpenAddApparaat={() => {
              setEditingApparaat(null);
              setApparaatDefaultVestigingId(selectedVestigingId || db.vestigingen[0]?.id || '');
              setApparaatModalOpen(true);
            }}
            onOpenExport={() => setExportModalOpen(true)}
          />
        )}

        {/* VIEW 2: Vestiging Detail */}
        {currentTab === 'vestigingen' && currentVestiging && (
          <VestigingDetailView
            vestiging={currentVestiging}
            servers={db.servers}
            vms={db.vms}
            apparaten={db.apparaten}
            gebouwen={db.gebouwen || []}
            conflicts={conflicts}
            onEditVestiging={vest => {
              setEditingVestiging(vest);
              setVestigingModalOpen(true);
            }}
            onDeleteVestiging={handleDeleteVestiging}
            onAddGebouw={vestId => {
              setEditingGebouw(null);
              setGebouwDefaultVestigingId(vestId);
              setGebouwModalOpen(true);
            }}
            onEditGebouw={geb => {
              setEditingGebouw(geb);
              setGebouwModalOpen(true);
            }}
            onDeleteGebouw={handleDeleteGebouw}
            onAddServer={vestId => {
              setEditingServer(null);
              setServerDefaultVestigingId(vestId);
              setServerModalOpen(true);
            }}
            onEditServer={srv => {
              setEditingServer(srv);
              setServerModalOpen(true);
            }}
            onDeleteServer={handleDeleteServer}
            onAddVm={serverId => {
              setEditingVm(null);
              setVmDefaultServerId(serverId);
              setVmModalOpen(true);
            }}
            onEditVm={vm => {
              setEditingVm(vm);
              setVmModalOpen(true);
            }}
            onDeleteVm={handleDeleteVm}
            onAddApparaat={vestId => {
              setEditingApparaat(null);
              setApparaatDefaultVestigingId(vestId);
              setApparaatModalOpen(true);
            }}
            onEditApparaat={dev => {
              setEditingApparaat(dev);
              setApparaatModalOpen(true);
            }}
            onDeleteApparaat={handleDeleteApparaat}
            onOpenExport={vestId => {
              handleOpenPrintReport(vestId);
            }}
          />
        )}

        {/* VIEW 3: Global Search */}
        {currentTab === 'search' && (
          <GlobalSearchView
            query={searchQuery}
            onQueryChange={q => setSearchQuery(q)}
            db={db}
            onNavigateToItem={handleNavigateToItem}
          />
        )}

        {/* VIEW 4: IP & MAC Manager */}
        {currentTab === 'ip-manager' && (
          <IpManagerView
            db={db}
            conflicts={conflicts}
            onNavigateToItem={handleNavigateToItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>IT-Infrastructuur Documentatie</strong> &bull; Scholengemeenschap ICT-Dienst
          </div>
          <div className="flex items-center gap-3">
            <span>
              Laatst bijgewerkt: {new Date(db.lastUpdated).toLocaleDateString('nl-BE')} om {new Date(db.lastUpdated).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>&bull;</span>
            <button
              onClick={() => setExportModalOpen(true)}
              className="text-slate-700 hover:text-slate-900 font-semibold underline"
            >
              Back-up &amp; Export
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VestigingModal
        isOpen={vestigingModalOpen}
        onClose={() => {
          setVestigingModalOpen(false);
          setEditingVestiging(null);
        }}
        onSave={handleSaveVestiging}
        initialData={editingVestiging || undefined}
      />

      <GebouwModal
        isOpen={gebouwModalOpen}
        onClose={() => {
          setGebouwModalOpen(false);
          setEditingGebouw(null);
        }}
        onSave={handleSaveGebouw}
        initialData={editingGebouw || undefined}
        vestigingen={db.vestigingen}
        defaultVestigingId={gebouwDefaultVestigingId}
      />

      <ServerModal
        isOpen={serverModalOpen}
        onClose={() => {
          setServerModalOpen(false);
          setEditingServer(null);
        }}
        onSave={handleSaveServer}
        initialData={editingServer || undefined}
        vestigingen={db.vestigingen}
        defaultVestigingId={serverDefaultVestigingId}
        db={db}
      />

      <VmModal
        isOpen={vmModalOpen}
        onClose={() => {
          setVmModalOpen(false);
          setEditingVm(null);
        }}
        onSave={handleSaveVm}
        initialData={editingVm || undefined}
        servers={db.servers}
        vestigingen={db.vestigingen}
        defaultServerId={vmDefaultServerId}
        db={db}
      />

      <ApparaatModal
        isOpen={apparaatModalOpen}
        onClose={() => {
          setApparaatModalOpen(false);
          setEditingApparaat(null);
        }}
        onSave={handleSaveApparaat}
        initialData={editingApparaat || undefined}
        vestigingen={db.vestigingen}
        defaultVestigingId={apparaatDefaultVestigingId}
        db={db}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteModalState.onConfirm}
        title={deleteModalState.title}
        message={deleteModalState.message}
        itemDescription={deleteModalState.itemDescription}
        warningNote={deleteModalState.warningNote}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        vestigingen={db.vestigingen}
        currentVestigingId={selectedVestigingId}
        db={db}
        onOpenPrintReport={handleOpenPrintReport}
        onReloadData={loadData}
      />
    </div>
  );
}
