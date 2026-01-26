'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { PriceChart } from '@/components/charts/PriceChart';
import { DemandChart } from '@/components/charts/DemandChart';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Market insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-600 mt-1">All time</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analytics?.totalOrders || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">All time</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analytics?.totalUsers || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Registered</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900">Products Listed</h3>
          <p className="text-2xl font-bold text-orange-600">
            {analytics?.totalProducts || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Available</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PriceChart 
          data={analytics?.salesByMonth?.map((item: any) => ({
            date: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            price: parseFloat(item.revenue) || 0,
          })) || []}
        />
        
        <DemandChart 
          data={[
            { category: 'Sunflower Oil', demand: 85 },
            { category: 'Olive Oil', demand: 92 },
            { category: 'Coconut Oil', demand: 78 },
            { category: 'Mustard Oil', demand: 65 },
            { category: 'Sesame Oil', demand: 71 },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Top Selling Categories</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Organic Oils</span>
              <span className="text-green-600 font-semibold">+24%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Cold Pressed</span>
              <span className="text-green-600 font-semibold">+18%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">Premium Quality</span>
              <span className="text-green-600 font-semibold">+15%</span>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-green-500 bg-green-50">
              <p className="font-medium text-green-800">New order received</p>
              <p className="text-sm text-green-600">2 minutes ago</p>
            </div>
            <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
              <p className="font-medium text-blue-800">New farmer registered</p>
              <p className="text-sm text-blue-600">15 minutes ago</p>
            </div>
            <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
              <p className="font-medium text-purple-800">Price prediction updated</p>
              <p className="text-sm text-purple-600">1 hour ago</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
