// scolia-frontend/src/components/TeacherEntries.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast'; // On garde l'import de la fonction, mais pas du composant Toaster

// --- Types partagés ---
interface Student {
  id: number;
  nom: string;
  prenom: string;
}

interface ClassOption {
  id: number;
  name: string;
}

// =========================================================
// COMPOSANT 1 : SAISIE DE L'APPEL (AttendanceEntry)
// =========================================================
export const AttendanceEntry: React.FC = () => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  // 1. Charger les classes au montage
  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (err) {
            console.error("Impossible de charger les classes", err);
            toast.error("Impossible de charger les classes.");
        }
    };
    fetchClasses();
  }, []);

  // 2. Charger les élèves quand une classe est sélectionnée
  useEffect(() => {
    if (!selectedClassId) {
        setStudents([]);
        return;
    }
    
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/students/class/${selectedClassId}`);
            setStudents(res.data);
            
            // Initialiser tout le monde à "Présent" par défaut
            const initialData: Record<number, string> = {};
            res.data.forEach((s: Student) => initialData[s.id] = 'Présent');
            setAttendanceData(initialData);

        } catch (err) {
            console.error("Erreur chargement élèves", err);
            toast.error("Erreur lors du chargement des élèves.");
        } finally {
            setLoading(false);
        }
    };
    fetchStudents();
  }, [selectedClassId]);

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClassId) {
        toast.error("Veuillez sélectionner une classe.");
        return;
    }
    
    setLoading(true);
    try {
      const payload = {
        classId: Number(selectedClassId),
        date: new Date().toISOString().split('T')[0], // Date du jour YYYY-MM-DD
        records: students.map(student => ({
            studentId: student.id,
            status: attendanceData[student.id]
        }))
      };

      await api.post('/attendance/bulk', payload);
      toast.success('✅ Appel enregistré avec succès !');
      
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi des données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto 40px auto', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      {/* ⚠️ SUPPRESSION DU <Toaster /> Local (Géré par App.tsx) */}
      <h2 style={{ color: '#0A2240', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>🔔 Faire l'Appel</h2>
      
      {/* SÉLECTION CLASSE */}
      <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Classe concernée</label>
          <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          >
              <option value="">-- Sélectionner une classe --</option>
              {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
      </div>

      {selectedClassId && students.length > 0 && (
          <>
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
                        <button key={status} onClick={() => handleStatusChange(student.id, status)} style={{ padding: '5px 10px', border: 'none', borderRadius: '15px', backgroundColor: btnColor, color: isSelected ? 'white' : '#555', cursor: 'pointer', fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal', transition: '0.2s' }}>
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
          </>
      )}
    </div>
  );
};

// =========================================================
// COMPOSANT 2 : SAISIE DES NOTES (NoteEntry)
// =========================================================
export const NoteEntry: React.FC = () => {
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    
    // Données du formulaire
    const [grades, setGrades] = useState<Record<number, string>>({});
    const [matiere, setMatiere] = useState('Mathématiques');
    const [titre, setTitre] = useState('');
    const [noteSur, setNoteSur] = useState(20);
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await api.get('/classes');
                setClasses(res.data);
            } catch (err) {
                console.error("Impossible de charger les classes", err);
                toast.error("Impossible de charger les classes.");
            }
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setStudents([]);
            return;
        }
        
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/students/class/${selectedClassId}`);
                setStudents(res.data);
                setGrades({}); // Reset des notes si on change de classe
            } catch (err) {
                console.error("Erreur chargement élèves", err);
                toast.error("Erreur lors du chargement des élèves.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedClassId]);


    const handleGradeChange = (studentId: number, value: string) => {
        // Autorise uniquement chiffres et point/virgule ou vide
        setGrades(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedClassId || !titre) {
             toast.error("Veuillez remplir tous les champs obligatoires.");
             return;
        }
        
        // Validation locale
        const invalidNotes = students.some(student => {
            const val = grades[student.id];
            if (val === undefined || val === '') return false; // Note non saisie = valide (ignorée)
            const note = Number(val);
            return isNaN(note) || note < 0 || note > noteSur;
        });
        
        if (invalidNotes) {
            toast.error(`Veuillez corriger les notes invalides (entre 0 et ${noteSur}).`);
            return;
        }

        setLoading(true);
        try {
            // Filtrage des notes valides (non vides et numériques)
            const notesPayload = Object.entries(grades)
                .map(([studentId, noteVal]) => ({
                    studentId: Number(studentId),
                    noteValue: Number(noteVal)
                }))
                .filter(n => !isNaN(n.noteValue) && n.noteValue >= 0 && n.noteValue <= noteSur && grades[n.studentId] !== '');

            const payload = {
                classId: Number(selectedClassId),
                notes: notesPayload, 
                matiere: matiere,
                titreEvaluation: titre,
                noteSur: Number(noteSur)
            };

            await api.post('/grades', payload);
            
            toast.success(`✅ Notes enregistrées pour ${notesPayload.length} élèves !`);
            setGrades({});
            setTitre('');

        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement des notes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            {/* ⚠️ SUPPRESSION DU <Toaster /> Local */}
            <h2 style={{ color: '#0A2240', borderBottom: '2px solid #008F39', paddingBottom: '10px', marginBottom: '20px' }}>
                📝 Saisir des Notes
            </h2>

            <form onSubmit={handleSubmit}>
                {/* SÉLECTION DE LA CLASSE */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>Choisir la Classe</label>
                    <select 
                        value={selectedClassId} 
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem', backgroundColor: '#F9F9F9' }}
                    >
                        <option value="">-- Sélectionner --</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* CONFIGURATION DU DEVOIR */}
                {selectedClassId && (
                    <div style={{ backgroundColor: '#F4F6F8', padding: '20px', borderRadius: '10px', marginBottom: '25px', border: '1px solid #E0E0E0' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Matière</label>
                            <select 
                                value={matiere} 
                                onChange={(e) => setMatiere(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                <option>Mathématiques</option>
                                <option>Français</option>
                                <option>Histoire-Géo</option>
                                <option>Anglais</option>
                                <option>SVT</option>
                                <option>Physique-Chimie</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Titre de l'évaluation</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={titre}
                                    onChange={(e) => setTitre(e.target.value)}
                                    placeholder="ex: Interrogation N°1"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Note sur</label>
                                <input 
                                    type="number" 
                                    value={noteSur}
                                    onChange={(e) => setNoteSur(Number(e.target.value))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* LISTE DES ÉLÈVES */}
                {selectedClassId && students.length > 0 && (
                    <>
                        <h3 style={{ color: '#0A2240', fontSize: '1.1rem', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Grille de notation</h3>
                        
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                            {students.map(student => {
                                const valStr = grades[student.id] !== undefined ? grades[student.id] : '';
                                const currentNote = valStr !== '' ? Number(valStr) : NaN;
                                const isInvalid = (valStr !== '' && (isNaN(currentNote) || currentNote > noteSur || currentNote < 0));

                                return (
                                <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', borderBottom: '1px solid #f0f0f0', backgroundColor: 'white' }}>
                                    <div style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                                            {student.prenom[0]}{student.nom[0]}
                                        </div>
                                        <span>{student.prenom} <strong>{student.nom}</strong></span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input 
                                            type="number" 
                                            placeholder="-"
                                            value={valStr}
                                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                            style={{ 
                                                width: '70px', 
                                                padding: '10px', 
                                                textAlign: 'center', 
                                                borderRadius: '6px', 
                                                border: isInvalid ? '2px solid #D32F2F' : '1px solid #ccc',
                                                backgroundColor: isInvalid ? '#FFEBEE' : 'white',
                                                fontWeight: 'bold',
                                                color: isInvalid ? '#D32F2F' : '#0A2240',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <span style={{ color: '#999', fontSize: '0.9rem', minWidth: '30px' }}>/ {noteSur}</span>
                                    </div>
                                </div>
                            );})}
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                marginTop: '30px', 
                                width: '100%', 
                                padding: '16px', 
                                backgroundColor: '#0A2240', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '10px', 
                                fontSize: '1.1rem', 
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer', 
                                opacity: loading ? 0.7 : 1,
                                boxShadow: '0 4px 6px rgba(10, 34, 64, 0.2)'
                            }}
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer les Notes'}
                        </button>
                    </>
                )}
                
                {selectedClassId && students.length === 0 && !loading && (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Aucun élève dans cette classe.</p>
                )}
            </form>
        </div>
    );
};
