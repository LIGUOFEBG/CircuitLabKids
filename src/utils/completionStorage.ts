import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'circuitlabkids_completed';

export async function getCompletedExperiments(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function markExperimentCompleted(experimentId: string): Promise<void> {
  try {
    const completed = await getCompletedExperiments();
    if (!completed.includes(experimentId)) {
      completed.push(experimentId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  } catch {
    // ignore storage errors
  }
}
