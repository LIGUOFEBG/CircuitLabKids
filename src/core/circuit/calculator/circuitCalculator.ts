/**
 * 电路计算器
 * 实现基本的电路分析算法
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
} from '../models/types';

/**
 * 电路计算器类
 */
export class CircuitCalculator {
  /**
   * 分析电路状态
   */
  static analyzeCircuit(elements: CircuitElement[], connections: CircuitConnection[]): CircuitAnalysis {
    // 简化电路分析：仅支持简单串联/并联电路
    const analysis: CircuitAnalysis = {
      isValid: false,
      message: '',
      nodeVoltages: new Map(),
      branchCurrents: new Map(),
      elementStates: new Map(),
    };

    // 检查电路是否完整
    if (elements.length === 0) {
      analysis.message = '电路为空';
      return analysis;
    }

    // 查找电源
    const batteries = elements.filter(el => el.type === 'battery') as BatteryElement[];
    if (batteries.length === 0) {
      analysis.message = '电路中没有电源';
      return analysis;
    }

    // 检查是否有闭合回路
    const hasClosedLoop = this.checkClosedLoop(connections, elements);
    if (!hasClosedLoop) {
      analysis.message = '电路未形成闭合回路';
      return analysis;
    }

    // 检查开关状态
    const switches = elements.filter(el => el.type === 'switch') as SwitchElement[];
    const allSwitchesClosed = switches.every(sw => sw.isClosed);
    if (switches.length > 0 && !allSwitchesClosed) {
      analysis.message = '开关未全部闭合';
      return analysis;
    }

    // 计算总电压（假设所有电池串联）
    const totalVoltage = batteries.reduce((sum, battery) => sum + battery.voltage, 0);

    // 计算总电阻
    const totalResistance = this.calculateTotalResistance(elements, connections);

    // 计算总电流（欧姆定律：I = V / R）
    const totalCurrent = totalVoltage / totalResistance;

    // 计算各元件状态
    elements.forEach(element => {
      let voltage = 0;
      let current = 0;
      let power = 0;

      switch (element.type) {
        case 'battery':
          voltage = (element as BatteryElement).voltage;
          current = totalCurrent;
          power = voltage * current;
          break;

        case 'bulb':
        case 'resistor':
          // 简化：假设串联电路中所有元件电流相同
          current = totalCurrent;
          voltage = current * (element.resistance || 0);
          power = current * voltage;
          break;

        case 'switch':
          current = totalCurrent;
          voltage = 0; // 理想开关电压降为0
          power = 0;
          break;

        case 'wire':
          // 导线电阻很小，电压降忽略不计
          current = totalCurrent;
          voltage = 0;
          power = 0;
          break;
      }

      analysis.elementStates.set(element.id, { voltage, current, power });
    });

    // 设置灯泡亮度
    elements.forEach(element => {
      if (element.type === 'bulb') {
        const bulb = element as BulbElement;
        const state = analysis.elementStates.get(element.id);
        if (state && state.current > 0) {
          // 亮度与电流成正比，限制在0-1之间
          bulb.brightness = Math.min(state.current / 0.5, 1);
          bulb.isOn = true;
        } else {
          bulb.brightness = 0;
          bulb.isOn = false;
        }
      }
    });

    analysis.isValid = true;
    analysis.message = '电路分析完成';
    return analysis;
  }

  /**
   * 计算总电阻
   */
  private static calculateTotalResistance(elements: CircuitElement[], connections: CircuitConnection[]): number {
    // 简化：只计算串联电阻
    let totalResistance = 0;

    elements.forEach(element => {
      if (element.resistance !== undefined) {
        totalResistance += element.resistance;
      }
    });

    // 最小电阻防止除零错误
    return Math.max(totalResistance, 0.1);
  }

  /**
   * 检查电路是否形成闭合回路
   */
  private static checkClosedLoop(connections: CircuitConnection[], elements: CircuitElement[]): boolean {
    if (connections.length < 2) {
      return false;
    }

    // 构建连接图
    const adjacencyList = new Map<string, string[]>();

    // 初始化邻接表
    elements.forEach(element => {
      adjacencyList.set(element.id, []);
    });

    // 添加连接
    connections.forEach(connection => {
      adjacencyList.get(connection.fromElementId)?.push(connection.toElementId);
      adjacencyList.get(connection.toElementId)?.push(connection.fromElementId);
    });

    // 检查是否有电池
    const batteryIds = elements.filter(el => el.type === 'battery').map(el => el.id);
    if (batteryIds.length === 0) {
      return false;
    }

    // 从电池开始深度优先搜索，检查是否能回到电池
    const visited = new Set<string>();
    const stack: string[] = [batteryIds[0]];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }

    // 检查是否所有元件都连通
    return visited.size === elements.length;
  }

  /**
   * 验证电路连接是否有效
   */
  static validateConnection(
    fromElement: CircuitElement,
    toElement: CircuitElement,
    existingConnections: CircuitConnection[]
  ): { isValid: boolean; message: string } {
    // 不能连接自己
    if (fromElement.id === toElement.id) {
      return { isValid: false, message: '不能连接元件到自身' };
    }

    // 检查是否已经连接
    const alreadyConnected = existingConnections.some(
      conn =>
        (conn.fromElementId === fromElement.id && conn.toElementId === toElement.id) ||
        (conn.fromElementId === toElement.id && conn.toElementId === fromElement.id)
    );

    if (alreadyConnected) {
      return { isValid: false, message: '这两个元件已经连接' };
    }

    // 特殊规则：电池只能连接一个负载
    if (fromElement.type === 'battery' || toElement.type === 'battery') {
      const battery = fromElement.type === 'battery' ? fromElement : toElement;
      const batteryConnections = existingConnections.filter(
        conn => conn.fromElementId === battery.id || conn.toElementId === battery.id
      );

      if (batteryConnections.length >= 2) {
        return { isValid: false, message: '电池最多只能连接两个元件（正负极各一个）' };
      }
    }

    return { isValid: true, message: '连接有效' };
  }

  /**
   * 计算元件功率
   */
  static calculatePower(voltage: number, current: number): number {
    return voltage * current;
  }

  /**
   * 计算元件功耗
   */
  static calculatePowerConsumption(elements: CircuitElement[], analysis: CircuitAnalysis): number {
    let totalPower = 0;

    elements.forEach(element => {
      const state = analysis.elementStates.get(element.id);
      if (state) {
        totalPower += state.power;
      }
    });

    return totalPower;
  }

  /**
   * 检查电路安全性
   */
  static checkSafety(elements: CircuitElement[], analysis: CircuitAnalysis): { isSafe: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // 检查电流是否过大
    const totalCurrent = Array.from(analysis.elementStates.values())
      .reduce((sum, state) => sum + state.current, 0);

    if (totalCurrent > 2) { // 2A作为安全阈值
      warnings.push('电流过大！请检查电路连接。');
    }

    // 检查功率是否过大
    const totalPower = this.calculatePowerConsumption(elements, analysis);
    if (totalPower > 5) { // 5W作为安全阈值
      warnings.push('功率过大！可能损坏元件。');
    }

    // 检查电池电压
    const batteries = elements.filter(el => el.type === 'battery') as BatteryElement[];
    const totalVoltage = batteries.reduce((sum, battery) => sum + battery.voltage, 0);
    if (totalVoltage > 9) { // 9V作为安全阈值
      warnings.push('电压过高！请减少电池数量。');
    }

    return {
      isSafe: warnings.length === 0,
      warnings,
    };
  }

  /**
   * 更新元件状态
   */
  static updateElementStates(
    elements: CircuitElement[],
    analysis: CircuitAnalysis
  ): CircuitElement[] {
    return elements.map(element => {
      const state = analysis.elementStates.get(element.id);
      if (!state) {
        return element;
      }

      const updatedElement = { ...element };

      // 更新电学属性
      updatedElement.current = state.current;
      updatedElement.voltage = state.voltage;
      updatedElement.power = state.power;

      // 更新特定类型元件的状态
      switch (element.type) {
        case 'bulb':
          (updatedElement as BulbElement).isOn = state.current > 0;
          (updatedElement as BulbElement).brightness = Math.min(state.current / 0.5, 1);
          break;

        case 'switch':
          (updatedElement as SwitchElement).isClosed = true; // 假设分析时开关已闭合
          break;
      }

      updatedElement.updatedAt = Date.now();
      return updatedElement;
    });
  }
}