import React from "react";

const SmallSendButton = ({ onClick, color, className }) => {
  return (
    <div onClick={onClick} className={`jedidesk-chat__send-button ${className}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="mask0_2138_464" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#D9D9D9"/>
        </mask>
        <g mask="url(#mask0_2138_464)">
        <path d="M3 20V14L11 12L3 10V4L22 12L3 20Z" fill="#4890F6"/>
        </g>
        </svg>
    </div>
  );
};

export default SmallSendButton;