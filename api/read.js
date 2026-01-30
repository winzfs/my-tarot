export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question, cardName, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "Vercel 설정에서 API 키를 확인해주세요." });

  // 프롬프트를 깔끔하게 정리
  const promptText = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드의 해석을 3문장 이내로 친절하게 해줘.`;

  try {
    // 1. 모델 경로를 명확하게 지정 (v1beta/models/gemini-1.5-flash)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ]
      })
    });

    const data = await response.json();

    // 2. 구글 API 자체 에러 확인
    if (data.error) {
      console.error("Google API Error Detail:", data.error);
      return res.status(200).json({ 
        text: `AI 통신 오류: ${data.error.message} (코드: ${data.error.code})` 
      });
    }

    // 3. 답변 추출 (안전하게 접근)
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ text: aiText });
    } else {
      // 답변이 차단되었거나 비어있는 경우
      res.status(200).json({ text: "AI가 신중하게 생각 중입니다. 다시 한 번 카드를 뽑아주세요." });
    }

  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ text: "서버 연결 중 예기치 못한 오류가 발생했습니다." });
  }
}
