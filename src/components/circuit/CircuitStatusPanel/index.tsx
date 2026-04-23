import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CircuitState } from '../../../core/circuit/models/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

interface CircuitStatusPanelProps {
  state: CircuitState;
}

interface StatItemProps {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, unit, color, icon }) => (
  <View style={styles.statItem}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statUnit, { color }]}>{unit}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * 电路状态面板 - 实时显示电路参数
 *
 * 电路连通时显示：电压、电流、电阻、功率
 * 电路断开时显示：未连通提示
 */
const CircuitStatusPanel: React.FC<CircuitStatusPanelProps> = ({ state }) => {
  const { isComplete, totalVoltage, totalCurrent, totalResistance, totalPower } = state;

  if (!isComplete) {
    return (
      <View style={[styles.container, styles.incompleteContainer]}>
        <Text style={styles.incompleteIcon}>⭕</Text>
        <Text style={styles.incompleteText}>电路未连通</Text>
        <Text style={styles.incompleteHint}>连接元件形成完整回路</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.completeContainer]}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusHeaderIcon}>⚡</Text>
        <Text style={styles.statusHeaderText}>电路已连通</Text>
      </View>
      <View style={styles.statsRow}>
        <StatItem
          icon="🔋"
          label="电压"
          value={totalVoltage.toFixed(2)}
          unit="V"
          color="#FF9500"
        />
        <StatItem
          icon="〰️"
          label="电流"
          value={totalCurrent.toFixed(3)}
          unit="A"
          color="#007AFF"
        />
        <StatItem
          icon="🔩"
          label="电阻"
          value={totalResistance.toFixed(1)}
          unit="Ω"
          color="#8E44AD"
        />
        <StatItem
          icon="💥"
          label="功率"
          value={totalPower.toFixed(3)}
          unit="W"
          color="#E74C3C"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: isTablet ? 12 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  incompleteContainer: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    paddingVertical: 10,
  },
  incompleteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  incompleteText: {
    fontSize: isTablet ? 13 : 11,
    fontWeight: '600',
    color: '#95A5A6',
  },
  incompleteHint: {
    fontSize: isTablet ? 11 : 9,
    color: '#BDC3C7',
    marginTop: 2,
  },
  completeContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusHeaderIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusHeaderText: {
    fontSize: isTablet ? 13 : 11,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: isTablet ? 16 : 13,
    marginBottom: 2,
  },
  statValue: {
    fontSize: isTablet ? 15 : 13,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: isTablet ? 10 : 9,
    fontWeight: '600',
    marginTop: 1,
  },
  statLabel: {
    fontSize: isTablet ? 10 : 9,
    color: '#95A5A6',
    marginTop: 2,
  },
});

export default CircuitStatusPanel;
