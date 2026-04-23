# CircuitLabKids - 儿童电路实验室项目

## 项目概述
这是一个类似NOBOOK的儿童电路模拟应用，旨在为儿童提供安全、有趣的电路学习体验。应用运行在React Native上，支持Android平板。

## 项目状态
**当前日期**: 2026-04-15  
**项目阶段**: UI交互完善阶段

### 已完成的工作
1. ✅ **项目初始化** - React Native项目搭建，导航结构
2. ✅ **核心屏幕组件** - HomeScreen、ExperimentScreen、LearnScreen
3. ✅ **电路模拟核心代码**:
   - `CircuitSimulator` - 完整的电路状态管理
   - `CircuitCalculator` - 电路分析算法
   - 完整的类型定义(`CircuitElement`, `CircuitConnection`等)
4. ✅ **响应式布局** - 适配Android平板的设计
5. ✅ **CircuitContext集成** (2026-04-14完成)
6. ✅ **CircuitCanvas + CircuitElement组件** (2026-04-14完成) - 拖拽交互
7. ✅ **连接点可视化** (2026-04-14完成) - 正极红/负极蓝/端子绿
8. ✅ **ConnectionLine组件** (2026-04-15完成) - 纯RN View旋转实现连线
9. ✅ **连接交互** (2026-04-15完成) - 连接模式，点击两个元件自动连接

### 当前任务
创建独立ElementPalette组件，并实现元件删除功能。

### 下一步开发计划 (按优先级排序)
1. ✅ **创建CircuitCanvas组件**（已完成）
2. ✅ **实现拖放功能**（已完成）
3. ✅ **创建CircuitElement组件**（已完成）
4. ✅ **连接点可视化**（已完成）
5. ✅ **实现连接线绘制**（已完成）
6. ✅ **实现连接交互**（已完成）
7. ✅ **创建CircuitStatusPanel**（已完成）- 实时显示电压/电流/电阻/功率
8. ✅ **实现删除元件功能**（已完成）- 长按弹出详情/删除菜单
9. ✅ **创建ElementPalette**（已完成）
10. ✅ **实现开关点击切换**（已完成）- 点击开关切换状态，灯泡通电变亮黄
11. **丰富LearnScreen** - 基础电路知识卡片

## 技术栈
- **框架**: React Native 0.85.0, React 19.2.3
- **导航**: @react-navigation/native 7.2.2, @react-navigation/stack 7.8.10
- **手势**: react-native-gesture-handler 2.31.1
- **安全区域**: react-native-safe-area-context 5.7.0
- **屏幕**: react-native-screens 4.24.0
- **语言**: TypeScript 5.8.3

## 项目结构
```
CircuitLabKids/
├── src/
│   ├── screens/                 # 屏幕组件
│   │   ├── HomeScreen/         # 主页
│   │   ├── ExperimentScreen/   # 实验台 (当前主要开发)
│   │   └── LearnScreen/        # 知识学堂
│   ├── core/circuit/           # 电路模拟核心
│   │   ├── calculator/         # 电路计算器
│   │   ├── context/            # 电路状态管理 (新增)
│   │   ├── models/             # 类型定义
│   │   └── simulator/          # 电路模拟器
│   └── components/             # 通用组件
│       └── circuit/           # 电路相关组件 (新增)
│           ├── CircuitCanvas/ # 电路画布组件
│           └── CircuitElement/# 电路元件组件
├── App.tsx                     # 应用入口
└── package.json
```

## 核心文件说明
### 电路模拟核心
- `src/core/circuit/simulator/circuitSimulator.ts` - 电路模拟器主类
- `src/core/circuit/calculator/circuitCalculator.ts` - 电路计算算法
- `src/core/circuit/models/types.ts` - 所有类型定义
- `src/core/circuit/context/CircuitContext.tsx` - 状态管理上下文

### 主要屏幕
- `src/screens/ExperimentScreen/index.tsx` - 实验台 (当前集成重点)
- `src/screens/HomeScreen/index.tsx` - 主页
- `src/screens/LearnScreen/index.tsx` - 学习页面

### 电路组件
- `src/components/circuit/CircuitCanvas/index.tsx` - 电路画布，处理触摸和渲染
- `src/components/circuit/CircuitElement/index.tsx` - 电路元件，支持拖拽交互

### 应用配置
- `App.tsx` - 应用入口，已集成`CircuitProvider`
- `package.json` - 依赖配置

## 电路元件类型
支持5种电路元件:
1. **电池 (battery)** - 电压源
2. **灯泡 (bulb)** - 电阻性负载，可显示亮度
3. **导线 (wire)** - 连接元件
4. **开关 (switch)** - 控制电路通断
5. **电阻 (resistor)** - 电阻性元件

## 开发约定
1. **组件命名**: 使用PascalCase，如`CircuitCanvas`
2. **文件组织**: 相关文件放在同一目录，如`src/components/circuit/`
3. **状态管理**: 使用`CircuitContext`访问电路状态
4. **类型安全**: 使用TypeScript严格类型检查
5. **儿童友好**: UI设计简单直观，操作反馈明确

## 近期开发记录
- **2026-04-13**: 完成电路模拟核心代码和基础UI框架
- **2026-04-14**: 完成CircuitContext集成，实现状态管理架构；CircuitCanvas+CircuitElement拖拽；连接点可视化
- **2026-04-15**: ConnectionLine连线绘制；连接模式交互；CircuitStatusPanel；删除元件；ElementPalette独立组件；开关切换+灯泡亮灭效果

## 下次开发优先事项
1. **先做：真机调试** - 安装 Android Studio（SDK 36 + NDK 27.1.12297006），创建 `android/local.properties`，运行 `npx react-native run-android`
2. 丰富 LearnScreen 知识卡片内容
3. 断开连接功能（长按连接线）
4. 预设实验步骤引导

## 测试计划
1. **功能测试**: 元件添加、移动、连接、断开
2. **电路模拟测试**: 简单电路正常工作，参数计算准确
3. **性能测试**: 复杂电路下的交互流畅度
4. **用户体验测试**: 儿童操作友好性

## 注意事项
1. **安全第一**: 应用中包含安全提示，强调真实实验需要成人监督
2. **渐进式开发**: 每次只实现一个小功能，确保稳定后再继续
3. **代码审查**: 定期检查类型安全和代码质量

## 如何快速恢复开发
1. 阅读本文件了解项目状态
2. 检查`claude_history.txt`了解最近对话
3. 运行`npx tsc --noEmit`验证类型安全
4. 从"下一步开发计划"中选择一个任务开始