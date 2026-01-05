
import React from 'react';
import { Message, Sender } from '../types';
import BotAvatar from './BotAvatar';

interface ChatBubbleProps {
  message: Message;
}

const renderFormattedText = (text: React.ReactNode): React.ReactNode => {
    if (typeof text !== 'string') {
        return text;
    }

    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
            {line.split(/(\*\*.*?\*\*)/g).map((part, partIndex) => 
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={partIndex}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
            {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
    ));
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <BotAvatar />}
      <div
        className={`max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? 'bg-yellow-400 text-black rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="prose prose-sm max-w-none text-inherit">{renderFormattedText(message.text)}</div>
      </div>
    </div>
  );
};

export default ChatBubble;