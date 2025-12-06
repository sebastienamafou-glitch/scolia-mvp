import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  isUrgent: boolean;
  createdAt: string;
  targetRole: string;
}

export const SchoolNews: React.FC = () => {
  const { userRole } = useAuth();
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', isUrgent: false, targetRole: 'All' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await api.get('/news');
      setNewsList(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;
    try {
        await api.post('/news', newPost);
        fetchNews();
        setNewPost({ title: '', content: '', isUrgent: false, targetRole: 'All' });
        setShowForm(false);
    } catch (e) { alert("Erreur lors de la publication"); }
  };

  // Helper date sécurisé
  const formatDate = (dateString: string) => {
      try {
          return new Date(dateString).toLocaleDateString('fr-FR');
      } catch (e) {
          return "";
      }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#0A2240', fontSize: '1.2rem' }}>📢 Actualités & Vie Scolaire</h2>
        {userRole === UserRole.ADMIN && (
            <button onClick={() => setShowForm(!showForm)} style={{ fontSize: '0.9rem', padding: '8px 12px', backgroundColor: '#0A2240', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {showForm ? 'Fermer' : '+ Nouvelle Annonce'}
            </button>
        )}
      </div>

      {userRole === UserRole.ADMIN && showForm && (
        <form onSubmit={handlePublish} style={{ backgroundColor: '#F4F6F8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <input type="text" placeholder="Titre" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            <textarea placeholder="Message..." rows={3} value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <select value={newPost.targetRole} onChange={e => setNewPost({...newPost, targetRole: e.target.value})} style={{ padding: '8px' }}>
                    <option value="All">Tout le monde</option>
                    <option value="Enseignant">Enseignants</option>
                    <option value="Parent">Parents</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#D32F2F', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={newPost.isUrgent} onChange={e => setNewPost({...newPost, isUrgent: e.target.checked})} /> Urgent
                </label>
                <button type="submit" style={{ marginLeft: 'auto', backgroundColor: '#F77F00', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>Publier</button>
            </div>
        </form>
      )}

      {newsList.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>Aucune actualité pour le moment.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {newsList.map(news => (
                <div key={news.id} style={{ 
                    borderLeft: news.isUrgent ? '5px solid #D32F2F' : '5px solid #0A2240', 
                    backgroundColor: news.isUrgent ? '#FFF5F5' : '#F9F9F9',
                    padding: '15px', borderRadius: '4px' 
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <strong style={{ color: news.isUrgent ? '#D32F2F' : '#333', fontSize: '1.1rem' }}>
                            {news.isUrgent && '🚨 '} {news.title}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(news.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, color: '#555', whiteSpace: 'pre-wrap' }}>{news.content}</p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
