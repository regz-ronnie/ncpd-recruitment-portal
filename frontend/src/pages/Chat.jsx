import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { Send, Paperclip, X, MessageSquare, HelpCircle, Briefcase, GraduationCap, LayoutDashboard, User, FileText, Bell, Download, Menu, LogOut } from 'lucide-react'
import axios from 'axios'

const API_BASE_URL = '/api/v1'

export default function Chat() {
  const { logout } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [conversationType, setConversationType] = useState('faq')
  const [attachment, setAttachment] = useState(null)
  const [showConversationOptions, setShowConversationOptions] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const conversationTypes = [
    { id: 'faq', label: 'General FAQ', icon: HelpCircle, description: 'Ask questions about the recruitment process' },
    { id: 'application_help', label: 'Application Help', icon: MessageSquare, description: 'Get help with your application' },
    { id: 'pre_screening', label: 'Pre-screening', icon: Briefcase, description: 'Get pre-screened for positions' },
    { id: 'interview_prep', label: 'Interview Prep', icon: GraduationCap, description: 'Prepare for interviews' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startConversation = async (type) => {
    setIsLoading(true)
    setShowConversationOptions(false)
    setConversationType(type)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post(`${API_BASE_URL}/ai-engine/conversations/start_conversation/`, {
        conversation_type: type,
        initial_query: 'Start conversation'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data) {
        // Handle both session_id and id from response
        const sessionId = response.data.session_id || response.data.id
        setConversationId(sessionId)
        
        // Add initial bot message from response or fallback
        const initialMessage = {
          role: 'assistant',
          content: getWelcomeMessage(type),
          timestamp: new Date().toISOString()
        }
        setMessages([initialMessage])
      }
    } catch (error) {
      console.error('Error starting conversation:', error)
      // Fallback to local welcome message if API fails
      const initialMessage = {
        role: 'assistant',
        content: getWelcomeMessage(type),
        timestamp: new Date().toISOString()
      }
      setMessages([initialMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getWelcomeMessage = (type) => {
    const typeInfo = conversationTypes.find(t => t.id === type)
    switch (type) {
      case 'faq':
        return `Hello! I'm here to help answer your questions about the recruitment process. You can ask me about application procedures, job requirements, company culture, benefits, or the interview process. What would you like to know?`
      case 'application_help':
        return `Hi! I can help you with your application. Common issues I can assist with include:\n• Uploading your resume/CV\n• Completing the application form\n• Understanding job requirements\n• Application status updates\n\nWhat specific issue are you experiencing?`
      case 'pre_screening':
        return `Welcome! I'm here to help you find the right position. What type of role are you looking for? I'll ask you a few questions to assess your fit for available positions.`
      case 'interview_prep':
        return `I'd be happy to help you prepare for interviews! I can provide tips, practice questions, and role-specific advice. What type of position are you interviewing for?`
      default:
        return `Hello! I'm here to help you with your recruitment process. How can I assist you today?`
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && !attachment) return

    let attachmentData = null
    if (attachment) {
      // Upload the attachment first
      const uploadResult = await uploadChatAttachment(attachment)
      if (uploadResult) {
        attachmentData = {
          name: uploadResult.file_name,
          type: attachment.type,
          url: uploadResult.url,
          safe_filename: uploadResult.safe_filename
        }
      } else {
        // If upload fails, still send the message but note the attachment issue
        attachmentData = { name: attachment.name, type: attachment.type, error: 'Upload failed' }
      }
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      attachment: attachmentData,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setAttachment(null)
    setIsLoading(true)

    try {
      const token = localStorage.getItem('access_token')
      
      // Try to use the chatbot service if conversation exists
      if (conversationId) {
        const response = await axios.post(`${API_BASE_URL}/ai-engine/conversations/session/${conversationId}/continue/`, {
          message: inputMessage,
          attachment: attachmentData
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const botMessage = {
          role: 'assistant',
          content: response.data.response || response.data.message || 'Thank you for your message. Our team will get back to you shortly.',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        // Fallback: Simulate response if no conversation
        const botResponse = generateFallbackResponse(inputMessage, conversationType, attachmentData)
        const botMessage = {
          role: 'assistant',
          content: botResponse,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Fallback response
      const botResponse = generateFallbackResponse(inputMessage, conversationType, attachmentData)
      const botMessage = {
        role: 'assistant',
        content: botResponse,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateFallbackResponse = (message, type, attachment) => {
    const lowerMessage = message.toLowerCase()
    
    // Handle attachment acknowledgment
    if (attachment && !attachment.error) {
      return `Thank you for attaching ${attachment.name}. I've received your document. Our team will review it and get back to you shortly. Is there anything else I can help you with?`
    }
    
    if (attachment && attachment.error) {
      return `I see you tried to attach a file, but there was an upload error. Please try again or contact support for assistance. How else can I help you today?`
    }
    
    if (type === 'application_help') {
      if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
        return 'For resume issues: Ensure your file is in PDF or DOCX format and under 5MB. Make sure it includes your contact information, work experience, and education.'
      } else if (lowerMessage.includes('form') || lowerMessage.includes('application')) {
        return 'For form issues: Make sure all required fields are filled out. Check that your email and phone number are correct. If you\'re still having trouble, try refreshing the page.'
      } else if (lowerMessage.includes('status')) {
        return 'To check your application status: Log into your dashboard and view "My Applications". You\'ll see real-time updates on your application progress.'
      }
    } else if (type === 'faq') {
      if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
        return 'To apply for a position: Browse available jobs, click "Apply" on a position that interests you, complete the application form, and upload your resume. You can track your application status in your dashboard.'
      } else if (lowerMessage.includes('requirement') || lowerMessage.includes('qualification')) {
        return 'Requirements vary by position. Each job posting lists specific requirements including education, experience, and skills. Make sure to review these before applying.'
      } else if (lowerMessage.includes('interview')) {
        return 'Our interview process typically includes: 1) Initial screening call, 2) Technical assessment (if applicable), 3) Panel interview, 4) Final decision. The process usually takes 1-2 weeks.'
      }
    }
    
    return 'Thank you for your message. I understand you need assistance with: "' + message + '". Our team is here to help. Could you provide more details so I can better assist you?'
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, DOC, DOCX, JPEG, and PNG files are allowed')
        return
      }
      setAttachment(file)
    }
  }

  const uploadChatAttachment = async (file) => {
    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', 'Chat Attachment')

      const response = await axios.post(`${API_BASE_URL}/auth/upload-document/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })

      return response.data
    } catch (error) {
      console.error('Chat attachment upload failed:', error)
      return null
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setMessages([])
    setConversationId(null)
    setShowConversationOptions(true)
    setInputMessage('')
    setAttachment(null)
  }

  if (showConversationOptions) {
    return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)] relative">
        
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <span className="font-semibold text-sm">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-white hover:bg-gray-700 rounded p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-transform duration-300 md:transition-none`}>
          
          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-end p-2 border-b border-gray-200">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Collapse Button */}
          <div className="hidden md:flex justify-end p-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="p-3 space-y-1">
            <ul className="space-y-1">
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Dashboard' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <LayoutDashboard className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Dashboard</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'My Profile' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <User className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Profile</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/vacancies"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Job Vacancies' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <Briefcase className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Job Vacancies</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-applications"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'My Applications' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <FileText className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Applications</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/internships"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Internships' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <GraduationCap className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Internships</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/attachments"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Attachments' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <Paperclip className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Attachments</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/announcements"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Announcements' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <Bell className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Announcements</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/downloads"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      false 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Downloads' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <Download className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Downloads</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/chat"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                      true 
                        ? 'bg-[#006633] text-white shadow-sm' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                    } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Chat with Us' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <MessageSquare className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Chat with Us</span>
                    </div>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-[#006633] ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                    title={isSidebarCollapsed ? 'Logout' : ''}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                      <LogOut className="w-5 h-5 text-slate-500" />
                      <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Logout</span>
                    </div>
                  </button>
                </li>
              </ul>
            </div>


        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-gray-100 overflow-x-auto">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="px-4 py-4">
              <div className="max-w-3xl w-full">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Chat with Us</h1>
                  <p className="text-gray-600 text-sm">Choose the type of conversation you'd like to have</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {conversationTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.id}
                        onClick={() => startConversation(type.id)}
                        className="bg-white rounded-xl shadow-lg p-4 text-left hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#006633] transform hover:scale-102 group"
                      >
                        <div className="flex items-center mb-2">
                          <div className="bg-gradient-to-br from-[#006633] to-[#008844] p-2 rounded-lg mr-3 group-hover:shadow-md transition-shadow">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">{type.label}</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{type.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)] relative">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <div className="md:hidden bg-gray-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <span className="font-semibold text-sm">Menu</span>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-white hover:bg-gray-700 rounded p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} bg-white border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto transition-transform duration-300 md:transition-none`}>
        
        {/* Mobile Close Button */}
        <div className="md:hidden flex justify-end p-2 border-b border-gray-200">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Collapse Button */}
        <div className="hidden md:flex justify-end p-2">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="p-3 space-y-1">
          <ul className="space-y-1">
              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Dashboard' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LayoutDashboard className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Dashboard</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'My Profile' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <User className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Profile</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/vacancies"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Job Vacancies' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Briefcase className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Job Vacancies</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-applications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'My Applications' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <FileText className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>My Applications</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/internships"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Internships' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <GraduationCap className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Internships</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/attachments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Attachments' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Paperclip className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Attachments</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Announcements' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Bell className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Announcements</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/downloads"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    false 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Downloads' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <Download className={`w-5 h-5 ${false ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Downloads</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  to="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm ${
                    true 
                      ? 'bg-[#006633] text-white shadow-sm' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-[#006633]'
                  } ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Chat with Us' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <MessageSquare className={`w-5 h-5 ${true ? 'text-white' : 'text-slate-500'}`} />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Chat with Us</span>
                  </div>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-[#006633] ${isSidebarCollapsed ? 'md:justify-center' : ''}`}
                  title={isSidebarCollapsed ? 'Logout' : ''}
                >
                  <div className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'space-x-3'}`}>
                    <LogOut className="w-5 h-5 text-slate-500" />
                    <span className={`${isSidebarCollapsed ? 'md:hidden' : ''}`}>Logout</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>


      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-2 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 bg-gray-100 overflow-x-auto">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="px-4 py-4">
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#006633] to-[#008844] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 p-1.5 rounded-lg mr-3">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold">Chat Support</h1>
                    <p className="text-white/80 text-xs">
                      {conversationTypes.find(t => t.id === conversationType)?.label}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetChat}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center space-x-1"
                >
                  <span className="text-xs font-medium">New Chat</span>
                </button>
              </div>

              {/* Messages Area */}
              <div className="h-[400px] overflow-y-auto p-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <div className="bg-gradient-to-br from-[#006633] to-[#008844] w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <MessageSquare className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm font-medium mb-1">Start a conversation</p>
                    <p className="text-xs">Type a message below to begin chatting</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                            message.role === 'user'
                        ? 'bg-gradient-to-r from-[#006633] to-[#008844] text-white'
                        : 'bg-white text-gray-900 border border-slate-200'
                    }`}
                  >
                    {message.attachment && (
                      <div className="mb-1.5 flex items-center text-xs">
                        <Paperclip className="w-3 h-3 mr-1.5" />
                        {message.attachment.url ? (
                          <a 
                            href={message.attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`underline hover:opacity-80 ${message.role === 'user' ? 'text-white/80' : 'text-[#006633]'}`}
                          >
                            {message.attachment.name}
                          </a>
                        ) : (
                          <span className="opacity-90">{message.attachment.name}</span>
                        )}
                        {message.attachment.error && (
                          <span className="ml-2 text-red-300 text-xs">(Upload failed)</span>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <div className="flex space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-[#006633] rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-[#006633] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-[#006633] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white p-3">
          {attachment && (
            <div className="mb-2 flex items-center bg-[#006633]/10 rounded-lg p-2 border border-[#006633]/20">
              <Paperclip className="w-3 h-3 text-[#006633] mr-2" />
              <span className="text-xs text-slate-700 flex-1">{attachment.name}</span>
              <button
                onClick={removeAttachment}
                className="text-slate-500 hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-500 hover:text-[#006633] transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || (!inputMessage.trim() && !attachment)}
              className="bg-gradient-to-r from-[#006633] to-[#008844] text-white rounded-lg px-4 py-2 hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center transform hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
