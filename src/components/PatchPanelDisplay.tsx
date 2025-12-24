import { useState, useRef } from 'react';
import type { Device, Port } from '../types';
import { Trash2, Save, X } from 'lucide-react';

interface PatchPanelDisplayProps {
    device: Device;
    allDevices?: Device[];
    onUpdate: (id: string, updates: Partial<Device>) => void;
    onDelete: (id: string) => void;
}

export const PatchPanelDisplay = ({ device, allDevices, onUpdate, onDelete }: PatchPanelDisplayProps) => {
    const [editingPortId, setEditingPortId] = useState<string | null>(null);
    const [tempLabel, setTempLabel] = useState('');
    const [tempColor, setTempColor] = useState('black');
    const [tempStatus, setTempStatus] = useState<'active' | 'inactive'>('active');

    const handlePortClick = (port: Port) => {
        setEditingPortId(port.id);
        setTempLabel(port.label || '');
        setTempColor(port.color || 'black');
        setTempStatus(port.status === 'inactive' ? 'inactive' : 'active');
    };

    const saveLabel = () => {
        if (!editingPortId) return;
        const newPorts = device.ports.map(p =>
            p.id === editingPortId ? { ...p, label: tempLabel, color: tempColor, status: tempStatus as 'active' | 'inactive' } : p
        );
        onUpdate(device.id, { ports: newPorts });
        setEditingPortId(null);
    };

    const columns = 24;

    const availableColors = [
        { name: 'Morado', value: 'purple', hex: '#9333ea' },
        { name: 'Verde', value: 'green', hex: '#22c55e' },
        { name: 'Azul', value: 'blue', hex: '#3b82f6' },
        { name: 'Negro', value: 'black', hex: '#000000' },
        { name: 'Gris', value: 'gray', hex: '#6b7280' },
        { name: 'Rojo', value: 'red', hex: '#ef4444' },
        { name: 'Amarillo', value: 'yellow', hex: '#EAB308' },
    ];

    const getPortColor = (port: Port) => {
        if (port.status === 'inactive') return '#ffffff';

        if (port.color) {
            const colorObj = availableColors.find(c => c.value === port.color);
            if (colorObj) return colorObj.hex;
            if (port.color === 'purple') return '#9333ea';
            if (port.color === 'green') return '#22c55e';
            if (port.color === 'blue') return '#3b82f6';
            if (port.color === 'black') return '#000000';
            if (port.color === 'gray') return '#6b7280';
            if (port.color === 'red') return '#ef4444';
            if (port.color === 'yellow') return '#EAB308';
        }

        if (port.connectedTo) return '#4ade80';
        return '#000';
    };

    const [tooltipPortId, setTooltipPortId] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = (port: Port) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setTooltipPortId(port.id);
        }, 1000);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTooltipPortId(null);
    };

    return (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#aaa' }}>{device.name.toUpperCase()}</h3>
                <button
                    className="btn btn-ghost"
                    onClick={() => onDelete(device.id)}
                    style={{ color: '#ef4444', padding: '0.25rem' }}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div style={{ overflowX: 'auto', paddingBottom: '30px', paddingTop: '20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, minmax(35px, 1fr))`,
                    gap: '6px',
                    background: '#111',
                    padding: '15px',
                    borderRadius: '4px',
                    border: '2px solid #333',
                    minWidth: '900px'
                }}>
                    {device.ports.map((port) => (
                        <div
                            key={port.id}
                            onClick={() => handlePortClick(port)}
                            onMouseEnter={() => handleMouseEnter(port)}
                            onMouseLeave={handleMouseLeave}
                            style={{
                                aspectRatio: '1',
                                background: '#222',
                                borderRadius: '2px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                position: 'relative',
                                border: editingPortId === port.id ? '1px solid var(--color-primary)' : '1px solid #444',
                                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.8)'
                            }}
                            title={`Port ${port.number}: ${port.label || ''}`}
                        >
                            <div style={{
                                width: '70%',
                                height: '40%',
                                background: getPortColor(port),
                                marginBottom: '4px',
                                borderRadius: '2px',
                                boxShadow: port.status === 'active' && port.connectedTo ? `0 0 4px ${getPortColor(port)}` : 'none'
                            }} />
                            <span style={{ fontSize: '0.6rem', color: '#666', fontFamily: 'monospace' }}>{port.number}</span>

                            {port.label && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-24px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'var(--color-primary)',
                                    color: '#000',
                                    padding: '2px 4px',
                                    borderRadius: '3px',
                                    fontSize: '0.65rem',
                                    whiteSpace: 'nowrap',
                                    zIndex: 20,
                                    fontWeight: 'bold',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    maxWidth: '100px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    pointerEvents: 'none'
                                }}>
                                    {port.label}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-4px',
                                        left: '50%',
                                        marginLeft: '-4px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '4px solid transparent',
                                        borderRight: '4px solid transparent',
                                        borderTop: '4px solid var(--color-primary)'
                                    }} />
                                </div>
                            )}

                            {tooltipPortId === port.id && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '120%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: '#1e293b',
                                    border: '1px solid #475569',
                                    color: '#f8fafc',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    zIndex: 100,
                                    width: '200px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                    pointerEvents: 'none',
                                    textAlign: 'left'
                                }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid #334155', paddingBottom: '0.25rem' }}>Puerto {port.number}</h4>
                                    {port.connectedTo ? (
                                        <>
                                            <div style={{ marginBottom: '0.25rem' }}><strong style={{ color: '#94a3b8' }}>Dispositivo:</strong> {port.connectedTo.deviceName}</div>
                                            {allDevices && (() => {
                                                const remoteDev = allDevices.find(d => d.id === port.connectedTo!.deviceId);
                                                if (!remoteDev) return null;
                                                return (
                                                    <div style={{ marginBottom: '0.25rem', borderBottom: '1px dashed #334155', paddingBottom: '0.25rem' }}>
                                                        <div style={{ fontSize: '0.9em' }}><strong style={{ color: '#94a3b8' }}>IP:</strong> {remoteDev.ipAddress || 'N/A'}</div>
                                                        <div style={{ fontSize: '0.9em' }}><strong style={{ color: '#94a3b8' }}>Modelo:</strong> {remoteDev.model}</div>
                                                        <div style={{ fontSize: '0.9em' }}><strong style={{ color: '#94a3b8' }}>Tipo:</strong> {remoteDev.type.toUpperCase()}</div>
                                                    </div>
                                                );
                                            })()}
                                            <div><strong style={{ color: '#94a3b8' }}>Puerto Remoto:</strong> {port.connectedTo.portNumber}</div>
                                        </>
                                    ) : (
                                        <div style={{ color: '#64748b', fontStyle: 'italic' }}>Sin conexión</div>
                                    )}
                                    {port.label && <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #334155' }}><strong>Etiqueta:</strong> {port.label}</div>}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-6px',
                                        left: '50%',
                                        marginLeft: '-6px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '6px solid transparent',
                                        borderRight: '6px solid transparent',
                                        borderTop: '6px solid #475569'
                                    }} />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-5px',
                                        left: '50%',
                                        marginLeft: '-5px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '5px solid transparent',
                                        borderRight: '5px solid transparent',
                                        borderTop: '5px solid #1e293b'
                                    }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {editingPortId && (
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '4px'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem' }}>Etiqueta:</span>
                        <input
                            className="input-field"
                            value={tempLabel}
                            onChange={e => setTempLabel(e.target.value)}
                            placeholder="Etiqueta..."
                            autoFocus
                            style={{ maxWidth: '150px' }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') saveLabel();
                                if (e.key === 'Escape') setEditingPortId(null);
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem' }}>Estado:</span>
                        <select
                            className="input-field"
                            style={{ padding: '0.25rem', maxWidth: '100px' }}
                            value={tempStatus}
                            onChange={(e) => setTempStatus(e.target.value as 'active' | 'inactive')}
                        >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem' }}>Color:</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            {availableColors.map(c => (
                                <button
                                    key={c.value}
                                    onClick={() => setTempColor(c.value)}
                                    title={c.name}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: c.hex,
                                        border: tempColor === c.value ? '2px solid white' : '1px solid #444',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={saveLabel} style={{ padding: '0.25rem 0.75rem' }}><Save size={16} /></button>
                        <button className="btn btn-ghost" onClick={() => setEditingPortId(null)} style={{ padding: '0.25rem 0.5rem' }}><X size={16} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};
