import React, { useState } from 'react'
import { Save } from 'lucide-react'

export function DeclarationForm({ data = {}, onChange, onSave }) {
  const [formData, setFormData] = useState({
    declaration1: data.declaration1 || false,
    declaration2: data.declaration2 || false,
    declaration3: data.declaration3 || false,
    declarationDate: data.declarationDate || '',
    placeOfDeclaration: data.placeOfDeclaration || ''
  })
  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    if (field === 'declarationDate' && value) {
      const declarationDate = new Date(value)
      const today = new Date()
      if (declarationDate > today) {
        return 'Declaration date cannot be in the future'
      }
    }
    return ''
  }

  const handleCheckboxChange = (field, checked) => {
    const newData = { ...formData, [field]: checked }
    setFormData(newData)
    onChange(newData)
  }

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
    
    // Validate field on change
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  React.useEffect(() => {
    setFormData({
      declaration1: data.declaration1 || false,
      declaration2: data.declaration2 || false,
      declaration3: data.declaration3 || false,
      declarationDate: data.declarationDate || '',
      placeOfDeclaration: data.placeOfDeclaration || ''
    })
  }, [data])

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Declaration
      </h3>
      
      <div className="bg-[#006633]/10 border border-[#006633] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h4 className="font-semibold text-[#006633] mb-3 sm:mb-4 text-sm sm:text-base">Declaration Statement</h4>
        <p className="text-xs sm:text-sm text-[#006633] leading-relaxed mb-3 sm:mb-4">
          I hereby declare that the information given in this application is true and correct. I understand that any false or misleading information may result in my application being rejected or, if appointed, disciplinary action being taken against me including dismissal.
        </p>
        <p className="text-xs sm:text-sm text-[#006633] leading-relaxed mb-3 sm:mb-4">
          I also declare that I have not been convicted of any criminal offense involving fraud, dishonesty, or moral turpitude. I understand that providing false information constitutes an offense under the law.
        </p>
        <p className="text-xs sm:text-sm text-[#006633] leading-relaxed">
          I authorize the National Council for Population and Development to verify any information contained in this application and to contact my referees for references.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-[#006633]">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Declaration Item</th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Agree</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <label className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                    I hereby declare that all the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to disqualification or legal action. <span className="text-red-500">*</span>
                  </label>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <input
                    type="checkbox"
                    checked={formData.declaration1}
                    onChange={(e) => handleCheckboxChange('declaration1', e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <label className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                    I consent to the National Council for Population and Development conducting background checks, including verification of academic qualifications, employment history, and criminal records, as part of the recruitment process. <span className="text-red-500">*</span>
                  </label>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <input
                    type="checkbox"
                    checked={formData.declaration2}
                    onChange={(e) => handleCheckboxChange('declaration2', e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <label className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                    I consent to the collection, processing, and storage of my personal data in accordance with the Data Protection Act, 2019. I understand that my data will be used solely for recruitment purposes and will be kept confidential. <span className="text-red-500">*</span>
                  </label>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <input
                    type="checkbox"
                    checked={formData.declaration3}
                    onChange={(e) => handleCheckboxChange('declaration3', e.target.checked)}
                    className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#006633]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Declaration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.declarationDate}
            onChange={(e) => handleInputChange('declarationDate', e.target.value)}
            className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm ${errors.declarationDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.declarationDate && <p className="text-red-500 text-xs mt-1">{errors.declarationDate}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Place of Declaration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Nairobi"
            value={formData.placeOfDeclaration}
            onChange={(e) => handleInputChange('placeOfDeclaration', e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006633] focus:border-transparent text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-4 sm:mt-6">
        <button
          onClick={() => {
            // Validate all required fields before saving
            if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3) {
              alert('Please agree to all declaration statements')
              return
            }
            if (!formData.declarationDate) {
              alert('Declaration date is required')
              return
            }
            if (!formData.placeOfDeclaration) {
              alert('Place of declaration is required')
              return
            }
            
            // Validate declaration date
            if (formData.declarationDate) {
              const declarationDate = new Date(formData.declarationDate)
              const today = new Date()
              if (declarationDate > today) {
                alert('Declaration date cannot be in the future')
                return
              }
            }
            
            onChange(formData)
            if (onSave) onSave()
          }}
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all text-xs sm:text-sm md:text-base shadow-md hover:shadow-lg"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          Save Declaration
        </button>
      </div>
    </div>
  )
}
