import React from 'react';

interface PriceChartProps {
  data: Array<{ date: string; price: number }>;
  className?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Price Trends</h3>
      <div className="h-64 flex items-center justify-center border border-gray-200 rounded">
        <p className="text-gray-500">Price chart visualization</p>
      </div>
    </div>
  );
};
