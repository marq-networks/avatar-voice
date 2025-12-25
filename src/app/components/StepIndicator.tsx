import { motion } from 'motion/react';

interface StepIndicatorProps {
  stepNumber: number;
  isActive: boolean;
  isPast: boolean;
  onClick: () => void;
  animationDelay?: number;
}

export function StepIndicator({ 
  stepNumber, 
  isActive, 
  isPast, 
  onClick, 
  animationDelay = 0 
}: StepIndicatorProps) {
  return (
    <motion.button
      // ENTRY ANIMATION: Scale from 0 to 1 with spring physics
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: animationDelay, 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      }}
      onClick={onClick}
      // SIZE CHANGES: Active is larger (64px), inactive is smaller (52px)
      className={`relative transition-all duration-300 ${
        isActive
          ? 'w-[64px] h-[64px]'
          : 'w-[52px] h-[52px] hover:scale-110'
      }`}
    >
      <div
        // GLASSMORPHIC STYLING WITH 3 STATES
        className={`w-full h-full rounded-full flex items-center justify-center font-bold transition-all shadow-xl backdrop-blur-sm relative ${
          isActive
            ? 'bg-gradient-to-br from-[#39FF14] to-[#2ecc11] text-black ring-4 ring-[#39FF14]/30 shadow-[#39FF14]/50'
            : isPast
            ? 'bg-white/10 text-[#39FF14] border-2 border-[#39FF14]/40 hover:border-[#39FF14] hover:shadow-lg hover:shadow-[#39FF14]/20'
            : 'bg-white/5 text-white/30 border-2 border-white/10 hover:border-white/20 hover:text-white/50 hover:bg-white/10'
        }`}
      >
        {/* PULSING GLOW ANIMATION - Only on active state */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-[#39FF14]/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* NUMBER TEXT */}
        <span className={`relative z-10 ${isActive ? 'text-2xl' : 'text-base'}`}>
          {String(stepNumber).padStart(2, '0')}
        </span>
      </div>
    </motion.button>
  );
}

/* ============================================
   COMPLETE STYLING BREAKDOWN
   ============================================

   1. ENTRY ANIMATION (Backwards to Forward):
   ------------------------------------------
   initial={{ scale: 0, opacity: 0 }}
   animate={{ scale: 1, opacity: 1 }}
   transition={{ 
     type: "spring",     // Physics-based animation
     stiffness: 200,     // How bouncy it is
     damping: 15         // How much it settles
   }}

   2. THREE VISUAL STATES:
   ------------------------------------------
   
   ACTIVE (Current Step):
   - Size: 64px × 64px
   - Background: Neon green gradient (from-[#39FF14] to-[#2ecc11])
   - Text: Black
   - Ring: 4px ring with 30% opacity neon green (ring-4 ring-[#39FF14]/30)
   - Shadow: Neon green glow (shadow-[#39FF14]/50)
   - Pulsing animation: Scales 1 → 1.3 → 1, opacity 0.5 → 0 → 0.5 (2s infinite)

   PAST (Completed Steps):
   - Size: 52px × 52px
   - Background: White 10% opacity (bg-white/10)
   - Text: Neon green (#39FF14)
   - Border: 2px neon green 40% opacity (border-[#39FF14]/40)
   - Hover: Brighter border + neon green shadow

   FUTURE (Upcoming Steps):
   - Size: 52px × 52px
   - Background: White 5% opacity (bg-white/5)
   - Text: White 30% opacity (text-white/30)
   - Border: 2px white 10% opacity (border-white/10)
   - Hover: Slightly brighter background and text

   3. GLASSMORPHIC EFFECT:
   ------------------------------------------
   - backdrop-blur-sm: Frosted glass blur
   - Semi-transparent backgrounds: bg-white/5, bg-white/10
   - Subtle borders with opacity
   - shadow-xl: Depth shadow

   4. HOVER INTERACTIONS:
   ------------------------------------------
   - hover:scale-110: Grows 10% on hover (inactive only)
   - hover:border-[#39FF14]: Border turns full neon green
   - hover:shadow-lg: Larger shadow
   - transition-all duration-300: Smooth 300ms transitions

   5. PULSING BREATHING EFFECT:
   ------------------------------------------
   animate={{
     scale: [1, 1.3, 1],        // Grows then shrinks
     opacity: [0.5, 0, 0.5],    // Fades out then in
   }}
   transition={{
     duration: 2,                // 2 second cycle
     repeat: Infinity,           // Never stops
     ease: "easeInOut",         // Smooth acceleration
   }}

   USAGE EXAMPLE:
   ------------------------------------------
   <StepIndicator
     stepNumber={5}
     isActive={currentStep === 5}
     isPast={currentStep > 5}
     onClick={() => setCurrentStep(5)}
     animationDelay={0.2}
   />

   CUSTOMIZATION FOR OTHER APPS:
   ------------------------------------------
   Replace #39FF14 with your brand color:
   - from-[#39FF14] → from-[#YOUR_COLOR]
   - ring-[#39FF14]/30 → ring-[#YOUR_COLOR]/30
   - shadow-[#39FF14]/50 → shadow-[#YOUR_COLOR]/50
   - text-[#39FF14] → text-[#YOUR_COLOR]
   - border-[#39FF14]/40 → border-[#YOUR_COLOR]/40
   
   Adjust sizes:
   - w-[64px] h-[64px] → Your active size
   - w-[52px] h-[52px] → Your inactive size

============================================ */
