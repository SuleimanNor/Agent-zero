import React from 'react';
import { AgentConfig } from '../types';
import { Settings, Cpu, Globe, BrainCircuit } from 'lucide-react';

interface SidebarProps {
  config: AgentConfig;
  setConfig: React.Dispatch<React.SetStateAction<AgentConfig>>;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig }) => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BrainCircuit size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-100 text-sm">Agent Zero</h1>
          <p className="text-xs text-blue-400">v2.0.0 (Gemini)</p>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Model Selection */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Cpu size={14} /> Model Configuration
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setConfig({ ...config, model: 'gemini-3-pro-preview' })}
              className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                config.model === 'gemini-3-pro-preview'
                  ? 'bg-blue-900/30 border-blue-500/50 text-blue-200'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-800/80'
              }`}
            >
              Gemini 3 Pro
              <div className="text-[10px] opacity-70">Complex reasoning & coding</div>
            </button>
             <button
              onClick={() => setConfig({ ...config, model: 'gemini-3-flash-preview' })}
              className={`w-full text-left px-3 py-2 rounded border text-sm transition-colors ${
                config.model === 'gemini-3-flash-preview'
                  ? 'bg-blue-900/30 border-blue-500/50 text-blue-200'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-800/80'
              }`}
            >
              Gemini 3 Flash
              <div className="text-[10px] opacity-70">Low latency & speed</div>
            </button>
          </div>
        </div>

        {/* Tools */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Globe size={14} /> Tools & Grounding
          </label>
          <div className="flex items-center justify-between bg-gray-800 p-3 rounded border border-gray-700">
            <span className="text-sm text-gray-300">Google Search</span>
            <button
              onClick={() => setConfig({ ...config, useSearch: !config.useSearch })}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                config.useSearch ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 ${
                config.useSearch ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-tight">
            Enables the agent to access real-time information via Google Search grounding.
          </p>
        </div>

        {/* System Prompt */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Settings size={14} /> System Instructions
          </label>
          <textarea
            value={config.systemInstruction}
            onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
            className="w-full h-32 bg-gray-950 border border-gray-700 rounded p-3 text-xs text-gray-300 focus:border-blue-500 focus:outline-none resize-none font-mono"
            placeholder="You are a helpful AI assistant..."
          />
        </div>
      </div>

       <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 text-center">
        Powered by Google GenAI SDK
      </div>
    </div>
  );
};

export default Sidebar;