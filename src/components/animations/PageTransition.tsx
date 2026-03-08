import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
    transition={{ 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1],
      filter: { duration: 0.3 }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default PageTransition;
