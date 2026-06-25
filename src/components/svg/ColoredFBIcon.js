import React from "react";

const ColoredFBIcon = ({width, height, className = ''}) => (
<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="24" height="24" rx="12" fill="#1877F2"/>
<path d="M13.8196 8.10343H14.9163V6.24843C14.3853 6.19322 13.8518 6.16596 13.318 6.16677C11.7313 6.16677 10.6463 7.1351 10.6463 8.90843V10.4368H8.85547V12.5134H10.6463V17.8334H12.793V12.5134H14.578L14.8463 10.4368H12.793V9.1126C12.793 8.5001 12.9563 8.10343 13.8196 8.10343Z" fill="white"/>
</svg>
);

export default ColoredFBIcon;