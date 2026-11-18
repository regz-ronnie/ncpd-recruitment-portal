import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { faqCategories, allQuestions, contactInfo } from "../data/faq";

export function FAQ() {
  const [openCategories, setOpenCategories] = useState({ "getting-started": true });
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return null;
    return allQuestions.filter(
      (item) =>
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [query]);

  const toggleCategory = (id) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-ncpd-primary via-emerald-800 to-emerald-900 text-white">
        <div className="responsive-container py-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <QuestionMarkCircleIcon className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-emerald-100/90">
            Everything you need to know about creating an account, completing
            your profile, and applying for NCPD positions.
          </p>

          <div className="relative mx-auto mt-8 max-w-xl">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-200" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions, e.g. password, CV, application status…"
              className="w-full rounded-full border border-white/25 bg-white/10 py-3 pl-12 pr-4 text-white placeholder-emerald-100/70 backdrop-blur focus:border-white/60 focus:bg-white/15 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="responsive-container py-10">
        {filtered ? (
          <section className="mx-auto max-w-4xl">
            <p className="mb-4 text-sm text-gray-500">
              {filtered.length} result{filtered.length === 1 ? "" : "s"} for &quot;
              {search.trim()}&quot;
            </p>
            {filtered.length === 0 ? (
              <div className="card p-10 text-center">
                <QuestionMarkCircleIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                <p className="font-medium text-gray-700">
                  No matching questions found.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Try different keywords or contact the recruitment team below.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item, i) => (
                  <article key={i} className="card p-5">
                    <span className="mb-2 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ncpd-primary">
                      {item.category}
                    </span>
                    <h3 className="font-semibold text-gray-900">{item.q}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {item.a}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            {faqCategories.map((category) => (
              <article key={category.id} className="card overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
                  aria-expanded={!!openCategories[category.id]}
                >
                  <h2 className="text-base font-semibold text-gray-900">
                    {category.title}
                  </h2>
                  <ChevronDownIcon
                    className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${
                      openCategories[category.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openCategories[category.id] && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <dl className="space-y-4">
                      {category.questions.map((item, index) => (
                        <div key={index}>
                          <dt className="text-sm font-semibold text-gray-900">
                            {item.q}
                          </dt>
                          <dd className="mt-1 text-sm leading-relaxed text-gray-600">
                            {item.a}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}

        <section className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
            <h3 className="font-semibold text-emerald-900">
              Do I need an account to view vacancies?
            </h3>
            <p className="mt-1 text-sm text-emerald-800/80">
              Yes. Vacancies and vacancy details require you to be logged in.
              Register or sign in to browse openings.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
            <h3 className="font-semibold text-emerald-900">
              Is registration free?
            </h3>
            <p className="mt-1 text-sm text-emerald-800/80">
              Yes. Creating an account and applying for positions on the portal
              is completely free.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-ncpd-primary to-emerald-700 text-white shadow-lg">
            <div className="grid gap-6 p-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-8 w-8 text-emerald-200" />
                  <h2 className="text-xl font-bold">Still need help?</h2>
                </div>
                <p className="mt-2 max-w-xl text-sm text-emerald-100/90">
                  Our recruitment support team is available during office hours.
                  You can also chat with us directly from your dashboard.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <a
                    href={contactInfo.emailHref}
                    className="inline-flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                    {contactInfo.email}
                  </a>
                  <a
                    href={contactInfo.phoneHref}
                    className="inline-flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <PhoneIcon className="h-4 w-4" />
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-ncpd-primary shadow transition hover:bg-emerald-50"
                >
                  <UserIcon className="h-4 w-4" />
                  Contact Support
                </Link>
                <Link
                  to="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  Chat with Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
