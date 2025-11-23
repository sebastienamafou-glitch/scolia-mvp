// scolia-frontend/src/components/ClassManager.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ClassEntity {
  id: number;
  name: string;
  level: string;
}

export const ClassManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [newClass, setNewClass] = useState({ name: '', level: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/classes', newClass);
      alert('Classe créée !');
      setNewClass({ name: '', level: '' });
      fetchClasses();
    } catch (err) {
      alert("Erreur lors de la création.");
    }
  };

  return (
    <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0A2240', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>
        🏫 Gestion des Classes
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* Formulaire */}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3>Nouvelle Classe</h3>
            <input 
                type="text" 
                placeholder="Nom (ex: 6ème A)" 
                value={newClass.name}
                onChange={e => setNewClass({...newClass, name: e.target.value})}
                required
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <select 
                value={newClass.level}
                onChange={e => setNewClass({...newClass, level: e.target.value})}
                style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
                <option value="">-- Niveau --</option>
                <option value="6ème">6ème</option>
                <option value="5ème">5ème</option>
                <option value="4ème">4ème</option>
                <option value="3ème">3ème</option>
                <option value="Seconde">Seconde</option>
                <option value="Première">Première</option>
                <option value="Terminale">Terminale</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Ajouter
            </button>
        </form>

        {/* Liste */}
        <div>
            <h3>Classes existantes ({classes.length})</h3>
            {loading ? <p>Chargement...</p> : (
                <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                    {classes.map(c => (
                        <li key={c.id} style={{ padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{c.name}</strong>
                            <span style={{ color: '#666', fontSize: '0.9em' }}>{c.level}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
};
