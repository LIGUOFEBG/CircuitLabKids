import React from 'react';
import { View } from 'react-native';

interface ConnectionLineProps {
  /** 起点 X 坐标（画布绝对坐标） */
  x1: number;
  /** 起点 Y 坐标（画布绝对坐标） */
  y1: number;
  /** 终点 X 坐标（画布绝对坐标） */
  x2: number;
  /** 终点 Y 坐标（画布绝对坐标） */
  y2: number;
  /** 线条颜色 */
  color?: string;
  /** 线条粗细 */
  thickness?: number;
}

const LINE_THICKNESS = 3;

/**
 * 连接线组件 - 在两个画布坐标之间绘制一条线
 *
 * 原理：
 * 1. 计算两点之间的距离作为 View 的宽度
 * 2. 计算角度并通过 transform rotate 旋转 View
 * 3. 将 View 定位于两点中心处
 */
const ConnectionLine: React.FC<ConnectionLineProps> = ({
  x1,
  y1,
  x2,
  y2,
  color = '#4A4A4A',
  thickness = LINE_THICKNESS,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  if (length < 1) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        left: midX - length / 2,
        top: midY - thickness / 2,
        width: length,
        height: thickness,
        backgroundColor: color,
        borderRadius: thickness / 2,
        transform: [{ rotate: `${angle}deg` }],
      }}
    />
  );
};

export default ConnectionLine;
