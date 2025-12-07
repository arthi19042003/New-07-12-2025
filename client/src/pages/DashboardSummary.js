import React, {useState,useEffect} from 'react';
import API from '../api';
export default function DashboardSummary(){
  const [s,setS]=useState(null);
  useEffect(()=>{ API.get('/api/dashboard').then(r=>setS(r.data)).catch(()=>setS(null)) },[]);
  return (
    <div className="page">
      <h2>Dashboard Summary</h2>
      {!s ? <p>Loading...</p> : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
          <div className="card-small">Candidates <strong>{s.candidates}</strong></div>
          <div className="card-small">Positions <strong>{s.positions}</strong></div>
          <div className="card-small">Submissions <strong>{s.submissions}</strong></div>
          <div className="card-small">Interviews <strong>{s.interviews}</strong></div>
          <div className="card-small">Messages <strong>{s.messages}</strong></div>
          <div className="card-small">POs <strong>{s.purchaseOrders}</strong></div>
        </div>
      )}
    </div>
  )
}
