import React, { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Sparkles, X } from 'lucide-react'

export function CVUpload({ onCVUpload, onCVParse, isParsing }) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setFile(file)
    onCVUpload(file)
  }

  const removeFile = () => {
    setFile(null)
    setParsedData(null)
    setError('')
  }

  const parseCV = async () => {
    if (!file) return

    try {
      setIsParsing(true)
      // This would call the AI parsing service
      const formData = new FormData()
      formData.append('file', file)

      // Mock parsing response - replace with actual API call
      setTimeout(() => {
        const mockParsedData = {
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+254 700 000 000'
          },
          experience: [
            {
              company: 'Previous Company',
              position: 'Senior Role',
              duration: '3 years',
              description: 'Responsible for...'
            }
          ],
          education: [
            {
              institution: 'University Name',
              degree: 'Bachelor\'s Degree',
              field: 'Computer Science'
            }
          ],
          skills: ['JavaScript', 'Python', 'Project Management'],
          summary: 'Experienced professional with...'
        }
        
        setParsedData(mockParsedData)
        onCVParse(mockParsedData)
        setIsParsing(false)
      }, 2000)
    } catch (error) {
      setError('Failed to parse CV. Please try again.')
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload CV/Resume</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your CV to automatically populate your application details with AI-powered parsing
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : file
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="cv-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.doc,.docx"
        />

        {!file ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your CV here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, DOC, DOCX (Max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <FileText className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4 inline mr-1" />
              Remove File
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Parse Button */}
      {file && !parsedData && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={parseCV}
            disabled={isParsing}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Parsing CV...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Parse CV with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Parsed Results */}
      {parsedData && (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-green-700 text-sm font-medium">
              CV successfully parsed! Review the extracted information below.
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Extracted Information</h4>
            
            {/* Personal Info */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {parsedData.personalInfo.name}</p>
                <p><strong>Email:</strong> {parsedData.personalInfo.email}</p>
                <p><strong>Phone:</strong> {parsedData.personalInfo.phone}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Professional Summary</h5>
              <p className="text-sm text-gray-600">{parsedData.summary}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={removeFile}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Upload a different CV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
