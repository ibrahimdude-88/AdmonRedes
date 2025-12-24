import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { DeviceTemplate } from '../types';

export const useTemplates = () => {
    const [templates, setTemplates] = useState<DeviceTemplate[]>([]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'templates'), (snapshot) => {
            const templatesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DeviceTemplate[];
            setTemplates(templatesData);
        });

        return () => unsubscribe();
    }, []);

    const addTemplate = async (templateData: Omit<DeviceTemplate, 'id' | 'createdAt'>) => {
        const newTemplateData = {
            ...templateData,
            createdAt: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, 'templates'), newTemplateData);
        return { id: docRef.id, ...newTemplateData } as DeviceTemplate;
    };

    const deleteTemplate = async (id: string) => {
        await deleteDoc(doc(db, 'templates', id));
    };

    const updateTemplate = async (id: string, updates: Partial<DeviceTemplate>) => {
        const docRef = doc(db, 'templates', id);
        // Only update fields that are provided
        const { id: _, createdAt: __, ...dataToUpdate } = updates as any;
        await updateDoc(docRef, dataToUpdate);
    };

    return { templates, addTemplate, deleteTemplate, updateTemplate };
};
