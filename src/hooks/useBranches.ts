import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import type { Branch } from '../types';

export const useBranches = () => {
    const [branches, setBranches] = useState<Branch[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'branches'), (snapshot) => {
            const branchesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Branch[];
            setBranches(branchesData);
        });

        return () => unsubscribe();
    }, []);

    const addBranch = async (branchData: Omit<Branch, 'id' | 'createdAt'>) => {
        const newBranchData = {
            ...branchData,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'branches'), newBranchData);
        return { id: docRef.id, ...newBranchData } as Branch;
    };

    const deleteBranch = async (id: string) => {
        await deleteDoc(doc(db, 'branches', id));
    };

    const getBranch = (id: string) => branches.find(b => b.id === id);

    return { branches, addBranch, deleteBranch, getBranch };
};
