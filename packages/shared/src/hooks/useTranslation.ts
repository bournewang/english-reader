import { useState } from 'react';
// import { useSettings } from '../contexts/SettingsContext';
import { api } from '../utils/api';

export const useTranslation = () => {
  const [translating, setTranslating] = useState(false);
  // const { settings } = useSettings();

  const translate = async (text: string): Promise<string> => {
    try {
      setTranslating(true);

      const response = await api.post<string>('/translate/text', {
        text,
        target_lang: 'zh-CN'
      });
      // console.log("translate response: ", response.data)
      return response.data || '';
    } catch (error) {
      console.error('Translation error:', error);
      return '';
    } finally {
      setTranslating(false);
    }
  };

  return { translate, translating };
};