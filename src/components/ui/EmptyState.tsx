import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E3E7EF] shadow-xs max-w-lg mx-auto my-6">
      <div className="w-14 h-14 mx-auto mb-3.5 bg-[#EAF0FF] text-[#2554F4] rounded-2xl flex items-center justify-center shadow-xs">
        {icon}
      </div>
      <h3 className="text-base font-bold text-[#141722]">{title}</h3>
      <p className="mt-1 text-xs text-[#626B7A] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
