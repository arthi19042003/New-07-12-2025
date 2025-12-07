import React from "react";

export default function Pagination({ page, setPage, totalPages }) {
  if (!totalPages || totalPages <= 1) return null;
  const arr = Array.from({length: totalPages}, (_,i)=>i+1);
  return (
    <div className="pagination">
      <button className="pg-num" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
      {arr.map(n=>(
        <button key={n} className={"pg-num "+(n===page?"active":"")} onClick={()=>setPage(n)}>{n}</button>
      ))}
      <button className="pg-num" disabled={page===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
    </div>
  );
}
