/**
 * Seed database with sample job postings
 * Run in browser console: seedAllJobs()
 */
import { jobsAPI } from '../services/api'

const sampleJobs = [
  {
    title: 'Senior Software Engineer',
    description: 'We are looking for an experienced Senior Software Engineer to join our team. You should have expertise in full-stack development with React and Django. Responsibilities include designing and implementing scalable systems, mentoring junior developers, and contributing to architectural decisions.',
    company: 'NCPD Tech Solutions',
    location: 'Lagos, Nigeria',
    salary_range: '₦2,000,000 - ₦3,500,000',
    job_type: 'Full-time',
    experience_level: 'Senior',
    required_skills: 'React, Django, Python, JavaScript, PostgreSQL',
    application_deadline: '2026-08-31',
  },
  {
    title: 'Frontend Developer',
    description: 'Looking for a talented Frontend Developer to build beautiful and responsive user interfaces. You will work with React, Tailwind CSS, and modern JavaScript. Experience with component design and UI/UX best practices is essential.',
    company: 'Digital Innovations Ltd',
    location: 'Remote',
    salary_range: '₦1,200,000 - ₦2,000,000',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    required_skills: 'React, JavaScript, CSS, Tailwind, HTML',
    application_deadline: '2026-08-15',
  },
  {
    title: 'Backend Developer - Django',
    description: 'Seeking a Backend Developer with strong Django experience to build robust APIs and scalable backends. You will work on RESTful APIs, database optimization, and cloud deployment. Experience with PostgreSQL and Docker is a plus.',
    company: 'Cloud Systems Nigeria',
    location: 'Abuja, Nigeria',
    salary_range: '₦1,500,000 - ₦2,500,000',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    required_skills: 'Django, Python, PostgreSQL, REST APIs, Docker',
    application_deadline: '2026-08-20',
  },
  {
    title: 'Data Scientist',
    description: 'Join our team as a Data Scientist and work on cutting-edge AI and machine learning projects. You will build models, analyze large datasets, and provide insights to drive business decisions. Experience with Python, TensorFlow, and big data tools is required.',
    company: 'AI Research Hub',
    location: 'Lagos, Nigeria',
    salary_range: '₦2,200,000 - ₦3,800,000',
    job_type: 'Full-time',
    experience_level: 'Senior',
    required_skills: 'Python, Machine Learning, TensorFlow, SQL, Data Analysis',
    application_deadline: '2026-08-25',
  },
  {
    title: 'UX/UI Designer',
    description: 'We are looking for a creative UX/UI Designer to design intuitive and beautiful user interfaces. You will work on web and mobile applications, conduct user research, and collaborate with developers. Portfolio is required.',
    company: 'Design Studio Africa',
    location: 'Remote',
    salary_range: '₦1,000,000 - ₦1,800,000',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    required_skills: 'Figma, UI/UX Design, Prototyping, User Research',
    application_deadline: '2026-08-28',
  },
  {
    title: 'DevOps Engineer',
    description: 'Seeking a DevOps Engineer to manage infrastructure, CI/CD pipelines, and cloud deployments. You will work with AWS, Docker, Kubernetes, and Terraform. Strong understanding of scalability and security is essential.',
    company: 'Infrastructure Pro',
    location: 'Lagos, Nigeria',
    salary_range: '₦1,800,000 - ₦3,000,000',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    required_skills: 'AWS, Docker, Kubernetes, CI/CD, Terraform',
    application_deadline: '2026-08-22',
  },
]

export async function seedAllJobs() {
  console.log('🌱 Starting to seed jobs...')

  try {
    // First, fetch existing jobs to check if we already have data
    const existingJobs = await jobsAPI.getJobs()
    console.log(`Found ${existingJobs.data.count || 0} existing jobs`)

    if (existingJobs.data.count > 0) {
      console.log('✓ Jobs already exist in database. Skipping seed.')
      return existingJobs.data
    }

    // Create each sample job
    const createdJobs = []
    for (const jobData of sampleJobs) {
      try {
        const response = await jobsAPI.createJob(jobData)
        createdJobs.push(response)
        console.log(`✓ Created job: ${jobData.title} (ID: ${response.id})`)
      } catch (error) {
        console.error(`✗ Failed to create job: ${jobData.title}`, error.response?.data || error.message)
      }
    }

    console.log(`\n✅ Seed complete! Created ${createdJobs.length} jobs`)
    return createdJobs
  } catch (error) {
    console.error('❌ Error during seed:', error)
    throw error
  }
}

export async function clearAllJobs() {
  console.log('🗑️ Clearing all jobs...')
  try {
    const jobs = await jobsAPI.getJobs()
    for (const job of jobs.data.results || []) {
      try {
        await jobsAPI.deleteJob(job.id)
        console.log(`✓ Deleted job: ${job.title}`)
      } catch (error) {
        console.error(`✗ Failed to delete job ${job.id}:`, error.message)
      }
    }
    console.log('✅ All jobs cleared')
  } catch (error) {
    console.error('❌ Error clearing jobs:', error)
  }
}

// Auto-seed on app start if no jobs exist
export async function initializeJobsIfEmpty() {
  try {
    const response = await jobsAPI.getJobs()
    if (response.data.count === 0) {
      console.log('📊 No jobs found. Auto-seeding database...')
      await seedAllJobs()
    }
  } catch (error) {
    console.warn('Could not auto-seed jobs:', error.message)
  }
}
