import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar"; // Optional: if you want a consistent navbar

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      // "404 Error: User attempted to access non-existent route:",
      `404 Error: User attempted to access non-existent route: ${location.pathname}${location.search}${location.hash}`
    );
  }, [location.pathname]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const iconVariants = {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 },
    },
  };

  return (
    <>
      {/* Optional: Add Navbar for consistency if desired */}
      {/* <Navbar /> */}
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 text-slate-800 p-4 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={iconVariants} className="mb-8">
          <AlertTriangle className="h-24 w-24 text-primary animate-pulse" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary via-health-lavender to-health-pink"
        >
          404
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 mb-2">
          Oops! It seems you've ventured into uncharted territory.
        </motion.p>
        <motion.p variants={itemVariants} className="text-md text-slate-500 mb-8 max-w-md text-center">
          The page you're looking for might have been abducted by aliens, moved to a different dimension, or perhaps it never existed.
        </motion.p>

        <motion.div variants={itemVariants}>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 gap-2"
          >
            <Home className="h-5 w-5" />
            Beam Me Back Home
          </Button>
        </motion.div>

        <motion.div
          className="absolute bottom-10 right-10 opacity-15"
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="h-16 w-16 text-slate-400" />
        </motion.div>
      </motion.div>
    </>
  );
};

export default NotFound;
