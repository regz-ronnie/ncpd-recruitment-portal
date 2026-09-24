import { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Upload, 
  Download,
  Eye,
  Shield,
  Clock,
  FileCheck,
  IdCard,
  Award,
  FolderOpen
} from 'lucide-react'
import api from '../services/api'

export const DocumentVerification = ({ applicationId }) => {
  const [selectedDocument, setSelectedDocument] = useState(null)

  // Fetch application with documents
  const { data: application, isLoading } = useQuery(
    ['application-documents', applicationId],
    () => api.get(`/v1/applications/${applicationId}/`).then(res => res.data),
    { enabled: !!applicationId }
  )

  // Fetch vacancy requirements
  const { data: vacancy } = useQuery(
    ['vacancy', application?.vacancy_id],
    () => api.get(`/v1/vacancies/${application?.vacancy_id}/`).then(res => res.data),
    { enabled: !!application?.vacancy_id }
  )

  const verifyDocuments = () => {
    if (!application || !vacancy) return []

    const requiredDocs = vacancy.mandatory_documents || []
    const uploadedDocs = application.documents || []
    
    return requiredDocs.map(required => {
      const uploaded = uploadedDocs.find(doc => 
        doc.type.toLowerCase() === required.toLowerCase() ||
        doc.name.toLowerCase().includes(required.toLowerCase())
      )
      
      return {
        required,
        uploaded: uploaded || null,
        verified: !!uploaded,
        uploadedAt: uploaded?.uploaded_at || null,
        size: uploaded?.size || 0,
        type: uploaded?.type || required
      }
    })
  }

  const documentStatus = verifyDocuments()

  const getDocumentIcon = (type) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('cv') || typeLower.includes('resume')) {
      return <FileText className="w-5 h-5" />
    } else if (typeLower.includes('id') || typeLower.includes('identity')) {
      return <IdCard className="w-5 h-5" />
    } else if (typeLower.includes('cert') || typeLower.includes('license')) {
      return <Award className="w-5 h-5" />
    } else {
      return <FolderOpen className="w-5 h-5" />
    }
  }

  const getVerificationSummary = () => {
    const total = documentStatus.length
    const verified = documentStatus.filter(doc => doc.verified).length
    const missing = total - verified
    
    return {
      total,
      verified,
      missing,
      percentage: total > 0 ? Math.round((verified / total) * 100) : 0
    }
  }

  const summary = getVerificationSummary()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Verification Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Document Verification Summary
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            summary.percentage === 100 ? 'bg-green-100 text-green-800' :
            summary.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {summary.percentage}% Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{summary.verified}</p>
            <p className="text-sm text-gray-500">Verified Documents</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-red-600">{summary.missing}</p>
            <p className="text-sm text-gray-500">Missing Documents</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileCheck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
            <p className="text-sm text-gray-500">Total Required</p>
          </div>
        </div>
      </div>

      {/* Document Status Table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Required Documents
        </h3>

        <div className="space-y-3">
          {documentStatus.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${doc.verified ? 'bg-green-100' : 'bg-red-100'}`}>
                  {getDocumentIcon(doc.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.required}</p>
                  {doc.uploaded && (
                    <p className="text-sm text-gray-500">
                      {doc.uploaded.name} • {(doc.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {doc.verified ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified</span>
                    <Clock className="w-4 h-4 ml-2 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Missing</span>
                    <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                  </div>
                )}
                
                {doc.uploaded && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setSelectedDocument(doc.uploaded)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {documentStatus.length === 0 && (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No documents required for this position</p>
          </div>
        )}
      </div>

      {/* Document Preview */}
      {selectedDocument && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Document Preview</h3>
            <button
              onClick={() => setSelectedDocument(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-900 font-medium">{selectedDocument.name}</p>
            <p className="text-sm text-gray-500 mt-2">
              {(selectedDocument.size / 1024).toFixed(1)} KB • {selectedDocument.type}
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <button className="btn-secondary">
                <Download className="w-4 h-4 mr-2 inline" />
                Download
              </button>
              <button className="btn-primary">
                <Eye className="w-4 h-4 mr-2 inline" />
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Additional Documents */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Additional Documents
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-900 font-medium mb-2">Upload Additional Documents</p>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop files here, or click to browse
          </p>
          <button className="btn-primary">
            <Upload className="w-4 h-4 mr-2 inline" />
            Choose Files
          </button>
        </div>

        {application?.additional_documents && application.additional_documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {application.additional_documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Actions */}
      {summary.missing > 0 && (
        <div className="card bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-900">Missing Documents Detected</h4>
              <p className="text-sm text-yellow-800 mt-1">
                This applicant is missing {summary.missing} required document(s). 
                Please contact the applicant to upload the missing documents or proceed with caution.
              </p>
              <div className="mt-4 flex space-x-3">
                <button className="btn-warning">
                  Send Reminder Email
                </button>
                <button className="btn-secondary">
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {summary.percentage === 100 && (
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900">All Documents Verified</h4>
              <p className="text-sm text-green-800 mt-1">
                All required documents have been uploaded and verified. This applicant is ready for the next stage.
              </p>
              <div className="mt-4">
                <button className="btn-success">
                  Proceed to Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
