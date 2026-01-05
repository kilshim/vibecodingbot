
import React, { useState } from 'react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onRestart: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, onRestart }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-white border-t border-gray-200 gap-3">
       <button
        type="button"
        onClick={onRestart}
        disabled={isLoading}
        className="p-3 rounded-full text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="대화 재시작"
        title="대화 재시작"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
        </svg>
      </button>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isLoading ? '봇이 응답을 생성중입니다...' : '메시지를 입력하세요...'}
        disabled={isLoading}
        className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="p-3 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        aria-label="메시지 전송"
        title="메시지 전송"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </form>
  );
};

export default MessageInput;