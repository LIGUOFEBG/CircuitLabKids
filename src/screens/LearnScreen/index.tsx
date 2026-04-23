import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../App';

const { width } = Dimensions.get('window');
const isTablet = width >= 600;

type LearnScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Learn'>;
type LearnScreenRouteProp = RouteProp<RootStackParamList, 'Learn'>;

interface LearnScreenProps {
  navigation: LearnScreenNavigationProp;
  route: LearnScreenRouteProp;
}

interface Lesson {
  id: string;
  title: string;
  content: string[];
  icon: string;
  color: string;
}

const LearnScreen: React.FC<LearnScreenProps> = ({ navigation, route }) => {
  const { topic } = route.params || {};
  const [expandedLesson, setExpandedLesson] = useState<string | null>(topic || null);

  // 课程数据
  const lessons: Lesson[] = [
    {
      id: 'what-is-electricity',
      title: '什么是电？',
      content: [
        '⚡ 电是能量的一种形式，由带电粒子（如电子）的运动产生。',
        '🔋 电池是储存电能的装置，有正极（+）和负极（-）。',
        '💡 当电子在电路中流动时，就可以点亮灯泡、驱动电机等。',
        '🌩️ 闪电是自然界中的电现象，非常强大但危险。',
      ],
      icon: '⚡',
      color: '#FFD166',
    },
    {
      id: 'circuit-basics',
      title: '电路基础',
      content: [
        '🔌 电路是电流流通的闭合路径，必须有电源、负载和导线。',
        '💡 简单的电路包括：电池（电源）、灯泡（负载）、导线（连接）。',
        '⚙️ 开关可以控制电路的通断，就像水龙头控制水流一样。',
        '🔄 电路必须形成闭合回路，电流才能流通。',
      ],
      icon: '🔧',
      color: '#06D6A0',
    },
    {
      id: 'series-vs-parallel',
      title: '串联 vs 并联',
      content: [
        '🔗 串联电路：元件依次连接，电流只有一条路径。',
        '💡 串联特点：一个灯泡坏了，所有灯泡都会熄灭。',
        '🔀 并联电路：元件并列连接，电流有多条路径。',
        '💡 并联特点：一个灯泡坏了，其他灯泡仍然亮着。',
        '🏠 家庭电路通常使用并联连接。',
      ],
      icon: '🔀',
      color: '#118AB2',
    },
    {
      id: 'safety-first',
      title: '安全第一',
      content: [
        '⚠️ 永远不要用湿手触摸电器或插座。',
        '🔌 不要将金属物品插入插座。',
        '👨‍👩‍👧 真实电路实验一定要在大人指导下进行。',
        '🔥 如果发现电线破损或冒烟，立即告诉大人。',
        '📞 记住紧急电话：119（火警）120（急救）。',
      ],
      icon: '⚠️',
      color: '#EF476F',
    },
    {
      id: 'conductors-insulators',
      title: '导体和绝缘体',
      content: [
        '🔌 导体：容易让电流通过的材料，如铜、铝、铁。',
        '🛡️ 绝缘体：不容易让电流通过的材料，如橡胶、塑料、木头。',
        '🔋 电线里面是金属（导体），外面包着塑料（绝缘体）。',
        '👕 干燥的木头是绝缘体，但湿木头可能变成导体。',
      ],
      icon: '🔋',
      color: '#7209B7',
    },
    {
      id: 'famous-scientists',
      title: '电学科学家',
      content: [
        '🧪 本杰明·富兰克林：用风筝实验证明闪电是电。',
        '🔋 亚历山德罗·伏打：发明了第一个电池（伏打电池）。',
        '💡 托马斯·爱迪生：改进了电灯泡，让电力普及。',
        '⚡ 尼古拉·特斯拉：发明了交流电系统。',
      ],
      icon: '👨‍🔬',
      color: '#3A86FF',
    },
  ];

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  const openExternalLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('打开链接失败:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>知识学堂</Text>
          <Text style={styles.subtitle}>学习电学知识，安全探索电路世界</Text>
        </View>

        {/* 课程列表 */}
        <View style={styles.lessonsContainer}>
          {lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                expandedLesson === lesson.id && styles.lessonCardExpanded,
                { borderLeftColor: lesson.color },
              ]}
              onPress={() => toggleLesson(lesson.id)}
              activeOpacity={0.8}
            >
              <View style={styles.lessonHeader}>
                <View style={[styles.lessonIconContainer, { backgroundColor: lesson.color }]}>
                  <Text style={styles.lessonIcon}>{lesson.icon}</Text>
                </View>
                <View style={styles.lessonHeaderContent}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonHint}>
                    {expandedLesson === lesson.id ? '点击收起' : '点击展开'}
                  </Text>
                </View>
              </View>

              {expandedLesson === lesson.id && (
                <View style={styles.lessonContent}>
                  {lesson.content.map((paragraph, index) => (
                    <Text key={index} style={styles.lessonParagraph}>
                      {paragraph}
                    </Text>
                  ))}

                  {/* 学习活动建议 */}
                  {lesson.id === 'circuit-basics' && (
                    <View style={styles.activityBox}>
                      <Text style={styles.activityTitle}>动手试试：</Text>
                      <Text style={styles.activityText}>
                        在实验台尝试搭建一个简单电路，看看需要哪些元件。
                      </Text>
                      <TouchableOpacity
                        style={styles.tryButton}
                        onPress={() => navigation.navigate('Experiment', { experimentId: 'simple-circuit' })}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.tryButtonText}>去实验</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {lesson.id === 'series-vs-parallel' && (
                    <View style={styles.activityBox}>
                      <Text style={styles.activityTitle}>对比实验：</Text>
                      <Text style={styles.activityText}>
                        分别搭建串联和并联电路，观察灯泡亮度的区别。
                      </Text>
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={[styles.tryButton, styles.seriesButton]}
                          onPress={() => navigation.navigate('Experiment', { experimentId: 'series-circuit' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.tryButtonText}>串联实验</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.tryButton, styles.parallelButton]}
                          onPress={() => navigation.navigate('Experiment', { experimentId: 'parallel-circuit' })}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.tryButtonText}>并联实验</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 外部资源 */}
        <View style={styles.resourcesSection}>
          <Text style={styles.resourcesTitle}>更多学习资源</Text>
          <View style={styles.resourceCards}>
            <TouchableOpacity
              style={styles.resourceCard}
              onPress={() => openExternalLink('https://baike.baidu.com/item/%E7%94%B5%E8%B7%AF')}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceIcon}>📚</Text>
              <Text style={styles.resourceName}>电路百科</Text>
              <Text style={styles.resourceDesc}>了解更多电路知识</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceCard}
              onPress={() => openExternalLink('https://www.nobook.com/')}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceIcon}>🔬</Text>
              <Text style={styles.resourceName}>NOBOOK</Text>
              <Text style={styles.resourceDesc}>更多虚拟实验</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resourceCard}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceIcon}>🏠</Text>
              <Text style={styles.resourceName}>返回主页</Text>
              <Text style={styles.resourceDesc}>开始新的实验</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 学习小贴士 */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>学习小贴士</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>✅ 每天学习一个小知识点</Text>
            <Text style={styles.tip}>✅ 学完知识后立即动手实验</Text>
            <Text style={styles.tip}>✅ 和爸爸妈妈分享你的发现</Text>
            <Text style={styles.tip}>✅ 记录实验中的有趣现象</Text>
          </View>
        </View>
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
  lessonsContainer: {
    marginBottom: 30,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonCardExpanded: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIconContainer: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lessonIcon: {
    fontSize: isTablet ? 28 : 24,
  },
  lessonHeaderContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  lessonHint: {
    fontSize: isTablet ? 14 : 12,
    color: '#95A5A6',
  },
  lessonContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  lessonParagraph: {
    fontSize: isTablet ? 16 : 14,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 12,
  },
  activityBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: isTablet ? 20 : 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  activityTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  activityText: {
    fontSize: isTablet ? 14 : 13,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  tryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 24 : 20,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  tryButtonText: {
    fontSize: isTablet ? 14 : 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  seriesButton: {
    backgroundColor: '#06D6A0',
  },
  parallelButton: {
    backgroundColor: '#118AB2',
  },
  resourcesSection: {
    marginBottom: 30,
  },
  resourcesTitle: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  resourceCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceCard: {
    width: isTablet ? '32%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isTablet ? 20 : 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  resourceName: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  resourceDesc: {
    fontSize: isTablet ? 14 : 12,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 16,
  },
  tipsSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: isTablet ? 24 : 20,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  tipsTitle: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsList: {
    alignItems: 'flex-start',
  },
  tip: {
    fontSize: isTablet ? 16 : 14,
    color: '#1565C0',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default LearnScreen;