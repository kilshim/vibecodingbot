
import { GoogleGenAI, Type } from "@google/genai";

export interface FollowUpQuestion {
    question: string;
    examples: string[];
    suggestion: string;
}

const getAiClient = () => {
  let apiKey = sessionStorage.getItem('gemini_api_key');

  // Vercel 등 배포 환경에서 process.env 접근 시 에러 방지 및 환경 변수 우선순위 처리
  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // process is not defined, ignore
    }
  }

  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 설정 메뉴에서 API Key를 입력해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFollowUpQuestion = async (
    questionType: 'CORE_FEATURE' | 'VIBE' | 'TARGET_AUDIENCE' | 'GOAL',
    userResponses: string[]
): Promise<FollowUpQuestion> => {
    let prompt = '';
    const idea = userResponses[0] || '';
    const coreFeature = userResponses[1] || '';
    const vibe = userResponses[2] || '';
    const targetAudience = userResponses[3] || '';

    switch (questionType) {
        case 'CORE_FEATURE':
            prompt = `사용자가 앱 아이디어를 구체화하도록 돕는 AI 챗봇입니다. 사용자는 방금 만들고 싶은 앱에 대해 다음과 같이 말했습니다: "${idea}"
        
            이제 이 앱의 가장 핵심적인 기능에 대해 질문해야 합니다.
            
            다음 지침에 따라 JSON 객체를 생성해주세요 (마크다운 형식은 제외):
            - "question": 사용자에게 앱의 핵심 기능을 묻는 친절하고 명확한 질문입니다.
            - "examples": 사용자의 아이디어("${idea}")와 관련된 창의적인 핵심 기능 예시 3개입니다.
            - "suggestion": 사용자가 어떻게 답변하면 좋을지 보여주는 구체적인 답변 예시입니다. 이 예시는 사용자의 아이디어("${idea}")에 맞춰져야 합니다.`;
            break;
        case 'VIBE':
            prompt = `사용자가 앱 아이디어를 구체화하도록 돕는 AI 챗봇입니다. 사용자의 아이디어는 다음과 같습니다:
            - 앱 종류: "${idea}"
            - 핵심 기능: "${coreFeature}"
    
            이제 이 앱의 전반적인 '분위기' 또는 '바이브'에 대해 질문해야 합니다.
    
            다음 지침에 따라 JSON 객체를 생성해주세요 (마크다운 형식은 제외):
            - "question": 사용자에게 앱의 분위기에 대해 묻는 친절하고 감성적인 질문입니다.
            - "examples": 사용자의 아이디어("${idea}")와 관련된 창의적인 분위기 예시 3개입니다.
            - "suggestion": 사용자가 어떻게 답변하면 좋을지 보여주는 구체적인 답변 예시입니다. 이 예시는 사용자의 아이디어("${idea}")에 맞춰져야 합니다.`;
            break;
        case 'TARGET_AUDIENCE':
            prompt = `사용자가 앱 아이디어를 구체화하도록 돕는 AI 챗봇입니다. 사용자의 아이디어는 다음과 같습니다:
            - 앱 종류: "${idea}"
            - 핵심 기능: "${coreFeature}"
            - 앱 분위기: "${vibe}"

            이제 이 앱의 '주요 타겟 사용자'는 누구인지 질문해야 합니다.
    
            다음 지침에 따라 JSON 객체를 생성해주세요 (마크다운 형식은 제외):
            - "question": 사용자에게 앱의 타겟 사용자에 대해 묻는 명확한 질문입니다.
            - "examples": 사용자의 아이디어("${idea}")를 사용할 만한 다양한 사용자 그룹 예시 3개입니다.
            - "suggestion": 사용자가 어떻게 답변하면 좋을지 보여주는 구체적인 답변 예시입니다.`;
            break;
        case 'GOAL':
            prompt = `사용자가 앱 아이디어를 구체화하도록 돕는 AI 챗봇입니다. 사용자의 아이디어는 다음과 같습니다:
            - 앱 종류: "${idea}"
            - 핵심 기능: "${coreFeature}"
            - 앱 분위기: "${vibe}"
            - 타겟 사용자: "${targetAudience}"

            이제 이 앱을 통해 사용자가 달성하길 바라는 '최종 목표'는 무엇인지 질문해야 합니다.
    
            다음 지침에 따라 JSON 객체를 생성해주세요 (마크다운 형식은 제외):
            - "question": 사용자에게 앱의 궁극적인 목표에 대해 묻는 질문입니다.
            - "examples": 사용자의 아이디어("${idea}")를 통해 사용자가 얻을 수 있는 가치나 경험에 대한 예시 3개입니다.
            - "suggestion": 사용자가 어떻게 답변하면 좋을지 보여주는 구체적인 답변 예시입니다.`;
            break;
    }


    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "사용자에게 할 질문" },
            examples: {
                type: Type.ARRAY,
                description: "영감을 줄 수 있는 예시 3개",
                items: { type: Type.STRING }
            },
            suggestion: { type: Type.STRING, description: "사용자를 위한 답변 예시" }
        },
        required: ["question", "examples", "suggestion"]
    };

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as FollowUpQuestion;

    } catch (error) {
        console.error(`Error generating ${questionType} question:`, error);
        return {
            question: "다음 질문을 생성하는 데 오류가 발생했습니다. 설정에서 API Key를 확인해주세요.",
            examples: [],
            suggestion: ""
        };
    }
};


export const generateBuilderRequests = async (
  userResponses: string[]
): Promise<string> => {
  const [idea, coreFeature, vibe, targetAudience, goal] = userResponses;
  const prompt = `
당신은 사용자의 앱 아이디어를 구체화하여 '바이브코딩 빌더'가 사용할 수 있는 개발 지시사항을 생성하는 AI 어시스턴트입니다.

다음은 사용자와의 대화 요약입니다:
- 앱 종류: ${idea}
- 핵심 기능: ${coreFeature}
- 앱 분위기: ${vibe}
- 타겟 사용자: ${targetAudience}
- 최종 목표: ${goal}

이 내용을 바탕으로, 실제 개발 초기 단계에 사용할 수 있는 구체적이고 실행 가능한 지시사항 10개를 한국어로, 번호가 매겨진 목록 형식으로 생성해주세요.

**매우 중요한 규칙:**
1. 첫 번째 지시사항은 사용자와의 대화 내용 전체를 요약하여 앱의 핵심 정체성을 담은, 구체적이고 명확한 앱 제작 요청이어야 합니다. 예를 들어, 단순히 '${idea}' 앱을 만들어달라고 하는 대신, '${targetAudience}를 위한 ${vibe} 분위기의, ${coreFeature} 기능이 있는 ${idea} 앱을 만들어줘' 와 같이 종합적인 내용을 담아주세요.
2. 이후 9개의 지시사항은 첫 번째 요청을 바탕으로 점진적으로 기능을 추가하고 구체화하는 순서로 작성되어야 합니다. (예: 기본 UI 생성 -> 핵심 기능 구현 -> 세부 디자인 추가 -> 데이터베이스 설정 등)
3. 각 요청은 '...을 만들어줘', '...을 디자인해줘'와 같이 개발자가 실행할 수 있는 명확한 한국어 지시사항이어야 합니다.
4. 결과물은 UI/UX 디자인, 핵심 로직, 데이터 관리 등 개발의 여러 측면을 균형 있게 포함해야 합니다.

최종 결과물은 "좋습니다! 대화 내용을 바탕으로 실제 개발에 필요한 '초기 요청 10가지'를 생성했습니다." 라는 문장으로 시작해야 하며, 그 뒤에 번호 목록이 와야 합니다.
결과에서 마크다운 형식(**)은 절대 사용하지 마세요.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text.replace(/\*\*/g, '');
  } catch (error) {
    console.error("Error generating content from Gemini:", error);
    return "죄송합니다. 빌더 요청을 생성하는 데 실패했습니다. 설정에서 API Key를 확인해주세요.";
  }
};


export const generateContinuingChat = async (
  userResponses: string[],
  newMessage: string
): Promise<string> => {
  const [idea, coreFeature, vibe, targetAudience, goal] = userResponses;
  const prompt = `
당신은 사용자의 앱 아이디어 구체화를 돕는 AI 어시스턴트입니다. 
이미 사용자와의 대화를 통해 아래와 같은 아이디어를 정리했고, 10가지 개발 요청사항도 생성해서 전달했습니다.

- 앱 종류: ${idea || '아직 정의되지 않음'}
- 핵심 기능: ${coreFeature || '아직 정의되지 않음'}
- 앱 분위기: ${vibe || '아직 정의되지 않음'}
- 타겟 사용자: ${targetAudience || '아직 정의되지 않음'}
- 최종 목표: ${goal || '아직 정의되지 않음'}

이제 사용자가 대화를 계속 이어나가고 있습니다. 다음은 사용자의 새로운 메시지입니다:
"${newMessage}"

이 메시지에 대해 친절하고 유용하게 답변해주세요. 사용자가 기존 아이디어를 수정하고 싶어하는지, 아니면 그냥 대화를 나누고 싶은지 파악하고 그에 맞게 응답하세요. 답변의 핵심 키워드나 중요한 부분은 **굵은 글씨**로 강조하고, 가독성을 위해 필요하다면 문단을 나눠주세요. 답변은 반드시 한국어로 해주세요.
`;
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error)
 {
    console.error("Error generating continuing chat from Gemini:", error);
    return "죄송합니다. 답변을 생성하는 데 실패했습니다. 설정에서 API Key를 확인해주세요.";
  }
};
