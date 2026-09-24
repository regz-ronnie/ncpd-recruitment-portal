import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { adminAPI, normalizeUserRecord } from '../services/api.js'

import { useAuth } from '../contexts/AuthContext.jsx'

import { Plus, Pencil, Trash2, User, Search, CheckCircle, XCircle, X } from 'lucide-react'



const userTypeOptions = [

  { value: 'applicant', label: 'Applicant' },

  { value: 'hr', label: 'HR Staff' },

  { value: 'admin', label: 'Admin' },

]



const userTypeLabels = {

  applicant: 'Applicant',

  hr: 'HR Staff',

  admin: 'Admin',

  manager: 'Manager',

  panel_member: 'Panel Member',

}



// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return '—'
  }
}



export function AdminUserManagement() {

  const { user } = useAuth()

  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')

  const [editingUser, setEditingUser] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({

    email: '',

    first_name: '',

    last_name: '',

    user_type: 'applicant',

    password: '',

    password_confirm: '',

    is_active: true,

    is_staff: false,

    is_superuser: false,

  })



  useEffect(() => {

    loadUsers()

  }, [])



  const loadUsers = async () => {

    setIsLoading(true)

    try {

      const response = await adminAPI.listUsers()

      // API may return a paginated object { results: [...] } or an array directly

      const usersPayload = response.data

      const usersList = Array.isArray(usersPayload)

        ? usersPayload

        : (usersPayload && (usersPayload.results || usersPayload.data)) || []

      // Debug: Log the first user to see the actual structure
      console.log('First user from API:', usersList[0])

      // Normalize each user record to ensure date fields are properly mapped
      const normalizedUsers = usersList.map(user => normalizeUserRecord(user))

      // Debug: Log the normalized first user
      console.log('First normalized user:', normalizedUsers[0])

      setUsers(normalizedUsers)

      setError('')

    } catch (err) {

      setError('Unable to load users. Please ensure you are an admin.')

    } finally {

      setIsLoading(false)

    }

  }



  const handleEdit = (userToEdit) => {

    setEditingUser(userToEdit)

    setFormData({

      email: userToEdit.email || '',

      first_name: userToEdit.first_name || '',

      last_name: userToEdit.last_name || '',

      user_type: userToEdit.user_type || 'applicant',

      password: '',

      password_confirm: '',

      is_active: userToEdit.is_active,

      is_staff: userToEdit.is_staff,

      is_superuser: userToEdit.is_superuser,

    })

    setIsModalOpen(true)

  }



  const handleDelete = async (id) => {

    if (!window.confirm('Delete this user permanently?')) return

    try {

      await adminAPI.deleteUser(id)

      setUsers(users.filter((item) => item.id !== id))

    } catch (err) {

      setError('Failed to delete user.')

    }

  }



  const handleChange = (e) => {

    const { name, value, type, checked } = e.target

    setFormData((prev) => ({

      ...prev,

      [name]: type === 'checkbox' ? checked : value,

    }))

  }



  const handleSubmit = async (e) => {

    e.preventDefault()

    setError('')



    if (formData.password && formData.password !== formData.password_confirm) {

      setError('Passwords do not match.')

      return

    }



    try {

      const payload = {

        email: formData.email,

        first_name: formData.first_name,

        last_name: formData.last_name,

        user_type: formData.user_type,

        password: formData.password,

        password_confirm: formData.password_confirm,

        is_active: formData.is_active,

        is_staff: formData.is_staff,

        is_superuser: formData.is_superuser,

      }



      if (editingUser && editingUser.id) {

        await adminAPI.updateUser(editingUser.id, payload)

      } else {

        await adminAPI.createUser(payload)

      }



      setEditingUser(null)

      setFormData({

        email: '',

        first_name: '',

        last_name: '',

        user_type: 'applicant',

        password: '',

        password_confirm: '',

        is_active: true,

        is_staff: false,

        is_superuser: false,

      })

      setIsModalOpen(false)

      await loadUsers()

    } catch (err) {

      setError('Unable to save user. Please check the form fields.')

    }

  }



  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {

    const term = searchTerm.toLowerCase()

    return (

      u.email?.toLowerCase().includes(term) ||

      u.first_name?.toLowerCase().includes(term) ||

      u.last_name?.toLowerCase().includes(term) ||

      u.user_type?.toLowerCase().includes(term)

    )

  })



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6">

      <div className="w-full px-4 sm:px-6 lg:px-8">

        <div className="mb-6">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-6">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Admin Control</p>

              <h1 className="mt-1 text-4xl font-bold text-slate-900">User Management</h1>

              <p className="mt-2 text-sm text-slate-600 max-w-2xl">

                Manage all portal users from a secure admin console. Create, update, and delete accounts without using HR or applicant dashboards.

              </p>

            </div>

            <button

              type="button"

              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:from-slate-800 hover:to-slate-700 transition-all duration-200 hover:scale-105"

              onClick={() => {
                setEditingUser(null)
                setFormData({
                  email: '',
                  first_name: '',
                  last_name: '',
                  user_type: 'applicant',
                  password: '',
                  password_confirm: '',
                  is_active: true,
                  is_staff: false,
                  is_superuser: false,
                })
                setIsModalOpen(true)
              }}

            >

              <Plus className="h-4 w-4" />

              Add User

            </button>

          </div>

        </div>



        <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1">

          <div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between mb-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-900">User Accounts</h2>

                <p className="mt-1 text-sm text-slate-500">Search and manage existing accounts from a wider desktop view.</p>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 focus-within:ring-2 focus-within:ring-slate-500 focus-within:border-transparent transition-all">

                  <Search className="h-5 w-5 text-slate-500" />

                  <input

                    type="text"

                    value={searchTerm}

                    onChange={(e) => setSearchTerm(e.target.value)}

                    placeholder="Search users..."

                    className="w-full min-w-[200px] bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400"

                  />

                </div>

              </div>

            </div>



            {isLoading ? (

              <div className="py-10 text-center text-slate-500">Loading users…</div>

            ) : (

              <div className="overflow-x-auto">

                {filteredUsers.length === 0 ? (

                  <div className="border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">

                    <div className="flex flex-col items-center gap-3">
                      <User className="h-12 w-12 text-slate-300" />
                      <p>No users found.</p>
                    </div>

                  </div>

                ) : (
                  <table className="min-w-full divide-y divide-slate-200 bg-white">
                    <thead className="bg-slate-50">
                      <tr>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Username</th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Email</th>

                        <th className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">First</th>

                        <th className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Last</th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Role</th>

                        <th className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Resume</th>

                        <th className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Attachments</th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Active</th>

                        <th className="hidden lg:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Staff</th>

                        <th className="hidden lg:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Superuser</th>

                        <th className="hidden xl:table-cell whitespace-nowrap px-4 py-3 text-left text-[10px] sm:text-xs font-bold uppercase-[0.2em] text-slate-600 bg-slate-50">Joined</th>

                        <th className="whitespace-nowrap px-4 py-3 text-right text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-600 bg-slate-50">Actions</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-200 bg-white">

                      {filteredUsers.map((userItem) => (

                        <tr key={userItem.id} className="hover:bg-slate-50 transition-colors">

                          <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">

                            {userItem.username || userItem.email?.split('@')?.[0] || userItem.email}

                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userItem.email}</td>

                          <td className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userItem.first_name || userItem.firstName || '-'}</td>

                          <td className="hidden sm:table-cell whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userItem.last_name || userItem.lastName || '-'}</td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userTypeLabels[userItem.user_type] || userTypeLabels[userItem.role] || userItem.user_type || userItem.role || '-'}</td>

                          <td className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userItem.resume_file || 'None'}</td>

                          <td className="hidden md:table-cell whitespace-nowrap px-4 py-3 text-sm text-slate-600">{userItem.attachments?.length ? `${userItem.attachments.length} item(s)` : 'None'}</td>

                          <td className="whitespace-nowrap px-4 py-3 text-sm">

                            {userItem.is_active ? (

                              <span className="inline-flex items-center justify-center rounded-full bg-green-500 p-1.5">

                                <CheckCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            ) : (

                              <span className="inline-flex items-center justify-center rounded-full bg-red-500 p-1.5">

                                <XCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            )}

                          </td>

                          <td className="hidden lg:table-cell whitespace-nowrap px-4 py-3 text-sm">

                            {userItem.is_staff ? (

                              <span className="inline-flex items-center justify-center rounded-full bg-green-500 p-1.5">

                                <CheckCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            ) : (

                              <span className="inline-flex items-center justify-center rounded-full bg-red-500 p-1.5">

                                <XCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            )}

                          </td>

                          <td className="hidden lg:table-cell whitespace-nowrap px-4 py-3 text-sm">

                            {userItem.is_superuser ? (

                              <span className="inline-flex items-center justify-center rounded-full bg-green-500 p-1.5">

                                <CheckCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            ) : (

                              <span className="inline-flex items-center justify-center rounded-full bg-red-500 p-1.5">

                                <XCircle className="h-4 w-4 text-white" strokeWidth={3} />

                              </span>

                            )}

                          </td>

                          <td className="hidden xl:table-cell whitespace-nowrap px-4 py-3 text-sm text-slate-600">

                            {formatDate(userItem.date_joined || userItem.created_at || userItem.submitted_date || userItem.createdAt)}

                          </td>

                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">

                            <button

                              type="button"

                              onClick={() => handleEdit(userItem)}

                              className="mr-2 inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"

                            >

                              Edit

                            </button>

                            <button

                              type="button"

                              onClick={() => handleDelete(userItem.id)}

                              className="inline-flex items-center rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"

                            >

                              Delete

                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>
                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* Modal for Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{editingUser ? 'Edit user' : 'Create user'}</p>
                  <p className="text-xs text-slate-500">Admin can manage all user accounts from here.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingUser(null)
                  setFormData({
                    email: '',
                    first_name: '',
                    last_name: '',
                    user_type: 'applicant',
                    password: '',
                    password_confirm: '',
                    is_active: true,
                    is_staff: false,
                    is_superuser: false,
                  })
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">First name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Last name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                >
                  {userTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">Available roles: Applicant, HR Staff, Admin.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500/20" />
                  Active
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500/20" />
                  Staff
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" name="is_superuser" checked={formData.is_superuser} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-500/20" />
                  Superuser
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:from-slate-800 hover:to-slate-700 transition-all duration-200 hover:scale-105"
                >
                  <CheckCircle className="h-4 w-4" />
                  {editingUser ? 'Save changes' : 'Create user'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingUser(null)
                    setFormData({
                      email: '',
                      first_name: '',
                      last_name: '',
                      user_type: 'applicant',
                      password: '',
                      password_confirm: '',
                      is_active: true,
                      is_staff: false,
                      is_superuser: false,
                    })
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  )

}

