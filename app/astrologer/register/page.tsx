'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const areas = ['Vedic', 'Tarot', 'Numerology', 'Palmistry', 'Western'];

const FloatingCard = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={`absolute bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl pointer-events-none hidden lg:block ${className}`}>
    {children}
  </div>
);

const AstrologerRegisterPage = () => {
  const router = useRouter();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    yearsOfExperience: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    terms: false,
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setProfileImage(null);
      setProfileImagePreview(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!form.terms) {
      setError('You must agree to the terms and conditions');
      toast({ title: 'Error', description: 'You must agree to the terms', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('areasOfExpertise', selectedAreas.join(','));
      formData.append('yearsOfExperience', form.yearsOfExperience);
      formData.append('bankName', form.bankName);
      formData.append('accountNumber', form.accountNumber);
      formData.append('ifscCode', form.ifscCode);
      if (profileImage) formData.append('profileImage', profileImage);
      await axios.post('/api/astrologer/register', formData);
      toast({ title: 'Success', description: 'Registration successful! Redirecting to login...', variant: 'default' });
      
      // Redirect to astrologer auth page after successful registration
      setTimeout(() => {
        router.push('/astrologer/auth');
      }, 1500);
    } catch (err: unknown) {
      toast({ title: 'Error', description: (err && typeof err === 'object' && 'response' in err && (err as { response?: { data?: { message?: string } } })?.response?.data?.message) ? (err as { response?: { data?: { message?: string } } }).response!.data!.message : 'Registration failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FEFBF2]">
      <main className="relative w-full min-h-screen overflow-hidden flex flex-col">
        {/* Registration Form - background effect removed, card moved up */}
        <div className="relative z-10 flex-grow flex flex-col justify-start items-center px-4 pt-10 pb-8">
          <div className="relative bg-white border border-gray-200 shadow-2xl rounded-3xl px-6 pt-8 pb-8 w-full max-w-3xl">
            {/* Card Header: Centered Title and Profile Upload */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-3xl font-bold mb-2 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                Astrologer Registration
              </h2>
              <p className="text-gray-500 mb-4 text-center">Become a part of Nakshatra Gyaan</p>
              {/* Profile Upload Circle */}
              <label htmlFor="profilePic" className="cursor-pointer relative inline-block">
                <div className="w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {profileImagePreview ? (
                    <Image src={profileImagePreview} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-sm text-gray-400">Upload</span>
                  )}
                </div>
                <input id="profilePic" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
              </label>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Personal Details */}
              <h3 className="text-lg font-semibold mb-1 text-black">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" type="tel" pattern="[0-9]{10}" required className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <div className="relative">
                  <input 
                    name="password" 
                    value={form.password} 
                    onChange={handleChange} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    required 
                    className="w-full px-4 pr-12 py-2 bg-white text-black border border-gray-200 rounded-xl" 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    name="confirmPassword" 
                    value={form.confirmPassword} 
                    onChange={handleChange} 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="Confirm Password" 
                    required 
                    className="w-full px-4 pr-12 py-2 bg-white text-black border border-gray-200 rounded-xl" 
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Areas of Expertise (2 columns) */}
              <div>
                <label className="block mb-2 text-sm text-gray-700">Areas of Expertise</label>
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {areas.map(area => (
                    <label key={area} className="flex items-center text-sm text-black">
                      <input
                        type="checkbox"
                        className="mr-2 accent-amber-500"
                        checked={selectedAreas.includes(area)}
                        onChange={() => toggleArea(area)}
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block mb-2 text-sm text-gray-700">Years of Experience</label>
                <input name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} placeholder="e.g. 5" type="number" className="w-full px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
              </div>

              {/* Bank Details */}
              <h3 className="text-lg font-semibold mb-1 text-black">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="Bank Name" className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account Number" className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
                <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="IFSC Code" className="px-4 py-2 bg-white text-black border border-gray-200 rounded-xl" />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange} className="mt-1 accent-amber-500" required />
                <p className="text-sm text-gray-700">
                  I agree to the <span className="text-amber-600 underline cursor-pointer hover:text-amber-700" onClick={() => setShowTermsModal(true)}>Terms</span> and <span className="text-amber-600 underline cursor-pointer hover:text-amber-700" onClick={() => setShowPrivacyModal(true)}>Privacy Policy</span>
                </p>
              </div>

              <button type="submit" disabled={loading || !form.terms} className="w-full py-3 text-white bg-black rounded-xl font-semibold hover:brightness-110 transition">
                {loading ? 'Registering...' : 'Register'}
              </button>
              {error && (
                <div className="mt-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-2 text-center">
                  {error}
                </div>
              )}
            </form>

            <p className="mt-6 text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link href="/astrologer/auth" className="text-amber-600 hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>

        {/* Terms and Conditions Modal */}
        <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Terms and Conditions</DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Last updated: January 1, 2024
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                Welcome to Nakshatra Gyaan. These Terms and Conditions ("Terms") govern your use of our platform and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">1. Acceptance of Terms</h3>
              <p>
                By creating an account, accessing our platform, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. These Terms constitute a legally binding agreement between you and Nakshatra Gyaan.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">2. Description of Service</h3>
              <p>
                Nakshatra Gyaan provides an online platform that connects users with qualified astrologers for consultations, readings, and spiritual guidance. Our services include but are not limited to astrology consultations, horoscope readings, gemstone recommendations, and spiritual products. We also offer educational content and courses related to astrology and spirituality.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">3. User Accounts</h3>
              <p>
                To access certain features of our service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">4. Astrologer Registration</h3>
              <p>
                Astrologers who wish to provide services through our platform must complete a registration process and meet our qualification standards. We reserve the right to approve or reject applications at our sole discretion. Approved astrologers must maintain professional standards and comply with all applicable laws and regulations.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">5. Payment Terms</h3>
              <p>
                Payment for services must be made in advance through our secure payment system. All payments are processed through third-party payment processors. Refunds are subject to our refund policy and may be granted at our discretion. Prices for services are subject to change without notice.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">6. Prohibited Uses</h3>
              <p>
                You agree not to use our services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. Prohibited activities include but are not limited to: harassment of other users or astrologers, posting false or misleading information, attempting to gain unauthorized access to our systems, and any activity that violates applicable laws or regulations.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">7. Disclaimers</h3>
              <p>
                Our services are provided for entertainment and informational purposes only. We do not guarantee the accuracy, completeness, or reliability of any astrological readings, consultations, or advice provided through our platform. Users should exercise their own judgment and discretion when making decisions based on information received through our services.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">8. Governing Law</h3>
              <p>
                These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or our services shall be subject to the exclusive jurisdiction of the courts located in India.
              </p>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  If you have any questions about these Terms and Conditions, please contact us at{' '}
                  <a href="mailto:info@nakshatragyaan.com" className="text-amber-600 underline">
                    info@nakshatragyaan.com
                  </a>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Policy Modal */}
        <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Privacy Policy</DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Last updated: January 1, 2024
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                This Privacy Policy describes how Nakshatra Gyaan ("the Platform") collects, uses, discloses, and protects your personal information when you access or use our services. By using the Platform, you acknowledge that you have read, understood, and agree to the terms of this Privacy Policy.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h3>
              <p>
                We collect personal information that you voluntarily provide to us when you register for an account, fill out forms, make purchases, subscribe to newsletters, or otherwise interact with the Platform. This information may include your name, email address, phone number, postal address, payment information, and any other details you choose to provide.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">How We Use Your Information</h3>
              <p>
                The information we collect is used to provide, maintain, and improve our services, process transactions, communicate with you, personalize your experience, send you marketing and promotional materials, and comply with legal obligations. We may also use your information to analyze usage trends, monitor the effectiveness of our marketing campaigns, and enhance the security of the Platform.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Information Sharing</h3>
              <p>
                We may share your personal information with trusted third-party service providers who assist us in operating the Platform, conducting our business, or serving our users, so long as those parties agree to keep this information confidential. We may also disclose your information if required to do so by law, in response to valid requests by public authorities, or to protect the rights, property, or safety of Nakshatra Gyaan, our users, or others.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Data Security</h3>
              <p>
                We implement a variety of security measures to protect your personal information from unauthorized access, use, alteration, or disclosure. These measures include encryption, access controls, secure servers, and regular security assessments. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Your Rights</h3>
              <p>
                You have the right to access, correct, update, or delete your personal information at any time. You may also object to or restrict certain processing of your data, withdraw your consent where processing is based on consent, and request a copy of your information in a portable format. To exercise these rights, please contact us at support@nakshatragyaan.com.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Cookies and Tracking</h3>
              <p>
                Cookies and similar tracking technologies are used to enhance your experience on the Platform, remember your preferences, analyze site traffic, and deliver targeted advertisements. You can control the use of cookies through your browser settings, but disabling cookies may affect the functionality of the Platform.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Data Retention</h3>
              <p>
                Your personal information will be retained only for as long as necessary to fulfill the purposes for which it was collected, comply with our legal obligations, resolve disputes, and enforce our agreements. When your information is no longer required, we will securely delete or anonymize it in accordance with applicable laws and regulations.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Updates to Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or for other operational reasons. We will notify you of any material changes by posting the new Privacy Policy on the Platform and updating the "Last updated" date.
              </p>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at{' '}
                  <a href="mailto:info@nakshatragyaan.com" className="text-amber-600 underline">
                    info@nakshatragyaan.com
                  </a>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AstrologerRegisterPage;
