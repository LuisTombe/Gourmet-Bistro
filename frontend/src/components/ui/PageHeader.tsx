import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  action,
}) => {
  const renderedAction = action || actions;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#e7dcdb]">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#360802] tracking-tight leading-tight">
            {title}
          </h1>
          {badge && (
            typeof badge === 'string' ? (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#fdedea] text-[#f73b20] border border-[#f84d35]/20">
                {badge}
              </span>
            ) : badge
          )}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-sm text-[#74514b] font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {renderedAction && (
        <div className="flex items-center gap-2.5 flex-wrap">
          {renderedAction}
        </div>
      )}
    </div>
  );
};
