import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-lg ${
        hover ? 'hover:border-cyan-500/30 hover:shadow-cyan-500/10 hover:shadow-xl transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return <div className={`px-6 py-5 border-b border-slate-700/50 ${className}`}>{children}</div>;
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`px-6 py-4 border-t border-slate-700/50 ${className}`}>{children}</div>;
};

export default Card;
