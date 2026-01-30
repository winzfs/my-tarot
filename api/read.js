export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { question, cardName, cards, isReverse } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(200).json({ text: "환경변수 설정 오류" });

  // 1. 카드가 배열(3장 모드)로 들어왔는지, 단일 이름(1장 모드)으로 들어왔는지 확인
  let cardInfo = "";
  if (cards && Array.isArray(cards)) {
    cardInfo = cards.join(', '); // 예: "태양(정방향), 달(역방향), 별(정방향)"
  } else if (cardName) {
    cardInfo = `${cardName}${isReverse ? '(역방향)' : '(정방향)'}`;
  }

  // 2. AI에게 보낼 프롬프트 구성
  const promptText = `타로 해석가로서 질문 "${question || '오늘의 운세'}"에 대해 뽑힌 카드 [${cardInfo}]를 해석해줘. 
  만약 카드가 3장이면 과거, 현재, 미래의 흐름으로 종합 해석하고, 1장이면 핵심 신탁을 들려줘.
  첫 줄에는 이 해석에 어울리는 신비로운 제목을 '## [제목]' 형식으로 작성하고, 그 다음 줄부터 친절하게 5문장 내외로 대답해줘.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(200).json({ text: `[API 오류]: ${data.error.message}` });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ text: aiText || "신탁을 읽어내지 못했습니다." });

  } catch (error) {
    res.status(500).json({ text: "서버 연결 실패" });
  }
}
