// api/tarot.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question, cards } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ text: "서버 설정 오류: API 키가 없습니다." });
  }

  const cardInfo = cards && Array.isArray(cards) ? cards.join(', ') : "선택된 카드 없음";

  const promptText = `타로 해석가로서 질문 "${question}"에 대해 뽑힌 카드 [${cardInfo}]를 해석해줘. 
  첫 줄에는 이 해석에 어울리는 신비로운 제목을 '## [제목]' 형식으로 작성하고, 
  그 다음 줄부터 과거, 현재, 미래의 흐름을 친절하게 대답해줘.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ text: `[AI 오류]: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "신탁을 읽어내지 못했습니다." });

  } catch (error) {
    res.status(500).json({ text: "서버 연결 실패" });
  }
}
