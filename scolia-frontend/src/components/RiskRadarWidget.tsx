import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaExclamationTriangle, FaWhatsapp, FaPhone } from 'react-icons/fa';

interface AtRiskStudent {
  id: number;
  nom: string;
  prenom: string;
  classe: string;
  photo: string;
  riskLevel: 'HIGH' | 'MEDIUM';
  reasons: string[];
  parentPhone?: string;
}

export const RiskRadarWidget: React.FC = () => {
  const [students, setStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/risk-radar')
       .then(res => setStudents(res.data || [])) 
       .catch(err => console.error("Erreur Risk Radar:", err))
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Analyse des données...</div>;
  if (!students || students.length === 0) return null; 

  return (
    <div style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #fff5f5 100%)', 
        borderRadius: '16px', padding: '25px',
        boxShadow: '0 10px 30px rgba(220, 38, 38, 0.15)', border: '1px solid #fee2e2'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#fee2e2', padding: '12px', borderRadius: '50%', color: '#dc2626' }}>
            <FaExclamationTriangle size={20} />
        </div>
        <div>
            <h3 style={{ margin: 0, color: '#991b1b', fontSize: '1.2rem' }}>Radar de Rétention</h3>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem' }}>
                {students.length} élève(s) nécessitent votre attention.
            </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {students.map(student => (
            <div key={student.id} style={{ 
                backgroundColor: 'white', padding: '15px', borderRadius: '12px',
                borderLeft: `5px solid ${student.riskLevel === 'HIGH' ? '#dc2626' : '#f59e0b'}`,
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img 
                        src={student.photo || `https://ui-avatars.com/api/?name=${student.prenom}+${student.nom}&background=random`} 
                        alt="" style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#333' }}>{student.nom} {student.prenom}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{student.classe}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {(student.reasons || []).map((r, i) => (
                        <span key={i} style={{ 
                            fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', 
                            backgroundColor: '#fff1f2', color: '#be123c', fontWeight: '600'
                        }}>
                            {r}
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {student.parentPhone && (
                        <>
                            <a href={`tel:${student.parentPhone}`} style={iconBtnStyle} title="Appeler">
                                <FaPhone />
                            </a>
                            <a href={`https://wa.me/${student.parentPhone}`} target="_blank" rel="noreferrer" style={{...iconBtnStyle, backgroundColor: '#dcfce7', color: '#16a34a'}} title="WhatsApp">
                                <FaWhatsapp />
                            </a>
                        </>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = { 
    padding: '8px', borderRadius: '50%', backgroundColor: '#f3f4f6', 
    color: '#333', border: 'none', cursor: 'pointer', 
    display:'flex', alignItems:'center', justifyContent:'center' 
};
