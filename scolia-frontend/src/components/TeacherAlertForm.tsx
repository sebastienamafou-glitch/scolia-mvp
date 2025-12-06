import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast'; // Import Toast
import { FaPaperPlane } from 'react-icons/fa';

// Utilise un named export pour correspondre à l'import dans TeacherDashboard.tsx
export const TeacherAlertForm: React.FC = () => {
    const [alertType, setAlertType] = useState<'Retard' | 'Absence'>('Retard');
    const [details, setDetails] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                type: alertType,
                details: details || `Déclaration de ${alertType.toLowerCase()}.`,
                duration: alertType === 'Retard' ? Number(duration) : undefined,
            };

            const res = await api.post('/notifications/alert-teacher', body);
            
            // UX: Toast Succès
            toast.success(res.data.message || 'Alerte envoyée à l\'administration.');
            
            // Reset form
            setDetails('');
            setDuration('');
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'envoi de l'alerte.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Déclaration d'Indisponibilité</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Type d'Alerte */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <label style={{ fontWeight: 'bold' }}>Type d'absence :</label>
                    <button 
                        type="button"
                        onClick={() => setAlertType('Retard')}
                        style={alertType === 'Retard' ? activeBtnStyle : inactiveBtnStyle}
                    >
                        Retard
                    </button>
                    <button 
                        type="button"
                        onClick={() => setAlertType('Absence')}
                        style={alertType === 'Absence' ? activeBtnStyle : inactiveBtnStyle}
                    >
                        Absence (Journée / Cours)
                    </button>
                </div>
                
                {/* Détails et Durée */}
                <textarea
                    placeholder="Raison détaillée (ex: Problème de transport, Rendez-vous médical)"
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    required
                    style={inputStyle}
                />
                
                {alertType === 'Retard' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="number"
                            placeholder="Durée du retard (minutes)"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            required
                            style={{ ...inputStyle, maxWidth: '200px' }}
                        />
                        <span style={{ color: '#666' }}>minutes</span>
                    </div>
                )}

                <button type="submit" disabled={loading} style={{ ...submitBtnStyle, opacity: loading ? 0.7 : 1 }}>
                    <FaPaperPlane /> {loading ? 'Envoi...' : 'Notifier l\'École'}
                </button>
            </form>
        </div>
    );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' as const };
const activeBtnStyle = { padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const inactiveBtnStyle = { padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', cursor: 'pointer' };
const submitBtnStyle = { padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#0A2240', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
