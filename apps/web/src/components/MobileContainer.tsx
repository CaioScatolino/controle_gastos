import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className="min-h-screen w-full flex justify-center bg-[#06080C] sm:py-6 sm:px-4 selection:bg-indigo-500 selection:text-white">
      <div
        className={`w-full sm:max-w-[430px] min-h-screen sm:min-h-[860px] sm:max-h-[920px] bg-background sm:rounded-[36px] sm:border sm:border-surface-border shadow-2xl flex flex-col relative overflow-hidden overflow-y-auto ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
