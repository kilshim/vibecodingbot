import React, { useState, useEffect } from 'react';

interface ResultPanelProps {
  isLoading: boolean;
  resultText: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ isLoading, resultText }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (resultText) {
      setIsCopied(false);
    }
  }, [resultText]);

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-600">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">결과를 생성 중입니다...</p>
          <p>잠시만 기다려주세요.</p>
        </div>
      );
    }

    if (!resultText) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <div className="w-16 h-16 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.456-2.456L12.5 18l1.178-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.5 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">최종 결과 패널</h3>
          <p className="mt-2">왼쪽 채팅창에서 대화를 완료하면<br/>여기에 10가지 빌더 요청사항이 표시됩니다.</p>
        </div>
      );
    }
    
    const resultParts = resultText.split('\n').filter(line => line.trim() !== '');
    const header = resultParts.shift() || "생성된 요청 목록";
    const listItems = resultParts.map((item, index) => (
        <li key={index} className="mb-3 pl-2 text-gray-700 relative before:content-[''] before:absolute before:left-[-1rem] before:top-[0.6rem] before:w-1.5 before:h-1.5 before:bg-yellow-400 before:rounded-full">
            {item.replace(/^\d+\.\s*/, '')}
        </li>
    ));

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{header}</h2>
            <p className="text-gray-500 mb-6">아래 요청사항을 복사하여 바이브코딩 빌더에 사용해보세요.</p>
            <ul className="list-none ml-4 text-base space-y-2">
                {listItems}
            </ul>
        </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white p-8 border-l border-gray-200">
      <div className="flex-grow overflow-y-auto pr-4">
        {renderContent()}
      </div>
      {resultText && !isLoading && (
        <div className="flex-shrink-0 pt-6 mt-6 border-t border-gray-200">
          <button
            onClick={handleCopy}
            className={`w-full px-4 py-3 text-lg font-bold text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isCopied
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
            }`}
          >
            {isCopied ? '✅ 복사 완료!' : '결과 복사하기'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;