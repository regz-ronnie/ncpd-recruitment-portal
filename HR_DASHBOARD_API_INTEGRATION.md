# HR Dashboard API Integration Summary

## Current Status: ✅ Real Data Fetching from Database

The HR dashboard is **already properly configured** to fetch real data from the database via the API. Here's the complete data flow:

## API Configuration

### Backend API Endpoints
- **Base URL**: `http://localhost:8000/api/v1/`
- **HR Endpoints**: Registered in `backend/apps/recruitment/hr_urls.py`
- **Authentication**: JWT token-based authentication via `api.js` interceptors

### Key HR API Endpoints
```javascript
// From frontend/src/services/api.js
export const hrAPI = {
  // Application management
  listApplications: async (params = {}) => api.get('/hr/applications/', { params }),
  getApplication: (id) => api.get(`/hr/applications/${id}/`),
  updateApplication: async (id, data) => api.put(`/hr/applications/${id}/`, data),
  
  // Vacancy management
  listVacancies: (params = {}) => api.get('/hr/vacancies/', { params }),
  getVacancy: (id) => api.get(`/hr/vacancies/${id}/`),
  
  // User management
  listUsers: async (params = {}) => api.get('/hr/users/', { params }),
}
```

## Data Flow Architecture

### 1. HR Dashboard Data Fetching
```javascript
// In HRDashboard.jsx
const { data: applicationsPayload, isLoading: appsLoading, refetch: refetchApps } = useQuery(
  'hr-applications',
  async () => {
    const res = await hrAPI.listApplications()
    console.log('HR Applications raw response:', res.data)
    const normalized = normalizeApplicationList(res.data)
    console.log('HR Applications normalized:', normalized)
    return normalized
  },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  }
)
```

### 2. Backend QuerySet Logic
```python
# In backend/apps/recruitment/views.py
class ApplicationViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        """Users can only see their own applications, HR staff can see all"""
        user = self.request.user
        user_type = getattr(user, 'user_type', None)
        
        if user_type in ['hr', 'manager', 'admin']:
            return Application.objects.all()  # HR sees all applications
        return Application.objects.filter(applicant=user)  # Regular users see only theirs
```

### 3. Data Normalization
```javascript
// In frontend/src/services/api.js
export const normalizeApplicationRecord = (application) => {
  // Handles both snake_case and camelCase field names
  // Extracts applicant data from nested objects
  // Provides consistent data structure for frontend
  return {
    id: application.id,
    applicant_name: /* ... */,
    job_title: /* ... */,
    status: /* ... */,
    ai_score: /* ... */,
    // ... other fields
  }
}
```

## Real-Time Data Sources

### Applications Data
- **Source**: `Application` model in database
- **Endpoint**: `GET /api/v1/hr/applications/`
- **Permissions**: HR staff can see all applications
- **Filtering**: By status, priority, job
- **Caching**: 5 minutes stale time

### Vacancies Data
- **Source**: `JobPost` model in database
- **Endpoint**: `GET /api/v1/hr/vacancies/`
- **Data**: Job listings, requirements, deadlines
- **Status**: Published, draft, closed, archived

### Users Data
- **Source**: `User` model (custom AbstractUser)
- **Endpoint**: `GET /api/v1/hr/users/`
- **Fallback**: Falls back to `/api/v1/users/` if HR endpoint unavailable
- **Data**: Applicant profiles, qualifications, experience

### Talent Pool Data
- **Source**: `Application` model (filtered)
- **Endpoint**: `GET /api/v1/hr/talent-pool/`
- **Usage**: Historical candidate data for future positions

## Authentication Flow

### 1. Token Management
```javascript
// In api.js - Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && !isPublicEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 2. Token Refresh
```javascript
// In api.js - Response interceptor
if (error.response?.status === 401) {
  // Attempt token refresh
  const refreshResponse = await axios.post(`${API_BASE_URL}auth/token/refresh/`, {
    refresh: refreshToken
  })
  // Retry original request with new token
}
```

## URL Routing Configuration

### Backend URLs
```python
# In backend/ncpd_portal/urls.py
urlpatterns = [
    path('api/v1/', include(('apps.recruitment.urls', 'recruitment'), namespace='recruitment-v1')),
    path('api/hr/', include(('apps.recruitment.hr_urls', 'hr'), namespace='hr')),
    path('api/v1/hr/', include(('apps.recruitment.hr_urls', 'hr'), namespace='hr-v1')),
]
```

### HR Router Registration
```python
# In backend/apps/recruitment/hr_urls.py
router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='hr-application')
router.register(r'vacancies', JobPostViewSet, basename='hr-vacancy')
router.register(r'users', HRUserListView, basename='hr-user')
```

## Data Fetching Features

### 1. React Query Integration
- **Caching**: Automatic caching with 5-minute stale time
- **Refetching**: Manual refetch capability via `refetchApps`
- **Loading States**: Built-in loading states
- **Error Handling**: Automatic error handling and retry

### 2. Real-Time Updates
- **Auto-refresh**: 5-minute cache expiration
- **Manual refresh**: Refresh buttons in UI
- **Invalidate queries**: Automatic cache invalidation on updates

### 3. Error Handling
```javascript
// Fallback endpoints in hrAPI
listApplications: async (params = {}) => {
  try {
    return await api.get('/hr/applications/', { params })
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 405) {
      return api.get('/applications/', { params })  // Fallback
    }
    throw error
  }
}
```

## Console Logging for Debugging

The system includes comprehensive logging:
```javascript
console.log('API Base URL:', API_BASE_URL)
console.log('API Response:', response.config.url, response.data)
console.log('HR Applications raw response:', res.data)
console.log('HR Applications normalized:', normalized)
```

## Database Models Used

### Application Model
- Fields: `ai_score`, `skill_match_score`, `experience_match_score`, etc.
- Relations: `job` (JobPost), `applicant` (User)
- Status tracking: submitted, screening, shortlisted, etc.

### JobPost Model
- Fields: `title`, `description`, `requirements`, `skills_required`
- Status: draft, published, closed, archived
- Auto-screening: `auto_screening` boolean flag

### User Model
- Custom AbstractUser with recruitment-specific fields
- Education, experience, qualifications stored as JSON
- Profile completion tracking

## Verification Steps

### 1. Backend Server
✅ Django development server runs on port 8000
✅ System checks pass with no issues
✅ HR endpoints are properly registered

### 2. API Endpoints
✅ HR endpoints require authentication (as expected)
✅ Fallback endpoints configured for compatibility
✅ Data normalization handles field name variations

### 3. Frontend Integration
✅ React Query properly configured
✅ API interceptors handle authentication
✅ Error handling with fallback endpoints
✅ Loading states and error states implemented

## Current Data Flow Summary

```
Database (PostgreSQL/SQLite)
    ↓
Django Models (Application, JobPost, User)
    ↓
Django ViewSets (ApplicationViewSet, JobPostViewSet)
    ↓
Django Serializers (ApplicationSerializer, JobPostSerializer)
    ↓
REST API Endpoints (/api/v1/hr/applications/)
    ↓
Axios HTTP Client (with auth interceptors)
    ↓
React Query (caching, loading states)
    ↓
HR Dashboard Component (normalized data)
    ↓
UI Display (tables, cards, filters)
```

## Conclusion

The HR dashboard is **fully integrated** with the database and fetches real data through properly configured API endpoints. The system includes:

- ✅ Real-time data fetching from database
- ✅ Proper authentication and authorization
- ✅ Data normalization for consistent frontend structure
- ✅ Error handling with fallback endpoints
- ✅ Caching and performance optimization
- ✅ Comprehensive logging for debugging
- ✅ HR-specific permissions and access control

No additional configuration is needed for the HR dashboard to fetch real data from the database.