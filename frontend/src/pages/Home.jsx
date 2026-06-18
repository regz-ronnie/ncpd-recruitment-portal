import React from 'react'
import { Link } from 'react-router-dom'

export function Home() {
  const featuredVacancies = [
    {
      reference: 'VN00971',
      title: 'Program Assistant - Nairobi',
      type: 'Contract',
      positions: 1,
      deadline: '06/15/26 • 5:00 PM',
      grade: 'KMR 06',
      status: 'Active',
      id: 1,
    },
    {
      reference: 'VN00972',
      title: 'Research Intern',
      type: 'Internship',
      positions: 2,
      deadline: '06/15/26 • 5:00 PM',
      grade: 'KMR 05',
      status: 'Active',
      id: 2,
    },
    {
      reference: 'VN00973',
      title: 'Assistant Research Officer - Kisumu',
      type: 'Contract',
      positions: 1,
      deadline: '06/14/26 • 2:00 PM',
      grade: 'KMR 07',
      status: 'Active',
      id: 3,
    },
  ]

  return (
    <div className="bg-slate-50 min-h-screen">
      <section
        className="relative overflow-hidden bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 102, 51, 0.82), rgba(0, 119, 60, 0.38)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#006633]/90 via-[#008044]/40 to-[#00331a]/90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.32em] text-white/90">NCPD Careers</p>
            <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
              National Council for Population and Development
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-100/90">
              Apply for advertised career opportunities that support sustainable population and development across Kenya.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/vacancies"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#006633] shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-100"
              >
                View Vacancies
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-3xl bg-ncpd-light border border-ncpd-primary px-6 py-5 text-center text-sm sm:text-base text-ncpd-primary shadow-sm">
          <span className="font-semibold">NCPD invites all qualified applicants to apply for the following advertised career opportunities!</span>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-sm font-semibold text-white">
          <Link
            to="/vacancies"
            className="rounded-3xl bg-ncpd-primary px-5 py-6 hover:bg-ncpd-secondary transition-colors"
          >
            Active Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="rounded-3xl bg-ncpd-accent px-5 py-6 hover:bg-[#009759] transition-colors"
          >
            Contract Job Vacancies
          </Link>
          <Link
            to="/vacancies"
            className="rounded-3xl bg-[#004d26] px-5 py-6 hover:bg-[#00331a] transition-colors"
          >
            Permanent & Pensionable Job Vacancies
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Reference</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Title/Designation</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Employment Type</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Positions</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Application Deadline</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Job Grade</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-4 text-left font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {featuredVacancies.map((vacancy, index) => (
                  <tr key={vacancy.reference} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="px-4 py-4 text-slate-700 font-medium">{vacancy.reference}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.title}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.type}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.positions}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.deadline}</td>
                    <td className="px-4 py-4 text-slate-700">{vacancy.grade}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {vacancy.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <Link
                        to="/vacancies"
                        className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/apply/${vacancy.id}`}
                        className="inline-flex items-center rounded-full bg-ncpd-primary px-3 py-1 text-xs font-semibold text-white hover:bg-ncpd-secondary transition-colors"
                      >
                        Apply Now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
