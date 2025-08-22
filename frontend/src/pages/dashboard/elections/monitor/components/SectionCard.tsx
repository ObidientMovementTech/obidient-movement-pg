import React from 'react';

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tabIndex: number;
  role: string;
  onClick: () => void;
}

export default function SectionCard({ title, description, icon, onClick }: SectionCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition duration-200 border border-gray-200 hover:border-green-600 hover:bg-gray-50"
    >

      <div className="flex items-center mb-4 text-green-700 text-3xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}