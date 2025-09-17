import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data import
import mockData from '../api/mockData.json';

// Types
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'student' | 'coach' | 'admin';
  age?: number;
  batch?: string;
  specialization?: string;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar: string;
  skillLevel?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  fitnessLevel?: string;
  stats?: {
    battingAverage?: number;
    sessionsAttended?: number;
    bestBowlingSpeed?: string;
    catchesTaken?: number;
  };
  experience?: string;
  rating?: number;
  studentsCount?: number;
  permissions?: string[];
}

export interface Batch {
  id: string;
  name: string;
  category: 'Batting' | 'Bowling' | 'Fielding' | 'All-round';
  ageGroup: string;
  coach: string;
  coachId: string;
  students: number;
  maxStudents: number;
  schedule: string;
  location: string;
  startDate: string;
  status: 'active' | 'upcoming' | 'completed';
  fees: number;
}

export interface Content {
  id: string;
  title: string;
  type: 'video' | 'drill';
  category: 'Batting' | 'Bowling' | 'Fielding' | 'Fitness';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  thumbnail: string;
  views: number;
  likes: number;
  uploadDate: string;
  status: 'published' | 'draft';
  description: string;
  authorId: string;
  author: string;
}

export interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  batchId: string;
  coachId: string;
  students: number;
  maxStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'feedback' | 'session' | 'achievement' | 'announcement';
  timestamp: string;
  isRead: boolean;
  metadata?: any;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  sessionId: string;
  date: string;
  status: 'present' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  count?: number;
}

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Storage keys
const STORAGE_KEYS = {
  USERS: 'users',
  BATCHES: 'batches',
  CONTENT: 'content',
  SESSIONS: 'sessions',
  NOTIFICATIONS: 'notifications',
  ATTENDANCE: 'attendance',
};

// Initialize mock data in AsyncStorage
export const initializeMockData = async () => {
  try {
    const existingUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (!existingUsers) {
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockData.users));
      await AsyncStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(mockData.batches));
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(mockData.content));
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mockData.sessions));
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(mockData.notifications));
      await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(mockData.attendance));
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
};

// Generic API wrapper
const apiWrapper = async <T>(operation: () => Promise<T>): Promise<ApiResponse<T>> => {
  try {
    await delay(500); // Simulate network delay
    const data = await operation();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      data: null as any,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// User API
export const userApi = {
  // GET /api/users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiWrapper(async () => {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    });
  },

  // GET /api/users/:id
  getUserById: async (id: string): Promise<ApiResponse<User | null>> => {
    return apiWrapper(async () => {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const userList: User[] = users ? JSON.parse(users) : [];
      return userList.find(user => user.id === id) || null;
    });
  },

  // POST /api/users
  createUser: async (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    return apiWrapper(async () => {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const userList: User[] = users ? JSON.parse(users) : [];
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
      };
      
      userList.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(userList));
      return newUser;
    });
  },

  // PUT /api/users/:id
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiWrapper(async () => {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const userList: User[] = users ? JSON.parse(users) : [];
      
      const userIndex = userList.findIndex(user => user.id === id);
      if (userIndex === -1) throw new Error('User not found');
      
      userList[userIndex] = { ...userList[userIndex], ...userData };
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(userList));
      return userList[userIndex];
    });
  },

  // DELETE /api/users/:id
  deleteUser: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiWrapper(async () => {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const userList: User[] = users ? JSON.parse(users) : [];
      
      const filteredUsers = userList.filter(user => user.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
      return true;
    });
  },

  // POST /api/auth/login
  login: async (phone: string, otp: string): Promise<ApiResponse<User | null>> => {
    return apiWrapper(async () => {
      if (otp !== '123456') throw new Error('Invalid OTP');
      
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const userList: User[] = users ? JSON.parse(users) : [];
      
      return userList.find(user => user.phone === phone) || null;
    });
  },
};

// Batch API
export const batchApi = {
  // GET /api/batches
  getBatches: async (): Promise<ApiResponse<Batch[]>> => {
    return apiWrapper(async () => {
      const batches = await AsyncStorage.getItem(STORAGE_KEYS.BATCHES);
      return batches ? JSON.parse(batches) : [];
    });
  },

  // POST /api/batches
  createBatch: async (batchData: Omit<Batch, 'id'>): Promise<ApiResponse<Batch>> => {
    return apiWrapper(async () => {
      const batches = await AsyncStorage.getItem(STORAGE_KEYS.BATCHES);
      const batchList: Batch[] = batches ? JSON.parse(batches) : [];
      
      const newBatch: Batch = {
        ...batchData,
        id: Date.now().toString(),
      };
      
      batchList.push(newBatch);
      await AsyncStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batchList));
      return newBatch;
    });
  },

  // DELETE /api/batches/:id
  deleteBatch: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiWrapper(async () => {
      const batches = await AsyncStorage.getItem(STORAGE_KEYS.BATCHES);
      const batchList: Batch[] = batches ? JSON.parse(batches) : [];
      
      const filteredBatches = batchList.filter(batch => batch.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(filteredBatches));
      return true;
    });
  },
};

// Content API
export const contentApi = {
  // GET /api/content
  getContent: async (): Promise<ApiResponse<Content[]>> => {
    return apiWrapper(async () => {
      const content = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT);
      return content ? JSON.parse(content) : [];
    });
  },

  // POST /api/content
  createContent: async (contentData: Omit<Content, 'id'>): Promise<ApiResponse<Content>> => {
    return apiWrapper(async () => {
      const content = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT);
      const contentList: Content[] = content ? JSON.parse(content) : [];
      
      const newContent: Content = {
        ...contentData,
        id: Date.now().toString(),
      };
      
      contentList.push(newContent);
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(contentList));
      return newContent;
    });
  },

  // PUT /api/content/:id
  updateContent: async (id: string, contentData: Partial<Content>): Promise<ApiResponse<Content>> => {
    return apiWrapper(async () => {
      const content = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT);
      const contentList: Content[] = content ? JSON.parse(content) : [];
      
      const contentIndex = contentList.findIndex(item => item.id === id);
      if (contentIndex === -1) throw new Error('Content not found');
      
      contentList[contentIndex] = { ...contentList[contentIndex], ...contentData };
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(contentList));
      return contentList[contentIndex];
    });
  },

  // DELETE /api/content/:id
  deleteContent: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiWrapper(async () => {
      const content = await AsyncStorage.getItem(STORAGE_KEYS.CONTENT);
      const contentList: Content[] = content ? JSON.parse(content) : [];
      
      const filteredContent = contentList.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(filteredContent));
      return true;
    });
  },
};

// Session API
export const sessionApi = {
  // GET /api/sessions
  getSessions: async (date?: string): Promise<ApiResponse<Session[]>> => {
    return apiWrapper(async () => {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessionList: Session[] = sessions ? JSON.parse(sessions) : [];
      
      if (date) {
        return sessionList.filter(session => session.date === date);
      }
      return sessionList;
    });
  },

  // POST /api/sessions
  createSession: async (sessionData: Omit<Session, 'id'>): Promise<ApiResponse<Session>> => {
    return apiWrapper(async () => {
      const sessions = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
      const sessionList: Session[] = sessions ? JSON.parse(sessions) : [];
      
      const newSession: Session = {
        ...sessionData,
        id: Date.now().toString(),
      };
      
      sessionList.push(newSession);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessionList));
      return newSession;
    });
  },
};

// Notification API
export const notificationApi = {
  // GET /api/notifications/:userId
  getNotifications: async (userId: string): Promise<ApiResponse<Notification[]>> => {
    return apiWrapper(async () => {
      const notifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const notificationList: Notification[] = notifications ? JSON.parse(notifications) : [];
      
      return notificationList.filter(notification => notification.userId === userId);
    });
  },

  // PUT /api/notifications/:id/read
  markAsRead: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiWrapper(async () => {
      const notifications = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const notificationList: Notification[] = notifications ? JSON.parse(notifications) : [];
      
      const notificationIndex = notificationList.findIndex(notification => notification.id === id);
      if (notificationIndex !== -1) {
        notificationList[notificationIndex].isRead = true;
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationList));
      }
      return true;
    });
  },
};

// Attendance API
export const attendanceApi = {
  // GET /api/attendance/:userId
  getAttendance: async (userId: string): Promise<ApiResponse<AttendanceRecord[]>> => {
    return apiWrapper(async () => {
      const attendance = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const attendanceList: AttendanceRecord[] = attendance ? JSON.parse(attendance) : [];
      
      return attendanceList.filter(record => record.userId === userId);
    });
  },

  // POST /api/attendance/checkin
  checkIn: async (userId: string, sessionId: string): Promise<ApiResponse<AttendanceRecord>> => {
    return apiWrapper(async () => {
      const attendance = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const attendanceList: AttendanceRecord[] = attendance ? JSON.parse(attendance) : [];
      
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId,
        sessionId,
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkInTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
      };
      
      attendanceList.push(newRecord);
      await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceList));
      return newRecord;
    });
  },

  // PUT /api/attendance/:id/checkout
  checkOut: async (id: string): Promise<ApiResponse<AttendanceRecord>> => {
    return apiWrapper(async () => {
      const attendance = await AsyncStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      const attendanceList: AttendanceRecord[] = attendance ? JSON.parse(attendance) : [];
      
      const recordIndex = attendanceList.findIndex(record => record.id === id);
      if (recordIndex === -1) throw new Error('Attendance record not found');
      
      attendanceList[recordIndex].checkOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
      await AsyncStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceList));
      return attendanceList[recordIndex];
    });
  },
};

// Analytics API
export const analyticsApi = {
  // GET /api/analytics/overview
  getOverview: async (): Promise<ApiResponse<any>> => {
    return apiWrapper(async () => {
      return mockData.analytics.overview;
    });
  },

  // GET /api/analytics/revenue
  getRevenue: async (): Promise<ApiResponse<any[]>> => {
    return apiWrapper(async () => {
      return mockData.analytics.revenue;
    });
  },

  // GET /api/analytics/performers
  getTopPerformers: async (): Promise<ApiResponse<any[]>> => {
    return apiWrapper(async () => {
      return mockData.analytics.topPerformers;
    });
  },
};