import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';
import { getCompletedExperiments } from '../../utils/completionStorage';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface Experiment {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
  difficultyColor: string;
}

const experiments: Experiment[] = [
  {
    id: 'simple-circuit',
    title: '简单电路',
    description: '电池、灯泡和开关的基本连接',
    icon: '🔋',
    color: '#FF6B6B',
    difficulty: '入门',
    difficultyColor: '#27AE60',
  },
  {
    id: 'series-circuit',
    title: '串联电路',
    description: '多个灯泡串联连接',
    icon: '💡',
    color: '#4ECDC4',
    difficulty: '进阶',
    difficultyColor: '#E67E22',
  },
  {
    id: 'parallel-circuit',
    title: '并联电路',
    description: '多个灯泡并联连接',
    icon: '⚡',
    color: '#FFD166',
    difficulty: '进阶',
    difficultyColor: '#E67E22',
  },
  {
    id: 'switch-circuit',
    title: '开关控制',
    description: '使用开关控制电路通断',
    icon: '🔌',
    color: '#06D6A0',
    difficulty: '入门',
    difficultyColor: '#27AE60',
  },
];

const learnTopics = [
  { id: 'what-is-electricity', title: '什么是电？', description: '了解电的基本概念', icon: '❓' },
  { id: 'circuit-basics', title: '电路基础', description: '学习电路的基本组成', icon: '🔧' },
  { id: 'safety-first', title: '安全第一', description: '实验安全注意事项', icon: '⚠️' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // 每次回到首页都刷新完成状态
  useFocusEffect(
    React.useCallback(() => {
      getCompletedExperiments().then(setCompletedIds);
    }, [])
  );

  const completedCount = experiments.filter(e => completedIds.includes(e.id)).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 欢迎标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>欢迎来到电路实验室！</Text>
          <Text style={styles.subtitle}>
            在这里，你可以安全地进行各种电路实验，学习电学知识
          </Text>
          {completedCount > 0 && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                已完成 {completedCount}/{experiments.length} 个实验 🎉
              </Text>
            </View>
          )}
        </View>

        {/* 快速开始实验 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速开始实验</Text>
          <View style={styles.experimentGrid}>
            {experiments.map((exp) => {
              const isDone = completedIds.includes(exp.id);
              return (
                <TouchableOpacity
                  key={exp.id}
                  style={[styles.experimentCard, { backgroundColor: exp.color }]}
                  onPress={() => navigation.navigate('Experiment', { experimentId: exp.id })}
                  activeOpacity={0.7}
                >
                  {/* 完成标记 */}
                  {isDone && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓</Text>
                    </View>
                  )}
                  {/* 难度标签 */}
                  <View style={[styles.difficultyBadge, { backgroundColor: exp.difficultyColor }]}>
                    <Text style={styles.difficultyText}>{exp.difficulty}</Text>
                  </View>

                  <Text style={styles.experimentIcon}>{exp.icon}</Text>
                  <Text style={styles.experimentTitle}>{exp.title}</Text>
                  <Text style={styles.experimentDescription}>{exp.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 学习资源 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习资源</Text>
          <View style={styles.learnList}>
            {learnTopics.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.learnCard}
                onPress={() => navigation.navigate('Learn', { topic: topic.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.learnIcon}>{topic.icon}</Text>
                <View style={styles.learnContent}>
                  <Text style={styles.learnTitle}>{topic.title}</Text>
                  <Text style={styles.learnDescription}>{topic.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 安全提示 */}
        <View style={[styles.section, styles.safetySection]}>
          <Text style={styles.safetyTitle}>⚠️ 安全第一</Text>
          <Text style={styles.safetyText}>
            记住：虚拟实验很安全，但真实电路实验一定要在大人指导下进行！
          </Text>
        </View>

        {/* 开始按钮 */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Experiment', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>开始自由实验</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollContent: { padding: isTablet ? 24 : 16, paddingBottom: 40 },
  header: { marginBottom: 30, alignItems: 'center' },
  title: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isTablet ? 18 : 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressBadge: {
    marginTop: 12,
    backgroundColor: '#EAF6EF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#A9DFBF',
  },
  progressText: {
    fontSize: isTablet ? 15 : 13,
    color: '#1E8449',
    fontWeight: '600',
  },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  experimentGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  experimentCard: {
    width: isTablet ? '48%' : '100%',
    borderRadius: 16,
    padding: isTablet ? 24 : 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 16,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  difficultyText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
  experimentIcon: { fontSize: 40, marginBottom: 12, marginTop: 8 },
  experimentTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  experimentDescription: {
    fontSize: isTablet ? 14 : 12,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 16,
  },
  learnList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  learnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  learnIcon: { fontSize: 28, marginRight: 16 },
  learnContent: { flex: 1 },
  learnTitle: { fontSize: isTablet ? 18 : 16, fontWeight: '600', color: '#2C3E50', marginBottom: 4 },
  learnDescription: { fontSize: isTablet ? 14 : 12, color: '#7F8C8D' },
  safetySection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  safetyTitle: { fontSize: isTablet ? 18 : 16, fontWeight: 'bold', color: '#856404', marginBottom: 8 },
  safetyText: { fontSize: isTablet ? 14 : 12, color: '#856404', lineHeight: 18 },
  startButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  startButtonText: { fontSize: isTablet ? 20 : 16, fontWeight: 'bold', color: '#fff' },
});

export default HomeScreen;
