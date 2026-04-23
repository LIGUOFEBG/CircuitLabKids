/**
 * 电路模拟核心类型定义
 */

// 电路元件类型
export type CircuitElementType =
  | 'battery'    // 电池
  | 'bulb'       // 灯泡
  | 'wire'       // 导线
  | 'switch'     // 开关
  | 'resistor';  // 电阻

// 元件连接点
export interface ConnectionPoint {
  id: string;
  elementId: string;
  pointType: 'positive' | 'negative' | 'terminal'; // 正极、负极、通用端子
  x: number;
  y: number;
}

// 电路元件基础接口
export interface CircuitElement {
  id: string;
  type: CircuitElementType;
  name: string;

  // 位置和尺寸
  x: number;
  y: number;
  width: number;
  height: number;

  // 电学属性
  voltage?: number;      // 电压 (V) - 电池特有
  resistance?: number;   // 电阻 (Ω) - 灯泡、电阻器特有
  current?: number;      // 电流 (A) - 计算得出
  power?: number;        // 功率 (W) - 计算得出

  // 状态
  isOn?: boolean;        // 是否通电 - 灯泡、开关特有
  isClosed?: boolean;    // 是否闭合 - 开关特有

  // 连接
  connectionPoints: ConnectionPoint[];
  connectedElements: string[]; // 连接的元件ID列表

  // 元数据
  createdAt: number;
  updatedAt: number;
}

// 电池元件
export interface BatteryElement extends CircuitElement {
  type: 'battery';
  voltage: number;  // 电池电压，默认1.5V
}

// 灯泡元件
export interface BulbElement extends CircuitElement {
  type: 'bulb';
  resistance: number;  // 灯泡电阻，默认10Ω
  brightness: number;  // 亮度 0-1
  isOn: boolean;
}

// 导线元件
export interface WireElement extends CircuitElement {
  type: 'wire';
  length: number;  // 导线长度（像素）
  resistance: number;  // 导线电阻，很小
}

// 开关元件
export interface SwitchElement extends CircuitElement {
  type: 'switch';
  isClosed: boolean;  // 开关是否闭合
}

// 电阻器元件
export interface ResistorElement extends CircuitElement {
  type: 'resistor';
  resistance: number;  // 电阻值
}

// 电路连接
export interface CircuitConnection {
  id: string;
  fromElementId: string;
  fromPointId: string;
  toElementId: string;
  toPointId: string;
  wireId?: string;  // 如果有导线元件
}

// 电路状态
export interface CircuitState {
  elements: CircuitElement[];
  connections: CircuitConnection[];
  isComplete: boolean;      // 电路是否完整
  totalVoltage: number;     // 总电压
  totalCurrent: number;     // 总电流
  totalResistance: number;  // 总电阻
  totalPower: number;       // 总功率
  lastUpdated: number;
}

// 电路分析结果
export interface CircuitAnalysis {
  isValid: boolean;
  message: string;
  nodeVoltages: Map<string, number>;  // 节点电压
  branchCurrents: Map<string, number>; // 支路电流
  elementStates: Map<string, {
    voltage: number;
    current: number;
    power: number;
  }>;
}

// 预设实验配置
export interface ExperimentConfig {
  id: string;
  title: string;
  description: string;
  requiredElements: CircuitElementType[];
  initialElements: Partial<CircuitElement>[];
  learningObjectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

// 元件拖放事件
export interface DragEvent {
  elementId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

// 元件尺寸配置
export const ELEMENT_SIZES = {
  battery: { width: 80, height: 120 },
  bulb: { width: 80, height: 100 },
  wire: { width: 100, height: 20 },
  switch: { width: 80, height: 60 },
  resistor: { width: 100, height: 40 },
} as const;

// 默认元件属性
export const DEFAULT_ELEMENT_PROPERTIES = {
  battery: {
    voltage: 1.5,
    resistance: 0.1,
  },
  bulb: {
    resistance: 10,
    brightness: 0,
    isOn: false,
  },
  wire: {
    resistance: 0.01,
    length: 100,
  },
  switch: {
    isClosed: false,
  },
  resistor: {
    resistance: 100,
  },
} as const;