export const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click "Register" in the top navigation. Enter your first name, last name, email address, phone number, and a password (minimum 8 characters with uppercase, lowercase, a number, and a special character), then accept the terms and conditions. You will be logged in and taken to your dashboard automatically — no email verification step is required.',
      },
      {
        q: 'Who can register on the portal?',
        a: 'Public registration is for job applicants only. HR staff and administrator accounts are created by the NCPD HR team through the admin panel, not through public registration.',
      },
      {
        q: 'What should I do after registering?',
        a: 'Complete your profile under "My Profile". The portal guides you through personal details, academic qualifications, work experience, three referees, uploaded documents (CV, national ID, and KRA PIN certificate), and a declaration. You need a complete profile before you can submit a job application.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Security',
    questions: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page click "Forgot Password", enter your registered email address, and follow the reset link sent to your email. The link opens a page where you can set a new password.',
      },
      {
        q: 'Why am I asked for a verification code at login?',
        a: 'Some accounts have two-factor authentication enabled. After entering your password, enter the one-time code sent to your email to complete sign-in.',
      },
      {
        q: 'How long does my session last?',
        a: 'For your security, sessions expire after 30 minutes of inactivity or 8 hours in total. You will be asked to sign in again after that.',
      },
      {
        q: 'Can I update my email or phone number?',
        a: 'Yes. Update your personal details under "My Profile" in your dashboard and save the changes.',
      },
    ],
  },
  {
    id: 'applications',
    title: 'Jobs & Applications',
    questions: [
      {
        q: 'How do I view job vacancies?',
        a: 'Sign in and open "Job Vacancies" from your dashboard sidebar, or use the Vacancies link in the menu. You must be logged in to view vacancy details.',
      },
      {
        q: 'How do I apply for a vacancy?',
        a: 'Open the vacancy, review the requirements, and click "Apply". Make sure your profile is 100% complete first — the portal will take you to "My Profile" if anything is missing. Once complete, you can submit the application.',
      },
      {
        q: 'Can I apply for more than one vacancy?',
        a: 'Yes. You can submit applications for multiple vacancies, and each one is tracked separately under "My Applications".',
      },
      {
        q: 'How do I track my application status?',
        a: 'Go to "My Applications" in your dashboard. Each application shows its current status as it moves through the recruitment process.',
      },
      {
        q: 'Can I edit or withdraw an application after submitting?',
        a: 'Submitted applications cannot be edited. If you need to withdraw or correct an application, contact the recruitment team using the details on this page as soon as possible.',
      },
    ],
  },
  {
    id: 'profile-documents',
    title: 'Profile & Documents',
    questions: [
      {
        q: 'What information does my profile require?',
        a: 'Personal details (name, email, phone, national ID, date of birth, gender, county), academic qualifications, work experience, three referees, uploaded documents (CV, national ID, and KRA PIN certificate), and a signed declaration.',
      },
      {
        q: 'Which documents do I need to upload?',
        a: 'At minimum: your CV/resume, a copy of your national ID, and your KRA PIN certificate. You can also add professional certificates and memberships in the relevant profile sections.',
      },
      {
        q: 'What file formats are accepted?',
        a: 'Documents should be clear scanned copies, preferably in PDF format. Make sure files are legible before uploading.',
      },
      {
        q: 'Is my personal information secure?',
        a: 'Yes. Your data is used only for recruitment purposes and handled under our Data Protection Policy, linked in the footer of every page.',
      },
    ],
  },
  {
    id: 'portal-features',
    title: 'Portal Features',
    questions: [
      {
        q: 'What are Internships, Attachments, Announcements, Downloads and Chat?',
        a: 'Internships lists internship opportunities, Attachments stores your uploaded documents, Announcements shows official NCPD notices, Downloads provides portal resources, and Chat with Us lets you message the recruitment team directly from your dashboard.',
      },
      {
        q: 'How does recruitment work after I apply?',
        a: 'The HR team reviews applications, verifies documents, shortlists candidates, and conducts interviews. You can follow each stage through the status shown in "My Applications".',
      },
      {
        q: 'Will I be notified when my application status changes?',
        a: 'Status updates are reflected in "My Applications". For official notices, check the Announcements section of your dashboard regularly.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Support',
    questions: [
      {
        q: 'Which browsers are supported?',
        a: 'The portal works best on current versions of Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari.',
      },
      {
        q: 'The page is not loading or behaving strangely. What should I try?',
        a: 'Try refreshing the page, clearing your browser cache, or switching browsers. Make sure your internet connection is stable.',
      },
      {
        q: 'Who do I contact for help?',
        a: 'Email recruitment@ncpd.go.ke or call +254 20 271 7444 during office hours (Monday to Friday, 8:00 AM to 5:00 PM). You can also use "Chat with Us" inside your dashboard or the Contact page.',
      },
    ],
  },
];

export const contactInfo = {
  phone: '+254 20 271 7444',
  phoneHref: 'tel:+254202717444',
  email: 'recruitment@ncpd.go.ke',
  emailHref: 'mailto:recruitment@ncpd.go.ke',
  hours: 'Monday – Friday, 8:00 AM – 5:00 PM',
};

export const allQuestions = faqCategories.flatMap((c) =>
  c.questions.map((item) => ({ ...item, category: c.title }))
);

export default faqCategories;
