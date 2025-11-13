import { useState, useEffect } from "react";

/**
 * LIGNOVIA Personal Information Component
 * 
 * Features:
 * - Editable profile fields
 * - Save changes button
 * - Form validation
 * - Warm, minimal design
 */
export default function PersonalInformation({ profileData, onUpdate, loading }) {
  const [formData, setFormData] = useState({
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
  });
  const [errors, setErrors] = useState({});

  // Sync form data with profileData when it changes
  useEffect(() => {
    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
    });
  }, [profileData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onUpdate(formData);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
        Personal Information
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-[12px] bg-bg-light dark:bg-bg-dark border ${
              errors.firstName
                ? "border-error-light dark:border-error-dark"
                : "border-border-light dark:border-border-dark"
            } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-error-light dark:text-error-dark">
              {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-[12px] bg-bg-light dark:bg-bg-dark border ${
              errors.lastName
                ? "border-error-light dark:border-error-dark"
                : "border-border-light dark:border-border-dark"
            } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-error-light dark:text-error-dark">
              {errors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-[12px] bg-bg-light dark:bg-bg-dark border ${
              errors.email
                ? "border-error-light dark:border-error-dark"
                : "border-border-light dark:border-border-dark"
            } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-error-light dark:text-error-dark">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Phone Number <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs font-normal">(Optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-[12px] bg-bg-light dark:bg-bg-dark border ${
              errors.phone
                ? "border-error-light dark:border-error-dark"
                : "border-border-light dark:border-border-dark"
            } text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200`}
            placeholder="Enter your phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-error-light dark:text-error-dark">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-accent text-white rounded-[12px] font-semibold hover:bg-accent/90 transition-all duration-200 shadow-soft dark:shadow-soft-dark hover:shadow-soft-lg dark:hover:shadow-soft-lg-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

