// scolia-frontend/src/components/BulletinEditor.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- Types ---
interface Student {
  id: number;
  nom: string;
  prenom: string;
}

interface SubjectAverage {
  matiere: string;
  moyenne: number;
  coefTotal: number;
}

interface BulletinData {
  subjects: SubjectAverage[];
  globalAverage: number;
  bulletinData: {
    appreciation: string;
    isPublished: boolean;
  };
}

export const BulletinEditor: React.FC = () => {
  // Sélection
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [period, setPeriod] = useState('T1');

  // Données du bulletin
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);
  const [appreciation, setAppreciation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1. Charger les classes
  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  // 2. Charger les élèves quand la classe change
  useEffect(() => {
    if (!selectedClassId) {
        setStudents([]);
        return;
    }
    
    // 👇 AJOUT : Réinitialisation propre lors du changement de classe
    setSelectedStudentId('');  // Réinitialise la sélection de l'élève
    setBulletin(null);         // Vide le bulletin affiché
    setAppreciation('');       // Vide l'appréciation
    // ------------------

    api.get(`/students/class/${selectedClassId}`)
       .then(res => setStudents(res.data))
       .catch(console.error);
  }, [selectedClassId]);

  // 3. Charger le bulletin (Moyennes + Appréciation) quand l'élève change
  useEffect(() => {
    if (!selectedStudentId) {
        setBulletin(null);
        return;
    }
    loadBulletin();
  }, [selectedStudentId, period]);

  const loadBulletin = async () => {
    setLoading(true);
    try {
        const res = await api.get(`/bulletins?studentId=${selectedStudentId}&period=${period}`);
        setBulletin(res.data);
        setAppreciation(res.data.bulletinData.appreciation || ''); // Pré-remplir l'appréciation
    } catch (error) {
        console.error("Erreur chargement bulletin", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStudentId) return;
    setSaving(true);
    try {
        await api.post('/bulletins/save', {
            studentId: Number(selectedStudentId),
            period: period,
            appreciation: appreciation
        });
        alert('✅ Appréciation enregistrée !');
    } catch (error) {
        alert("Erreur lors de la sauvegarde.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#0A2240', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>🎓 Conseil de Classe - Édition des Bulletins</h2>

      {/* BARRE DE SÉLECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px', backgroundColor: '#F4F6F8', padding: '20px', borderRadius: '8px' }}>
        <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>1. Classe</label>
            <select style={{width: '100%', padding: '8px'}} onChange={e => setSelectedClassId(e.target.value)}>
                <option value="">-- Choisir --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>2. Élève</label>
            {/* L'attribut 'value' assure que la sélection est mise à jour lorsque selectedStudentId est réinitialisé */}
            <select style={{width: '100%', padding: '8px'}} value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} disabled={!selectedClassId}>
                <option value="">-- Choisir l'élève --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.nom} {s.prenom}</option>)}
            </select>
        </div>
        <div>
            <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>3. Période</label>
            <select style={{width: '100%', padding: '8px'}} value={period} onChange={e => setPeriod(e.target.value)}>
                <option value="T1">Trimestre 1</option>
                <option value="T2">Trimestre 2</option>
                <option value="T3">Trimestre 3</option>
            </select>
        </div>
      </div>

      {/* AFFICHAGE DU BULLETIN */}
      {loading && <p>Chargement des calculs...</p>}
      
      {!loading && bulletin && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
            
            {/* COLONNE GAUCHE : LES NOTES */}
            <div>
                <h3 style={{marginTop: 0}}>📊 Moyennes par matière</h3>
                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                    <thead style={{backgroundColor: '#0A2240', color: 'white'}}>
                        <tr>
                            <th style={{padding: '8px', textAlign: 'left'}}>Matière</th>
                            <th style={{padding: '8px', textAlign: 'center'}}>Moyenne</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bulletin.subjects.map(sub => (
                            <tr key={sub.matiere} style={{borderBottom: '1px solid #eee'}}>
                                <td style={{padding: '8px'}}>{sub.matiere}</td>
                                <td style={{padding: '8px', textAlign: 'center', fontWeight: 'bold', color: sub.moyenne < 10 ? '#D32F2F' : '#008F39'}}>
                                    {sub.moyenne} / 20
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#E3F2FD', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.2rem', color: '#0D47A1' }}>Moyenne Générale : </span>
                    <strong style={{ fontSize: '1.5rem', color: '#0D47A1' }}>{bulletin.globalAverage} / 20</strong>
                </div>
            </div>

            {/* COLONNE DROITE : L'APPRÉCIATION */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{marginTop: 0}}>✍️ Appréciation du Conseil</h3>
                <textarea 
                    value={appreciation}
                    onChange={(e) => setAppreciation(e.target.value)}
                    placeholder="Écrivez ici le commentaire qui apparaîtra sur le bulletin..."
                    style={{ flex: 1, minHeight: '200px', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', fontFamily: 'inherit', resize: 'vertical' }}
                />
                
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    style={{ marginTop: '15px', padding: '15px', backgroundColor: '#F77F00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {saving ? 'Sauvegarde...' : '💾 Enregistrer le Bulletin'}
                </button>
            </div>

        </div>
      )}
    </div>
  );
};
