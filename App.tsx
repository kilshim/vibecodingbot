
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender } from './types';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';
import ResultPanel from './components/ResultPanel';
import { generateBuilderRequests, generateFollowUpQuestion, FollowUpQuestion, generateContinuingChat } from './services/geminiService';
import BotAvatar from './components/BotAvatar';
import SettingsModal from './components/SettingsModal';

const cleanMarkdown = (text: string): string => {
  return text.replace(/\*\*/g, '');
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatPhase, setChatPhase] = useState(0); // 0:init/reset, 1-5:Questions, 6:confirm, 7:generate, 8: post-chat
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [builderResult, setBuilderResult] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (text: React.ReactNode, sender: Sender) => {
    const newMessage: Message = { id: Date.now().toString() + Math.random(), text, sender };
    setMessages(prev => [...prev, newMessage]);
  };

  const createBotMessageComponent = (response: FollowUpQuestion, examplesHeader: string) => (
    <div>
        <p className="font-bold my-2">{cleanMarkdown(response.question)}</p>
        <p className="text-sm text-gray-600 mb-1">{examplesHeader}</p>
        <ul className="list-disc list-inside text-sm text-gray-600">
            {response.examples.map((ex, i) => <li key={i}>{cleanMarkdown(ex)}</li>)}
        </ul>
        {response.suggestion && (
             <div className="mt-3 p-3 bg-yellow-100/50 rounded-lg text-sm border border-yellow-200/50">
                <p className="font-semibold text-yellow-800">💡 이렇게 답해보세요:</p>
                <p className="text-gray-700 mt-1">"{cleanMarkdown(response.suggestion)}"</p>
            </div>
        )}
    </div>
  );

  const handleBotResponse = useCallback(async () => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));

    try {
        switch (chatPhase) {
        case 1: {
            const initialQuestion = (
                <div>
                    <p className="font-bold mb-2">어떤 종류의 앱을 만들고 싶으신가요?</p>
                    <p className="mb-2">떠오르는 아이디어를 자유롭게 이야기해주세요.</p>
                    <p className="text-sm text-gray-600 mb-1">참고로 이런 아이디어는 어떠세요?</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>요즘 유행하는 챌린지를 친구들과 함께 기록하고 공유하는 소셜 앱</li>
                        <li>매일의 기분과 생각을 간단한 이모티콘으로 기록하는 감정 일기 앱</li>
                        <li>내가 읽은 책들을 등록하고, 인상 깊은 구절을 저장하는 북 아카이브 앱</li>
                    </ul>
                </div>
            );
            addMessage(initialQuestion, Sender.BOT);
            break;
        }
        case 2: {
            addMessage("좋은 아이디어네요!", Sender.BOT);
            await new Promise(res => setTimeout(res, 500));
            const response = await generateFollowUpQuestion('CORE_FEATURE', userResponses);
            addMessage(createBotMessageComponent(response, "예를 들면 이런 것들이 있을 수 있겠네요."), Sender.BOT);
            break;
        }
        case 3: {
            addMessage("알겠습니다. 그렇다면,", Sender.BOT);
            await new Promise(res => setTimeout(res, 500));
            const response = await generateFollowUpQuestion('VIBE', userResponses);
            addMessage(createBotMessageComponent(response, "이런 분위기를 생각해 볼 수 있어요."), Sender.BOT);
            break;
        }
        case 4: {
            addMessage("흥미롭네요! 다음으로,", Sender.BOT);
            await new Promise(res => setTimeout(res, 500));
            const response = await generateFollowUpQuestion('TARGET_AUDIENCE', userResponses);
            addMessage(createBotMessageComponent(response, "예를 들어 이런 사용자는 어떨까요?"), Sender.BOT);
            break;
        }
        case 5: {
            addMessage("거의 다 왔습니다!", Sender.BOT);
            await new Promise(res => setTimeout(res, 500));
            const response = await generateFollowUpQuestion('GOAL', userResponses);
            addMessage(createBotMessageComponent(response, "이런 목표를 생각해 볼 수 있겠네요."), Sender.BOT);
            break;
        }
        case 6: {
            const confirmationMessage = (
                <div>
                  <p>충분히 아이디어가 구체화된 것 같아요!</p>
                  <p className="my-2">이제 이 내용을 바탕으로 실제 개발에 필요한 '빌더 요청' 10가지를 생성해 드릴까요?</p>
                  <p className="text-sm text-gray-600">"네" 또는 "아니요"로 답해주세요.</p>
                </div>
            );
            addMessage(confirmationMessage, Sender.BOT);
            break;
        }
        case 7: {
            addMessage("좋습니다! 대화 내용을 바탕으로 최종 결과를 생성하고 있어요. 잠시만 기다려주세요...", Sender.BOT);
            const result = await generateBuilderRequests(userResponses);
            setBuilderResult(result);
            addMessage("결과 생성이 완료되었습니다. 오른쪽 패널에서 확인해주세요! 추가적으로 궁금한 점이나 수정하고 싶은 부분이 있다면 계속 대화해주세요.", Sender.BOT);
            setChatPhase(8); // Move to post-generation chat phase
            break;
        }
        }
    } catch (error) {
        console.error("Error handling bot response:", error);
        addMessage("죄송합니다. 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.", Sender.BOT);
    } finally {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatPhase, userResponses]);

  const handleRestart = () => {
    setMessages([]);
    setUserResponses([]);
    setBuilderResult('');
    setChatPhase(0); // Triggers the effect below to restart the conversation.
  };

  useEffect(() => {
    // This effect handles both the initial conversation start and subsequent phase changes.
    if (chatPhase === 0) {
      // This state is reached on initial load and after a restart.
      // We transition to the first question phase.
      setChatPhase(1);
    } else if (chatPhase > 0 && chatPhase < 8) {
      // For the main questionnaire phases, we trigger the bot's response logic.
      handleBotResponse();
    }
    // Phase 8 (post-chat) is handled by user input in handleSendMessage
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatPhase]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    addMessage(text, Sender.USER);
    
    if (chatPhase >= 1 && chatPhase <= 5) {
      setUserResponses(prev => [...prev, text]);
      setChatPhase(prev => prev + 1);
    } else if (chatPhase === 6) {
      const positiveResponses = ["네", "좋아요", "생성해줘", "ㅇ", "yes", "y", "예"];
      if (positiveResponses.some(res => text.toLowerCase().includes(res))) {
        setChatPhase(7);
      } else {
        addMessage("알겠습니다. 준비가 되시면 다시 요청해주세요.", Sender.BOT);
        setChatPhase(8);
      }
    } else if (chatPhase >= 7) { // Continuous chat after results (phase 7 is generating, phase 8 is ready)
        setIsLoading(true);
        try {
            const responseText = await generateContinuingChat(userResponses, text);
            addMessage(responseText, Sender.BOT);
        } catch (error) {
            console.error("Error in continuous chat:", error);
            addMessage("죄송합니다, 답변을 생성하는 중 오류가 발생했습니다.", Sender.BOT);
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="flex h-screen w-full font-sans border-4 border-yellow-200 rounded-3xl overflow-hidden shadow-2xl bg-gray-100 relative">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Chat Panel */}
      <div className="flex flex-col w-full md:w-1/2 h-full bg-[#bacee0] shadow-inner">
        <header className="bg-yellow-400 text-black p-4 flex items-center justify-between shadow-md z-10">
          <div className="w-8"></div> {/* Spacer for centering */}
          <h1 className="font-bold text-lg">바이브코딩 아이디어 챗</h1>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-500 transition-colors"
            title="설정"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
          </button>
        </header>
        <main className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            {isLoading && chatPhase !== 7 && (
              <div className="flex items-end gap-2 justify-start">
                 <BotAvatar />
                 <div className="max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md bg-white text-gray-500 rounded-bl-none">
                   <div className="flex items-center space-x-1">
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                     <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                   </div>
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </main>
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} onRestart={handleRestart} />
      </div>

      {/* Result Panel */}
      <div className="hidden md:flex flex-col w-1/2 h-full bg-white">
          <ResultPanel isLoading={isLoading && chatPhase === 7} resultText={builderResult} />
      </div>
    </div>
  );
};

export default App;
