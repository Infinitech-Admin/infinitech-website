"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, MapPin, Phone, CheckCircle2, Loader2, Globe, Plus, X, Facebook, Instagram, MessageCircle, Upload, Camera } from 'lucide-react';

interface SocialMedia {
  platform: string;
  url: string;
}

interface FormData {
  email: string;
  username: string;
  address: string;
  phone_number: string;
  display_name: string;
  first_name: string;
  last_name: string;
    position: string;
  website: string;
  social_media: SocialMedia[];
  profile_image: File | null;
}

export default function JuanTapSurvey() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    address: '',
    phone_number: '',
    display_name: '',
    first_name: '',
    last_name: '',
    position:'',
    website: '',
    social_media: [],
    profile_image: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSocial, setCurrentSocial] = useState<SocialMedia>({ platform: '', url: '' });
  const [errors, setErrors] = useState({
    email: '',
    phone_number: '',
    profile_image: '',
    social_media: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-600' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-600' },
    { name: 'WeChat', icon: MessageCircle, color: 'bg-green-700' },
    { name: 'TikTok', icon: User, color: 'bg-black' },
    { name: 'Viber', icon: MessageCircle, color: 'bg-purple-600' },
    { name: 'Telegram', icon: MessageCircle, color: 'bg-blue-500' }
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));

    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[a-zA-Z]/g, '');
    setFormData(prev => ({ ...prev, phone_number: sanitizedValue }));

    if (value !== sanitizedValue) {
      setErrors(prev => ({ ...prev, phone_number: 'Phone number cannot contain letters' }));
    } else {
      setErrors(prev => ({ ...prev, phone_number: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          profile_image: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)' 
        }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setErrors(prev => ({ 
          ...prev, 
          profile_image: 'Image size must be less than 5MB' 
        }));
        return;
      }

      setErrors(prev => ({ ...prev, profile_image: '' }));
      setFormData(prev => ({ ...prev, profile_image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, profile_image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addSocialMedia = () => {
    // Clear previous error
    setErrors(prev => ({ ...prev, social_media: '' }));

    // Validate both fields are filled
    if (!currentSocial.platform || !currentSocial.url) {
      setErrors(prev => ({ 
        ...prev, 
        social_media: 'Please select a platform and enter a profile URL before adding' 
      }));
      return;
    }

    // Add the social media
    const newSocialMedia = [...formData.social_media, { ...currentSocial }];
    setFormData(prev => ({
      ...prev,
      social_media: newSocialMedia
    }));
    setCurrentSocial({ platform: '', url: '' });
  };

  useEffect(() => {
    if (currentSocial.platform && currentSocial.url) {
      const timer = setTimeout(() => {
        addSocialMedia();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentSocial.platform, currentSocial.url]);

  const removeSocialMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      social_media: prev.social_media.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    let hasErrors = false;
    const newErrors = { email: '', phone_number: '', profile_image: '', social_media: '' };

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (formData.phone_number && /[a-zA-Z]/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number cannot contain letters';
      hasErrors = true;
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      // Create FormData for multipart/form-data submission
      const submitFormData = new FormData();
      
      // Append text fields
      submitFormData.append('email', formData.email || '');
      submitFormData.append('username', formData.username || '');
      submitFormData.append('address', formData.address || '');
      submitFormData.append('phone_number', formData.phone_number || '');
      submitFormData.append('display_name', formData.display_name || '');
      submitFormData.append('first_name', formData.first_name || '');
      submitFormData.append('last_name', formData.last_name || '');
            submitFormData.append('position', formData.position || '');
      submitFormData.append('website', formData.website || '');
      
      // Append social media as JSON string
      if (formData.social_media && formData.social_media.length > 0) {
        submitFormData.append('social_media', JSON.stringify(formData.social_media));
      }
      
      // Append image file
      if (formData.profile_image) {
        submitFormData.append('profile_image', formData.profile_image);
      }

      console.log('=== SUBMITTING WITH IMAGE ===');
      console.log('Has image?', !!formData.profile_image);
      console.log('Image name:', formData.profile_image?.name);

      const response = await fetch('/api/juantap-surveys', {
        method: 'POST',
        body: submitFormData, // Note: Don't set Content-Type header, browser will set it with boundary
      });

      const data = await response.json();

      console.log('Response from API:', data);

      if (data.success) {
        setSubmitted(true);
      } else {
        console.error('Failed to submit survey:', data);
        alert('Failed to submit survey. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [submitted]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4 text-slate-800">Thank You!</h2>
          <p className="text-slate-600 text-lg mb-2">
            Your information has been received successfully.
          </p>
          <p className="text-blue-600 font-semibold text-xl mt-4">
            We will work on your JuanTap!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-blue-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">JT</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">JuanTap</h1>
              <p className="text-blue-300 text-xs">Digital Profile Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
              JuanTap Information Survey
            </h2>
            <p className="text-blue-200 text-lg">
              Help us build your digital profile
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur shadow-2xl rounded-2xl p-6 lg:p-8">
            <div className="space-y-5">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Profile Image
                </label>
                <div className="flex items-start gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border-2 border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                      <Camera className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image-input"
                    />
                    <label
                      htmlFor="profile-image-input"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </label>
                    <p className="text-xs text-slate-500 mt-2">
                      JPG, PNG, GIF or WebP. Max size 5MB.
                    </p>
                    {errors.profile_image && (
                      <p className="text-red-500 text-xs mt-1">{errors.profile_image}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 1: Email & Username */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="youremail@gmail.com"
                      className={`block w-full pl-10 pr-3 py-2.5 border ${
                        errors.email ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm`}
                      value={formData.email}
                      onChange={handleEmailChange}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      placeholder="johndoe"
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: First Name, Last Name, Display Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="block text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    placeholder="John"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="last_name" className="block text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    placeholder="Doe"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
               
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <label htmlFor="display_name" className="block text-sm font-medium text-slate-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="display_name"
                    placeholder="John Doe"
                    className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Address */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    placeholder="Unit 202, Campos Rueda Building, Urban Avenue, Makati City"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Phone & Website */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Phone Number */}
  <div className="space-y-2">
    <label htmlFor="phone_number" className="block text-sm font-medium text-slate-700">
      Phone Number
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Phone className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="tel"
        id="phone_number"
        placeholder="09651983796"
        className={`block w-full pl-10 pr-3 py-2.5 border ${
          errors.phone_number ? 'border-red-500' : 'border-slate-300'
        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm`}
        value={formData.phone_number}
        onChange={handlePhoneChange}
      />
    </div>
    {errors.phone_number && (
      <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
    )}
  </div>

  {/* Position */}
  <div>
    <label htmlFor="position" className="block text-sm font-medium text-foreground mb-2">
      Position
    </label>
    <input
      id="position"
      type="text"
      value={formData.position}
      onChange={(e) => handleInputChange("position", e.target.value)}
      placeholder="Enter your job position/title (e.g., Sales Director, Manager, etc.)"
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>

  {/* Website */}
  <div className="space-y-2">
    <label htmlFor="website" className="block text-sm font-medium text-slate-700">
      Website
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Globe className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="url"
        id="website"
        placeholder="abicealtyph.com"
        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
        value={formData.website}
        onChange={(e) => handleInputChange('website', e.target.value)}
      />
    </div>
  </div>
</div>


              {/* Social Media */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  Social Media
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2">
                  <select
                    value={currentSocial.platform}
                    onChange={(e) => {
                      setCurrentSocial(prev => ({ ...prev, platform: e.target.value }));
                      setErrors(prev => ({ ...prev, social_media: '' }));
                    }}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select Platform</option>
                    {socialPlatforms.map(platform => (
                      <option key={platform.name} value={platform.name}>{platform.name}</option>
                    ))}
                  </select>
                  <input
                    type="url"
                    placeholder="Profile URL"
                    value={currentSocial.url}
                    onChange={(e) => {
                      setCurrentSocial(prev => ({ ...prev, url: e.target.value }));
                      setErrors(prev => ({ ...prev, social_media: '' }));
                    }}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addSocialMedia}
                    className="w-full sm:w-12 h-[42px] flex items-center justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Error message for social media */}
                {errors.social_media && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{errors.social_media}</p>
                  </div>
                )}

                {formData.social_media.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-slate-600 font-medium">Added ({formData.social_media.length}):</p>
                    {formData.social_media.map((social, index) => (
                      <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-slate-700 text-sm">{social.platform}:</span>
                          <span className="text-slate-600 text-xs truncate">{social.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSocialMedia(index)}
                          className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Survey'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
