import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface IPhoneMockupProps {
  imageUrl: string;
  delay?: number;
  floatDuration?: number;
}

export function IPhoneMockup({ imageUrl, delay = 0, floatDuration = 3 }: IPhoneMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      className="relative"
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
      >
        {/* iPhone Frame */}
        <div className="relative w-[280px] h-[560px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[48px] p-3 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10" />
          
          {/* Screen */}
          <div className="relative w-full h-full bg-white rounded-[36px] overflow-hidden">
            <ImageWithFallback
              src={imageUrl}
              alt="Therapy AI Interface"
              className="w-full h-full object-cover"
            />
            
            {/* Screen Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
          </div>
          
          {/* Side Buttons */}
          <div className="absolute -left-1 top-24 w-1 h-8 bg-gray-800 rounded-l" />
          <div className="absolute -left-1 top-36 w-1 h-12 bg-gray-800 rounded-l" />
          <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-800 rounded-r" />
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-teal-500/20 rounded-[48px] blur-xl -z-10 scale-105" />
      </motion.div>
    </motion.div>
  );
}
