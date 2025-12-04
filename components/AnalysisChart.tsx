import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { VisionAnalysis } from '../types';

interface AnalysisChartProps {
  data: VisionAnalysis['tone_scores'];
}

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-64 bg-white rounded-xl p-4 shadow-sm border border-fashion-100">
      <h3 className="text-xs font-bold text-fashion-400 uppercase tracking-widest mb-2 text-center">Cá tính thương hiệu</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e0dad3" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#8c7360', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Điểm số"
            dataKey="value"
            stroke="#8c7360"
            fill="#a6907e"
            fillOpacity={0.6}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#8c7360', fontSize: '12px', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};