/**
 * 电路模拟器
 * 管理电路状态和模拟过程
 */

import {
  CircuitElement,
  CircuitConnection,
  CircuitState,
  CircuitAnalysis,
  BatteryElement,
  BulbElement,
  SwitchElement,
  ResistorElement,
  WireElement,
  ELEMENT_SIZES,
  DEFAULT_ELEMENT_PROPERTIES,
} from '../models/types';
import { CircuitCalculator } from '../calculator/circuitCalculator';

/**
 * 电路模拟器类
 */
export class CircuitSimulator {
  private state: CircuitState;
  private onStateChange: ((state: CircuitState) => void) | null = null;

  constructor(initialState?: CircuitState) {
    this.state = initialState || this.createInitialState();
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): CircuitState {
    return {
      elements: [],
      connections: [],
      isComplete: false,
      totalVoltage: 0,
      totalCurrent: 0,
      totalResistance: 0,
      totalPower: 0,
      lastUpdated: Date.now(),
    };
  }

  /**
   * 设置状态变化回调
   */
  setOnStateChange(callback: ((state: CircuitState) => void) | null) {
    this.onStateChange = callback;
  }

  /**
   * 获取当前状态
   */
  getState(): CircuitState {
    return { ...this.state };
  }

  /**
   * 添加电路元件
   */
  addElement(type: CircuitElement['type'], x: number, y: number): CircuitElement {
    const id = `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    // 创建基础元件
    let element: CircuitElement;

    switch (type) {
      case 'battery':
        element = {
          id,
          type,
          name: '电池',
          x,
          y,
          width: ELEMENT_SIZES.battery.width,
          height: ELEMENT_SIZES.battery.height,
          voltage: DEFAULT_ELEMENT_PROPERTIES.battery.voltage,
          resistance: DEFAULT_ELEMENT_PROPERTIES.battery.resistance,
          connectionPoints: [
            { id: `${id}_positive`, elementId: id, pointType: 'positive', x: x + 40, y: y + 20 },
            { id: `${id}_negative`, elementId: id, pointType: 'negative', x: x + 40, y: y + 100 },
          ],
          connectedElements: [],
          createdAt: now,
          updatedAt: now,
        } as BatteryElement;
        break;

      case 'bulb':
        element = {
          id,
          type,
          name: '灯泡',
          x,
          y,
          width: ELEMENT_SIZES.bulb.width,
          height: ELEMENT_SIZES.bulb.height,
          resistance: DEFAULT_ELEMENT_PROPERTIES.bulb.resistance,
          brightness: DEFAULT_ELEMENT_PROPERTIES.bulb.brightness,
          isOn: DEFAULT_ELEMENT_PROPERTIES.bulb.isOn,
          connectionPoints: [
            { id: `${id}_top`, elementId: id, pointType: 'terminal', x: x + 40, y: y + 20 },
            { id: `${id}_bottom`, elementId: id, pointType: 'terminal', x: x + 40, y: y + 80 },
          ],
          connectedElements: [],
          createdAt: now,
          updatedAt: now,
        } as BulbElement;
        break;

      case 'wire':
        element = {
          id,
          type,
          name: '导线',
          x,
          y,
          width: ELEMENT_SIZES.wire.width,
          height: ELEMENT_SIZES.wire.height,
          resistance: DEFAULT_ELEMENT_PROPERTIES.wire.resistance,
          length: DEFAULT_ELEMENT_PROPERTIES.wire.length,
          connectionPoints: [
            { id: `${id}_start`, elementId: id, pointType: 'terminal', x: x + 20, y: y + 10 },
            { id: `${id}_end`, elementId: id, pointType: 'terminal', x: x + 80, y: y + 10 },
          ],
          connectedElements: [],
          createdAt: now,
          updatedAt: now,
        } as WireElement;
        break;

      case 'switch':
        element = {
          id,
          type,
          name: '开关',
          x,
          y,
          width: ELEMENT_SIZES.switch.width,
          height: ELEMENT_SIZES.switch.height,
          isClosed: DEFAULT_ELEMENT_PROPERTIES.switch.isClosed,
          connectionPoints: [
            { id: `${id}_in`, elementId: id, pointType: 'terminal', x: x + 20, y: y + 30 },
            { id: `${id}_out`, elementId: id, pointType: 'terminal', x: x + 60, y: y + 30 },
          ],
          connectedElements: [],
          createdAt: now,
          updatedAt: now,
        } as SwitchElement;
        break;

      case 'resistor':
        element = {
          id,
          type,
          name: '电阻',
          x,
          y,
          width: ELEMENT_SIZES.resistor.width,
          height: ELEMENT_SIZES.resistor.height,
          resistance: DEFAULT_ELEMENT_PROPERTIES.resistor.resistance,
          connectionPoints: [
            { id: `${id}_left`, elementId: id, pointType: 'terminal', x: x + 20, y: y + 20 },
            { id: `${id}_right`, elementId: id, pointType: 'terminal', x: x + 80, y: y + 20 },
          ],
          connectedElements: [],
          createdAt: now,
          updatedAt: now,
        } as ResistorElement;
        break;

      default:
        throw new Error(`未知的元件类型: ${type}`);
    }

    // 添加到状态
    this.state.elements.push(element);
    this.updateCircuitState();
    this.notifyStateChange();

    return element;
  }

  /**
   * 移除电路元件
   */
  removeElement(elementId: string): boolean {
    const elementIndex = this.state.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) {
      return false;
    }

    // 移除与该元件相关的连接
    this.state.connections = this.state.connections.filter(
      conn => conn.fromElementId !== elementId && conn.toElementId !== elementId
    );

    // 从其他元件的连接列表中移除
    this.state.elements.forEach(element => {
      const index = element.connectedElements.indexOf(elementId);
      if (index !== -1) {
        element.connectedElements.splice(index, 1);
      }
    });

    // 移除元件
    this.state.elements.splice(elementIndex, 1);
    this.updateCircuitState();
    this.notifyStateChange();

    return true;
  }

  /**
   * 更新元件位置
   */
  updateElementPosition(elementId: string, x: number, y: number): boolean {
    const element = this.state.elements.find(el => el.id === elementId);
    if (!element) {
      return false;
    }

    // 更新元件位置
    element.x = x;
    element.y = y;

    // 更新连接点位置
    element.connectionPoints.forEach(point => {
      // 简化：根据元件类型和尺寸计算连接点位置
      switch (element.type) {
        case 'battery':
          if (point.pointType === 'positive') {
            point.x = x + 40;
            point.y = y + 20;
          } else {
            point.x = x + 40;
            point.y = y + 100;
          }
          break;

        case 'bulb':
          if (point.id.includes('top')) {
            point.x = x + 40;
            point.y = y + 20;
          } else {
            point.x = x + 40;
            point.y = y + 80;
          }
          break;

        case 'wire':
          if (point.id.includes('start')) {
            point.x = x + 20;
            point.y = y + 10;
          } else {
            point.x = x + 80;
            point.y = y + 10;
          }
          break;

        case 'switch':
          if (point.id.includes('in')) {
            point.x = x + 20;
            point.y = y + 30;
          } else {
            point.x = x + 60;
            point.y = y + 30;
          }
          break;

        case 'resistor':
          if (point.id.includes('left')) {
            point.x = x + 20;
            point.y = y + 20;
          } else {
            point.x = x + 80;
            point.y = y + 20;
          }
          break;
      }
    });

    element.updatedAt = Date.now();
    this.updateCircuitState();
    this.notifyStateChange();

    return true;
  }

  /**
   * 连接两个元件
   */
  connectElements(
    fromElementId: string,
    fromPointId: string,
    toElementId: string,
    toPointId: string
  ): { success: boolean; message: string; connectionId?: string } {
    const fromElement = this.state.elements.find(el => el.id === fromElementId);
    const toElement = this.state.elements.find(el => el.id === toElementId);

    if (!fromElement || !toElement) {
      return { success: false, message: '找不到指定的元件' };
    }

    // 验证连接
    const validation = CircuitCalculator.validateConnection(fromElement, toElement, this.state.connections);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    // 创建连接
    const connectionId = `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const connection: CircuitConnection = {
      id: connectionId,
      fromElementId,
      fromPointId,
      toElementId,
      toPointId,
    };

    // 添加到状态
    this.state.connections.push(connection);

    // 更新元件的连接列表
    fromElement.connectedElements.push(toElementId);
    toElement.connectedElements.push(fromElementId);

    this.updateCircuitState();
    this.notifyStateChange();

    return { success: true, message: '连接成功', connectionId };
  }

  /**
   * 断开连接
   */
  disconnectElements(connectionId: string): boolean {
    const connectionIndex = this.state.connections.findIndex(conn => conn.id === connectionId);
    if (connectionIndex === -1) {
      return false;
    }

    const connection = this.state.connections[connectionIndex];

    // 从元件的连接列表中移除
    const fromElement = this.state.elements.find(el => el.id === connection.fromElementId);
    const toElement = this.state.elements.find(el => el.id === connection.toElementId);

    if (fromElement) {
      const index = fromElement.connectedElements.indexOf(connection.toElementId);
      if (index !== -1) {
        fromElement.connectedElements.splice(index, 1);
      }
    }

    if (toElement) {
      const index = toElement.connectedElements.indexOf(connection.fromElementId);
      if (index !== -1) {
        toElement.connectedElements.splice(index, 1);
      }
    }

    // 移除连接
    this.state.connections.splice(connectionIndex, 1);
    this.updateCircuitState();
    this.notifyStateChange();

    return true;
  }

  /**
   * 切换开关状态
   */
  toggleSwitch(switchId: string): boolean {
    const switchElement = this.state.elements.find(
      el => el.id === switchId && el.type === 'switch'
    ) as SwitchElement;

    if (!switchElement) {
      return false;
    }

    switchElement.isClosed = !switchElement.isClosed;
    switchElement.updatedAt = Date.now();
    this.updateCircuitState();
    this.notifyStateChange();

    return true;
  }

  /**
   * 清空电路
   */
  clearCircuit(): void {
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  /**
   * 更新电路状态
   */
  private updateCircuitState(): void {
    const now = Date.now();

    // 分析电路
    const analysis = CircuitCalculator.analyzeCircuit(this.state.elements, this.state.connections);

    // 更新元件状态
    if (analysis.isValid) {
      this.state.elements = CircuitCalculator.updateElementStates(this.state.elements, analysis);

      // 计算总体参数
      this.state.totalVoltage = this.state.elements
        .filter(el => el.type === 'battery')
        .reduce((sum, el) => sum + (el.voltage || 0), 0);

      this.state.totalCurrent = Array.from(analysis.elementStates.values())
        .reduce((sum, state) => sum + state.current, 0) / analysis.elementStates.size || 0;

      this.state.totalResistance = this.state.elements
        .reduce((sum, el) => sum + (el.resistance || 0), 0);

      this.state.totalPower = CircuitCalculator.calculatePowerConsumption(this.state.elements, analysis);

      this.state.isComplete = true;
    } else {
      // 电路不完整，重置状态
      this.state.elements.forEach(element => {
        if (element.type === 'bulb') {
          (element as BulbElement).isOn = false;
          (element as BulbElement).brightness = 0;
        }
        element.current = 0;
        element.voltage = 0;
        element.power = 0;
      });

      this.state.totalVoltage = 0;
      this.state.totalCurrent = 0;
      this.state.totalResistance = 0;
      this.state.totalPower = 0;
      this.state.isComplete = false;
    }

    this.state.lastUpdated = now;
  }

  /**
   * 通知状态变化
   */
  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  /**
   * 获取电路安全性报告
   */
  getSafetyReport(): { isSafe: boolean; warnings: string[] } {
    const analysis = CircuitCalculator.analyzeCircuit(this.state.elements, this.state.connections);
    return CircuitCalculator.checkSafety(this.state.elements, analysis);
  }

  /**
   * 导出电路状态
   */
  exportCircuit(): CircuitState {
    return { ...this.state };
  }

  /**
   * 导入电路状态
   */
  importCircuit(state: CircuitState): void {
    this.state = { ...state };
    this.notifyStateChange();
  }

  /**
   * 重置模拟器
   */
  reset(): void {
    this.state = this.createInitialState();
    this.notifyStateChange();
  }
}