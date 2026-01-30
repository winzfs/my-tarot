export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(200).json({ text: "Vercel 설정에서 API 키를 확인해주세요." });

    const prompt = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드가 나왔습니다. 아주 친절하고 신비로운 말투로 3문장 이내의 해석을 해주세요.`;

    try {
        // 모델명을 gemini-1.5-flash로 명시하고 v1beta를 사용합니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        // 구글에서 보낸 에러가 있는지 상세히 확인
        if (data.error) {
            console.error("Detailed Error:", data.error);
            // 만약 모델이 없다고 하면 gemini-pro로 대체 시도 메시지 출력
            return res.status(200).json({ 
                text: `AI 모델 설정 오류: ${data.error.message}. (API 키가 'Gemini API'용인지 확인이 필요합니다.)` 
            });
        }

        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            res.status(200).json({ text: aiText });
        } else {
            res.status(200).json({ text: "AI가 신호를 잡지 못했습니다. 다시 한번 카드를 뒤집어주세요." });
        }
    } catch (error) {
        res.status(500).json({ text: "서버 연결 중 문제가 발생했습니다." });
    }
}
