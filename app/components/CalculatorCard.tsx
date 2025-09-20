import React from "react";
import { cn } from "@/lib/utils"; // optional helper if you use shadcn-style cn()

type CalculatorCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
};

export const CalculatorCard: React.FC<CalculatorCardProps> = ({
  title,
  description,
  icon,
  buttonText = "Get it Now",
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center rounded-2xl bg-white p-6 shadow-md transition-transform hover:scale-[1.02] hover:shadow-xl min-h-[350px] md:min-h-[380px]",
        className
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-40 h-40 md:w-52 md:h-52 rounded-full bg-orange-100 text-orange-500 text-3xl mb-4 flex-shrink-0">
        <div className="animate-spin" style={{ animationDuration: '8s' }}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      {/* Button */}
      <button
        onClick={onClick}
        className="rounded-lg bg-black px-4 py-2 text-white font-medium hover:bg-gray-800 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
};
