import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FaStar, FaPlus, FaListUl } from 'react-icons/fa';

interface Competence {
  id: number;
  name: string;
  category: string;
  description: string;
}

export const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Competence[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Formulaire
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Savoir-être', // Valeur par défaut
    description: ''
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get('/skills');
      setSkills(res.data);
    } catch (error) {
      console.error("Erreur chargement compétences", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newSkill.name) {
        toast.error("Veuillez saisir un intitulé.");
        return;
    }
    
    try {
      await api.post('/skills', newSkill);
      toast.success('✅ Compétence ajoutée au référentiel !');
      setNewSkill({ name: '', category: 'Savoir-être', description: '' }); // Reset
      fetchSkills(); // Rafraîchir la liste
    } catch (error) {
      toast.error("Erreur lors de la création.");
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #eee' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #F77F00', paddingBottom: '10px' }}>
        <FaStar color="#F77F00" size={24} />
        <h2 style={{ margin: 0, color: '#0A2240' }}>Référentiel de Compétences</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
        
        {/* 1. FORMULAIRE D'AJOUT */}
        <div style={{ backgroundColor: '#F9F9F9', padding: '20px', borderRadius: '10px' }}>
            <h4 style={{ marginTop: 0, color: '#555' }}>➕ Nouvelle Compétence</h4>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={labelStyle}>Catégorie</label>
                    <select 
                        value={newSkill.category} 
                        onChange={e => setNewSkill({...newSkill, category: e.target.value})}
                        style={inputStyle}
                    >
                        <option value="Savoir-être">Savoir-être (Comportement)</option>
                        <option value="Scientifique">Scientifique (Maths/Sciences)</option>
                        <option value="Littéraire">Littéraire (Langues/Rédaction)</option>
                        <option value="Artistique">Artistique & Sport</option>
                        <option value="Autre">Autre</option>
                    </select>
                </div>
                
                <div>
                    <label style={labelStyle}>Intitulé</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Esprit d'équipe" 
                        value={newSkill.name} 
                        onChange={e => setNewSkill({...newSkill, name: e.target.value})} 
                        required 
                        style={inputStyle} 
                    />
                </div>

                <div>
                    <label style={labelStyle}>Description (Optionnel)</label>
                    <textarea 
                        placeholder="Ex: Capacité à travailler avec les autres..." 
                        value={newSkill.description} 
                        onChange={e => setNewSkill({...newSkill, description: e.target.value})} 
                        style={{ ...inputStyle, minHeight: '60px' }} 
                    />
                </div>

                <button type="submit" style={{ backgroundColor: '#0A2240', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaPlus /> Ajouter
                </button>
            </form>
        </div>

        {/* 2. LISTE EXISTANTE */}
        <div>
            <h4 style={{ marginTop: 0, color: '#555', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaListUl /> Compétences définies ({skills.length})
            </h4>
            
            {loading ? <p>Chargement...</p> : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                    {skills.length === 0 ? <p style={{ fontStyle: 'italic', color: '#999' }}>Aucune compétence définie.</p> : 
                     skills.map(skill => (
                        <div key={skill.id} style={{ backgroundColor: 'white', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{skill.name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{skill.description}</div>
                            </div>
                            <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', backgroundColor: getCatColor(skill.category), color: 'white', fontWeight: 'bold' }}>
                                {skill.category}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

// --- Styles & Helpers ---
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', color: '#555' };

const getCatColor = (cat: string) => {
    switch(cat) {
        case 'Savoir-être': return '#9C27B0'; // Violet
        case 'Scientifique': return '#2196F3'; // Bleu
        case 'Littéraire': return '#FF9800'; // Orange
        case 'Artistique': return '#E91E63'; // Rose
        default: return '#607D8B'; // Gris
    }
};
