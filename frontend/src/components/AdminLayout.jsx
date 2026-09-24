import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col">
        <AdminHeader />
        <div className="flex flex-1">
          <AdminSidebar />
          <div className="flex-1">
            <main>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
