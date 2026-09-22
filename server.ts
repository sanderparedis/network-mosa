import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  readDatabase,
  writeDatabase,
  resetToBlank,
  resetToSampleData,
  checkIpConflicts,
  searchInfrastructure
} from './server/db';
import { Vestiging, Gebouw, Vlan, FysiekeServer, VirtueleMachine, Netwerkapparaat } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json({ limit: '10mb' }));

  // Initialize persistent database
  initDatabase();

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // GET complete infrastructure database
  app.get('/api/infrastructure', (req, res) => {
    try {
      const db = readDatabase();
      const conflicts = checkIpConflicts(db);
      res.json({ ...db, conflicts });
    } catch (err: any) {
      res.status(500).json({ error: 'Kon data niet laden: ' + err.message });
    }
  });

  // GET IP conflicts
  app.get('/api/conflicts', (req, res) => {
    try {
      const db = readDatabase();
      const conflicts = checkIpConflicts(db);
      res.json(conflicts);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij controleren IP-conflicten: ' + err.message });
    }
  });

  // GET Search query
  app.get('/api/search', (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      const db = readDatabase();
      const results = searchInfrastructure(q, db);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: 'Zoekfout: ' + err.message });
    }
  });

  // ==================== VESTIGINGEN CRUD ====================
  app.post('/api/vestigingen', (req, res) => {
    try {
      const { naam, adres, contactpersoon, notities, telefoon, email } = req.body;
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'Naam van vestiging is verplicht.' });
      }

      const db = readDatabase();
      const newVestiging: Vestiging = {
        id: 'vest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        naam: naam.trim(),
        adres: (adres || '').trim(),
        contactpersoon: (contactpersoon || '').trim(),
        telefoon: (telefoon || '').trim(),
        email: (email || '').trim(),
        notities: (notities || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.vestigingen.push(newVestiging);
      writeDatabase(db);
      res.status(201).json(newVestiging);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken vestiging: ' + err.message });
    }
  });

  app.put('/api/vestigingen/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { naam, adres, contactpersoon, notities, telefoon, email } = req.body;

      const db = readDatabase();
      const index = db.vestigingen.findIndex(v => v.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Vestiging niet gevonden.' });
      }

      db.vestigingen[index] = {
        ...db.vestigingen[index],
        naam: naam ? naam.trim() : db.vestigingen[index].naam,
        adres: adres !== undefined ? adres.trim() : db.vestigingen[index].adres,
        contactpersoon: contactpersoon !== undefined ? contactpersoon.trim() : db.vestigingen[index].contactpersoon,
        telefoon: telefoon !== undefined ? telefoon.trim() : db.vestigingen[index].telefoon,
        email: email !== undefined ? email.trim() : db.vestigingen[index].email,
        notities: notities !== undefined ? notities.trim() : db.vestigingen[index].notities,
        updatedAt: new Date().toISOString()
      };

      writeDatabase(db);
      res.json(db.vestigingen[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken vestiging: ' + err.message });
    }
  });

  app.delete('/api/vestigingen/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();

      const vestiging = db.vestigingen.find(v => v.id === id);
      if (!vestiging) {
        return res.status(404).json({ error: 'Vestiging niet gevonden.' });
      }

      // Check for associated servers and network devices
      const serverIds = db.servers.filter(s => s.vestigingId === id).map(s => s.id);
      
      // Cascade delete servers, their VMs, network devices, and gebouwen
      db.servers = db.servers.filter(s => s.vestigingId !== id);
      db.vms = db.vms.filter(vm => !serverIds.includes(vm.serverId));
      db.apparaten = db.apparaten.filter(d => d.vestigingId !== id);
      db.gebouwen = (db.gebouwen || []).filter(g => g.vestigingId !== id);
      db.vestigingen = db.vestigingen.filter(v => v.id !== id);

      writeDatabase(db);
      res.json({ message: `Vestiging '${vestiging.naam}' en gekoppelde apparaten verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen vestiging: ' + err.message });
    }
  });

  // ==================== GEBOUWEN CRUD ====================
  app.get('/api/gebouwen', (req, res) => {
    try {
      const db = readDatabase();
      const vestigingId = req.query.vestigingId as string;
      const gebouwen = db.gebouwen || [];
      if (vestigingId) {
        return res.json(gebouwen.filter(g => g.vestigingId === vestigingId));
      }
      res.json(gebouwen);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij ophalen gebouwen: ' + err.message });
    }
  });

  app.post('/api/gebouwen', (req, res) => {
    try {
      const { vestigingId, naam, code, notities } = req.body;
      if (!vestigingId) {
        return res.status(400).json({ error: 'Vestiging is verplicht.' });
      }
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'Gebouwnaam is verplicht.' });
      }

      const db = readDatabase();
      db.gebouwen = db.gebouwen || [];
      const newGebouw: Gebouw = {
        id: 'geb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        vestigingId,
        naam: naam.trim(),
        code: code ? code.trim() : undefined,
        notities: notities ? notities.trim() : undefined
      };

      db.gebouwen.push(newGebouw);
      writeDatabase(db);
      res.status(201).json(newGebouw);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken gebouw: ' + err.message });
    }
  });

  app.put('/api/gebouwen/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      db.gebouwen = db.gebouwen || [];
      const index = db.gebouwen.findIndex(g => g.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Gebouw niet gevonden.' });
      }

      const b = req.body;
      db.gebouwen[index] = {
        ...db.gebouwen[index],
        vestigingId: b.vestigingId !== undefined ? b.vestigingId : db.gebouwen[index].vestigingId,
        naam: b.naam !== undefined ? b.naam.trim() : db.gebouwen[index].naam,
        code: b.code !== undefined ? b.code.trim() : db.gebouwen[index].code,
        notities: b.notities !== undefined ? b.notities.trim() : db.gebouwen[index].notities
      };

      writeDatabase(db);
      res.json(db.gebouwen[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken gebouw: ' + err.message });
    }
  });

  app.delete('/api/gebouwen/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      db.gebouwen = db.gebouwen || [];
      const gebouw = db.gebouwen.find(g => g.id === id);
      if (!gebouw) {
        return res.status(404).json({ error: 'Gebouw niet gevonden.' });
      }

      // Detach gebouwId from servers & network devices
      for (const s of db.servers) {
        if (s.gebouwId === id) delete s.gebouwId;
      }
      for (const a of db.apparaten) {
        if (a.gebouwId === id) delete a.gebouwId;
      }

      db.gebouwen = db.gebouwen.filter(g => g.id !== id);
      writeDatabase(db);
      res.json({ message: `Gebouw '${gebouw.naam}' verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen gebouw: ' + err.message });
    }
  });

  // ==================== VLANS CRUD ====================
  app.get('/api/vlans', (req, res) => {
    try {
      const db = readDatabase();
      let vlans = db.vlans || [];
      const vestigingId = req.query.vestigingId as string;
      if (vestigingId) {
        // Return VLANs that apply globally (no vestigingId) OR to this specific vestiging
        vlans = vlans.filter(v => !v.vestigingId || v.vestigingId === vestigingId || v.vestigingId === 'all');
      }
      // Sort numerically by vlanId
      vlans.sort((a, b) => a.vlanId - b.vlanId);
      res.json(vlans);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij ophalen VLANs: ' + err.message });
    }
  });

  app.post('/api/vlans', (req, res) => {
    try {
      const { vlanId, naam, vestigingId, subnet, gateway, dhcpRange, beschrijving, kleur } = req.body;
      const numVlanId = parseInt(vlanId, 10);
      if (isNaN(numVlanId) || numVlanId < 1 || numVlanId > 4094) {
        return res.status(400).json({ error: 'VLAN ID moet een geldig getal tussen 1 en 4094 zijn.' });
      }
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'VLAN naam is verplicht.' });
      }

      const db = readDatabase();
      db.vlans = db.vlans || [];

      // Check if duplicate vlanId in the same scope
      const existing = db.vlans.find(v => v.vlanId === numVlanId && (
        !v.vestigingId || !vestigingId || v.vestigingId === vestigingId
      ));
      if (existing) {
        return res.status(400).json({
          error: `VLAN ${numVlanId} ('${existing.naam}') bestaat al binnen deze scope.`
        });
      }

      const newVlan: Vlan = {
        id: 'vlan-' + numVlanId + '-' + Date.now().toString(36),
        vlanId: numVlanId,
        naam: naam.trim(),
        vestigingId: vestigingId && vestigingId !== 'all' ? vestigingId : undefined,
        subnet: subnet ? subnet.trim() : undefined,
        gateway: gateway ? gateway.trim() : undefined,
        dhcpRange: dhcpRange ? dhcpRange.trim() : undefined,
        beschrijving: beschrijving ? beschrijving.trim() : undefined,
        kleur: kleur || 'blue',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.vlans.push(newVlan);
      writeDatabase(db);
      res.status(201).json(newVlan);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken VLAN: ' + err.message });
    }
  });

  app.put('/api/vlans/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      db.vlans = db.vlans || [];
      const index = db.vlans.findIndex(v => v.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'VLAN niet gevonden.' });
      }

      const b = req.body;
      const numVlanId = b.vlanId !== undefined ? parseInt(b.vlanId, 10) : db.vlans[index].vlanId;
      if (isNaN(numVlanId) || numVlanId < 1 || numVlanId > 4094) {
        return res.status(400).json({ error: 'VLAN ID moet een getal tussen 1 en 4094 zijn.' });
      }

      db.vlans[index] = {
        ...db.vlans[index],
        vlanId: numVlanId,
        naam: b.naam !== undefined ? b.naam.trim() : db.vlans[index].naam,
        vestigingId: b.vestigingId && b.vestigingId !== 'all' ? b.vestigingId : undefined,
        subnet: b.subnet !== undefined ? b.subnet.trim() : db.vlans[index].subnet,
        gateway: b.gateway !== undefined ? b.gateway.trim() : db.vlans[index].gateway,
        dhcpRange: b.dhcpRange !== undefined ? b.dhcpRange.trim() : db.vlans[index].dhcpRange,
        beschrijving: b.beschrijving !== undefined ? b.beschrijving.trim() : db.vlans[index].beschrijving,
        kleur: b.kleur !== undefined ? b.kleur : db.vlans[index].kleur,
        updatedAt: new Date().toISOString()
      };

      writeDatabase(db);
      res.json(db.vlans[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken VLAN: ' + err.message });
    }
  });

  app.delete('/api/vlans/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      db.vlans = db.vlans || [];
      const vlan = db.vlans.find(v => v.id === id);
      if (!vlan) {
        return res.status(404).json({ error: 'VLAN niet gevonden.' });
      }

      db.vlans = db.vlans.filter(v => v.id !== id);
      writeDatabase(db);
      res.json({ message: `VLAN ${vlan.vlanId} ('${vlan.naam}') succesvol verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen VLAN: ' + err.message });
    }
  });

  // ==================== SERVERS CRUD ====================
  app.post('/api/servers', (req, res) => {
    try {
      const { vestigingId, gebouwId, naam, merkModel, serienummer, ipAdres, locatie, aankoopdatum, garantieEinddatum, notities, status, nicAantal, nics } = req.body;
      if (!vestigingId) {
        return res.status(400).json({ error: 'Vestiging is verplicht.' });
      }
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'Servernaam is verplicht.' });
      }

      const db = readDatabase();
      const newServer: FysiekeServer = {
        id: 'srv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        vestigingId,
        gebouwId: gebouwId || undefined,
        naam: naam.trim(),
        merkModel: (merkModel || '').trim(),
        serienummer: (serienummer || '').trim(),
        ipAdres: (ipAdres || '').trim(),
        locatie: (locatie || '').trim(),
        aankoopdatum: aankoopdatum || '',
        garantieEinddatum: garantieEinddatum || '',
        notities: (notities || '').trim(),
        status: status || 'actief',
        nicAantal: nicAantal !== undefined ? Number(nicAantal) : (Array.isArray(nics) ? nics.length : 1),
        nics: Array.isArray(nics) ? nics : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.servers.push(newServer);
      writeDatabase(db);
      res.status(201).json(newServer);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken server: ' + err.message });
    }
  });

  app.put('/api/servers/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const index = db.servers.findIndex(s => s.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Server niet gevonden.' });
      }

      const b = req.body;
      db.servers[index] = {
        ...db.servers[index],
        vestigingId: b.vestigingId !== undefined ? b.vestigingId : db.servers[index].vestigingId,
        gebouwId: b.gebouwId !== undefined ? (b.gebouwId || undefined) : db.servers[index].gebouwId,
        naam: b.naam !== undefined ? b.naam.trim() : db.servers[index].naam,
        merkModel: b.merkModel !== undefined ? b.merkModel.trim() : db.servers[index].merkModel,
        serienummer: b.serienummer !== undefined ? b.serienummer.trim() : db.servers[index].serienummer,
        ipAdres: b.ipAdres !== undefined ? b.ipAdres.trim() : db.servers[index].ipAdres,
        locatie: b.locatie !== undefined ? b.locatie.trim() : db.servers[index].locatie,
        aankoopdatum: b.aankoopdatum !== undefined ? b.aankoopdatum : db.servers[index].aankoopdatum,
        garantieEinddatum: b.garantieEinddatum !== undefined ? b.garantieEinddatum : db.servers[index].garantieEinddatum,
        notities: b.notities !== undefined ? b.notities.trim() : db.servers[index].notities,
        status: b.status !== undefined ? b.status : db.servers[index].status,
        nicAantal: b.nicAantal !== undefined ? Number(b.nicAantal) : db.servers[index].nicAantal,
        nics: b.nics !== undefined ? b.nics : db.servers[index].nics,
        updatedAt: new Date().toISOString()
      };

      writeDatabase(db);
      res.json(db.servers[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken server: ' + err.message });
    }
  });

  app.delete('/api/servers/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const server = db.servers.find(s => s.id === id);
      if (!server) {
        return res.status(404).json({ error: 'Server niet gevonden.' });
      }

      // Also remove or unlink associated VMs
      const vmCount = db.vms.filter(v => v.serverId === id).length;
      db.vms = db.vms.filter(v => v.serverId !== id);
      db.servers = db.servers.filter(s => s.id !== id);

      writeDatabase(db);
      res.json({ message: `Server '${server.naam}' en ${vmCount} VM's verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen server: ' + err.message });
    }
  });

  // ==================== VIRTUAL MACHINES CRUD ====================
  app.post('/api/vms', (req, res) => {
    try {
      const { serverId, naam, functie, besturingssysteem, ipAdres, macAdres, vcpu, ram, schijfgrootte, notities, status } = req.body;
      if (!serverId) {
        return res.status(400).json({ error: 'Host server is verplicht.' });
      }
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'VM-naam is verplicht.' });
      }

      const db = readDatabase();
      const newVm: VirtueleMachine = {
        id: 'vm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        serverId,
        naam: naam.trim(),
        functie: (functie || '').trim(),
        besturingssysteem: (besturingssysteem || '').trim(),
        ipAdres: (ipAdres || '').trim(),
        macAdres: (macAdres || '').trim().toUpperCase(),
        vcpu: (vcpu || '').toString().trim(),
        ram: (ram || '').toString().trim(),
        schijfgrootte: (schijfgrootte || '').trim(),
        notities: (notities || '').trim(),
        status: status || 'actief',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.vms.push(newVm);
      writeDatabase(db);
      res.status(201).json(newVm);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken VM: ' + err.message });
    }
  });

  app.put('/api/vms/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const index = db.vms.findIndex(v => v.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Virtuele machine niet gevonden.' });
      }

      const b = req.body;
      db.vms[index] = {
        ...db.vms[index],
        serverId: b.serverId !== undefined ? b.serverId : db.vms[index].serverId,
        naam: b.naam !== undefined ? b.naam.trim() : db.vms[index].naam,
        functie: b.functie !== undefined ? b.functie.trim() : db.vms[index].functie,
        besturingssysteem: b.besturingssysteem !== undefined ? b.besturingssysteem.trim() : db.vms[index].besturingssysteem,
        ipAdres: b.ipAdres !== undefined ? b.ipAdres.trim() : db.vms[index].ipAdres,
        macAdres: b.macAdres !== undefined ? b.macAdres.trim().toUpperCase() : db.vms[index].macAdres,
        vcpu: b.vcpu !== undefined ? b.vcpu.toString().trim() : db.vms[index].vcpu,
        ram: b.ram !== undefined ? b.ram.toString().trim() : db.vms[index].ram,
        schijfgrootte: b.schijfgrootte !== undefined ? b.schijfgrootte.trim() : db.vms[index].schijfgrootte,
        notities: b.notities !== undefined ? b.notities.trim() : db.vms[index].notities,
        status: b.status !== undefined ? b.status : db.vms[index].status,
        updatedAt: new Date().toISOString()
      };

      writeDatabase(db);
      res.json(db.vms[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken VM: ' + err.message });
    }
  });

  app.delete('/api/vms/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const vm = db.vms.find(v => v.id === id);
      if (!vm) {
        return res.status(404).json({ error: 'Virtuele machine niet gevonden.' });
      }

      db.vms = db.vms.filter(v => v.id !== id);
      writeDatabase(db);
      res.json({ message: `VM '${vm.naam}' verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen VM: ' + err.message });
    }
  });

  // ==================== NETWERKAPPARATEN CRUD ====================
  app.post('/api/apparaten', (req, res) => {
    try {
      const { vestigingId, gebouwId, naam, type, merkModel, ipAdres, macAdres, vlan, locatie, poorten, notities } = req.body;
      if (!vestigingId) {
        return res.status(400).json({ error: 'Vestiging is verplicht.' });
      }
      if (!naam || !naam.trim()) {
        return res.status(400).json({ error: 'Apparaatnaam is verplicht.' });
      }

      const db = readDatabase();
      const newDev: Netwerkapparaat = {
        id: 'net-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        vestigingId,
        gebouwId: gebouwId || undefined,
        naam: naam.trim(),
        type: type || 'switch',
        merkModel: (merkModel || '').trim(),
        ipAdres: (ipAdres || '').trim(),
        macAdres: (macAdres || '').trim().toUpperCase(),
        vlan: (vlan || '').trim(),
        locatie: (locatie || '').trim(),
        poorten: (poorten || '').trim(),
        notities: (notities || '').trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.apparaten.push(newDev);
      writeDatabase(db);
      res.status(201).json(newDev);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij aanmaken apparaat: ' + err.message });
    }
  });

  app.put('/api/apparaten/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const index = db.apparaten.findIndex(d => d.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Netwerkapparaat niet gevonden.' });
      }

      const b = req.body;
      db.apparaten[index] = {
        ...db.apparaten[index],
        vestigingId: b.vestigingId !== undefined ? b.vestigingId : db.apparaten[index].vestigingId,
        gebouwId: b.gebouwId !== undefined ? (b.gebouwId || undefined) : db.apparaten[index].gebouwId,
        naam: b.naam !== undefined ? b.naam.trim() : db.apparaten[index].naam,
        type: b.type !== undefined ? b.type : db.apparaten[index].type,
        merkModel: b.merkModel !== undefined ? b.merkModel.trim() : db.apparaten[index].merkModel,
        ipAdres: b.ipAdres !== undefined ? b.ipAdres.trim() : db.apparaten[index].ipAdres,
        macAdres: b.macAdres !== undefined ? b.macAdres.trim().toUpperCase() : db.apparaten[index].macAdres,
        vlan: b.vlan !== undefined ? b.vlan.trim() : db.apparaten[index].vlan,
        locatie: b.locatie !== undefined ? b.locatie.trim() : db.apparaten[index].locatie,
        poorten: b.poorten !== undefined ? b.poorten.trim() : db.apparaten[index].poorten,
        notities: b.notities !== undefined ? b.notities.trim() : db.apparaten[index].notities,
        updatedAt: new Date().toISOString()
      };

      writeDatabase(db);
      res.json(db.apparaten[index]);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij bijwerken apparaat: ' + err.message });
    }
  });

  app.delete('/api/apparaten/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDatabase();
      const dev = db.apparaten.find(d => d.id === id);
      if (!dev) {
        return res.status(404).json({ error: 'Netwerkapparaat niet gevonden.' });
      }

      db.apparaten = db.apparaten.filter(d => d.id !== id);
      writeDatabase(db);
      res.json({ message: `Netwerkapparaat '${dev.naam}' verwijderd.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij verwijderen apparaat: ' + err.message });
    }
  });

  // ==================== CSV EXPORT ROUTE ====================
  app.get('/api/export/csv', (req, res) => {
    try {
      const vestigingId = req.query.vestigingId as string;
      const db = readDatabase();
      const vestigingMap = new Map(db.vestigingen.map(v => [v.id, v.naam]));
      const gebouwMap = new Map((db.gebouwen || []).map(g => [g.id, g.naam + (g.code ? ` (${g.code})` : '')]));
      const serverMap = new Map(db.servers.map(s => [s.id, s.naam]));

      const targetVestigingen = vestigingId ? db.vestigingen.filter(v => v.id === vestigingId) : db.vestigingen;
      const targetServers = vestigingId ? db.servers.filter(s => s.vestigingId === vestigingId) : db.servers;
      const targetServerIds = new Set(targetServers.map(s => s.id));
      const targetVms = db.vms.filter(v => targetServerIds.has(v.serverId));
      const targetApparaten = vestigingId ? db.apparaten.filter(a => a.vestigingId === vestigingId) : db.apparaten;

      // Header row
      const rows: string[][] = [
        ['Vestiging', 'Gebouw', 'Categorie', 'Naam', 'Host Server', 'Type / Functie / Rol', 'Merk & Model / OS', 'Beheer IP', 'MAC-Adres', 'VLAN / NIC Details', 'Specificaties (vCPU/RAM/Opslag)', 'Locatie / Rack', 'Serienummer', 'Garantie Tot', 'Notities']
      ];

      // Servers
      for (const s of targetServers) {
        const nicSummary = (s.nics && s.nics.length > 0)
          ? s.nics.map(n => `${n.naam}: IP ${n.ipAdres || 'n/b'} | MAC ${n.macAdres || 'n/b'} | VLAN ${n.vlan || 'n/b'}`).join(' ; ')
          : (s.nicAantal ? `${s.nicAantal} NICs` : '-');

        rows.push([
          vestigingMap.get(s.vestigingId) || '',
          s.gebouwId ? (gebouwMap.get(s.gebouwId) || '') : 'Geen',
          'Fysieke Server',
          s.naam,
          '-',
          'Hypervisor / Host',
          s.merkModel,
          s.ipAdres,
          '-',
          nicSummary,
          '-',
          s.locatie,
          s.serienummer,
          s.garantieEinddatum || '',
          s.notities
        ]);
      }

      // VMs
      for (const vm of targetVms) {
        const srv = db.servers.find(s => s.id === vm.serverId);
        const vestId = srv ? srv.vestigingId : '';
        const gebouwName = srv?.gebouwId ? (gebouwMap.get(srv.gebouwId) || '') : '';
        rows.push([
          vestId ? (vestigingMap.get(vestId) || '') : '',
          gebouwName || '-',
          'Virtuele Machine (VM)',
          vm.naam,
          serverMap.get(vm.serverId) || 'Onbekend',
          vm.functie,
          vm.besturingssysteem,
          vm.ipAdres,
          vm.macAdres,
          vm.vlan || '-',
          `${vm.vcpu} | ${vm.ram} | ${vm.schijfgrootte}`,
          srv ? srv.locatie : '',
          '-',
          '-',
          vm.notities
        ]);
      }

      // Network devices
      for (const dev of targetApparaten) {
        rows.push([
          vestigingMap.get(dev.vestigingId) || '',
          dev.gebouwId ? (gebouwMap.get(dev.gebouwId) || '') : 'Geen',
          `Netwerk (${dev.type})`,
          dev.naam,
          '-',
          dev.type.toUpperCase(),
          dev.merkModel,
          dev.ipAdres,
          dev.macAdres,
          dev.vlan || '-',
          dev.poorten || '',
          dev.locatie,
          '-',
          '-',
          dev.notities
        ]);
      }

      const csvContent = rows
        .map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';'))
        .join('\r\n');

      const filename = vestigingId
        ? `infrastructuur_${(targetVestigingen[0]?.naam || 'vestiging').replace(/[^a-zA-Z0-9]/g, '_')}.csv`
        : `infrastructuur_alle_vestigingen_${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      // Add UTF-8 BOM for Microsoft Excel compatibility
      res.send('\uFEFF' + csvContent);
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij genereren CSV: ' + err.message });
    }
  });

  // ==================== BACKUP & RESTORE ====================
  app.post('/api/backup/restore', (req, res) => {
    try {
      const data = req.body;
      if (!data || !Array.isArray(data.vestigingen) || !Array.isArray(data.servers)) {
        return res.status(400).json({ error: 'Ongeldig back-upbestand formaat.' });
      }
      writeDatabase(data);
      res.json({ message: 'Back-up succesvol hersteld.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij herstellen back-up: ' + err.message });
    }
  });

  // ==================== RESET / CLEAR DATABASE ====================
  app.post('/api/reset-blank', (req, res) => {
    try {
      const db = resetToBlank();
      res.json({ message: 'Database succesvol leeggemaakt. U kunt nu blanco beginnen.', data: db });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij leegmaken database: ' + err.message });
    }
  });

  app.post('/api/reset-sample-data', (req, res) => {
    try {
      const db = resetToSampleData();
      res.json({ message: 'Standaard voorbeelddata opnieuw geladen.', data: db });
    } catch (err: any) {
      res.status(500).json({ error: 'Fout bij herstellen voorbeelddata: ' + err.message });
    }
  });

  // Vite middleware for development / static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server gestart op http://0.0.0.0:${PORT}`);
  });
}

startServer();
