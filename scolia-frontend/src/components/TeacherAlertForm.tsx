import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast'; // Utilisation corrigée plus bas
import { FaPaperPlane } from 'react-icons/fa';

export const TeacherAlertForm: React.FC = () => {
    const [alertType, setAlertType] = useState<'Retard' | 'Absence'>('Retard');
    const [details, setDetails] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(false);
    // ✅ CORRECTION : Ajout de l'état success
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const durationNum = duration ? Number(duration) : 0;

            const body = {
                type: alertType,
                details: details || `Déclaration de ${alertType.toLowerCase()}.`,
                duration: alertType === 'Retard' && durationNum > 0 ? durationNum : undefined,
            };

            const res = await api.post('/notifications/alert-teacher', body);
            
            setSuccess(res.data.message);
            toast.success("Alerte envoyée à l'administration !"); // ✅ Utilisation de toast
            setDetails('');
            setDuration('');
        } catch (error) {
            // ✅ Utilisation de toast au lieu de alert
            toast.error("Erreur lors de l'envoi de l'alerte.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginTop: 0, color: '#dc3545' }}>⚠️ Déclaration d'Indisponibilité</h2>
            
            {success && <div style={{ color: 'green', marginBottom: '15px' }}>✅ {success}</div>}

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
                    rows={3}
                />
                
                {alertType === 'Retard' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="number"
                            placeholder="Durée (minutes)"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            required
                            min="1"
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

const inputStyle: React.CSSProperties = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' };
const activeBtnStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: '#dc3545', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const inactiveBtnStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: '20px', border: '1px solid #ccc', backgroundColor: 'white', color: '#333', cursor: 'pointer' };
const submitBtnStyle: React.CSSProperties = { padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#0A2240', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' };
