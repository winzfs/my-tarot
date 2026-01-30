export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { question, cardName, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "환경변수 설정 오류" });

  const promptText = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드를 해석해줘. 아주 신비롭고 친절하게 3문장 이내로 작성해줘.`;

  try {
    // 사용자님의 목록에서 확인된 최신 모델명을 그대로 사용합니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // 만약 3 Flash마저 Quota(할당량) 에러가 난다면, 그때는 2.0 Flash로 돌아가는 것이 가장 안전합니다.
      return res.status(200).json({ text: `[Gemini 3 Flash 에러]: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "AI가 신탁을 읽어내지 못했습니다." });

  } catch (error) {
    res.status(500).json({ text: "연결 실패" });
  }
}
