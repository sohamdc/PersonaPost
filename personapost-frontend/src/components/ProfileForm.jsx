import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// All Shadcn UI components removed. Using simple HTML inputs/buttons with Tailwind CSS classes.

// Define schema for profile validation (using Zod)
const profileSchema = z.object({
  interests: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  profession: z.string().optional(),
  hobbies: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  preferred_content_themes: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
});

const ProfileForm = ({ currentProfile, onSave }) => {
  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interests: Array.isArray(currentProfile.interests)
        ? currentProfile.interests.join(", ")
        : "",
      profession: currentProfile.profession || "",
      hobbies: Array.isArray(currentProfile.hobbies)
        ? currentProfile.hobbies.join(", ")
        : "",
      preferred_content_themes: Array.isArray(
        currentProfile.preferred_content_themes
      )
        ? currentProfile.preferred_content_themes.join(", ")
        : "",
    },
  });

  useEffect(() => {
    form.reset({
      interests: Array.isArray(currentProfile.interests)
        ? currentProfile.interests.join(", ")
        : "",
      profession: currentProfile.profession || "",
      hobbies: Array.isArray(currentProfile.hobbies)
        ? currentProfile.hobbies.join(", ")
        : "",
      preferred_content_themes: Array.isArray(
        currentProfile.preferred_content_themes
      )
        ? currentProfile.preferred_content_themes.join(", ")
        : "",
    });
  }, [currentProfile, form]);

  const onSubmit = (values) => {
    onSave(values);
  };

  return (
    // Using native form elements and applying Tailwind CSS classes for styling
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 text-left"
    >
      <div>
        <label
          htmlFor="interests"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Interests (comma-separated)
        </label>
        <input
          id="interests"
          {...form.register("interests")}
          placeholder="e.g., technology, reading, hiking"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        {form.formState.errors.interests && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.interests.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="profession"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Profession
        </label>
        <input
          id="profession"
          {...form.register("profession")}
          placeholder="e.g., Software Engineer, Marketing Manager"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        {form.formState.errors.profession && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.profession.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="hobbies"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Hobbies (comma-separated)
        </label>
        <input
          id="hobbies"
          {...form.register("hobbies")}
          placeholder="e.g., photography, cooking, gaming"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        {form.formState.errors.hobbies && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.hobbies.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="preferred_content_themes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Preferred Content Themes (comma-separated)
        </label>
        <textarea
          id="preferred_content_themes"
          {...form.register("preferred_content_themes")}
          placeholder="e.g., productivity, personal growth, daily life updates"
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 resize-y"
        ></textarea>
        {form.formState.errors.preferred_content_themes && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.preferred_content_themes.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        Save Profile
      </button>
    </form>
  );
};

export default ProfileForm;
