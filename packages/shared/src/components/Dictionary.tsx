'use client';

import React, { useState, useEffect } from 'react';
import { useDictionary } from '../hooks/useDictionary';
import type { DictResponse } from '../types/dictionary';
import { useTTS } from '../hooks/useTTS';
interface DictionaryProps {
  selectedWord?: string | null;
}

const Dictionary: React.FC<DictionaryProps> = ({ selectedWord }) => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<DictResponse | null>(null);
  const { lookupWord, loading, error } = useDictionary();
  const { speak } = useTTS();

  // Add effect to handle selectedWord changes
  useEffect(() => {
    if (selectedWord) {
      setWord(selectedWord);
      lookupWord(selectedWord)
        .then(data => setResult(data))
        .catch(err => console.error('Failed to look up word:', err));
    }
  }, [selectedWord, lookupWord]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    try {
      const data = await lookupWord(word);
      setResult(data);
    } catch (err) {
      console.error('Failed to look up word:', err);
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Dictionary</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word to look up"
            className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button 
            type="submit" 
            className="px-3 py-2 text-white rounded-lg disabled:bg-slate-300 transition-colors duration-200"
            disabled={loading || !word.trim()}
            title="Look up word"
          >
            <span className={loading ? 'inline-block animate-spin-slow' : ''}>
              {loading ? '⏳' : '🔍'}
            </span>
          </button>
        </div>
      </form>

      {error && (
        <div className="p-2 mb-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">{result.word}</h2>
          
          {/* Phonetics */}
          <div className="flex space-x-3 mb-3">
            {result.phonetics.map((phonetic, index) => (
              <div key={index} className="flex items-center space-x-2">
                {phonetic.text && <span className="text-slate-600">{phonetic.text}</span>}
                {phonetic.audio && (
                  <button
                    onClick={() => new Audio(phonetic.audio).play()}
                    className="p-1 text-indigo-600 hover:text-indigo-700"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Meanings */}
          {result.meanings.map((meaning, index) => (
            <div key={index} className="mb-4 p-3 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                {meaning.partOfSpeech}
              </h3>
              
              <ol className="list-decimal list-inside space-y-2">
                {meaning.definitions.map((def, defIndex) => (
                  <li key={defIndex} className="text-slate-700 pl-1">
                    <p className="inline">{def.definition}</p>
                    {def.example && (
                      <p className="mt-1 ml-4 text-slate-600 italic bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                        <span>{def.example}</span>
                        <button
                          onClick={() => def.example && speak(def.example)}
                          className="p-1 text-indigo-600 hover:text-indigo-700 ml-2"
                          title="Listen to example"
                        >
                          🔊
                        </button>
                      </p>
                    )}
                    {def.synonyms.length > 0 && (
                      <p className="mt-1 ml-4 text-slate-600">
                        <span className="font-medium">Synonyms: </span>
                        <span className="text-indigo-600">{def.synonyms.join(', ')}</span>
                      </p>
                    )}
                  </li>
                ))}
              </ol>

              {meaning.synonyms.length > 0 && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">Synonyms: </span>
                  <span className="text-indigo-600">{meaning.synonyms.join(', ')}</span>
                </div>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Dictionary;