import React, { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Loader2, X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for PDF.js using local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export function PDFViewer({ url, fileName, onClose, className = '' }) {
  const [pdf, setPdf] = useState(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageRendering, setPageRendering] = useState(false)
  const [pageNumPending, setPageNumPending] = useState(null)
  const [scale, setScale] = useState(1.0)
  const [numPages, setNumPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const canvasRef = useRef(null)

  useEffect(() => {
    loadPDF(url)
    return () => {
      // PDF.js handles cleanup automatically
    }
  }, [url])

  useEffect(() => {
    if (pdf && !pageRendering) {
      renderPage(pageNum)
    }
  }, [pageNum, scale, pdf])

  const loadPDF = async (pdfUrl) => {
    setLoading(true)
    setError(null)
    
    if (!pdfUrl) {
      setError('No document URL provided')
      setLoading(false)
      return
    }
    
    try {
      // Try fetching with CORS handling first
      const response = await fetch(pdfUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      }
      
      const arrayBuffer = await response.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdfInstance = await loadingTask.promise
      
      setPdf(pdfInstance)
      setNumPages(pdfInstance.numPages)
      setPageNum(1)
      setLoading(false)
    } catch (fetchErr) {
      // Fallback: Try loading directly via URL
      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl })
        const pdfInstance = await loadingTask.promise
        
        setPdf(pdfInstance)
        setNumPages(pdfInstance.numPages)
        setPageNum(1)
        setLoading(false)
      } catch (urlErr) {
        setError(`Failed to load PDF: ${urlErr.message}`)
        setLoading(false)
      }
    }
  }

  const renderPage = async (num) => {
    setPageRendering(true)
    
    try {
      const page = await pdf.getPage(num)
      const canvas = canvasRef.current
      
      if (!canvas) {
        console.error('Canvas ref is null')
        setPageRendering(false)
        return
      }
      
      const context = canvas.getContext('2d')
      
      const viewport = page.getViewport({ scale })
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise
      
      setPageRendering(false)
      
      if (pageNumPending !== null) {
        renderPage(pageNumPending)
        setPageNumPending(null)
      }
    } catch (err) {
      console.error('Error rendering page:', err)
      setPageRendering(false)
    }
  }

  const queueRenderPage = (num) => {
    if (pageRendering) {
      setPageNumPending(num)
    } else {
      setPageNum(num)
    }
  }

  const onPrevPage = () => {
    if (pageNum <= 1) return
    queueRenderPage(pageNum - 1)
  }

  const onNextPage = () => {
    if (pageNum >= numPages) return
    queueRenderPage(pageNum + 1)
  }

  const onZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }

  const onZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleDownload = async () => {
    if (!url) return
    
    try {
      // Fetch the PDF file
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }
      
      // Create blob and download
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName || 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download failed:', err)
      // Fallback to opening in new tab
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => loadPDF(url)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
            {fileName || 'Document'}
          </span>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            ({pageNum} / {numPages})
          </span>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onZoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-gray-100 rounded"
            title="Download"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-2 sm:p-4">
        <canvas ref={canvasRef} className="shadow-lg max-w-full" />
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between bg-white border-t border-gray-200 px-3 py-2">
        <button
          onClick={onPrevPage}
          disabled={pageNum <= 1}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, numPages) }, (_, i) => {
            let pageNumber
            if (numPages <= 5) {
              pageNumber = i + 1
            } else if (pageNum <= 3) {
              pageNumber = i + 1
            } else if (pageNum >= numPages - 2) {
              pageNumber = numPages - 4 + i
            } else {
              pageNumber = pageNum - 2 + i
            }
            
            return (
              <button
                key={pageNumber}
                onClick={() => queueRenderPage(pageNumber)}
                className={`w-8 h-8 rounded text-xs font-medium ${
                  pageNum === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>
        
        <button
          onClick={onNextPage}
          disabled={pageNum >= numPages}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
