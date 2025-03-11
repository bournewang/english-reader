'use client';

import React, { useState } from 'react';
import Dictionary from './Dictionary';
import { useTTS } from '../hooks/useTTS';
import { useTranslation } from '../hooks/useTranslation';
import { useWordList } from '../hooks/useWordList';
import type { Article } from '../types';
import { cleanWord } from '../utils/helper';
import '../styles/output.css';
// import { SettingsProvider } from '../contexts/SettingsContext';
// import ArticleImage from './ArticleImage';

export interface ReaderProps {
  article: Article;
}

const Reader: React.FC<ReaderProps> = ({ article }) => {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [speakingPid, setSpeakingPid] = useState<string | null>(null);
  const { speak, speaking } = useTTS();
  const [translatingPid, setTranslatingPid] = useState<number | null>(null);
  const { translating, translate } = useTranslation();
  const { words, addWord, removeWord } = useWordList();

  const handleTranslate = async (paragraphId: number) => {
    if (translations[paragraphId]) return;
    
    setTranslatingPid(paragraphId);
    const paragraph = article.paragraphs[paragraphId];
    const translation = await translate(paragraph.content);
    setTranslatingPid(null);
    
    setTranslations(prev => ({
      ...prev,
      [paragraphId]: translation
    }));
  };

  const handleSpeak = async (text: string, id: string) => {
    setSpeakingPid(id);
    await speak(text);
    setSpeakingPid(null);
  };

  const handleWordClick = (word: string) => {
    const cleanedWord = cleanWord(word);
    if (words.has(cleanedWord)) {
      removeWord(cleanedWord);
    } else {
      setSelectedWord(cleanedWord);
      addWord(cleanedWord);
    }
  };

  const highlightWords = (text: string) => {
    if (!words || !text) return text;
    
    const textParts = text.split(/(\s+)/);
    return textParts.map((part, index) => {
      const cleanPart = cleanWord(part);
      if (cleanPart) {  // Only process non-empty parts
        return (
          <span 
            key={index}
            onClick={() => handleWordClick(part)}
            className={`cursor-pointer ${
              words.has(cleanPart) 
                ? 'bg-yellow-100 hover:bg-yellow-200' 
                : 'hover:bg-gray-100'
            } transition-colors duration-200`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
  <>
    <div className="flex flex-col md:flex-row gap-4">
      {/* Main content */}
      <div className="flex-1 p-2 sm:p-4">
        <h1 className="text-2xl font-bold text-center mb-6">{highlightWords(article.title)}</h1>
        
        <div className="space-y-6">
          {Object.entries(article.paragraphs || {}).map(([id, paragraph]) => (
            <div 
              key={id} 
              className="group relative bg-white p-3 sm:p-4 pr-12 sm:pr-16 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {paragraph.type === 'text' ? (
                <p className="text-slate-800 leading-relaxed">
                  {highlightWords(paragraph.content)}
                </p>
              ) : paragraph.type === 'image' ? (
                <figure className="text-center">
                  <img
                    src={paragraph.content}
                    alt={paragraph.description || ''}
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                  {paragraph.description && (
                    <figcaption className="mt-2 text-sm text-gray-600 italic">
                      {paragraph.description}
                    </figcaption>
                  )}
                </figure>
              ) : null}
              
              {paragraph.type === 'text' && translations[id] && (
                <p className="mt-2 text-slate-600 bg-slate-50 p-2 rounded">
                  {translations[id]}
                </p>
              )}
              
              {paragraph.type === 'text' && (
                <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSpeak(paragraph.content, id)}
                    className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-full shadow-sm"
                    title="Text to Speech"
                  >
                    <span className={speaking && speakingPid === id ? 'inline-block animate-spin-slow' : ''}>
                      {speaking && speakingPid === id ? '⏳' : '🔊'}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTranslate(Number(id))}
                    className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-full shadow-sm"
                    title="Translate"
                  >
                    <span className={translating && translatingPid === Number(id) ? 'inline-block animate-spin-slow' : ''}>
                      {translating && translatingPid === Number(id) ? '⏳' : '🌐'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dictionary sidebar */}
      <div className="md:w-2/5 lg:w-1/3 sticky top-0 h-screen overflow-y-auto">
        <Dictionary selectedWord={selectedWord} />
        {!selectedWord && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center gap-2">
                <span>👆</span>
                <span>Click any word in the article to look it up</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🔍</span>
                <span>Use the search box above to look up any word</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🌟</span>
                <span>Clicked words are automatically saved to your word list</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🔊</span>
                <span>Click the speaker icon to hear pronunciation</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🌐</span>
                <span>Click the globe icon to translate paragraphs</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  </>
  );
};

export default Reader;