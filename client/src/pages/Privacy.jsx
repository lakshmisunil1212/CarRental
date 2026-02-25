import React from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";

export default function Privacy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us, such as:
• Your name, email address, and phone number
• Your driver's license and identification information
• Payment information and billing address
• Vehicle rental preferences and history
• Communication preferences and feedback`
    },
    {
      title: "2. How We Use Your Information",
      content: `We use the information we collect for various purposes, including:
• Processing and managing your car rental reservations
• Providing customer support and responding to inquiries
• Sending promotional offers and marketing communications
• Improving our services and user experience
• Preventing fraud and ensuring security
• Complying with legal obligations`
    },
    {
      title: "3. Information Sharing",
      content: `We do not sell, trade, or rent your personal information to third parties. We may share information with:
• Service providers who assist us in operating our website and conducting our business
• Partners necessary to complete your rental transaction
• Law enforcement when required by law
• Other parties with your consent`
    },
    {
      title: "4. Data Security",
      content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure."
    },
    {
      title: "5. Cookies and Tracking",
      content: `We use cookies and similar tracking technologies to enhance your experience on our website. These help us:
• Remember your preferences and login information
• Analyze website traffic and usage patterns
• Deliver personalized content and advertisements
• Improve our services

You can control cookie settings through your browser.`
    },
    {
      title: "6. Your Rights",
      content: `You have the right to:
• Access the personal information we hold about you
• Request correction of inaccurate data
• Request deletion of your data
• Opt-out of marketing communications
• Restrict how we use your information

To exercise these rights, contact us at privacy@rentmyride.com`
    },
    {
      title: "7. Children's Privacy",
      content: "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will take steps to delete such information."
    },
    {
      title: "8. Changes to Privacy Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on our website. Your continued use of our services following the posting of revised privacy policy means you accept and agree to the changes."
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
          <Shield size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
        <p className="text-slate-600 text-lg">
          Your privacy is important to us. Learn how we protect your data.
        </p>
      </motion.div>

      {/* Warning Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-lg"
      >
        <div className="flex gap-4">
          <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Important Notice</h3>
            <p className="text-amber-800 text-sm">
              This is a demo application. Please include your actual privacy policy before deploying to production.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-md"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-600" />
              {section.title}
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-emerald-50 to-blue-50 p-8 rounded-xl border border-emerald-200"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-2">Privacy Inquiries</h3>
        <p className="text-slate-600 mb-4">
          If you have questions about this privacy policy or our privacy practices, please contact us:
        </p>
        <div className="space-y-2 text-slate-600">
          <p><strong>Email:</strong> privacy@rentmyride.com</p>
          <p><strong>Phone:</strong> +1 (800) 123-4567</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </motion.div>
    </div>
  );
}