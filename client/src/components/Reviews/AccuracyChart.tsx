import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface AccuracyChartProps {
  whiteAccuracy: number;
  blackAccuracy: number;
}

const performance = (accuracy: number) => {
  if (accuracy >= 80)
    return {
      icon: <TrendingUp className="h-4 w-4 text-emerald-400" />,
      text: "Excellent performance",
      color: "text-emerald-400",
    };
  if (accuracy >= 70)
    return {
      icon: <TrendingUp className="h-4 w-4 text-gold-400" />,
      text: "Good performance",
      color: "text-gold-400",
    };
  return {
    icon: <TrendingDown className="h-4 w-4 text-red-400" />,
    text: "Needs improvement",
    color: "text-red-400",
  };
};

const PlayerAccuracy = ({
  label,
  swatchClass,
  accuracy,
}: {
  label: string;
  swatchClass: string;
  accuracy: number;
}) => {
  const perf = performance(accuracy);
  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-4 w-4 rounded ${swatchClass}`}></div>
          <span className="text-sm font-semibold text-cream">{label}</span>
        </div>
        <span className="font-mono text-3xl font-bold text-gold-400">{accuracy}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-300 transition-all duration-1000"
          style={{ width: `${accuracy}%` }}
        ></div>
      </div>
      <div className="flex items-center gap-2">
        {perf.icon}
        <span className={`text-xs font-medium ${perf.color}`}>{perf.text}</span>
      </div>
    </div>
  );
};

export const AccuracyChart: React.FC<AccuracyChartProps> = ({ whiteAccuracy, blackAccuracy }) => {
  return (
    <div className="panel mb-6 p-8">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10">
          <BarChart3 className="h-5 w-5 text-gold-400" />
        </span>
        <h2 className="heading-display text-3xl">Accuracy comparison</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <PlayerAccuracy
          label="White player"
          swatchClass="border border-white/40 bg-cream"
          accuracy={whiteAccuracy}
        />
        <PlayerAccuracy
          label="Black player"
          swatchClass="border border-white/20 bg-ink-900"
          accuracy={blackAccuracy}
        />
      </div>
    </div>
  );
};
