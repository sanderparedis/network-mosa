import fs from 'fs';
import path from 'path';
import {
  InfrastructureDatabase,
  Vestiging,
  Gebouw,
  Vlan,
  FysiekeServer,
  VirtueleMachine,
  Netwerkapparaat,
  IpConflict,
  SearchResultItem
} from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_DATA: InfrastructureDatabase = {
  lastUpdated: new Date().toISOString(),
  vestigingen: [
    {
      id: 'vest-1',
      naam: 'Campus Centrum (Hoofdvestiging)',
      adres: 'Scholenboulevard 10, 1000 Brussel',
      contactpersoon: 'Mark van Dijk (Hoofd ICT) - 02 555 1201',
      telefoon: '02 555 1200',
      email: 'ict.centrum@scholengroep.be',
      notities: 'Centrale serverruimte bevindt zich in keldercompartiment K-04 met dubbele UPS en noodkoeling. Toegang uitsluitend via badge.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vest-2',
      naam: 'Campus Noord (Middenschool & Junior)',
      adres: 'Noorderlaan 45, 1020 Laken',
      contactpersoon: 'Anja Peeters (Locatiebeheerder ICT) - 02 555 1202',
      telefoon: '02 555 1202',
      email: 'ict.noord@scholengroep.be',
      notities: 'Patchkast bevindt zich in conciërgewoning lokaal 0.12. Sleutel beschikbaar bij het onthaal.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vest-3',
      naam: 'Campus Zuid (Bovenbouw & Wetenschappen)',
      adres: 'Zuiderkruisstraat 8, 1050 Elsene',
      contactpersoon: 'Koen Mertens (Netwerkbeheerder) - 02 555 1203',
      telefoon: '02 555 1203',
      email: 'ict.zuid@scholengroep.be',
      notities: 'Serverkast bevindt zich op de 2e verdieping van de wetenschapsvleugel (lokaal W204).',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vest-4',
      naam: 'Campus West (Techniek & Beroepsonderwijs)',
      adres: 'Ambachtenlaan 24, 1070 Anderlecht',
      contactpersoon: 'Samira El Amrani (Systeembeheer) - 02 555 1204',
      telefoon: '02 555 1204',
      email: 'ict.west@scholengroep.be',
      notities: 'Industriële rackopstelling in technische ruimte T-1. Gescheiden VLAN voor industriële machines en CAD-stations.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    }
  ],
  gebouwen: [
    {
      id: 'gebouw-1',
      vestigingId: 'vest-1',
      naam: 'Hoofdgebouw (A)',
      code: 'A',
      notities: 'Centrale administratie, directie en datacenter kelder K-04.'
    },
    {
      id: 'gebouw-2',
      vestigingId: 'vest-1',
      naam: 'Mediacentrum & Bibliotheek (B)',
      code: 'B',
      notities: 'Lokalen B101-B205 en centrale patchkast 1e verdieping.'
    },
    {
      id: 'gebouw-3',
      vestigingId: 'vest-2',
      naam: 'Hoofdgebouw (A)',
      code: 'A',
      notities: 'Middenschool algemene leslokalen en patchkast 0.12.'
    },
    {
      id: 'gebouw-4',
      vestigingId: 'vest-2',
      naam: 'Junior Vleugel (B)',
      code: 'B',
      notities: 'Eerste graad klassen en switchkast J-1.'
    },
    {
      id: 'gebouw-5',
      vestigingId: 'vest-3',
      naam: 'Centraal Gebouw (C)',
      code: 'C',
      notities: 'Administratie en taalvakken.'
    },
    {
      id: 'gebouw-6',
      vestigingId: 'vest-3',
      naam: 'Wetenschapsvleugel (W)',
      code: 'W',
      notities: 'Laboratoria fysica/chemie/biologie en serverruimte W204.'
    },
    {
      id: 'gebouw-7',
      vestigingId: 'vest-4',
      naam: 'Theoriegebouw (T)',
      code: 'T',
      notities: 'Theorielokalen en burelen directie.'
    },
    {
      id: 'gebouw-8',
      vestigingId: 'vest-4',
      naam: 'Techniekateliers & Werkplaatsen (P)',
      code: 'P',
      notities: 'Industriële rackopstelling in technische ruimte T-1, CNC machines en CAD klassen.'
    }
  ],
  vlans: [
    {
      id: 'vlan-10',
      vlanId: 10,
      naam: 'Beheer & iDRAC / IPMI',
      subnet: '10.10.1.0/24',
      gateway: '10.10.1.1',
      dhcpRange: 'Geen (Statisch)',
      beschrijving: 'Dedicated beheer voor switches, routers, firewall en server iDRAC/iLO interfaces.',
      kleur: 'indigo'
    },
    {
      id: 'vlan-20',
      vlanId: 20,
      naam: 'Servers & Productie',
      subnet: '10.10.20.0/24',
      gateway: '10.10.20.1',
      dhcpRange: '10.10.20.100 - 10.10.20.200',
      beschrijving: 'Hypervisors, domeincontrollers, bestandsservers en applicatieservers.',
      kleur: 'blue'
    },
    {
      id: 'vlan-30',
      vlanId: 30,
      naam: 'Administratie & Docenten',
      subnet: '10.10.30.0/24',
      gateway: '10.10.30.1',
      dhcpRange: '10.10.30.50 - 10.10.30.250',
      beschrijving: 'Werkplekken personeel, administratie en beveiligde printertoegang.',
      kleur: 'emerald'
    },
    {
      id: 'vlan-40',
      vlanId: 40,
      naam: 'Leerlingen & Klaslokalen',
      subnet: '10.10.40.0/22',
      gateway: '10.10.40.1',
      dhcpRange: '10.10.40.10 - 10.10.43.250',
      beschrijving: 'Leerlingenlaptops, PC-klassen en Wi-Fi met contentfiltering.',
      kleur: 'amber'
    },
    {
      id: 'vlan-50',
      vlanId: 50,
      naam: 'Storage / SAN (iSCSI & NFS)',
      subnet: '10.10.50.0/24',
      gateway: 'Niet gerouteerd (Geïsoleerd)',
      dhcpRange: 'Geen (Statisch)',
      beschrijving: 'Non-routable SAN netwerk met Jumbo Frames voor iSCSI opslagverkeer.',
      kleur: 'purple'
    },
    {
      id: 'vlan-60',
      vlanId: 60,
      naam: 'VoIP Telefonie & Intercom',
      subnet: '10.10.60.0/24',
      gateway: '10.10.60.1',
      dhcpRange: '10.10.60.10 - 10.10.60.200',
      beschrijving: 'IP-telefoons, belsystemen en klasintercom met QoS prioriteit.',
      kleur: 'cyan'
    },
    {
      id: 'vlan-70',
      vlanId: 70,
      naam: 'Beveiliging, CCTV & Toegang',
      subnet: '10.10.70.0/24',
      gateway: '10.10.70.1',
      dhcpRange: '10.10.70.20 - 10.10.70.200',
      beschrijving: 'IP-camera\'s, badgelezers en inbraakcentrales.',
      kleur: 'rose'
    },
    {
      id: 'vlan-99',
      vlanId: 99,
      naam: 'Gasten Wi-Fi',
      subnet: '172.16.99.0/24',
      gateway: '172.16.99.1',
      dhcpRange: '172.16.99.10 - 172.16.99.250',
      beschrijving: 'Geïsoleerd gastennetwerk met captive portal, geen toegang tot intern LAN.',
      kleur: 'slate'
    }
  ],
  servers: [
    {
      id: 'srv-1',
      vestigingId: 'vest-1',
      gebouwId: 'gebouw-1',
      naam: 'SRV-CENTRUM-HYPERV01',
      merkModel: 'Dell PowerEdge R750 (2x Intel Xeon Gold 6330, 256GB RAM)',
      serienummer: '8X9B2K3',
      ipAdres: '10.10.1.10',
      locatie: 'Serverruimte Kelder - Rack A (U14-U16)',
      aankoopdatum: '2022-09-01',
      garantieEinddatum: '2027-08-31',
      notities: 'Hyper-V Cluster Node 1. Dual 10GbE SFP+ uplinks naar Core Switch. iDRAC Enterprise licentie.',
      status: 'actief',
      nicAantal: 4,
      nics: [
        {
          id: 'nic-1-1',
          naam: 'NIC 1 (iDRAC / Beheer)',
          ipAdres: '10.10.1.10',
          macAdres: '70:B5:E8:A1:01:01',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-1-2',
          naam: 'NIC 2 (LAN Productie)',
          ipAdres: '10.10.20.10',
          macAdres: '70:B5:E8:A1:01:02',
          vlan: '20 (Servers)',
          snelheid: '10 GbE SFP+'
        },
        {
          id: 'nic-1-3',
          naam: 'NIC 3 (Storage / SAN)',
          ipAdres: '10.10.50.10',
          macAdres: '70:B5:E8:A1:01:03',
          vlan: '50 (SAN iSCSI)',
          snelheid: '10 GbE SFP+'
        },
        {
          id: 'nic-1-4',
          naam: 'NIC 4 (VM Switch Trunk)',
          ipAdres: '',
          macAdres: '70:B5:E8:A1:01:04',
          vlan: 'Trunk (10, 20, 30)',
          snelheid: '10 GbE SFP+'
        }
      ],
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'srv-2',
      vestigingId: 'vest-1',
      gebouwId: 'gebouw-1',
      naam: 'SRV-CENTRUM-HYPERV02',
      merkModel: 'Dell PowerEdge R750 (2x Intel Xeon Gold 6330, 256GB RAM)',
      serienummer: '8X9B2K4',
      ipAdres: '10.10.1.20',
      locatie: 'Serverruimte Kelder - Rack A (U17-U19)',
      aankoopdatum: '2022-09-01',
      garantieEinddatum: '2027-08-31',
      notities: 'Hyper-V Cluster Node 2. Automatische failover met Node 1 via shared SAN opslag.',
      status: 'actief',
      nicAantal: 4,
      nics: [
        {
          id: 'nic-2-1',
          naam: 'NIC 1 (iDRAC / Beheer)',
          ipAdres: '10.10.1.20',
          macAdres: '70:B5:E8:A1:02:01',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-2-2',
          naam: 'NIC 2 (LAN Productie)',
          ipAdres: '10.10.20.20',
          macAdres: '70:B5:E8:A1:02:02',
          vlan: '20 (Servers)',
          snelheid: '10 GbE SFP+'
        },
        {
          id: 'nic-2-3',
          naam: 'NIC 3 (Storage / SAN)',
          ipAdres: '10.10.50.20',
          macAdres: '70:B5:E8:A1:02:03',
          vlan: '50 (SAN iSCSI)',
          snelheid: '10 GbE SFP+'
        },
        {
          id: 'nic-2-4',
          naam: 'NIC 4 (VM Switch Trunk)',
          ipAdres: '',
          macAdres: '70:B5:E8:A1:02:04',
          vlan: 'Trunk (10, 20, 30)',
          snelheid: '10 GbE SFP+'
        }
      ],
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'srv-3',
      vestigingId: 'vest-2',
      gebouwId: 'gebouw-3',
      naam: 'SRV-NOORD-HOST01',
      merkModel: 'HPE ProLiant DL380 Gen10 (1x Intel Xeon Silver 4214, 64GB RAM)',
      serienummer: 'CZ293108AA',
      ipAdres: '10.20.1.10',
      locatie: 'Patchkast Hoofdgebouw - Rack B (U8-U10)',
      aankoopdatum: '2021-11-20',
      garantieEinddatum: '2026-11-15',
      notities: 'Standalone ESXi 7.0 host voor lokale vestigingsdiensten. iLO Advanced geactiveerd.',
      status: 'actief',
      nicAantal: 2,
      nics: [
        {
          id: 'nic-3-1',
          naam: 'NIC 1 (iLO / Beheer)',
          ipAdres: '10.20.1.10',
          macAdres: '94:57:A5:B2:01:01',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-3-2',
          naam: 'NIC 2 (LAN Productie & VM)',
          ipAdres: '10.20.20.10',
          macAdres: '94:57:A5:B2:01:02',
          vlan: '20 (Servers)',
          snelheid: '10 GbE RJ45'
        }
      ],
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'srv-4',
      vestigingId: 'vest-3',
      gebouwId: 'gebouw-6',
      naam: 'SRV-ZUID-HOST01',
      merkModel: 'Dell PowerEdge R650 (1x Intel Xeon Silver 4314, 128GB RAM)',
      serienummer: '9K1M3P2',
      ipAdres: '10.30.1.10',
      locatie: 'Serverkast Wetenschapsvleugel (U6-U7)',
      aankoopdatum: '2023-04-01',
      garantieEinddatum: '2028-03-30',
      notities: 'Hyper-V host voor campusdomein en wetenschappelijke practicumlaboratoria.',
      status: 'actief',
      nicAantal: 2,
      nics: [
        {
          id: 'nic-4-1',
          naam: 'NIC 1 (iDRAC / Beheer)',
          ipAdres: '10.30.1.10',
          macAdres: '70:B5:E8:B3:01:01',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-4-2',
          naam: 'NIC 2 (LAN & VM Trunk)',
          ipAdres: '10.30.20.10',
          macAdres: '70:B5:E8:B3:01:02',
          vlan: '20 (Servers)',
          snelheid: '10 GbE SFP+'
        }
      ],
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'srv-5',
      vestigingId: 'vest-4',
      gebouwId: 'gebouw-8',
      naam: 'SRV-WEST-HOST01',
      merkModel: 'Dell PowerEdge R750xs (2x Intel Xeon Silver 4310, 128GB RAM)',
      serienummer: '5F7T9W1',
      ipAdres: '10.40.1.10',
      locatie: 'Rack Werkplaatsen Techniek (U10-U12)',
      aankoopdatum: '2022-01-10',
      garantieEinddatum: '2027-01-15',
      notities: 'Host voor werkplaatssoftware, licentieservers en lokale AD replica.',
      status: 'actief',
      nicAantal: 2,
      nics: [
        {
          id: 'nic-5-1',
          naam: 'NIC 1 (iDRAC / Beheer)',
          ipAdres: '10.40.1.10',
          macAdres: '70:B5:E8:D4:01:01',
          vlan: '10 (Beheer)',
          snelheid: '1 GbE RJ45'
        },
        {
          id: 'nic-5-2',
          naam: 'NIC 2 (LAN & CAD Werkplaatsen)',
          ipAdres: '10.40.20.10',
          macAdres: '70:B5:E8:D4:01:02',
          vlan: '40 (Techniek)',
          snelheid: '10 GbE RJ45'
        }
      ],
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    }
  ],
  vms: [
    {
      id: 'vm-1',
      serverId: 'srv-1',
      naam: 'VM-CENTRUM-DC01',
      functie: 'Primaire Domeincontroller (AD DS, DNS, DHCP, NPS)',
      besturingssysteem: 'Windows Server 2022 Datacenter',
      ipAdres: '10.10.1.11',
      macAdres: '00:15:5D:10:01:11',
      vlan: '10 (Beheer)',
      vcpu: '4 vCPU',
      ram: '16 GB',
      schijfgrootte: '120 GB SSD (C:)',
      notities: 'FSMO rolhouder. Niet uitschakelen tijdens schooluren.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-2',
      serverId: 'srv-1',
      naam: 'VM-CENTRUM-FS01',
      functie: 'Centrale Bestandsserver (Directie, Personeel, Leerlingen)',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.10.1.12',
      macAdres: '00:15:5D:10:01:12',
      vlan: '20 (Servers)',
      vcpu: '8 vCPU',
      ram: '32 GB',
      schijfgrootte: '100 GB OS + 4 TB Data (VHDX)',
      notities: 'SMB shares gemapt via Group Policy. Dagelijkse backup naar Veeam.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-3',
      serverId: 'srv-1',
      naam: 'VM-CENTRUM-PRINT01',
      functie: 'Centrale Printserver & PaperCut Beheer',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.10.1.15',
      macAdres: '00:15:5D:10:01:15',
      vlan: '20 (Servers)',
      vcpu: '2 vCPU',
      ram: '8 GB',
      schijfgrootte: '120 GB SSD',
      notities: 'PaperCut MF applicatieserver met "Find-Me" printqueues voor alle vestigingen.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-4',
      serverId: 'srv-2',
      naam: 'VM-CENTRUM-DC02',
      functie: 'Secundaire Domeincontroller (Replica AD DS & DNS)',
      besturingssysteem: 'Windows Server 2022 Datacenter',
      ipAdres: '10.10.1.21',
      macAdres: '00:15:5D:10:02:21',
      vlan: '10 (Beheer)',
      vcpu: '4 vCPU',
      ram: '16 GB',
      schijfgrootte: '120 GB SSD',
      notities: 'Draait op fysieke Host 2 voor redundantie.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-5',
      serverId: 'srv-2',
      naam: 'VM-CENTRUM-APPL01',
      functie: 'Schooladministratie (Smartschool Sync, Wisa / Informat)',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.10.1.25',
      macAdres: '00:15:5D:10:02:25',
      vlan: '20 (Servers)',
      vcpu: '4 vCPU',
      ram: '16 GB',
      schijfgrootte: '200 GB SSD',
      notities: 'Koppeling met leerlingendatabase en automatische nachtelijke accountsynchronisatie.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-6',
      serverId: 'srv-2',
      naam: 'VM-CENTRUM-BACKUP01',
      functie: 'Veeam Backup & Replication Repository',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.10.1.30',
      macAdres: '00:15:5D:10:02:30',
      vlan: '50 (SAN/Backup)',
      vcpu: '4 vCPU',
      ram: '32 GB',
      schijfgrootte: '150 GB OS + 8 TB iSCSI Volume',
      notities: 'Maakt dagelijkse back-ups van alle VM’s op alle vestigingen.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-7',
      serverId: 'srv-3',
      naam: 'VM-NOORD-DC01',
      functie: 'Lokale Domeincontroller & Lokale DNS/DHCP Server',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.20.1.11',
      macAdres: '00:15:5D:20:01:11',
      vlan: '10 (Beheer)',
      vcpu: '2 vCPU',
      ram: '8 GB',
      schijfgrootte: '80 GB SSD',
      notities: 'Lokaal aanmelden mogelijk bij WAN-uitval.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-8',
      serverId: 'srv-3',
      naam: 'VM-NOORD-CACHE01',
      functie: 'Lokale File Cache & WSUS Update Proxy',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.20.1.12',
      macAdres: '00:15:5D:20:01:12',
      vlan: '20 (Servers)',
      vcpu: '2 vCPU',
      ram: '8 GB',
      schijfgrootte: '500 GB SSD',
      notities: 'BranchCache geactiveerd om WAN bandbreedte naar Campus Centrum te ontlasten.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-9',
      serverId: 'srv-4',
      naam: 'VM-ZUID-DC01',
      functie: 'Lokale Domeincontroller & Lokale DNS Resolver',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.30.1.11',
      macAdres: '00:15:5D:30:01:11',
      vlan: '10 (Beheer)',
      vcpu: '2 vCPU',
      ram: '8 GB',
      schijfgrootte: '80 GB SSD',
      notities: 'Geauthenticeerde DNS forwarding naar hoofdvestiging.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-10',
      serverId: 'srv-4',
      naam: 'VM-ZUID-LAB01',
      functie: 'Linux Practicumserver (Python, JupyterHub, PostgreSQL)',
      besturingssysteem: 'Ubuntu Server 24.04 LTS',
      ipAdres: '10.30.1.20',
      macAdres: '00:15:5D:30:01:20',
      vlan: '30 (Practicum)',
      vcpu: '8 vCPU',
      ram: '32 GB',
      schijfgrootte: '500 GB NVMe',
      notities: 'Gebruikt door informatica-klassen in de bovenbouw. Docker containers per leerling.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-11',
      serverId: 'srv-5',
      naam: 'VM-WEST-DC01',
      functie: 'Lokale Domeincontroller & DHCP Server',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.40.1.11',
      macAdres: '00:15:5D:40:01:11',
      vlan: '10 (Beheer)',
      vcpu: '2 vCPU',
      ram: '8 GB',
      schijfgrootte: '80 GB SSD',
      notities: 'DHCP scopes voor administratief netwerk en leerling-wifi.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'vm-12',
      serverId: 'srv-5',
      naam: 'VM-WEST-CAD01',
      functie: 'Licentieserver Autodesk & SolidWorks (FlexLM)',
      besturingssysteem: 'Windows Server 2022 Standard',
      ipAdres: '10.40.1.15',
      macAdres: '00:15:5D:40:01:15',
      vlan: '40 (Techniek)',
      vcpu: '4 vCPU',
      ram: '16 GB',
      schijfgrootte: '120 GB SSD',
      notities: 'Netwerklicenties voor 60 werkstations in de ontwerplokalen.',
      status: 'actief',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    }
  ],
  apparaten: [
    {
      id: 'net-1',
      vestigingId: 'vest-1',
      gebouwId: 'gebouw-1',
      naam: 'SW-CENTRUM-CORE01',
      type: 'switch',
      merkModel: 'Aruba CX 6300M 48G (JL661A)',
      ipAdres: '10.10.1.2',
      macAdres: '20:4C:03:D4:55:10',
      vlan: '10 (Beheer)',
      locatie: 'Serverruimte Kelder - Rack A (U24)',
      poorten: '48x 1GbE PoE+ (740W), 4x 50GbE SFP56 uplinks',
      notities: 'Core switch stack master met VSF stacking naar CORE02.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'net-2',
      vestigingId: 'vest-1',
      gebouwId: 'gebouw-1',
      naam: 'FW-CENTRUM-GATEWAY',
      type: 'firewall',
      merkModel: 'Fortinet FortiGate 100F',
      ipAdres: '10.10.1.1',
      macAdres: '08:5B:0E:12:34:56',
      vlan: '10 (Beheer)',
      locatie: 'Serverruimte Kelder - Rack A (U26)',
      poorten: '16x GE RJ45, 4x SFP, 2x 10GE SFP+ FortiLink',
      notities: 'Centrale internetgateway (1 Gbps fiber symetrisch). Beheert IPSec VPN tunnels naar de 3 andere vestigingen.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'net-3',
      vestigingId: 'vest-2',
      gebouwId: 'gebouw-3',
      naam: 'SW-NOORD-DIST01',
      type: 'switch',
      merkModel: 'Aruba CX 6200F 48G (JL726A)',
      ipAdres: '10.20.1.2',
      macAdres: '20:4C:03:D4:66:22',
      vlan: '10 (Beheer)',
      locatie: 'Patchkast Hoofdgebouw - Rack B (U12)',
      poorten: '48x 1GbE PoE+ (370W), 4x 10G SFP+',
      notities: 'Verbindt alle klaslokalen van het hoofdgebouw Noord.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'net-4',
      vestigingId: 'vest-2',
      gebouwId: 'gebouw-3',
      naam: 'FW-NOORD-VPN',
      type: 'firewall',
      merkModel: 'Fortinet FortiGate 60F',
      ipAdres: '10.20.1.1',
      macAdres: '08:5B:0E:78:9A:BC',
      vlan: '10 (Beheer)',
      locatie: 'Patchkast Hoofdgebouw - Rack B (U14)',
      poorten: '10x GE RJ45 poorten',
      notities: 'IPSec VPN tunnel naar Campus Centrum.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'net-5',
      vestigingId: 'vest-3',
      gebouwId: 'gebouw-6',
      naam: 'SW-ZUID-CORE01',
      type: 'switch',
      merkModel: 'Cisco Catalyst 1000-48FP-4X',
      ipAdres: '10.30.1.2',
      macAdres: 'F4:4E:05:88:11:33',
      vlan: '10 (Beheer)',
      locatie: 'Serverkast Wetenschapsvleugel (U4)',
      poorten: '48x Gigabit PoE+ (740W), 4x 10G SFP+',
      notities: 'Hoofdswitch Campus Zuid.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    },
    {
      id: 'net-6',
      vestigingId: 'vest-4',
      gebouwId: 'gebouw-8',
      naam: 'SW-WEST-IND01',
      type: 'switch',
      merkModel: 'Cisco Catalyst 1000-24T-4G',
      ipAdres: '10.40.1.2',
      macAdres: 'F4:4E:05:99:44:55',
      vlan: '10 (Beheer)',
      locatie: 'Technische Ruimte T-1 (U8)',
      poorten: '24x 10/100/1000 Mbps, 4x SFP',
      notities: 'Voedt machinepark en computerklassen CAD Campus West.',
      createdAt: '2025-01-15T08:00:00.000Z',
      updatedAt: '2025-01-15T08:00:00.000Z'
    }
  ]
};

export function initDatabase(): InfrastructureDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }

    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content) as InfrastructureDatabase;

    // Validate essential keys and migrate if needed
    if (!parsed.vestigingen || !parsed.servers || !parsed.vms || !parsed.apparaten) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }

    let needsWrite = false;

    // Migrate gebouwen if missing
    if (!parsed.gebouwen || !Array.isArray(parsed.gebouwen)) {
      parsed.gebouwen = [];
      needsWrite = true;
    }

    // Migrate vlans if missing
    if (!parsed.vlans || !Array.isArray(parsed.vlans)) {
      parsed.vlans = [];
      needsWrite = true;
    }

    // Migrate servers with nicAantal and nics if missing
    for (const server of parsed.servers) {
      if (!server.nics || server.nics.length === 0) {
        const initMatch = INITIAL_DATA.servers.find(s => s.id === server.id);
        if (initMatch && initMatch.nics) {
          server.nicAantal = initMatch.nicAantal;
          server.nics = initMatch.nics;
          server.gebouwId = server.gebouwId || initMatch.gebouwId;
        } else {
          server.nicAantal = 2;
          server.nics = [
            {
              id: `${server.id}-nic-1`,
              naam: 'NIC 1 (Beheer / iDRAC)',
              ipAdres: server.ipAdres || '',
              macAdres: '',
              vlan: '10 (Beheer)',
              snelheid: '1 GbE'
            },
            {
              id: `${server.id}-nic-2`,
              naam: 'NIC 2 (LAN / Productie)',
              ipAdres: '',
              macAdres: '',
              vlan: '20 (Servers)',
              snelheid: '10 GbE'
            }
          ];
        }
        needsWrite = true;
      }
    }

    // Migrate apparaten gebouwId if missing
    for (const app of parsed.apparaten) {
      if (!app.gebouwId) {
        const initMatch = INITIAL_DATA.apparaten.find(a => a.id === app.id);
        if (initMatch && initMatch.gebouwId) {
          app.gebouwId = initMatch.gebouwId;
          app.vlan = app.vlan || initMatch.vlan;
          needsWrite = true;
        }
      }
    }

    if (needsWrite) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }

    return parsed;
  } catch (error) {
    console.error('Error initializing database, using initial data:', error);
    return INITIAL_DATA;
  }
}

export function readDatabase(): InfrastructureDatabase {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return initDatabase();
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.gebouwen || !Array.isArray(parsed.gebouwen)) {
      parsed.gebouwen = [];
    }
    if (!parsed.vlans || !Array.isArray(parsed.vlans)) {
      parsed.vlans = [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database file:', error);
    return initDatabase();
  }
}

export function resetToBlank(): InfrastructureDatabase {
  const blankDb: InfrastructureDatabase = {
    lastUpdated: new Date().toISOString(),
    vestigingen: [],
    gebouwen: [],
    vlans: [],
    servers: [],
    vms: [],
    apparaten: []
  };
  writeDatabase(blankDb);
  return blankDb;
}

export function resetToSampleData(): InfrastructureDatabase {
  writeDatabase(INITIAL_DATA);
  return INITIAL_DATA;
}

export function writeDatabase(data: InfrastructureDatabase): void {
  try {
    data.lastUpdated = new Date().toISOString();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error('Error writing database file:', error);
    throw error;
  }
}

// Re-export pure helpers
export { checkIpConflicts, searchInfrastructure } from '../src/utils/searchHelper';
