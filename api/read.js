export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question, cardName, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "환경변수 설정 오류" });

// promptText 부분 수정
const promptText = `타로 해석가로서 질문 "${question}"에 대해 뽑힌 카드 [${cards.join(', ')}]를 과거, 현재, 미래 순서로 해석해줘. 
첫 줄에는 이 전체 해석을 관통하는 신비롭고 멋진 제목을 '## [제목]' 형식으로 한 줄 작성하고, 그 다음 줄부터 해석을 시작해줘.`;

  try {
    // 'gemini-flash-latest'는 무료 티어에서 가장 범용적으로 열려 있는 모델명입니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `[최종 확인 에러]: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "AI가 답변을 생성하지 못했습니다." });

  } catch (error) {
    res.status(500).json({ text: "서버 연결 실패" });
  }
}
