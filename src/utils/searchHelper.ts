import { InfrastructureDatabase, SearchResultItem, IpConflict } from '../types';

/**
 * Checks for IP conflicts across servers, server NICs, VMs, and network devices within each vestiging.
 */
export function checkIpConflicts(db: InfrastructureDatabase): IpConflict[] {
  const map: Record<
    string,
    {
      ip: string;
      vestigingId: string;
      vestigingNaam: string;
      items: Array<{
        id: string;
        naam: string;
        type: 'server' | 'vm' | 'apparaat';
        typeLabel: string;
        locatieOfHost: string;
      }>;
    }
  > = {};

  const vestigingMap = new Map(db.vestigingen.map(v => [v.id, v.naam]));
  const gebouwMap = new Map((db.gebouwen || []).map(g => [g.id, g.naam]));
  const serverMap = new Map(db.servers.map(s => [s.id, s]));

  // Helper to add item to IP registry
  const addIp = (
    ipRaw: string | undefined,
    vestigingId: string,
    id: string,
    naam: string,
    type: 'server' | 'vm' | 'apparaat',
    typeLabel: string,
    locatieOfHost: string
  ) => {
    if (!ipRaw || !ipRaw.trim()) return;
    const ip = ipRaw.trim();
    const key = `${vestigingId}_${ip}`;
    if (!map[key]) {
      map[key] = {
        ip,
        vestigingId,
        vestigingNaam: vestigingMap.get(vestigingId) || 'Onbekende vestiging',
        items: []
      };
    }
    // Prevent duplicate entries for the exact same item ID and label
    const alreadyExists = map[key].items.some(it => it.id === id && it.typeLabel === typeLabel);
    if (!alreadyExists) {
      map[key].items.push({
        id,
        naam,
        type,
        typeLabel,
        locatieOfHost
      });
    }
  };

  // 1. Servers (Primary IP and each configured NIC)
  for (const s of db.servers) {
    const gebouwName = s.gebouwId ? gebouwMap.get(s.gebouwId) : undefined;
    const locText = gebouwName ? `${gebouwName} - ${s.locatie || 'Rack'}` : (s.locatie || 'Rack / Serverruimte');

    // Primary / Management IP
    addIp(s.ipAdres, s.vestigingId, s.id, s.naam, 'server', 'Fysieke Server (Beheer IP)', locText);

    // Any individual NIC IP configured
    if (s.nics && Array.isArray(s.nics)) {
      for (const nic of s.nics) {
        if (nic.ipAdres && nic.ipAdres.trim()) {
          const vlanSuffix = nic.vlan ? ` | VLAN ${nic.vlan}` : '';
          addIp(
            nic.ipAdres,
            s.vestigingId,
            `${s.id}_${nic.id}`,
            `${s.naam} (${nic.naam})`,
            'server',
            `Fysieke Server (${nic.naam}${vlanSuffix})`,
            locText
          );
        }
      }
    }
  }

  // 2. VMs
  for (const vm of db.vms) {
    const server = serverMap.get(vm.serverId);
    const vestigingId = server ? server.vestigingId : 'unknown';
    const serverGebouw = server?.gebouwId ? gebouwMap.get(server.gebouwId) : undefined;
    const hostText = server ? `Host: ${server.naam}${serverGebouw ? ` (${serverGebouw})` : ''}` : 'Geen host gekoppeld';

    addIp(vm.ipAdres, vestigingId, vm.id, vm.naam, 'vm', 'Virtuele Machine', hostText);
  }

  // 3. Netwerkapparaten
  for (const dev of db.apparaten) {
    const gebouwName = dev.gebouwId ? gebouwMap.get(dev.gebouwId) : undefined;
    const locText = gebouwName ? `${gebouwName} - ${dev.locatie || 'Patchkast'}` : (dev.locatie || 'Patchkast');
    const vlanSuffix = dev.vlan ? ` | VLAN ${dev.vlan}` : '';

    addIp(dev.ipAdres, dev.vestigingId, dev.id, dev.naam, 'apparaat', `Netwerkapparaat (${dev.type}${vlanSuffix})`, locText);
  }

  // Filter only conflicts (more than 1 item for same IP on same vestiging)
  return Object.values(map)
    .filter(entry => entry.items.length > 1)
    .map(entry => ({
      ipAdres: entry.ip,
      vestigingId: entry.vestigingId,
      vestigingNaam: entry.vestigingNaam,
      items: entry.items
    }));
}

/**
 * Global search across all entities (servers, server NICs, VMs, network devices, and buildings) in all locations.
 */
export function searchInfrastructure(query: string, db: InfrastructureDatabase): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];
  const vestigingMap = new Map(db.vestigingen.map(v => [v.id, v.naam]));
  const gebouwMap = new Map((db.gebouwen || []).map(g => [g.id, g.naam]));
  const serverMap = new Map(db.servers.map(s => [s.id, s]));

  // Clean query for MAC match (e.g., allow "00155d" or "00:15:5d")
  const qClean = q.replace(/[:.-]/g, '');

  // 1. Search Servers
  for (const s of db.servers) {
    const gebouwName = s.gebouwId ? gebouwMap.get(s.gebouwId) : undefined;
    const matchName = s.naam.toLowerCase().includes(q);
    const matchIp = s.ipAdres && s.ipAdres.toLowerCase().includes(q);
    const matchModel = s.merkModel && s.merkModel.toLowerCase().includes(q);
    const matchSerial = s.serienummer && s.serienummer.toLowerCase().includes(q);
    const matchLoc = s.locatie && s.locatie.toLowerCase().includes(q);
    const matchNotes = s.notities && s.notities.toLowerCase().includes(q);
    const matchGebouw = gebouwName && gebouwName.toLowerCase().includes(q);

    // Check if any NIC matches
    let matchingNicDetails = '';
    let matchNic = false;
    let nicMatchedMac = '';
    let nicMatchedIp = '';
    let nicMatchedVlan = '';

    if (s.nics && Array.isArray(s.nics)) {
      for (const nic of s.nics) {
        const nIpMatch = nic.ipAdres && nic.ipAdres.toLowerCase().includes(q);
        const nMacMatch =
          nic.macAdres &&
          (nic.macAdres.toLowerCase().includes(q) ||
            nic.macAdres.replace(/[:.-]/g, '').toLowerCase().includes(qClean));
        const nVlanMatch = nic.vlan && nic.vlan.toLowerCase().includes(q);
        const nNameMatch = nic.naam && nic.naam.toLowerCase().includes(q);

        if (nIpMatch || nMacMatch || nVlanMatch || nNameMatch) {
          matchNic = true;
          matchingNicDetails += ` [${nic.naam}${nic.ipAdres ? ': ' + nic.ipAdres : ''}${nic.vlan ? ' (VLAN ' + nic.vlan + ')' : ''}]`;
          if (nMacMatch) nicMatchedMac = nic.macAdres || '';
          if (nIpMatch) nicMatchedIp = nic.ipAdres || '';
          if (nVlanMatch) nicMatchedVlan = nic.vlan || '';
        }
      }
    }

    if (matchName || matchIp || matchModel || matchSerial || matchLoc || matchNotes || matchGebouw || matchNic) {
      const displayLoc = gebouwName ? `${gebouwName} - ${s.locatie}` : s.locatie;
      const nicCountStr = s.nicAantal || (s.nics ? s.nics.length : 0);
      const detailStr = `${s.merkModel} | SN: ${s.serienummer}${nicCountStr ? ` | ${nicCountStr} NIC's` : ''}${matchingNicDetails}`;

      results.push({
        id: s.id,
        naam: s.naam,
        category: 'server',
        categoryLabel: 'Fysieke Server',
        vestigingId: s.vestigingId,
        vestigingNaam: vestigingMap.get(s.vestigingId) || 'Onbekend',
        gebouwNaam: gebouwName,
        ipAdres: nicMatchedIp || s.ipAdres,
        macAdres: nicMatchedMac || undefined,
        vlan: nicMatchedVlan || undefined,
        details: detailStr,
        locatie: displayLoc,
        notities: s.notities
      });
    }
  }

  // 2. Search VMs
  for (const vm of db.vms) {
    const srv = serverMap.get(vm.serverId);
    const vestigingId = srv ? srv.vestigingId : '';
    const vestigingNaam = vestigingId ? (vestigingMap.get(vestigingId) || 'Onbekend') : 'Niet gekoppeld';
    const gebouwName = srv?.gebouwId ? gebouwMap.get(srv.gebouwId) : undefined;

    const matchName = vm.naam.toLowerCase().includes(q);
    const matchIp = vm.ipAdres && vm.ipAdres.toLowerCase().includes(q);
    const matchMac =
      vm.macAdres &&
      (vm.macAdres.toLowerCase().includes(q) ||
        vm.macAdres.replace(/[:.-]/g, '').toLowerCase().includes(qClean));
    const matchRole = vm.functie && vm.functie.toLowerCase().includes(q);
    const matchOs = vm.besturingssysteem && vm.besturingssysteem.toLowerCase().includes(q);
    const matchNotes = vm.notities && vm.notities.toLowerCase().includes(q);
    const matchVlan = vm.vlan && vm.vlan.toLowerCase().includes(q);
    const matchGebouw = gebouwName && gebouwName.toLowerCase().includes(q);

    if (matchName || matchIp || matchMac || matchRole || matchOs || matchNotes || matchVlan || matchGebouw) {
      const hostLoc = srv
        ? `${srv.naam}${gebouwName ? ` (${gebouwName} - ${srv.locatie})` : ` (${srv.locatie})`}`
        : 'Niet toegewezen';

      results.push({
        id: vm.id,
        naam: vm.naam,
        category: 'vm',
        categoryLabel: 'Virtuele Machine',
        vestigingId,
        vestigingNaam,
        gebouwNaam: gebouwName,
        ipAdres: vm.ipAdres,
        macAdres: vm.macAdres,
        vlan: vm.vlan,
        serverId: vm.serverId,
        serverNaam: srv ? srv.naam : 'Geen Host',
        details: `${vm.functie} | ${vm.besturingssysteem} (${vm.vcpu}, ${vm.ram})${vm.vlan ? ` | VLAN ${vm.vlan}` : ''}`,
        locatie: hostLoc,
        notities: vm.notities
      });
    }
  }

  // 3. Search Netwerkapparaten
  for (const dev of db.apparaten) {
    const gebouwName = dev.gebouwId ? gebouwMap.get(dev.gebouwId) : undefined;
    const matchName = dev.naam.toLowerCase().includes(q);
    const matchIp = dev.ipAdres && dev.ipAdres.toLowerCase().includes(q);
    const matchMac =
      dev.macAdres &&
      (dev.macAdres.toLowerCase().includes(q) ||
        dev.macAdres.replace(/[:.-]/g, '').toLowerCase().includes(qClean));
    const matchType = dev.type && dev.type.toLowerCase().includes(q);
    const matchModel = dev.merkModel && dev.merkModel.toLowerCase().includes(q);
    const matchLoc = dev.locatie && dev.locatie.toLowerCase().includes(q);
    const matchNotes = dev.notities && dev.notities.toLowerCase().includes(q);
    const matchVlan = dev.vlan && dev.vlan.toLowerCase().includes(q);
    const matchGebouw = gebouwName && gebouwName.toLowerCase().includes(q);

    if (matchName || matchIp || matchMac || matchType || matchModel || matchLoc || matchNotes || matchVlan || matchGebouw) {
      const displayLoc = gebouwName ? `${gebouwName} - ${dev.locatie}` : dev.locatie;

      results.push({
        id: dev.id,
        naam: dev.naam,
        category: 'apparaat',
        categoryLabel: `Netwerkapparaat (${dev.type})`,
        vestigingId: dev.vestigingId,
        vestigingNaam: vestigingMap.get(dev.vestigingId) || 'Onbekend',
        gebouwNaam: gebouwName,
        ipAdres: dev.ipAdres,
        macAdres: dev.macAdres,
        vlan: dev.vlan,
        details: `${dev.merkModel} | Type: ${dev.type.toUpperCase()}${dev.vlan ? ` | VLAN ${dev.vlan}` : ''}`,
        locatie: displayLoc,
        notities: dev.notities
      });
    }
  }

  return results;
}
