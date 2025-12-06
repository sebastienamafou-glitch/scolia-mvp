import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Import UX

// --- Types ---
interface Grade {
  id: number;
  value: number;       
  total: number;       
  coef: number;        
  type: string;        
  date: string;
  subject: string;     
  comment?: string;
}

interface SubjectGroup {
  subjectName: string;
  grades: Grade[];
  average: string; 
}

const NotesPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [groupedGrades, setGroupedGrades] = useState<SubjectGroup[]>([]);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades/my-grades');
      const grades: Grade[] = response.data;

      // Traitement des données
      const groups: Record<string, Grade[]> = {};
      
      grades.forEach(grade => {
        if (!groups[grade.subject]) {
          groups[grade.subject] = [];
        }
        groups[grade.subject].push(grade);
      });

      const processedData: SubjectGroup[] = Object.keys(groups).map(subject => {
        const subjectGrades = groups[subject];
        
        let totalPoints = 0;
        let totalCoef = 0;

        subjectGrades.forEach(g => {
          const normalizedValue = (g.value / g.total) * 20;
          totalPoints += normalizedValue * g.coef;
          totalCoef += g.coef;
        });

        const avg = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : 'N/A';

        return {
          subjectName: subject,
          grades: subjectGrades,
          average: avg
        };
      });

      setGroupedGrades(processedData);

    } catch (error) {
      console.error("Erreur chargement notes", error);
      toast.error("Impossible de charger les notes.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const ratio = score / total;
    if (ratio >= 0.5) return '#2E7D32'; 
    if (ratio >= 0.4) return '#F57C00'; 
    return '#C62828'; 
  };

  return (
    <div style={{ backgroundColor: '#F4F6F8', minHeight: '100vh' }}>
      
      {/* HEADER SIMPLE */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo width={35} height={35} showText={false} />
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#0A2240' }}>Mes Notes</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/')} style={{ padding: '8px 15px', border: '1px solid #ccc', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                Retour
            </button>
            <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Déconnexion
            </button>
        </div>
      </header>

      <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
        
        <div style={{ marginBottom: '30px' }}>
            <h2 style={{ margin: 0, color: '#0A2240' }}>Bonjour, {user?.prenom} 👋</h2>
            <p style={{ color: '#666' }}>Voici tes derniers résultats scolaires.</p>
        </div>

        {loading ? (
            <p style={{ textAlign: 'center', marginTop: '50px' }}>Chargement des notes...</p>
        ) : groupedGrades.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '8px' }}>
                <p>Aucune note disponible pour le moment.</p>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {groupedGrades.map((group, index) => (
                    <div key={index} style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        
                        <div style={{ backgroundColor: '#0A2240', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{group.subjectName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Moyenne est.</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: parseFloat(group.average) >= 10 ? '#4CAF50' : '#FF5252' }}>
                                    {group.average}/20
                                </span>
                            </div>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                                <tr>
                                    <th style={{ padding: '10px 20px', textAlign: 'left', color: '#666' }}>Date</th>
                                    <th style={{ padding: '10px', textAlign: 'left', color: '#666' }}>Évaluation</th>
                                    <th style={{ padding: '10px', textAlign: 'center', color: '#666' }}>Coef.</th>
                                    <th style={{ padding: '10px 20px', textAlign: 'right', color: '#666' }}>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.grades.map((grade) => (
                                    <tr key={grade.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px 20px', color: '#444' }}>
                                            {new Date(grade.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px 10px' }}>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>{grade.type}</div>
                                            {grade.comment && <div style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>"{grade.comment}"</div>}
                                        </td>
                                        <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>
                                            x{grade.coef}
                                        </td>
                                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                            <span style={{ 
                                                fontWeight: 'bold', 
                                                color: getScoreColor(grade.value, grade.total),
                                                backgroundColor: getScoreColor(grade.value, grade.total) + '20', 
                                                padding: '5px 10px',
                                                borderRadius: '15px'
                                            }}>
                                                {grade.value}/{grade.total}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}

            </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
