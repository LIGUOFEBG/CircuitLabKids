import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { useCircuit } from '../../core/circuit/context/CircuitContext';
import { CircuitElementType, CircuitElement, CircuitConnection, ConnectionPoint } from '../../core/circuit/models/types';
import { CircuitCanvas, CircuitStatusPanel, ElementPalette } from '../../components/circuit';

/**
 * 在两个元件中找到第一对兼容的未连接连接点
 */
function findCompatiblePoints(
  fromElement: CircuitElement,
  toElement: CircuitElement,
  connections: CircuitConnection[]
): { fromPointId: string; toPointId: string } | null {
  const connectedPointIds = new Set(
    connections.flatMap(c => [c.fromPointId, c.toPointId])
  );

  const isCompatible = (a: ConnectionPoint, b: ConnectionPoint): boolean => {
    if (a.pointType === 'positive' && b.pointType === 'positive') return false;
    if (a.pointType === 'negative' && b.pointType === 'negative') return false;
    if (a.pointType === 'positive' && b.pointType === 'negative') return false;
    if (a.pointType === 'negative' && b.pointType === 'positive') return false;
    return true;
  };

  for (const fp of fromElement.connectionPoints) {
    if (connectedPointIds.has(fp.id)) continue;
    for (const tp of toElement.connectionPoints) {
      if (connectedPointIds.has(tp.id)) continue;
      if (isCompatible(fp, tp)) {
        return { fromPointId: fp.id, toPointId: tp.id };
      }
    }
  }
  return null;
}

const { width, height } = Dimensions.get('window');
const isTablet = width >= 600;

type ExperimentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Experiment'>;
type ExperimentScreenRouteProp = RouteProp<RootStackParamList, 'Experiment'>;

interface ExperimentScreenProps {
  navigation: ExperimentScreenNavigationProp;
  route: ExperimentScreenRouteProp;
}


const ExperimentScreen: React.FC<ExperimentScreenProps> = ({ navigation, route }) => {
  const { experimentId } = route.params || {};
  const { state, addElement, removeElement, clearCircuit, updateElementPosition, connectElements, toggleSwitch } = useCircuit();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  // 连接模式状态
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // 从CircuitContext状态中获取数据
  const circuitElements = state.elements;

  // 实验配置
  const experimentConfigs = {
    'simple-circuit': {
      title: '简单电路',
      description: '连接电池、灯泡和开关，组成一个完整电路',
      requiredElements: ['battery', 'bulb', 'switch'],
    },
    'series-circuit': {
      title: '串联电路',
      description: '将多个灯泡串联连接，观察电流变化',
      requiredElements: ['battery', 'bulb', 'bulb', 'switch'],
    },
    'parallel-circuit': {
      title: '并联电路',
      description: '将多个灯泡并联连接，比较与串联的区别',
      requiredElements: ['battery', 'bulb', 'bulb', 'switch'],
    },
    'switch-circuit': {
      title: '开关控制',
      description: '学习如何使用开关控制电路',
      requiredElements: ['battery', 'bulb', 'switch'],
    },
  };

  const config = experimentId ? experimentConfigs[experimentId as keyof typeof experimentConfigs] : {
    title: '自由实验',
    description: '自由组合各种电路元件，创造你自己的电路',
    requiredElements: [],
  };

  const handleAddElement = (type: CircuitElementType) => {
    const x = Math.random() * (width - 100) + 50;
    const y = Math.random() * (height / 2) + 100;
    addElement(type, x, y);
  };

  const handleClearCircuit = () => {
    Alert.alert(
      '清空电路',
      '确定要清空所有元件吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: () => {
            clearCircuit();
            setSelectedElementId(null);
          },
        },
      ]
    );
  };

  // 退出连接模式
  const exitConnectMode = useCallback(() => {
    setIsConnectMode(false);
    setConnectingFromId(null);
  }, []);

  // 进入连接模式
  const enterConnectMode = useCallback(() => {
    setIsConnectMode(true);
    setConnectingFromId(null);
    setSelectedElementId(null);
  }, []);

  // 处理元件选中（普通模式 & 连接模式）
  const handleElementSelect = useCallback((elementId: string) => {
    if (!isConnectMode) {
      const el = state.elements.find(e => e.id === elementId);
      // 开关：点击直接切换开/关
      if (el?.type === 'switch') {
        toggleSwitch(elementId);
        return;
      }
      setSelectedElementId(elementId);
      return;
    }

    // 连接模式：第一次点击选"from"元件
    if (!connectingFromId) {
      setConnectingFromId(elementId);
      return;
    }

    // 点了同一个元件 → 取消选择
    if (connectingFromId === elementId) {
      setConnectingFromId(null);
      return;
    }

    // 第二次点击不同元件 → 尝试连接
    const fromElement = state.elements.find(e => e.id === connectingFromId);
    const toElement = state.elements.find(e => e.id === elementId);

    if (fromElement && toElement) {
      const points = findCompatiblePoints(fromElement, toElement, state.connections);
      if (points) {
        const result = connectElements(
          connectingFromId,
          points.fromPointId,
          elementId,
          points.toPointId
        );
        if (result.success) {
          Alert.alert('连接成功 ✅', `${fromElement.name} 与 ${toElement.name} 已连接！`);
        } else {
          Alert.alert('连接失败', result.message);
        }
      } else {
        Alert.alert('无法连接', '这两个元件没有可用的兼容连接点。');
      }
    }
    setConnectingFromId(null);
  }, [isConnectMode, connectingFromId, state.elements, state.connections, connectElements]);

  // 处理元件拖拽
  const handleElementDrag = useCallback((elementId: string, x: number, y: number) => {
    updateElementPosition(elementId, x, y);
  }, [updateElementPosition]);

  // 获取元件详细信息文字
  const getElementDetails = useCallback((elementId: string): string => {
    const el = state.elements.find(e => e.id === elementId);
    if (!el) return '';
    const lines: string[] = [`类型：${el.name}`];
    if (el.voltage !== undefined) lines.push(`电压：${el.voltage} V`);
    if (el.resistance !== undefined) lines.push(`电阻：${el.resistance} Ω`);
    if (el.current !== undefined && el.current > 0) lines.push(`电流：${el.current.toFixed(3)} A`);
    if (el.power !== undefined && el.power > 0) lines.push(`功率：${el.power.toFixed(3)} W`);
    if ('isClosed' in el) lines.push(`开关状态：${(el as any).isClosed ? '闭合' : '断开'}`);
    if ('brightness' in el) lines.push(`亮度：${((el as any).brightness * 100).toFixed(0)}%`);
    lines.push(`连接数：${el.connectedElements.length}`);
    return lines.join('\n');
  }, [state.elements]);

  // 处理元件长按
  const handleElementLongPress = useCallback((elementId: string) => {
    const el = state.elements.find(e => e.id === elementId);
    if (!el) return;
    Alert.alert(
      el.name,
      '选择操作',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '详细信息',
          onPress: () => Alert.alert(`${el.name} 详情`, getElementDetails(elementId)),
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            removeElement(elementId);
            if (selectedElementId === elementId) setSelectedElementId(null);
            if (connectingFromId === elementId) setConnectingFromId(null);
          },
        },
      ]
    );
  }, [state.elements, removeElement, selectedElementId, connectingFromId, getElementDetails]);

  // 处理画布点击
  const handleCanvasPress = useCallback((x: number, y: number) => {
    setSelectedElementId(null); // 点击空白区域取消选中
  }, []);

  const checkCircuit = () => {
    if (circuitElements.length === 0) {
      Alert.alert('提示', '请添加至少一个元件来组成电路');
      return;
    }

    // 使用CircuitSimulator的电路状态
    const statusMessage = state.isComplete
      ? `电路完整！\n总电压: ${state.totalVoltage.toFixed(2)} V\n总电流: ${state.totalCurrent.toFixed(2)} A\n总电阻: ${state.totalResistance.toFixed(2)} Ω\n总功率: ${state.totalPower.toFixed(2)} W`
      : '电路不完整。请连接元件形成完整回路。';

    Alert.alert('电路检查', statusMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 实验标题和描述 */}
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      {/* 电路画布区域 */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          {circuitElements.length === 0 ? (
            <View style={styles.emptyCanvas}>
              <Text style={styles.emptyText}>🎯 从这里开始</Text>
              <Text style={styles.emptySubtext}>
                从下方拖拽元件到画布上，连接它们组成电路
              </Text>
            </View>
          ) : (
            <>
              <CircuitCanvas
                elements={circuitElements}
                connections={state.connections}
                showGrid={true}
                interactive={!isConnectMode}
                selectedElementId={connectingFromId}
                onElementSelect={handleElementSelect}
                onElementDrag={handleElementDrag}
                onCanvasPress={handleCanvasPress}
                onElementLongPress={handleElementLongPress}
              />

              {/* 连接模式提示条 */}
              {isConnectMode && (
                <View style={styles.connectHint}>
                  <Text style={styles.connectHintText}>
                    {connectingFromId
                      ? '✅ 已选择元件，再点击另一个元件完成连接'
                      : '🔗 连接模式：点击第一个元件'}
                  </Text>
                  <TouchableOpacity onPress={exitConnectMode} style={styles.connectCancelBtn}>
                    <Text style={styles.connectCancelText}>取消</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 电路状态面板（始终显示） */}
              <View style={styles.statusPanelWrapper}>
                <CircuitStatusPanel state={state} />
              </View>
            </>
          )}
        </View>
      </View>

      {/* 控制面板 */}
      <View style={styles.controlPanel}>
        <ElementPalette
          onElementAdd={handleAddElement}
          requiredTypes={config.requiredElements as CircuitElementType[]}
        />

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isConnectMode ? styles.connectActiveButton : styles.connectButton]}
            onPress={isConnectMode ? exitConnectMode : enterConnectMode}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{isConnectMode ? '退出连接' : '🔗 连接'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.checkButton]}
            onPress={checkCircuit}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>检查电路</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearCircuit}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>清空</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.helpButton]}
            onPress={() => navigation.navigate('Learn', { topic: 'circuit-basics' })}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>帮助</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 安全提示 */}
      <View style={styles.safetyNote}>
        <Text style={styles.safetyNoteText}>
          💡 提示：尝试连接电池的正负极，观察灯泡的变化。记住真实实验中要小心！
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: isTablet ? 20 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  title: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: isTablet ? 16 : 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: isTablet ? 20 : 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  emptyCanvas: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    color: '#BDC3C7',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: isTablet ? 16 : 14,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusPanelWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  controlPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  actionButtons: {
    paddingHorizontal: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: isTablet ? 16 : 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  connectButton: {
    backgroundColor: '#34C759',
  },
  connectActiveButton: {
    backgroundColor: '#FF9500',
  },
  checkButton: {
    backgroundColor: '#4A90E2',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  helpButton: {
    backgroundColor: '#95A5A6',
  },
  connectHint: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.92)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  connectHintText: {
    flex: 1,
    fontSize: isTablet ? 14 : 12,
    color: '#fff',
    fontWeight: '600',
  },
  connectCancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  connectCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isTablet ? 14 : 12,
  },
  actionButtonText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  safetyNote: {
    backgroundColor: '#FFF3CD',
    padding: isTablet ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: '#FFEAA7',
  },
  safetyNoteText: {
    fontSize: isTablet ? 14 : 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ExperimentScreen;