
import React, { useEffect, useState } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            const storedKey = sessionStorage.getItem('gemini_api_key');
            if (storedKey) {
                setApiKey(storedKey);
            } else {
                setApiKey('');
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!apiKey.trim()) {
            alert('API Key를 입력해주세요.');
            return;
        }
        sessionStorage.setItem('gemini_api_key', apiKey.trim());
        alert('API Key가 저장되었습니다.');
        onClose();
    };

    const handleDelete = () => {
        sessionStorage.removeItem('gemini_api_key');
        setApiKey('');
        alert('API Key가 삭제되었습니다.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl mx-4 transform transition-all">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        설정
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">API Key 관리</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Gemini API Key를 입력해주세요. 키는 브라우저의 세션 스토리지에만 저장됩니다.
                    </p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                            <input 
                                type="password" 
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                onClick={handleSave}
                                className="flex-1 py-2.5 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                저장
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="flex-1 py-2.5 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
