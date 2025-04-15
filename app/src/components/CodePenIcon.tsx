export const CodePenIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor" // Keep fill if you want it to inherit text color
    // Use passed className for size/margin. Default internal classes don't need vertical-align.
    className={`inline-block ${className}`}
  >
    {/* Path data... */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.605.862a.75.75 0 0 1 .79 0l10.5 6.5A.75.75 0 0 1 23.25 8v7a.75.75 0 0 1-.314.61l-10.5 7.5a.75.75 0 0 1-.872 0l-10.5-7.5A.75.75 0 0 1 .75 15V8a.75.75 0 0 1 .355-.638l10.5-6.5ZM2.25 13.654V9.457l3.147 2.248-3.147 1.949Zm9 7.389v-5.157L6.72 12.65l-3.867 2.395 8.397 5.998Zm1.5 0v-5.157l4.53-3.236 3.867 2.395-8.397 5.998Zm-4.647-9.248L12 14.578l3.897-2.783L12 9.382l-3.897 2.413Zm10.5-.09 3.147 1.949V9.457l-3.147 2.248Zm-1.383-.855-4.47-2.768V2.846l8.397 5.199-3.927 2.805Zm-10.44 0 4.47-2.768V2.846L2.853 8.045l3.927 2.805Z"
    />
  </svg>
);
