import React from 'react';
import type { StoryFormData, OutputFormat } from '../../types';
import BookIcon from './icons/BookIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import SparklesIcon from './icons/SparklesIcon';
import StopIcon from './icons/StopIcon';

interface StoryFormProps {
  formData: StoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<StoryFormData>>;
  outputFormat: OutputFormat;
  setOutputFormat: React.Dispatch<React.SetStateAction<OutputFormat>>;
  onSubmit: () => void;
  isLoading: boolean;
  onCancel: () => void;
}

const StoryForm: React.FC<StoryFormProps> = ({ formData, setFormData, outputFormat, setOutputFormat, onSubmit, isLoading, onCancel }) => {
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
      
      <button 
        onClick={isLoading ? onCancel : onSubmit} 
        className={`w-full font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center
          ${isLoading 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
          }
        `}
      >
        {isLoading ? (
          <>
            <StopIcon className="w-5 h-5 mr-2" />
            <span>Cancelar Geração</span>
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            <span>Gerar História</span>
          </>
        )}
      </button>
    </div>
  );
};

export default StoryForm;