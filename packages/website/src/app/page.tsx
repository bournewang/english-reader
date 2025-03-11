'use client';

import React, { useState } from 'react';
import { Reader } from '@english-reader/shared';
import type { Article } from '@english-reader/shared';
import { useArticleExtractor } from '@/hooks/useArticleExtractor';
import { UrlForm } from '@/components/UrlForm';

export default function UrlReaderPage() {
  const [url, setUrl] = useState('');
  const [article, setArticle] = useState<Article | null>(null);
  const { extractArticle, loading, error } = useArticleExtractor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const data = await extractArticle(url);
    if (data) {
      setArticle(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* URL Input Section */}
      <div className={`${!article ? 'min-h-screen flex items-center justify-center px-4' : 'bg-white shadow-sm border-b'}`}>
        <div className={`w-full ${!article ? 'max-w-4xl mx-auto' : 'container mx-auto px-4 py-4'}`}>
          <UrlForm
            url={url}
            onUrlChange={setUrl}
            onSubmit={handleSubmit}
            loading={loading}
            inline={!!article}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg 
                          text-red-600 max-w-2xl mx-auto">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Reader Section */}
      {article && (
        <div className="mx-auto px-4 py-6">
          <Reader article={article} />
        </div>
      )}
    </div>
  );
} 