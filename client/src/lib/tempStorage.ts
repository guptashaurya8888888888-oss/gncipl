// Temporary local storage solution for when Firestore is not available
// This allows the app to work while you set up Firestore

import type { User, Patient, Doctor, Appointment, TimeSlot } from '../types';

const STORAGE_KEYS = {
  USERS: 'doccare_users',
  APPOINTMENTS: 'doccare_appointments', 
  TIME_SLOTS: 'doccare_time_slots',
  CURRENT_USER: 'doccare_current_user'
};

// Storage utilities
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// User operations
export const tempCreateUser = async (userData: Omit<User, 'uid'> & { uid: string }): Promise<User> => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  
  // Check if user already exists
  const existingUser = users.find(user => user.uid === userData.uid || user.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const newUser: User = {
    ...userData
  } as User;
  
  users.push(newUser);
  saveToStorage(STORAGE_KEYS.USERS, users);
  
  return newUser;
};

export const tempGetUser = async (uid: string): Promise<User | null> => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find(user => user.uid === uid) || null;
};

export const tempGetUserByEmail = async (email: string): Promise<User | null> => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.find(user => user.email === email) || null;
};

// Current user session
export const tempSetCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const tempGetCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

// Time slot operations
export const tempCreateTimeSlot = async (timeSlot: Omit<TimeSlot, 'id'>): Promise<TimeSlot> => {
  const timeSlots = getFromStorage<TimeSlot>(STORAGE_KEYS.TIME_SLOTS);
  
  const newTimeSlot: TimeSlot = {
    ...timeSlot,
    id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } as TimeSlot;
  
  timeSlots.push(newTimeSlot);
  saveToStorage(STORAGE_KEYS.TIME_SLOTS, timeSlots);
  
  return newTimeSlot;
};

export const tempGetTimeSlots = async (doctorId?: string): Promise<TimeSlot[]> => {
  const timeSlots = getFromStorage<TimeSlot>(STORAGE_KEYS.TIME_SLOTS);
  return doctorId 
    ? timeSlots.filter(slot => slot.doctorId === doctorId)
    : timeSlots;
};

export const tempGetAvailableSlots = async (doctorId?: string): Promise<TimeSlot[]> => {
  const timeSlots = await tempGetTimeSlots(doctorId);
  return timeSlots.filter(slot => !slot.isBooked);
};

export const tempDeleteTimeSlot = async (id: string): Promise<boolean> => {
  const timeSlots = getFromStorage<TimeSlot>(STORAGE_KEYS.TIME_SLOTS);
  const filteredSlots = timeSlots.filter(slot => slot.id !== id);
  
  if (filteredSlots.length < timeSlots.length) {
    saveToStorage(STORAGE_KEYS.TIME_SLOTS, filteredSlots);
    return true;
  }
  
  return false;
};

// Appointment operations
export const tempCreateAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<Appointment> => {
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  
  const newAppointment: Appointment = {
    ...appointment,
    id: `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  } as Appointment;
  
  appointments.push(newAppointment);
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  
  // Mark time slot as booked
  const timeSlots = getFromStorage<TimeSlot>(STORAGE_KEYS.TIME_SLOTS);
  const updatedSlots = timeSlots.map(slot => {
    if (slot.doctorId === appointment.doctorId && 
        slot.date === appointment.date && 
        slot.time === appointment.time) {
      return { ...slot, isBooked: true };
    }
    return slot;
  });
  saveToStorage(STORAGE_KEYS.TIME_SLOTS, updatedSlots);
  
  return newAppointment;
};

export const tempGetAppointments = async (userId?: string, role?: 'patient' | 'doctor'): Promise<Appointment[]> => {
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  
  if (!userId) return appointments;
  
  return appointments.filter(appointment => 
    role === 'patient' 
      ? appointment.patientId === userId
      : appointment.doctorId === userId
  );
};

export const tempUpdateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
  const appointments = getFromStorage<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const appointmentIndex = appointments.findIndex(apt => apt.id === id);
  
  if (appointmentIndex === -1) return null;
  
  const updatedAppointment = {
    ...appointments[appointmentIndex],
    ...updates
  } as Appointment;
  
  appointments[appointmentIndex] = updatedAppointment;
  saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  
  return updatedAppointment;
};

// Get all doctors
export const tempGetDoctors = async (): Promise<Doctor[]> => {
  const users = getFromStorage<User>(STORAGE_KEYS.USERS);
  return users.filter(user => user.role === 'doctor') as Doctor[];
};

// Initialize sample data for temp storage
export const tempInitializeSampleData = async () => {
  // Sample doctors
  const sampleDoctors = [
    {
      uid: 'doctor_1',
      email: 'sarah.johnson@doccare.com',
      name: 'Dr. Sarah Johnson',
      role: 'doctor' as const,
      specialty: 'cardiology'
    },
    {
      uid: 'doctor_2', 
      email: 'michael.chen@doccare.com',
      name: 'Dr. Michael Chen',
      role: 'doctor' as const,
      specialty: 'dermatology'
    },
    {
      uid: 'doctor_3',
      email: 'emily.davis@doccare.com', 
      name: 'Dr. Emily Davis',
      role: 'doctor' as const,
      specialty: 'pediatrics'
    }
  ];

  // Sample patients
  const samplePatients = [
    {
      uid: 'patient_1',
      email: 'john.smith@example.com',
      name: 'John Smith', 
      role: 'patient' as const,
      age: 35,
      gender: 'male' as const
    },
    {
      uid: 'patient_2',
      email: 'maria.garcia@example.com',
      name: 'Maria Garcia',
      role: 'patient' as const, 
      age: 28,
      gender: 'female' as const
    }
  ];

  // Create users
  const users = [...sampleDoctors, ...samplePatients] as User[];
  
  saveToStorage(STORAGE_KEYS.USERS, users);

  // Create time slots for doctors
  const timeSlots: TimeSlot[] = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];
  
  sampleDoctors.forEach(doctor => {
    // Next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random 4-5 slots per day
      const dailySlots = times.slice(0, 4 + Math.floor(Math.random() * 2));
      
      dailySlots.forEach(time => {
        timeSlots.push({
          id: `slot_${doctor.uid}_${dateStr}_${time}`,
          doctorId: doctor.uid,
          date: dateStr,
          time,
          isBooked: false
        } as TimeSlot);
      });
    }
  });
  
  saveToStorage(STORAGE_KEYS.TIME_SLOTS, timeSlots);

  return {
    doctors: sampleDoctors.length,
    patients: samplePatients.length,
    timeSlots: timeSlots.length
  };
};

// Clear all temp data
export const tempClearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};