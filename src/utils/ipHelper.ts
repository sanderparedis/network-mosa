import { InfrastructureDatabase } from '../types';

export interface IpCheckResult {
  isDuplicate: boolean;
  isSameVestiging: boolean;
  conflicts: Array<{
    id: string;
    naam: string;
    type: 'server' | 'vm' | 'apparaat';
    typeLabel: string;
    vestigingId: string;
    vestigingNaam: string;
    locatieOfHost: string;
  }>;
}

export function validateIpAddress(
  ip: string,
  targetVestigingId: string,
  currentId: string | undefined,
  db: InfrastructureDatabase
): IpCheckResult {
  const cleanIp = (ip || '').trim();
  if (!cleanIp) {
    return { isDuplicate: false, isSameVestiging: false, conflicts: [] };
  }

  const conflicts: IpCheckResult['conflicts'] = [];
  const vestigingMap = new Map(db.vestigingen.map(v => [v.id, v.naam]));
  const serverMap = new Map(db.servers.map(s => [s.id, s]));

  // Check Servers (Management IP and each NIC)
  for (const s of db.servers) {
    if (s.id === currentId) continue;
    if (s.ipAdres && s.ipAdres.trim().toLowerCase() === cleanIp.toLowerCase()) {
      conflicts.push({
        id: s.id,
        naam: s.naam,
        type: 'server',
        typeLabel: 'Fysieke Server (Beheer IP)',
        vestigingId: s.vestigingId,
        vestigingNaam: vestigingMap.get(s.vestigingId) || 'Onbekend',
        locatieOfHost: s.locatie || 'Serverruimte'
      });
    }

    if (s.nics && Array.isArray(s.nics)) {
      for (const nic of s.nics) {
        if (nic.ipAdres && nic.ipAdres.trim().toLowerCase() === cleanIp.toLowerCase()) {
          conflicts.push({
            id: `${s.id}_${nic.id}`,
            naam: `${s.naam} (${nic.naam})`,
            type: 'server',
            typeLabel: `Fysieke Server (${nic.naam}${nic.vlan ? ' | VLAN ' + nic.vlan : ''})`,
            vestigingId: s.vestigingId,
            vestigingNaam: vestigingMap.get(s.vestigingId) || 'Onbekend',
            locatieOfHost: s.locatie || 'Serverruimte'
          });
        }
      }
    }
  }

  // Check VMs
  for (const vm of db.vms) {
    if (vm.id === currentId) continue;
    if (vm.ipAdres && vm.ipAdres.trim().toLowerCase() === cleanIp.toLowerCase()) {
      const srv = serverMap.get(vm.serverId);
      const vId = srv ? srv.vestigingId : '';
      conflicts.push({
        id: vm.id,
        naam: vm.naam,
        type: 'vm',
        typeLabel: 'Virtuele Machine',
        vestigingId: vId,
        vestigingNaam: vestigingMap.get(vId) || 'Onbekend',
        locatieOfHost: srv ? `Host: ${srv.naam}` : 'Geen host'
      });
    }
  }

  // Check Apparaten
  for (const dev of db.apparaten) {
    if (dev.id === currentId) continue;
    if (dev.ipAdres && dev.ipAdres.trim().toLowerCase() === cleanIp.toLowerCase()) {
      conflicts.push({
        id: dev.id,
        naam: dev.naam,
        type: 'apparaat',
        typeLabel: `Netwerkapparaat (${dev.type})`,
        vestigingId: dev.vestigingId,
        vestigingNaam: vestigingMap.get(dev.vestigingId) || 'Onbekend',
        locatieOfHost: dev.locatie || 'Onbekend'
      });
    }
  }

  const isDuplicate = conflicts.length > 0;
  const isSameVestiging = conflicts.some(c => c.vestigingId === targetVestigingId);

  return {
    isDuplicate,
    isSameVestiging,
    conflicts
  };
}

export function formatMacAddress(mac: string): string {
  const clean = mac.replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 12) {
    return clean.match(/.{1,2}/g)?.join(':').toUpperCase() || mac;
  }
  return mac;
}
