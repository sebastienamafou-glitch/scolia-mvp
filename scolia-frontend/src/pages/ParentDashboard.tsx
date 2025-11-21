// scolia-frontend/src/pages/ParentDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; 

// --- Définitions de types pour la lisibilité ---
interface Student {
  id: number;
  nom: string;
  prenom: string;
  classe: string;
}

interface Note {
  matiere: string;
  note: number;
  sur: number;
  evaluation: string;
}

interface Payment {
  trimestre: number;
  statut: 'Payé' | 'En attente' | 'Partiel';
}

interface StudentData {
  notes: Note[];
  payments: Payment;
  studentId: number; 
}

type StudentDataMap = Record<number, StudentData>;


const ParentDashboard: React.FC = () => {
  const { userRole } = useAuth();
  const [children, setChildren] = useState<Student[]>([]);
  const [data, setData] = useState<StudentDataMap>({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Récupérer la liste des enfants (API Call: GET /students/my-children)
      const childrenResponse = await api.get('/students/my-children');
      const studentList = childrenResponse.data as Student[];
      
      setChildren(studentList); 

      // 2. Traitement des données agrégées (simulées)
      const dataPromises = studentList.map(async (student) => {
        // --- SIMULATION DE DONNÉES ---
        const notes = [ 
            { matiere: 'Maths', note: 15, sur: 20, evaluation: 'DS' }, 
            { matiere: 'Français', note: 13, sur: 20, evaluation: 'Oral' } 
        ];
        // Alternance de statut pour les deux enfants
        const payments = student.id % 2 === 1 ? 
            { trimestre: 2, statut: 'Payé' } : 
            { trimestre: 2, statut: 'En attente' }; 
        
        return { studentId: student.id, notes, payments } as StudentData; 
      });

      const results = await Promise.all(dataPromises);
      
      const studentDataMap = results.reduce(
          (acc: StudentDataMap, current: StudentData) => {
              acc[current.studentId] = current;
              return acc;
          }, 
          {} as StudentDataMap
      );
      
      setData(studentDataMap);

    } catch (error) {
      console.error('Erreur de chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };


  // Fonction d'affichage du statut de paiement
  const getPaymentStyle = (statut: Payment['statut']) => {
    switch (statut) {
      case 'Payé': return { color: '#008F39', fontWeight: 'bold' }; 
      case 'En attente': return { color: '#F77F00', fontWeight: 'bold' }; 
      default: return { color: 'red', fontWeight: 'bold' };
    }
  };

  // AFFICHAGE DU CHARGEMENT
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement des données...</div>;
  }
  
  // Affichage du Dashboard
  return (
    <div style={{ padding: '20px', backgroundColor: '#F4F6F8' }}>
      <h1 style={{ color: '#0A2240' }}>Tableau de Bord {userRole}</h1>
      
      {/* VÉRIFICATION SI AUCUN ENFANT TROUVÉ */}
      {children.length === 0 && <p style={{ color: '#0A2240' }}>Aucun enfant trouvé pour ce compte.</p>}

      {children.map(student => (
        <div key={student.id} style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
            marginBottom: '25px',
            padding: '20px'
        }}>
            {/* EN-TÊTE ENFANT */}
            <h2 style={{ color: '#0A2240', borderBottom: '2px solid #0A2240', paddingBottom: '10px' }}>
                {student.prenom} {student.nom} - {student.classe}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                
                {/* CARTE N°1 : NOTES RÉCENTES */}
                <div style={{ borderLeft: '3px solid #0A2240', paddingLeft: '15px' }}>
                    <h3 style={{ color: '#0A2240' }}>Dernières Notes</h3>
                    {data[student.id] && data[student.id].notes.map((note: Note, index: number) => (
                        <p key={index} style={{ margin: '5px 0', color: '#333' }}>
                            {note.matiere} : <span style={note.note > (note.sur / 2) ? {color: '#008F39'} : {color: 'red'}}>{note.note}/{note.sur}</span> 
                            <small> ({note.evaluation})</small>
                        </p>
                    ))}
                </div>

                {/* CARTE N°2 : ABSENCES ET COMMUNICATIONS */}
                <div style={{ borderLeft: '3px solid #F77F00', paddingLeft: '15px' }}>
                    <h3 style={{ color: '#F77F00' }}>Alertes & Absences</h3>
                    <p style={{ color: 'red', fontWeight: 'bold' }}>🔴 Absence non justifiée : 2/11</p>
                    <p style={{ color: '#333' }}>📧 Message de l'école : Réunion annulée.</p>
                </div>

                {/* CARTE N°3 : SUIVI FINANCIER */}
                <div style={{ borderLeft: '3px solid gray', paddingLeft: '15px' }}>
                    <h3 style={{ color: 'gray' }}>Frais de Scolarité</h3>
                    {data[student.id] && (
                        <>
                            <p style={{ color: '#333' }}>Trimestre 2 : <span style={getPaymentStyle(data[student.id].payments.statut)}>
                                {data[student.id].payments.statut}
                            </span></p>

                            {data[student.id].payments.statut === 'En attente' && (
                                <button style={{ backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', marginTop: '10px', cursor: 'pointer' }}>
                                    Payer par Mobile Money
                                </button>
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
      ))}
    </div>
  );
};

export default ParentDashboard;
