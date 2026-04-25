import { useEffect, useRef } from 'react';

type Props = { log: string[] };

export function GameLog({ log }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log.length]);

  return (
    <div className="bg-gray-900 rounded-xl p-2 border border-gray-700">
      <h3 className="text-gray-400 text-xs font-bold mb-1">📋 게임 로그</h3>
      <div ref={ref} className="h-28 overflow-y-auto space-y-0.5 text-xs">
        {log.slice(-20).map((entry, i) => (
          <div key={i} className="text-gray-300 leading-tight">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
