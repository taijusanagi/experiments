// src/components/CopyButton.tsx
"use client";

import React from "react";

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export const CopyButton = ({ textToCopy, className }: CopyButtonProps) => {
  const [buttonText, setButtonText] = React.useState("Copy");

  const handleCopy = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setButtonText("Copied!");
        setTimeout(() => setButtonText("Copy"), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setButtonText("Error");
        setTimeout(() => setButtonText("Copy"), 2000);
      });
  };

  const baseClasses =
    "px-2 py-1 text-xs bg-neutral-700/80 text-neutral-300 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 cursor-pointer";
  const copiedClasses = "!opacity-100 bg-teal-600/90";
  const errorClasses = "!opacity-100 bg-red-600/90";

  const combinedClassName = `${baseClasses} ${
    buttonText === "Copied!" ? copiedClasses : ""
  } ${buttonText === "Error" ? errorClasses : ""} ${className || ""}`;

  return (
    <button
      onClick={handleCopy}
      className={combinedClassName}
      aria-label="Copy code to clipboard"
      disabled={buttonText !== "Copy"}
    >
      {buttonText}
    </button>
  );
};
