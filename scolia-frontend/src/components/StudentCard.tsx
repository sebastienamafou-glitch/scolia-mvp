// scolia-frontend/src/components/StudentCard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast'; // 👈 UX Moderne

// Définition d'une interface partielle pour ce dont on a besoin ici
interface Student {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
  infosMedicales?: string;
  class?: {
      id: number;
      name: string;
  };
}

interface StudentCardProps {
  student: Student; 
  onClose: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClose }) => {
  const [amountDue, setAmountDue] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [loadingFee, setLoadingFee] = useState(false);

  useEffect(() => {
    const loadFee = async () => {
        setLoadingFee(true);
        try {
            const res = await api.get(`/payments/balance?studentId=${student.id}`);
            if (res.data) {
                setAmountDue(res.data.amountDue);
                setAmountPaid(res.data.amountPaid);
                // Gestion sécurisée de la date
                const date = new Date(res.data.dueDate);
                if (!isNaN(date.getTime())) {
                    setDueDate(date.toISOString().split('T')[0]);
                }
            }
        } catch (e) {
            // C'est normal si pas de frais, on ne spamme pas la console
            console.log("Info: Pas encore de frais définis pour cet élève.");
        } finally {
            setLoadingFee(false);
        }
    };
    if (student) loadFee();
  }, [student]);

  const handleSaveFee = async () => {
    if (!amountDue || !dueDate) {
        toast.error("Veuillez remplir le montant et la date limite.");
        return;
    }
    
    // Validation basique
    if (Number(amountDue) < 0) {
        toast.error("Le montant ne peut pas être négatif.");
        return;
    }

    try {
        await api.post('/payments/fees', {
            studentId: student.id,
            amountDue: Number(amountDue),
            dueDate: dueDate
        });
        toast.success("✅ Scolarité définie avec succès !");
        onClose(); // Optionnel : Fermer la modale après succès
    } catch (error) {
        console.error(error);
        toast.error("Erreur lors de la sauvegarde.");
    }
  };

  if (!student) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      backdropFilter: 'blur(3px)' // Petit effet flou sympa
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: 'white', borderRadius: '15px', width: '90%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }} onClick={e => e.stopPropagation()}>

        <div style={{ backgroundColor: '#0A2240', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Fiche : {student.prenom} {student.nom}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ padding: '25px' }}>
        
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <p><strong>Classe :</strong> {student.class?.name || 'Non assigné'}</p> 
                <p><strong>Email :</strong> {student.email || 'Non renseigné'}</p>

                {student.infosMedicales && (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#FFEBEE', color: '#D32F2F', borderRadius: '5px', borderLeft: '4px solid #D32F2F' }}>
                        <strong>⚠️ Santé/Infos Médicales :</strong> {student.infosMedicales}
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: '#F9F9F9', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
                <h3 style={{ color: '#F77F00', marginTop: 0 }}>💰 Configuration Scolarité</h3>
                
                {loadingFee ? <p>Chargement...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Montant Total Annuel (FCFA)</label>
                            <input 
                                type="number" 
                                value={amountDue} 
                                onChange={e => setAmountDue(e.target.value)}
                                placeholder="ex: 150000"
                                min="0"
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Date Limite</label>
                            <input 
                                type="date" 
                                value={dueDate} 
                                onChange={e => setDueDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
                            />
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                                Déjà payé : <strong>{Number(amountPaid).toLocaleString()} FCFA</strong>
                            </div>
                            <button 
                                onClick={handleSaveFee}
                                style={{ backgroundColor: '#008F39', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};
