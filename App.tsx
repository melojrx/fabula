import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { StoryFormData, OutputFormat, StoryResult } from './types';
import { generateStory } from './services/geminiService';

// --- ICONS (Defined at top-level) ---

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5 5 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />
    </svg>
  );

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.5 17.25l1.197-.398a3.375 3.375 0 002.456-2.456L16.5 13.5l.398 1.197a3.375 3.375 0 002.456 2.456L20.25 18l-1.197.398a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// --- UI COMPONENTS (Defined at top-level) ---

interface StoryFormProps {
  formData: StoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoryFormData>>;
  outputFormat: OutputFormat;
  setOutputFormat: React.Dispatch<React.SetStateAction<OutputFormat>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const StoryForm: React.FC<StoryFormProps> = ({ formData, setFormData, outputFormat, setOutputFormat, onSubmit, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormatChange = (format: OutputFormat) => {
    setOutputFormat(format);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Crie uma história mágica</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome da Criança</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Maria" />
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
          <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: 5" />
        </div>
      </div>
      
      <div>
        <label htmlFor="characteristics" className="block text-sm font-medium text-gray-700 mb-1">Características</label>
        <textarea name="characteristics" id="characteristics" value={formData.characteristics} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Adora animais e é muito curiosa"></textarea>
      </div>

      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Tema da História</label>
        <input type="text" name="theme" id="theme" value={formData.theme} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Uma aventura na floresta encantada" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Formato da História</label>
        <div className="flex space-x-2">
          <button onClick={() => handleFormatChange('text')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${outputFormat === 'text' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <BookIcon className="w-5 h-5" />
            <span>Texto</span>
          </button>
          <button onClick={() => handleFormatChange('audio')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${outputFormat === 'audio' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            <SpeakerIcon className="w-5 h-5" />
            <span>Áudio</span>
          </button>
        </div>
      </div>
      
      <button onClick={onSubmit} disabled={isLoading} className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:scale-100 flex items-center justify-center">
        {isLoading ? <LoadingSpinner /> : <SparklesIcon className="w-5 h-5 mr-2" />}
        {isLoading ? 'Criando magia...' : 'Gerar História'}
      </button>
    </div>
  );
};

interface StoryDisplayProps {
  storyResult: StoryResult | null;
  isLoading: boolean;
  error: string | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ storyResult, isLoading, error }) => {
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Efeito para limpar recursos de áudio quando uma nova história é gerada ou o componente é desmontado
  useEffect(() => {
    // Redefinir o estado e limpar o áudio quando uma nova história é fornecida.
    setPlaybackState('idle');

    // Retorna a função de limpeza.
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [storyResult]);

  const handlePlayback = useCallback(() => {
    if (!storyResult?.audioBuffer) return;

    // Caso 1: Áudio está pausado, então o retomamos.
    if (playbackState === 'paused' && audioContextRef.current) {
      audioContextRef.current.resume();
      setPlaybackState('playing');
      return;
    }

    // Caso 2: Áudio está tocando, então o pausamos.
    if (playbackState === 'playing' && audioContextRef.current) {
      audioContextRef.current.suspend();
      setPlaybackState('paused');
      return;
    }

    // Caso 3: Áudio está inativo, então o iniciamos do começo.
    if (playbackState === 'idle') {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = context.createBufferSource();
      source.buffer = storyResult.audioBuffer;
      source.connect(context.destination);
      
      source.onended = () => {
        setPlaybackState('idle');
        audioSourceRef.current = null; 
      };

      source.start();
      setPlaybackState('playing');
      
      audioContextRef.current = context;
      audioSourceRef.current = source;
    }
  }, [playbackState, storyResult?.audioBuffer]);

  const renderPlayButton = () => {
    let text = 'Tocar Áudio';
    let icon = <SpeakerIcon className="w-5 h-5" />;

    if (playbackState === 'playing') {
      text = 'Pausar Áudio';
      icon = <PauseIcon className="w-5 h-5" />;
    } else if (playbackState === 'paused') {
      text = 'Continuar';
    }

    return (
      <button onClick={handlePlayback} className="w-full flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold space-x-2">
        {icon}
        <span>{text}</span>
      </button>
    );
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500"></div>
          <p className="mt-4 text-lg font-semibold text-gray-600">Aguarde, estamos criando um mundo de fantasia...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="font-bold text-red-700">Oops! Algo deu errado.</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      );
    }
    
    if (storyResult) {
      return (
        <div className="space-y-6">
          {storyResult.audioBuffer && (
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Ouça a História</h3>
              {renderPlayButton()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Leia a História</h3>
            <div className="prose prose-lg max-w-none p-6 bg-white rounded-xl shadow-inner text-gray-700 leading-relaxed">
              <p>{storyResult.text}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookIcon className="w-20 h-20 text-gray-300" />
        <p className="mt-4 text-xl font-semibold text-gray-500">Sua história aparecerá aqui!</p>
        <p className="text-gray-400">Preencha os campos e clique em "Gerar História" para começar a aventura.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-blue-100 p-6 md:p-8 rounded-2xl shadow-lg min-h-[300px] md:min-h-full flex flex-col">
      {renderContent()}
    </div>
  );
};

// --- MAIN APP COMPONENT ---

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
          <h1 className="text-4xl md:text-5xl font-black text-blue-800 tracking-tight">
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
