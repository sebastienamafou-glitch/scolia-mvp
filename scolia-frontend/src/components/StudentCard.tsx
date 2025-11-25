import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface StudentCardProps {
  student: any; // On utilise any pour simplifier l'intégration rapide, ou votre interface Student
  onClose: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClose }) => {
  // États pour la finance
  const [amountDue, setAmountDue] = useState('');
  const [amountPaid, setAmountPaid] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [loadingFee, setLoadingFee] = useState(false);

  // Charger les infos financières à l'ouverture
  useEffect(() => {
    const loadFee = async () => {
        setLoadingFee(true);
        try {
            const res = await api.get(`/payments/balance?studentId=${student.id}`);
            if (res.data) {
                setAmountDue(res.data.amountDue);
                setAmountPaid(res.data.amountPaid);
                // Formater la date pour l'input type="date" (YYYY-MM-DD)
                const date = new Date(res.data.dueDate);
                setDueDate(date.toISOString().split('T')[0]);
            }
        } catch (e) {
            console.log("Pas encore de frais définis");
        } finally {
            setLoadingFee(false);
        }
    };
    loadFee();
  }, [student.id]);

  const handleSaveFee = async () => {
    if (!amountDue || !dueDate) return alert("Veuillez remplir le montant et la date limite.");
    
    try {
        await api.post('/payments/fees', {
            studentId: student.id,
            amountDue: Number(amountDue),
            dueDate: dueDate
        });
        alert("✅ Scolarité définie avec succès !");
    } catch (error) {
        alert("Erreur lors de la sauvegarde.");
    }
  };

  if (!student) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: 'white', borderRadius: '15px', width: '90%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={{ backgroundColor: '#0A2240', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Fiche : {student.prenom} {student.nom}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ padding: '25px' }}>
            
            {/* INFO ÉLÈVE (Existantes) */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <p><strong>Classe :</strong> {student.classe || student.class?.name || 'Non assigné'}</p>
                <p><strong>Email :</strong> {student.email}</p>
            </div>

            {/* --- SECTION FINANCE (AJOUT) --- */}
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

                        <div style={{ gridColumn: '1 / -1', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.9rem' }}>
                                Déjà payé : <strong>{amountPaid.toLocaleString()} FCFA</strong>
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
