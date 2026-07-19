import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { GameReview } from '../../lib/types';

interface GameHeaderProps {
  game: GameReview['game'];
}

export const GameHeader: React.FC<GameHeaderProps> = ({ game }) => {
  return (
    <div className="panel mb-6 p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-cream/40">
            Post-game report
          </p>
          <h1 className="heading-display text-4xl">Game analysis</h1>
        </div>
        <div className="chip">
          <Trophy className="h-4 w-4 text-gold-400" />
          Game ID: {game.id.slice(0, 8)}…
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* White Player */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-cream/90">
                {
                  game.whiteImg ? (
                    <img src={game.whiteImg} className="h-full w-full object-cover" />
                  ) :
                    <Crown className="h-5 w-5 text-ink-800" />
                }
              </div>
              <div>
                <div className="text-base font-semibold text-cream">{game.white}</div>
                <div className="text-xs font-medium text-cream/40">White</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-bold text-gold-400">{game.accuracyWhite}%</div>
              <div className="text-xs text-cream/40">Accuracy</div>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700"
              style={{ width: `${game.accuracyWhite}%` }}
            ></div>
          </div>
        </div>

        {/* Black Player */}
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-800">
                {
                  game.blackImg ? (
                    <img src={game.blackImg} className="h-full w-full object-cover" />
                  ) :
                    <Crown className="h-5 w-5 text-cream" />
                }
              </div>
              <div>
                <div className="text-base font-semibold text-cream">{game.black}</div>
                <div className="text-xs font-medium text-cream/40">Black</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl font-bold text-gold-400">{game.accuracyBlack}%</div>
              <div className="text-xs text-cream/40">Accuracy</div>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700"
              style={{ width: `${game.accuracyBlack}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="mt-5 rounded-2xl border border-gold-500/20 bg-gold-500/[0.06] p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Game summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-cream">{game.moves}</div>
            <div className="mt-1 text-xs text-cream/50">Total moves</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-cream">
              {Math.round((game.accuracyWhite + game.accuracyBlack) / 2)}%
            </div>
            <div className="mt-1 text-xs text-cream/50">Avg accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
