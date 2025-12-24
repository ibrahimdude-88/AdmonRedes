import { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    Handle
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Device } from '../types';
import { Server, Wifi, Shield, Router as RouterIcon, Network } from 'lucide-react';

interface NetworkMapProps {
    devices: Device[];
}

// Dagre layout simulation (simplified hierarchical layout)
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const nodeWidth = 200;
    const levelGap = 180;
    const nodeGap = 50;

    // Group devices by type priority for hierarchical layout
    const getTypePriority = (type: string) => {
        switch (type.toLowerCase()) {
            case 'firewall': return 0;
            case 'router': return 1;
            case 'switch': return 2;
            case 'server': return 3;
            case 'access-point': return 4;
            case 'patch-panel': return 5;
            default: return 6;
        }
    };

    // Sort nodes by priority
    const sortedNodes = [...nodes].sort((a, b) => {
        const deviceA = a.data.device as Device;
        const deviceB = b.data.device as Device;
        return getTypePriority(deviceA.type) - getTypePriority(deviceB.type);
    });

    // Group by level
    const levels: { [key: number]: Node[] } = {};
    sortedNodes.forEach(node => {
        const device = node.data.device as Device;
        const priority = getTypePriority(device.type);
        if (!levels[priority]) levels[priority] = [];
        levels[priority].push(node);
    });

    // Position nodes
    const layoutedNodes = sortedNodes.map(node => {
        const device = node.data.device as Device;
        const priority = getTypePriority(device.type);
        const levelNodes = levels[priority];
        const indexInLevel = levelNodes.findIndex(n => n.id === node.id);
        const levelWidth = levelNodes.length * (nodeWidth + nodeGap);

        return {
            ...node,
            position: {
                x: (indexInLevel * (nodeWidth + nodeGap)) - levelWidth / 2 + 400,
                y: priority * levelGap
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
        };
    });

    return { nodes: layoutedNodes, edges };
};

const getDeviceColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'switch': return '#38bdf8';
        case 'router': return '#f472b6';
        case 'firewall': return '#ef4444';
        case 'server': return '#8b5cf6';
        case 'access-point': return '#4ade80';
        case 'patch-panel': return '#64748b';
        default: return '#94a3b8';
    }
};

const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'switch': return Network;
        case 'router': return RouterIcon;
        case 'firewall': return Shield;
        case 'server': return Server;
        case 'access-point': return Wifi;
        default: return Network;
    }
};

const CustomNode = ({ data }: any) => {
    const Icon = getDeviceIcon(data.device.type);
    const color = getDeviceColor(data.device.type);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: `2px solid ${color}`,
            borderRadius: '12px',
            padding: '16px',
            minWidth: '180px',
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px ${color}40`,
            backdropFilter: 'blur(8px)',
            position: 'relative'
        }}>
            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: color,
                    width: 12,
                    height: 12,
                    border: '2px solid white',
                    top: -6
                }}
            />
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: color,
                    width: 12,
                    height: 12,
                    border: '2px solid white',
                    bottom: -6
                }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                    background: `${color}20`,
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={20} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {data.device.name}
                    </div>
                    <div style={{
                        color: color,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600'
                    }}>
                        {data.device.type}
                    </div>
                </div>
            </div>
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '8px',
                fontSize: '11px',
                color: '#94a3b8'
            }}>
                <div style={{ fontFamily: 'monospace', marginBottom: '4px' }}>
                    {data.device.ipAddress || 'N/A'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {data.device.model}
                </div>
            </div>
            <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: data.device.status === 'online' ? '#4ade80' : '#ef4444',
                boxShadow: `0 0 8px ${data.device.status === 'online' ? '#4ade80' : '#ef4444'}`
            }} />
        </div>
    );
};

const nodeTypes = {
    custom: CustomNode,
};

export const NetworkMap = ({ devices }: NetworkMapProps) => {
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = devices
            .filter(d => d.type !== 'patch-panel' && d.type !== 'cable-manager' && d.type !== 'shelf')
            .map((device) => ({
                id: device.id,
                data: { device },
                position: { x: 0, y: 0 },
                type: 'custom',
            }));

        const edges: Edge[] = [];
        const addedEdges = new Set<string>();

        devices.forEach(sourceDev => {
            sourceDev.ports.forEach(port => {
                if (port.connectedTo && port.connectedTo.deviceId) {
                    const targetId = port.connectedTo.deviceId;
                    const targetDev = devices.find(d => d.id === targetId);
                    const targetPort = targetDev?.ports.find(p => p.id === port.connectedTo!.portId);
                    const edgeKey = [sourceDev.id, targetId].sort().join('-');

                    if (!addedEdges.has(edgeKey)) {
                        addedEdges.add(edgeKey);

                        const sourcePortLabel = port.label || `Puerto ${port.number}`;
                        const targetPortLabel = targetPort?.label || `Puerto ${port.connectedTo.portNumber}`;

                        edges.push({
                            id: `${sourceDev.id}-${targetId}-${port.id}`,
                            source: sourceDev.id,
                            target: targetId,
                            animated: true,
                            style: {
                                stroke: getDeviceColor(sourceDev.type),
                                strokeWidth: 3,
                                strokeDasharray: '0'
                            },
                            data: {
                                sourceDevice: sourceDev.name,
                                targetDevice: targetDev?.name || port.connectedTo.deviceName,
                                sourcePort: sourcePortLabel,
                                targetPort: targetPortLabel,
                                sourcePortNumber: port.number,
                                targetPortNumber: port.connectedTo.portNumber
                            },
                            label: `${sourcePortLabel} ↔ ${targetPortLabel}`,
                            labelStyle: {
                                fill: '#f8fafc',
                                fontSize: 10,
                                fontWeight: 600,
                                background: 'rgba(30, 41, 59, 0.95)',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${getDeviceColor(sourceDev.type)}40`
                            },
                            labelBgStyle: {
                                fill: 'rgba(30, 41, 59, 0.95)',
                                fillOpacity: 1
                            },
                            labelBgPadding: [8, 4],
                            labelBgBorderRadius: 6,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: getDeviceColor(sourceDev.type),
                                width: 20,
                                height: 20
                            },
                        });
                    }
                }
            });
        });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

        return {
            initialNodes: layoutedNodes,
            initialEdges: layoutedEdges
        };
    }, [devices]);

    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{
            width: '100%',
            height: '700px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '1rem',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
        }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    color="rgba(148, 163, 184, 0.1)"
                    gap={20}
                    size={2}
                />
                <Controls
                    style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px'
                    }}
                />
                <MiniMap
                    nodeColor={(node) => {
                        const device = node.data?.device as Device;
                        return device ? getDeviceColor(device.type) : '#94a3b8';
                    }}
                    maskColor="rgba(0, 0, 0, 0.7)"
                    style={{
                        background: 'rgba(30, 41, 59, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px'
                    }}
                />
            </ReactFlow>
        </div>
    );
};
