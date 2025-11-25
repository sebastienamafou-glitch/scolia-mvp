import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaMobileAlt, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// --- Types pour les données de frais ---
interface Fee {
    id: number;
    amountDue: number;
    amountPaid: number;
    dueDate: string;
    studentId: number;
}

// --- Props requises pour le composant ---
interface PaymentSubmissionFormProps {
    studentId: number;
    // Fonction pour forcer la mise à jour après un paiement (pour le ParentDashboard)
    onTransactionSubmitted: () => void; 
}

// =========================================================
// COMPOSANT PRINCIPAL
// =========================================================
export const PaymentSubmissionForm: React.FC<PaymentSubmissionFormProps> = ({ studentId, onTransactionSubmitted }) => {
    const [fee, setFee] = useState<Fee | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // États du formulaire de soumission
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [transactionReference, setTransactionReference] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

    // Charger le solde dû
    useEffect(() => {
        const fetchFee = async () => {
            try {
                setLoading(true);
                // Utilisation de la nouvelle route GET /payments/balance?studentId=X
                const response = await api.get(`/payments/balance?studentId=${studentId}`);
                setFee(response.data);
                // Pré-remplir le montant avec le solde restant (si disponible)
                if (response.data) {
                    const remaining = response.data.amountDue - response.data.amountPaid;
                    setTransactionAmount(Math.max(0, remaining));
                }
            } catch (err) {
                console.error("Erreur chargement frais :", err);
                setError("Impossible de charger l'échéancier des frais.");
            } finally {
                setLoading(false);
            }
        };
        fetchFee();
    }, [studentId]);

    // Fonction pour soumettre la référence
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitSuccess(null);
        setIsSubmitting(true);

        if (transactionAmount <= 0 || !transactionReference) {
            setError("Veuillez saisir un montant et une référence valides.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Utilisation de la nouvelle route POST /payments/submit
            await api.post('/payments/submit', {
                studentId,
                amount: transactionAmount,
                reference: transactionReference,
            });
            
            setSubmitSuccess(true);
            setTransactionReference(''); // Vider le champ
            onTransactionSubmitted(); // Mettre à jour le dashboard
            
        } catch (err) {
            console.error("Erreur soumission transaction :", err);
            setError("Erreur lors de la soumission de la référence. Veuillez réessayer.");
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Affichage du statut ---
    if (loading) return <p style={{ textAlign: 'center' }}>Chargement des frais...</p>;
    if (error && !fee) return <p style={{ color: '#D32F2F' }}>{error}</p>;
    if (!fee) return <p style={{ color: '#555' }}>Aucun frais de scolarité défini pour cet élève.</p>;
    
    // Calculs de base
    const totalDue = fee.amountDue;
    const totalPaid = fee.amountPaid;
    const remainingBalance = totalDue - totalPaid;
    const isPaid = remainingBalance <= 0;

    // --- NOUVEAU : Calculs pour la barre de progression ---
    const percentPaid = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;
    
    // Couleur dynamique de la barre
    let progressColor = '#D32F2F'; // Rouge (défaut/bas)
    if (percentPaid >= 50) progressColor = '#F77F00'; // Orange (moyen)
    if (percentPaid >= 100) progressColor = '#008F39'; // Vert (complet)

    // Styles de texte
    const statusStyle = isPaid 
        ? { color: '#388E3C', fontWeight: 'bold' } 
        : { color: '#D32F2F', fontWeight: 'bold' };

    return (
        <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '10px', 
            border: '1px solid #ddd' 
        }}>
            {/* SOLDE ACTUEL */}
            <h4 style={{ color: '#0A2240', marginTop: 0, borderBottom: '2px solid #0A2240', paddingBottom: '10px' }}>
                Statut Financier
            </h4>
            <p>
                Montant dû : <strong>{totalDue.toLocaleString('fr-FR')} FCFA</strong>
            </p>
            <p>
                Montant payé : <strong>{totalPaid.toLocaleString('fr-FR')} FCFA</strong>
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                <strong>Solde restant :</strong> <span style={statusStyle}>{Math.max(0, remainingBalance).toLocaleString('fr-FR')} FCFA</span>
            </p>

            {/* --- NOUVEAU : BARRE DE PROGRESSION --- */}
            <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                    <span>Progression</span>
                    <span>{percentPaid}% payé</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${percentPaid}%`, 
                        height: '100%', 
                        backgroundColor: progressColor, 
                        transition: 'width 0.5s ease-in-out' 
                    }}></div>
                </div>
            </div>
            {/* ------------------------------------- */}

            {/* MESSAGE DE PAIEMENT COMPLET */}
            {isPaid && (
                <div style={{ padding: '15px', backgroundColor: '#E8F5E9', color: '#388E3C', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheckCircle size={20} />
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Scolarité Payée Intégralement. Merci !</p>
                </div>
            )}
            
            {/* FORMULAIRE DE SOUMISSION (SI EN ATTENTE/PARTIEL) */}
            {!isPaid && (
                <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0A2240' }}>
                        <FaMobileAlt /> Option 1 : Paiement Mobile Money
                    </h5>
                    
                    {/* INSTRUCTIONS CI */}
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>
                        1. Effectuez votre transfert sur l'un des numéros suivants :
                    </p>
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px', fontSize: '0.9rem' }}>
                        <li><strong>Orange Money :</strong> <strong>+225 07 00 00 00 00</strong> (Nom de l'école : Scolia CI)</li>
                        <li><strong>MTN Mobile Money :</strong> <strong>+225 05 00 00 00 00</strong></li>
                        <li><strong>Moov Money :</strong> <strong>+225 01 00 00 00 00</strong></li>
                    </ul>
                    
                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        2. Soumettez la référence de transaction ci-dessous pour validation par l'administration.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                        
                        <label>
                            Montant du Versement (FCFA):
                            <input
                                type="number"
                                value={transactionAmount}
                                onChange={(e) => setTransactionAmount(Number(e.target.value))}
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }}
                            />
                        </label>
                        
                        <label>
                            Référence Mobile Money / N° de Transaction :
                            <input
                                type="text"
                                value={transactionReference}
                                onChange={(e) => setTransactionReference(e.target.value)}
                                placeholder="Ex: XXXXXXX (Référence reçue par SMS après transfert)"
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px' }}
                            />
                        </label>

                        {error && <p style={{ color: '#D32F2F', margin: 0 }}>{error}</p>}
                        {submitSuccess === true && (
                            <div style={{ color: '#388E3C', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaCheckCircle size={14} /> Soumission réussie ! En attente de validation Admin.
                            </div>
                        )}
                        {submitSuccess === false && (
                            <div style={{ color: '#D32F2F', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaExclamationTriangle size={14} /> Erreur de soumission.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || isPaid}
                            style={{ 
                                padding: '12px', 
                                backgroundColor: isPaid ? '#ccc' : '#F77F00', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '5px', 
                                cursor: isSubmitting || isPaid ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {isSubmitting ? 'Envoi...' : 'Soumettre la Référence pour Validation'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
