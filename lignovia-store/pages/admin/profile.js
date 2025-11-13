import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PersonalInformation from "@/components/profile/PersonalInformation";
import ThemePreferences from "@/components/profile/ThemePreferences";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import SecuritySettings from "@/components/profile/SecuritySettings";
import AccountActions from "@/components/profile/AccountActions";
import { useToast } from "@/contexts/ToastContext";

export default function AdminProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    role: "Administrator",
  });
  const [preferences, setPreferences] = useState({
    theme: "light",
    fontSize: "medium",
    notifications: {
      productUpdates: true,
      orderAlerts: true,
      systemNotifications: true,
      inventoryWarnings: true,
      marketingEmails: false,
    },
    twoFactorAuth: false,
  });
  const [activeSessions, setActiveSessions] = useState([]);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/profile");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Load profile data
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        firstName: session.user.name?.split(" ")[0] || "",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        email: session.user.email || "",
        phone: session.user.phone || "",
        avatar: session.user.image || "",
        role: "Administrator",
      });
    }
  }, [session]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem("adminPreferences");
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    }
    
    // Sync theme from ThemeContext localStorage
    const savedTheme = localStorage.getItem("lignovia-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setPreferences((prev) => ({ ...prev, theme: savedTheme }));
    } else {
      // Default to light if no theme is set
      setPreferences((prev) => ({ ...prev, theme: "light" }));
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("adminPreferences", JSON.stringify(newPreferences));
  };

  // Handle profile update
  const handleProfileUpdate = async (updatedData) => {
    setLoading(true);
    try {
      // TODO: Implement API call to update profile
      // const response = await fetch("/api/admin/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(updatedData),
      // });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setProfileData((prev) => ({ ...prev, ...updatedData }));
      toastSuccess("Profile updated successfully!");
    } catch (error) {
      toastError("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle preference update
  const handlePreferenceUpdate = (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value,
    };
    savePreferences(newPreferences);
    toastSuccess("Preferences updated successfully!");
  };

  // Handle notification toggle
  const handleNotificationToggle = (key, value) => {
    const newPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    };
    savePreferences(newPreferences);
    toastSuccess("Notification preferences updated!");
  };

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Profile - LIGNOVIA Admin</title>
        </Head>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Profile & Preferences - LIGNOVIA Admin</title>
        <meta name="description" content="Manage your profile and preferences" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
          Profile & Preferences
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Manage your profile details, preferences, and security settings
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="mb-6">
        <ProfileHeader
          profileData={profileData}
          onAvatarChange={(avatar) => handleProfileUpdate({ avatar })}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div>
          <PersonalInformation
            profileData={profileData}
            onUpdate={handleProfileUpdate}
            loading={loading}
          />
        </div>

        {/* Theme & Display Preferences */}
        <div>
          <ThemePreferences
            preferences={preferences}
            onUpdate={handlePreferenceUpdate}
          />
        </div>

        {/* Notification Preferences */}
        <div>
          <NotificationPreferences
            preferences={preferences}
            onToggle={handleNotificationToggle}
          />
        </div>

        {/* Security Settings */}
        <div>
          <SecuritySettings
            preferences={preferences}
            onPreferenceUpdate={handlePreferenceUpdate}
            activeSessions={activeSessions}
          />
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-6">
        <AccountActions />
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  // Check admin access using helper function
  const adminCheck = await import("@/lib/checkAdmin");
  const result = await adminCheck.checkAdmin(context);

  // If result contains redirect, return it (user is not authorized)
  if (result.redirect) {
    return result;
  }

  // Access granted - session is available in result.session
  // Session is handled by useSession hook, no need to pass it as prop
  // This avoids serialization issues with undefined values
  return {
    props: {},
  };
}

