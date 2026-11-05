/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { PragatiLogo } from './PragatiLogo';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'looding...',
  subMessage = 'Pragati Engineering College (Autonomous) • ExamSeat Pro'
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#FAF4F0]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 selection:bg-transparent">
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm">
        
        {/* Animated Pragati Logo Circle */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Glow Ring */}
          <motion.div
            className="absolute -inset-4 rounded-full border-2 border-[#D88C72] opacity-50 shadow-[0_0_30px_rgba(216,140,114,0.4)]"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Rotating Dashed Accent Ring */}
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-dashed border-[#A44A3F]"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Central Logo in Circular Crest */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <PragatiLogo size="xl" className="shadow-xl ring-4 ring-[#D88C72]/50" />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          {/* Requested 'looding' text */}
          <div className="flex items-center justify-center gap-1">
            <motion.span
              className="text-2xl sm:text-3xl font-black text-[#6B2F2F] tracking-wide capitalize"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {message}
            </motion.span>
            
            {/* Animated Dots */}
            <span className="flex gap-1 ml-1 pt-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#A44A3F]"
                  animate={{
                    y: [0, -6, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-bold text-[#A44A3F] tracking-wide">
            {subMessage}
          </p>

          <p className="text-[11px] font-medium text-stone-500">
            Office of the Controller of Examinations
          </p>
        </div>

      </div>
    </div>
  );
};
