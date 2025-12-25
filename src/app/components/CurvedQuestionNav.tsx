import { motion } from 'motion/react';
import { Home } from 'lucide-react';
import { Button } from './ui/button';

interface CurvedQuestionNavProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
  onHomeClick: () => void;
}

export function CurvedQuestionNav({ currentStep, totalSteps, onStepClick, onHomeClick }: CurvedQuestionNavProps) {
  // Create an array of step numbers to display (show at least 4 steps)
  const getVisibleSteps = () => {
    const visible = [];
    const range = 3; // Show 3 steps before and after (total of 7 max, minimum 4)
    const start = Math.max(0, currentStep - range);
    const end = Math.min(totalSteps - 1, currentStep + range);
    
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    
    // Ensure we always show at least 4 numbers if available
    if (visible.length < 4 && totalSteps >= 4) {
      if (currentStep < 2) {
        // Near the start, show first 4
        return [0, 1, 2, 3];
      } else if (currentStep >= totalSteps - 2) {
        // Near the end, show last 4
        return [totalSteps - 4, totalSteps - 3, totalSteps - 2, totalSteps - 1];
      }
    }
    
    return visible;
  };

  const visibleSteps = getVisibleSteps();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed left-0 top-0 bottom-0 w-28 flex items-center justify-center pointer-events-none z-40"
    >
      {/* Curved SVG Path */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 120 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          d="M 60 100 L 60 700"
          stroke="#E5E5E5"
          strokeWidth="1.5"
          fill="none"
          opacity={1}
        />
      </svg>

      {/* Top Buttons */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 space-y-3 pointer-events-auto">
        <Button
          onClick={onHomeClick}
          variant="ghost"
          size="icon"
          className="w-11 h-11 rounded-full bg-white hover:bg-[#F6F7F8] border border-[#E5E5E5] hover:border-[#39FF14] transition-all shadow-sm group"
        >
          <Home className="w-4 h-4 text-[#4A4A4A] group-hover:text-[#39FF14] transition-colors" />
        </Button>
      </div>

      {/* Question Numbers on Vertical Line */}
      <div className="relative h-full w-full pointer-events-none flex items-center">
        <div className="w-full" style={{ height: '600px', position: 'relative', top: '0' }}>
          {visibleSteps.map((step, idx) => {
            const totalVisible = visibleSteps.length;
            const position = idx / (totalVisible - 1 || 1); // 0 to 1
            const yPercent = 5 + position * 90; // Spread from 5% to 95% of available space (maximum spacing)
            
            const isActive = step === currentStep;
            const isPast = step < currentStep;

            return (
              <motion.button
                key={step}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 15 }}
                onClick={() => onStepClick(step)}
                className={`absolute pointer-events-auto transition-all duration-300 ${
                  isActive
                    ? 'w-[64px] h-[64px]'
                    : 'w-[52px] h-[52px] hover:scale-110'
                }`}
                style={{
                  left: '50%',
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center font-bold transition-all shadow-xl relative ${
                    isActive
                      ? 'bg-gradient-to-br from-[#39FF14] to-[#2ecc11] text-black ring-4 ring-[#39FF14]/20 shadow-[#39FF14]/30'
                      : isPast
                      ? 'bg-white text-[#39FF14] border-2 border-[#39FF14]/50 hover:border-[#39FF14] hover:shadow-lg hover:shadow-[#39FF14]/10'
                      : 'bg-white text-[#4A4A4A] border-2 border-[#E5E5E5] hover:border-[#39FF14]/30 hover:text-[#0A0A0A]'
                  }`}
                >
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
                  <span className={`relative z-10 ${isActive ? 'text-2xl' : 'text-base'}`}>
                    {String(step + 1).padStart(2, '0')}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}