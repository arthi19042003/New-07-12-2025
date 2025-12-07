import React, { useState } from 'react';

export default function ResumeView({ resume, onAction }) {
  const [note, setNote] = useState('');

  if (!resume) {
    return <div>No resume data available.</div>;
  }

  const handleAction = (action) => {
    if (!onAction) return; 

    if (action === 'hire') {
      if (!window.confirm(`Are you sure you want to HIRE ${resume.name}?`)) return;
    }
    if (action === 'reject') {
      if (!window.confirm(`Are you sure you want to REJECT ${resume.name}?`)) return;
    }

    const payload = { note };

    if (action === 'schedule') {
      payload.scheduleAt = new Date().toISOString();
    }

    onAction(resume._id, action, payload);
    setNote('');
  };

  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 16,
        background: '#fff',
      }}
    >
      {/* Candidate Header */}
      <div style={{ marginBottom: 12, borderBottom: '1px solid #f5f5f5', paddingBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{resume.name}</h3>
        <div style={{ fontSize: 13, color: '#666' }}>
          {resume.email} {resume.phone ? `• ${resume.phone}` : ''}
        </div>
        <div style={{ fontSize: 14, marginTop: 6 }}>
          <strong>Position:</strong> {resume.positionTitle}
        </div>
        <div style={{ fontSize: 14 }}>
          <strong>Agency:</strong> {resume.agency}
        </div>
        <div style={{ marginTop: 6 }}>
          <span
            style={{
              background: '#eef',
              padding: '4px 10px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Status: {resume.status}
          </span>
        </div>
      </div>

      {/* Internal Notes Input */}
      {onAction && (
        <>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>Note (Internal)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add your comment or feedback..."
              style={{
                width: '100%',
                minHeight: 80,
                padding: 8,
                marginTop: 4,
                border: '1px solid #ccc',
                borderRadius: 6,
                fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* ✅ Shortlist: Hide if already Shortlisted, Hired, or Rejected */}
            {resume.status !== 'Shortlisted' && resume.status !== 'Hired' && resume.status !== 'Rejected' && (
              <button
                onClick={() => handleAction('shortlist')}
                style={btnStyle('#22c55e')}
              >
                Shortlist
              </button>
            )}

            {/* ✅ Reject: Hide if already Rejected or Hired */}
            {resume.status !== 'Rejected' && resume.status !== 'Hired' && (
              <button
                onClick={() => handleAction('reject')}
                style={btnStyle('#ef4444')}
              >
                Reject
              </button>
            )}

            <button
              onClick={() => handleAction('schedule')}
              style={btnStyle('#3b82f6')}
            >
              Schedule Interview
            </button>

            {/* ✅ Hire: Hide if already Hired or Rejected */}
            {resume.status !== 'Hired' && resume.status !== 'Rejected' && (
              <button
                onClick={() => handleAction('hire')}
                style={btnStyle('#9333ea')}
              >
                Hire
              </button>
            )}
          </div>
        </>
      )}

      {/* Notes History */}
      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 6 }}>Notes</h4>
        {resume.notes && resume.notes.length > 0 ? (
          resume.notes
            .slice()
            .reverse()
            .map((n, idx) => (
              <div
                key={idx}
                style={{
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: 8,
                  marginTop: 8,
                }}
              >
                <div style={{ fontSize: 12, color: '#444' }}>
                  <strong>{n.by}</strong> —{' '}
                  <small>{new Date(n.date).toLocaleString()}</small>
                </div>
                <div style={{ fontSize: 13 }}>{n.text}</div>
              </div>
            ))
        ) : (
          <div style={{ fontSize: 13, color: '#666' }}>No notes yet.</div>
        )}
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    backgroundColor: color,
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'background 0.2s',
  };
}