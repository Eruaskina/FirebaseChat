import React from 'react';

interface FirebaseLogoProps {
  className?: string;
  size?: number;
}

export const FirebaseLogo: React.FC<FirebaseLogoProps> = ({ className = '', size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.89 15.672L6.255.472a.538.538 0 011.015-.232l2.544 4.792z"
        fill="#FFA000"
      />
      <path
        d="M13.23 8.358l-1.91-3.66a.54.54 0 00-.96 0L3.89 15.672l9.34-7.314z"
        fill="#F57C00"
      />
      <path
        d="M19.66 19.82l-1.92-12.01a.539.539 0 00-.916-.27L3.89 15.672l7.518 4.24a1.536 1.536 0 001.488 0l6.764-4.092z"
        fill="#FFCA28"
      />
    </svg>
  );
};
