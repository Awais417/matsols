import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FreeConsultation from "../pages/FreeConsultation";
import "./GlobalConsultationWidget.css";

const HIDDEN_PREFIXES = ["/admin", "/login"];
const HIDDEN_PATHS = ["/free-consultation"];

const GlobalConsultationWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const shouldHide =
    HIDDEN_PATHS.includes(location.pathname) ||
    HIDDEN_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (shouldHide) return null;

  return (
    <>
      <button
        type="button"
        className="global-chat-launcher"
        aria-label={isOpen ? "Close AI advisor" : "Open AI advisor"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="global-chat-launcher__pulse" aria-hidden="true"></span>
        <iconify-icon
          icon={isOpen ? "ri:close-line" : "ri:chat-1-line"}
        ></iconify-icon>
        <span className="global-chat-launcher__label">
          {isOpen ? "Close Advisor" : "AI Advisor"}
        </span>
      </button>

      {isOpen && (
        <div className="global-chat-modal-layer">
          <FreeConsultation embedded onRequestClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default GlobalConsultationWidget;
