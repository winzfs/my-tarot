export default async function handler(req, res) {
    // POST 요청이 아니면 거절 (보안)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { question, cardName, isReverse } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // Vercel 환경변수에서 가져옴

    // AI에게 보낼 명령문(프롬프트) 설정
    const prompt = `
        당신은 신비롭고 지혜로운 타로 해석가입니다. 
        사용자의 고민: "${question || '오늘의 전반적인 운세'}"
        뽑힌 카드: "${cardName}${isReverse ? ' (역방향)' : ' (정방향)'}"
        
        이 상황을 바탕으로 사용자에게 도움이 될 해석을 해주세요.
        1. 카드가 가진 상징적인 의미를 고민과 연결해 설명해줘.
        2. 부드럽고 따뜻한 말투(해요체)를 사용해줘.
        3. 3~4문장 정도로 핵심만 담아줘.
    `;

    try {
        // Gemini API 호출
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        
        // AI가 생성한 텍스트 추출
        const aiText = data.candidates[0].content.parts[0].text;

        // 성공 응답 보내기
        res.status(200).json({ text: aiText });
    } catch (error) {
        console.error("API 호출 에러:", error);
        res.status(500).json({ error: "AI가 신탁을 읽어오지 못했습니다. 다시 시도해 주세요." });
    }
}
