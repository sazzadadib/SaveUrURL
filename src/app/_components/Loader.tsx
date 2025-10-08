import React from 'react';

interface WaveLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  color?: string;
  text?: string;
  overlay?: boolean;
  fullPage?: boolean;
}

interface SizeConfig {
  spinner: number;
  border: number;
}

const WaveLoader: React.FC<WaveLoaderProps> = ({ 
  size = 'responsive', 
  color = '#ffffff', 
  text = 'Loading...',
  overlay = false,
  fullPage = true
}) => {
  // Size configurations
  const sizeMap: Record<string, SizeConfig> = {
    sm: { spinner: 32, border: 3 },
    md: { spinner: 48, border: 4 },
    lg: { spinner: 64, border: 5 },
    xl: { spinner: 80, border: 6 },
    responsive: { spinner: 80, border: 6 } // Default for responsive
  };

  const { spinner: spinnerSize, border: borderWidth } = sizeMap[size] || sizeMap.responsive;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    ...(fullPage && {
      minHeight: '100vh',
      width: '100%'
    }),
    ...(overlay && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999
    })
  };

  return (
    <>
      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.5);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .wave-container {
          display: flex;
          gap: ${borderWidth}px;
          align-items: center;
          height: ${spinnerSize}px;
        }

        .wave-bar {
          background-color: ${color};
          border-radius: ${borderWidth}px;
        }

        /* Mobile */
        @media (max-width: 640px) {
          .wave-container {
            height: ${size === 'responsive' ? '48px' : `${spinnerSize}px`};
            gap: ${size === 'responsive' ? '4px' : `${borderWidth}px`};
          }
          .wave-bar {
            width: ${size === 'responsive' ? '4.8px' : `${spinnerSize / 10}px`};
            height: ${size === 'responsive' ? '16px' : `${spinnerSize / 3}px`};
            border-radius: ${size === 'responsive' ? '4px' : `${borderWidth}px`};
          }
          .wave-text {
            font-size: 14px !important;
          }
        }

        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          .wave-container {
            height: ${size === 'responsive' ? '64px' : `${spinnerSize}px`};
            gap: ${size === 'responsive' ? '5px' : `${borderWidth}px`};
          }
          .wave-bar {
            width: ${size === 'responsive' ? '6.4px' : `${spinnerSize / 10}px`};
            height: ${size === 'responsive' ? '21.3px' : `${spinnerSize / 3}px`};
            border-radius: ${size === 'responsive' ? '5px' : `${borderWidth}px`};
          }
          .wave-text {
            font-size: 16px !important;
          }
        }

        /* Desktop */
        @media (min-width: 1025px) {
          .wave-container {
            height: ${size === 'responsive' ? '96px' : `${spinnerSize}px`};
            gap: ${size === 'responsive' ? '6px' : `${borderWidth}px`};
          }
          .wave-bar {
            width: ${size === 'responsive' ? '9.6px' : `${spinnerSize / 10}px`};
            height: ${size === 'responsive' ? '32px' : `${spinnerSize / 3}px`};
            border-radius: ${size === 'responsive' ? '6px' : `${borderWidth}px`};
          }
          .wave-text {
            font-size: 18px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
      
      <div 
        style={containerStyle}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        <div className="wave-container">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`
              }}
            />
          ))}
        </div>
        {text && (
          <p 
            className="wave-text"
            style={{
              margin: 0,
              fontWeight: 500,
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              opacity: 0.9
            }}
          >
            {text}
          </p>
        )}
        <span style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          padding: 0, 
          margin: '-1px', 
          overflow: 'hidden', 
          clip: 'rect(0,0,0,0)', 
          whiteSpace: 'nowrap', 
          border: 0 
        }}>
          {text}
        </span>
      </div>
    </>
  );
};

export default WaveLoader;