// Base configuration
const API_CONFIG = {
  BASE_URL: 'https://script.google.com/macros/s/AKfycbzbxN8r4jxdvosULs1z6iA_36jvI72pXbQZJ0iksXY1bZY9eufJdZEDcNHwR5Tt5vPA-Q/exec', // Replace with your published Google Apps Script WebApp URL
  API_KEY: '12345', // Must match CONFIG.API_KEY in Google Script
  TIMEOUT: 10000,
};

// Types
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'student' | 'coach' | 'admin';
  age?: number;
  batch?: string;
  batchId?: string;
  specialization?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar: string;
  skillLevel?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  fitnessLevel?: string;
  stats?: any;
  experience?: string;
  rating?: number;
  studentsCount?: number;
  permissions?: string[];
  assignedCoachId?: string;
  isFirstLogin?: boolean;
}

export interface Batch { id: string; name: string; [key: string]: any }
export interface Content { id: string; title: string; [key: string]: any }
export interface Session { id: string; title: string; [key: string]: any }
export interface Notification { id: string; userId: string; [key: string]: any }
export interface AttendanceRecord { id: string; userId: string; [key: string]: any }
export interface YoyoTestResult { id: string; studentId: string; [key: string]: any }

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  timestamp: string;
}

// Generic request handler
const apiRequest = async <T>(
  method: 'GET' | 'POST',
  action: string,
  body?: any
): Promise<ApiResponse<T>> => {
  try {
    let url = `${API_CONFIG.BASE_URL}?action=${encodeURIComponent(action)}`;

    let options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === 'POST') {
      // Always inject apiKey into body
      options.body = JSON.stringify({ action, apiKey: API_CONFIG.API_KEY, ...body });
    } else {
      // For GET, append apiKey and other params to query string
      const params = new URLSearchParams({
        'apiKey': API_CONFIG.API_KEY,
        ...body,
      });
      url += `&${params.toString()}`;
    }
    console.log("url === "+ url);
    console.log("options === "+JSON.stringify(options));
    const res = await fetch(url, options);
    const json = await res.json();

    if (!res.ok) throw new Error(json.error || 'API Error');

    return { success: true, data: json, timestamp: new Date().toISOString() };
  } catch (err: any) {
    return {
      success: false,
      data: null,
      message: err.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// ================== AUTH ==================
export const loginUser = (phone: string, password: string) =>
  apiRequest<User>('POST', 'login', { phone, password });

export const changePassword = (userId: string, oldPassword: string, newPassword: string) =>
  apiRequest<boolean>('POST', 'changePassword', { userId, oldPassword, newPassword });

// ================== USERS ==================
export const getUsers = () => apiRequest<User[]>('GET', 'listUsers');
export const getUserById = (id: string) => apiRequest<User>('GET', 'getUser', { id });
export const createUser = (userData: Omit<User, 'id'>) => apiRequest<User>('POST', 'createUser', userData);
export const updateUser = (id: string, userData: Partial<User>) => apiRequest<User>('POST', 'updateUser', { id, ...userData });
export const deleteUser = (id: string) => apiRequest<boolean>('POST', 'deleteUser', { id });

export const getCoaches = () => apiRequest<User[]>('GET', 'getCoaches');



// ================== BATCHES ==================
export const getBatches = () => apiRequest<Batch[]>('GET', 'listBatches');
export const createBatch = (batchData: Omit<Batch, 'id'>) => apiRequest<Batch>('POST', 'createBatch', batchData);
export const deleteBatch = (id: string) => apiRequest<boolean>('POST', 'deleteBatch', { id });

// ================== CONTENT ==================
export const getContent = () => apiRequest<Content[]>('GET', 'listContent');
export const createContent = (data: Omit<Content, 'id'>) => apiRequest<Content>('POST', 'createContent', data);
export const updateContent = (id: string, data: Partial<Content>) => apiRequest<Content>('POST', 'updateContent', { id, ...data });
export const deleteContent = (id: string) => apiRequest<boolean>('POST', 'deleteContent', { id });

// ================== SESSIONS ==================
export const getSessions = (date?: string) =>
  apiRequest<Session[]>('GET', 'listSessions', date ? { date } : {});

export const createSession = (data: Omit<Session, 'id'>) => apiRequest<Session>('POST', 'createSession', data);

export const getTodaysSessions = async (): Promise<ApiResponse<Session[]>> => {
  const today = new Date().toISOString().split('T')[0];
  // ✅ directly call apiRequest with the date
  return apiRequest<Session[]>('GET', 'listSessions', { date: today });
};

// ✅ Mark check-in
export const checkInSession = async (
  userId: string,
  sessionId: string
): Promise<ApiResponse<AttendanceRecord>> => {
  return apiRequest<AttendanceRecord>('POST', 'createAttendanceRecord', {
    userId,
    sessionId,
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
    markedBy: userId,
  });
};

// ✅ Mark check-out
export const checkOutSession = async (
  id: string
): Promise<ApiResponse<AttendanceRecord>> => {
  return apiRequest<AttendanceRecord>('POST', 'updateAttendanceRecord', {
    id,
    checkOutTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
  });
};

// ================== NOTIFICATIONS ==================
export const getNotifications = (userId: string) => apiRequest<Notification[]>('GET', 'listNotifications', { userId });
export const markNotificationAsRead = (id: string) => apiRequest<boolean>('POST', 'markNotificationAsRead', { id });
export const createNotification = (data: Omit<Notification, 'id'>) => apiRequest<Notification>('POST', 'createNotification', data);

// ================== ATTENDANCE ==================
export const getAttendance = (userId: string) => apiRequest<AttendanceRecord[]>('GET', 'listAttendanceRecords', { userId });
export const markAttendance = (studentId: string, sessionId: string, status: 'present' | 'absent', markedBy: string) =>
  apiRequest<AttendanceRecord>('POST', 'markAttendance', { studentId, sessionId, status, markedBy });

// ================== YOYO TEST ==================
export const getYoyoTests = (studentId?: string) => apiRequest<YoyoTestResult[]>('GET', 'listYoyoTestResults', studentId ? { studentId } : {});
export const createYoyoTest = (testData: Omit<YoyoTestResult, 'id'>) => apiRequest<YoyoTestResult>('POST', 'createYoyoTestResult', testData);

// ================== EXTRA (Stats / Analytics) ==================
export const getStudentStats = (userId: string) => apiRequest<any>('GET', 'getStudentStats', { userId });
export const getCoachStats = (userId: string) => apiRequest<any>('GET', 'getCoachStats', { userId });
export const getAnalyticsOverview = () => apiRequest<any>('GET', 'getAnalyticsOverview');

// ================== SETTINGS ==================
export const getAcademySettings = () => apiRequest<any>('GET', 'getSettings');
export const updateAcademySettings = (settings: any) => apiRequest<any>('POST', 'updateSettings', settings);


export const sendBulkNotifications = async (
  title: string,
  message: string,
  userIds: string[],
  type: 'feedback' | 'session' | 'achievement' | 'announcement' = 'announcement'
): Promise<ApiResponse<boolean>> => {
  try {
    // fire one request per userId
    await Promise.all(
      userIds.map(userId =>
        createNotification({
          userId,
          title,
          message,
          type,
          timestamp: new Date().toISOString(),
          isRead: false,
        } as any) // casting since Notification type may require `id` (created on backend)
      )
    );

    return {
      success: true,
      data: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      data: false,
      message: err.message,
      timestamp: new Date().toISOString(),
    };
  }
};
