// scolia-frontend/src/pages/ParentDashboard.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; 

// --- Définitions de types ---
interface Student {
  id: number;
  nom: string;
  prenom: string;
  classe: string;
  photoUrl?: string; // Nouveau champ optionnel
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
      const childrenResponse = await api.get('/students/my-children');
      const studentList = childrenResponse.data as Student[];
      setChildren(studentList); 

      const dataPromises = studentList.map(async (student) => {
        const notes = [ 
            { matiere: 'Maths', note: 15, sur: 20, evaluation: 'DS' }, 
            { matiere: 'Français', note: 13, sur: 20, evaluation: 'Oral' } 
        ];
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
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStyle = (statut: Payment['statut']) => {
    switch (statut) {
      case 'Payé': return { color: '#008F39', fontWeight: 'bold' }; 
      case 'En attente': return { color: '#F77F00', fontWeight: 'bold' }; 
      default: return { color: 'red', fontWeight: 'bold' };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Chargement des données...</div>;
  }
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#F4F6F8', minHeight: '100vh' }}>
      <h1 style={{ color: '#0A2240', marginBottom: '30px' }}>Tableau de Bord {userRole}</h1>
      
      {children.length === 0 && <p style={{ color: '#0A2240' }}>Aucun enfant trouvé pour ce compte.</p>}

      {children.map(student => (
        <div key={student.id} style={{ 
            backgroundColor: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
            marginBottom: '25px',
            padding: '20px',
            border: '1px solid #eee'
        }}>
            {/* --- EN-TÊTE ENFANT AVEC PHOTO --- */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                borderBottom: '2px solid #F0F0F0', 
                paddingBottom: '15px',
                marginBottom: '20px'
            }}>
                {/* LA PHOTO (Ou Avatar généré) */}
                <img 
                    src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.prenom}+${student.nom}&background=0A2240&color=fff&size=128&bold=true`} 
                    alt={`${student.prenom} ${student.nom}`}
                    style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '2px solid #F77F00', // Petit contour orange stylé
                        padding: '2px' 
                    }}
                />
                
                <div>
                    <h2 style={{ color: '#0A2240', margin: 0, fontSize: '1.2rem' }}>
                        {student.prenom} {student.nom}
                    </h2>
                    <span style={{ backgroundColor: '#E3F2FD', color: '#0A2240', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        Classe : {student.classe}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* CARTE NOTES */}
                <div style={{ backgroundColor: '#FAFAFA', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ color: '#0A2240', marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>📝 Dernières Notes</h3>
                    {data[student.id] && data[student.id].notes.map((note: Note, index: number) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: '500' }}>{note.matiere} <span style={{color:'#999', fontSize:'0.8em'}}>({note.evaluation})</span></span>
                            <span style={{ fontWeight: 'bold', color: note.note >= 10 ? '#008F39' : '#D32F2F' }}>
                                {note.note}/{note.sur}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CARTE ABSENCES */}
                <div style={{ backgroundColor: '#FFF4E5', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ color: '#F77F00', marginTop: 0, borderBottom: '1px solid #FFCC80', paddingBottom: '5px' }}>🔔 Vie Scolaire</h3>
                    <p style={{ color: '#D32F2F', fontWeight: 'bold', margin: '10px 0' }}>🔴 2 Absences non justifiées</p>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>Dernière : 15 Nov (Maths)</p>
                </div>

                {/* CARTE FINANCE */}
                <div style={{ backgroundColor: '#F4F6F8', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ color: '#555', marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>💰 Scolarité</h3>
                    {data[student.id] && (
                        <>
                            <p style={{ marginBottom: '10px' }}>2ème Trimestre : <span style={getPaymentStyle(data[student.id].payments.statut)}>
                                {data[student.id].payments.statut}
                            </span></p>

                            {data[student.id].payments.statut === 'En attente' && (
                                <button style={{ width: '100%', backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Payer maintenant
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
