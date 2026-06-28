import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOB_STORAGE_KEY = 'integra_expiry_jobs_v1';
const THRESHOLDS = [60, 30, 15, 7, 1];
const OVERDUE_REPEATS = [7, 14, 30];

export async function scheduleExpiryReminders(docId, label, docType, expiryDate) {
  if (!expiryDate) return;

  const expiryMs = new Date(expiryDate).getTime();
  const jobs = await getJobs();

  THRESHOLDS.forEach(days => {
    const dueMs = expiryMs - days * 86400000;
    const identifier = `${docId}_before_${days}`;
    jobs[identifier] = {
      docId,
      label,
      docType,
      expiryDate,
      type: 'expiry_before',
      days,
      dueMs,
    };
  });

  OVERDUE_REPEATS.forEach(days => {
    const dueMs = expiryMs + days * 86400000;
    const identifier = `${docId}_overdue_${days}`;
    jobs[identifier] = {
      docId,
      label,
      docType,
      expiryDate,
      type: 'overdue',
      days,
      dueMs,
    };
  });

  await saveJobs(jobs);
}

export async function cancelExpiryReminders(docId) {
  const jobs = await getJobs();
  Object.keys(jobs).forEach(id => {
    if (id.startsWith(`${docId}_`)) {
      delete jobs[id];
    }
  });
  await saveJobs(jobs);
}

export async function checkDueNotifications() {
  const jobs = await getJobs();
  const now = Date.now();
  const due = [];

  Object.entries(jobs).forEach(([id, job]) => {
    if (job.dueMs <= now) {
      due.push(job);

      const message =
        job.type === 'expiry_before'
          ? `${job.label} expires in ${job.days} day${job.days > 1 ? 's' : ''}`
          : `${job.label} is overdue for renewal`;

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Document Expiry Reminder',
          body: message,
          data: { docId: job.docId, docType: job.docType },
        },
        trigger: null,
      });

      delete jobs[id];
    }
  });

  await saveJobs(jobs);
  return due;
}

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function getJobs() {
  try {
    const stored = await AsyncStorage.getItem(JOB_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('Failed to parse scheduled jobs', err);
    return {};
  }
}

async function saveJobs(jobs) {
  try {
    await AsyncStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs', err);
  }
}