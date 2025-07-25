import React, { useState, useEffect, useCallback } from "react";

import ProfileForm from "./components/ProfileForm";

import ChatInterface from "./components/ChatInterface";

import useSimpleToast from "@/hooks/useSimpleToast";

import { v4 as uuidv4 } from "uuid";



function App() {

  // Client-side user ID management

  const [userId] = useState(() => {

    let storedUserId = localStorage.getItem("personaPostUserId");

    if (

      !storedUserId ||

      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(

        storedUserId

      )

    ) {

      storedUserId = uuidv4();

      localStorage.setItem("personaPostUserId", storedUserId);

    }

    return storedUserId;

  });



  const [profile, setProfile] = useState({

    interests: [],

    profession: "",

    hobbies: [],

    preferred_content_themes: [],

  });

  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const { showToast, ToastComponent } = useSimpleToast();



  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;



  // Memoized fetch function to prevent unnecessary recreations

  const fetchProfile = useCallback(async () => {

    let isMounted = true;

    const controller = new AbortController();



    try {

      const response = await fetch(`${backendUrl}/api/profile/${userId}`, {

        signal: controller.signal,

      });



      if (!isMounted) return;



      if (response.ok) {

        const data = await response.json();

        setProfile({

          interests: data.interests || [],

          profession: data.profession || "",

          hobbies: data.hobbies || [],

          preferred_content_themes: data.preferred_content_themes || [],

        });

        showToast("Profile loaded!", "success");

      } else if (response.status === 404) {

        showToast("No profile found. Please create your profile.", "info");

      } else {

        throw new Error("Failed to load profile");

      }

    } catch (error) {

      if (error.name !== "AbortError" && isMounted) {

        console.error("Error loading profile:", error);

        showToast(`Error loading profile: ${error.message}`, "error");

      }

    } finally {

      if (isMounted) {

        setIsProfileLoaded(true);

      }

    }



    return () => {

      isMounted = false;

      controller.abort();

    };

  }, [userId, backendUrl]);



  // Profile loading effect

  useEffect(() => {

    fetchProfile();

  }, [fetchProfile]);



  // Profile update function

  const updateProfile = useCallback(

    async (newProfileData) => {

      try {

        const response = await fetch(`${backendUrl}/api/profile/${userId}`, {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(newProfileData),

        });



        if (!response.ok) {

          const errorData = await response.json();

          throw new Error(errorData.details || "Failed to update profile");

        }



        const data = await response.json();

        setProfile({

          interests: data.profile.interests || [],

          profession: data.profile.profession || "",

          hobbies: data.profile.hobbies || [],

          preferred_content_themes: data.profile.preferred_content_themes || [],

        });

        showToast("Profile updated!", "success");

      } catch (error) {

        console.error("Error updating profile:", error);

        showToast(`Error updating profile: ${error.message}`, "error");

      }

    },

    [userId, backendUrl, showToast]

  );



  // Loading state

  if (!isProfileLoaded) {

    return (

      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">

        <p className="text-lg text-gray-700 dark:text-gray-300">

          Loading application...

        </p>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 font-inter antialiased">

      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-600 dark:text-blue-400 drop-shadow-lg">

        PersonaPost AI

      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* User Profile Section */}

        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">

          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">

            Your Persona Profile

          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">

            Tell us about yourself to get truly personalized content

            suggestions.

          </p>

          <ProfileForm currentProfile={profile} onSave={updateProfile} />

        </div>



        {/* AI Content Generator Section */}

        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow duration-300">

          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">

            AI Content Generator

          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">

            Chat with the AI for text, or generate captivating images directly!

          </p>

          <ChatInterface

            userId={userId}

            userProfile={profile}

            showToast={showToast}

          />

        </div>

      </div>

      <ToastComponent />

    </div>

  );

}



export default App;