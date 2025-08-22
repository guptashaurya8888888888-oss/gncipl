import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Patient, Doctor, Appointment, TimeSlot } from '../types';

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  APPOINTMENTS: 'appointments',
  TIME_SLOTS: 'timeSlots',
} as const;

// User operations
export const createUserDocument = async (userData: Omit<Patient | Doctor, 'uid'> & { uid: string }) => {
  try {
    console.log('Creating user document for:', userData.uid, userData);
    const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
    
    // Use setDoc instead of updateDoc to create new documents
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    console.log('User document created successfully');
    return userData;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

export const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
};

// Doctor operations
export const getDoctors = async (): Promise<Doctor[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('role', '==', 'doctor'),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Doctor[];
  } catch (error) {
    console.error('Error getting doctors:', error);
    return [];
  }
};

// Time slot operations
export const createTimeSlot = async (timeSlotData: Omit<TimeSlot, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.TIME_SLOTS), {
      ...timeSlotData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...timeSlotData };
  } catch (error) {
    console.error('Error creating time slot:', error);
    throw error;
  }
};

export const getDoctorTimeSlots = async (doctorId: string): Promise<TimeSlot[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TIME_SLOTS),
      where('doctorId', '==', doctorId),
      where('isBooked', '==', false),
      orderBy('date'),
      orderBy('time')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeSlot[];
  } catch (error) {
    console.error('Error getting doctor time slots:', error);
    return [];
  }
};

export const getAvailableTimeSlots = async (): Promise<(TimeSlot & { doctorName: string; specialty: string })[]> => {
  try {
    // Get all available time slots
    const slotsQuery = query(
      collection(db, COLLECTIONS.TIME_SLOTS),
      where('isBooked', '==', false),
      orderBy('date'),
      orderBy('time')
    );
    const slotsSnapshot = await getDocs(slotsQuery);
    const slots = slotsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeSlot[];

    // Get doctor information for each slot
    const slotsWithDoctorInfo = await Promise.all(
      slots.map(async (slot) => {
        const doctor = await getUserDocument(slot.doctorId) as Doctor;
        return {
          ...slot,
          doctorName: doctor?.name || 'Unknown Doctor',
          specialty: doctor?.specialty || 'General',
        };
      })
    );

    return slotsWithDoctorInfo;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
};

export const deleteTimeSlot = async (slotId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TIME_SLOTS, slotId));
  } catch (error) {
    console.error('Error deleting time slot:', error);
    throw error;
  }
};

export const updateTimeSlotBookingStatus = async (slotId: string, isBooked: boolean) => {
  try {
    const slotRef = doc(db, COLLECTIONS.TIME_SLOTS, slotId);
    await updateDoc(slotRef, {
      isBooked,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating time slot booking status:', error);
    throw error;
  }
};

// Appointment operations
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
      ...appointmentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...appointmentData, createdAt: new Date(), updatedAt: new Date() };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting patient appointments:', error);
    return [];
  }
};

export const getDoctorAppointments = async (doctorId: string): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.APPOINTMENTS),
      where('doctorId', '==', doctorId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Appointment[];
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    return [];
  }
};

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
  try {
    const appointmentRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToPatientAppointments = (patientId: string, callback: (appointments: Appointment[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('patientId', '==', patientId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Appointment[];
    callback(appointments);
  });
};

export const subscribeToDoctorAppointments = (doctorId: string, callback: (appointments: Appointment[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('doctorId', '==', doctorId),
    orderBy('date', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Appointment[];
    callback(appointments);
  });
};

export const subscribeToDoctorTimeSlots = (doctorId: string, callback: (slots: TimeSlot[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.TIME_SLOTS),
    where('doctorId', '==', doctorId),
    orderBy('date'),
    orderBy('time')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const slots = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeSlot[];
    callback(slots);
  });
};
