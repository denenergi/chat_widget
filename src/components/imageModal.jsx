import React from "react";
import ImageModalIcon from "./svg/ImageModalIcon";

const ImageModal = ({ onClose, imageUrl }) => {
  return (
    <div className="jedidesk-modal-container">
      <div className="jedidesk-modal-wrapper">
        <button
          onClick={() => onClose()}
          className="jedidesk-modal-container__close-button"
        >
         <ImageModalIcon/>
        </button>
        <img
          src={imageUrl}
          className="jedidesk-modal-container__image"
          alt="jedidesk-modal"
        />
      </div>
    </div>
  );
};

export default ImageModal;
