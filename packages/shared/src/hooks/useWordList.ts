import { useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api'
// import type { WordList } from '../types';
// import type { ApiResponse } from '../types/api';

const STORAGE_KEY = 'local_word_list';

export const useWordList = () => {
  const [words, setWords] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//   const { api } = createApi({ baseURL: baseUrl });

  useEffect(() => {
    // Try to load words from server first
    api.get('/unfamiliar_word/get')
      .then(response => {
        if (response.data.data) {
          setWords(new Set(response.data.data));
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // If server request fails, load from localStorage
        const storedWords = localStorage.getItem(STORAGE_KEY);
        if (storedWords) {
          setWords(new Set(JSON.parse(storedWords)));
        }
        setIsAuthenticated(false);
      });
  }, []);

  // Save to localStorage whenever words change
  useEffect(() => {
    if (!isAuthenticated && words.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...words]));
    }
  }, [words, isAuthenticated]);

  const addWord = useCallback(async (word: string, article_id?: number) => {
    if (isAuthenticated) {
      try {
        await api.post('/unfamiliar_word/add', { word, article_id });
      } catch (error) {
        console.error('Failed to add word to server:', error);
        return;
      }
    }
    setWords(prev => new Set([...prev, word]));
  }, [isAuthenticated]);

  const removeWord = useCallback(async (word: string, article_id?: number) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/unfamiliar_word/delete`, {
          data: { word, article_id }
        });
      } catch (error) {
        console.error('Failed to remove word from server:', error);
        return;
      }
    }
    setWords(prev => {
      const next = new Set(prev);
      next.delete(word);
      return next;
    });
  }, [isAuthenticated]);

  const isKnownWord = useCallback((word: string) => {
    return words.has(word.toLowerCase());
  }, [words]);

  return {
    words,
    addWord,
    removeWord,
    isKnownWord,
    isAuthenticated
  };
};