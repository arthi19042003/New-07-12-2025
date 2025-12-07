import React, { useState } from "react";

const RatingStars = ({ rating, onChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="rating-stars">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`star ${i < (hover ?? rating) ? "filled" : ""}`}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(i + 1)}
        >
          ★
        </span>
      ))}
      <span className="rating-value">{rating}/5</span>
    </div>
  );
};

export default RatingStars;
