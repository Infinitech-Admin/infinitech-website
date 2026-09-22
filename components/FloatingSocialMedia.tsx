// components/FloatingSocialMedia.tsx
"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Facebook,
  Phone,
  Mail,
  Globe,
  X,
} from "lucide-react";

const FloatingSocialMedia = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const socialLinks = [
    {
      href: "https://www.facebook.com/people/Infinitech-Advertising-Corp/100080647808810/",
      icon: Facebook,
      bgColor: "bg-blue-600 hover:bg-blue-700",
      title: "Facebook",
    },
    {
      href: "https://wa.me/639456754591",
      icon: MessageCircle,
      bgColor: "bg-green-600 hover:bg-green-700",
      title: "WhatsApp",
    },

    {
      href: "https://t.me/Developer_Justin",
      icon: Send, // you can replace this with a Telegram icon if you have one
      bgColor: "bg-sky-500 hover:bg-sky-600",
      title: "Telegram",
    },

    {
      href: "mailto:infinitechcorp.ph@gmail.com",
      icon: Mail,
      bgColor: "bg-red-600 hover:bg-red-700",
      title: "Email",
    },
    {
      href: "tel:+639195874915",
      icon: Phone,
      bgColor: "bg-blue-500 hover:bg-blue-600",
      title: "Phone",
    },
  ];

  return (
    <>
      {/* Desktop View - Always show all icons */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 pr-4">
        {socialLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-12 h-12 rounded-full ${link.bgColor} flex items-center justify-center shadow-lg transition-all hover:scale-110`}
              title={link.title}
            >
              <Icon className="w-6 h-6 text-white" />
            </a>
          );
        })}
      </div>

      {/* Mobile View - Toggle button and expandable menu */}
      <div className="md:hidden fixed right-4 top-1/2 -translate-y-1/2 z-40">
        {/* Toggle Button */}
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 flex items-center justify-center shadow-xl transition-all hover:scale-110"
            aria-label="Open social media menu"
          >
            <Globe className="w-7 h-7 text-white" />
          </button>
        ) : (
          /* Expanded Menu */
          <div className="relative flex flex-col-reverse">
            {/* Close Button at Bottom */}
            <button
              onClick={() => setIsExpanded(false)}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex items-center justify-center shadow-xl transition-all hover:scale-110 mt-3"
              aria-label="Close social media menu"
            >
              <X className="w-7 h-7 text-white" />
            </button>

            {/* Social Links */}
            <div className="flex flex-col-reverse gap-3 animate-fadeIn">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                const reverseIndex = socialLinks.length - 1 - index;
                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full ${link.bgColor} flex items-center justify-center shadow-lg transition-all hover:scale-110`}
                    style={{
                      animation: `slideUp 0.3s ease-out ${reverseIndex * 0.1}s both`,
                    }}
                    title={link.title}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingSocialMedia;
