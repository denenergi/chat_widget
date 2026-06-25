import React from "react";

const ScrollBottom = ({ onClick, color, showCounter, messageCounter }) => {
  return (
    <div onClick={onClick} style={{width: '30px', cursor: 'pointer', pisition: 'relative'}}>
	{showCounter && messageCounter !== 0 &&
	<span className="scroll-bottom-counter" style={{color: color}}>{messageCounter}</span>
	}
  <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
	 viewBox="0 0 54 54">
<g>
	<g>
		<path fill={color} d="M1,27L1,27C1,12.641,12.641,1,27,1h0c14.359,0,26,11.641,26,26v0c0,14.359-11.641,26-26,26h0
			C12.641,53,1,41.359,1,27z"/>
		<path fill={color} d="M27,54C12.112,54,0,41.888,0,27S12.112,0,27,0s27,12.112,27,27S41.888,54,27,54z M27,2
			C13.215,2,2,13.215,2,27s11.215,25,25,25s25-11.215,25-25S40.785,2,27,2z"/>
	</g>
	<path fill="#fff" d="M27,34.999c-0.438,0-0.875-0.167-1.209-0.5L14.293,23.001c-0.391-0.391-0.391-1.023,0-1.414
		s1.023-0.391,1.414,0L27,32.88l11.293-11.293c0.391-0.391,1.023-0.391,1.414,0s0.391,1.023,0,1.414L28.209,34.499
		C27.876,34.832,27.438,34.999,27,34.999z"/>
</g>
</svg>
    </div>
  );
};

export default ScrollBottom;