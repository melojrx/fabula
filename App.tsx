import React, { useState, useRef } from 'react';
import type { StoryFormData, OutputFormat, StoryResult } from './types';
import { generateStory, generateImage } from './services/geminiService';
import StoryForm from './src/components/StoryForm';
import StoryDisplay from './src/components/StoryDisplay';

export default function App() {
  const [formData, setFormData] = useState<StoryFormData>({
    age: '',
    name: '',
    characteristics: '',
    theme: '',
  });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [storyResult, setStoryResult] = useState<StoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const imageAbortControllerRef = useRef<AbortController | null>(null);

  const handleGenerateStory = async () => {
    if (!formData.name || !formData.age || !formData.theme || !formData.characteristics) {
        setError("Por favor, preencha todos os campos para criar a história.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setStoryResult(null);
    setImageUrl(null);
    setImageError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await generateStory(formData, outputFormat, controller.signal);
      setStoryResult(result);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        console.log('Geração da história cancelada.');
        setError('A geração da história foi cancelada.');
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Um erro inesperado aconteceu.");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleGenerateImage = async () => {
    if (!storyResult?.text) return;

    setIsImageLoading(true);
    setImageUrl(null);
    setImageError(null);

    const controller = new AbortController();
    imageAbortControllerRef.current = controller;

    try {
      const resultUrl = await generateImage(storyResult.text, controller.signal);
      setImageUrl(resultUrl);
    } catch (e) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setImageError(e.message);
      }
    } finally {
      setIsImageLoading(false);
      imageAbortControllerRef.current = null;
    }
  };

  const handleCancelImageGeneration = () => {
    if (imageAbortControllerRef.current) {
      imageAbortControllerRef.current.abort();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-yellow-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-800 tracking-tight">
            Gerador de Histórias Infantis
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Dê vida à imaginação com histórias personalizadas por IA
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StoryForm 
            formData={formData}
            setFormData={setFormData}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            onSubmit={handleGenerateStory}
            isLoading={isLoading}
            onCancel={handleCancelGeneration}
          />
          <StoryDisplay
            storyResult={storyResult}
            isLoading={isLoading}
            error={error}
            onGenerateImage={handleGenerateImage}
            isImageLoading={isImageLoading}
            imageUrl={imageUrl}
            imageError={imageError}
            onCancelImageGeneration={handleCancelImageGeneration}
          />
        </main>
      </div>
    </div>
  );
}