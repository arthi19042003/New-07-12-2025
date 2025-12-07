import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ResumeView from '../components/ResumeView';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  async function fetchResume() {
    setLoading(true);
    try {
      const res = await api.get(`/hiring-manager/resumes/${id}`);
      setResume(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load resume.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action) {
    setActionLoading(true);
    try {
      const payload = { action };
      if (action === 'schedule') {
        payload.scheduleAt = new Date().toISOString();
      }

      const res = await api.post(`/hiring-manager/resumes/${id}/action`, payload);
      setResume(res.data.resume);
      alert(`Action "${action}" successful`);
    } catch (err) {
      console.error(err);
      alert('Action failed.');
    } finally {
      setActionLoading(false);
    }
  }

  const handleBack = () => navigate('/dashboard/hiring-manager');

  if (loading) return <div>Loading resume...</div>;
  if (!resume) return <div>Resume not found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <button onClick={handleBack} style={{ marginBottom: 16 }}>
        ← Back to Dashboard
      </button>

      <h2 style={{ marginBottom: 8 }}>Resume Details</h2>
      <div style={{ marginBottom: 20, fontSize: 16 }}>
        <strong>{resume.name}</strong> — {resume.positionTitle}
        <div style={{ fontSize: 13, color: '#666' }}>{resume.email}</div>
        <div style={{ fontSize: 13, color: '#666' }}>Agency: {resume.agency}</div>
        <div style={{ marginTop: 8 }}>
          <span
            style={{
              background: '#eef',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Status: {resume.status}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <button disabled={actionLoading} onClick={() => handleAction('shortlist')}>
          Shortlist
        </button>
        <button disabled={actionLoading} onClick={() => handleAction('reject')}>
          Reject
        </button>
        <button disabled={actionLoading} onClick={() => handleAction('schedule')}>
          Schedule
        </button>
      </div>

      {/* Resume Content */}
      <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
        <ResumeView resume={resume} />
      </div>
    </div>
  );
}
