import React from 'react';
import { ChevronRight, Target, AlertTriangle, X, Crown } from 'lucide-react';
import { MoveReview } from '../../lib/types';

interface MoveReviewTableProps {
  moveReviews: MoveReview[];
}

const getLabelColor = (label: string | null) => {
  switch (label) {
    case 'Best': return 'bg-green-100 text-green-800 border-green-300';
    case 'Excellent': return 'bg-green-50 text-green-700 border-green-200';
    case 'Good': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Inaccuracy': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Mistake': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Blunder': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-600 border-gray-300';
  }
};

const getLabelIcon = (label: string | null) => {
  switch (label) {
    case 'Best':
      return <Crown className="w-3 h-3" />;
    case 'Excellent':
    case 'Good':
      return <Target className="w-3 h-3" />;
    case 'Inaccuracy':
    case 'Mistake':
      return <AlertTriangle className="w-3 h-3" />;
    case 'Blunder':
      return <X className="w-3 h-3" />;
    default:
      return null;
  }
};

export const MoveReviewTable: React.FC<MoveReviewTableProps> = ({ moveReviews }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden">
      <div className="bg-green-600 text-white p-6">
        <h2 className="text-2xl font-bold">Move-by-Move Analysis</h2>
        <p className="text-green-100 mt-1">Detailed evaluation of each move with engine analysis</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Move</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Player</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Played</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Best Move</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Evaluation</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">CP Loss</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {moveReviews.map((move, index) => (
              <tr key={move.id} className="hover:bg-green-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                  {move.move}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${move.color === 'white' ? 'bg-white border-2 border-gray-400' : 'bg-gray-800'}`}></div>
                    <span className="text-sm font-semibold text-gray-700 capitalize">{move.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-lg font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {move.san}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                      {move.bestMove}
                    </span>
                    {move.san !== move.bestMove && (
                      <ChevronRight className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {move.evalAfter !== null && (
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${move.evalAfter > 0 ? 'text-green-600' : move.evalAfter < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {move.evalAfter > 0 ? '+' : ''}{(move.evalAfter / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {move.centipawnLoss !== null ? (
                    <span className={`font-bold ${move.centipawnLoss > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {move.centipawnLoss > 0 ? '-' : ''}{move.centipawnLoss}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {move.moveAccuracy !== null ? (
                    <span className="font-bold text-green-600">
                      {move.moveAccuracy}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {move.label ? (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getLabelColor(move.label)}`}>
                      {getLabelIcon(move.label)}
                      {move.label}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">No Rating</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};