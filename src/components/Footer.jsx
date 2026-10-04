import React from "react";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-textMain/5 relative z-10">
      <div className="w-full max-w-7xl 2xl:max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
        <h3 className="text-2xl font-heading font-bold text-gradient mb-2">
          Kaileshwaran P
        </h3>
        <p className="text-muted-force mb-8">
          Problem Solver & Algorithmic Thinker
        </p>

        <div className="text-sm text-muted-force flex items-center justify-center gap-1">
          &copy; {new Date().getFullYear()} Kailesh's Portfolio. Crafted with{" "}
          <Heart size={14} className="text-red-500 mx-1" /> by Kailesh.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
