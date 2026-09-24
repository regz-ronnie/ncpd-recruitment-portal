# HR Dashboard Candidate Section Fixes

## Issues Fixed

### 1. Position Dropdown Not Showing Vacancies
**Problem**: The position dropdown was using `jobs` data instead of `vacancies`, and not showing posted job positions.

**Fix**:
- Changed data source from `jobs` to `vacancies` 
- Updated selector to use `selectedVacancyId` instead of `selectedJob`
- Now displays: `{vacancy.title} ({vacancy.positions} positions)`

**Before**:
```javascript
const { data: jobs } = useJobs()
{jobs?.map(job => (
  <option key={job.id} value={job.id}>
    {job.title} ({job.applications?.length || 0})
  </option>
))}
```

**After**:
```javascript
const { data: vacancies } = useQuery('hr-vacancies', ...)
{vacancies?.map(vacancy => (
  <option key={vacancy.id} value={vacancy.id}>
    {vacancy.title} ({vacancy.positions || 1} positions)
  </option>
))}
```

### 2. Age Filter Not Working Properly
**Problem**: Age was not being calculated correctly from date of birth.

**Fix**:
- Added proper age calculation from `date_of_birth` field
- Added validation: minimum age 18, maximum age 65
- Enhanced user feedback with age range hints

**Implementation**:
```javascript
// Age calculation in data normalization
age: applicant.date_of_birth ? (() => {
  const dob = new Date(applicant.date_of_birth)
  const today = new Date()
  return today.getFullYear() - dob.getFullYear() - 
    ((today.getMonth() < dob.getMonth() || 
     (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0)
})() : null

// Filter logic
if (filters.ageValue) {
  const dob = app.date_of_birth || app.applicant?.date_of_birth
  if (dob) {
    const birthDate = new Date(dob)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear() - 
      ((today.getMonth() < birthDate.getMonth() || 
       (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0)
    
    if (filters.ageOperator === 'gte' && age < parseInt(filters.ageValue)) return false
    if (filters.ageOperator === 'lte' && age > parseInt(filters.ageValue)) return false
  }
}
```

### 3. Experience Filter Not Detecting Months
**Problem**: Experience filter only handled whole years, not fractional values for months.

**Fix**:
- Changed input type to accept decimal values (`step="0.1"`)
- Updated filter logic to use `parseFloat()` instead of `parseInt()`
- Added helpful text: "Enter years (e.g., 2.5 for 2 years 6 months)"

**Implementation**:
```javascript
// Updated input
<input
  type="number"
  placeholder="Years"
  step="0.1"
  min="0"
  value={filters.experienceValue}
  onChange={(e) => setFilters({...filters, experienceValue: e.target.value})}
/>

// Updated filter logic
if (filters.experienceValue) {
  const experience = parseFloat(app.experience_years) || 0
  const requiredExperience = parseFloat(filters.experienceValue)
  if (filters.experienceOperator === 'gte' && experience < requiredExperience) return false
  if (filters.experienceOperator === 'lte' && experience > requiredExperience) return false
}
```

### 4. County Dropdown Not Showing All Kenyan Counties
**Problem**: County dropdown only showed counties from existing data, not all 47 Kenyan counties.

**Fix**:
- Created `KENYAN_COUNTIES` constant with all 47 Kenyan counties
- Updated county dropdown to use the complete list
- Made county filtering case-insensitive

**New File**: `frontend/src/data/kenyanCounties.js`
```javascript
export const KENYAN_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo",
  "Meru", "Tharaka Nithi", "Embu", "Kitui",
  "Machakos", "Makueni",
  "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu",
  "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu",
  "Elgeyo Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado",
  "Kericho", "Bomet",
  "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira",
  "Nairobi"
].sort()
```

**Updated Dropdown**:
```javascript
<select
  value={filters.county}
  onChange={(e) => setFilters({...filters, county: e.target.value})}
>
  <option value="all">All Counties</option>
  {KENYAN_COUNTIES.map(county => (
    <option key={county} value={county}>{county}</option>
  ))}
</select>
```

## Files Modified

1. **`frontend/src/pages/HRDashboard.jsx`**:
   - Added import for `KENYAN_COUNTIES`
   - Fixed position dropdown to use vacancies
   - Enhanced age filter with proper calculation and validation
   - Updated experience filter to handle decimal values
   - Replaced county dropdown with full Kenyan counties list
   - Made county filtering case-insensitive
   - Removed unused `selectedJob` state

2. **`frontend/src/services/api.js`**:
   - Added age calculation in `normalizeApplicationRecord`
   - Added age calculation in `normalizeUserRecord`
   - Enhanced date of birth handling

3. **`frontend/src/data/kenyanCounties.js`** (New):
   - Complete list of all 47 Kenyan counties
   - Sorted alphabetically for easy selection

## Additional Improvements

### Enhanced User Experience
- Added helpful hints for age and experience filters
- Better validation ranges (age: 18-65, experience: 0+)
- Clear error handling for missing data

### Data Consistency
- All filters now properly handle missing/optional fields
- Case-insensitive filtering for better user experience
- Proper decimal handling for fractional years

### Performance
- Efficient filtering logic that short-circuits on missing data
- No unnecessary calculations when data is unavailable

## Testing Recommendations

1. **Position Dropdown**: Verify that all posted vacancies appear and selecting one filters applications correctly
2. **Age Filter**: Test with various age values and operators (≥, ≤)
3. **Experience Filter**: Test with decimal values like 2.5, 1.8, etc.
4. **County Filter**: Ensure all 47 counties appear and filtering works correctly
5. **Edge Cases**: Test with applicants missing date of birth or experience data

## Expected Results

After these fixes, the candidate section should:
- ✅ Show all posted job vacancies in the position dropdown
- ✅ Properly calculate and filter by age from date of birth
- ✅ Accept and filter by fractional experience values (e.g., 2.5 years)
- ✅ Display all 47 Kenyan counties for selection
- ✅ Handle missing data gracefully without breaking the UI