import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Device } from '../types';

export const useDevices = () => {
    const [devices, setDevices] = useState<Device[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'devices'), (snapshot) => {
            const devicesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Device[];
            setDevices(devicesData);
        });

        return () => unsubscribe();
    }, []);

    const addDevice = async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newDeviceData = {
            ...device,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'devices'), newDeviceData);
        return { id: docRef.id, ...newDeviceData } as Device;
    };

    const updateDevice = async (id: string, updates: Partial<Device>) => {
        await updateDoc(doc(db, 'devices', id), {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    };

    const deleteDevice = async (id: string) => {
        await deleteDoc(doc(db, 'devices', id));
    };

    const getDevice = (id: string) => {
        return devices.find((device) => device.id === id);
    };

    const connectPorts = async (
        sourceDeviceId: string,
        sourcePortId: string,
        targetDeviceId: string,
        targetPortId: string
    ) => {
        const sourceDevice = devices.find((d) => d.id === sourceDeviceId);
        const targetDevice = devices.find((d) => d.id === targetDeviceId);

        if (!sourceDevice || !targetDevice) return;

        const sourcePort = sourceDevice.ports.find((p) => p.id === sourcePortId);
        const targetPort = targetDevice.ports.find((p) => p.id === targetPortId);

        if (!sourcePort || !targetPort) return;

        // Update source device
        await updateDevice(sourceDeviceId, {
            ports: sourceDevice.ports.map((p) =>
                p.id === sourcePortId
                    ? {
                        ...p,
                        connectedTo: {
                            deviceId: targetDeviceId,
                            deviceName: targetDevice.name,
                            portId: targetPortId,
                            portNumber: targetPort.number,
                        },
                    }
                    : p
            ),
        });

        // Update target device
        await updateDevice(targetDeviceId, {
            ports: targetDevice.ports.map((p) =>
                p.id === targetPortId
                    ? {
                        ...p,
                        connectedTo: {
                            deviceId: sourceDeviceId,
                            deviceName: sourceDevice.name,
                            portId: sourcePortId,
                            portNumber: sourcePort.number,
                        },
                    }
                    : p
            ),
        });
    };

    const disconnectPort = async (deviceId: string, portId: string) => {
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return;

        const port = device.ports.find((p) => p.id === portId);
        if (!port || !port.connectedTo) return;

        // Disconnect from target device
        const targetDevice = devices.find((d) => d.id === port.connectedTo!.deviceId);
        if (targetDevice) {
            await updateDevice(targetDevice.id, {
                ports: targetDevice.ports.map((p) =>
                    p.id === port.connectedTo!.portId ? { ...p, connectedTo: null as any } : p
                ),
            });
        }

        // Disconnect from source device
        await updateDevice(deviceId, {
            ports: device.ports.map((p) =>
                p.id === portId ? { ...p, connectedTo: null as any } : p
            ),
        });
    };

    return {
        devices,
        addDevice,
        updateDevice,
        deleteDevice,
        getDevice,
        connectPorts,
        disconnectPort,
    };
};
