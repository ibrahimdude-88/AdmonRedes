import { useState, useEffect } from 'react';
import type { Device, Port } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface DeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => void;
    device?: Device;
}

export const DeviceModal = ({ isOpen, onClose, onSave, device }: DeviceModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'switch' as Device['type'],
        model: '',
        manufacturer: '',
        location: '',
        ipAddress: '',
        secondaryIpAddress: '',
        status: 'online' as Device['status'],
        description: '',
        ports: [] as Port[],
        rackHeight: 1,
    });

    useEffect(() => {
        if (device) {
            setFormData({
                name: device.name,
                type: device.type,
                model: device.model,
                manufacturer: device.manufacturer,
                location: device.location,
                ipAddress: device.ipAddress,
                secondaryIpAddress: device.secondaryIpAddress || '',
                status: device.status,
                description: device.description || '',
                ports: device.ports,
                rackHeight: device.rackHeight !== undefined ? device.rackHeight : 1,
            });
        } else {
            setFormData({
                name: '',
                type: 'switch',
                model: '',
                manufacturer: '',
                location: '',
                ipAddress: '',
                secondaryIpAddress: '',
                status: 'online',
                description: '',
                ports: [],
                rackHeight: 1,
            });
        }
    }, [device, isOpen]);

    const isCustomType = !['switch', 'router', 'firewall', 'server', 'access-point'].includes(formData.type) && formData.type !== '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const addPort = () => {
        const newPort: Port = {
            id: crypto.randomUUID(),
            number: formData.ports.length + 1,
            name: `Port ${formData.ports.length + 1}`,
            status: 'inactive',
        };
        setFormData({ ...formData, ports: [...formData.ports, newPort] });
    };

    const removePort = (id: string) => {
        setFormData({
            ...formData,
            ports: formData.ports.filter((p) => p.id !== id),
        });
    };

    const updatePort = (id: string, updates: Partial<Port>) => {
        setFormData({
            ...formData,
            ports: formData.ports.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        });
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem',
            }}
            onClick={onClose}
        >
            <div
                className="glass-panel"
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    padding: '2rem',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                        {device ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
                    </h2>
                    <button className="btn btn-ghost" onClick={onClose} style={{ padding: '0.5rem' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Nombre del Dispositivo
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Tipo
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <select
                                        className="input-field"
                                        value={isCustomType ? 'other' : formData.type}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val !== 'other') {
                                                setFormData({ ...formData, type: val as Device['type'] });
                                            } else {
                                                setFormData({ ...formData, type: '' }); // Clear type to allow custom input
                                            }
                                        }}
                                    >
                                        <option value="switch">Switch</option>
                                        <option value="router">Router</option>
                                        <option value="firewall">Firewall</option>
                                        <option value="server">Servidor</option>
                                        <option value="access-point">Access Point</option>
                                        <option value="other">Otro...</option>
                                    </select>
                                    {isCustomType && (
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Especificar tipo"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            required
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Fabricante
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.manufacturer}
                                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Modelo
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Dirección IP
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.ipAddress}
                                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                                    placeholder="192.168.1.1"
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    IP Secundaria (Opcional)
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.secondaryIpAddress || ''}
                                    onChange={(e) => setFormData({ ...formData, secondaryIpAddress: e.target.value })}
                                    placeholder="10.0.0.1"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Estado
                                </label>
                                <select
                                    className="input-field"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData({ ...formData, status: e.target.value as Device['status'] })
                                    }
                                >
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                    <option value="warning">Warning</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    Altura en Rack
                                </label>
                                <select
                                    className="input-field"
                                    value={formData.rackHeight}
                                    onChange={(e) =>
                                        setFormData({ ...formData, rackHeight: parseInt(e.target.value) })
                                    }
                                >
                                    <option value="0">0U (Sin altura)</option>
                                    <option value="1">1U</option>
                                    <option value="2">2U</option>
                                    <option value="3">3U</option>
                                    <option value="4">4U</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                Descripción (opcional)
                            </label>
                            <textarea
                                className="input-field"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                    Puertos ({formData.ports.length})
                                </label>
                                <button type="button" className="btn btn-primary" onClick={addPort} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    <Plus size={16} />
                                    Agregar Puerto
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '300px', overflow: 'auto' }}>
                                {formData.ports.map((port) => (
                                    <div
                                        key={port.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '60px 1fr 1fr 100px 40px',
                                            gap: '0.5rem',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: 'var(--radius-md)',
                                        }}
                                    >
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={port.number}
                                            onChange={(e) =>
                                                updatePort(port.id, { number: parseInt(e.target.value) })
                                            }
                                            style={{ padding: '0.5rem' }}
                                            min="1"
                                        />
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={port.name}
                                            onChange={(e) => updatePort(port.id, { name: e.target.value })}
                                            style={{ padding: '0.5rem' }}
                                            placeholder="Nombre"
                                        />
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={port.label || ''}
                                            onChange={(e) => updatePort(port.id, { label: e.target.value })}
                                            style={{ padding: '0.5rem' }}
                                            placeholder="Etiqueta (opcional)"
                                        />
                                        <select
                                            className="input-field"
                                            value={port.status}
                                            onChange={(e) =>
                                                updatePort(port.id, { status: e.target.value as Port['status'] })
                                            }
                                            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                                        >
                                            <option value="active">Activo</option>
                                            <option value="inactive">Inactivo</option>
                                            <option value="error">Error</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            onClick={() => removePort(port.id)}
                                            style={{ padding: '0.5rem', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                {device ? 'Actualizar' : 'Crear'} Dispositivo
                            </button>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
