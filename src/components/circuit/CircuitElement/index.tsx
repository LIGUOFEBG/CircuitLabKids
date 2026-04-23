import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { CircuitElement, ELEMENT_SIZES } from '../../../core/circuit/models/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

interface CircuitElementProps {
  /** 电路元件数据 */
  element: CircuitElement;
  /** 是否允许交互 */
  interactive?: boolean;
  /** 是否被选中（用于连接模式高亮） */
  isSelected?: boolean;
  /** 点击回调 */
  onPress?: () => void;
  /** 拖拽回调 */
  onDrag?: (elementId: string, x: number, y: number) => void;
  /** 长按回调 */
  onLongPress?: () => void;
}

/**
 * 电路元件组件 - 显示单个电路元件并处理交互
 *
 * 功能：
 * 1. 根据元件类型显示不同样式
 * 2. 支持拖拽操作
 * 3. 提供点击和长按反馈
 * 4. 显示元件状态（如灯泡亮度）
 */
const CircuitElementComponent: React.FC<CircuitElementProps> = ({
  element,
  interactive = true,
  isSelected = false,
  onPress,
  onDrag,
  onLongPress,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: element.x, y: element.y })).current;
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: element.x, y: element.y });

  // 获取元件类型对应的样式
  const getElementStyle = () => {
    switch (element.type) {
      case 'battery':
        return styles.batteryElement;
      case 'bulb':
        return (element as any).isOn ? styles.bulbElementOn : styles.bulbElement;
      case 'wire':
        return styles.wireElement;
      case 'switch':
        return (element as any).isClosed ? styles.switchElementClosed : styles.switchElement;
      case 'resistor':
        return styles.resistorElement;
      default:
        return styles.defaultElement;
    }
  };

  // 获取元件图标
  const getElementIcon = () => {
    switch (element.type) {
      case 'battery':
        return '🔋';
      case 'bulb': {
        // 灯泡根据亮度显示不同表情
        const bulbElement = element as any;
        const brightness = bulbElement.brightness || 0;
        if (brightness > 0.7) return '💡';
        if (brightness > 0.3) return '✨';
        return '🔆'; // 灯灭：暗淡图标
      }
      case 'wire':
        return '🔌';
      case 'switch':
        // 开关根据状态显示不同图标
        const switchElement = element as any;
        return switchElement.isClosed ? '⚡' : '⭕';
      case 'resistor':
        return '📉';
      default:
        return '⚙️';
    }
  };

  // 获取元件标签
  const getElementLabel = () => {
    switch (element.type) {
      case 'battery':
        return `电池 ${(element as any).voltage || 1.5}V`;
      case 'bulb':
        return `灯泡`;
      case 'wire':
        return '导线';
      case 'switch':
        return '开关';
      case 'resistor':
        return `电阻 ${(element as any).resistance || 100}Ω`;
      default:
        return element.name;
    }
  };

  // 创建拖拽响应器
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: () => interactive,
      onPanResponderGrant: (_, gestureState) => {
        setStartPosition({ x: gestureState.x0, y: gestureState.y0 });
        setIsDragging(true);
      },
      onPanResponderMove: Animated.event(
        [
          null,
          {
            dx: pan.x,
            dy: pan.y,
          },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);

        // 计算最终位置
        const newX = element.x + gestureState.dx;
        const newY = element.y + gestureState.dy;

        // 限制在画布范围内
        const clampedX = Math.max(0, Math.min(width - ELEMENT_SIZES[element.type].width, newX));
        const clampedY = Math.max(0, Math.min(600, newY)); // 假设画布高度为600

        // 更新位置
        pan.setValue({ x: clampedX - element.x, y: clampedY - element.y });

        // 回调通知父组件位置变化
        if (onDrag) {
          onDrag(element.id, clampedX, clampedY);
        }
      },
    })
  ).current;

  // 处理点击事件
  const handlePress = useCallback(() => {
    if (isDragging) return; // 如果是拖拽操作，不触发点击
    if (onPress) onPress();
  }, [isDragging, onPress]);

  // 处理长按事件
  const handleLongPress = useCallback(() => {
    if (onLongPress) onLongPress();
  }, [onLongPress]);

  // 元件尺寸
  const elementSize = ELEMENT_SIZES[element.type] || { width: 80, height: 80 };

  return (
    <Animated.View
      style={[
        styles.container,
        getElementStyle(),
        isSelected && styles.selectedElement,
        {
          width: elementSize.width,
          height: elementSize.height,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
          left: element.x,
          top: element.y,
          opacity: isDragging ? 0.8 : 1,
          zIndex: isDragging ? 999 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.touchable}
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <Text style={styles.icon}>{getElementIcon()}</Text>
        <Text style={styles.label}>{getElementLabel()}</Text>

        {/* 状态指示器 */}
        {element.type === 'bulb' && (element as any).isOn && (
          <View style={[styles.statusIndicator, styles.onIndicator]} />
        )}
        {element.type === 'switch' && (element as any).isClosed && (
          <View style={[styles.statusIndicator, styles.closedIndicator]} />
        )}

        {/* 拖拽时的视觉反馈 */}
        {isDragging && <View style={styles.dragOverlay} />}
      </TouchableOpacity>

      {/* 连接点 */}
      {element.connectionPoints.map((point) => {
        // 计算连接点相对于元件的位置
        const pointX = point.x - element.x;
        const pointY = point.y - element.y;

        return (
          <View
            key={point.id}
            style={[
              styles.connectionPoint,
              point.pointType === 'positive' && styles.positivePoint,
              point.pointType === 'negative' && styles.negativePoint,
              point.pointType === 'terminal' && styles.terminalPoint,
              {
                left: pointX - 6, // 让点居中 (12/2)
                top: pointY - 6,
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    width: '100%',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: isTablet ? 12 : 10,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onIndicator: {
    backgroundColor: '#4CD964',
  },
  closedIndicator: {
    backgroundColor: '#FF9500',
  },
  dragOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  selectedElement: {
    borderColor: '#34C759',
    borderWidth: 3,
    shadowColor: '#34C759',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  // 元件类型样式
  batteryElement: {
    backgroundColor: '#FFEAA7',
    borderWidth: 2,
    borderColor: '#FDCB6E',
  },
  bulbElement: {
    backgroundColor: '#FFD3B6',
    borderWidth: 2,
    borderColor: '#FFAAA5',
  },
  bulbElementOn: {
    backgroundColor: '#FFF176',
    borderWidth: 3,
    borderColor: '#FFD600',
    shadowColor: '#FFD600',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  wireElement: {
    backgroundColor: '#D8D8D8',
    borderWidth: 2,
    borderColor: '#B8B8B8',
  },
  switchElement: {
    backgroundColor: '#A8E6CF',
    borderWidth: 2,
    borderColor: '#6BCF9C',
  },
  switchElementClosed: {
    backgroundColor: '#00C853',
    borderWidth: 2,
    borderColor: '#00A042',
  },
  resistorElement: {
    backgroundColor: '#E6A8D7',
    borderWidth: 2,
    borderColor: '#CF6BB0',
  },
  defaultElement: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  // 连接点样式
  connectionPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  positivePoint: {
    backgroundColor: '#FF3B30', // 红色表示正极
  },
  negativePoint: {
    backgroundColor: '#007AFF', // 蓝色表示负极
  },
  terminalPoint: {
    backgroundColor: '#34C759', // 绿色表示通用端子
  },
});

export default CircuitElementComponent;