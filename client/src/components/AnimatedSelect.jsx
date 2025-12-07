import React from "react";

import { FiChevronDown } from "react-icons/fi";

export default function AnimatedSelect({ options = [], value, onChange, name }) {
  return (
    <div style={{position:"relative"}}>
      <select name={name} className="input animated-select" value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map((o)=> <option key={o} value={o}>{o}</option>)}
      </select>
      <FiChevronDown style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"var(--muted)"}}/>
    </div>
  );
}
