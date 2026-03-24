import React from "react";

function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        background: "linear-gradient(135deg, #6a11cb, #2575fc)",
        color: "#fff",
        padding: "10px 18px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        margin: "5px",
      }}
    >
      {children}
    </button>
  );
}

export default Button;
