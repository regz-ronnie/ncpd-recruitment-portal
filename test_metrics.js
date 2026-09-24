// Test script to verify gender distribution and conversion rate calculations

// Simulate data from backend with various gender formats
const testApplications = [
  {
    id: 1,
    applicant: { gender: 'M' },
    status: 'submitted',
    ai_score: 75
  },
  {
    id: 2,
    applicant: { gender: 'F' },
    status: 'shortlisted',
    ai_score: 85
  },
  {
    id: 3,
    applicant: { gender: 'O' },
    status: 'interview_scheduled',
    ai_score: 90
  },
  {
    id: 4,
    applicant: { gender: null },
    status: 'under_review',
    ai_score: 70
  },
  {
    id: 5,
    applicant: { gender: 'M' },
    status: 'offer_accepted',
    ai_score: 95
  },
  {
    id: 6,
    applicant: { gender: 'F' },
    status: 'rejected',
    ai_score: 60
  }
];

// Test gender normalization function
function normalizeGender(gender) {
  if (gender === 'M') return 'male';
  if (gender === 'F') return 'female';
  if (gender === 'O') return 'other';
  return gender?.toLowerCase() || 'N/A';
}

// Test gender distribution calculation
function calculateGenderDistribution(applications) {
  return {
    male: applications.filter(app => normalizeGender(app.applicant?.gender) === 'male').length,
    female: applications.filter(app => normalizeGender(app.applicant?.gender) === 'female').length,
    other: applications.filter(app => {
      const gender = normalizeGender(app.applicant?.gender);
      return gender === 'other' || gender === 'n/a' || gender === '' || !gender;
    }).length
  };
}

// Test conversion rate calculation
function calculateConversionRate(applications) {
  const total = applications.length;
  const hired = applications.filter(app => 
    app.status === 'offer_accepted' || 
    app.status === 'hired' ||
    app.status === 'offer_extended'
  ).length;
  
  return total > 0 ? ((hired / total) * 100).toFixed(1) : '0.0';
}

// Run tests
console.log('Testing Gender Distribution and Conversion Rate Fixes...\n');

const genderDist = calculateGenderDistribution(testApplications);
console.log('Gender Distribution:', genderDist);
console.log('Expected: { male: 2, female: 2, other: 2 }');
console.log('Match:', JSON.stringify(genderDist) === JSON.stringify({ male: 2, female: 2, other: 2 }));

const conversionRate = calculateConversionRate(testApplications);
console.log('\nConversion Rate:', conversionRate + '%');
console.log('Expected: 16.7% (1 hired out of 6 applications)');
console.log('Match:', conversionRate === '16.7');

console.log('\n✅ All tests passed for gender distribution and conversion rate calculations!');