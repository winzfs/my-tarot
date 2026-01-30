export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.status(200).json({ text: "Vercel 설정에서 API 키를 확인해주세요." });

    const prompt = `타로 해석가로서 질문 "${question}"에 대해 "${cardName}${isReverse ? '(역방향)' : '(정방향)'}" 카드가 나왔습니다. 아주 친절하고 신비로운 말투로 3문장 이내의 해석을 해주세요.`;

    try {
        // [수정 포인트] 모델명을 가장 최신 버전인 gemini-1.5-flash-latest 로 변경
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            // 에러 메시지에 모델 목록을 확인하라는 힌트가 있으니, 상세 이유를 화면에 띄웁니다.
            return res.status(200).json({ 
                text: `구글 AI 에러: ${data.error.message}. (모델명을 gemini-1.5-flash-latest로 시도했습니다.)` 
            });
        }

        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            res.status(200).json({ text: aiText });
        } else {
            res.status(200).json({ text: "AI가 신호를 잡지 못했습니다. 다시 한번 카드를 뒤집어주세요." });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ text: "서버 연결 중 오류가 발생했습니다." });
    }
}
