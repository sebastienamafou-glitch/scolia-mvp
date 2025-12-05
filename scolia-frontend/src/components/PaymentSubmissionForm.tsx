import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

interface Fee {
    id: number;
    amountDue?: number;   
    totalAmount?: number; 
    amountPaid: number;
    dueDate?: string;
    studentId: number;
}

interface PaymentSubmissionFormProps {
    studentId: number;
    onTransactionSubmitted: () => void; 
}

export const PaymentSubmissionForm: React.FC<PaymentSubmissionFormProps> = ({ studentId, onTransactionSubmitted }) => {
    const [fee, setFee] = useState<Fee | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [transactionAmount, setTransactionAmount] = useState<number>(0);
    const [transactionReference, setTransactionReference] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchFee = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/payments/balance?studentId=${studentId}`);
                const data = response.data;
                setFee(data);
                
                if (data) {
                    const total = data.amountDue ?? data.totalAmount ?? 0;
                    const paid = data.amountPaid ?? 0;
                    const remaining = total - paid;
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
            await api.post('/payments/submit', {
                studentId,
                amount: transactionAmount,
                reference: transactionReference,
            });
            
            setSubmitSuccess(true);
            setTransactionReference('');
            onTransactionSubmitted(); 
            
        } catch (err) {
            console.error("Erreur soumission transaction :", err);
            setError("Erreur lors de la soumission. Vérifiez votre connexion.");
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p style={{ textAlign: 'center', color: '#666' }}>Chargement des données financières...</p>;
    if (error && !fee) return <p style={{ color: '#D32F2F' }}>{error}</p>;
    
    // Sécurité : Si pas de frais configurés
    if (!fee) return <div style={{ padding:'20px', color: '#555', border:'1px solid #eee', borderRadius:'8px' }}>Aucun échéancier trouvé pour cet élève.</div>;
    
    // Calculs sécurisés (0 par défaut)
    const totalDue = fee.totalAmount ?? fee.amountDue ?? 0;
    const totalPaid = fee.amountPaid ?? 0;
    const remainingBalance = totalDue - totalPaid;
    const isPaid = remainingBalance <= 0;

    const percentPaid = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;
    
    let progressColor = '#D32F2F'; 
    if (percentPaid >= 50) progressColor = '#F77F00'; 
    if (percentPaid >= 100) progressColor = '#008F39'; 

    const statusStyle = isPaid 
        ? { color: '#388E3C', fontWeight: 'bold' } 
        : { color: '#D32F2F', fontWeight: 'bold' };

    return (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
            <h4 style={{ color: '#0A2240', marginTop: 0, borderBottom: '2px solid #0A2240', paddingBottom: '10px' }}>
                Statut Financier
            </h4>
            <p>Montant dû : <strong>{totalDue.toLocaleString('fr-FR')} FCFA</strong></p>
            <p>Montant payé : <strong>{totalPaid.toLocaleString('fr-FR')} FCFA</strong></p>
            <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                <strong>Solde restant :</strong> <span style={statusStyle}>{Math.max(0, remainingBalance).toLocaleString('fr-FR')} FCFA</span>
            </p>

            <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
                    <span>Progression</span>
                    <span>{percentPaid}% payé</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentPaid}%`, height: '100%', backgroundColor: progressColor, transition: 'width 0.5s ease-in-out' }}></div>
                </div>
            </div>

            {isPaid && (
                <div style={{ padding: '15px', backgroundColor: '#E8F5E9', color: '#388E3C', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheckCircle size={20} />
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Scolarité Payée Intégralement. Merci !</p>
                </div>
            )}
            
            {!isPaid && (
                <div style={{ marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0A2240' }}>
                        <FaMobileAlt /> Paiement Mobile Money
                    </h5>
                    
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                        <li><strong>Orange / MTN / Moov</strong> : Effectuez le transfert.</li>
                        <li>Soumettez l'ID de transaction ci-dessous.</li>
                    </ul>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                        <label>
                            Montant (FCFA):
                            <input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(Number(e.target.value))} required style={inputStyle} />
                        </label>
                        <label>
                            Référence Transaction :
                            <input type="text" value={transactionReference} onChange={(e) => setTransactionReference(e.target.value)} placeholder="Ex: CI2305..." required style={inputStyle} />
                        </label>

                        {error && <p style={{ color: '#D32F2F', margin: 0 }}>{error}</p>}
                        {submitSuccess === true && <div style={{ color: '#388E3C', fontWeight: 'bold' }}><FaCheckCircle /> Soumis avec succès !</div>}
                        
                        <button type="submit" disabled={isSubmitting} style={buttonStyle}>
                            {isSubmitting ? 'Envoi...' : 'Valider'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', marginTop: '5px', boxSizing: 'border-box' as const };
const buttonStyle = { padding: '12px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
