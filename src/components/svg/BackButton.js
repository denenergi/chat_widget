import * as React from "react";

const BackButton = (props) => (
  <svg
    width={30}
    height={30}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="helpedButtons"
    {...props}
  >
    <g
      opacity={0.4}
      stroke={props.color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23.75 15H6.25M15 6.25 6.25 15 15 23.75" />
    </g>
  </svg>
);

export default BackButton;
