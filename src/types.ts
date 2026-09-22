export interface Vestiging {
  id: string;
  naam: string;
  adres: string;
  contactpersoon: string;
  notities: string;
  telefoon?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gebouw {
  id: string;
  vestigingId: string;
  naam: string; // bv. Hoofdgebouw (A), Wetenschapsvleugel (B), Sporthal
  code?: string; // bv. A, WET, SPT, T
  notities?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Vlan {
  id: string;
  vlanId: number; // bv. 10, 20, 30
  naam: string; // bv. Beheer / iDRAC, Servers, Docenten, Leerlingen, VoIP
  vestigingId?: string; // Optioneel: specifiek voor 1 vestiging, of leeg voor alle vestigingen
  subnet?: string; // bv. 10.10.10.0/24
  gateway?: string; // bv. 10.10.10.1
  dhcpRange?: string; // bv. 10.10.10.100 - 10.10.10.200
  beschrijving?: string;
  kleur?: string; // badge kleur bv. blue, emerald, amber, purple, rose, indigo, cyan
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerNic {
  id: string;
  naam: string; // bv. NIC 1 (Beheer / iDRAC), NIC 2 (LAN / Productie), NIC 3 (Storage)
  ipAdres?: string;
  macAdres?: string;
  vlan?: string; // bv. 10 (Beheer), 20 (Servers), Trunk
  snelheid?: string; // bv. 1 GbE, 10 GbE SFP+, 25 GbE
  notities?: string;
}

export interface FysiekeServer {
  id: string;
  vestigingId: string;
  gebouwId?: string; // gekoppeld aan Gebouw (optioneel)
  naam: string;
  merkModel: string;
  serienummer: string;
  ipAdres: string; // Primair / beheer IP
  locatie: string; // bv. Rack A1, U12-U14
  aankoopdatum?: string;
  garantieEinddatum?: string;
  notities: string;
  status?: 'actief' | 'onderhoud' | 'inactief';
  nicAantal?: number; // Aantal netwerkpoorten / NIC's
  nics?: ServerNic[]; // Geconfigureerde interfaces met IP, MAC en VLAN
  createdAt: string;
  updatedAt: string;
}

export interface VirtueleMachine {
  id: string;
  serverId: string; // gekoppeld aan FysiekeServer
  naam: string;
  functie: string; // bv. Domeincontroller, Bestandsserver
  besturingssysteem: string;
  ipAdres: string;
  macAdres: string;
  vlan?: string;
  vcpu: string;
  ram: string;
  schijfgrootte: string;
  notities: string;
  status?: 'actief' | 'gestopt' | 'inactief';
  createdAt: string;
  updatedAt: string;
}

export type NetwerkapparaatType = 'switch' | 'router' | 'firewall' | 'access-point' | 'overig';

export interface Netwerkapparaat {
  id: string;
  vestigingId: string;
  gebouwId?: string; // gekoppeld aan Gebouw (optioneel)
  naam: string;
  type: NetwerkapparaatType;
  merkModel: string;
  ipAdres: string;
  macAdres: string;
  vlan?: string;
  locatie: string;
  notities: string;
  poorten?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InfrastructureDatabase {
  vestigingen: Vestiging[];
  gebouwen?: Gebouw[];
  vlans?: Vlan[];
  servers: FysiekeServer[];
  vms: VirtueleMachine[];
  apparaten: Netwerkapparaat[];
  lastUpdated: string;
}

export interface IpConflict {
  ipAdres: string;
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

export interface SearchResultItem {
  id: string;
  naam: string;
  category: 'server' | 'vm' | 'apparaat';
  categoryLabel: string;
  vestigingId: string;
  vestigingNaam: string;
  gebouwNaam?: string;
  ipAdres: string;
  macAdres?: string;
  vlan?: string;
  details: string;
  locatie: string;
  serverId?: string;
  serverNaam?: string;
  notities?: string;
}
