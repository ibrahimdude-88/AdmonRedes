import { useState } from 'react';
import { useDevices } from '../hooks/useDevices';
import type { Device, Port } from '../types';
import { Cable, ArrowRight, Unplug, CheckCircle, AlertCircle } from 'lucide-react';

export const ConnectionsPage = () => {
    const { devices, connectPorts, disconnectPort } = useDevices();
    const [selectedSourceDevice, setSelectedSourceDevice] = useState<Device | null>(null);
    const [selectedSourcePort, setSelectedSourcePort] = useState<Port | null>(null);

    const [selectedTargetDevice, setSelectedTargetDevice] = useState<Device | null>(null);
    const [selectedTargetPort, setSelectedTargetPort] = useState<Port | null>(null);

    const handleConnect = () => {
        if (selectedSourceDevice && selectedSourcePort && selectedTargetDevice && selectedTargetPort) {
            connectPorts(
                selectedSourceDevice.id,
                selectedSourcePort.id,
                selectedTargetDevice.id,
                selectedTargetPort.id
            );
            // Reset selection
            setSelectedSourcePort(null);
            setSelectedTargetPort(null);
            setSelectedTargetDevice(null);
        }
    };

    const isPortConnected = (port: Port) => !!port.connectedTo;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Conexiones
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Gestiona el cableado y las conexiones lógicas entre dispositivos
                    </p>
                </div>
            </div>

            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Source Selection */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: 'var(--color-primary)',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem'
                        }}>1</span>
                        Origen
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            Dispositivo
                        </label>
                        <select
                            className="input-field"
                            value={selectedSourceDevice?.id || ''}
                            onChange={(e) => {
                                const dev = devices.find(d => d.id === e.target.value) || null;
                                setSelectedSourceDevice(dev);
                                setSelectedSourcePort(null);
                            }}
                        >
                            <option value="">Seleccionar dispositivo...</option>
                            {devices.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                            ))}
                        </select>
                    </div>

                    {selectedSourceDevice && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                Puerto
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                                {selectedSourceDevice.ports.map(port => {
                                    const isConnected = isPortConnected(port);
                                    const isSelected = selectedSourcePort?.id === port.id;

                                    return (
                                        <button
                                            key={port.id}
                                            onClick={() => !isConnected && setSelectedSourcePort(port)}
                                            disabled={isConnected}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: isSelected
                                                    ? '1px solid var(--color-primary)'
                                                    : '1px solid var(--border-color)',
                                                background: isSelected
                                                    ? 'rgba(56, 189, 248, 0.1)'
                                                    : isConnected
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : 'transparent',
                                                color: isSelected ? 'var(--color-primary)' : 'inherit',
                                                cursor: isConnected ? 'not-allowed' : 'pointer',
                                                opacity: isConnected ? 0.7 : 1,
                                                fontSize: '0.875rem',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            <span style={{ fontWeight: '600' }}>#{port.number}</span>
                                            {isConnected && <CheckCircle size={12} color="#4ade80" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Target Selection */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            background: 'rgba(244, 114, 182, 0.1)',
                            color: 'var(--color-accent)',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem'
                        }}>2</span>
                        Destino
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            Dispositivo
                        </label>
                        <select
                            className="input-field"
                            value={selectedTargetDevice?.id || ''}
                            onChange={(e) => {
                                const dev = devices.find(d => d.id === e.target.value) || null;
                                setSelectedTargetDevice(dev);
                                setSelectedTargetPort(null);
                            }}
                            disabled={!selectedSourceDevice}
                        >
                            <option value="">Seleccionar dispositivo...</option>
                            {devices
                                .filter(d => d.id !== selectedSourceDevice?.id)
                                .map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.ipAddress})</option>
                                ))}
                        </select>
                    </div>

                    {selectedTargetDevice && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                Puerto
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                                {selectedTargetDevice.ports.map(port => {
                                    const isConnected = isPortConnected(port);
                                    const isSelected = selectedTargetPort?.id === port.id;

                                    return (
                                        <button
                                            key={port.id}
                                            onClick={() => !isConnected && setSelectedTargetPort(port)}
                                            disabled={isConnected}
                                            style={{
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: isSelected
                                                    ? '1px solid var(--color-accent)'
                                                    : '1px solid var(--border-color)',
                                                background: isSelected
                                                    ? 'rgba(244, 114, 182, 0.1)'
                                                    : isConnected
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : 'transparent',
                                                color: isSelected ? 'var(--color-accent)' : 'inherit',
                                                cursor: isConnected ? 'not-allowed' : 'pointer',
                                                opacity: isConnected ? 0.7 : 1,
                                                fontSize: '0.875rem',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}
                                        >
                                            <span style={{ fontWeight: '600' }}>#{port.number}</span>
                                            {isConnected && <CheckCircle size={12} color="#4ade80" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Area */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                <button
                    className="btn btn-primary"
                    disabled={!selectedSourcePort || !selectedTargetPort}
                    onClick={handleConnect}
                    style={{
                        opacity: (!selectedSourcePort || !selectedTargetPort) ? 0.5 : 1,
                        transform: 'scale(1.1)',
                        padding: '1rem 3rem'
                    }}
                >
                    <Cable size={24} />
                    Conectar Puertos
                </button>
            </div>

            {/* Existing Connections List */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Conexiones Activas</h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {devices.flatMap(device =>
                        device.ports
                            .filter(port => port.connectedTo)
                            // Simple trick to avoid duplicates since connection is bidirectional logic-wise
                            // We only show if current device ID < connected device ID to show strictly once per pair
                            .filter(port => device.id < port.connectedTo!.deviceId)
                            .map(port => {
                                const connectedDevice = devices.find(d => d.id === port.connectedTo!.deviceId);
                                if (!connectedDevice) return null;

                                return (
                                    <div key={`${device.id}-${port.id}`} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                            <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{device.name}</span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Port {port.number}</span>
                                        </div>

                                        <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Cable size={16} />
                                            <ArrowRight size={16} />
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Port {port.connectedTo!.portNumber}</span>
                                            <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>{connectedDevice.name}</span>
                                        </div>

                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => disconnectPort(device.id, port.id)}
                                            style={{ marginLeft: '1rem', color: '#ef4444' }}
                                            title="Desconectar"
                                        >
                                            <Unplug size={18} />
                                        </button>
                                    </div>
                                );
                            })
                    )}
                    {devices.every(d => d.ports.every(p => !p.connectedTo)) && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            <AlertCircle size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No hay conexiones activas en este momento</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
