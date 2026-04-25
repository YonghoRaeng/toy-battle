import type { GameState } from '../game/types';

type Props = { game: GameState };

export function MedalTrack({ game }: Props) {
  const { terrain, players } = game;
  const goal = terrain.medalGoal;
  const blue = players.blue.medalsOnTrack;
  const red = players.red.medalsOnTrack;

  return (
    <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-red-300 w-4 shrink-0">🔴</span>
        <div className="flex gap-0.5">
          {Array.from({ length: goal }, (_, i) => (
            <div key={i} className={`w-5 h-5 rounded flex items-center justify-center font-bold ${i < red ? 'bg-red-500 text-yellow-200' : 'bg-gray-700 text-gray-600'}`}>
              {i < red ? '★' : '·'}
            </div>
          ))}
        </div>
        <span className="text-red-300">{red}/{goal}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-blue-300 w-4 shrink-0">🔵</span>
        <div className="flex gap-0.5">
          {Array.from({ length: goal }, (_, i) => (
            <div key={i} className={`w-5 h-5 rounded flex items-center justify-center font-bold ${i < blue ? 'bg-blue-500 text-yellow-200' : 'bg-gray-700 text-gray-600'}`}>
              {i < blue ? '★' : '·'}
            </div>
          ))}
        </div>
        <span className="text-blue-300">{blue}/{goal}</span>
      </div>
    </div>
  );
}
