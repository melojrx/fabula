import React, { useState } from 'react';
import type { StoryFormData, OutputFormat, StoryResult } from './types';
import { generateStory } from './services/geminiService';
import StoryForm from './components/StoryForm';
import StoryDisplay from './components/StoryDisplay';

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

  const handleGenerateStory = async () => {
    if (!formData.name || !formData.age || !formData.theme || !formData.characteristics) {
        setError("Por favor, preencha todos os campos para criar a história.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setStoryResult(null);

    try {
      const result = await generateStory(formData, outputFormat);
      setStoryResult(result);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Um erro inesperado aconteceu.");
      }
    } finally {
      setIsLoading(false);
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
          />
          <StoryDisplay
            storyResult={storyResult}
            isLoading={isLoading}
            error={error}
          />
        </main>
      </div>
    </div>
  );
}