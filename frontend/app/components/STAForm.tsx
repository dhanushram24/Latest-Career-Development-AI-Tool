// sta/components/STAForm.tsx
import { useState, useEffect } from 'react';
import { ShortTermAssignment } from '../../models/StaModel';

interface STAFormProps {
  initialData?: Partial<ShortTermAssignment>;
  onSubmit: (data: Partial<ShortTermAssignment>) => void;
  onCancel: () => void;
}

const STAForm: React.FC<STAFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<ShortTermAssignment>>({
    title: '',
    description: '',
    skillsRequired: [],
    skillsToGain: [],
    duration: '',
    startDate: '',
    endDate: '',
    department: '',
    location: '',
    status: 'open',
    ...initialData
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [gainSkillInput, setGainSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const addRequiredSkill = () => {
    if (skillInput.trim()) {
      const updatedSkills = [...(formData.skillsRequired || []), skillInput.trim()];
      setFormData({ ...formData, skillsRequired: updatedSkills });
      setSkillInput('');
    }
  };

  const removeRequiredSkill = (skill: string) => {
    const updatedSkills = (formData.skillsRequired || []).filter(s => s !== skill);
    setFormData({ ...formData, skillsRequired: updatedSkills });
  };

  const addSkillToGain = () => {
    if (gainSkillInput.trim()) {
      const updatedSkills = [...(formData.skillsToGain || []), gainSkillInput.trim()];
      setFormData({ ...formData, skillsToGain: updatedSkills });
      setGainSkillInput('');
    }
  };

  const removeSkillToGain = (skill: string) => {
    const updatedSkills = (formData.skillsToGain || []).filter(s => s !== skill);
    setFormData({ ...formData, skillsToGain: updatedSkills });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if (!formData.duration?.trim()) newErrors.duration = 'Duration is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    
    // Check if at least one required skill is provided
    if (!formData.skillsRequired?.length) {
      newErrors.skillsRequired = 'At least one required skill must be specified';
    }
    
    // Check if at least one skill to gain is provided
    if (!formData.skillsToGain?.length) {
      newErrors.skillsToGain = 'At least one skill to gain must be specified';
    }
    
    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {initialData?.id ? 'Edit Short Term Assignment' : 'Create New Short Term Assignment'}
        </h3>
        <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.title ? 'border-red-300' : ''}`}
                value={formData.title || ''}
                onChange={handleChange}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''}`}
                value={formData.description || ''}
                onChange={handleChange}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Skills Required Field */}
          <div>
            <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700">
              Skills Required <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="skillsRequired"
                id="skillsRequired"
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300"
                placeholder="Enter a required skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addRequiredSkill}
              >
                Add
              </button>
            </div>
            {errors.skillsRequired && <p className="mt-1 text-sm text-red-600">{errors.skillsRequired}</p>}
            
            {/* Display added skills */}
            {formData.skillsRequired && formData.skillsRequired.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ml-1.5 h-4 w-4 inline-flex items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                      onClick={() => removeRequiredSkill(skill)}
                    >
                      <span className="sr-only">Remove {skill}</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills to Gain Field */}
          <div>
            <label htmlFor="skillsToGain" className="block text-sm font-medium text-gray-700">
              Skills to Gain <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="skillsToGain"
                id="skillsToGain"
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300"
                placeholder="Enter a skill to gain"
                value={gainSkillInput}
                onChange={(e) => setGainSkillInput(e.target.value)}
              />
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addSkillToGain}
              >
                Add
              </button>
            </div>
            {errors.skillsToGain && <p className="mt-1 text-sm text-red-600">{errors.skillsToGain}</p>}
            
            {/* Display added skills to gain */}
            {formData.skillsToGain && formData.skillsToGain.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.skillsToGain.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800"
                  >
                    {skill}
                    <button
                      type="button"
                      className="ml-1.5 h-4 w-4 inline-flex items-center justify-center rounded-full text-green-400 hover:bg-green-200 hover:text-green-500 focus:outline-none focus:bg-green-500 focus:text-white"
                      onClick={() => removeSkillToGain(skill)}
                    >
                      <span className="sr-only">Remove {skill}</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Duration Field */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="duration"
                id="duration"
                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.duration ? 'border-red-300' : ''}`}
                placeholder="e.g. 3 months"
                value={formData.duration || ''}
                onChange={handleChange}
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.startDate ? 'border-red-300' : ''}`}
                  value={formData.startDate || ''}
                  onChange={handleChange}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.endDate ? 'border-red-300' : ''}`}
                  value={formData.endDate || ''}
                  onChange={handleChange}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Department and Location Fields */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="department"
                  id="department"
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.department ? 'border-red-300' : ''}`}
                  value={formData.department || ''}
                  onChange={handleChange}
                />
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="location"
                  id="location"
                  className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.location ? 'border-red-300' : ''}`}
                  value={formData.location || ''}
                  onChange={handleChange}
                />
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* Status Field (for editing) */}
          {initialData?.id && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.status || 'open'}
                  onChange={handleChange}
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {initialData?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default STAForm;