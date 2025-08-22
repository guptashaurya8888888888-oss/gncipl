import { useState } from 'react';
import { Link } from 'wouter';
import { UserPlus, Stethoscope, Calendar, Check, Bell, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { initializeSampleData } from '../lib/sampleData';
import { testFirestoreConnection, getFirestoreSetupInstructions } from '../lib/firestoreSetup';
import { Notification } from '../components/Notification';
import type { NotificationData } from '../types';

export default function Landing() {
  const [initializing, setInitializing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notification, setNotification] = useState<NotificationData>({ show: false, message: '', type: 'success' });

  const showNotification = (message: string, type: NotificationData['type']) => {
    setNotification({ show: true, message, type });
  };

  const handleTestFirestore = async () => {
    setTesting(true);
    try {
      const result = await testFirestoreConnection();
      if (result.success) {
        showNotification('Firestore connection successful! You can now register and use the app.', 'success');
      } else {
        const instructions = getFirestoreSetupInstructions();
        showNotification(`${result.error}\n\nPlease follow setup instructions in console.`, 'error');
        console.log('Firestore Setup Instructions:', instructions);
      }
    } catch (error: any) {
      showNotification('Failed to test Firestore connection: ' + error.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleInitializeSampleData = async () => {
    setInitializing(true);
    try {
      // Try Firebase sample data first, fallback to temporary storage
      let result;
      try {
        result = await initializeSampleData();
        showNotification(`Created ${result.doctors} doctors and ${result.patients} patients with sample appointments using Firebase!`, 'success');
      } catch (error: any) {
        if (error.code === 'permission-denied' || error.code === 'unavailable') {
          console.log('Firebase unavailable, using temporary storage for sample data...');
          const { tempInitializeSampleData } = await import('../lib/tempStorage');
          result = await tempInitializeSampleData();
          showNotification(`Created ${result.doctors} doctors and ${result.patients} patients with ${result.timeSlots} time slots using temporary storage!`, 'success');
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Error initializing sample data:', error);
      showNotification(error.message || 'Failed to initialize sample data', 'error');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-medical-blue">DocCare</div>
              <div className="hidden md:block text-sm text-gray-500">Doctor Appointment System</div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="default" className="bg-medical-blue hover:bg-blue-700">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="border-medical-blue text-medical-blue hover:bg-blue-50">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to DocCare</h1>
          <p className="text-xl text-gray-600 mb-8">Book appointments with qualified doctors easily</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Patient Portal */}
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="pt-6 p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-medical-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient Portal</h3>
                  <p className="text-gray-600 mb-6">Book appointments and manage your healthcare</p>
                </div>
                <Link href="/register?type=patient">
                  <Button className="w-full bg-medical-blue text-white hover:bg-blue-700">
                    Get Started as Patient
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            {/* Doctor Portal */}
            <Card className="border border-gray-200 shadow-lg">
              <CardContent className="pt-6 p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Doctor Portal</h3>
                  <p className="text-gray-600 mb-6">Manage appointments and patient care</p>
                </div>
                <Link href="/register?type=doctor">
                  <Button className="w-full bg-success text-white hover:bg-green-700">
                    Get Started as Doctor
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Setup Buttons */}
          <div className="text-center mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleTestFirestore}
                disabled={testing}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                {testing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Testing Firestore...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Test Firestore Setup
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleInitializeSampleData}
                disabled={initializing || testing}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {initializing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Sample Data...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Initialize Sample Data
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">First test Firestore setup, then initialize sample data</p>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-medical-blue" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Easy Scheduling</h4>
            <p className="text-gray-600">Book appointments in real-time with available doctors</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-success" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Instant Confirmation</h4>
            <p className="text-gray-600">Get immediate appointment confirmations</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-warning" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Smart Notifications</h4>
            <p className="text-gray-600">Receive reminders and updates about your appointments</p>
          </div>
        </div>
      </div>

      <Notification
        notification={notification}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}
