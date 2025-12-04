// scolia-frontend/src/components/ClassManager.tsx

import React, { useState } from 'react';
import api from '../services/api';

interface ClassManagerProps {
    onClassCreated?: () => void; // On déclare la fonction reçue
}

export const ClassManager: React.FC<ClassManagerProps> = ({ onClassCreated }) => {
    const [newClassName, setNewClassName] = useState('');

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/classes', { name: newClassName });
            alert(`✅ Classe "${newClassName}" créée !`);
            setNewClassName('');
            
            // 👇 On active le rafraîchissement si la fonction existe
            if (onClassCreated) {
                onClassCreated();
            }

        } catch (error) {
            alert("Erreur lors de la création de la classe.");
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
            <h2 style={{ color: '#0A2240', marginTop: 0 }}>🏫 Gestion des Classes</h2>
            
            <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    placeholder="Nom (ex: 6ème A)" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                    style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Ajouter
                </button>
            </form>

            <div style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem' }}>
                ℹ️ Les nouvelles classes apparaîtront immédiatement dans le formulaire d'inscription.
            </div>
        </div>
    );
};
