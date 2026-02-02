import React, { useState, useRef, useEffect } from 'react';
import { Send, StopCircle, RefreshCw, Link as LinkIcon, Bot, User as UserIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TerminalLog from './components/TerminalLog';
import { getGeminiResponseStream } from './services/geminiService';
import { Message, AgentConfig, LogEntry, ConnectionStatus, GroundingSource } from './types';
import ReactMarkdown from 'react-markdown';

const INITIAL_CONFIG: AgentConfig = {
  model: 'gemini-3-pro-preview',
  systemInstruction: 'You are a Senior Python Developer specializing in Generative AI. You are helpful, precise, and favor modular code.',
  useSearch: true,
  temperature: 0.7
};

const App: React.FC = () => {
  const [config, setConfig] = useState<AgentConfig>(INITIAL_CONFIG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    addLog('info', 'System initialized. Ready for user input.');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addLog = (level: LogEntry['level'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      message
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || status === ConnectionStatus.STREAMING) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStatus(ConnectionStatus.CONNECTING);
    addLog('info', `Processing user input: "${userMessage.content.substring(0, 30)}..."`);

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const modelMessageId = Date.now();
    let currentResponse = '';
    let foundSources: GroundingSource[] = [];

    // Add placeholder for model response
    setMessages(prev => [...prev, {
      role: 'model',
      content: '',
      timestamp: modelMessageId
    }]);

    setStatus(ConnectionStatus.STREAMING);

    if (config.useSearch) {
      addLog('warn', 'Grounding enabled: Initiating Google Search tool...');
    }

    try {
      await getGeminiResponseStream(
        userMessage.content,
        history,
        config,
        (textChunk) => {
          currentResponse += textChunk;
          setMessages(prev => prev.map(msg => 
            msg.timestamp === modelMessageId 
              ? { ...msg, content: currentResponse }
              : msg
          ));
        },
        (sources) => {
          foundSources = sources;
          setMessages(prev => prev.map(msg => 
            msg.timestamp === modelMessageId 
              ? { ...msg, sources: foundSources }
              : msg
          ));
          addLog('success', `Grounding: Found ${sources.length} sources from web.`);
        }
      );
      addLog('success', 'Response generation completed successfully.');
      setStatus(ConnectionStatus.COMPLETED);
    } catch (error: any) {
      console.error(error);
      addLog('error', `Generation failed: ${error.message || 'Unknown error'}`);
      setMessages(prev => prev.map(msg => 
        msg.timestamp === modelMessageId 
          ? { ...msg, content: currentResponse + '\n\n[Error: Connection interrupted or API failure]' }
          : msg
      ));
      setStatus(ConnectionStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
      <Sidebar config={config} setConfig={setConfig} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${
              status === ConnectionStatus.STREAMING ? 'bg-green-500 animate-pulse' : 
              status === ConnectionStatus.ERROR ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-sm font-medium text-gray-300">
              {status === ConnectionStatus.IDLE ? 'Standby' : 
               status === ConnectionStatus.CONNECTING ? 'Connecting...' :
               status === ConnectionStatus.STREAMING ? 'Agent Thinking...' :
               status === ConnectionStatus.COMPLETED ? 'Ready' : 'Error'}
            </span>
          </div>
          <button 
            onClick={() => setMessages([])}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} /> Clear Context
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
              <Bot size={48} className="mb-4" />
              <p className="text-sm">Initiate conversation to start the agent loop.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-blue-400" />
                </div>
              )}

              <div className={`max-w-[85%] lg:max-w-[75%] rounded-lg p-4 ${
                msg.role === 'user' 
                  ? 'bg-gray-800 border border-gray-700 text-gray-100' 
                  : 'bg-transparent text-gray-300'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800">
                  {/* We render markdown, especially useful for code blocks requested in the prompt */}
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-800/50">
                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-2 flex items-center gap-1">
                      <LinkIcon size={10} /> Sources Used
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded px-2 py-1 text-blue-400 truncate max-w-[200px] transition-colors"
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                  <UserIcon size={16} className="text-gray-300" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter instructions for the agent..."
              disabled={status === ConnectionStatus.STREAMING}
              className="w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none h-[52px] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || status === ConnectionStatus.STREAMING}
              className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {status === ConnectionStatus.STREAMING ? <StopCircle size={18} /> : <Send size={18} />}
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-gray-600">
             Agent Zero acts as a Senior Python Developer. Ask it to write the code you need.
          </div>
        </div>
      </div>

      {/* Logs Panel (Right side on large screens) */}
      <TerminalLog logs={logs} />
    </div>
  );
};

export default App;