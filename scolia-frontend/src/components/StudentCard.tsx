import React from 'react';

// On définit les types attendus
interface ParentInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

interface StudentDetails {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  adresse?: string;
  classe?: { name: string };
  parent?: ParentInfo;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  infosMedicales?: string;
  photo?: string; // Si vous avez ajouté la photo aux élèves aussi
}

interface StudentCardProps {
  student: StudentDetails;
  onClose: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, onClose }) => {
  if (!student) return null;

  return (
    // Fond sombre semi-transparent (Overlay)
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      
      {/* La Carte elle-même (on empêche le clic de fermer la modale) */}
      <div style={{
        backgroundColor: 'white', borderRadius: '15px', width: '90%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>

        {/* En-tête coloré */}
        <div style={{ backgroundColor: '#0A2240', padding: '20px', color: 'white', borderRadius: '15px 15px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>📄 Fiche Élève</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
        </div>

        <div style={{ padding: '25px' }}>
            
            {/* Section 1 : Identité */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#666' }}>
                    {student.photo ? <img src={student.photo} alt="" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}}/> : <span>{student.prenom[0]}{student.nom[0]}</span>}
                </div>
                <div>
                    <h1 style={{ margin: '0 0 5px 0', color: '#0A2240' }}>{student.prenom} {student.nom}</h1>
                    <span style={{ backgroundColor: '#F77F00', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.9rem' }}>
                        Classe : {student.classe?.name || 'Non assigné'}
                    </span>
                    <p style={{ color: '#666', marginTop: '10px' }}>📅 Né(e) le : {student.dateNaissance ? new Date(student.dateNaissance).toLocaleDateString() : 'Non renseigné'}</p>
                    <p style={{ color: '#666' }}>🏠 Adresse : {student.adresse || 'Non renseignée'}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Section 2 : Responsables */}
                <div style={{ backgroundColor: '#F4F6F8', padding: '15px', borderRadius: '10px' }}>
                    <h4 style={{ color: '#0A2240', borderBottom: '2px solid #ddd', paddingBottom: '5px', marginTop: 0 }}>👨‍👩‍👦 Responsables</h4>
                    {student.parent ? (
                        <>
                            <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{student.parent.prenom} {student.parent.nom}</p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>📧 {student.parent.email}</p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>📞 {student.parent.telephone || 'Non renseigné'}</p>
                        </>
                    ) : (
                        <p style={{ fontStyle: 'italic', color: '#999' }}>Aucun parent lié</p>
                    )}
                </div>

                {/* Section 3 : Urgence & Santé */}
                <div style={{ backgroundColor: '#FFEBEE', padding: '15px', borderRadius: '10px', border: '1px solid #FFCDD2' }}>
                    <h4 style={{ color: '#D32F2F', borderBottom: '2px solid #EF9A9A', paddingBottom: '5px', marginTop: 0 }}>🚨 Urgence & Santé</h4>
                    
                    <p style={{ fontSize: '0.85rem', color: '#D32F2F', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>À prévenir :</p>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{student.contactUrgenceNom || 'Non renseigné'}</p>
                    <p style={{ margin: '0 0 15px 0' }}>📞 {student.contactUrgenceTel || '-'}</p>

                    <p style={{ fontSize: '0.85rem', color: '#D32F2F', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>⚠️ Infos Médicales :</p>
                    <p style={{ margin: 0 }}>{student.infosMedicales || 'R.A.S'}</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
