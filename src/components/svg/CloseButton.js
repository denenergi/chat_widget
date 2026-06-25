import * as React from "react";

const CloseButton = (props) => (
  <svg
    width={33}
    height={33}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="helpedButtons"
    {...props}
  >
    <path
      d="m24.75 8.25-16.5 16.5M8.25 8.25l16.5 16.5"
      stroke={props.color}
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CloseButton;
