import React from "react";

function ProgressBar({ value }) {
  return (
    <div
      style={{
        width: "100%",
        background: "#eee",
        borderRadius: "10px",
        overflow: "hidden",
        height: "14px",
        marginTop: "6px",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background:
            value > 70 ? "#4caf50" : value > 40 ? "#ff9800" : "#f44336",
          transition: "width 0.5s",
        }}
      />
    </div>
  );
}

export default ProgressBar;
