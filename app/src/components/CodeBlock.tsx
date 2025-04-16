// src/components/CodeBlock.tsx
"use client";

import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CodeBlock = ({
  language,
  codeContent,
}: {
  language: string;
  codeContent: string;
}) => {
  const [buttonText, setButtonText] = React.useState("Copy");

  const handleCopy = () => {
    navigator.clipboard
      .writeText(codeContent)
      .then(() => {
        setButtonText("Copied!");
        setTimeout(() => setButtonText("Copy"), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy code: ", err);
        setButtonText("Error");
        setTimeout(() => setButtonText("Copy"), 2000);
      });
  };

  return (
    <div className="relative my-6 group">
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="!p-4 !bg-neutral-900/80 border border-neutral-800 rounded-md overflow-x-auto text-sm"
      >
        {String(codeContent).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 px-2 py-1 text-xs bg-neutral-700/80 text-neutral-300 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-150 cursor-pointer ${
          buttonText === "Copied!" ? "!opacity-100 bg-teal-600/90" : ""
        } ${buttonText === "Error" ? "!opacity-100 bg-red-600/90" : ""}`}
        aria-label="Copy code to clipboard"
        disabled={buttonText !== "Copy"}
      >
        {buttonText}
      </button>
    </div>
  );
};
