import { useState } from 'react';
import { Plus, Trash2, Cpu, Pencil } from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import type { DeviceTemplate, PortTemplate } from '../types';

export const TemplatesPage = () => {
    const { templates, addTemplate, deleteTemplate, updateTemplate } = useTemplates();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [editingTemplate, setEditingTemplate] = useState<DeviceTemplate | null>(null);

    const [newTemplate, setNewTemplate] = useState<Partial<DeviceTemplate>>({
        name: '',
        type: 'switch',
        model: '',
        manufacturer: '',
        defaultPorts: [],
        rackHeight: 1,
    });
    const [portCount, setPortCount] = useState(24);
    const [portPrefix, setPortPrefix] = useState('Port');

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTemplate.name || !newTemplate.model) return;

        // Generate default ports
        const ports: PortTemplate[] = editingTemplate ? editingTemplate.defaultPorts : Array.from({ length: portCount }, (_, i) => ({
            name: `${portPrefix} ${i + 1}`,
            type: 'ethernet',
        }));

        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate.id, {
                    name: newTemplate.name!,
                    type: newTemplate.type as any,
                    model: newTemplate.model!,
                    manufacturer: newTemplate.manufacturer!,
                    description: newTemplate.description || '',
                    rackHeight: newTemplate.rackHeight !== undefined ? newTemplate.rackHeight : 1,
                    defaultPorts: editingTemplate.defaultPorts
                });
            } else {
                await addTemplate({
                    name: newTemplate.name!,
                    type: newTemplate.type as any,
                    model: newTemplate.model!,
                    manufacturer: newTemplate.manufacturer!,
                    defaultPorts: ports,
                    description: newTemplate.description || '',
                    rackHeight: newTemplate.rackHeight !== undefined ? newTemplate.rackHeight : 1,
                });
            }
            setIsModalOpen(false);
            setEditingTemplate(null);
            setNewTemplate({ name: '', type: 'switch', model: '', manufacturer: '', defaultPorts: [], rackHeight: 1 });
            setPortPrefix('Port');
        } catch (error) {
            console.error("Error creating/updating template:", error);
            alert("Error al guardar la plantilla.");
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Plantillas de Dispositivos
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Define modelos de dispositivos para reutilizar en tus sucursales
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingTemplate(null);
                    setNewTemplate({ name: '', type: 'switch', model: '', manufacturer: '', defaultPorts: [], rackHeight: 1 });
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} />
                    Nueva Plantilla
                </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <input
                    type="text"
                    placeholder="Buscar plantillas..."
                    className="input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Nombre</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Fabricante</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Modelo</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Tipo</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Altura (U)</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Puertos</th>
                            <th style={{ padding: '1rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTemplates.map(template => (
                            <tr key={template.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            background: 'rgba(244, 114, 182, 0.1)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--color-accent)'
                                        }}>
                                            <Cpu size={16} />
                                        </div>
                                        {template.name}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>{template.manufacturer}</td>
                                <td style={{ padding: '1rem' }}>{template.model}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '9999px',
                                        background: 'rgba(255,255,255,0.1)',
                                        fontSize: '0.75rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {template.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{template.rackHeight !== undefined ? template.rackHeight : 1}U</td>
                                <td style={{ padding: '1rem' }}>{template.defaultPorts.length}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setNewTemplate({ ...template });
                                            setIsModalOpen(true);
                                        }}
                                        style={{ color: '#3b82f6', padding: '0.5rem', marginRight: '0.5rem' }}
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => deleteTemplate(template.id)}
                                        style={{ color: '#ef4444', padding: '0.5rem' }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredTemplates.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No se encontraron plantillas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
                        <form onSubmit={handleCreateOrUpdate}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input
                                    className="input-field"
                                    placeholder="Nombre template (ej. Switch Acceso 24p)"
                                    value={newTemplate.name}
                                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    required
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        className="input-field"
                                        placeholder="Fabricante"
                                        value={newTemplate.manufacturer}
                                        onChange={e => setNewTemplate({ ...newTemplate, manufacturer: e.target.value })}
                                        required
                                    />
                                    <input
                                        className="input-field"
                                        placeholder="Modelo"
                                        value={newTemplate.model}
                                        onChange={e => setNewTemplate({ ...newTemplate, model: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="input-field"
                                            value={['switch', 'router', 'firewall', 'server', 'access-point', 'patch-panel'].includes(newTemplate.type as string) ? newTemplate.type : 'other'}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val !== 'other') {
                                                    setNewTemplate({ ...newTemplate, type: val as any });
                                                } else {
                                                    setNewTemplate({ ...newTemplate, type: '' as any });
                                                }
                                            }}
                                        >
                                            <option value="switch">Switch</option>
                                            <option value="router">Router</option>
                                            <option value="firewall">Firewall</option>
                                            <option value="server">Servidor</option>
                                            <option value="access-point">Access Point</option>
                                            <option value="patch-panel">Patch Panel</option>
                                            <option value="other">Otro...</option>
                                        </select>
                                        {(!['switch', 'router', 'firewall', 'server', 'access-point', 'patch-panel'].includes(newTemplate.type as string)) && (
                                            <input
                                                className="input-field"
                                                placeholder="Tipo"
                                                value={newTemplate.type}
                                                onChange={e => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                                        Altura en Rack (Unidades)
                                    </label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={newTemplate.rackHeight ?? 1}
                                        onChange={e => setNewTemplate({ ...newTemplate, rackHeight: parseInt(e.target.value) })}
                                        min="0" max="10"
                                    />
                                </div>

                                <input
                                    className="input-field"
                                    placeholder="Descripción (Opcional)"
                                    value={newTemplate.description || ''}
                                    onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                                            Cantidad de puertos
                                        </label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={portCount}
                                            onChange={e => setPortCount(parseInt(e.target.value))}
                                            min="1" max="96"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
                                            Prefijo/Etiqueta
                                        </label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={portPrefix}
                                            onChange={e => setPortPrefix(e.target.value)}
                                            placeholder="ej. Port"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingTemplate ? 'Guardar Cambios' : 'Crear'}</button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};
