import { useState } from 'react';
import { Plus, MapPin, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBranches } from '../hooks/useBranches';
import { useDevices } from '../hooks/useDevices';

export const BranchesPage = () => {
    const { branches, addBranch, deleteBranch } = useBranches();
    const { devices } = useDevices();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBranch, setNewBranch] = useState({ name: '', location: '', description: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBranch.name) return;
        addBranch(newBranch);
        setIsModalOpen(false);
        setNewBranch({ name: '', location: '', description: '' });
    };

    const getDeviceCount = (branchId: string) =>
        devices.filter(d =>
            d.branchId === branchId &&
            d.type !== 'patch-panel' &&
            d.type !== 'shelf' &&
            d.type !== 'cable-manager'
        ).length;

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Sucursales
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Administra tus redes distribuidas por ubicación
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Nueva Sucursal
                </button>
            </div>

            <div className="grid-layout">
                {branches.map(branch => (
                    <div key={branch.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-primary)'
                                }}>
                                    <MapPin size={20} />
                                </div>
                                <button
                                    className="btn btn-ghost"
                                    onClick={(e) => { e.preventDefault(); deleteBranch(branch.id); }}
                                    style={{ color: '#ef4444', padding: '0.25rem' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{branch.name}</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{branch.location}</p>

                            <div style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '99px',
                                fontSize: '0.75rem'
                            }}>
                                {getDeviceCount(branch.id)} Dispositivos
                            </div>
                        </div>

                        <Link
                            to={`/branch/${branch.id}`}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderTop: '1px solid var(--border-color)',
                                transition: 'background 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Gestionar Red</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Nueva Sucursal</h2>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    className="input-field"
                                    placeholder="Nombre de la sucursal"
                                    value={newBranch.name}
                                    onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                                    required
                                />
                                <input
                                    className="input-field"
                                    placeholder="Ubicación (Ciudad, Dirección)"
                                    value={newBranch.location}
                                    onChange={e => setNewBranch({ ...newBranch, location: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="input-field"
                                    placeholder="Descripción (opcional)"
                                    value={newBranch.description}
                                    onChange={e => setNewBranch({ ...newBranch, description: e.target.value })}
                                    rows={3}
                                />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Crear</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
