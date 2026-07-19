import React from 'react';
import { ChevronRight, Target, AlertTriangle, X, Crown, Microscope } from 'lucide-react';
import { MoveReview } from '../../lib/types';

interface MoveReviewTableProps {
  moveReviews: MoveReview[];
}

const getLabelColor = (label: string | null) => {
  switch (label) {
    case 'Best': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'Excellent': return 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300/90';
    case 'Good': return 'border-sky-500/25 bg-sky-500/10 text-sky-300';
    case 'Inaccuracy': return 'border-gold-500/30 bg-gold-500/10 text-gold-300';
    case 'Mistake': return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
    case 'Blunder': return 'border-red-500/30 bg-red-500/10 text-red-300';
    default: return 'border-white/10 bg-white/[0.04] text-cream/50';
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
    <div className="panel overflow-hidden !rounded-2xl">
      <div className="border-b border-white/[0.06] bg-gold-500/[0.06] p-6">
        <h2 className="flex items-center gap-3 heading-display text-3xl">
          <Microscope className="h-6 w-6 text-gold-400" />
          Move-by-move analysis
        </h2>
        <p className="mt-1 text-sm text-cream/50">Detailed evaluation of each move with engine analysis</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Move</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Player</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Played</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Best Move</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Evaluation</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">CP Loss</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Accuracy</th>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-cream/50">Rating</th>
            </tr>
          </thead>
          <tbody>
            {moveReviews.map((move, index) => (
              <tr key={index} className="border-b border-white/[0.05] transition-colors last:border-b-0 hover:bg-gold-500/[0.04]">
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-sm font-semibold text-cream/60">
                  {move.move}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-3.5 w-3.5 rounded ${move.color === 'white' ? 'border border-white/40 bg-cream' : 'border border-white/20 bg-ink-900'}`}></div>
                    <span className="text-sm font-medium capitalize text-cream/80">{move.color}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <span className="rounded-md bg-white/[0.06] px-2.5 py-1 font-mono text-sm font-semibold text-cream">
                    {move.san}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-gold-500/25 bg-gold-500/10 px-2.5 py-1 font-mono text-sm text-gold-300">
                      {move.bestMove}
                    </span>
                    {move.san !== move.bestMove && (
                      <ChevronRight className="h-4 w-4 text-orange-400" />
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-sm">
                  {move.evalAfter !== null && (
                    <span className={`font-semibold ${move.evalAfter > 0 ? 'text-emerald-400' : move.evalAfter < 0 ? 'text-red-400' : 'text-cream/60'}`}>
                      {move.evalAfter > 0 ? '+' : ''}{(move.evalAfter / 100).toFixed(2)}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-sm">
                  {move.centipawnLoss !== null ? (
                    <span className={`font-semibold ${move.centipawnLoss > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {move.centipawnLoss > 0 ? '-' : ''}{move.centipawnLoss}
                    </span>
                  ) : (
                    <span className="text-cream/30">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-sm">
                  {move.moveAccuracy !== null ? (
                    <span className="font-semibold text-gold-400">
                      {move.moveAccuracy}%
                    </span>
                  ) : (
                    <span className="text-cream/30">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  {move.label ? (
                    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getLabelColor(move.label)}`}>
                      {getLabelIcon(move.label)}
                      {move.label}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-cream/30">No Rating</span>
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
