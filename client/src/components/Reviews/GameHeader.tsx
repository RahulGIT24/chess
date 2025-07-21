import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { GameReview } from '../../lib/types';

interface GameHeaderProps {
  game: GameReview['game'];
}

export const GameHeader: React.FC<GameHeaderProps> = ({ game }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Game Analysis</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
          <Trophy className="w-4 h-4" />
          Game ID: {game.id.slice(0, 8)}...
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* White Player */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center shadow-sm">
                {
                  game.whiteImg ? (
                    <img src={game.whiteImg} className='rounded-full' />
                  ) :
                    <Crown className="w-5 h-5 text-gray-600" />
                }
              </div>
              <div>
                <div className="text-lg font-bold text-gray-800">{game.white}</div>
                <div className="text-sm text-gray-600 font-medium">White</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{game.accuracyWhite}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${game.accuracyWhite}%` }}
            ></div>
          </div>
        </div>

        {/* Black Player */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full border-2 border-gray-500 flex items-center justify-center shadow-sm">
                {
                  game.blackImg ? (
                    <img src={game.blackImg} className='rounded-full' />
                  ) :
                    <Crown className="w-5 h-5 text-white" />
                }
              </div>
              <div>
                <div className="text-lg font-bold text-white">{game.black}</div>
                <div className="text-sm text-gray-300 font-medium">Black</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">{game.accuracyBlack}%</div>
              <div className="text-sm text-gray-300">Accuracy</div>
            </div>
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-700"
              style={{ width: `${game.accuracyBlack}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-800 mb-3 text-lg">Game Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{game.moves}</div>
            <div className="text-sm text-green-600">Total Moves</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              {Math.round((game.accuracyWhite + game.accuracyBlack) / 2)}%
            </div>
            <div className="text-sm text-green-600">Avg Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
};