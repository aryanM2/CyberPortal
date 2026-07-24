import React from 'react';

const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    title: 'h-6 w-1/2',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24 rounded-xl',
    card: 'h-32 w-full rounded-2xl',
  };

  return (
    <div
      className={`
        animate-pulse
        bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50
        bg-[length:200%_100%]
        ${variants[variant]}
        ${className}
      `}
      style={{
        animation: 'shimmer 2s infinite',
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="mb-4" />
    <Skeleton variant="button" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
