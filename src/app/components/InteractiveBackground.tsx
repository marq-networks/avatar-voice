import { motion } from 'motion/react';
import { 
  User, 
  Mic, 
  Video, 
  AudioWaveform, 
  Brain, 
  Sparkles, 
  Cpu, 
  MessageCircle, 
  Camera, 
  Headphones,
  Radio,
  Activity,
  Zap,
  Eye,
  ScanFace,
  AudioLines,
  Volume2,
  MonitorPlay,
  UserCircle,
  Bot
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface FloatingIconProps {
  Icon: any;
  initialX: string;
  initialY: string;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  color?: string;
}

function FloatingIcon({ Icon, initialX, initialY, duration, delay, size, opacity, color = '#39FF14' }: FloatingIconProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: opacity,
        scale: 1,
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
        opacity: { duration: 1 }
      }}
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.01}px, ${(mousePosition.y - window.innerHeight / 2) * 0.01}px)`
      }}
      className="pointer-events-none transition-transform duration-1000 ease-out"
    >
      <Icon size={size} strokeWidth={1.5} style={{ color }} />
    </motion.div>
  );
}

interface WaveformAnimationProps {
  left: string;
  top: string;
  delay: number;
}

function WaveformAnimation({ left, top, delay }: WaveformAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.04 }}
      transition={{ delay, duration: 1 }}
      className="absolute pointer-events-none"
      style={{ left, top }}
    >
      <svg width="200" height="80" viewBox="0 0 200 80">
        {[...Array(12)].map((_, i) => (
          <motion.rect
            key={i}
            x={i * 16 + 4}
            y="20"
            width="8"
            height="40"
            fill="#39FF14"
            opacity={0.15}
            animate={{
              height: [40, 20 + Math.random() * 40, 40],
              y: [20, 30 - Math.random() * 20, 20]
            }}
            transition={{
              duration: 1.5 + Math.random() * 1,
              delay: i * 0.1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

interface NeuralNetworkProps {
  left: string;
  top: string;
  delay: number;
}

function NeuralNetwork({ left, top, delay }: NeuralNetworkProps) {
  const nodes = [
    { x: 40, y: 20 },
    { x: 20, y: 60 },
    { x: 60, y: 60 },
    { x: 40, y: 100 },
    { x: 100, y: 40 },
    { x: 120, y: 80 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.06 }}
      transition={{ delay, duration: 1 }}
      className="absolute pointer-events-none"
      style={{ left, top }}
    >
      <svg width="150" height="120" viewBox="0 0 150 120">
        {/* Connections */}
        {nodes.map((node, i) => 
          nodes.slice(i + 1).map((targetNode, j) => (
            <motion.line
              key={`${i}-${j}`}
              x1={node.x}
              y1={node.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#39FF14"
              strokeWidth="1"
              opacity={0.2}
              animate={{
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 3,
                delay: (i + j) * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))
        )}
        
        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="4"
            fill="#39FF14"
            opacity={0.4}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

interface CircuitPatternProps {
  left: string;
  top: string;
  delay: number;
}

function CircuitPattern({ left, top, delay }: CircuitPatternProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.03 }}
      transition={{ delay, duration: 1 }}
      className="absolute pointer-events-none"
      style={{ left, top }}
    >
      <svg width="180" height="180" viewBox="0 0 180 180">
        <motion.path
          d="M20,20 L80,20 L80,60 L140,60 L140,120 L100,120 L100,160 M80,60 L80,100 M140,60 L160,60"
          stroke="#39FF14"
          strokeWidth="2"
          fill="none"
          opacity={0.15}
          animate={{
            pathLength: [0, 1],
            opacity: [0.05, 0.2, 0.05]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {[20, 80, 140, 100].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={[20, 60, 60, 120][i]}
            r="6"
            fill="#39FF14"
            opacity={0.3}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 2,
              delay: i * 0.4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

interface GridPatternProps {
  left: string;
  top: string;
}

function GridPattern({ left, top }: GridPatternProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.015 }}
      transition={{ duration: 2 }}
      className="absolute pointer-events-none"
      style={{ left, top }}
    >
      <svg width="300" height="300" viewBox="0 0 300 300">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#39FF14" strokeWidth="0.5" opacity={0.3} />
          </pattern>
        </defs>
        <rect width="300" height="300" fill="url(#grid)" />
      </svg>
    </motion.div>
  );
}

export function InteractiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Floating Icons - Avatar Related */}
      <FloatingIcon Icon={User} initialX="10%" initialY="15%" duration={8} delay={0} size={48} opacity={0.06} />
      <FloatingIcon Icon={UserCircle} initialX="85%" initialY="20%" duration={10} delay={0.5} size={56} opacity={0.05} />
      <FloatingIcon Icon={ScanFace} initialX="15%" initialY="70%" duration={9} delay={1} size={52} opacity={0.06} />
      <FloatingIcon Icon={Bot} initialX="90%" initialY="75%" duration={11} delay={1.5} size={60} opacity={0.04} />
      
      {/* Voice & Audio Related */}
      <FloatingIcon Icon={Mic} initialX="25%" initialY="25%" duration={7} delay={0.3} size={44} opacity={0.08} />
      <FloatingIcon Icon={AudioWaveform} initialX="75%" initialY="40%" duration={9} delay={0.8} size={50} opacity={0.06} />
      <FloatingIcon Icon={Headphones} initialX="5%" initialY="50%" duration={10} delay={1.2} size={46} opacity={0.05} />
      <FloatingIcon Icon={AudioLines} initialX="80%" initialY="60%" duration={8} delay={1.7} size={48} opacity={0.07} />
      <FloatingIcon Icon={Volume2} initialX="20%" initialY="85%" duration={9} delay={2} size={42} opacity={0.06} />
      <FloatingIcon Icon={Radio} initialX="70%" initialY="10%" duration={11} delay={0.6} size={44} opacity={0.05} />
      
      {/* Video & Camera Related */}
      <FloatingIcon Icon={Video} initialX="40%" initialY="10%" duration={10} delay={0.4} size={50} opacity={0.07} />
      <FloatingIcon Icon={Camera} initialX="60%" initialY="85%" duration={8} delay={1.4} size={48} opacity={0.06} />
      <FloatingIcon Icon={MonitorPlay} initialX="30%" initialY="60%" duration={9} delay={1.8} size={52} opacity={0.05} />
      <FloatingIcon Icon={Eye} initialX="65%" initialY="30%" duration={10} delay={0.9} size={46} opacity={0.06} />
      
      {/* AI & Tech Related */}
      <FloatingIcon Icon={Brain} initialX="50%" initialY="20%" duration={12} delay={0.7} size={58} opacity={0.05} />
      <FloatingIcon Icon={Cpu} initialX="45%" initialY="75%" duration={9} delay={1.1} size={50} opacity={0.06} />
      <FloatingIcon Icon={Sparkles} initialX="35%" initialY="40%" duration={8} delay={1.3} size={40} opacity={0.08} />
      <FloatingIcon Icon={Zap} initialX="55%" initialY="55%" duration={7} delay={1.6} size={44} opacity={0.07} />
      <FloatingIcon Icon={Activity} initialX="12%" initialY="35%" duration={10} delay={1.9} size={48} opacity={0.06} />
      <FloatingIcon Icon={MessageCircle} initialX="88%" initialY="45%" duration={9} delay={2.1} size={46} opacity={0.05} />
      
      {/* Waveform Animations */}
      <WaveformAnimation left="10%" top="45%" delay={0.5} />
      <WaveformAnimation left="75%" top="70%" delay={1.2} />
      <WaveformAnimation left="40%" top="15%" delay={1.8} />
      
      {/* Neural Networks */}
      <NeuralNetwork left="20%" top="10%" delay={0.8} />
      <NeuralNetwork left="70%" top="50%" delay={1.5} />
      <NeuralNetwork left="5%" top="75%" delay={2.2} />
      
      {/* Circuit Patterns */}
      <CircuitPattern left="82%" top="15%" delay={1} />
      <CircuitPattern left="25%" top="55%" delay={1.7} />
      <CircuitPattern left="50%" top="80%" delay={2.4} />
      
      {/* Grid Patterns */}
      <GridPattern left="0%" top="0%" />
      <GridPattern left="60%" top="20%" />
      <GridPattern left="15%" top="60%" />
      
      {/* Subtle gradient orbs for depth */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.02, 0.04, 0.02],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-10 right-20 w-96 h-96 bg-[#39FF14] rounded-full blur-[120px]"
      />
      
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.03, 0.01, 0.03],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 left-20 w-80 h-80 bg-[#39FF14] rounded-full blur-[100px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.015, 0.035, 0.015],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39FF14] rounded-full blur-[140px]"
      />
    </div>
  );
}