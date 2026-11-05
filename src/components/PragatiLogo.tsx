/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRAGATI_LOGO_BASE64 } from '../assets/logoData';

interface PragatiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
}

export const PragatiLogo: React.FC<PragatiLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    custom: ''
  }[size];

  return (
    <div
      className={`rounded-full bg-white p-0.5 border-2 border-[#6B2F2F] shadow-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-[#D88C72]/50 ${sizeClasses} ${className}`}
    >
      <img
        src={PRAGATI_LOGO_BASE64}
        alt="Pragati Engineering College Crest"
        className="w-full h-full object-contain rounded-full"
        loading="eager"
        decoding="sync"
        onError={(e) => {
          // Fallback to static public file if needed
          const target = e.currentTarget;
          if (target.src !== '/pragati-logo.jpg') {
            target.src = '/pragati-logo.jpg';
          }
        }}
      />
    </div>
  );
};
