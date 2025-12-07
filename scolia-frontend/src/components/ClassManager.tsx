// scolia-frontend/src/components/ClassManager.tsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast'; // Gestion des notifications 
import { FaTrash } from 'react-icons/fa'; // Icônes pour l'UI 

// Définition de l'interface pour les données de classe
interface ClassEntity {
  id: number;
  name: string;
  level: string;
}

interface ClassManagerProps {
    onClassCreated?: () => void;
}

export const ClassManager: React.FC<ClassManagerProps> = ({ onClassCreated }) => {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [newClass, setNewClass] = useState({ name: '', level: '' });
  const [loading, setLoading] = useState(true);

  // Charger les classes au montage du composant
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les classes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.level) {
        toast.error("Veuillez remplir tous les champs");
        return;
    }

    try {
      await api.post('/classes', newClass);
      toast.success('Classe créée avec succès !');
      setNewClass({ name: '', level: '' });
      fetchClasses(); // Rafraîchir la liste
      
      if (onClassCreated) {
          onClassCreated();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création de la classe.");
    }
  };

  // Nouvelle fonction pour gérer la suppression
  const handleDelete = async (id: number) => {
      // Confirmation simple pour la sécurité
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.")) {
          return;
      }

      try {
          await api.delete(`/classes/${id}`);
          toast.success("Classe supprimée.");
          // Mise à jour optimiste de l'interface (plus rapide que de refetcher)
          setClasses(classes.filter(c => c.id !== id));
      } catch (err) {
          console.error(err);
          toast.error("Impossible de supprimer la classe (elle contient peut-être des élèves).");
      }
  };

  return (
    <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0A2240', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>
        🏫 Gestion des Classes
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        {/* Colonne 1 : Formulaire de création */}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0A2240' }}>Nouvelle Classe</h3>
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
            <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Ajouter
            </button>
            
            <div style={{ marginTop: '15px', color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                ℹ️ Les nouvelles classes apparaîtront immédiatement dans le formulaire d'inscription.
            </div>
        </form>

        {/* Colonne 2 : Liste des classes existantes avec suppression */}
        <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#0A2240' }}>Classes Existantes</h3>
            {loading ? (
                <p>Chargement...</p>
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '5px' }}>
                    {classes.length === 0 ? (
                        <p style={{ padding: '10px', color: '#888' }}>Aucune classe créée.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                                <tr>
                                    <th style={{ padding: '8px', fontSize: '0.9rem' }}>Nom</th>
                                    <th style={{ padding: '8px', fontSize: '0.9rem' }}>Niveau</th>
                                    <th style={{ padding: '8px', fontSize: '0.9rem', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((cls) => (
                                    <tr key={cls.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>{cls.name}</td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{ backgroundColor: '#e0f2f1', color: '#00695c', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>
                                                {cls.level}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDelete(cls.id)}
                                                style={{ 
                                                    backgroundColor: 'transparent', 
                                                    border: 'none', 
                                                    color: '#d32f2f', 
                                                    cursor: 'pointer',
                                                    padding: '5px'
                                                }}
                                                title="Supprimer la classe"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
