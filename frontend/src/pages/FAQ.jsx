import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export function FAQ() {
  const [openItems, setOpenItems] = useState({});

  const faqData = [
    {
      id: 1,
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account on the NCPD Recruitment Portal?",
          a: "To create an account, click on the 'Register' button on the homepage. Fill in your personal details, create a secure password, and verify your email address. The process takes approximately 5-10 minutes.",
        },
        {
          q: "What documents do I need to register?",
          a: "You will need: National ID/Passport, CV/Resume, academic certificates, professional certificates, and a recent passport-size photograph. All documents should be scanned and uploaded in PDF format.",
        },
        {
          q: "Is there an age requirement for applicants?",
          a: "Yes, applicants must be at least 18 years old to apply for positions at NCPD. Some positions may have specific age requirements as stated in the job descriptions.",
        },
      ],
    },
    {
      id: 2,
      category: "Application Process",
      questions: [
        {
          q: "How do I apply for a vacancy?",
          a: "Browse available vacancies on the portal, select a position that matches your qualifications, and click 'Apply Now'. Complete the application form and upload the required documents. You will receive an email confirmation.",
        },
        {
          q: "Can I apply for multiple positions at once?",
          a: "Yes, you can apply for multiple positions. However, we recommend focusing on positions that best match your qualifications and experience.",
        },
        {
          q: "How will I know if my application is received?",
          a: "You will receive an automatic email confirmation after submitting your application. You can also track your application status in your candidate dashboard.",
        },
      ],
    },
    {
      id: 3,
      category: "Technical Support",
      questions: [
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click 'Forgot Password' on the login page, enter your registered email address, and follow the password reset instructions sent to your email.",
        },
        {
          q: "What browsers are supported?",
          a: "The portal supports modern versions of Chrome, Firefox, Microsoft Edge, and Safari.",
        },
        {
          q: "Who do I contact for technical assistance?",
          a: "Email recruitment@ncpd.go.ke or call +254 20 2020 during office hours (Monday–Friday, 8:00 AM – 5:00 PM).",
        },
      ],
    },
    {
      id: 4,
      category: "Recruitment Process",
      questions: [
        {
          q: "How long does the recruitment process take?",
          a: "The recruitment process typically takes 4–6 weeks from the application deadline to final selection.",
        },
        {
          q: "What types of interviews does NCPD conduct?",
          a: "Depending on the position, interviews may include technical assessments, panel interviews, and practical exercises.",
        },
        {
          q: "Will I receive feedback if not selected?",
          a: "Yes. All applicants are notified of the final recruitment outcome.",
        },
      ],
    },
  ];

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="responsive-container py-8">
      {/* Page Header */}
      <section className="text-center mb-12">
        <QuestionMarkCircleIcon className="w-16 h-16 text-ncpd-primary mx-auto mb-4" />
        <h1 className="section-title">Frequently Asked Questions</h1>
        <p className="section-subtitle">
          Find answers to common questions about the NCPD Recruitment Portal.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto space-y-8">
        {faqData.map((category) => (
          <article key={category.id} className="card">
            <button
              onClick={() => toggleItem(category.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <QuestionMarkCircleIcon className="w-6 h-6 text-ncpd-primary mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {category.category}
                </h2>
              </div>

              {openItems[category.id] ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {openItems[category.id] && (
              <div className="px-6 pb-6 space-y-6">
                {category.questions.map((item, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <QuestionMarkCircleIcon className="w-5 h-5 text-ncpd-primary flex-shrink-0 mt-1" />
                      <h3 className="font-semibold text-gray-900">
                        {item.q}
                      </h3>
                    </div>

                    <p className="pl-8 text-gray-700 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Support */}
      <section className="mt-12 max-w-2xl mx-auto rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />

          <div>
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Still Need Help?
            </h2>

            <p className="text-blue-800 mb-4">
              If you cannot find the answer you are looking for, our support
              team is ready to assist you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="btn-primary flex items-center justify-center"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Contact Support Team
              </Link>

              <Link
                to="/data-protection"
                className="btn-outline flex items-center justify-center"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Data Protection Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}