export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ text: "Vercel 환경변수에 API 키가 없습니다." });
    }

    const prompt = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드를 해석해줘. 아주 친절하고 신비로운 말투로 3문장 이내로 작성해줘.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // 데이터 구조를 안전하게 추출 (Optional Chaining 사용)
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            res.status(200).json({ text: aiText });
        } else {
            console.error("API 구조 에러:", data);
            res.status(500).json({ text: "AI가 응답을 생성하지 못했습니다. (API 응답 확인 필요)" });
        }
    } catch (error) {
        res.status(500).json({ text: "서버 내부 오류가 발생했습니다." });
    }
}
