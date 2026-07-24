import React from 'react';
import Card from './Card';
import CardBody from './Card';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className = '',
}) => {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <Card hover className={className}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm font-medium ${trendColors[trend]}`}>
                  {trend === 'up' && '+'}
                  {trendValue}%
                </span>
                <span className="text-sm text-slate-500">vs last month</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-xl border border-cyan-500/20">
            <Icon className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatCard;
