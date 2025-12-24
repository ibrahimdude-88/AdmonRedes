export interface PortTemplate {
  name: string;
  type: string;
  label?: string;
}

export interface DeviceTemplate {
  id: string;
  name: string;
  type: string; // Changed from union to string to allow custom types
  model: string;
  manufacturer: string;
  defaultPorts: PortTemplate[];
  rackHeight?: number; // Default height in U
  description?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
}

export interface Port {
  id: string;
  number: number;
  name: string;
  label?: string; // User defined label (e.g. "Uplink", "Office 101")
  connectedTo?: {
    deviceId: string;
    deviceName: string;
    portId: string;
    portNumber: number;
  };
  status: 'active' | 'inactive' | 'error';
  speed?: string;
  vlan?: string;
  color?: string; // User selected color for active state
}

export interface Device {
  id: string;
  branchId?: string;
  templateId?: string;
  name: string;
  type: string; // Changed from union to string
  model: string;
  manufacturer: string;
  location: string;
  ipAddress: string;
  secondaryIpAddress?: string;
  ports: Port[];
  status: 'online' | 'offline' | 'warning';
  description?: string;
  createdAt: string;
  updatedAt: string;
  rackId?: string; // Optional Rack ID
  rackPosition?: number; // The starting U position (from bottom usually, or top depends on implementation)
  rackHeight?: number; // Size in Units (e.g. 1, 2, 4)
}

export interface Rack {
  id: string;
  branchId: string;
  name: string;
  height: number; // e.g. 42, 24, 48 - customizable
  hasVerticalCableManager?: boolean; // Administrador vertical de cables
  createdAt: string;
}


export interface Connection {
  id: string;
  sourcePortId: string;
  targetDeviceId: string;
  targetPortId: string;
  type: 'ethernet' | 'fiber' | 'wireless';
}
