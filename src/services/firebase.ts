import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export interface FeedbackData {
  userName: string;
  studentId: string;
  category: 'Suggestion' | 'Complaint' | 'Bug';
  message: string;
  timestamp: any;
  deviceInfo: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const sendFeedback = async (data: Omit<FeedbackData, 'timestamp' | 'deviceInfo'>) => {
  const path = 'feedback';
  try {
    const feedbackRef = collection(db, path);
    await addDoc(feedbackRef, {
      ...data,
      timestamp: serverTimestamp(),
      deviceInfo: navigator.userAgent
    });
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
