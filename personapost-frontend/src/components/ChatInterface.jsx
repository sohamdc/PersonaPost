import React, { useState, useRef, useEffect } from "react";
import {
  Loader2,
  Image as ImageIcon,
  MessageSquareText,
  X,
} from "lucide-react";

const ChatInterface = ({ userId, userProfile, showToast }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [variations, setVariations] = useState([]);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [showVariationPicker, setShowVariationPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerateImage = async (promptText) => {
    setIsLoading(true);
    try {
      const imageResponse = await fetch(`${backendUrl}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          imagePrompt: promptText,
        }),
      });

      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.details || "Failed to generate image");
      }

      const imageData = await imageResponse.json();
      return imageData.url;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePost = async () => {
    if (currentInput.trim() === "" || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      type: "text",
      content: currentInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      const textResponse = await fetch(
        `${backendUrl}/api/generate-text-variations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            userMessage: currentInput,
            profileData: userProfile,
          }),
        }
      );

      if (!textResponse.ok) {
        const errorData = await textResponse.json();
        throw new Error(
          errorData.details || "Failed to generate text variations"
        );
      }

      const textData = await textResponse.json();
      setVariations(textData.variations);
      setShowVariationPicker(true);
      setSelectedVariationIndex(0);
    } catch (error) {
      console.error("Error generating post:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "ai",
          type: "text",
          content: `Error: ${error.message}`,
          roleType: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVariation = async () => {
    setIsLoading(true);
    try {
      const selectedVariation = variations[selectedVariationIndex];
      const imageUrl = await handleGenerateImage(selectedVariation.content);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "ai",
          type: "post",
          content: {
            text: selectedVariation.content,
            imageUrl: imageUrl,
          },
        },
      ]);
      setShowVariationPicker(false);
    } catch (error) {
      console.error("Error generating image:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          role: "ai",
          type: "text",
          content: `Error: ${error.message}`,
          roleType: "error",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGeneratePost();
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-320px)] w-full max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 text-left font-bold text-xl text-blue-700 dark:text-blue-300">
        Your AI Assistant
      </div>

      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl shadow-sm text-left ${
                msg.role === "user"
                  ? "bg-blue-500 text-white dark:bg-blue-700"
                  : msg.roleType === "error"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border border-red-300"
                  : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              } transition-all duration-150 ease-in-out`}
            >
              {msg.type === "post" ? (
                <div className="space-y-3">
                  <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="whitespace-pre-wrap text-left">
                      {msg.content.text}
                    </p>
                  </div>
                  <img
                    src={msg.content.imageUrl}
                    alt="Generated post content"
                    className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openImageModal(msg.content.imageUrl)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/400x300/e0e0e0/000000?text=Image+Load+Error";
                    }}
                  />
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-left">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {showVariationPicker && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
            <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
              Choose your preferred version:
            </h3>
            <div className="space-y-3 mb-4">
              {variations.map((variation, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer border transition-all ${
                    selectedVariationIndex === index
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedVariationIndex(index)}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      checked={selectedVariationIndex === index}
                      readOnly
                      className="mt-1 mr-2"
                    />
                    <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                      {variation.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowVariationPicker(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVariation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                    Generating Image...
                  </>
                ) : (
                  "Confirm Selection"
                )}
              </button>
            </div>
          </div>
        )}

        {isLoading && !showVariationPicker && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center space-x-2 text-gray-800 dark:text-gray-200 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 dark:text-blue-400" />
              <span>Generating your post...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex flex-col gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
        <textarea
          placeholder="Describe your post idea (e.g., 'My morning coffee routine')..."
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow resize-none rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 shadow-sm p-2 bg-gray-50 dark:bg-gray-700 dark:text-gray-100"
          rows={3}
          disabled={isLoading}
        />

        <button
          onClick={handleGeneratePost}
          disabled={isLoading || currentInput.trim() === ""}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out px-4 py-2 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating Post...
            </>
          ) : (
            "Generate Post"
          )}
        </button>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged post content"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
