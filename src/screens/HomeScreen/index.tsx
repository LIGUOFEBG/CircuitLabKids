import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  // 实验卡片数据
  const experiments = [
    {
      id: 'simple-circuit',
      title: '简单电路',
      description: '电池、灯泡和开关的基本连接',
      icon: '🔋',
      color: '#FF6B6B',
    },
    {
      id: 'series-circuit',
      title: '串联电路',
      description: '多个灯泡串联连接',
      icon: '💡',
      color: '#4ECDC4',
    },
    {
      id: 'parallel-circuit',
      title: '并联电路',
      description: '多个灯泡并联连接',
      icon: '⚡',
      color: '#FFD166',
    },
    {
      id: 'switch-circuit',
      title: '开关控制',
      description: '使用开关控制电路通断',
      icon: '🔌',
      color: '#06D6A0',
    },
  ];

  // 学习主题数据
  const learnTopics = [
    {
      id: 'what-is-electricity',
      title: '什么是电？',
      description: '了解电的基本概念',
      icon: '❓',
    },
    {
      id: 'circuit-basics',
      title: '电路基础',
      description: '学习电路的基本组成',
      icon: '🔧',
    },
    {
      id: 'safety-first',
      title: '安全第一',
      description: '实验安全注意事项',
      icon: '⚠️',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 欢迎标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>欢迎来到电路实验室！</Text>
          <Text style={styles.subtitle}>
            在这里，你可以安全地进行各种电路实验，学习电学知识
          </Text>
        </View>

        {/* 快速开始实验 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>快速开始实验</Text>
          <View style={styles.experimentGrid}>
            {experiments.map((exp) => (
              <TouchableOpacity
                key={exp.id}
                style={[styles.experimentCard, { backgroundColor: exp.color }]}
                onPress={() => navigation.navigate('Experiment', { experimentId: exp.id })}
                activeOpacity={0.7}
              >
                <Text style={styles.experimentIcon}>{exp.icon}</Text>
                <Text style={styles.experimentTitle}>{exp.title}</Text>
                <Text style={styles.experimentDescription}>{exp.description}</Text>
              </TouchableOpacity>
            ))}
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
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: isTablet ? 24 : 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  experimentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
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
  },
  experimentIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
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
  learnIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  learnContent: {
    flex: 1,
  },
  learnTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  learnDescription: {
    fontSize: isTablet ? 14 : 12,
    color: '#7F8C8D',
  },
  safetySection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  safetyTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  safetyText: {
    fontSize: isTablet ? 14 : 12,
    color: '#856404',
    lineHeight: 18,
  },
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
  startButtonText: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;