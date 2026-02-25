import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using RentMyRide, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
    },
    {
      title: "2. Use License",
      content: `Permission is granted to temporarily download one copy of the materials (information or software) on RentMyRide for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
• Modify or copy the materials
• Use the materials for any commercial purpose or for any public display
• Attempt to decompile or reverse engineer any software contained on RentMyRide
• Remove any copyright or other proprietary notations from the materials`
    },
    {
      title: "3. Disclaimer",
      content: "The materials on RentMyRide are provided on an 'as is' basis. RentMyRide makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
    },
    {
      title: "4. Limitations",
      content: "In no event shall RentMyRide or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RentMyRide."
    },
    {
      title: "5. Accuracy of Materials",
      content: "The materials appearing on RentMyRide could include technical, typographical, or photographic errors. RentMyRide does not warrant that any of the materials on its website are accurate, complete, or current. RentMyRide may make changes to the materials contained on its website at any time without notice."
    },
    {
      title: "6. Links",
      content: "RentMyRide has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by RentMyRide of the site. Use of any such linked website is at the user's own risk."
    },
    {
      title: "7. Modifications",
      content: "RentMyRide may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service."
    },
    {
      title: "8. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which RentMyRide operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location."
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl mb-4">
          <FileText size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Terms & Conditions</h1>
        <p className="text-slate-600 text-lg">
          Please read these terms carefully before using RentMyRide
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
              This is a demo application. Please include your actual legal terms and conditions before deploying to production.
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
              <CheckCircle size={20} className="text-sky-600" />
              {section.title}
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{section.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center pt-8 border-t border-slate-200"
      >
        <p className="text-slate-500 text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <p className="text-slate-500 text-sm mt-2">
          If you have any questions about these Terms & Conditions, please contact us at legal@rentmyride.com
        </p>
      </motion.div>
    </div>
  );
}