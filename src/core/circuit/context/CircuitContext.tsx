/**
 * 电路模拟上下文
 * 提供CircuitSimulator实例的全局访问和状态管理
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CircuitSimulator } from '../simulator/circuitSimulator';
import { CircuitState, CircuitElementType } from '../models/types';

/**
 * CircuitContext提供的值
 */
export interface CircuitContextValue {
  simulator: CircuitSimulator;
  state: CircuitState;
  addElement: (type: CircuitElementType, x: number, y: number) => void;
  removeElement: (elementId: string) => void;
  updateElementPosition: (elementId: string, x: number, y: number) => void;
  connectElements: (
    fromElementId: string,
    fromPointId: string,
    toElementId: string,
    toPointId: string
  ) => { success: boolean; message: string; connectionId?: string };
  disconnectElements: (connectionId: string) => void;
  toggleSwitch: (switchId: string) => void;
  clearCircuit: () => void;
  resetSimulator: () => void;
}

/**
 * CircuitProvider属性
 */
export interface CircuitProviderProps {
  children: ReactNode;
  initialState?: CircuitState;
}

/**
 * 创建Context
 */
const CircuitContext = createContext<CircuitContextValue | undefined>(undefined);

/**
 * CircuitProvider组件
 */
export const CircuitProvider: React.FC<CircuitProviderProps> = ({
  children,
  initialState,
}) => {
  // 创建CircuitSimulator实例
  const [simulator] = useState(() => new CircuitSimulator(initialState));
  const [state, setState] = useState<CircuitState>(simulator.getState());

  // 监听状态变化
  useEffect(() => {
    const handleStateChange = (newState: CircuitState) => {
      setState({ ...newState });
    };

    simulator.setOnStateChange(handleStateChange);

    // 清理函数
    return () => {
      simulator.setOnStateChange(null);
    };
  }, [simulator]);

  /**
   * 添加电路元件
   */
  const addElement = (type: CircuitElementType, x: number, y: number) => {
    simulator.addElement(type, x, y);
  };

  /**
   * 移除电路元件
   */
  const removeElement = (elementId: string) => {
    simulator.removeElement(elementId);
  };

  /**
   * 更新元件位置
   */
  const updateElementPosition = (elementId: string, x: number, y: number) => {
    simulator.updateElementPosition(elementId, x, y);
  };

  /**
   * 连接两个元件
   */
  const connectElements = (
    fromElementId: string,
    fromPointId: string,
    toElementId: string,
    toPointId: string
  ) => {
    return simulator.connectElements(fromElementId, fromPointId, toElementId, toPointId);
  };

  /**
   * 断开连接
   */
  const disconnectElements = (connectionId: string) => {
    simulator.disconnectElements(connectionId);
  };

  /**
   * 切换开关状态
   */
  const toggleSwitch = (switchId: string) => {
    simulator.toggleSwitch(switchId);
  };

  /**
   * 清空电路
   */
  const clearCircuit = () => {
    simulator.clearCircuit();
  };

  /**
   * 重置模拟器
   */
  const resetSimulator = () => {
    simulator.reset();
  };

  const contextValue: CircuitContextValue = {
    simulator,
    state,
    addElement,
    removeElement,
    updateElementPosition,
    connectElements,
    disconnectElements,
    toggleSwitch,
    clearCircuit,
    resetSimulator,
  };

  return (
    <CircuitContext.Provider value={contextValue}>
      {children}
    </CircuitContext.Provider>
  );
};

/**
 * 使用CircuitContext的自定义钩子
 */
export const useCircuit = (): CircuitContextValue => {
  const context = useContext(CircuitContext);
  if (context === undefined) {
    throw new Error('useCircuit必须在CircuitProvider内部使用');
  }
  return context;
};