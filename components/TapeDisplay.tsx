import React, { useEffect, useRef } from 'react';

interface TapeDisplayProps {
  tape: string[];
}

const TapeDisplay: React.FC<TapeDisplayProps> = ({ tape }) => {
  const endOfTapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTapeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tape]);

  return (
    <div className="h-64 bg-stone-200 p-3 rounded-md shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)] border-2 border-black/50 overflow-y-auto">
      <div className="flex flex-col items-end text-right space-y-1 font-mono text-gray-800">
        {tape.length === 0 && <p className="text-stone-500 w-full text-center mt-20">Tape is empty</p>}
        {tape.map((line, index) => (
          <p
            key={index}
            className={`whitespace-nowrap ${line.endsWith(' T') ? 'font-bold' : ''}`}
          >
            {line}
          </p>
        ))}
        <div ref={endOfTapeRef} />
      </div>
    </div>
  );
};

export default TapeDisplay;
