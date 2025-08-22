import { 
  createUserDocument, 
  createTimeSlot, 
  createAppointment 
} from './firestore';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Sample doctors data
const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@doccare.com',
    password: 'password123',
    role: 'doctor' as const,
    specialty: 'cardiology'
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@doccare.com', 
    password: 'password123',
    role: 'doctor' as const,
    specialty: 'dermatology'
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@doccare.com',
    password: 'password123', 
    role: 'doctor' as const,
    specialty: 'pediatrics'
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@doccare.com',
    password: 'password123',
    role: 'doctor' as const,
    specialty: 'orthopedics'
  },
  {
    name: 'Dr. Lisa Rodriguez',
    email: 'lisa.rodriguez@doccare.com',
    password: 'password123',
    role: 'doctor' as const,
    specialty: 'neurology'
  }
];

// Sample patients data
const samplePatients = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    password: 'password123',
    role: 'patient' as const,
    age: 35,
    gender: 'male' as const
  },
  {
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    password: 'password123',
    role: 'patient' as const,
    age: 28,
    gender: 'female' as const
  },
  {
    name: 'David Brown',
    email: 'david.brown@example.com',
    password: 'password123',
    role: 'patient' as const,
    age: 42,
    gender: 'male' as const
  }
];

// Helper function to generate future dates
const getNextWeekDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) { // Next 2 weeks
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Time slots for availability
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Function to initialize sample data
export const initializeSampleData = async () => {
  try {
    console.log('Starting sample data initialization...');
    
    // Create sample doctors
    const createdDoctors = [];
    for (const doctor of sampleDoctors) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, doctor.email, doctor.password);
        const doctorDoc = await createUserDocument({
          uid: userCredential.user.uid,
          email: doctor.email,
          name: doctor.name,
          role: doctor.role,
          specialty: doctor.specialty
        } as any);
        createdDoctors.push({ ...doctorDoc, uid: userCredential.user.uid });
        console.log(`Created doctor: ${doctor.name}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Doctor ${doctor.name} already exists, skipping...`);
        } else {
          console.error(`Error creating doctor ${doctor.name}:`, error);
        }
      }
    }

    // Create sample patients  
    const createdPatients = [];
    for (const patient of samplePatients) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, patient.email, patient.password);
        const patientDoc = await createUserDocument({
          uid: userCredential.user.uid,
          email: patient.email,
          name: patient.name,
          role: patient.role,
          age: patient.age,
          gender: patient.gender
        } as any);
        createdPatients.push({ ...patientDoc, uid: userCredential.user.uid });
        console.log(`Created patient: ${patient.name}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Patient ${patient.name} already exists, skipping...`);
        } else {
          console.error(`Error creating patient ${patient.name}:`, error);
        }
      }
    }

    // Create time slots for doctors
    const dates = getNextWeekDates();
    for (const doctor of createdDoctors) {
      for (const date of dates) {
        // Create 3-4 random time slots per day for each doctor
        const randomSlots = timeSlots
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 2);
          
        for (const time of randomSlots) {
          try {
            await createTimeSlot({
              date,
              time,
              doctorId: doctor.uid,
              isBooked: false
            });
          } catch (error) {
            console.error(`Error creating time slot for ${doctor.name}:`, error);
          }
        }
      }
      console.log(`Created time slots for ${doctor.name}`);
    }

    // Create some sample appointments
    if (createdDoctors.length > 0 && createdPatients.length > 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      for (let i = 0; i < Math.min(3, createdPatients.length); i++) {
        const patient = createdPatients[i];
        const doctor = createdDoctors[i % createdDoctors.length];
        
        try {
          await createAppointment({
            doctorId: doctor.uid,
            patientId: patient.uid,
            doctorName: doctor.name,
            patientName: patient.name,
            patientAge: (patient as any).age,
            patientGender: (patient as any).gender,
            specialty: (doctor as any).specialty,
            date: tomorrowStr,
            time: '10:00',
            status: 'pending'
          });
          console.log(`Created sample appointment between ${patient.name} and ${doctor.name}`);
        } catch (error) {
          console.error(`Error creating appointment:`, error);
        }
      }
    }

    console.log('Sample data initialization completed!');
    return {
      doctors: createdDoctors.length,
      patients: createdPatients.length,
      message: 'Sample data created successfully!'
    };

  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
};

// Function to check if sample data exists
export const checkSampleDataExists = async () => {
  // This would typically check if sample doctors exist
  // For now, we'll just return false to allow initialization
  return false;
};