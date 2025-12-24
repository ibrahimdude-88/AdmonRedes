import { Link, useLocation } from 'react-router-dom';
import { Network, Server, Cable } from 'lucide-react';

export const Navbar = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="glass-panel" style={{ marginBottom: '2rem' }}>
            <div className="container" style={{ padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Network size={24} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Memoria Tecnica ST-INF</h1>
                    </Link>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                            to="/"
                            className={isActive('/') ? 'btn btn-primary' : 'btn btn-ghost'}
                            style={{ fontSize: '0.95rem' }}
                        >
                            <Server size={18} />
                            Sucursales
                        </Link>
                        <Link
                            to="/templates"
                            className={isActive('/templates') ? 'btn btn-primary' : 'btn btn-ghost'}
                            style={{ fontSize: '0.95rem' }}
                        >
                            <Cable size={18} />
                            Plantillas
                        </Link>
                        {/* Retaining legacy links for now if needed, but better to hide them or move them to "All Devices" debug view if requested. 
                 User asked for "Apartado Sucursales", so the main flow should be Sucursales.
                 I will keep "Dispositivos" (global) hidden or renamed. 
                 Actually, simpler to removing the old Global Devices/Connections links to focus on the new flow.
              */}
                    </div>
                </div>
            </div>
        </nav>
    );
};
