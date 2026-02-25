import React, { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown, MessageCircle, Phone, Mail, Clock } from "lucide-react";

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I book a car?",
      answer: "Browse our available cars on the Cars page, click on a specific car to view its details, select your pickup and dropoff dates, and follow the booking form to complete your reservation."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods. Payments are processed securely through our partner gateway."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 24 hours before pickup. Cancellations made within 24 hours may have a cancellation fee applied."
    },
    {
      question: "What documents do I need for pickup?",
      answer: "You'll need a valid driver's license, an ID proof, and the booking confirmation. For international customers, an international driving permit is also required."
    },
    {
      question: "Is insurance included in the rental?",
      answer: "Basic insurance is included in the rental price. You can opt for additional coverage during the booking process for extra protection."
    },
    {
      question: "What if the car breaks down during my rental?",
      answer: "Contact our 24/7 support team immediately. We provide roadside assistance and can arrange for a replacement vehicle if needed."
    },
    {
      question: "Can I extend my rental period?",
      answer: "Yes, you can extend your rental period subject to availability. Contact our support team or use your customer dashboard to request an extension."
    },
    {
      question: "Are there mileage limits?",
      answer: "Most of our rentals come with unlimited mileage. Specific mileage limits, if any, will be mentioned in your booking details."
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us anytime",
      details: "+1 (800) 123-4567",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "We'll respond quickly",
      details: "support@rentmyride.com",
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant messaging",
      details: "Available 24/7",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "Monday - Sunday",
      details: "8:00 AM - 10:00 PM EST",
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl mb-4">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Help & FAQ</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Find answers to common questions about our car rental service
        </p>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${method.color}`}>
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{method.title}</h3>
              <p className="text-sm text-slate-600 mb-2">{method.description}</p>
              <p className="font-semibold text-sky-600">{method.details}</p>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-left font-semibold text-slate-800">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} className="text-slate-400" />
                </motion.div>
              </button>
              
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 bg-slate-50 border-t border-slate-200"
                >
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-12 text-white text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Didn't find your answer?</h2>
        <p className="text-sky-100 mb-6 max-w-xl mx-auto">
          Our support team is always ready to help. Contact us via your preferred method and we'll get back to you shortly.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-white text-sky-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Contact Support
        </motion.button>
      </motion.div>
    </div>
  );
}