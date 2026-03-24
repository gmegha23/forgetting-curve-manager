import React from "react";

function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", fontWeight: "bold" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          marginTop: "5px",
        }}
      />
    </div>
  );
}

export default InputField;
