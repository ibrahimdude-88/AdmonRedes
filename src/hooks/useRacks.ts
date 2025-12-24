import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Rack } from '../types';

export const useRacks = () => {
    const [racks, setRacks] = useState<Rack[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'racks'), (snapshot) => {
            const racksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Rack[];
            setRacks(racksData);
        });

        return () => unsubscribe();
    }, []);

    const addRack = async (rack: Omit<Rack, 'id' | 'createdAt'>) => {
        const newRackData = {
            ...rack,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'racks'), newRackData);
        return { id: docRef.id, ...newRackData } as Rack;
    };

    const deleteRack = async (id: string) => {
        await deleteDoc(doc(db, 'racks', id));
    };

    const updateRack = async (id: string, updates: Partial<Rack>) => {
        await updateDoc(doc(db, 'racks', id), updates);
    };

    const getBranchRacks = (branchId: string) => {
        return racks.filter(r => r.branchId === branchId);
    };

    return { racks, addRack, deleteRack, updateRack, getBranchRacks };
};
