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
    <div className="h-[100dvh] w-full flex justify-center bg-[#06080C] sm:py-6 sm:px-4 selection:bg-indigo-500 selection:text-white overflow-hidden">
      <div
        className={`w-full sm:max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[920px] bg-background sm:rounded-[40px] sm:border sm:border-surface-border shadow-2xl flex flex-col relative overflow-hidden overflow-y-auto smooth-scroll ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
