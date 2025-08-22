import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthContext } from '../contexts/AuthContext';
import { Notification } from '../components/Notification';
import type { NotificationData } from '../types';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  age: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val);
      return isNaN(parsed) ? 0 : parsed;
    }
    return val;
  }).refine((val) => val > 0 && val <= 120, 'Age must be between 1 and 120'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender' }),
});

const doctorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  specialty: z.string().min(1, 'Please select a specialty'),
});

type PatientFormData = z.infer<typeof patientSchema>;
type DoctorFormData = z.infer<typeof doctorSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { register, loading } = useAuthContext();
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [notification, setNotification] = useState<NotificationData>({ show: false, message: '', type: 'success' });

  // Get user type from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get('type');
  
  useState(() => {
    if (typeParam === 'doctor' || typeParam === 'patient') {
      setUserType(typeParam);
    }
  });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      age: '' as any,
      gender: 'male',
    },
  });

  const doctorForm = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      specialty: '',
    },
  });

  const showNotification = (message: string, type: NotificationData['type']) => {
    setNotification({ show: true, message, type });
  };

  const handlePatientSubmit = async (data: PatientFormData) => {
    try {
      await register(data.email, data.password, {
        name: data.name,
        role: 'patient' as const,
        age: data.age,
        gender: data.gender,
      });
      showNotification('Registration successful!', 'success');
      navigate('/patient/dashboard');
    } catch (error: any) {
      showNotification(error.message || 'Registration failed', 'error');
    }
  };

  const handleDoctorSubmit = async (data: DoctorFormData) => {
    try {
      await register(data.email, data.password, {
        name: data.name,
        role: 'doctor' as const,
        specialty: data.specialty,
      });
      showNotification('Registration successful!', 'success');
      navigate('/doctor/dashboard');
    } catch (error: any) {
      showNotification(error.message || 'Registration failed', 'error');
    }
  };

  const specialties = [
    'cardiology',
    'dermatology',
    'pediatrics',
    'orthopedics',
    'neurology',
    'general',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {userType === 'patient' ? 'Patient Registration' : 'Doctor Registration'}
          </CardTitle>
          <p className="text-gray-600">Create your account to get started</p>
        </CardHeader>
        
        <CardContent>
          {/* User Type Selector */}
          <div className="flex space-x-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setUserType('patient')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'patient'
                  ? 'bg-medical-blue text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patient
            </button>
            <button
              onClick={() => setUserType('doctor')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'doctor'
                  ? 'bg-medical-blue text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Doctor
            </button>
          </div>

          {userType === 'patient' ? (
            <Form {...patientForm}>
              <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-4">
                <FormField
                  control={patientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={patientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={patientForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={patientForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={patientForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" className="w-full bg-medical-blue hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...doctorForm}>
              <form onSubmit={doctorForm.handleSubmit(handleDoctorSubmit)} className="space-y-4">
                <FormField
                  control={doctorForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={doctorForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={doctorForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={doctorForm.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-success hover:bg-green-700" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          )}
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-medical-blue hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Notification
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}
