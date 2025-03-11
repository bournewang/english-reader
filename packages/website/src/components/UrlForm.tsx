'use client';

import React from 'react';

interface UrlFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  inline?: boolean;
}

export const UrlForm: React.FC<UrlFormProps> = ({
  url,
  onUrlChange,
  onSubmit,
  loading,
  inline = false
}) => {
  const inputClasses = `flex-1 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm 
    ${inline ? 'p-2' : 'p-4 text-lg bg-white/50 backdrop-blur-sm border-gray-200'}`;
  
  const buttonClasses = `bg-blue-500 text-white rounded-lg hover:bg-blue-600 
    disabled:bg-blue-300 transition-all duration-200 font-medium
    shadow-sm hover:shadow-md hover:translate-y-[-1px] whitespace-nowrap 
    ${inline ? 'px-4 py-2' : 'px-8 py-4 text-lg'}`;

  const form = (
    <div className="flex gap-3 w-full">
      <input
        type="url"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Paste any article URL here..."
        className={inputClasses}
        required
      />
      <button
        type="submit"
        className={buttonClasses}
        disabled={loading || !url.trim()}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block animate-spin-slow">⏳</span>
            Loading...
          </span>
        ) : (
          'Read'
        )}
      </button>
    </div>
  );

  if (inline) {
    return (
      <form onSubmit={onSubmit} className="max-w-5xl mx-auto flex items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">English Reader</h1>
        <div className="flex flex-1 justify-center gap-2">{form}</div>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">English Reader</h1>
        <p className="text-gray-600 text-lg">Improve your English reading skills with any article</p>
      </div>
      <form onSubmit={onSubmit} className="w-full max-w-2xl">
        {form}
      </form>
    </div>
  );
}; 