import { useState } from 'react';
import type { Device, Rack } from '../types';
import { Plus, Trash2, Box } from 'lucide-react';

interface RackViewProps {
    rack: Rack;
    devices: Device[];
    allDevices: Device[]; // All branch devices to select from
    onUpdateDevice: (id: string, updates: Partial<Device>) => void;
    onDeleteRack: (id: string) => void;
    onCreateDevice: (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onDeviceClick: (device: Device) => void;
}

export const RackView = ({ rack, devices, allDevices, onUpdateDevice, onDeleteRack, onCreateDevice, onDeviceClick }: RackViewProps) => {
    const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [isAddMode, setIsAddMode] = useState(false);
    const [shelfModalOpen, setShelfModalOpen] = useState(false);
    const [selectedShelf, setSelectedShelf] = useState<Device | null>(null);

    // Filter devices that are NOT in a rack yet (or at least not in this one)
    // Exclude only shelves and cable-managers from normal inventory
    const availableDevices = allDevices.filter(d =>
        !d.rackId &&
        d.type !== 'shelf' &&
        d.type !== 'cable-manager'
    );

    // Filter 0U devices specifically for shelf modal
    const availableZeroUDevices = allDevices.filter(d => {
        const height = d.rackHeight !== undefined ? d.rackHeight : 1;
        return height === 0 && !d.rackId;
    });

    // Create an array of rack units (e.g. 42 down to 1)
    const units = Array.from({ length: rack.height }, (_, i) => rack.height - i);

    const getDeviceAtUnit = (u: number) => {
        return devices.find(d => {
            // If device has rackHeight 0, it doesn't "occupy" a slot in the blocking sense for the grid background
            // We explicitely verify rackHeight. If undefined, default to 1.
            const height = d.rackHeight !== undefined ? d.rackHeight : 1;
            if (height < 1) return false;

            const pos = d.rackPosition || 0;
            // Check if this unit is covered by a device
            return u >= pos && u < pos + height;
        });
    };

    const getZeroHeightDevicesAtUnit = (u: number) => {
        return devices.filter(d => {
            const height = d.rackHeight !== undefined ? d.rackHeight : 1;
            return height === 0 && d.rackPosition === u;
        });
    };

    const handleMountDevice = (deviceId: string, u: number) => {
        const device = allDevices.find(d => d.id === deviceId);
        if (!device) return;

        // Check if mounting on a shelf
        const shelfAtPosition = devices.find(d =>
            d.type === 'shelf' &&
            d.rackPosition !== undefined &&
            u >= d.rackPosition &&
            u < d.rackPosition + (d.rackHeight || 4)
        );

        if (shelfAtPosition) {
            // Mounting on a shelf - only allow 0U devices
            const deviceHeight = device.rackHeight !== undefined ? device.rackHeight : 1;
            if (deviceHeight !== 0) {
                alert('Solo se pueden montar dispositivos de 0U en charolas');
                return;
            }

            // Check how many 0U devices are already in this shelf
            const devicesInShelf = devices.filter(d => {
                const height = d.rackHeight !== undefined ? d.rackHeight : 1;
                return height === 0 && d.rackPosition === shelfAtPosition.rackPosition;
            });

            if (devicesInShelf.length >= 4) {
                alert('Esta charola ya tiene el máximo de 4 dispositivos');
                return;
            }

            // Mount 0U device in the shelf
            onUpdateDevice(deviceId, {
                rackId: rack.id,
                rackPosition: shelfAtPosition.rackPosition,
                rackHeight: 0
            });
        } else {
            // Normal mounting
            // Default to a reasonable height if not set, or ask user?
            // If it's 0 (from template), keep it 0.
            // If undefined, default to 1.
            let height = device.rackHeight !== undefined ? device.rackHeight : 1;
            if (device.model.toLowerCase().includes('48p') && device.rackHeight === undefined) height = 1;

            onUpdateDevice(deviceId, {
                rackId: rack.id,
                rackPosition: u,
                rackHeight: height
            });
        }

        setIsAddMode(false);
        setSelectedSlot(null);
    };

    const handleRemoveDevice = (device: Device) => {
        console.log('handleRemoveDevice called for:', device.name);

        // Check if it's a shelf with devices
        if (device.type === 'shelf') {
            const devicesInShelf = devices.filter(d => {
                const height = d.rackHeight !== undefined ? d.rackHeight : 1;
                return height === 0 && d.rackPosition === device.rackPosition;
            });

            console.log('Devices in shelf:', devicesInShelf);

            if (devicesInShelf.length > 0) {
                // Remove all devices from shelf first
                console.log('Removing devices from shelf...');
                devicesInShelf.forEach(d => {
                    onUpdateDevice(d.id, {
                        rackId: null,
                        rackPosition: null,
                        rackHeight: 0 // Keep as 0U device
                    } as any);
                });
            }
        }

        // Remove device from rack immediately
        console.log('Removing device from rack...');

        // Check if it's a 0U device to preserve rackHeight
        const is0UDevice = device.rackHeight === 0;

        // Remove rack assignment
        onUpdateDevice(device.id, {
            rackId: null,
            rackPosition: null,
            rackHeight: is0UDevice ? 0 : null
        } as any);
        console.log('Device removal command sent');
    };

    const handleQuickAdd = async (type: 'cable-manager' | 'shelf', u: number, height?: number) => {
        if (!selectedSlot) return;

        try {
            if (type === 'cable-manager') {
                const cableHeight = height || 1; // Default 1U if not specified
                await onCreateDevice({
                    branchId: rack.branchId,
                    name: `Orgz. Cables U${u} (${cableHeight}U)`,
                    type: 'cable-manager',
                    model: `Horizontal ${cableHeight}U`,
                    manufacturer: 'Generic',
                    location: 'Rack',
                    ipAddress: '',
                    status: 'online',
                    ports: [],
                    rackId: rack.id,
                    rackPosition: u,
                    rackHeight: cableHeight
                });
            } else if (type === 'shelf') {
                await onCreateDevice({
                    branchId: rack.branchId,
                    name: `Charola U${u}`,
                    type: 'shelf',
                    model: 'Equipment Shelf 4U',
                    manufacturer: 'Generic',
                    location: 'Rack',
                    ipAddress: '',
                    status: 'online',
                    ports: [],
                    rackId: rack.id,
                    rackPosition: u,
                    rackHeight: 4
                });
            }
            setIsAddMode(false);
            setSelectedSlot(null);
        } catch (error) {
            console.error(error);
            alert("Error al crear dispositivo rápido");
        }
    };

    return (
        <>
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{rack.name} ({rack.height}U)</h3>
                    <button
                        className="btn btn-ghost"
                        style={{ color: '#ef4444', padding: '0.25rem' }}
                        onClick={() => onDeleteRack(rack.id)}
                        title="Eliminar Rack"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <div style={{
                    display: 'flex',
                    background: '#1a1a1a',
                    padding: '1rem',
                    justifyContent: 'center',
                    gap: '1rem'
                }}>
                    {/* Left Vertical Cable Manager */}
                    {rack.hasVerticalCableManager && (
                        <div style={{
                            width: '40px',
                            background: 'linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%)',
                            border: '2px solid #444',
                            borderRadius: '4px',
                            position: 'relative',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '8px 4px'
                        }}>
                            <div style={{
                                fontSize: '0.6rem',
                                color: '#666',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                letterSpacing: '2px',
                                fontWeight: 'bold'
                            }}>
                                CABLE MGR
                            </div>
                            {/* Cable manager slots visualization */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px', width: '100%' }}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} style={{
                                        flex: 1,
                                        background: '#333',
                                        borderRadius: '2px',
                                        border: '1px solid #555'
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Rack Rails */}
                    <div style={{
                        width: '300px', // Standard-ish visual width
                        borderLeft: '4px solid #444',
                        borderRight: '4px solid #444',
                        background: '#262626',
                        position: 'relative',
                        padding: '0 2px'
                    }}>
                        {units.map((u) => {
                            const device = getDeviceAtUnit(u);
                            // If device occupies multiple U, only render it at the top-most (or bottom-most?)
                            // Let's render at the bottom (start position) and stretch it.
                            // Actually, simple grid approach:

                            // We check if this is the start of a device (device.rackPosition === u)
                            const isDeviceStart = device?.rackPosition === u;
                            const isDeviceOccupied = !!device;

                            return (
                                <div
                                    key={u}
                                    style={{
                                        height: '40px', // 1U visual height
                                        borderBottom: '1px solid #333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}
                                    onMouseEnter={() => setHoveredSlot(u)}
                                    onMouseLeave={() => setHoveredSlot(null)}
                                >
                                    {/* Unit Number */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-35px',
                                        width: '30px',
                                        textAlign: 'right',
                                        color: '#666',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {u}
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        right: '-35px',
                                        width: '30px',
                                        textAlign: 'left',
                                        color: '#666',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {u}
                                    </div>

                                    {/* Slot Content */}
                                    {isDeviceStart ? (
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: `${(device.rackHeight || 1) * 40}px`,
                                            zIndex: 10
                                        }}>
                                            {/* Device content area */}
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: typeColor(device.type),
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                                cursor: 'pointer',
                                                position: 'relative'
                                            }}
                                                onClick={() => {
                                                    if (device.type === 'shelf') {
                                                        setSelectedShelf(device);
                                                        setShelfModalOpen(true);
                                                    } else {
                                                        onDeviceClick(device);
                                                    }
                                                }}
                                                title={device.type === 'shelf' ? `${device.name} - Click para agregar dispositivos 0U` : device.name}
                                            >
                                                {device.type === 'shelf' ? (
                                                    // Special rendering for shelves with 0U devices visible
                                                    <div style={{
                                                        textAlign: 'center',
                                                        width: '100%',
                                                        height: '100%',
                                                        padding: '0.5rem',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '0.25rem',
                                                        position: 'relative'
                                                    }}>
                                                        <div style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                            color: 'white',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            padding: '0.25rem',
                                                            borderRadius: '4px',
                                                            marginBottom: '0.25rem'
                                                        }}>
                                                            📦 {device.name}
                                                        </div>

                                                        {/* Show 0U devices inside shelf */}
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr',
                                                            gap: '0.25rem',
                                                            flex: 1,
                                                            alignItems: 'start'
                                                        }}>
                                                            {getZeroHeightDevicesAtUnit(device.rackPosition || 0).map((zeroUDevice) => (
                                                                <div
                                                                    key={zeroUDevice.id}
                                                                    style={{
                                                                        background: 'rgba(59, 130, 246, 0.3)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.5)',
                                                                        borderRadius: '3px',
                                                                        padding: '0.25rem',
                                                                        fontSize: '0.65rem',
                                                                        color: 'white',
                                                                        cursor: 'pointer',
                                                                        position: 'relative',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeviceClick(zeroUDevice);
                                                                    }}
                                                                    title={zeroUDevice.name}
                                                                >
                                                                    {zeroUDevice.name}
                                                                    <button
                                                                        type="button"
                                                                        style={{
                                                                            position: 'absolute',
                                                                            right: '2px',
                                                                            top: '2px',
                                                                            background: 'rgba(239, 68, 68, 0.9)',
                                                                            border: 'none',
                                                                            borderRadius: '2px',
                                                                            color: 'white',
                                                                            cursor: 'pointer',
                                                                            padding: '1px 3px',
                                                                            fontSize: '0.6rem',
                                                                            lineHeight: '1',
                                                                            zIndex: 10
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveDevice(zeroUDevice);
                                                                        }}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {/* Empty slots */}
                                                            {Array.from({ length: 4 - getZeroHeightDevicesAtUnit(device.rackPosition || 0).length }).map((_, idx) => (
                                                                <div
                                                                    key={`empty-${idx}`}
                                                                    style={{
                                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                                        border: '1px dashed rgba(255, 255, 255, 0.2)',
                                                                        borderRadius: '3px',
                                                                        padding: '0.25rem',
                                                                        fontSize: '0.6rem',
                                                                        color: 'rgba(255, 255, 255, 0.4)',
                                                                        fontStyle: 'italic',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    vacío
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div style={{
                                                            fontSize: '0.6rem',
                                                            color: 'rgba(255,255,255,0.6)',
                                                            fontStyle: 'italic',
                                                            background: 'rgba(0,0,0,0.2)',
                                                            padding: '0.15rem',
                                                            borderRadius: '3px'
                                                        }}>
                                                            Click para agregar
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', width: '100%', padding: '0 0.5rem' }}>
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {device.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                                                            {device.model}
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    style={{
                                                        position: 'absolute',
                                                        right: '5px',
                                                        top: '5px',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        transition: 'all 0.2s',
                                                        zIndex: 100,
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveDevice(device);
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    ) : !isDeviceOccupied ? (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                opacity: (selectedSlot === u || hoveredSlot === u) ? 1 : 0,
                                                transition: 'opacity 0.2s',
                                            }}
                                            className="rack-slot-hover"
                                            onClick={() => {
                                                setSelectedSlot(u);
                                                setIsAddMode(true);
                                            }}
                                        >
                                            <Plus size={14} color="#666" />
                                        </div>
                                    ) : null}

                                    {/* 0U Devices Overlay / Container */}
                                    {getZeroHeightDevicesAtUnit(u).length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '5px',
                                            bottom: '2px',
                                            display: 'flex',
                                            gap: '2px',
                                            zIndex: 20
                                        }}>
                                            {getZeroHeightDevicesAtUnit(u).map(zhDay => (
                                                <div
                                                    key={zhDay.id}
                                                    style={{
                                                        width: '12px', height: '12px',
                                                        borderRadius: '50%',
                                                        background: typeColor(zhDay.type),
                                                        border: '1px solid white',
                                                        cursor: 'pointer'
                                                    }}
                                                    title={`${zhDay.name} (0U)`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeviceClick(zhDay);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Vertical Cable Manager */}
                    {
                        rack.hasVerticalCableManager && (
                            <div style={{
                                width: '40px',
                                background: 'linear-gradient(180deg, #1a1a1a 0%, #2a2a2a 100%)',
                                border: '2px solid #444',
                                borderRadius: '4px',
                                position: 'relative',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '8px 4px'
                            }}>
                                <div style={{
                                    fontSize: '0.6rem',
                                    color: '#666',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    letterSpacing: '2px',
                                    fontWeight: 'bold'
                                }}>
                                    CABLE MGR
                                </div>
                                {/* Cable manager slots visualization */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px', width: '100%' }}>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} style={{
                                            flex: 1,
                                            background: '#333',
                                            borderRadius: '2px',
                                            border: '1px solid #555'
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* Add Device Popover */}
            {isAddMode && selectedSlot !== null && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '300px', padding: '1.5rem' }}>
                        <h4>Montar en U{selectedSlot}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
                            Selecciona una opción:
                        </p>

                        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                className="btn btn-ghost"
                                style={{ justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => handleQuickAdd('cable-manager', selectedSlot, 1)}
                            >
                                <Box size={14} /> Organizador de Cables (1U)
                            </button>
                            <button
                                className="btn btn-ghost"
                                style={{ justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
                                onClick={() => handleQuickAdd('cable-manager', selectedSlot, 2)}
                            >
                                <Box size={14} /> Organizador de Cables (2U)
                            </button>
                            <button
                                className="btn btn-ghost"
                                style={{ justifyContent: 'flex-start', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                                onClick={() => handleQuickAdd('shelf', selectedSlot)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></svg>
                                Charola para 0U (4U)
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <h5 style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Desde Inventario
                            </h5>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {availableDevices.length > 0 ? availableDevices.map(d => (
                                    <button
                                        key={d.id}
                                        className="btn btn-ghost"
                                        style={{ justifyContent: 'flex-start', background: 'rgba(255,255,255,0.05)' }}
                                        onClick={() => handleMountDevice(d.id, selectedSlot)}
                                    >
                                        <Box size={14} />
                                        <span style={{ fontSize: '0.9rem' }}>{d.name} ({d.rackHeight !== undefined ? d.rackHeight : 1}U)</span>
                                    </button>
                                )) : (
                                    <div style={{ color: '#666', fontStyle: 'italic', padding: '0.5rem 0' }}>No hay dispositivos sin asignar</div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="btn btn-ghost" onClick={() => setIsAddMode(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shelf Modal - Add 0U Devices */}
            {shelfModalOpen && selectedShelf && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>📦 {selectedShelf.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
                            Agregar dispositivos 0U ({getZeroHeightDevicesAtUnit(selectedShelf.rackPosition || 0).length} / 4)
                        </p>

                        {getZeroHeightDevicesAtUnit(selectedShelf.rackPosition || 0).length >= 4 ? (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                marginBottom: '1rem'
                            }}>
                                Esta charola ya tiene el máximo de 4 dispositivos
                            </div>
                        ) : (
                            <>
                                <h5 style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Dispositivos 0U Disponibles
                                </h5>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {availableZeroUDevices.length > 0 ? (
                                        availableZeroUDevices.map(d => (
                                            <button
                                                key={d.id}
                                                className="btn btn-ghost"
                                                style={{ justifyContent: 'flex-start', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
                                                onClick={() => {
                                                    handleMountDevice(d.id, selectedShelf.rackPosition || 0);
                                                    setShelfModalOpen(false);
                                                    setSelectedShelf(null);
                                                }}
                                            >
                                                <Box size={14} />
                                                <span style={{ fontSize: '0.9rem' }}>{d.name} (0U)</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div style={{ color: '#666', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                                            No hay dispositivos 0U disponibles
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-ghost"
                                onClick={() => {
                                    setShelfModalOpen(false);
                                    setSelectedShelf(null);
                                }}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const typeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'firewall': return '#ef4444'; // Red
        case 'router': return '#f97316'; // Orange
        case 'switch': return '#3b82f6'; // Blue
        case 'server': return '#8b5cf6'; // Purple
        case 'access-point': return '#10b981'; // Green
        case 'patch-panel': return '#64748b'; // Slate
        case 'cable-manager': return '#1a1a1a'; // Dark
        case 'shelf': return '#a855f7'; // Purple/Violet for shelves
        default: return '#525252';
    }
};
