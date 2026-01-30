export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(200).json({ text: "Vercel 설정에서 API 키를 확인해주세요." });

    const prompt = `타로 해석가로서 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드를 해석해줘. 3문장 이내로 친절하게.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                // 안전 설정을 해제하여 답변 거부를 방지합니다.
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();

        // 에러가 있다면 상세 내용을 화면에 표시
        if (data.error) {
            return res.status(200).json({ text: `AI 에러 발생: ${data.error.message}` });
        }

        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            res.status(200).json({ text: aiText });
        } else {
            // 필터링 등으로 답변이 비어있을 때
            res.status(200).json({ text: "AI가 신비로운 기운에 답변을 망설이고 있네요. 다시 한번 카드를 뽑아주세요." });
        }
    } catch (error) {
        res.status(500).json({ text: "연결 오류가 발생했습니다." });
    }
}
