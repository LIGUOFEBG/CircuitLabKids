import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CircuitElementType } from '../../../core/circuit/models/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

interface ElementEntry {
  type: CircuitElementType;
  label: string;
  icon: string;
  color: string;
}

const ELEMENTS: ElementEntry[] = [
  { type: 'battery',  label: '电池', icon: '🔋', color: '#FFEAA7' },
  { type: 'bulb',     label: '灯泡', icon: '💡', color: '#FFD3B6' },
  { type: 'wire',     label: '导线', icon: '🔌', color: '#E8E8E8' },
  { type: 'switch',   label: '开关', icon: '⚡', color: '#A8E6CF' },
  { type: 'resistor', label: '电阻', icon: '📉', color: '#E6A8D7' },
];

interface ElementPaletteProps {
  /** 点击元件时的添加回调 */
  onElementAdd: (type: CircuitElementType) => void;
  /** 本次实验需要的元件类型（高亮显示） */
  requiredTypes?: CircuitElementType[];
}

/**
 * 元件库面板 - 展示可用电路元件，点击即可添加到画布
 *
 * 如果传入 requiredTypes，对应元件会显示"必需"徽章
 */
const ElementPalette: React.FC<ElementPaletteProps> = ({
  onElementAdd,
  requiredTypes = [],
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>元件库</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {ELEMENTS.map((el) => {
          const isRequired = requiredTypes.includes(el.type);
          return (
            <TouchableOpacity
              key={el.type}
              style={[styles.item, { backgroundColor: el.color }, isRequired && styles.itemRequired]}
              onPress={() => onElementAdd(el.type)}
              activeOpacity={0.7}
            >
              {isRequired && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>必需</Text>
                </View>
              )}
              <Text style={styles.icon}>{el.icon}</Text>
              <Text style={styles.label}>{el.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 20 : 16,
  },
  title: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: isTablet ? 16 : 12,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: isTablet ? 18 : 14,
    marginRight: 12,
    minWidth: isTablet ? 100 : 86,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  itemRequired: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: isTablet ? 32 : 28,
    marginBottom: 6,
  },
  label: {
    fontSize: isTablet ? 13 : 11,
    fontWeight: '600',
    color: '#2C3E50',
  },
});

export default ElementPalette;
