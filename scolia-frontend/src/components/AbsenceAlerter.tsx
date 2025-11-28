// scolia-frontend/src/components/AbsenceAlerter.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

export const AbsenceAlerter: React.FC = () => {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<number[]>([]);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Charger les classes du professeur
    useEffect(() => {
        // Supposons qu'il existe une route pour lister les classes du prof
        api.get('/classes/my-classes').then(res => setClasses(res.data)); 
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClasses.length === 0 || !date || !reason) {
            alert("Veuillez sélectionner au moins une classe, la date et la raison.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/absences/alert', { 
                date, 
                reason, 
                classes: selectedClasses 
            });
            alert('✅ Alerte envoyée avec succès aux élèves et parents concernés !');
            setReason('');
            setSelectedClasses([]);
        } catch (err) {
            alert("Échec de l'envoi de l'alerte.");
        } finally {
            setLoading(false);
        }
    };
    
    // Fonction pour gérer la sélection multiple de classes
    const toggleClassSelection = (classId: number) => {
        setSelectedClasses(prev => 
            prev.includes(classId) 
                ? prev.filter(id => id !== classId)
                : [...prev, classId]
        );
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                
                {/* DATE */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date d'absence</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle} />
                </div>

                {/* CLASSES CONCERNÉES */}
                <div>
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Classes à notifier ({selectedClasses.length})</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {classes.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => toggleClassSelection(c.id)}
                                style={{
                                    padding: '8px 12px', borderRadius: '20px', border: selectedClasses.includes(c.id) ? '2px solid #D32F2F' : '1px solid #ccc',
                                    backgroundColor: selectedClasses.includes(c.id) ? '#FFEBEE' : 'white',
                                    color: selectedClasses.includes(c.id) ? '#D32F2F' : '#333',
                                    cursor: 'pointer'
                                }}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RAISON */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Justification / Message</label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} required placeholder="Ex: Rendez-vous médical imprévu." style={{ ...inputStyle, minHeight: '80px' }} />
                </div>

                {/* BOUTON ENVOI */}
                <button type="submit" disabled={loading} style={{ padding: '12px', backgroundColor: '#D32F2F', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Envoi des notifications...' : 'Notifier élèves & parents'}
                </button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', boxSizing: 'border-box' as const };
