import { useEffect, useState } from 'react';

const countryStateCityData = {
  India: {
    Karnataka: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
    Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
  },
  USA: {
    California: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    Texas: ['Houston', 'Austin', 'Dallas', 'San Antonio'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Syracuse'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
  },
  Canada: {
    Ontario: ['Toronto', 'Ottawa', 'Hamilton', 'London'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'],
    Quebec: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
  },
};

export default function ProfileForm() {
  const [form, setForm] = useState({
    profilePhoto: null,
    profilePhotoPreview: '',
    profilePhotoUrl: '',
    username: '',
    usernameAvailable: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    passwordStrength: '',
    profession: '',
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    country: '',
    state: '',
    city: '',
    pincode: '',
    gender: '',
    customGender: '',
    dob: '',
    subscriptionPlan: 'Basic',
    newsletter: true,
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

const handleImageUpload = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setForm(prev => ({
        ...prev,
        profilePhotoUrl: data.url || data.imageUrl || data.path,
      }));

      setErrors(prev => ({ ...prev, profilePhoto: '' }));
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ 
        ...prev, 
        profilePhoto: 'Failed to upload image. Please try again.' 
      }));
      
      setForm(prev => ({
        ...prev,
        profilePhoto: null,
        profilePhotoPreview: '',
        profilePhotoUrl: '',
      }));
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (form.country) {
      setStates(Object.keys(countryStateCityData[form.country] || {}));
      setForm((f) => ({ ...f, state: '', city: '' }));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.country && form.state) {
      setCities(countryStateCityData[form.country][form.state] || []);
      setForm((f) => ({ ...f, city: '' }));
    }
  }, [form.state]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.username.length >= 4) {
        setIsCheckingUsername(true);
        // Simulate API call for username availability
        setTimeout(() => {
          setForm((f) => ({ ...f, usernameAvailable: form.username !== 'takenuser' }));
          setIsCheckingUsername(false);
        }, 300);
      } else {
        setForm((f) => ({ ...f, usernameAvailable: null }));
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.username]);

  useEffect(() => {
    if (form.newPassword) {
      const hasLength = form.newPassword.length >= 8;
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword);
      const hasNumber = /[0-9]/.test(form.newPassword);
      const hasUpper = /[A-Z]/.test(form.newPassword);
      const hasLower = /[a-z]/.test(form.newPassword);

      let score = 0;
      if (hasLength) score++;
      if (hasSpecial) score++;
      if (hasNumber) score++;
      if (hasUpper) score++;
      if (hasLower) score++;

      let strength = 'Very Weak';
      if (score >= 4) strength = 'Strong';
      else if (score >= 3) strength = 'Medium';
      else if (score >= 2) strength = 'Weak';

      setForm((f) => ({ ...f, passwordStrength: strength }));
    } else {
      setForm((f) => ({ ...f, passwordStrength: '' }));
    }
  }, [form.newPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, profilePhoto: 'File must be under 5MB' }));
          return;
        }
        
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
          setErrors(prev => ({ ...prev, profilePhoto: 'File must be an image (JPG, PNG, GIF, or WebP)' }));
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          setForm(prev => ({ 
            ...prev, 
            profilePhoto: file, 
            profilePhotoPreview: reader.result 
          }));
          
          handleImageUpload(file);
        };
        reader.readAsDataURL(file);
      }
    } else {
      const val = type === 'checkbox' ? checked : value;
      setForm(prev => ({ ...prev, [name]: val }));
      
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.profilePhotoUrl) newErrors.profilePhoto = 'Profile photo is required';
    if (!form.username || form.username.length < 4) newErrors.username = 'Username must be at least 4 characters';
    if (form.usernameAvailable === false) newErrors.username = 'Username is not available';
    if (!form.profession) newErrors.profession = 'Profession is required';
    if (form.profession === 'Entrepreneur' && !form.companyName) newErrors.companyName = 'Company name is required';
    if (!form.addressLine1) newErrors.addressLine1 = 'Address is required';
    if (!form.country) newErrors.country = 'Country is required';
    if (!form.state) newErrors.state = 'State is required';
    if (!form.city) newErrors.city = 'City is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    profilePhoto,
    profilePhotoPreview,
    ...formPayload
  } = form;

  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formPayload),
    });

    if (!response.ok) throw new Error('Failed to submit form');

    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};


  const getPasswordStrengthColor = () => {
    switch (form.passwordStrength) {
      case 'Strong': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Weak': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-xl space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Fill in your details to get started</p>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h3>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              {form.profilePhotoPreview ? (
                <img 
                  src={form.profilePhotoPreview} 
                  alt="Preview" 
                  className="w-24 h-24 object-cover rounded-full border-4 border-blue-200" 
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-300">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
              
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="block">
                <span className="text-gray-700 font-medium">Choose Photo*</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  name="profilePhoto" 
                  onChange={handleChange} 
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF or WebP. Max 5MB.</p>
              </label>
            </div>
          </div>
          
          {errors.profilePhoto && (
            <p className="text-red-600 text-sm mt-2">{errors.profilePhoto}</p>
          )}
          
          {/* Hidden field for uploaded image URL */}
          <input type="hidden" name="profilePhotoUrl" value={form.profilePhotoUrl} />
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Username*</span>
                <div className="relative">
                  <input 
                    type="text" 
                    name="username" 
                    value={form.username} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3 top-4">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {form.username && form.usernameAvailable !== null && !isCheckingUsername && (
                  <p className={`text-sm mt-1 ${form.usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {form.usernameAvailable ? '✓ Username available' : '✗ Username taken'}
                  </p>
                )}
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Gender</span>
                <select 
                  name="gender" 
                  value={form.gender} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            {form.gender === 'Other' && (
              <div className="md:col-span-2">
                <label className="block">
                  <span className="text-gray-700 font-medium">Please specify</span>
                  <input 
                    type="text" 
                    name="customGender" 
                    value={form.customGender} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please specify your gender"
                  />
                </label>
              </div>
            )}

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Date of Birth</span>
                <input 
                  type="date" 
                  name="dob" 
                  value={form.dob} 
                  onChange={handleChange} 
                  max={new Date().toISOString().split('T')[0]} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Password</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Current Password</span>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={form.currentPassword} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">New Password</span>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={form.newPassword} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                {form.newPassword && (
                  <p className={`text-sm mt-1 ${getPasswordStrengthColor()}`}>
                    Strength: {form.passwordStrength}
                  </p>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Profession*</span>
                <select 
                  name="profession" 
                  value={form.profession} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Profession</option>
                  <option value="Student">Student</option>
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Other">Other</option>
                </select>
                {errors.profession && <p className="text-red-600 text-sm mt-1">{errors.profession}</p>}
              </label>
            </div>

            {form.profession === 'Entrepreneur' && (
              <div>
                <label className="block">
                  <span className="text-gray-700 font-medium">Company Name*</span>
                  <input 
                    type="text" 
                    name="companyName" 
                    value={form.companyName} 
                    onChange={handleChange} 
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>}
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block">
                <span className="text-gray-700 font-medium">Address Line 1*</span>
                <input 
                  type="text" 
                  name="addressLine1" 
                  value={form.addressLine1} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address"
                />
                {errors.addressLine1 && <p className="text-red-600 text-sm mt-1">{errors.addressLine1}</p>}
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">Country*</span>
                <select 
                  name="country" 
                  value={form.country} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Country</option>
                  {Object.keys(countryStateCityData).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">State*</span>
                <select 
                  name="state" 
                  value={form.state} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!form.country}
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">City*</span>
                <select 
                  name="city" 
                  value={form.city} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!form.state}
                >
                  <option value="">Select City</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-gray-700 font-medium">PIN Code</span>
                <input 
                  type="text" 
                  name="pincode" 
                  value={form.pincode} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter PIN code"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Subscription & Preferences */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription & Preferences</h3>
          
          <div className="space-y-6">
            <fieldset>
              <legend className="text-gray-700 font-medium mb-3">Subscription Plan*</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Basic', 'Pro', 'Enterprise'].map((plan) => (
                  <label key={plan} className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input 
                      type="radio" 
                      name="subscriptionPlan" 
                      value={plan} 
                      checked={form.subscriptionPlan === plan} 
                      onChange={handleChange} 
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="font-medium">{plan}</div>
                      <div className="text-sm text-gray-500">
                        {plan === 'Basic' && 'Free forever'}
                        {plan === 'Pro' && '$9.99/month'}
                        {plan === 'Enterprise' && 'Custom pricing'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                name="newsletter" 
                checked={form.newsletter} 
                onChange={handleChange} 
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Subscribe to newsletter and marketing emails</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button 
            type="button"
            onClick={handleSubmit} 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Complete Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
