import { InfrastructureDatabase, Vestiging, Gebouw, Vlan, FysiekeServer, VirtueleMachine, Netwerkapparaat, SearchResultItem, IpConflict } from '../types';

export const api = {
  async getInfrastructure(): Promise<InfrastructureDatabase & { conflicts: IpConflict[] }> {
    const res = await fetch('/api/infrastructure');
    if (!res.ok) throw new Error('Fout bij ophalen van gegevens');
    return res.json();
  },

  async search(query: string): Promise<SearchResultItem[]> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Fout bij zoeken');
    return res.json();
  },

  async getConflicts(): Promise<IpConflict[]> {
    const res = await fetch('/api/conflicts');
    if (!res.ok) throw new Error('Fout bij ophalen IP-conflicten');
    return res.json();
  },

  // Vestigingen
  async createVestiging(data: Partial<Vestiging>): Promise<Vestiging> {
    const res = await fetch('/api/vestigingen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken vestiging');
    }
    return res.json();
  },

  async updateVestiging(id: string, data: Partial<Vestiging>): Promise<Vestiging> {
    const res = await fetch(`/api/vestigingen/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken vestiging');
    }
    return res.json();
  },

  async deleteVestiging(id: string): Promise<void> {
    const res = await fetch(`/api/vestigingen/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen vestiging');
    }
  },

  // Gebouwen
  async createGebouw(data: Partial<Gebouw>): Promise<Gebouw> {
    const res = await fetch('/api/gebouwen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken gebouw');
    }
    return res.json();
  },

  async updateGebouw(id: string, data: Partial<Gebouw>): Promise<Gebouw> {
    const res = await fetch(`/api/gebouwen/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken gebouw');
    }
    return res.json();
  },

  async deleteGebouw(id: string): Promise<void> {
    const res = await fetch(`/api/gebouwen/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen gebouw');
    }
  },

  // VLANs
  async getVlans(vestigingId?: string): Promise<Vlan[]> {
    const url = vestigingId ? `/api/vlans?vestigingId=${encodeURIComponent(vestigingId)}` : '/api/vlans';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fout bij ophalen van VLANs');
    return res.json();
  },

  async createVlan(data: Partial<Vlan>): Promise<Vlan> {
    const res = await fetch('/api/vlans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken VLAN');
    }
    return res.json();
  },

  async updateVlan(id: string, data: Partial<Vlan>): Promise<Vlan> {
    const res = await fetch(`/api/vlans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken VLAN');
    }
    return res.json();
  },

  async deleteVlan(id: string): Promise<void> {
    const res = await fetch(`/api/vlans/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen VLAN');
    }
  },

  // Servers
  async createServer(data: Partial<FysiekeServer>): Promise<FysiekeServer> {
    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken server');
    }
    return res.json();
  },

  async updateServer(id: string, data: Partial<FysiekeServer>): Promise<FysiekeServer> {
    const res = await fetch(`/api/servers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken server');
    }
    return res.json();
  },

  async deleteServer(id: string): Promise<void> {
    const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen server');
    }
  },

  // Virtuele Machines
  async createVm(data: Partial<VirtueleMachine>): Promise<VirtueleMachine> {
    const res = await fetch('/api/vms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken VM');
    }
    return res.json();
  },

  async updateVm(id: string, data: Partial<VirtueleMachine>): Promise<VirtueleMachine> {
    const res = await fetch(`/api/vms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken VM');
    }
    return res.json();
  },

  async deleteVm(id: string): Promise<void> {
    const res = await fetch(`/api/vms/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen VM');
    }
  },

  // Netwerkapparaten
  async createNetwerkapparaat(data: Partial<Netwerkapparaat>): Promise<Netwerkapparaat> {
    const res = await fetch('/api/apparaten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij aanmaken apparaat');
    }
    return res.json();
  },

  async updateNetwerkapparaat(id: string, data: Partial<Netwerkapparaat>): Promise<Netwerkapparaat> {
    const res = await fetch(`/api/apparaten/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij bijwerken apparaat');
    }
    return res.json();
  },

  async deleteNetwerkapparaat(id: string): Promise<void> {
    const res = await fetch(`/api/apparaten/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij verwijderen apparaat');
    }
  },

  // Aliases for convenience
  async getDatabase(): Promise<InfrastructureDatabase> {
    return api.getInfrastructure();
  },
  async getIpConflicts(): Promise<IpConflict[]> {
    return api.getConflicts();
  },
  async createApparaat(data: Partial<Netwerkapparaat>): Promise<Netwerkapparaat> {
    return api.createNetwerkapparaat(data);
  },
  async updateApparaat(id: string, data: Partial<Netwerkapparaat>): Promise<Netwerkapparaat> {
    return api.updateNetwerkapparaat(id, data);
  },
  async deleteApparaat(id: string): Promise<void> {
    return api.deleteNetwerkapparaat(id);
  },

  // Backup & Restore
  async restoreBackup(data: InfrastructureDatabase): Promise<void> {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij herstellen back-up');
    }
  },

  async resetBlankDatabase(): Promise<InfrastructureDatabase> {
    const res = await fetch('/api/reset-blank', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Fout bij leegmaken database');
    }
    const json = await res.json();
    return json.data;
  },

  async resetSampleData(): Promise<InfrastructureDatabase> {
    const res = await fetch('/api/reset-sample-data', { method: 'POST' });
    if (!res.ok) throw new Error('Fout bij herstellen voorbeelddata');
    const json = await res.json();
    return json.data;
  },

  getExportCsvUrl(vestigingId?: string): string {
    return vestigingId ? `/api/export/csv?vestigingId=${encodeURIComponent(vestigingId)}` : '/api/export/csv';
  }
};
