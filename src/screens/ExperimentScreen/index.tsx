import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { useCircuit } from '../../core/circuit/context/CircuitContext';
import { markExperimentCompleted } from '../../utils/completionStorage';
import { CircuitElementType, CircuitElement, CircuitConnection, ConnectionPoint, CircuitState } from '../../core/circuit/models/types';
import { CircuitCanvas, CircuitStatusPanel, ElementPalette } from '../../components/circuit';

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

// ─── 步骤引导 ───────────────────────────────────────────────
interface Step {
  label: string;
  hint: string;
  done: boolean;
}

function buildSteps(experimentId: string, state: CircuitState): Step[] {
  const els = state.elements;
  const hasBattery = els.some(e => e.type === 'battery');
  const hasBulb = els.some(e => e.type === 'bulb');
  const bulbCount = els.filter(e => e.type === 'bulb').length;
  const hasSwitch = els.some(e => e.type === 'switch');
  const switchClosed = els.some(e => e.type === 'switch' && (e as any).isClosed);
  const connCount = state.connections.length;

  switch (experimentId) {
    case 'simple-circuit':
      return [
        { label: '①加电池', hint: '点下方"电池"按钮', done: hasBattery },
        { label: '②加灯泡', hint: '点下方"灯泡"按钮', done: hasBulb },
        { label: '③加开关', hint: '点下方"开关"按钮', done: hasSwitch },
        { label: '④连接元件', hint: '点"连接"，再依次点两个元件', done: connCount >= 2 },
        { label: '⑤闭合开关', hint: '点击画布上的开关让灯亮起来', done: switchClosed && state.isComplete },
      ];
    case 'series-circuit':
      return [
        { label: '①加电池', hint: '点下方"电池"按钮', done: hasBattery },
        { label: '②加2个灯泡', hint: '点"灯泡"按钮两次', done: bulbCount >= 2 },
        { label: '③加开关', hint: '点下方"开关"按钮', done: hasSwitch },
        { label: '④串联连接', hint: '进入连接模式，依次连接所有元件', done: connCount >= 3 },
        { label: '⑤闭合开关', hint: '观察串联灯泡的亮度', done: switchClosed && state.isComplete },
      ];
    case 'parallel-circuit':
      return [
        { label: '①加电池', hint: '点下方"电池"按钮', done: hasBattery },
        { label: '②加2个灯泡', hint: '点"灯泡"按钮两次', done: bulbCount >= 2 },
        { label: '③加开关', hint: '点下方"开关"按钮', done: hasSwitch },
        { label: '④并联连接', hint: '每个灯泡都连到电池两端', done: connCount >= 4 },
        { label: '⑤闭合开关', hint: '比较并联与串联的灯泡亮度差别', done: switchClosed && state.isComplete },
      ];
    case 'switch-circuit':
      return [
        { label: '①加电池', hint: '点下方"电池"按钮', done: hasBattery },
        { label: '②加灯泡', hint: '点下方"灯泡"按钮', done: hasBulb },
        { label: '③加开关', hint: '点下方"开关"按钮', done: hasSwitch },
        { label: '④连接元件', hint: '点"连接"，再依次点两个元件', done: connCount >= 2 },
        { label: '⑤闭合开关', hint: '点击开关控制灯的亮灭', done: switchClosed && state.isComplete },
      ];
    default:
      return [];
  }
}

// ─── 步骤引导面板组件 ─────────────────────────────────────
interface StepsPanelProps {
  steps: Step[];
}

const StepsPanel: React.FC<StepsPanelProps> = ({ steps }) => {
  const currentIdx = steps.findIndex(s => !s.done);
  const allDone = currentIdx === -1;
  const currentStep = allDone ? null : steps[currentIdx];

  return (
    <View style={stepStyles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={stepStyles.row}>
        {steps.map((step, idx) => {
          const isDone = step.done;
          const isCurrent = idx === currentIdx;
          return (
            <View
              key={idx}
              style={[
                stepStyles.pill,
                isDone && stepStyles.pillDone,
                isCurrent && stepStyles.pillCurrent,
              ]}
            >
              <Text style={[stepStyles.pillText, isDone && stepStyles.pillTextDone, isCurrent && stepStyles.pillTextCurrent]}>
                {isDone ? '✓ ' : ''}{step.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {currentStep && (
        <View style={stepStyles.hintRow}>
          <Text style={stepStyles.hintText}>提示：{currentStep.hint}</Text>
        </View>
      )}
      {allDone && (
        <View style={stepStyles.hintRow}>
          <Text style={[stepStyles.hintText, stepStyles.hintSuccess]}>实验完成！太棒了！</Text>
        </View>
      )}
    </View>
  );
};

const stepStyles = StyleSheet.create({
  container: {
    backgroundColor: '#EBF5FB',
    borderBottomWidth: 1,
    borderBottomColor: '#AED6F1',
    paddingTop: 8,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 6,
  },
  pill: {
    backgroundColor: '#D5D8DC',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillDone: {
    backgroundColor: '#27AE60',
  },
  pillCurrent: {
    backgroundColor: '#2980B9',
  },
  pillText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  pillTextDone: {
    color: '#fff',
  },
  pillTextCurrent: {
    color: '#fff',
  },
  hintRow: {
    paddingHorizontal: 14,
    paddingTop: 2,
  },
  hintText: {
    fontSize: 12,
    color: '#2471A3',
  },
  hintSuccess: {
    color: '#1E8449',
    fontWeight: 'bold',
  },
});

// ─── 主屏幕 ───────────────────────────────────────────────
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
  const { state, addElement, removeElement, clearCircuit, updateElementPosition, connectElements, disconnectElements, toggleSwitch } = useCircuit();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  const circuitElements = state.elements;

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

  const config = experimentId
    ? experimentConfigs[experimentId as keyof typeof experimentConfigs]
    : { title: '自由实验', description: '自由组合各种电路元件，创造你自己的电路', requiredElements: [] };

  // 步骤引导（仅预设实验显示）
  const steps = useMemo(
    () => (experimentId ? buildSteps(experimentId, state) : []),
    [experimentId, state]
  );

  // 所有步骤完成时持久化记录
  const allStepsDone = steps.length > 0 && steps.every(s => s.done);
  useEffect(() => {
    if (allStepsDone && experimentId) {
      markExperimentCompleted(experimentId);
    }
  }, [allStepsDone, experimentId]);

  const handleAddElement = (type: CircuitElementType) => {
    const x = Math.random() * (width - 100) + 50;
    const y = Math.random() * (height / 2) + 100;
    addElement(type, x, y);
  };

  // 预设元件布局：按实验类型摆放在合理位置
  const handleLoadPreset = () => {
    if (!experimentId) return;
    const cx = width / 2;
    switch (experimentId) {
      case 'simple-circuit':
      case 'switch-circuit':
        addElement('battery', cx - 200, 160);
        addElement('switch', cx - 20, 80);
        addElement('bulb', cx + 120, 160);
        break;
      case 'series-circuit':
        addElement('battery', cx - 200, 180);
        addElement('switch', cx - 20, 80);
        addElement('bulb', cx + 80, 100);
        addElement('bulb', cx + 80, 260);
        break;
      case 'parallel-circuit':
        addElement('battery', cx - 200, 200);
        addElement('switch', cx - 20, 80);
        addElement('bulb', cx + 100, 100);
        addElement('bulb', cx + 100, 300);
        break;
    }
  };

  const handleClearCircuit = () => {
    Alert.alert('清空电路', '确定要清空所有元件吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: () => {
          clearCircuit();
          setSelectedElementId(null);
        },
      },
    ]);
  };

  const exitConnectMode = useCallback(() => {
    setIsConnectMode(false);
    setConnectingFromId(null);
  }, []);

  const enterConnectMode = useCallback(() => {
    setIsConnectMode(true);
    setConnectingFromId(null);
    setSelectedElementId(null);
  }, []);

  const handleElementSelect = useCallback((elementId: string) => {
    if (!isConnectMode) {
      const el = state.elements.find(e => e.id === elementId);
      if (el?.type === 'switch') {
        toggleSwitch(elementId);
        return;
      }
      setSelectedElementId(elementId);
      return;
    }

    if (!connectingFromId) {
      setConnectingFromId(elementId);
      return;
    }

    if (connectingFromId === elementId) {
      setConnectingFromId(null);
      return;
    }

    const fromElement = state.elements.find(e => e.id === connectingFromId);
    const toElement = state.elements.find(e => e.id === elementId);

    if (fromElement && toElement) {
      const points = findCompatiblePoints(fromElement, toElement, state.connections);
      if (points) {
        const result = connectElements(connectingFromId, points.fromPointId, elementId, points.toPointId);
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
  }, [isConnectMode, connectingFromId, state.elements, state.connections, connectElements, toggleSwitch]);

  const handleElementDrag = useCallback((elementId: string, x: number, y: number) => {
    updateElementPosition(elementId, x, y);
  }, [updateElementPosition]);

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

  const handleElementLongPress = useCallback((elementId: string) => {
    const el = state.elements.find(e => e.id === elementId);
    if (!el) return;
    Alert.alert(el.name, '选择操作', [
      { text: '取消', style: 'cancel' },
      { text: '详细信息', onPress: () => Alert.alert(`${el.name} 详情`, getElementDetails(elementId)) },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          removeElement(elementId);
          if (selectedElementId === elementId) setSelectedElementId(null);
          if (connectingFromId === elementId) setConnectingFromId(null);
        },
      },
    ]);
  }, [state.elements, removeElement, selectedElementId, connectingFromId, getElementDetails]);

  // 长按连接线 → 确认后断开
  const handleConnectionLongPress = useCallback((connectionId: string) => {
    Alert.alert('断开连接', '确定要断开这条连接线吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '断开',
        style: 'destructive',
        onPress: () => disconnectElements(connectionId),
      },
    ]);
  }, [disconnectElements]);

  const handleCanvasPress = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  const checkCircuit = () => {
    if (circuitElements.length === 0) {
      Alert.alert('提示', '请添加至少一个元件来组成电路');
      return;
    }
    const statusMessage = state.isComplete
      ? `电路完整！\n总电压: ${state.totalVoltage.toFixed(2)} V\n总电流: ${state.totalCurrent.toFixed(2)} A\n总电阻: ${state.totalResistance.toFixed(2)} Ω\n总功率: ${state.totalPower.toFixed(2)} W`
      : '电路不完整。请连接元件形成完整回路。';
    Alert.alert('电路检查', statusMessage);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>
      </View>

      {/* 步骤引导（预设实验才显示） */}
      {steps.length > 0 && <StepsPanel steps={steps} />}

      {/* 电路画布 */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          {circuitElements.length === 0 ? (
            <View style={styles.emptyCanvas}>
              <Text style={styles.emptyText}>🎯 从这里开始</Text>
              <Text style={styles.emptySubtext}>
                从下方添加元件到画布上，连接它们组成电路
              </Text>
              {experimentId && (
                <TouchableOpacity style={styles.presetBtn} onPress={handleLoadPreset} activeOpacity={0.8}>
                  <Text style={styles.presetBtnText}>⚡ 一键摆放实验元件</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <CircuitCanvas
                elements={circuitElements}
                connections={state.connections}
                showGrid={true}
                interactive={!isConnectMode}
                selectedElementId={connectingFromId}
                isCircuitActive={state.isComplete}
                onElementSelect={handleElementSelect}
                onElementDrag={handleElementDrag}
                onCanvasPress={handleCanvasPress}
                onElementLongPress={handleElementLongPress}
                onConnectionLongPress={handleConnectionLongPress}
              />

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
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isConnectMode ? styles.connectActiveButton : styles.connectButton]}
            onPress={isConnectMode ? exitConnectMode : enterConnectMode}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{isConnectMode ? '退出连接' : '🔗 连接'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.checkButton]} onPress={checkCircuit} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>检查电路</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClearCircuit} activeOpacity={0.8}>
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
          长按连接线可断开连接 · 长按元件可删除 · 真实实验请在大人陪同下进行
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    padding: isTablet ? 20 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  title: { fontSize: isTablet ? 24 : 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  description: { fontSize: isTablet ? 16 : 14, color: '#7F8C8D', lineHeight: 20 },
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
  canvas: { flex: 1, backgroundColor: '#F8F9FA', position: 'relative' },
  emptyCanvas: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: isTablet ? 24 : 20, fontWeight: 'bold', color: '#BDC3C7', marginBottom: 12 },
  emptySubtext: { fontSize: isTablet ? 16 : 14, color: '#BDC3C7', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  presetBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  presetBtnText: { fontSize: isTablet ? 17 : 15, fontWeight: 'bold', color: '#fff' },
  statusPanelWrapper: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  controlPanel: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ECF0F1' },
  actionButtons: {
    paddingHorizontal: isTablet ? 20 : 16,
    paddingBottom: isTablet ? 16 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: { flex: 1, padding: isTablet ? 16 : 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 6 },
  connectButton: { backgroundColor: '#34C759' },
  connectActiveButton: { backgroundColor: '#FF9500' },
  checkButton: { backgroundColor: '#4A90E2' },
  clearButton: { backgroundColor: '#FF6B6B' },
  helpButton: { backgroundColor: '#95A5A6' },
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
  connectHintText: { flex: 1, fontSize: isTablet ? 14 : 12, color: '#fff', fontWeight: '600' },
  connectCancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  connectCancelText: { color: '#fff', fontWeight: 'bold', fontSize: isTablet ? 14 : 12 },
  actionButtonText: { fontSize: isTablet ? 16 : 14, fontWeight: 'bold', color: '#fff' },
  safetyNote: {
    backgroundColor: '#FFF3CD',
    padding: isTablet ? 16 : 12,
    borderTopWidth: 1,
    borderTopColor: '#FFEAA7',
  },
  safetyNoteText: { fontSize: isTablet ? 14 : 12, color: '#856404', textAlign: 'center', lineHeight: 18 },
});

export default ExperimentScreen;
