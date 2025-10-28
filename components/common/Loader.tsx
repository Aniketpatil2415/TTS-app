import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message = 'Thinking...' }) => (
  <div className="flex flex-col items-center justify-center space-y-3 p-4">
    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin"></div>
    {message && <p className="text-gray-400 text-sm">{message}</p>}
  </div>
);

export default Loader;
