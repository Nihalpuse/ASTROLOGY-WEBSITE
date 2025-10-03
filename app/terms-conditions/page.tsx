"use client";
// This page intentionally hides the Header for a legal/standalone look.
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const TermsConditionsPage = () => {
  // Hide the header if possible (handled in layout or via CSS)
  if (typeof window !== 'undefined') {
    const header = document.querySelector('header');
    if (header) header.style.display = 'none';
  }

  // Set the body and html background to black for this page
  useEffect(() => {
    const originalBodyBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = 'black';
    document.documentElement.style.backgroundColor = 'black';
    return () => {
      document.body.style.backgroundColor = originalBodyBg;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-black py-12 pl-12 pr-4 text-white font-sans mt-24" style={{fontWeight: 400, letterSpacing: 0.01}}>
      <div className="space-y-8 leading-relaxed" style={{textAlign: 'justify'}}>
        <div className="relative w-full h-[200px] mb-8 rounded-lg overflow-hidden">
          <Image
            src="/images/terms-banner.jpg"
            alt="Terms and Conditions Banner"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold mb-2" style={{textAlign: 'left'}}>Terms and Conditions</h1>
          <p className="text-lg mb-6" style={{textAlign: 'left'}}>Last updated: January 1, 2024</p>
        </div>
        
        <p>
          Welcome to Nakshatra Gyaan. These Terms and Conditions (&quot;Terms&quot;) govern your use of our platform and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing our platform, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. These Terms constitute a legally binding agreement between you and Nakshatra Gyaan.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          Nakshatra Gyaan provides an online platform that connects users with qualified astrologers for consultations, readings, and spiritual guidance. Our services include but are not limited to astrology consultations, horoscope readings, gemstone recommendations, and spiritual products. We also offer educational content and courses related to astrology and spirituality.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
        <p>
          To access certain features of our service, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Astrologer Registration</h2>
        <p>
          Astrologers who wish to provide services through our platform must complete a registration process and meet our qualification standards. We reserve the right to approve or reject applications at our sole discretion. Approved astrologers must maintain professional standards and comply with all applicable laws and regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payment Terms</h2>
        <p>
          Payment for services must be made in advance through our secure payment system. All payments are processed through third-party payment processors. Refunds are subject to our refund policy and may be granted at our discretion. Prices for services are subject to change without notice.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Prohibited Uses</h2>
        <p>
          You agree not to use our services for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. Prohibited activities include but are not limited to: harassment of other users or astrologers, posting false or misleading information, attempting to gain unauthorized access to our systems, and any activity that violates applicable laws or regulations.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
        <p>
          All content on our platform, including but not limited to text, graphics, logos, images, and software, is the property of Nakshatra Gyaan or its content suppliers and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without express written permission.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers</h2>
        <p>
          Our services are provided for entertainment and informational purposes only. We do not guarantee the accuracy, completeness, or reliability of any astrological readings, consultations, or advice provided through our platform. Users should exercise their own judgment and discretion when making decisions based on information received through our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Nakshatra Gyaan shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Privacy Policy</h2>
        <p>
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our services. By using our services, you agree to the collection and use of information in accordance with our Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination</h2>
        <p>
          We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will cease immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or our services shall be subject to the exclusive jurisdiction of the courts located in India.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on our platform and updating the &quot;Last updated&quot; date. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Information</h2>
        <p>
          If you have any questions about these Terms and Conditions, please contact us at <a href="mailto:support@nakshatragyaan.com" className="underline">support@nakshatragyaan.com</a>. We are committed to addressing your concerns and ensuring a positive experience for all users of our platform.
        </p>

        <div className="mt-12 flex flex-col gap-4">
          <button className="w-fit px-8 py-4 rounded-md text-lg font-semibold bg-gradient-to-r from-[#a084ee] to-[#f857a6] text-white hover:brightness-110 transition-all shadow-lg">I Agree to the Terms</button>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#a084ee] to-[#f857a6] hover:brightness-110">
            <ArrowLeft className="w-5 h-5" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage;
