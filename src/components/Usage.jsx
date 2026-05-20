import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiHardDrive, FiPieChart } from 'react-icons/fi';
import Loader from './Loader';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Usage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invoke('get_storage_usage');
      setData(res);
    } catch (err) {
      console.error('Failed to get storage usage:', err);
      setError('Failed to load storage details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader type="spinner" text="Calculating storage usage..." subtext="This may take a few seconds." />;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full text-red-500">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: 'APT Packages', value: data.apt, color: '#F05032' },
    { name: 'Snap Packages', value: data.snap, color: '#E95420' },
    { name: 'Flatpak Apps', value: data.flatpak, color: '#4A90E2' },
    { name: 'Other Files', value: data.other, color: '#9CA3AF' },
    { name: 'Free Space', value: data.free, color: '#E5E7EB' }
  ].filter(item => item.value > 0);

  const totalUsed = data.total - data.free;
  const percentageUsed = ((totalUsed / data.total) * 100).toFixed(1);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
          <FiPieChart className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Storage Usage</h2>
          <p className="text-sm text-gray-500 mt-1">Analyze disk space used by your package managers.</p>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto w-full flex-1">
        
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <FiHardDrive className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Disk Space</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatBytes(data.total)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <FiPieChart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Space Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatBytes(totalUsed)} ({percentageUsed}%)</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <FiHardDrive className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Free Space</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatBytes(data.free)}</p>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 md:w-1/2 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-left">Disk Distribution</h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatBytes(value)} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-8 md:w-1/2 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Breakdown</h3>
            <div className="space-y-4">
              {chartData.map((item, index) => {
                const percent = ((item.value / data.total) * 100).toFixed(1);
                return (
                  <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-gray-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatBytes(item.value)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{percent}% of disk</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
