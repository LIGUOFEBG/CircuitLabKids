import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';

interface ConnectionLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  thickness?: number;
  onLongPress?: () => void;
  animated?: boolean;
}

const LINE_THICKNESS = 3;
const TOUCH_HEIGHT = 20;
const PARTICLE_SIZE = 6;
const ANIM_DURATION = 1200; // ms per particle cycle
const PARTICLE_COUNT = 3;
const STAGGER = ANIM_DURATION / PARTICLE_COUNT; // 400ms between particles

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  color = '#4A4A4A',
  thickness = LINE_THICKNESS,
  onLongPress,
  animated = false,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const p0 = useRef(new Animated.Value(0)).current;
  const p1 = useRef(new Animated.Value(0)).current;
  const p2 = useRef(new Animated.Value(0)).current;
  const animsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    animsRef.current.forEach(a => a.stop());
    animsRef.current = [];

    if (!animated || length < 1) {
      p0.setValue(0);
      p1.setValue(0);
      p2.setValue(0);
      return;
    }

    const makeLoop = (val: Animated.Value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );

    // Stagger each particle so they're evenly spaced along the line
    const a0 = makeLoop(p0);
    const a1 = Animated.sequence([Animated.delay(STAGGER), makeLoop(p1)]);
    const a2 = Animated.sequence([Animated.delay(STAGGER * 2), makeLoop(p2)]);

    a0.start();
    a1.start();
    a2.start();
    animsRef.current = [a0, a1, a2];

    return () => {
      animsRef.current.forEach(a => a.stop());
    };
  }, [animated, length]);

  if (length < 1) return null;

  const halfLen = length / 2;
  // Particle travels from left edge (0) to right edge (length - PARTICLE_SIZE)
  // Base position is centered; translateX shifts from -halfLen+offset to +halfLen-offset
  const particleOffset = PARTICLE_SIZE / 2;
  const makeTranslateX = (val: Animated.Value) =>
    val.interpolate({
      inputRange: [0, 1],
      outputRange: [-(halfLen - particleOffset), halfLen - particleOffset],
    });

  const containerStyle = {
    position: 'absolute' as const,
    left: midX - halfLen,
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

  const particleBaseStyle = {
    position: 'absolute' as const,
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: PARTICLE_SIZE / 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
    top: (TOUCH_HEIGHT - PARTICLE_SIZE) / 2,
    left: halfLen - particleOffset,
  };

  const content = (
    <>
      <View style={lineStyle} />
      {animated && (
        <>
          <Animated.View style={[particleBaseStyle, { transform: [{ translateX: makeTranslateX(p0) }] }]} />
          <Animated.View style={[particleBaseStyle, { transform: [{ translateX: makeTranslateX(p1) }] }]} />
          <Animated.View style={[particleBaseStyle, { transform: [{ translateX: makeTranslateX(p2) }] }]} />
        </>
      )}
    </>
  );

  if (onLongPress) {
    return (
      <TouchableOpacity style={containerStyle} onLongPress={onLongPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {content}
    </View>
  );
};

export default ConnectionLine;
