import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return <Info size={14} className="text-blue-400" />;
      case 'warn': return <AlertTriangle size={14} className="text-yellow-400" />;
      case 'error': return <AlertTriangle size={14} className="text-red-500" />;
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 border-t border-gray-800 lg:border-t-0 lg:border-l lg:w-80 transition-all duration-300">
      <div className="flex items-center px-4 py-3 border-b border-gray-800 bg-gray-900/50">
        <Terminal size={16} className="text-gray-400 mr-2" />
        <h3 className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">Agent Logs</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3" ref={scrollRef}>
        {logs.length === 0 && (
          <div className="text-gray-600 italic">System ready. Waiting for input...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 animate-fadeIn">
            <span className="text-gray-600 shrink-0 mt-0.5">[{log.timestamp}]</span>
            <div className="mt-0.5 shrink-0">{getIcon(log.level)}</div>
            <span className={`${
              log.level === 'error' ? 'text-red-400' : 
              log.level === 'success' ? 'text-green-400' : 
              'text-gray-300'
            } break-all`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
      
      <div className="p-2 border-t border-gray-800 bg-gray-900/30 text-[10px] text-gray-500 flex justify-between">
        <span>Running: React Runtime</span>
        <span>Env: Production</span>
      </div>
    </div>
  );
};

export default TerminalLog;