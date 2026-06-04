import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Building, MapPin, Link as LinkIcon, Loader2, Plus, Trash2 } from 'lucide-react';

interface JobPostingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'internship' | 'contract',
    description: '',
    requirements: [''],
    applyLink: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.applyLink.trim()) newErrors.applyLink = 'Application link is required';
    if (formData.applyLink && !formData.applyLink.startsWith('http')) {
      newErrors.applyLink = 'Please enter a valid URL (starting with http:// or https://)';
    }

    const validRequirements = formData.requirements.filter(req => req.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is needed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);

    // Clean up requirements
    const cleanedData = {
      ...formData,
      requirements: formData.requirements.filter(req => req.trim()),
    };

    setTimeout(() => {
      onSubmit(cleanedData);
      setLoading(false);
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        description: '',
        requirements: [''],
        applyLink: '',
      });
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Post a Job</h2>
                      <p className="text-white/90 mt-1">Share opportunities with students</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Software Engineer, Data Analyst"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                {/* Company & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company name"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.company ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., San Francisco, CA or Remote"
                        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder="e.g., 3+ years of React experience"
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {formData.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="flex items-center gap-2 text-primary hover:text-secondary font-medium text-sm"
                    >
                      <Plus size={18} />
                      Add Requirement
                    </button>
                  </div>
                  {errors.requirements && <p className="text-red-500 text-sm mt-1">{errors.requirements}</p>}
                </div>

                {/* Apply Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="url"
                      name="applyLink"
                      value={formData.applyLink}
                      onChange={handleChange}
                      placeholder="https://company.com/careers/job-id"
                      className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.applyLink ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.applyLink && <p className="text-red-500 text-sm mt-1">{errors.applyLink}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Briefcase size={20} />
                        Post Job
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default JobPostingForm;
