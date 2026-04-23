import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { CircuitElement, CircuitConnection } from '../../../core/circuit/models/types';
import CircuitElementComponent from '../CircuitElement';
import ConnectionLine from '../ConnectionLine';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;

interface CircuitCanvasProps {
  /** 电路元件列表 */
  elements: CircuitElement[];
  /** 电路连接列表 */
  connections?: CircuitConnection[];
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否允许交互 */
  interactive?: boolean;
  /** 选中元件时的回调 */
  onElementSelect?: (elementId: string) => void;
  /** 元件拖拽时的回调 */
  onElementDrag?: (elementId: string, x: number, y: number) => void;
  /** 点击空白区域时的回调 */
  onCanvasPress?: (x: number, y: number) => void;
  /** 长按元件时的回调 */
  onElementLongPress?: (elementId: string) => void;
  /** 当前选中的元件ID（连接模式下高亮） */
  selectedElementId?: string | null;
}

/**
 * 电路画布组件 - 显示和交互电路元件
 *
 * 功能：
 * 1. 显示电路元件
 * 2. 处理触摸事件（点击、拖拽、长按）
 * 3. 显示网格背景（可选）
 * 4. 提供元件交互反馈
 */
const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  elements,
  connections = [],
  showGrid = true,
  interactive = true,
  onElementSelect,
  onElementDrag,
  onCanvasPress,
  onElementLongPress,
  selectedElementId = null,
}) => {
  // 根据连接信息找到两端连接点的绝对坐标
  const getConnectionCoords = (connection: CircuitConnection) => {
    const fromElement = elements.find(el => el.id === connection.fromElementId);
    const toElement = elements.find(el => el.id === connection.toElementId);
    if (!fromElement || !toElement) return null;

    const fromPoint = fromElement.connectionPoints.find(p => p.id === connection.fromPointId);
    const toPoint = toElement.connectionPoints.find(p => p.id === connection.toPointId);
    if (!fromPoint || !toPoint) return null;

    // 根据连接点类型决定线条颜色
    let color = '#4A4A4A';
    if (fromPoint.pointType === 'positive' || toPoint.pointType === 'positive') {
      color = '#FF3B30'; // 正极红色
    } else if (fromPoint.pointType === 'negative' || toPoint.pointType === 'negative') {
      color = '#007AFF'; // 负极蓝色
    }

    return { x1: fromPoint.x, y1: fromPoint.y, x2: toPoint.x, y2: toPoint.y, color };
  };
  // 处理画布点击事件
  const handleCanvasPress = useCallback((event: GestureResponderEvent) => {
    if (!interactive || !onCanvasPress) return;

    const { locationX, locationY } = event.nativeEvent;
    onCanvasPress(locationX, locationY);
  }, [interactive, onCanvasPress]);

  // 处理元件点击事件
  const handleElementPress = useCallback((elementId: string) => {
    if (!interactive || !onElementSelect) return;
    onElementSelect(elementId);
  }, [interactive, onElementSelect]);

  // 处理元件拖拽事件
  const handleElementDrag = useCallback((elementId: string, x: number, y: number) => {
    if (!interactive || !onElementDrag) return;
    onElementDrag(elementId, x, y);
  }, [interactive, onElementDrag]);

  // 处理元件长按事件
  const handleElementLongPress = useCallback((elementId: string) => {
    if (!interactive || !onElementLongPress) return;
    onElementLongPress(elementId);
  }, [interactive, onElementLongPress]);

  return (
    <View
      style={styles.container}
      onStartShouldSetResponder={() => interactive}
      onResponderStart={handleCanvasPress}
    >
      {/* 网格背景 */}
      {showGrid && (
        <View style={styles.gridContainer}>
          {Array.from({ length: Math.floor(width / 40) }).map((_, i) => (
            <View
              key={`grid-v-${i}`}
              style={[
                styles.gridLine,
                styles.gridLineVertical,
                { left: i * 40 }
              ]}
            />
          ))}
          {Array.from({ length: Math.floor(height / 40) }).map((_, i) => (
            <View
              key={`grid-h-${i}`}
              style={[
                styles.gridLine,
                styles.gridLineHorizontal,
                { top: i * 40 }
              ]}
            />
          ))}
        </View>
      )}

      {/* 连接线（渲染在元件之下） */}
      {connections.map((connection) => {
        const coords = getConnectionCoords(connection);
        if (!coords) return null;
        return (
          <ConnectionLine
            key={connection.id}
            x1={coords.x1}
            y1={coords.y1}
            x2={coords.x2}
            y2={coords.y2}
            color={coords.color}
          />
        );
      })}

      {/* 电路元件 */}
      {elements.map((element) => (
        <CircuitElementComponent
          key={element.id}
          element={element}
          interactive={interactive}
          isSelected={element.id === selectedElementId}
          onPress={() => handleElementPress(element.id)}
          onDrag={handleElementDrag}
          onLongPress={() => handleElementLongPress(element.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },
});

export default CircuitCanvas;