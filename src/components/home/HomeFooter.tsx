
import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const HomeFooter = () => {
  return (
    <footer className="py-10 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-gradient font-bold text-xl tracking-tight">
              <HeartPulse className="inline-block mr-2 h-5 w-5 text-primary" />
              Health<span className="font-extralight">Connect</span>
            </Link>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
            <Link to="/health-report" className="hover:text-primary transition-colors">Health Report</Link>
            <Link to="/nutrition" className="hover:text-primary transition-colors">Nutrition</Link>
            <Link to="/ai-bot" className="hover:text-primary transition-colors">AI Bot</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t text-center text-sm text-foreground">
          &copy; {new Date().getFullYear()} Health Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
