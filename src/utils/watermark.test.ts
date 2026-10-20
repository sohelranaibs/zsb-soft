import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_WATERMARK_SETTINGS,
  validateWatermarkSettings,
  getWatermarkStyles,
  WatermarkSettings,
} from './watermark.ts';

test('DEFAULT_WATERMARK_SETTINGS has expected branding defaults', () => {
  assert.equal(DEFAULT_WATERMARK_SETTINGS.text, 'ZSB AQUATICS');
  assert.equal(DEFAULT_WATERMARK_SETTINGS.enabled, true);
  assert.equal(DEFAULT_WATERMARK_SETTINGS.position, 'center');
  assert.equal(DEFAULT_WATERMARK_SETTINGS.opacity, 0.12);
  assert.equal(DEFAULT_WATERMARK_SETTINGS.rotationAngle, -35);
  assert.equal(DEFAULT_WATERMARK_SETTINGS.fontSize, 56);
});

test('validateWatermarkSettings clamps out-of-range opacity', () => {
  const high = validateWatermarkSettings({ opacity: 0.99 });
  assert.equal(high.opacity, 0.5);

  const low = validateWatermarkSettings({ opacity: -0.2 });
  assert.equal(low.opacity, 0.01);

  const normal = validateWatermarkSettings({ opacity: 0.15 });
  assert.equal(normal.opacity, 0.15);
});

test('validateWatermarkSettings clamps out-of-range rotation angle', () => {
  const high = validateWatermarkSettings({ rotationAngle: 360 });
  assert.equal(high.rotationAngle, 180);

  const low = validateWatermarkSettings({ rotationAngle: -300 });
  assert.equal(low.rotationAngle, -180);

  const normal = validateWatermarkSettings({ rotationAngle: -45 });
  assert.equal(normal.rotationAngle, -45);
});

test('validateWatermarkSettings preserves or sanitizes position', () => {
  const validCenter = validateWatermarkSettings({ position: 'center' });
  assert.equal(validCenter.position, 'center');

  const validTopRight = validateWatermarkSettings({ position: 'top-right' });
  assert.equal(validTopRight.position, 'top-right');

  // @ts-expect-error test invalid string fallback
  const invalid = validateWatermarkSettings({ position: 'middle-nowhere' });
  assert.equal(invalid.position, 'center');
});

test('getWatermarkStyles returns display: none when disabled', () => {
  const styles = getWatermarkStyles({
    ...DEFAULT_WATERMARK_SETTINGS,
    enabled: false,
  });
  assert.equal(styles.display, 'none');
});

test('getWatermarkStyles computes center transform and opacity', () => {
  const settings: WatermarkSettings = {
    text: 'ZSB AQUATICS',
    enabled: true,
    position: 'center',
    opacity: 0.18,
    rotationAngle: -30,
    fontSize: 60,
    color: '#12284c',
  };

  const styles = getWatermarkStyles(settings);
  assert.equal(styles.opacity, 0.18);
  assert.equal(styles.top, '50%');
  assert.equal(styles.left, '50%');
  assert.match(String(styles.transform), /translate\(-50%,\s*-50%\)/);
  assert.match(String(styles.transform), /rotate\(-30deg\)/);
  assert.equal(styles.fontSize, '60px');
});

test('getWatermarkStyles handles corner positions', () => {
  const topRight = getWatermarkStyles({
    ...DEFAULT_WATERMARK_SETTINGS,
    position: 'top-right',
    rotationAngle: 0,
  });
  assert.equal(topRight.top, '15%');
  assert.equal(topRight.right, '12%');
  assert.equal(topRight.transform, 'rotate(0deg)');

  const bottomLeft = getWatermarkStyles({
    ...DEFAULT_WATERMARK_SETTINGS,
    position: 'bottom-left',
    rotationAngle: 15,
  });
  assert.equal(bottomLeft.bottom, '15%');
  assert.equal(bottomLeft.left, '12%');
  assert.equal(bottomLeft.transform, 'rotate(15deg)');
});
