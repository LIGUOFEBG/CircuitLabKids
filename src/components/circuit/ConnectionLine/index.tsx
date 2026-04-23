import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  thickness?: number;
  onLongPress?: () => void;
}

const LINE_THICKNESS = 3;
const TOUCH_HEIGHT = 20;

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  color = '#4A4A4A',
  thickness = LINE_THICKNESS,
  onLongPress,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  if (length < 1) return null;

  const containerStyle = {
    position: 'absolute' as const,
    left: midX - length / 2,
    top: midY - TOUCH_HEIGHT / 2,
    width: length,
    height: TOUCH_HEIGHT,
    justifyContent: 'center' as const,
    transform: [{ rotate: `${angle}deg` }],
  };

  const lineStyle = {
    height: thickness,
    backgroundColor: color,
    borderRadius: thickness / 2,
  };

  if (onLongPress) {
    return (
      <TouchableOpacity style={containerStyle} onLongPress={onLongPress} activeOpacity={0.6}>
        <View style={lineStyle} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={lineStyle} />
    </View>
  );
};

export default ConnectionLine;
