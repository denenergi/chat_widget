import React from "react";

const FBIcon = ({ fbBotLink, color }) => {
  const onClickHandler = () => {
    window.open(fbBotLink, "blank");
  };
  return (
    <div onClick={onClickHandler} className="telegram-wrapper">
     <svg width="9" height="18" viewBox="0 0 9 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.08971 3.4332H8.65638V0.783196C7.89784 0.704318 7.13568 0.665375 6.37305 0.666529C4.10638 0.666529 2.55638 2.04986 2.55638 4.5832V6.76653H-0.00195312V9.7332H2.55638V17.3332H5.62305V9.7332H8.17305L8.55638 6.76653H5.62305V4.87486C5.62305 3.99986 5.85638 3.4332 7.08971 3.4332Z" fill={color}/>
</svg>
    </div>
  );
};

export default FBIcon;