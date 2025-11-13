import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useToast } from "@/contexts/ToastContext";

/**
 * LIGNOVIA Profile Header Component
 * 
 * Features:
 * - User avatar with edit overlay
 * - User name and role
 * - Email display
 * - Premium, welcoming design
 */
export default function ProfileHeader({ profileData, onAvatarChange }) {
  const { toastSuccess, toastError } = useToast();
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar || "");
  const fileInputRef = useRef(null);

  // Sync avatar preview with profileData
  useEffect(() => {
    if (profileData.avatar) {
      setAvatarPreview(profileData.avatar);
    }
  }, [profileData.avatar]);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toastError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setAvatarPreview(result);
      onAvatarChange?.(result);
      toastSuccess("Avatar updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  const fullName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() || profileData.email?.split("@")[0] || "Admin";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card p-8 md:p-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[18px] overflow-hidden bg-hover-light dark:bg-hover-dark border-4 border-accent/20 dark:border-accent/30 shadow-soft dark:shadow-soft-dark">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={fullName}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/20 dark:bg-accent/30">
                <span className="text-3xl md:text-4xl font-semibold text-accent">
                  {initials}
                </span>
              </div>
            )}
          </div>
          
          {/* Edit Overlay */}
          <button
            onClick={handleAvatarClick}
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent text-white shadow-md hover:bg-accent/90 transition-all duration-200 flex items-center justify-center group-hover:scale-110"
            aria-label="Change avatar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2 tracking-tight">
            {fullName}
          </h2>
          
          {/* Role Badge */}
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/20 dark:bg-accent/30 text-accent border border-accent/30">
              {profileData.role || "Administrator"}
            </span>
          </div>

          {/* Email */}
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {profileData.email || "No email provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

