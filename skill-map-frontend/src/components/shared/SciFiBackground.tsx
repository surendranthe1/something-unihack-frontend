import React from 'react';

interface SciFiBackgroundProps {
  variation?: 'default' | 'alt' | 'darker';
}

const SciFiBackground: React.FC<SciFiBackgroundProps> = ({ variation = 'default' }) => {
  let gradientClass = '';
  
  switch (variation) {
    case 'alt':
      gradientClass = 'bg-gradient-to-b from-black to-purple-900/20';
      break;
    case 'darker':
      gradientClass = 'bg-gradient-to-b from-black to-indigo-900/10';
      break;
    default:
      gradientClass = 'bg-gradient-to-b from-purple-900/20 to-black';
  }
  
  return (
    <>
      <div className={`absolute inset-0 z-0 ${gradientClass}`}></div>
      <div className="absolute inset-0 z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(to right, #6b46c1 1px, transparent 1px), linear-gradient(to bottom, #6b46c1 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            backgroundPosition: 'center center',
            opacity: '0.1'
          }} />
        </div>
      </div>
    </>
  );
};

export default SciFiBackground;