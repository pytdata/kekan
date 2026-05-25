import React from 'react';

interface Props {
  title: string;
  action?: React.ReactNode;
}

const SectionHeader: React.FC<Props> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-3 px-1">
    <h2 className="text-lg font-extrabold text-slate-800">{title}</h2>
    {action}
  </div>
);

export default SectionHeader;
