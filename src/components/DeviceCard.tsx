import type { Device } from '../types';
import { Server, Wifi, Globe, Shield, Activity, Edit2, Trash2, Network, MapPin } from 'lucide-react';
import { useState } from 'react';

interface DeviceCardProps {
    device: Device;
    onDelete: (id: string) => void;
    onEdit: (device: Device) => void;
}

const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'switch':
            return <Server size={24} />;
        case 'router':
            return <Globe size={24} />;
        case 'firewall':
            return <Shield size={24} />;
        case 'access-point':
        case 'access point':
            return <Wifi size={24} />;
        default:
            return <Activity size={24} />;
    }
};

const getStatusColor = (status: Device['status']) => {
    switch (status) {
        case 'online':
            return '#4ade80';
        case 'offline':
            return '#ef4444';
        case 'warning':
            return '#fbbf24';
    }
};

export const DeviceCard = ({ device, onDelete, onEdit }: DeviceCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const connectedPorts = device.ports.filter((p) => p.connectedTo).length;

    return (
        <div
            className="glass-panel"
            style={{
                padding: '1.5rem',
                transition: 'var(--transition)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'pointer',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(56, 189, 248, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-primary)',
                        }}
                    >
                        {getDeviceIcon(device.type)}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                            {device.name}
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            {device.manufacturer} {device.model}
                        </p>
                    </div>
                </div>
                <div
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getStatusColor(device.status),
                        boxShadow: `0 0 10px ${getStatusColor(device.status)} `,
                    }}
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        fontSize: '0.875rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <Network size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {device.ipAddress ? (
                                <a
                                    href={`http://${device.ipAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                        color: 'var(--color-primary)',
                                        textDecoration: 'none',
                                        borderBottom: '1px dashed var(--color-primary)',
                                        transition: 'all 0.2s',
                                        wordBreak: 'break-all'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderBottomStyle = 'solid'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderBottomStyle = 'dashed'}
                                >
                                    {device.ipAddress}
                                </a>
                            ) : (
                                <span>N/A</span>
                            )}
                            {device.secondaryIpAddress && (
                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.7, flexShrink: 0 }}>Sec:</span>
                                    <a
                                        href={`http://${device.secondaryIpAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            color: 'var(--color-primary)',
                                            textDecoration: 'none',
                                            borderBottom: '1px dashed var(--color-primary)',
                                            transition: 'all 0.2s',
                                            fontSize: '0.75rem',
                                            wordBreak: 'break-all',
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderBottomStyle = 'solid'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderBottomStyle = 'dashed'}
                                    >
                                        {device.secondaryIpAddress}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        <MapPin size={16} />
                        <span>{device.location}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Puertos:</span>{' '}
                        <span>{device.ports.length}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Conectados:</span>{' '}
                        <span style={{ color: connectedPorts > 0 ? '#4ade80' : 'inherit' }}>
                            {connectedPorts}
                        </span>
                    </div>
                </div>
            </div>

            {device.description && (
                <p
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: '1rem',
                        lineHeight: '1.5',
                    }}
                >
                    {device.description}
                </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                    className="btn btn-ghost"
                    onClick={() => onEdit(device)}
                    style={{ flex: 1, fontSize: '0.875rem' }}
                >
                    <Edit2 size={16} />
                    Editar
                </button>
                <button
                    className="btn btn-ghost"
                    onClick={() => onDelete(device.id)}
                    style={{ fontSize: '0.875rem', color: '#ef4444' }}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
