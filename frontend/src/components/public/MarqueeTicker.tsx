const items = [
  '36 STATES ORGANIZED',
  '774 LGAs COVERED',
  '25,000+ VERIFIED MEMBERS',
  '8,000+ POLLING UNITS MAPPED',
  'SECURE & VERIFIED',
  'FROM EVERY TRIBE & TONGUE',
  'ONE MOVEMENT · ONE NIGERIA',
];

const MarqueeTicker = () => {
  return (
    <div className="bg-gray-950 border-b border-white/5 py-3 overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center mx-8 text-xs uppercase tracking-[0.2em] text-gray-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green mr-4 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
