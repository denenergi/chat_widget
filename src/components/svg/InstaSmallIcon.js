import React from "react";

const InstaSmallIcon = ({ color, className }) => {
  return (
<svg 
xmlns="http://www.w3.org/2000/svg" 
width="24" 
height="24" 
viewBox="0 0 24 24"
style={{marginRight: '10px', fill: '#dc2743'}}
>
  <path d="M14.829 6.302c-.738-.034-.96-.04-2.829-.04s-2.09.007-2.828.04c-1.899.087-2.783.986-2.87 2.87-.033.738-.041.959-.041 2.828s.008 2.09.041 2.829c.087 1.879.967 2.783 2.87 2.87.737.033.959.041 2.828.041 1.87 0 2.091-.007 2.829-.041 1.899-.086 2.782-.988 2.87-2.87.033-.738.04-.96.04-2.829s-.007-2.09-.04-2.828c-.088-1.883-.973-2.783-2.87-2.87zm-2.829 9.293c-1.985 0-3.595-1.609-3.595-3.595 0-1.985 1.61-3.594 3.595-3.594s3.595 1.609 3.595 3.594c0 1.985-1.61 3.595-3.595 3.595zm3.737-6.491c-.464 0-.84-.376-.84-.84 0-.464.376-.84.84-.84.464 0 .84.376.84.84 0 .463-.376.84-.84.84zm-1.404 2.896c0 1.289-1.045 2.333-2.333 2.333s-2.333-1.044-2.333-2.333c0-1.289 1.045-2.333 2.333-2.333s2.333 1.044 2.333 2.333zm-2.333-12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.958 14.886c-.115 2.545-1.532 3.955-4.071 4.072-.747.034-.986.042-2.887.042s-2.139-.008-2.886-.042c-2.544-.117-3.955-1.529-4.072-4.072-.034-.746-.042-.985-.042-2.886 0-1.901.008-2.139.042-2.886.117-2.544 1.529-3.955 4.072-4.071.747-.035.985-.043 2.886-.043s2.14.008 2.887.043c2.545.117 3.957 1.532 4.071 4.071.034.747.042.985.042 2.886 0 1.901-.008 2.14-.042 2.886z"/>
</svg>

    // <svg
    //  className={className}
    //  xmlns="http://www.w3.org/2000/svg" 
    //  width="24" 
    //  height="24"
    //  data-name="Layer 1" 
    //  viewBox="0 0 128 128" 
    //  id="instagram"
    //  style={{marginRight: '10px'}}
    //  >
    //     <defs>
    //         <clipPath id="b"><circle cx="64" cy="64" r="64" fill="none"></circle></clipPath>
    //         <clipPath id="c"><path fill="none" d="M104-163H24a24.07 24.07 0 0 0-24 24v80a24.07 24.07 0 0 0 24 24h80a24.07 24.07 0 0 0 24-24v-80a24.07 24.07 0 0 0-24-24Zm16 104a16 16 0 0 1-16 16H24A16 16 0 0 1 8-59v-80a16 16 0 0 1 16-16h80a16 16 0 0 1 16 16Z"></path></clipPath>
    //         <clipPath id="e"><circle cx="82" cy="209" r="5" fill="none"></circle></clipPath>
    //         <clipPath id="g"><path fill="none" d="M64-115a16 16 0 0 0-16 16 16 16 0 0 0 16 16 16 16 0 0 0 16-16 16 16 0 0 0-16-16Zm0 24a8 8 0 0 1-8-8 8 8 0 0 1 8-8 8 8 0 0 1 8 8 8 8 0 0 1-8 8Z"></path></clipPath>
    //         <clipPath id="h"><path fill="none" d="M84-63H44a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h40a16 16 0 0 1 16 16v40a16 16 0 0 1-16 16Zm-40-64a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h40a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8Z"></path></clipPath>
    //         <clipPath id="i"><circle cx="82" cy="-117" r="5" fill="none"></circle></clipPath>
    //         <radialGradient id="a" cx="27.5" cy="121.5" r="137.5" gradientUnits="userSpaceOnUse">
    //             <stop offset="0" stopColor="#ffd676"></stop><stop offset=".25" stopColor="#f2a454"></stop>
    //             <stop offset=".38" stopColor="#f05c3c"></stop><stop offset=".7" stopColor="#c22f86"></stop>
    //             <stop offset=".96" stopColor="#6666ad"></stop><stop offset=".99" stopColor="#5c6cb2"></stop>
    //             </radialGradient><radialGradient id="d" cx="27.5" cy="-41.5" r="148.5"></radialGradient>
    //             <radialGradient id="f" cx="13.87" cy="303.38" r="185.63"></radialGradient>
    //             <radialGradient id="j" cx="13.87" cy="-22.62" r="185.63"></radialGradient>
    //             </defs><g clipPath="url(#b)"><circle cx="27.5" cy="121.5" r="137.5" fill="url(#a)"></circle></g>
    //             <g clipPath="url(#c)"><circle cx="27.5" cy="-41.5" r="148.5" fill="url(#d)"></circle></g>
    //             <g clipPath="url(#e)"><circle cx="13.87" cy="303.38" r="185.63" fill="url(#f)"></circle></g><g clipPath="url(#g)"><circle cx="27.5" cy="-41.5" r="148.5" fill="url(#d)"></circle></g><g clipPath="url(#h)"><circle cx="27.5" cy="-41.5" r="148.5" fill="url(#d)"></circle></g><g clipPath="url(#i)"><circle cx="13.87" cy="-22.62" r="185.63" fill="url(#j)"></circle></g><circle cx="82" cy="46" r="5" fill="#fff"></circle><path fill="#fff" d="M64 48a16 16 0 1 0 16 16 16 16 0 0 0-16-16Zm0 24a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"></path><rect width="64" height="64" x="32" y="32" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="8" rx="12" ry="12"></rect></svg>
  
)
};

export default InstaSmallIcon;