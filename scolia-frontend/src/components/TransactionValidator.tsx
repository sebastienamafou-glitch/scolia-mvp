import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Student {
    nom: string;
    prenom: string;
}

interface Transaction {
    id: number;
    amount: number;
    mobileMoneyReference: string;
    status: 'Pending' | 'Validated' | 'Rejected';
    transactionDate: string;
    student: Student;
}

export const TransactionValidator: React.FC = () => {
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payments/pending');
            setPendingTransactions(res.data || []);
        } catch (e) {
            console.error(e);
            toast.error("Erreur de chargement des transactions.");
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (id: number, action: 'validate' | 'reject') => {
        if (!window.confirm(`Confirmez-vous de ${action === 'validate' ? 'VALIDER' : 'REJETER'} cette transaction ?`)) {
            return;
        }

        const toastId = toast.loading("Traitement en cours...");

        try {
            await api.patch(`/payments/validate/${id}`, { action }); 
            
            toast.success(`Transaction ${id} ${action === 'validate' ? 'validée' : 'rejetée'} !`, { id: toastId });
            
            // ✅ AMÉLIORATION OPTIMISTIC UI : Suppression locale immédiate
            setPendingTransactions(prev => prev.filter(t => t.id !== id));
            
        } catch (e) {
            // En cas d'échec de l'API, on doit recharger pour remettre l'élément dans la liste
            setStatusMessage("Opération échouée. Vérifiez le solde de l'élève ou le serveur.");
            fetchTransactions(); 
        }
    };

    if (loading) return <p style={{ padding: '20px' }}>Chargement des transactions en attente...</p>;

    return (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color: '#F77F00', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>
                💰 Validation des Paiements ({pendingTransactions.length})
            </h2>
            
            {statusMessage && <div style={{ color: '#D32F2F', marginBottom: '15px' }}>{statusMessage}</div>}

            {pendingTransactions.length === 0 ? (
                <p style={{ color: '#555', fontStyle: 'italic', padding: '10px 0' }}>Aucune transaction en attente de validation.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0A2240', color: 'white' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Élève</th>
                                <th style={{ padding: '12px' }}>Montant</th>
                                <th style={{ padding: '12px' }}>Référence MM</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingTransactions.map(t => (
                                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', fontSize: '0.9rem', color: '#666' }}>
                                        {new Date(t.transactionDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>{t.student.prenom} <strong>{t.student.nom}</strong></td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.amount.toLocaleString('fr-FR')} FCFA</td>
                                    <td style={{ padding: '12px', fontSize: '0.9rem' }}>{t.mobileMoneyReference}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleValidation(t.id, 'validate')}
                                            style={{ backgroundColor: '#008F39', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', marginRight: '8px', cursor: 'pointer' }}
                                        >
                                            Valider
                                        </button>
                                        <button 
                                            onClick={() => handleValidation(t.id, 'reject')}
                                            style={{ backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                                        >
                                            Rejeter
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
