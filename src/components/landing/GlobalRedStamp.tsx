'use client';

import { useEffect, useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface GlobalRedStampProps {
  progress: MotionValue<number>;
}

export default function GlobalRedStamp({ progress }: GlobalRedStampProps) {
  // Mapping global scroll progress to position
  const x = useTransform(progress, 
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 1], 
    ["50vw", "50vw", "75vw", "20vw", "50vw", "50vw", "70vw", "30vw", "50vw", "80vw", "50vw"]
  );

  const y = useTransform(progress,
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 1],
    ["10vh", "65vh", "50vh", "50vh", "50vh", "50vh", "50vh", "50vh", "40vh", "30vh", "65vh"]
  );

  const scale = useTransform(progress,
    [0, 0.08, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.78, 0.88, 0.95, 1],
    [0, 1, 1.1, 1, 1.2, 1, 1.1, 1.2, 1.1, 1, 1.3, 2]
  );

  const opacity = useTransform(progress, [0, 0.9, 0.98, 1], [1, 1, 0.5, 0]);

  const [storyStage, setStoryStage] = useState({ label: "Watch This" });
  
  useEffect(() => {
    const unsub = progress.on("change", (v) => {
      if (v < 0.28) setStoryStage({ label: "Rec'd Club" });
      else if (v < 0.42) setStoryStage({ label: "Send Rec" });
      else if (v < 0.56) setStoryStage({ label: "The Verdict" });
      else if (v < 0.70) setStoryStage({ label: "Taste Match" });
      else if (v < 0.82) setStoryStage({ label: "Score Up" });
      else if (v < 0.94) setStoryStage({ label: "Crew Memory" });
      else setStoryStage({ label: "Join Club" });
    });
    return unsub;
  }, [progress]);

  return (
    <motion.div 
      style={{ x, y, scale, opacity, originX: "50%", originY: "50%" }}
      className="fixed top-0 left-0 z-[100] pointer-events-none -ml-[75px] -mt-[24px] hidden md:block"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-cinema-red/50 blur-xl rounded-full" />
        <div className="relative flex items-center justify-center px-6 py-3 bg-cinema-red rounded-full shadow-[0_0_40px_rgba(234,51,51,0.8)] border border-white/20">
           <span className="font-black text-[10px] uppercase tracking-widest text-bone whitespace-nowrap">
             {storyStage.label}
           </span>
        </div>
      </div>
    </motion.div>
  );
}
