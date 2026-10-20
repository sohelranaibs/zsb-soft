import React from 'react';
import { useApp } from '../context/AppContext';
import { getWatermarkStyles, WatermarkSettings } from '../utils/watermark';

interface WatermarkOverlayProps {
  /** Optional override for previewing custom settings before saving */
  customSettings?: WatermarkSettings;
  className?: string;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({
  customSettings,
  className = '',
}) => {
  const { watermarkSettings } = useApp();
  const settings = customSettings || watermarkSettings;

  if (!settings || !settings.enabled) {
    return null;
  }

  const styles = getWatermarkStyles(settings);

  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden print:overflow-visible z-10 ${className}`}
      aria-hidden="true"
      style={{
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <div
        className="font-black tracking-widest uppercase transition-all duration-150 print:block"
        style={styles}
      >
        {settings.text || 'ZSB AQUATICS'}
      </div>
    </div>
  );
};
