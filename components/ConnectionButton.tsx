import React from 'react';

interface ConnectionButtonProps {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
}

const ConnectionButton: React.FC<ConnectionButtonProps> = ({ connected, connect, disconnect, isLoading }) => {
  return (
    <button 
      className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 ease-in-out active:scale-95 ${
        isLoading 
          ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-60" 
          : "hover:cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-102"
      }`}
      onClick={connected ? disconnect : connect}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        connected ? "Disconnect wallet" : "Connect wallet"
      )}
    </button>
  );
};

export default ConnectionButton;