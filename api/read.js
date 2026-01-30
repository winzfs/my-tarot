export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question, cardName, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "환경변수 설정 오류" });

  const promptText = `타로 해석가로서 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드를 3문장 이내로 해석해줘.`;

  try {
    // 가장 원초적인 주소와 모델명 조합입니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // 여기서 에러가 또 나면 이건 100% 키 문제입니다.
      return res.status(200).json({ text: `[구글 최종 에러]: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "답변 생성 실패" });

  } catch (error) {
    res.status(500).json({ text: "연결 실패" });
  }
}
