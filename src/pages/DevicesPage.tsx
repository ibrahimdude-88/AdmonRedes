import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { DeviceCard } from '../components/DeviceCard';
import { DeviceModal } from '../components/DeviceModal';
import { useDevices } from '../hooks/useDevices';
import type { Device } from '../types';

export const DevicesPage = () => {
    const { devices, addDevice, updateDevice, deleteDevice } = useDevices();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDevices = devices.filter((device) =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.ipAddress.includes(searchTerm) ||
        device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = (deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (editingDevice) {
            updateDevice(editingDevice.id, deviceData);
        } else {
            addDevice(deviceData);
        }
        setEditingDevice(undefined);
    };

    const handleEdit = (device: Device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingDevice(undefined);
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Dispositivos
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Administra tus switches, routers y otros dispositivos de red
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={20} />
                    Nuevo Dispositivo
                </button>
            </div>

            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search
                    size={20}
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                    }}
                />
                <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: '3rem' }}
                    placeholder="Buscar por nombre, IP o fabricante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {devices.length === 0 ? (
                <div
                    className="glass-panel"
                    style={{
                        padding: '4rem',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                        No hay dispositivos registrados
                    </p>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Agregar el primer dispositivo
                    </button>
                </div>
            ) : (
                <div className="grid-layout">
                    {filteredDevices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onDelete={deleteDevice}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            <DeviceModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSave={handleSave}
                device={editingDevice}
            />
        </div>
    );
};
