import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBranches } from '../hooks/useBranches';
import { useDevices } from '../hooks/useDevices';
import { useTemplates } from '../hooks/useTemplates';
import { useRacks } from '../hooks/useRacks';
import { NetworkMap } from '../components/NetworkMap';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceModal } from '../components/DeviceModal'; // We might need a variant of this
import { PatchPanelDisplay } from '../components/PatchPanelDisplay'; // New component
import { Server, Cable, Activity, Plus, ArrowLeft, Trash2, Database, X } from 'lucide-react';
import { RackView } from '../components/RackView';
import type { Device, Port } from '../types';

// Copied connections logic from ConnectionsPage, but scoped to branch devices
// Ideally this logic should be extracted to a hook or component
const BranchConnections = ({ devices, connectPorts, disconnectPort, onEditConnection }: any) => {
    // ... Simplified logic for creating connections between devices in the list
    const [selectedSourceId, setSelectedSourceId] = useState<string>('');
    const [selectedSourcePortId, setSelectedSourcePortId] = useState<string>('');
    const [selectedTargetId, setSelectedTargetId] = useState<string>('');
    const [selectedTargetPortId, setSelectedTargetPortId] = useState<string>('');

    const sourceDevice = devices.find((d: Device) => d.id === selectedSourceId);
    const targetDevice = devices.find((d: Device) => d.id === selectedTargetId);

    const handleConnect = () => {
        if (selectedSourceId && selectedSourcePortId && selectedTargetId && selectedTargetPortId) {
            connectPorts(selectedSourceId, selectedSourcePortId, selectedTargetId, selectedTargetPortId);
            setSelectedSourcePortId('');
            setSelectedTargetPortId('');
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h4>Origen</h4>
                    <select className="input-field" value={selectedSourceId} onChange={e => setSelectedSourceId(e.target.value)}>
                        <option value="">Seleccionar Dispositivo...</option>
                        {devices.map((d: Device) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {sourceDevice && (
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {sourceDevice.ports.map((p: Port) => (
                                <button
                                    key={p.id}
                                    disabled={!!p.connectedTo}
                                    onClick={() => setSelectedSourcePortId(p.id)}
                                    className={`btn ${selectedSourcePortId === p.id ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ fontSize: '0.75rem', padding: '0.25rem', opacity: p.connectedTo ? 0.5 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    title={p.label || p.name}
                                >
                                    {p.label ? p.label : p.number}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <h4>Destino</h4>
                    <select className="input-field" value={selectedTargetId} onChange={e => setSelectedTargetId(e.target.value)} disabled={!selectedSourceId}>
                        <option value="">Seleccionar Dispositivo...</option>
                        {devices.filter((d: Device) => d.id !== selectedSourceId).map((d: Device) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {targetDevice && (
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                            {targetDevice.ports.map((p: Port) => (
                                <button
                                    key={p.id}
                                    disabled={!!p.connectedTo}
                                    onClick={() => setSelectedTargetPortId(p.id)}
                                    className={`btn ${selectedTargetPortId === p.id ? 'btn-primary' : 'btn-ghost'}`}
                                    style={{ fontSize: '0.75rem', padding: '0.25rem', opacity: p.connectedTo ? 0.5 : 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    title={p.label || p.name}
                                >
                                    {p.label ? p.label : p.number}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <button className="btn btn-primary" onClick={handleConnect} disabled={!selectedSourcePortId || !selectedTargetPortId}>
                <Cable size={18} /> Conectar
            </button>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Conexiones Activas</h3>
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Origen</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Puerto</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Destino</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Puerto</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.flatMap((d: Device) =>
                                d.ports
                                    .filter((p: Port) => p.connectedTo)
                                    .map((p: Port) => ({
                                        sourceDevice: d,
                                        sourcePort: p,
                                        target: p.connectedTo!
                                    }))
                            )
                                .filter((c: any) => {
                                    const getDevicePriority = (type: string) => {
                                        switch (type.toLowerCase()) {
                                            case 'firewall': return 5;
                                            case 'router': return 4;
                                            case 'switch': return 3;
                                            case 'server': return 2;
                                            case 'access-point': return 1;
                                            default: return 0;
                                        }
                                    };

                                    const sourcePriority = getDevicePriority(c.sourceDevice.type);
                                    const targetDev = devices.find((d: Device) => d.id === c.target.deviceId);
                                    const targetPriority = targetDev ? getDevicePriority(targetDev.type) : 0;

                                    if (sourcePriority > targetPriority) return true;
                                    if (sourcePriority < targetPriority) return false;
                                    return c.sourceDevice.id < c.target.deviceId;
                                })
                                .map((conn: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{conn.sourceDevice.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: 'rgba(56, 189, 248, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}>
                                                {conn.sourcePort.label || `Port ${conn.sourcePort.number}`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{conn.target.deviceName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                background: 'rgba(56, 189, 248, 0.1)',
                                                color: 'var(--color-primary)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.875rem'
                                            }}>
                                                {/* We don't have the target port object here easily to get the label without looking it up, 
                                                but we can try to look it up or just show number if not available.
                                                However, we can look it up from devices list.
                                             */}
                                                {(() => {
                                                    const targetDev = devices.find((d: Device) => d.id === conn.target.deviceId);
                                                    const targetPort = targetDev?.ports.find((p: Port) => p.id === conn.target.portId);
                                                    return targetPort?.label || `Port ${conn.target.portNumber}`;
                                                })()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: '#3b82f6', padding: '0.5rem' }}
                                                    onClick={() => {
                                                        onEditConnection({
                                                            sourceDeviceId: conn.sourceDevice.id,
                                                            sourcePortId: conn.sourcePort.id,
                                                            targetDeviceId: conn.target.deviceId,
                                                            targetPortId: conn.target.portId
                                                        });
                                                    }}
                                                    title="Editar Conexión"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                                </button>
                                                <button
                                                    className="btn btn-ghost"
                                                    style={{ color: '#ef4444', padding: '0.5rem' }}
                                                    onClick={() => {
                                                        if (confirm('¿Desconectar estos dispositivos?')) {
                                                            disconnectPort(conn.sourceDevice.id, conn.sourcePort.id);
                                                        }
                                                    }}
                                                    title="Desconectar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {devices.every((d: Device) => d.ports.every((p: Port) => !p.connectedTo)) && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No hay conexiones activas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export const BranchDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { getBranch } = useBranches();
    const branch = getBranch(id!);

    const { devices, addDevice, updateDevice, deleteDevice, connectPorts, disconnectPort } = useDevices();
    const { templates } = useTemplates();
    const { addRack, deleteRack, updateRack, getBranchRacks } = useRacks();

    const [activeTab, setActiveTab] = useState<'inventory' | 'connections' | 'map'>('inventory');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [newDeviceName, setNewDeviceName] = useState('');
    const [newDeviceIP, setNewDeviceIP] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | undefined>(undefined);
    const [showPatchPanelOptions, setShowPatchPanelOptions] = useState(false);
    const [isAddRackModalOpen, setIsAddRackModalOpen] = useState(false);
    const [newRackName, setNewRackName] = useState('');
    const [newRackHeight, setNewRackHeight] = useState(42);
    const [newRackHasVerticalCableManager, setNewRackHasVerticalCableManager] = useState(false);
    const [isEditRackModalOpen, setIsEditRackModalOpen] = useState(false);
    const [inventorySearchTerm, setInventorySearchTerm] = useState('');
    const [isEditConnectionModalOpen, setIsEditConnectionModalOpen] = useState(false);
    const [editingConnection, setEditingConnection] = useState<{ sourceDeviceId: string, sourcePortId: string, targetDeviceId: string, targetPortId: string } | null>(null);
    const [editingRack, setEditingRack] = useState<{ id: string, name: string } | undefined>(undefined);
    const [selectedPatchPanelId, setSelectedPatchPanelId] = useState<string | null>(null);
    const [newSourcePortId, setNewSourcePortId] = useState<string>('');
    const [newTargetPortId, setNewTargetPortId] = useState<string>('');

    const branchDevices = devices.filter(d => d.branchId === id);
    const selectedPatchPanel = branchDevices.find(d => d.id === selectedPatchPanelId) || null;
    const branchRacks = getBranchRacks(id!);
    // Filter patch panels, shelves, and cable managers from devices list (infrastructure items, not network devices)
    const branchPatchPanels = devices.filter(d => d.branchId === id && d.type === 'patch-panel');
    const branchNetworkDevices = branchDevices.filter(d =>
        d.type !== 'patch-panel' &&
        d.type !== 'shelf' &&
        d.type !== 'cable-manager'
    );

    const handleAddPatchPanel = (portCount: 24 | 48) => {
        if (!id) return;

        // Create ports
        const ports: Port[] = Array.from({ length: portCount }, (_, i) => ({
            id: crypto.randomUUID(),
            number: i + 1,
            name: `Port ${i + 1}`,
            status: 'active'
        }));

        // Determine rack height based on port count
        const rackHeight = portCount === 24 ? 1 : portCount === 48 ? 2 : 1;

        addDevice({
            branchId: id,
            name: `PATCH PANEL ${branchPatchPanels.length + 1} (${portCount}P)`,
            ipAddress: '', // Passive device
            type: 'patch-panel', // Special type
            model: `Generic ${portCount}-Port`,
            manufacturer: 'Generic',
            location: branch?.location || '',
            status: 'online',
            ports: ports,
            rackHeight: rackHeight
        });

        setShowPatchPanelOptions(false);
    };

    const generateReport = () => {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) return;

        const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        const connections = branchDevices.flatMap(d => d.ports.filter(p => p.connectedTo).map(p => ({ source: d, port: p, target: p.connectedTo! })));
        const uniqueConnections = connections.filter(c => c.source.id < c.target.deviceId);

        const deviceCount = branchDevices.filter(d => d.type !== 'patch-panel').length;
        const panelCount = branchPatchPanels.length;

        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte Técnico - ${branch?.name}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --primary: #0f172a;
                        --secondary: #334155;
                        --accent: #2563eb;
                        --bg-gray: #f1f5f9;
                        --border: #e2e8f0;
                        --success-bg: #dcfce7;
                        --success-text: #166534;
                    }

                    @page { margin: 0; size: A4; }
                    
                    body { 
                        font-family: 'Inter', system-ui, sans-serif; 
                        line-height: 1.5; 
                        color: var(--secondary);
                        margin: 0;
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* Cover / Header */
                    header {
                        background: var(--primary);
                        color: white;
                        padding: 4rem 3rem;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    header::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, var(--accent), #60a5fa);
                    }

                    .brand { 
                        font-size: 0.875rem; 
                        text-transform: uppercase; 
                        letter-spacing: 2px; 
                        opacity: 0.7; 
                        margin-bottom: 1rem;
                        font-weight: 600;
                    }

                    h1 { 
                        margin: 0; 
                        font-size: 3rem; 
                        font-weight: 700; 
                        letter-spacing: -1px;
                        line-height: 1.1;
                    }

                    .report-meta {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 2rem;
                        margin-top: 3rem;
                        padding-top: 2rem;
                        border-top: 1px solid rgba(255,255,255,0.15);
                    }

                    .meta-item label {
                        display: block;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        opacity: 0.6;
                        margin-bottom: 0.5rem;
                    }

                    .meta-item span {
                        font-size: 1.125rem;
                        font-weight: 500;
                        color: white;
                    }

                    /* Main Layout */
                    .container {
                        padding: 3rem;
                        max-width: 1100px;
                        margin: 0 auto;
                    }

                    /* Summary Stats */
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 1.5rem;
                        margin-bottom: 4rem;
                    }

                    .stat-card {
                        background: white;
                        border: 1px solid var(--border);
                        border-radius: 12px;
                        padding: 1.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    }

                    .stat-value {
                        font-size: 2.5rem;
                        font-weight: 700;
                        color: var(--primary);
                        margin-bottom: 0.5rem;
                        line-height: 1;
                    }

                    .stat-label {
                        font-size: 0.875rem;
                        color: #64748b;
                        font-weight: 500;
                    }

                    /* Sections */
                    section { margin-bottom: 4rem; }

                    h2 {
                        font-size: 1.5rem;
                        color: var(--primary);
                        margin: 0 0 1.5rem 0;
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                    }

                    h2::before {
                        content: '';
                        display: block;
                        width: 6px;
                        height: 24px;
                        background: var(--accent);
                        border-radius: 4px;
                    }

                    h3 {
                        font-size: 1.125rem;
                        color: var(--primary);
                        margin: 1.5rem 0 1rem 0;
                    }

                    /* Tables */
                    .data-table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0;
                        font-size: 0.875rem;
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .data-table th {
                        background: var(--bg-gray);
                        color: var(--primary);
                        font-weight: 600;
                        text-align: left;
                        padding: 1rem;
                        border-bottom: 1px solid var(--border);
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 0.5px;
                    }

                    .data-table td {
                        padding: 1rem;
                        border-bottom: 1px solid var(--border);
                        vertical-align: middle;
                    }

                    .data-table tr:last-child td {
                        border-bottom: none;
                    }

                    .data-table tr:nth-child(even) {
                        background-color: #f8fafc;
                    }

                    /* Visual Elements */
                    .badge {
                        display: inline-flex;
                        align-items: center;
                        padding: 0.25rem 0.75rem;
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        line-height: 1;
                    }

                    .badge-online { background: var(--success-bg); color: var(--success-text); }
                    .badge-neutral { background: #e2e8f0; color: #475569; }

                    .port-grid-mini {
                        display: grid;
                        grid-template-columns: repeat(12, 1fr); /* 24 ports = 2 rows of 12 */
                        gap: 2px;
                        background: #334155;
                        padding: 4px;
                        border-radius: 4px;
                        width: fit-content;
                    }

                    .port-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 1px;
                        background: #64748b;
                    }
                    .port-dot.active { background: #4ade80; box-shadow: 0 0 2px #4ade80; }

                    /* Footer */
                    footer {
                        text-align: center;
                        padding: 2rem;
                        border-top: 1px solid var(--border);
                        margin-top: auto;
                        color: #94a3b8;
                        font-size: 0.75rem;
                    }

                    /* Print Utilities */
                    @media print {
                        .page-break { page-break-after: always; }
                        .avoid-break { page-break-inside: avoid; }
                        footer { position: fixed; bottom: 0; width: 100%; left: 0; border: none; }
                        .no-print { display: none !important; }
                    }
                    
                    .print-btn {
                        position: fixed;
                        top: 2rem;
                        right: 2rem;
                        background: white;
                        color: var(--primary);
                        border: 1px solid white;
                        padding: 0.75rem 1.5rem;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.2s;
                        z-index: 100;
                    }
                    
                    .print-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    }
                </style>
            </head>
            <body>
                <button onclick="window.print()" class="print-btn no-print">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Imprimir / Guardar PDF
                </button>
                <header>
                    <div class="brand">NetDoc System &bull; Reporte de Infraestructura</div>
                    <h1>${branch?.name}</h1>
                    <div class="report-meta">
                        <div class="meta-item">
                            <label>Ubicación</label>
                            <span>${branch?.location || 'No especificada'}</span>
                        </div>
                        <div class="meta-item">
                            <label>Fecha de Generación</label>
                            <span>${date}</span>
                        </div>
                        <div class="meta-item">
                            <label>ID de Sucursal</label>
                            <span>${id?.substring(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div class="container">
                    <!-- Executive Summary -->
                    <section class="avoid-break">
                        <h2>Resumen General</h2>
                        <div class="summary-grid">
                            <div class="stat-card">
                                <div class="stat-value">${deviceCount}</div>
                                <div class="stat-label">Dispositivos Activos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${panelCount}</div>
                                <div class="stat-label">Patch Panels</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${uniqueConnections.length}</div>
                                <div class="stat-label">Conexiones Físicas</div>
                            </div>
                        </div>
                    </section>

                    <!-- Inventory Table -->
                    <section>
                        <h2>Inventario de Equipos</h2>
                        ${branchDevices.length > 0 ? `
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 25%">Dispositivo</th>
                                    <th style="width: 20%">IP Address</th>
                                    <th style="width: 15%">Tipo</th>
                                    <th style="width: 25%">Modelo / Fabricante</th>
                                    <th style="width: 15%">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${branchDevices.filter(d => d.type !== 'patch-panel' && d.type !== 'shelf' && d.type !== 'cable-manager').map(d => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600; color: var(--primary)">${d.name}</div>
                                        </td>
                                        <td style="font-family: monospace; font-size: 0.9em">
                                            ${d.ipAddress ?
                `<a href="http://${d.ipAddress}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary);">${d.ipAddress}</a>` :
                '-'
            }
                                            ${d.secondaryIpAddress ?
                `<br><span style="font-size: 0.8em; color: #64748b;">Sec: <a href="http://${d.secondaryIpAddress}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary);">${d.secondaryIpAddress}</a></span>` :
                ''
            }
                                        </td>
                                        <td style="text-transform: capitalize">
                                            <span style="font-size: 0.8em; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; color: #64748b">${d.type}</span>
                                        </td>
                                        <td>
                                            <div style="font-size: 0.9em">${d.manufacturer}</div>
                                            <div style="font-size: 0.8em; color: #94a3b8">${d.model}</div>
                                        </td>
                                        <td><span class="badge badge-online">Activo</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<div style="padding: 2rem; text-align: center; border: 1px dashed var(--border); border-radius: 8px; color: #64748b">No hay dispositivos registrados</div>'}
                    </section>

                    <!-- Connections Check -->
                    <section class="avoid-break">
                         <h2>Conexiones Físicas</h2>
                         ${uniqueConnections.length > 0 ? `
                         <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%">Dispositivo Origen</th>
                                    <th style="width: 40%">Dispositivo Destino</th>
                                    <th style="width: 20%">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${uniqueConnections.map(c => {
                const targetDev = branchDevices.find(d => d.id === c.target.deviceId);
                const targetPort = targetDev?.ports.find(p => p.id === c.target.portId);
                return `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 600; color: var(--primary)">${c.source.name}</div>
                                            <div style="color: #64748b; font-size: 0.85em; margin-top: 0.25rem">
                                                📌 Puerto: ${c.port.label || `P${c.port.number}`}
                                            </div>
                                            ${c.source.ipAddress ? `<div style="color: #64748b; font-size: 0.8em; margin-top: 0.15rem; font-family: monospace">🌐 IP: ${c.source.ipAddress}</div>` : ''}
                                        </td>
                                        <td>
                                            <div style="font-weight: 600; color: var(--primary)">${c.target.deviceName}</div>
                                            <div style="color: #64748b; font-size: 0.85em; margin-top: 0.25rem">
                                                📌 Puerto: ${targetPort?.label || `P${c.target.portNumber}`}
                                            </div>
                                            ${targetDev?.ipAddress ? `<div style="color: #64748b; font-size: 0.8em; margin-top: 0.15rem; font-family: monospace">🌐 IP: ${targetDev.ipAddress}</div>` : ''}
                                        </td>
                                        <td><span class="badge badge-online">Conectado</span></td>
                                    </tr>
                                    `;
            }).join('')}
                            </tbody>
                        </table>
                        ` : '<div style="padding: 2rem; text-align: center; border: 1px dashed var(--border); border-radius: 8px; color: #64748b">No hay conexiones activas registradas</div>'}
                    </section>

                    <!-- Patch Panels Detailed -->
                    <div class="page-break"></div>
                    <section>
                        <h2>Detalle de Patch Panels</h2>
                        ${(() => {
                // Filter patch panels that have at least one port with data (connection or label)
                const patchPanelsWithData = branchPatchPanels.filter(pp =>
                    pp.ports.some(port => port.label || port.connectedTo)
                );

                if (patchPanelsWithData.length === 0) {
                    return '<div style="padding: 2rem; text-align: center; color: #64748b">No hay Patch Panels con puertos configurados</div>';
                }

                return patchPanelsWithData.map(pp => `
                            <div class="avoid-break" style="margin-bottom: 3rem; background: var(--bg-gray); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem">
                                    <h3 style="margin: 0; font-size: 1.25rem; color: var(--primary)">${pp.name}</h3>
                                    <div class="badge badge-neutral">${pp.ports.filter(p => p.label || p.connectedTo).length} / ${pp.ports.length} Puertos Configurados</div>
                                </div>
                                
                                <table class="data-table" style="background: white;">
                                    <thead>
                                        <tr>
                                            <th style="width: 10%; text-align: center">Puerto</th>
                                            <th style="width: 45%">Etiqueta / Descripción</th>
                                            <th style="width: 45%">Estado / Conexión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pp.ports
                        .filter(port => port.label || port.connectedTo) // Only show ports with data
                        .map(port => {
                            const conn = port.connectedTo;
                            return `
                                            <tr>
                                                <td style="text-align: center; font-weight: 600; color: var(--primary)">${port.number}</td>
                                                <td>
                                                    ${port.label ? `<span style="font-weight: 500; color: var(--primary)">${port.label}</span>` : '<span style="font-style: italic; opacity: 0.5">-</span>'}
                                                </td>
                                                <td>
                                                    ${conn ?
                                    `<div class="badge badge-online" style="font-weight: normal; font-size: 0.8em">Conectado a ${conn.deviceName} : P${conn.portNumber}</div>` :
                                    '<span style="font-size: 0.8em; opacity: 0.5">Disponible</span>'
                                }
                                                </td>
                                            </tr>
                                            `;
                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `).join('');
            })()}
                    </section>
                </div>

                <footer>
                    <p>Documento generado el ${date} a las ${time} &bull; NetDoc Network Management System</p>
                </footer>
            </body>
            </html>
        `);
        reportWindow.document.close();
    };

    if (!branch) return <div className="container">Sucursal no encontrada</div>;

    // ... (rest of render until Create Patch Panel Button)

    // Inside activeTab === 'map', replacing the patch panel list section:


    const handleAddFromTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        const template = templates.find(t => t.id === selectedTemplateId);
        if (!template || !id) return;

        // Convert template ports to instance ports
        const ports: Port[] = template.defaultPorts.map((p, idx) => ({
            id: crypto.randomUUID(),
            number: idx + 1,
            name: p.name || `Port ${idx + 1}`,
            label: p.label || '',
            status: 'active'
        }));

        try {
            await addDevice({
                branchId: id,
                templateId: template.id,
                name: newDeviceName,
                ipAddress: newDeviceIP,
                type: template.type || 'switch', // Fallback
                model: template.model || 'Unknown', // Fallback
                manufacturer: template.manufacturer || 'Unknown', // Fallback
                location: branch?.location || '',
                status: 'online',
                description: template.description || '',
                rackHeight: template.rackHeight || 1,
                ports: ports
            });

            setIsAddModalOpen(false);
            setNewDeviceName('');
            setNewDeviceIP('');
        } catch (error) {
            console.error("Error creating device from template:", error);
            alert("Error al crear dispositivo. Por favor intente nuevamente.");
        }
    };

    if (!branch) return <div className="container">Sucursal no encontrada</div>;

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" className="btn btn-ghost" style={{ paddingLeft: 0, color: 'var(--color-text-muted)' }}>
                    <ArrowLeft size={18} /> Volver a Sucursales
                </Link>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{branch.name}</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>{branch.location}</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={generateReport}
                    style={{ background: '#2563eb', border: 'none' }}
                >
                    <Database size={18} /> Generar Reporte
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <button
                    className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    <Server size={18} /> Inventario
                </button>
                <button
                    className={`btn ${activeTab === 'connections' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('connections')}
                >
                    <Cable size={18} /> Conexiones
                </button>
                <button
                    className={`btn ${activeTab === 'map' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('map')}
                >
                    <Activity size={18} /> Mapa de Red
                </button>
            </div>

            {activeTab === 'inventory' && (
                <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Buscar dispositivos por nombre, IP, modelo, fabricante, tipo..."
                            className="input-field"
                            value={inventorySearchTerm}
                            onChange={(e) => setInventorySearchTerm(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ whiteSpace: 'nowrap' }}>
                            <Plus size={18} /> Agregar Dispositivo
                        </button>
                    </div>

                    <div className="grid-layout">
                        {branchNetworkDevices
                            .filter(device => {
                                if (!inventorySearchTerm) return true;
                                const searchLower = inventorySearchTerm.toLowerCase();
                                return (
                                    device.name.toLowerCase().includes(searchLower) ||
                                    device.ipAddress?.toLowerCase().includes(searchLower) ||
                                    device.model.toLowerCase().includes(searchLower) ||
                                    device.manufacturer.toLowerCase().includes(searchLower) ||
                                    device.type.toLowerCase().includes(searchLower) ||
                                    device.location?.toLowerCase().includes(searchLower) ||
                                    device.description?.toLowerCase().includes(searchLower)
                                );
                            })
                            .map(device => (
                                <DeviceCard
                                    key={device.id}
                                    device={device}
                                    onDelete={deleteDevice}
                                    onEdit={(dev) => {
                                        setEditingDevice(dev);
                                        setIsEditModalOpen(true);
                                    }}
                                />
                            ))}
                    </div>

                    {branchDevices.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                            <p>No hay dispositivos en esta sucursal.</p>
                        </div>
                    )}

                    <DeviceModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingDevice(undefined);
                        }}
                        onSave={(data) => {
                            if (editingDevice) {
                                updateDevice(editingDevice.id, data);
                                setIsEditModalOpen(false);
                                setEditingDevice(undefined);
                            }
                        }}
                        device={editingDevice}
                    />
                </div>
            )}

            {activeTab === 'connections' && (
                <BranchConnections
                    devices={branchDevices}
                    connectPorts={connectPorts}
                    disconnectPort={disconnectPort}
                    onEditConnection={(conn: any) => {
                        setEditingConnection(conn);
                        setIsEditConnectionModalOpen(true);
                    }}
                />
            )}

            {activeTab === 'map' && (
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    <NetworkMap devices={branchDevices} />

                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Infraestructura & Racks</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsAddRackModalOpen(true)}
                                    style={{ background: '#4b5563' }}
                                >
                                    <Plus size={18} /> Nuevo Rack
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowPatchPanelOptions(!showPatchPanelOptions)}
                                    >
                                        <Plus size={18} /> Agregar Patch Panel
                                    </button>
                                    {showPatchPanelOptions && (
                                        <div style={{
                                            position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                                            background: '#222', border: '1px solid #444', borderRadius: '4px',
                                            zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '150px'
                                        }}>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleAddPatchPanel(24)}
                                                style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
                                            >
                                                24 Puertos
                                            </button>
                                            <button
                                                className="btn btn-ghost"
                                                onClick={() => handleAddPatchPanel(48)}
                                                style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
                                            >
                                                48 Puertos
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Racks Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                            gap: '2rem',
                            maxWidth: '100%'
                        }}>
                            {branchRacks.map(rack => (
                                <RackView
                                    key={rack.id}
                                    rack={rack}
                                    devices={branchDevices.filter(d => d.rackId === rack.id)}
                                    allDevices={branchDevices}
                                    onUpdateDevice={updateDevice}
                                    onDeleteRack={deleteRack}
                                    onCreateDevice={async (d) => { await addDevice(d); }}
                                    onDeviceClick={(device) => {
                                        if (device.type === 'patch-panel' || device.type === 'switch') {
                                            // Generalize for any device that has ports, or specifically patch panels
                                            if (device.type === 'patch-panel') {
                                                setSelectedPatchPanelId(device.id);
                                            } else {
                                                setEditingDevice(device);
                                                setIsEditModalOpen(true);
                                            }
                                        } else {
                                            setEditingDevice(device);
                                            setIsEditModalOpen(true);
                                        }
                                    }}
                                />
                            ))}
                        </div>

                        {branchRacks.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', border: '1px dashed #334155', borderRadius: '8px' }}>
                                <p>No hay racks configurados.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsAddRackModalOpen(true)}>
                                    <Plus size={18} /> Crear Primer Rack
                                </button>
                            </div>
                        )}

                        {/* Unassigned Equipment */}
                        <div style={{ marginTop: '4rem', borderTop: '1px solid #334155', paddingTop: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#94a3b8' }}>Equipos No Asignados a Rack</h3>
                            <div className="grid-layout">
                                {branchDevices.filter(d => !d.rackId && d.type === 'patch-panel').map(pp => (
                                    <PatchPanelDisplay
                                        key={pp.id}
                                        device={pp}
                                        allDevices={branchDevices}
                                        onUpdate={updateDevice}
                                        onDelete={deleteDevice}
                                    />
                                ))}
                            </div>
                            {branchDevices.filter(d => !d.rackId && d.type !== 'patch-panel').length > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <h4 style={{ color: '#64748b', marginBottom: '1rem' }}>Otros Dispositivos</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {branchDevices.filter(d => !d.rackId && d.type !== 'patch-panel').map(d => (
                                            <div key={d.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
                                                {d.name} ({d.model})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Rack Modal */}
            {isAddRackModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '450px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Nuevo Rack</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <input
                                className="input-field"
                                placeholder="Nombre del Rack (ej. Rack A)"
                                value={newRackName}
                                onChange={e => setNewRackName(e.target.value)}
                                autoFocus
                            />
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    Altura del Rack (Unidades)
                                </label>
                                <select
                                    className="input-field"
                                    value={newRackHeight}
                                    onChange={e => setNewRackHeight(parseInt(e.target.value))}
                                >
                                    <option value={12}>12U</option>
                                    <option value={24}>24U</option>
                                    <option value={42}>42U (Estándar)</option>
                                    <option value={48}>48U</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <input
                                    type="checkbox"
                                    id="verticalCableManager"
                                    checked={newRackHasVerticalCableManager}
                                    onChange={e => setNewRackHasVerticalCableManager(e.target.checked)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="verticalCableManager" style={{ fontSize: '0.875rem', cursor: 'pointer', flex: 1 }}>
                                    Incluir administradores verticales de cables
                                </label>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    if (newRackName && id) {
                                        addRack({
                                            branchId: id,
                                            name: newRackName,
                                            height: newRackHeight,
                                            hasVerticalCableManager: newRackHasVerticalCableManager
                                        });
                                        setNewRackName('');
                                        setNewRackHeight(42);
                                        setNewRackHasVerticalCableManager(false);
                                        setIsAddRackModalOpen(false);
                                    }
                                }}
                            >
                                Crear
                            </button>
                            <button className="btn btn-ghost" onClick={() => {
                                setIsAddRackModalOpen(false);
                                setNewRackName('');
                                setNewRackHeight(42);
                                setNewRackHasVerticalCableManager(false);
                            }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isEditRackModalOpen && editingRack && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
                        <h2>Editar Rack</h2>
                        <input
                            className="input-field"
                            placeholder="Nombre del Rack"
                            value={editingRack.name}
                            onChange={e => setEditingRack({ ...editingRack, name: e.target.value })}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={async () => {
                                    if (editingRack.name && editingRack.id) {
                                        await updateRack(editingRack.id, { name: editingRack.name });
                                        setEditingRack(undefined);
                                        setIsEditRackModalOpen(false);
                                    }
                                }}
                            >
                                Guardar
                            </button>
                            <button className="btn btn-ghost" onClick={() => {
                                setEditingRack(undefined);
                                setIsEditRackModalOpen(false);
                            }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2>Agregar Dispositivo de Plantilla</h2>
                        <form onSubmit={handleAddFromTemplate}>
                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plantilla</label>
                                    <select
                                        className="input-field"
                                        value={selectedTemplateId}
                                        onChange={e => setSelectedTemplateId(e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccionar Plantilla...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.model})</option>
                                        ))}
                                    </select>
                                </div>
                                {selectedTemplateId && (
                                    <>
                                        <input
                                            className="input-field"
                                            placeholder="Nombre del Dispositivo (ej. SW-Piso1)"
                                            value={newDeviceName}
                                            onChange={e => setNewDeviceName(e.target.value)}
                                            required
                                        />
                                        <input
                                            className="input-field"
                                            placeholder="Dirección IP"
                                            value={newDeviceIP}
                                            onChange={e => setNewDeviceIP(e.target.value)}
                                            required
                                        />
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Agregar</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedPatchPanel && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '95%', maxWidth: '1200px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                        <button
                            className="btn btn-ghost"
                            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                            onClick={() => setSelectedPatchPanelId(null)}
                        >
                            <X size={24} />
                        </button>
                        <h2 style={{ marginBottom: '1rem' }}>Detalle de Patch Panel</h2>
                        <PatchPanelDisplay
                            device={selectedPatchPanel}
                            allDevices={branchDevices}
                            onUpdate={updateDevice}
                            onDelete={(id) => {
                                deleteDevice(id);
                                setSelectedPatchPanelId(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Edit Connection Modal */}
            {isEditConnectionModalOpen && editingConnection && (() => {
                const sourceDevice = branchDevices.find(d => d.id === editingConnection.sourceDeviceId);
                const targetDevice = branchDevices.find(d => d.id === editingConnection.targetDeviceId);

                // Initialize port IDs when modal opens
                if (newSourcePortId === '') {
                    setNewSourcePortId(editingConnection.sourcePortId);
                }
                if (newTargetPortId === '') {
                    setNewTargetPortId(editingConnection.targetPortId);
                }

                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                    }}>
                        <div className="glass-panel" style={{ padding: '2rem', width: '95%', maxWidth: '700px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>Editar Conexión</h2>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setIsEditConnectionModalOpen(false);
                                        setEditingConnection(null);
                                        setNewSourcePortId('');
                                        setNewTargetPortId('');
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                {/* Source Device */}
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{sourceDevice?.name}</h4>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                                        Puerto de Origen
                                    </label>
                                    <select
                                        className="input-field"
                                        value={newSourcePortId || editingConnection.sourcePortId}
                                        onChange={(e) => setNewSourcePortId(e.target.value)}
                                    >
                                        {sourceDevice?.ports.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.label || `Puerto ${p.number}`}
                                                {p.connectedTo && p.id !== editingConnection.sourcePortId ? ' (Ocupado)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Target Device */}
                                <div>
                                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{targetDevice?.name}</h4>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                                        Puerto de Destino
                                    </label>
                                    <select
                                        className="input-field"
                                        value={newTargetPortId || editingConnection.targetPortId}
                                        onChange={(e) => setNewTargetPortId(e.target.value)}
                                    >
                                        {targetDevice?.ports.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.label || `Puerto ${p.number}`}
                                                {p.connectedTo && p.id !== editingConnection.targetPortId ? ' (Ocupado)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setIsEditConnectionModalOpen(false);
                                        setEditingConnection(null);
                                        setNewSourcePortId('');
                                        setNewTargetPortId('');
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={async () => {
                                        const sourcePortId = newSourcePortId || editingConnection.sourcePortId;
                                        const targetPortId = newTargetPortId || editingConnection.targetPortId;

                                        // Disconnect old connection
                                        await disconnectPort(editingConnection.sourceDeviceId, editingConnection.sourcePortId);
                                        // Create new connection
                                        await connectPorts(
                                            editingConnection.sourceDeviceId,
                                            sourcePortId,
                                            editingConnection.targetDeviceId,
                                            targetPortId
                                        );
                                        setIsEditConnectionModalOpen(false);
                                        setEditingConnection(null);
                                        setNewSourcePortId('');
                                        setNewTargetPortId('');
                                    }}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
};
