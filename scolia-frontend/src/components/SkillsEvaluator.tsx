import React, { useState, useEffect } from 'react';
import api from '../services/api';
// npm install react-icons (si pas fait)
import { FaStar } from 'react-icons/fa';

interface Competence {
  id: number;
  name: string;
  category: string;
}

interface Student {
  id: number;
  nom: string;
  prenom: string;
}

interface SkillsEvaluatorProps {
  classId: string;
}

export const SkillsEvaluator: React.FC<SkillsEvaluatorProps> = ({ classId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [skills, setSkills] = useState<Competence[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // États pour la notation
  const [ratings, setRatings] = useState<Record<number, number>>({}); // { competenceId: level }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
        if (!classId) return;
        try {
            const [resStudents, resSkills] = await Promise.all([
                api.get(`/students/class/${classId}`),
                api.get('/skills')
            ]);
            setStudents(resStudents.data);
            setSkills(resSkills.data);
            if (resStudents.data.length > 0) setSelectedStudentId(resStudents.data[0].id.toString());
        } catch (e) {
            console.error("Erreur chargement données compétences");
        }
    };
    init();
  }, [classId]);

  const handleRate = (competenceId: number, level: number) => {
    setRatings(prev => ({ ...prev, [competenceId]: level }));
  };

  // NOUVELLE LOGIQUE : Envoi en bloc (Bulk Insert)
  const handleSubmit = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
        // Transformation des données en tableau
        const evaluations = Object.entries(ratings).map(([compId, level]) => ({
            competenceId: Number(compId),
            level: level
        }));

        // UNE SEULE REQUÊTE ROBUSTE (Bulk Insert)
        await api.post('/skills/evaluate/bulk', {
            studentId: Number(selectedStudentId),
            evaluations: evaluations
        });

        alert("✅ Compétences enregistrées !");
        setRatings({}); // Reset
    } catch (error) {
        // Gérer les erreurs (par exemple, si la route backend n'existe pas encore)
        console.error("Erreur lors de l'enregistrement des compétences:", error);
        alert("Erreur lors de l'enregistrement. Vérifiez que la route backend /skills/evaluate/bulk est prête.");
    } finally {
        setLoading(false);
    }
  };

  if (!classId) return <p>Veuillez sélectionner une classe.</p>;

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <h3 style={{ color: '#0A2240', marginTop: 0 }}>🌟 Évaluation des Compétences</h3>
        
        {/* SÉLECTEUR ÉLÈVE */}
        <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Élève :</label>
            <select 
                value={selectedStudentId} 
                onChange={e => { setSelectedStudentId(e.target.value); setRatings({}); }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
                {students.map(s => <option key={s.id} value={s.id}>{s.nom} {s.prenom}</option>)}
            </select>
        </div>

        {/* GRILLE DE NOTATION */}
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
            {skills.map(skill => (
                <div key={skill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{skill.name}</div>
                        <span style={{ fontSize: '0.8rem', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{skill.category}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <FaStar 
                                key={star} 
                                size={24}
                                color={ratings[skill.id] >= star ? '#FFC107' : '#E0E0E0'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleRate(skill.id, star)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        <button 
            onClick={handleSubmit}
            disabled={loading || Object.keys(ratings).length === 0}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0A2240', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
            {loading ? 'Enregistrement...' : 'Valider le Bilan'}
        </button>
    </div>
  );
};
