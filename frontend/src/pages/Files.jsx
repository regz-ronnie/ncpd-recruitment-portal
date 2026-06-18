import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Files() {
  const location = useLocation()
  
  // Responsive Toggle States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Document Management list data state
  const [fileList, setFileList] = useState([
    { id: 1, category: 'Certificate', name: 'certification_in_ict_field.pdf' },
    { id: 2, category: 'ID (National ID)', name: 'id.pdf' },
    { id: 3, category: 'Degree', name: 'certificate_computer_science_degree.pdf' },
    { id: 4, category: 'Recommendation', name: 'recommendation.pdf' },
    { id: 5, category: 'CV/Resume', name: 'cv.pdf' }
  ])

  // Modal Control and Dropdown Handling State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const categories = [
    'Certificate',
    'ID (National ID)',
    'Degree',
    'Recommendation',
    'CV/Resume',
    'Cover Letter',
    'Passport Photo',
    'Chapter 6 - Helb Clearance',
    'Chapter 6 - Police Clearance (DCI)',
    'Chapter 6 - Tax Compliance Certificate',
    'Chapter 6 - CRB',
    'Chapter 6 - EACC'
  ]

  const filteredCategories = categories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setSelectedCategory('')
    setCategorySearch('')
    setSelectedFile(null)
  }

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSaveFile = (e) => {
    e.preventDefault()
    if (!selectedCategory || !selectedFile) {
      alert('Please select both a file category and a valid attachment.')
      return
    }

    const newFileRow = {
      id: Date.now(),
      category: selectedCategory,
      name: selectedFile.name
    }

    setFileList([...fileList, newFileRow])
    setIsModalOpen(false)
  }

  const handleDeleteFile = (id) => {
    if(window.confirm("Are you sure you want to delete this document attachment?")) {
      setFileList(fileList.filter(item => item.id !== id))
    }
  }

  // Sidebar Links Structure Matching Reference Layout
  const renderNavigationLinks = () => {
    const isActive = (path) => location.pathname === path

    return (
      <div className="flex flex-col h-full font-sans">
        {/* Dashboard Section */}
        <div className="px-3 mb-4">
          <Link 
            to="/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold transition-all ${
              isActive('/dashboard') ? 'bg-[#0f4c81] text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2M0 4h24v16H0V4z" />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Profile Group */}
        <div className="mb-4">
          <div className="text-[11px] font-bold tracking-wider text-gray-900 px-6 py-1">PROFILE</div>
          <nav className="mt-1 space-y-0.5 px-3">
            {[
              { path: '/personal-details', label: 'Personal Details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { path: '/education', label: 'Education', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
              { path: '/trainings', label: 'Trainings', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { path: '/professional-membership', label: 'Professional Membership', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
              { path: '/employment', label: 'Employment', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
              { path: '/files', label: 'Files', icon: 'M7 21h10a2 2 0 002-2V9l-6-6H5a2 2 0 00-2 2v14a2 2 0 002 2z' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all ${
                  isActive(item.path) || (item.path === '/files' && location.pathname === '/files')
                    ? 'bg-[#0f4c81] text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Jobs Group */}
        <div>
          <div className="text-[11px] font-bold tracking-wider text-gray-900 px-6 py-1">JOBS</div>
          <nav className="mt-1 space-y-0.5 px-3">
            {[
              { path: '/my-applications', label: 'My Applications', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { path: '/advertised-jobs', label: 'Advertised Jobs', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2z' }
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all ${
                  isActive(item.path) ? 'bg-[#0f4c81] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col antialiased selection:bg-blue-500 selection:text-white">
      
      

      {/* Primary Application Header Top Navbar Component */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-2.5 shadow-xs">
        <div className="w-full flex items-center justify-between">
          
          {/* Logo & Brand Flag Container Element */}
          <div className="flex items-center gap-3">
            {/* Menu Toggle for Mobile Screen Responsiveness */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            
          </div>

          {/* User Widget Controls & Profile Segment Bar */}
          <div className="flex items-center gap-3">
            <div className="relative">
             
            </div>

          </div>

        </div>
      </header>

      {/* Responsive Structural Core Wrapper Grid Frame Layout */}
      <div className="flex-1 flex w-full relative items-stretch">
        
        {/* Desktop Navigation Sidebar Layer (Hidden on small mobile viewpoints) */}
        <aside className="w-60 bg-white border-r border-gray-200 shrink-0 hidden md:block pt-5 pb-4">
          {renderNavigationLinks()}
        </aside>

        {/* Floating Slide-out Drawer Panel Menu Overlay for Small Devices */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="relative w-60 bg-white h-full shadow-xl pt-5 pb-4 flex flex-col z-50 overflow-y-auto">
              <div className="flex items-center justify-between px-4 pb-3 mb-3 border-b">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {renderNavigationLinks()}
            </aside>
          </div>
        )}

        {/* Dynamic Inner Component Dashboard View Space Content Frame */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 bg-[#f1f5f9]">
          
          {/* Breadcrumb Context Path Indicator */}
          <div className="mb-4 text-sm font-semibold text-[#0f4c81] tracking-wide">
            My Files
          </div>

          <div className="bg-white rounded border border-gray-200 shadow-xs p-4 sm:p-6">
            
            {/* Mandatory Requirement Info Bar Indicator Segment */}
            <div className="bg-emerald-50 border-l-4 border-[#008744] p-3.5 rounded-r mb-6 flex items-start gap-3">
              <div className="text-[#008744] shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                The highest qualification, and the National ID are compulsory. Select highest qualification and national id under file category.
              </p>
            </div>

            {/* Title Block Section and Document Submission Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Show</span>
                <select className="border border-gray-300 rounded px-1.5 py-1 bg-white focus:outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>entries</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">Search:</span>
                  <input type="text" className="border border-gray-300 rounded px-2 py-1.5 bg-white w-full sm:w-44 focus:outline-none focus:ring-1 focus:ring-[#008744]" />
                </div>
                
                <button 
                  onClick={handleOpenModal}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#008744] hover:bg-[#007038] text-white rounded text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload File
                </button>
              </div>
            </div>

            {/* Document Dynamic Table presentation view wrapper element */}
            <div className="w-full overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-900 tracking-tight">
                    <th className="py-3 px-3 w-12 text-center border-r">#</th>
                    <th className="py-3 px-4 border-r">File Category</th>
                    <th className="py-3 px-4 border-r">File Name</th>
                    <th className="py-3 px-4 w-28 text-center border-r">Edit</th>
                    <th className="py-3 px-4 w-28 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs sm:text-sm text-gray-700">
                  {fileList.map((file, idx) => (
                    <tr key={file.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-bold border-r text-gray-900">{idx + 1}</td>
                      <td className="py-3 px-4 font-normal text-gray-800 border-r break-words max-w-[200px]">{file.category}</td>
                      <td className="py-3 px-4 text-blue-600 font-medium border-r break-all max-w-[260px]">
                        <div className="inline-flex items-center gap-1.5 cursor-pointer hover:underline">
                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {file.name}
                        </div>
                      </td>
                      {/* Control buttons modeled precisely based on layout reference parameters */}
                      <td className="py-2 px-4 border-r text-center">
                        <button 
                          onClick={() => alert(`Review item content entry: ${file.name}`)}
                          className="w-full inline-flex justify-center items-center py-1 px-3 text-blue-600 border border-blue-400 hover:bg-blue-50 rounded transition-all text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="w-full inline-flex justify-center items-center py-1 px-3 text-red-600 border border-red-300 hover:bg-red-50 rounded transition-all text-xs"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v4M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Custom Footer Layout Tag inside table component block */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2 font-medium">
              <div>© 2026 <Link to="#" className="text-blue-600 hover:underline">NCPD</Link></div>
              <div className="flex items-center gap-3">
                <Link to="#" className="hover:underline flex items-center gap-0.5">💬 FAQs</Link>
                <Link to="#" className="hover:underline flex items-center gap-0.5">📞 Contact Us</Link>
                <span className="text-gray-400">| V 1.0.0</span>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Backdrop Dynamic Dialog Overlay Modal Window component layout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fadeIn">
          <div className="bg-white rounded shadow-xl max-w-md w-full overflow-hidden border border-gray-200 my-auto">
            
            <div className="bg-[#008744] px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Add File</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveFile} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-3 rounded-r flex items-start gap-2.5">
                <p className="text-xs text-cyan-900 font-semibold leading-relaxed">
                  💡 Kindly attach the files in a PDF format. For the Passport Photo, attach the photo in an image format.
                </p>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-1">File Category</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full min-h-[36px] px-3 py-1.5 border border-gray-300 rounded bg-white cursor-pointer flex items-center justify-between text-xs text-gray-800 focus:ring-1 focus:ring-[#008744]"
                >
                  <span className="truncate">{selectedCategory || "--- Select a Document Category ---"}</span>
                  <svg className="w-4 h-4 text-gray-500 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-44 overflow-y-auto z-50">
                    <div className="p-1 sticky top-0 bg-white border-b border-gray-100">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#008744]"
                      />
                    </div>
                    <ul className="py-0.5">
                      {filteredCategories.map((cat, index) => (
                        <li 
                          key={index}
                          onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                          className={`px-3 py-2 text-xs cursor-pointer transition-colors truncate ${
                            selectedCategory === cat ? 'bg-emerald-50 text-[#008744] font-bold' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {cat}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Select Attachment File</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="w-full block text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 border border-gray-300 rounded p-1 bg-gray-50/30 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-2 bg-[#008744] hover:bg-[#007038] text-white font-bold rounded text-xs shadow-sm tracking-wide uppercase transition-colors">
                  Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}