import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserCircleIcon,
  BriefcaseIcon,
  PaperAirplaneIcon,
  ClipboardDocumentListIcon,
  PaperClipIcon,
  MegaphoneIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'
import { faqCategories, allQuestions, contactInfo } from '../data/faq'

const steps = [
  {
    icon: UserPlusIcon,
    title: 'Create your account',
    description:
      'Click "Register" in the top navigation and fill in your details. Registration is free and takes only a few minutes.',
    link: '/register',
    linkLabel: 'Register now',
  },
  {
    icon: UserCircleIcon,
    title: 'Complete your profile',
    description:
      'Under "My Profile", add your personal details, academic qualifications, work experience, three referees, documents (CV, national ID, KRA PIN), and sign the declaration.',
    link: '/my-profile',
    linkLabel: 'Go to My Profile',
  },
  {
    icon: BriefcaseIcon,
    title: 'Browse vacancies',
    description:
      'Open "Job Vacancies" from your dashboard sidebar to see all open positions and read the full job descriptions and requirements.',
    link: '/vacancies',
    linkLabel: 'View vacancies',
  },
  {
    icon: PaperAirplaneIcon,
    title: 'Apply & track',
    description:
      'Click "Apply" on a vacancy you qualify for, submit your application, then follow its progress under "My Applications".',
    link: '/my-applications',
    linkLabel: 'My Applications',
  },
]

const features = [
  {
    icon: ClipboardDocumentListIcon,
    title: 'My Applications',
    description: 'Track the status of every application you have submitted.',
    link: '/my-applications',
  },
  {
    icon: PaperClipIcon,
    title: 'Attachments',
    description: 'Store and manage your uploaded documents in one place.',
    link: '/attachments',
  },
  {
    icon: MegaphoneIcon,
    title: 'Announcements',
    description: 'Read official notices and updates from NCPD recruitment.',
    link: '/announcements',
  },
  {
    icon: ArrowDownTrayIcon,
    title: 'Downloads',
    description: 'Access portal resources and downloadable documents.',
    link: '/downloads',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Chat with Us',
    description: 'Message the recruitment team directly from your dashboard.',
    link: '/chat',
  },
  {
    icon: BookOpenIcon,
    title: 'User Guide',
    description: 'This page — answers to common questions and how-to guides.',
    link: '/help',
  },
]

export function Help() {
  const [search, setSearch] = useState('')
  const [openItems, setOpenItems] = useState({ 'getting-started': true })

  const query = search.trim().toLowerCase()

  const results = useMemo(() => {
    if (!query) return null
    return allQuestions.filter(
      (item) =>
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    )
  }, [query])

  const toggle = (id) =>
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ncpd-primary via-emerald-800 to-emerald-900 text-white">
        <div className="responsive-container py-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <BookOpenIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-100/90">
            Step-by-step guides and answers to common questions about the NCPD
            E-Recruitment Portal.
          </p>
        </div>
      </section>

      <div className="responsive-container py-10 space-y-12">
        {/* Getting started steps */}
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
            <p className="mt-1 text-gray-500">
              Four steps from registration to tracking your application.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="card relative flex flex-col p-5 transition-shadow hover:shadow-md"
                >
                  <span className="absolute right-4 top-4 text-3xl font-bold text-emerald-100">
                    {i + 1}
                  </span>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-ncpd-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                  <Link
                    to={step.link}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ncpd-primary hover:text-emerald-700"
                  >
                    {step.linkLabel}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Portal features */}
        <section>
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Inside your dashboard</h2>
            <p className="mt-1 text-gray-500">
              Everything available to registered applicants.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="card group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-ncpd-primary transition-colors group-hover:bg-ncpd-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Frequently asked questions</h2>
            <p className="mt-1 text-gray-500">
              Quick answers about accounts, profiles, and applications.
            </p>

            <div className="relative mx-auto mt-6 max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help topics…"
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm focus:border-ncpd-primary focus:outline-none focus:ring-1 focus:ring-ncpd-primary"
              />
            </div>
          </div>

          {results ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {results.length} result{results.length === 1 ? '' : 's'} for "{search.trim()}"
              </p>
              {results.length === 0 ? (
                <div className="card p-8 text-center text-gray-500">
                  No matching topics. Try different keywords or contact support below.
                </div>
              ) : (
                results.map((item, i) => (
                  <div key={i} className="card p-5">
                    <span className="mb-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ncpd-primary">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-gray-900">{item.q}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{item.a}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {faqCategories.map((category) => (
                <div key={category.id} className="card overflow-hidden">
                  <button
                    onClick={() => toggle(category.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                    aria-expanded={!!openItems[category.id]}
                  >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-ncpd-primary" />
                      {category.title}
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        openItems[category.id] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openItems[category.id] && (
                    <div className="space-y-3 border-t border-gray-100 px-4 pb-4 pt-3">
                      {category.questions.map((item, index) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium text-gray-900">{item.q}</p>
                          <p className="mt-0.5 leading-relaxed text-gray-600">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-ncpd-primary to-emerald-700 text-white shadow-lg">
            <div className="grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="text-xl font-bold">Contact recruitment support</h2>
                <p className="mt-2 max-w-xl text-sm text-emerald-100/90">
                  Our team is available on weekdays during office hours.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <a href={contactInfo.emailHref} className="flex items-center gap-2 text-emerald-100 hover:text-white">
                    <EnvelopeIcon className="h-4 w-4" /> {contactInfo.email}
                  </a>
                  <a href={contactInfo.phoneHref} className="flex items-center gap-2 text-emerald-100 hover:text-white">
                    <PhoneIcon className="h-4 w-4" /> {contactInfo.phone}
                  </a>
                  <p className="flex items-center gap-2 text-emerald-100/80">
                    <ClockIcon className="h-4 w-4" /> {contactInfo.hours}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ncpd-primary shadow transition hover:bg-emerald-50"
                >
                  Contact form
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Chat with us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
