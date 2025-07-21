import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface AccuracyChartProps {
  whiteAccuracy: number;
  blackAccuracy: number;
}

export const AccuracyChart: React.FC<AccuracyChartProps> = ({ whiteAccuracy, blackAccuracy }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Accuracy Comparison</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* White Accuracy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
              <span className="text-gray-700 font-semibold">White Player</span>
            </div>
            <span className="text-3xl font-bold text-green-600">{whiteAccuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${whiteAccuracy}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            {whiteAccuracy >= 80 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Excellent Performance</span>
              </>
            ) : whiteAccuracy >= 70 ? (
              <>
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 font-medium">Good Performance</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Needs Improvement</span>
              </>
            )}
          </div>
        </div>
        
        {/* Black Accuracy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span className="text-gray-700 font-semibold">Black Player</span>
            </div>
            <span className="text-3xl font-bold text-green-600">{blackAccuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${blackAccuracy}%` }}
            ></div>
          </div>
          <div className="flex items-center gap-2">
            {blackAccuracy >= 80 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Excellent Performance</span>
              </>
            ) : blackAccuracy >= 70 ? (
              <>
                <TrendingUp className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-yellow-600 font-medium">Good Performance</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Needs Improvement</span>
              </>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};