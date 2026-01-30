export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(200).json({ text: "Vercel 설정에서 API 키를 확인해주세요." });

    const prompt = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드가 나왔어. 아주 친절하고 신비로운 말투로 3문장 이내의 해석을 해줘.`;

    try {
        // v1beta 대신 v1을 사용하고 경로를 명확히 합니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 에러 상세 출력
        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(200).json({ text: `AI 서비스 오류: ${data.error.message}` });
        }

        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            res.status(200).json({ text: aiText });
        } else {
            res.status(200).json({ text: "AI가 카드의 기운을 읽지 못했습니다. 잠시 후 다시 시도해 주세요." });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ text: "서버 연결 오류가 발생했습니다." });
    }
}
