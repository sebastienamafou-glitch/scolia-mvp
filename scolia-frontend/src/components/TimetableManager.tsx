import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCalendarAlt, FaRobot, FaClock } from 'react-icons/fa';

interface ClassOption {
  id: number;
  name: string;
}

interface TimetableSlot {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
}

export const TimetableManager: React.FC = () => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Charger les classes
  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data));
  }, []);

  // Charger l'emploi du temps quand on sélectionne une classe
  useEffect(() => {
    if (!selectedClassId) return;
    loadSchedule();
  }, [selectedClassId]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/timetable/class/${selectedClassId}`);
      setSchedule(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedClassId) return;
    if (!window.confirm("Attention : Cela va effacer et régénérer l'emploi du temps actuel. Continuer ?")) return;

    setGenerating(true);
    try {
      // Contraintes par défaut (on pourrait faire un formulaire pour ça plus tard)
      const constraints = {
        "Mathématiques": 4,
        "Français": 4,
        "Anglais": 3,
        "Histoire-Géo": 2,
        "SVT": 2,
        "Physique-Chimie": 2,
        "EPS": 2
      };

      await api.post(`/timetable/generate/${selectedClassId}`, constraints);
      alert("✨ Emploi du temps généré avec succès !");
      loadSchedule(); // Rafraîchir l'affichage
    } catch (error) {
      alert("Erreur lors de la génération IA.");
    } finally {
      setGenerating(false);
    }
  };

  // Organiser les données pour l'affichage (Lundi, Mardi...)
  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#0A2240', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaCalendarAlt /> Emplois du Temps
            </h3>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                    value={selectedClassId} 
                    onChange={e => setSelectedClassId(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                >
                    <option value="">-- Choisir une classe --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                
                <button 
                    onClick={handleGenerateAI}
                    disabled={!selectedClassId || generating}
                    style={{ 
                        backgroundColor: generating ? '#ccc' : '#673AB7', // Violet IA
                        color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', 
                        fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px'
                    }}
                >
                    <FaRobot /> {generating ? 'IA réfléchit...' : 'Générer (IA)'}
                </button>
            </div>
        </div>

        {/* AFFICHAGE DE LA GRILLE */}
        {selectedClassId ? (
            loading ? <p>Chargement...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {days.map(day => (
                        <div key={day} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f5f5f5', padding: '8px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                                {day}
                            </div>
                            <div style={{ padding: '5px', minHeight: '150px' }}>
                                {schedule
                                    .filter(s => s.dayOfWeek === day)
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map(slot => (
                                        <div key={slot.id} style={{ backgroundColor: '#E3F2FD', padding: '8px', borderRadius: '4px', marginBottom: '5px', fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: 'bold', color: '#1565C0' }}>{slot.subject}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#555', fontSize: '0.75rem' }}>
                                                <FaClock size={10} /> {slot.startTime} - {slot.endTime}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{slot.room}</div>
                                        </div>
                                    ))}
                                {schedule.filter(s => s.dayOfWeek === day).length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#ccc', marginTop: '20px', fontSize: '0.8rem' }}>Aucun cours</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
        ) : (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Veuillez sélectionner une classe pour voir ou générer son planning.</p>
        )}
    </div>
  );
};
