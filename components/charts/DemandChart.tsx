import React from 'react';

interface DemandChartProps {
  data: Array<{ category: string; demand: number }>;
  className?: string;
}

export const DemandChart: React.FC<DemandChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Demand Analysis</h3>
      <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
        <p className="text-gray-500">Demand chart visualization</p>
      </div>
    </div>
  );
};
