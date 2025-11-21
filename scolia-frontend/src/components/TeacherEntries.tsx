// scolia-frontend/src/components/TeacherEntries.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- Types ---
interface Student {
  id: number;
  nom: string;
  prenom: string;
}

// =========================================================
// COMPOSANT 1 : SAISIE DE L'APPEL (AttendanceEntry)
// =========================================================
export const AttendanceEntry: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Simulation chargement élèves
    const mockStudents = [
      { id: 3, nom: 'Kouame', prenom: 'Jean' },
      { id: 4, nom: 'Kouame', prenom: 'Marie' },
      { id: 5, nom: 'Diop', prenom: 'Seydou' },
    ];
    setStudents(mockStudents);
    const initialData: Record<number, string> = {};
    mockStudents.forEach(s => initialData[s.id] = 'Présent');
    setAttendanceData(initialData);
  }, []);

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        classId: "6ème A",
        matiere: "Mathématiques",
        records: students.map(student => ({
            studentId: student.id,
            status: attendanceData[student.id]
        }))
      };
      await api.post('/attendance/bulk', payload);
      setSuccessMessage('✅ Appel enregistré avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#0A2240', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>🔔 Faire l'Appel - 6ème A</h2>
      {successMessage && <div style={{ padding: '10px', backgroundColor: '#D4EDDA', color: '#155724', marginBottom: '15px', borderRadius: '5px' }}>{successMessage}</div>}
      
      <div style={{ marginTop: '20px' }}>
        {students.map(student => (
          <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 'bold', color: '#333' }}>{student.prenom} {student.nom}</div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {['Présent', 'Retard', 'Absent'].map((status) => {
                const isSelected = attendanceData[student.id] === status;
                let btnColor = '#eee';
                if (isSelected) {
                    if (status === 'Présent') btnColor = '#008F39';
                    if (status === 'Retard') btnColor = '#F77F00';
                    if (status === 'Absent') btnColor = '#D32F2F';
                }
                return (
                  <button key={status} onClick={() => handleStatusChange(student.id, status)} style={{ padding: '5px 10px', border: 'none', borderRadius: '15px', backgroundColor: btnColor, color: isSelected ? 'white' : '#555', cursor: 'pointer', fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal' }}>
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#0A2240', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Enregistrement...' : 'Valider l\'Appel'}
      </button>
    </div>
  );
};

// =========================================================
// COMPOSANT 2 : SAISIE DES NOTES (NoteEntry) - FINALISÉ
// =========================================================
export const NoteEntry: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Record<number, string>>({}); // On stocke en string pour l'input
    
    // Configuration du devoir
    const [matiere, setMatiere] = useState('Mathématiques');
    const [titre, setTitre] = useState('');
    const [noteSur, setNoteSur] = useState(20);
    
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Simulation : Récupération des élèves de la classe
        const mockStudents = [
            { id: 3, nom: 'Kouame', prenom: 'Jean' },
            { id: 4, nom: 'Kouame', prenom: 'Marie' },
            { id: 5, nom: 'Diop', prenom: 'Seydou' },
        ];
        setStudents(mockStudents);
    }, []);

    const handleGradeChange = (studentId: number, value: string) => {
        // Validation simple : ne pas dépasser la note max
        if (Number(value) > noteSur) return; 
        setGrades(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!titre) return alert("Veuillez entrer un titre pour l'évaluation.");

        setLoading(true);
        try {
            // Préparation des données selon le DTO backend (CreateNotesDto)
            const notesPayload = Object.entries(grades).map(([studentId, noteVal]) => ({
                studentId: Number(studentId),
                noteValue: Number(noteVal)
            })).filter(n => !isNaN(n.noteValue)); // On filtre les champs vides

            const payload = {
                classId: 1, // ID simulé de la classe
                matiere: matiere,
                titreEvaluation: titre,
                noteSur: Number(noteSur),
                notes: notesPayload
            };

            await api.post('/notes/bulk', payload);
            
            setSuccessMessage(`✅ Notes enregistrées pour ${notesPayload.length} élèves !`);
            setGrades({}); // Reset du formulaire
            setTitre('');
            setTimeout(() => setSuccessMessage(''), 4000);

        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement des notes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#0A2240', borderBottom: '2px solid #008F39', paddingBottom: '10px' }}>
                📝 Saisir des Notes - 6ème A
            </h2>

            {successMessage && (
                <div style={{ padding: '15px', backgroundColor: '#D4EDDA', color: '#155724', borderRadius: '5px', marginBottom: '20px' }}>
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* CONFIGURATION DU DEVOIR */}
                <div style={{ backgroundColor: '#F9F9F9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Matière</label>
                        <select 
                            value={matiere} 
                            onChange={(e) => setMatiere(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            <option>Mathématiques</option>
                            <option>Français</option>
                            <option>Histoire-Géo</option>
                            <option>Anglais</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Titre (ex: Interro 1)</label>
                            <input 
                                type="text" 
                                required 
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                placeholder="Titre de l'évaluation"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Note sur</label>
                            <input 
                                type="number" 
                                value={noteSur}
                                onChange={(e) => setNoteSur(Number(e.target.value))}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>

                {/* LISTE DES ÉLÈVES */}
                <h3 style={{ color: '#0A2240', fontSize: '1rem', marginBottom: '15px' }}>Grille de notation</h3>
                
                {students.map(student => (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                        <div style={{ color: '#333' }}>{student.prenom} <strong>{student.nom}</strong></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input 
                                type="number" 
                                min="0" 
                                max={noteSur}
                                placeholder="-"
                                value={grades[student.id] || ''}
                                onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                style={{ 
                                    width: '60px', 
                                    padding: '8px', 
                                    textAlign: 'center', 
                                    borderRadius: '4px', 
                                    border: '1px solid #ccc',
                                    fontWeight: 'bold',
                                    color: '#0A2240'
                                }}
                            />
                            <span style={{ color: '#999', fontSize: '0.9rem' }}>/ {noteSur}</span>
                        </div>
                    </div>
                ))}

                <button 
                    type="submit"
                    disabled={loading}
                    style={{ 
                        marginTop: '30px', 
                        width: '100%', 
                        padding: '15px', 
                        backgroundColor: '#0A2240', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '1.1rem', 
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        opacity: loading ? 0.7 : 1 
                    }}
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer les Notes'}
                </button>
            </form>
        </div>
    );
};
