export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question, cardName, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "환경변수 설정 오류" });

  const promptText = `${question}에 대해 타로 카드 ${cardName}${isReverse ? '(역방향)' : '(정방향)'}의 의미를 친절하게 설명해줘.`;

  try {
    // 주소를 v1으로, 모델을 gemini-pro로 변경
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // 에러가 나면 구글이 주는 메시지 그대로 출력 (범인을 잡기 위해)
      return res.status(200).json({ text: `상세 에러: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "답변을 생성할 수 없습니다." });

  } catch (error) {
    res.status(500).json({ text: "서버 연결 실패" });
  }
}
