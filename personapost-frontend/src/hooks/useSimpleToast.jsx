import { useState } from "react";

function useSimpleToast() {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("info"); // 'info', 'success', 'error'

  const showToast = (message, type = "info", duration = 3000) => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  };

  const ToastComponent = () => {
    if (!toastMessage) return null;

    let bgColor = "bg-blue-500";
    if (toastType === "success") bgColor = "bg-green-500";
    if (toastType === "error") bgColor = "bg-red-500";

    return (
      <div
        className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white ${bgColor} z-50 transition-transform duration-300 transform translate-y-0 opacity-100`}
      >
        {toastMessage}
      </div>
    );
  };

  return { showToast, ToastComponent };
}

export default useSimpleToast;
