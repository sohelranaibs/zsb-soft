import React from 'react';

export type WatermarkPosition =
  | 'center'
  | 'top-center'
  | 'bottom-center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export interface WatermarkSettings {
  text: string;
  enabled: boolean;
  position: WatermarkPosition;
  opacity: number; // 0.02 (2%) to 0.40 (40%)
  rotationAngle: number; // in degrees, e.g. -35, -45, 0
  fontSize: number; // in px, e.g. 48 to 72
  color: string;
}

export const DEFAULT_WATERMARK_SETTINGS: WatermarkSettings = {
  text: 'ZSB AQUATICS',
  enabled: true,
  position: 'center',
  opacity: 0.12, // 12% opacity
  rotationAngle: -35, // -35 degrees diagonal
  fontSize: 56, // 56px
  color: '#12284c',
};

/**
 * Validates and clamps watermark settings to ensure safe ranges
 */
export function validateWatermarkSettings(
  input?: Partial<WatermarkSettings>
): WatermarkSettings {
  if (!input) return { ...DEFAULT_WATERMARK_SETTINGS };

  const validPositions: WatermarkPosition[] = [
    'center',
    'top-center',
    'bottom-center',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  const position: WatermarkPosition =
    input.position && validPositions.includes(input.position)
      ? input.position
      : DEFAULT_WATERMARK_SETTINGS.position;

  // Clamp opacity between 0.01 (1%) and 0.50 (50%)
  const rawOpacity = typeof input.opacity === 'number' ? input.opacity : DEFAULT_WATERMARK_SETTINGS.opacity;
  const opacity = Math.min(0.5, Math.max(0.01, Math.round(rawOpacity * 100) / 100));

  // Clamp rotation between -180 and 180 degrees
  const rawRotation = typeof input.rotationAngle === 'number' ? input.rotationAngle : DEFAULT_WATERMARK_SETTINGS.rotationAngle;
  const rotationAngle = Math.min(180, Math.max(-180, Math.round(rawRotation)));

  // Clamp font size between 20px and 120px
  const rawFontSize = typeof input.fontSize === 'number' ? input.fontSize : DEFAULT_WATERMARK_SETTINGS.fontSize;
  const fontSize = Math.min(120, Math.max(20, Math.round(rawFontSize)));

  return {
    text: (input.text && input.text.trim()) || DEFAULT_WATERMARK_SETTINGS.text,
    enabled: input.enabled !== undefined ? Boolean(input.enabled) : DEFAULT_WATERMARK_SETTINGS.enabled,
    position,
    opacity,
    rotationAngle,
    fontSize,
    color: input.color || DEFAULT_WATERMARK_SETTINGS.color,
  };
}

/**
 * Computes CSS styles for watermark container and text based on settings
 */
export function getWatermarkStyles(settings: WatermarkSettings): React.CSSProperties {
  const validated = validateWatermarkSettings(settings);

  if (!validated.enabled) {
    return { display: 'none' };
  }

  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    userSelect: 'none',
    color: validated.color,
    opacity: validated.opacity,
    fontWeight: 900,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    zIndex: 5,
    fontSize: `${validated.fontSize}px`,
    lineHeight: 1,
    transformOrigin: 'center center',
  };

  switch (validated.position) {
    case 'center':
      return {
        ...baseStyles,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${validated.rotationAngle}deg)`,
      };
    case 'top-center':
      return {
        ...baseStyles,
        top: '20%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${validated.rotationAngle}deg)`,
      };
    case 'bottom-center':
      return {
        ...baseStyles,
        bottom: '20%',
        left: '50%',
        transform: `translate(-50%, 50%) rotate(${validated.rotationAngle}deg)`,
      };
    case 'top-left':
      return {
        ...baseStyles,
        top: '15%',
        left: '12%',
        transform: `rotate(${validated.rotationAngle}deg)`,
      };
    case 'top-right':
      return {
        ...baseStyles,
        top: '15%',
        right: '12%',
        transform: `rotate(${validated.rotationAngle}deg)`,
      };
    case 'bottom-left':
      return {
        ...baseStyles,
        bottom: '15%',
        left: '12%',
        transform: `rotate(${validated.rotationAngle}deg)`,
      };
    case 'bottom-right':
      return {
        ...baseStyles,
        bottom: '15%',
        right: '12%',
        transform: `rotate(${validated.rotationAngle}deg)`,
      };
    default:
      return {
        ...baseStyles,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${validated.rotationAngle}deg)`,
      };
  }
}
