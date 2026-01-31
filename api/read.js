<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ARCANUM | 점성술사의 방</title>
    <style>
        :root { --gold: #e2b857; --bg: #0a0a0c; --glass: rgba(255, 255, 255, 0.05); }
        body { background: var(--bg); color: #eee; font-family: 'Apple SD Gothic Neo', sans-serif; margin: 0; display: flex; flex-direction: column; align-items: center; overflow-x: hidden; touch-action: none; }
        
        /* 상단 게임 화면 */
        #game-container { width: 100vw; height: 320px; background: radial-gradient(circle at center, #1a1a2e 0%, #000 100%); position: relative; border-bottom: 2px solid var(--gold); box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        canvas { width: 100%; height: 100%; display: block; }

        /* 대화창 연출 */
        #chat-stage { width: 92%; max-width: 500px; margin-top: -30px; z-index: 100; display: none; }
        .astro-box { background: rgba(15, 15, 25, 0.95); border: 2px solid var(--gold); border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px); }
        .astro-text { font-size: 1.1rem; line-height: 1.7; color: var(--gold); margin-bottom: 20px; min-height: 60px; text-shadow: 0 0 5px rgba(226,184,87,0.3); }

        /* 입력 폼 */
        .input-group { display: flex; gap: 10px; animation: fadeIn 0.5s ease; }
        input { flex: 1; padding: 14px; border-radius: 12px; border: 1px solid var(--gold); background: #000; color: #fff; font-size: 1rem; outline: none; }
        .btn-next { padding: 10px 25px; background: var(--gold); border: none; border-radius: 12px; font-weight: bold; cursor: pointer; color: #000; }
        
        /* 모드 선택 버튼 */
        .mode-group { display: none; gap: 10px; flex-direction: column; animation: fadeIn 0.5s ease; }
        .btn-mode { padding: 15px; background: rgba(226,184,87,0.1); border: 1px solid var(--gold); color: var(--gold); border-radius: 12px; cursor: pointer; font-weight: bold; text-align: center; }
        .btn-mode:active { background: var(--gold); color: #000; }

        /* 타로 카드 배치 */
        #tarot-stage { display: none; width: 92%; max-width: 500px; text-align: center; padding: 20px 0; }
        .cards-grid { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-bottom: 25px; }
        .card { width: 85px; height: 140px; perspective: 1000px; cursor: pointer; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: 0.8s; transform-style: preserve-3d; }
        .card.flipped .card-inner { transform: rotateY(180deg); }
        .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border: 1px solid var(--gold); border-radius: 10px; overflow: hidden; }
        .card-front { background: linear-gradient(135deg, #1a1a2e 0%, #000 100%); display: flex; align-items: center; justify-content: center; color: var(--gold); font-size: 2rem; }
        .card-back { background: #fff; transform: rotateY(180deg); }
        .card-back img { width: 100%; height: 100%; object-fit: cover; }

        /* 결과 창 */
        #result-box { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid var(--gold); line-height: 1.8; text-align: left; margin-bottom: 20px; display: none; white-space: pre-wrap; }

        /* 이동 조작 버튼 */
        #controls { display: grid; grid-template-columns: repeat(3, 75px); gap: 12px; margin: 30px auto; justify-content: center; }
        .ctrl-btn { width: 75px; height: 75px; background: var(--glass); border: 1px solid var(--gold); border-radius: 50%; color: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; user-select: none; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>

    <div id="game-container"><canvas id="gameCanvas" width="500" height="320"></canvas></div>

    <div id="controls-wrapper">
        <div id="controls">
            <div style="grid-column:2" class="ctrl-btn" onmousedown="keys['ArrowUp']=true" onmouseup="keys['ArrowUp']=false" ontouchstart="keys['ArrowUp']=true" ontouchend="keys['ArrowUp']=false">▲</div>
            <div style="grid-column:1" class="ctrl-btn" onmousedown="keys['ArrowLeft']=true" onmouseup="keys['ArrowLeft']=false" ontouchstart="keys['ArrowLeft']=true" ontouchend="keys['ArrowLeft']=false">◀</div>
            <div style="grid-column:2" class="ctrl-btn" onmousedown="keys['ArrowDown']=true" onmouseup="keys['ArrowDown']=false" ontouchstart="keys['ArrowDown']=true" ontouchend="keys['ArrowDown']=false">▼</div>
            <div style="grid-column:3" class="ctrl-btn" onmousedown="keys['ArrowRight']=true" onmouseup="keys['ArrowRight']=false" ontouchstart="keys['ArrowRight']=true" ontouchend="keys['ArrowRight']=false">▶</div>
        </div>
        <p style="text-align: center; color: var(--gold); font-size: 0.9rem;">황금색 지혜의 별(NPC)에게 다가가세요.</p>
    </div>

    <div id="chat-stage">
        <div class="astro-box">
            <div id="astro-text" class="astro-text">어서오세요, 길 잃은 영혼이여... 당신을 무엇이라 부르면 좋겠습니까?</div>
            <div id="input-wrap" class="input-group">
                <input type="text" id="user-input" placeholder="이름을 알려주세요" autofocus>
                <button class="btn-next" onclick="processDialogue()">확인</button>
            </div>
            <div id="mode-select" class="mode-group">
                <div class="btn-mode" onclick="setMode(1)">단 한 장의 조언 (One Card)</div>
                <div class="btn-mode" onclick="setMode(3)">과거, 현재, 미래의 흐름 (Three Cards)</div>
            </div>
        </div>
    </div>

    <div id="tarot-stage">
        <div class="cards-grid" id="cards-grid"></div>
        <div id="result-box"></div>
        <button id="ai-btn" class="btn-next" style="display:none; width:100%; padding:18px;" onclick="sendToGemini()">운명의 문장 읽기</button>
        <button class="btn-next" style="background:#333; color:#fff; width:100%; margin-top:10px;" onclick="location.reload()">처음부터 다시</button>
    </div>

    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const p = { x: 70, y: 160, color: "#4cc9f0" };
        const n = { x: 420, y: 160, color: "#e2b857" };
        const keys = {};

        // 78장 전체 타로 데이터
        const tarotImgBase = "https://commons.wikimedia.org/wiki/Special:FilePath/";
        const tarotList = [
            {n:"광대", i:"RWS_Tarot_00_Fool.jpg"}, {n:"마법사", i:"RWS_Tarot_01_Magician.jpg"}, {n:"여사제", i:"RWS_Tarot_02_High_Priestess.jpg"}, {n:"여황제", i:"RWS_Tarot_03_Empress.jpg"}, {n:"황제", i:"RWS_Tarot_04_Emperor.jpg"}, {n:"교황", i:"RWS_Tarot_05_Hierophant.jpg"}, {n:"연인", i:"RWS_Tarot_06_Lovers.jpg"}, {n:"전차", i:"RWS_Tarot_07_Chariot.jpg"}, {n:"힘", i:"RWS_Tarot_08_Strength.jpg"}, {n:"은둔자", i:"RWS_Tarot_09_Hermit.jpg"}, {n:"운명", i:"RWS_Tarot_10_Wheel_of_Fortune.jpg"}, {n:"정의", i:"RWS_Tarot_11_Justice.jpg"}, {n:"매달린 사람", i:"RWS_Tarot_12_Hanged_Man.jpg"}, {n:"죽음", i:"RWS_Tarot_13_Death.jpg"}, {n:"절제", i:"RWS_Tarot_14_Temperance.jpg"}, {n:"악마", i:"RWS_Tarot_15_Devil.jpg"}, {n:"탑", i:"RWS_Tarot_16_Tower.jpg"}, {n:"별", i:"RWS_Tarot_17_Star.jpg"}, {n:"달", i:"RWS_Tarot_18_Moon.jpg"}, {n:"태양", i:"RWS_Tarot_19_Sun.jpg"}, {n:"심판", i:"RWS_Tarot_20_Judgement.jpg"}, {n:"세계", i:"RWS_Tarot_21_World.jpg"},
            {n:"완드 에이스", i:"Wands01.jpg"}, {n:"완드 2", i:"Wands02.jpg"}, {n:"완드 3", i:"Wands03.jpg"}, {n:"완드 4", i:"Wands04.jpg"}, {n:"완드 5", i:"Wands05.jpg"}, {n:"완드 6", i:"Wands06.jpg"}, {n:"완드 7", i:"Wands07.jpg"}, {n:"완드 8", i:"Wands08.jpg"}, {n:"완드 9", i:"Tarot_Nine_of_Wands.jpg"}, {n:"완드 10", i:"Wands10.jpg"}, {n:"완드 시종", i:"Wands11.jpg"}, {n:"완드 기사", i:"Wands12.jpg"}, {n:"완드 퀸", i:"Wands13.jpg"}, {n:"완드 킹", i:"Wands14.jpg"},
            {n:"컵 에이스", i:"Cups01.jpg"}, {n:"컵 2", i:"Cups02.jpg"}, {n:"컵 3", i:"Cups03.jpg"}, {n:"컵 4", i:"Cups04.jpg"}, {n:"컵 5", i:"Cups05.jpg"}, {n:"컵 6", i:"Cups06.jpg"}, {n:"컵 7", i:"Cups07.jpg"}, {n:"컵 8", i:"Cups08.jpg"}, {n:"컵 9", i:"Cups09.jpg"}, {n:"컵 10", i:"Cups10.jpg"}, {n:"컵 시종", i:"Cups11.jpg"}, {n:"컵 기사", i:"Cups12.jpg"}, {n:"컵 퀸", i:"Cups13.jpg"}, {n:"컵 킹", i:"Cups14.jpg"},
            {n:"소드 에이스", i:"Swords01.jpg"}, {n:"소드 2", i:"Swords02.jpg"}, {n:"소드 3", i:"Swords03.jpg"}, {n:"소드 4", i:"Swords04.jpg"}, {n:"소드 5", i:"Swords05.jpg"}, {n:"소드 6", i:"Swords06.jpg"}, {n:"소드 7", i:"Swords07.jpg"}, {n:"소드 8", i:"Swords08.jpg"}, {n:"소드 9", i:"Swords09.jpg"}, {n:"소드 10", i:"Swords10.jpg"}, {n:"소드 시종", i:"Swords11.jpg"}, {n:"소드 기사", i:"Swords12.jpg"}, {n:"소드 퀸", i:"Swords13.jpg"}, {n:"소드 킹", i:"Swords14.jpg"},
            {n:"펜타클 에이스", i:"Pents01.jpg"}, {n:"펜타클 2", i:"Pents02.jpg"}, {n:"펜타클 3", i:"Pents03.jpg"}, {n:"펜타클 4", i:"Pents04.jpg"}, {n:"펜타클 5", i:"Pents05.jpg"}, {n:"펜타클 6", i:"Pents06.jpg"}, {n:"펜타클 7", i:"Pents07.jpg"}, {n:"펜타클 8", i:"Pents08.jpg"}, {n:"펜타클 9", i:"Pents09.jpg"}, {n:"펜타클 10", i:"Pents10.jpg"}, {n:"펜타클 시종", i:"Pents11.jpg"}, {n:"펜타클 기사", i:"Pents12.jpg"}, {n:"펜타클 퀸", i:"Pents13.jpg"}, {n:"펜타클 킹", i:"Pents14.jpg"}
        ];

        let state = "NAME";
        let session = { name: "", birth: "", question: "", cards: [] };

        // --- 대화 로직 ---
        function processDialogue() {
            const input = document.getElementById('user-input');
            const astro = document.getElementById('astro-text');
            const val = input.value.trim();

            if (!val) return;

            if (state === "NAME") {
                session.name = val;
                astro.innerText = `${session.name} 님... 별들이 당신의 이름을 기억하는군요. 당신이 별의 정기를 처음 받은 날(생년월일)은 언제입니까?`;
                input.value = ""; input.placeholder = "예: 19950524";
                state = "BIRTH";
            } else if (state === "BIRTH") {
                session.birth = val;
                astro.innerText = "운명의 가닥을 봅니다. 오늘 당신의 마음을 어지럽히는 고민이 무엇인지 들려주세요.";
                input.value = ""; input.placeholder = "고민 중인 내용을 입력하세요";
                state = "QUESTION";
            } else if (state === "QUESTION") {
                session.question = val;
                astro.innerText = "준비되었습니다. 어떤 방식으로 신탁을 받으시겠습니까?";
                document.getElementById('input-wrap').style.display = "none";
                document.getElementById('mode-select').style.display = "flex";
            }
        }

        function setMode(m) {
            document.getElementById('chat-stage').style.display = "none";
            document.getElementById('tarot-stage').style.display = "block";
            const grid = document.getElementById('cards-grid');
            grid.innerHTML = "";
            for(let i=0; i<m; i++) {
                grid.innerHTML += `
                <div class="card" onclick="flipCard(this)">
                    <div class="card-inner">
                        <div class="card-face card-front">✦</div>
                        <div class="card-face card-back"></div>
                    </div>
                </div>`;
            }
        }

        function flipCard(el) {
            if (el.classList.contains('flipped')) return;
            const card = tarotList[Math.floor(Math.random() * tarotList.length)];
            const isRev = Math.random() > 0.7;
            el.querySelector('.card-back').innerHTML = `<img src="${tarotImgBase}${card.i}" style="${isRev ? 'transform:rotate(180deg)' : ''}">`;
            el.classList.add('flipped');
            session.cards.push(card.n + (isRev ? "(역방향)" : "(정방향)"));

            if (session.cards.length === (document.querySelectorAll('.card').length)) {
                document.getElementById('ai-btn').style.display = "block";
            }
        }

        // --- API 연동 ---
        async function sendToGemini() {
            const resultBox = document.getElementById('result-box');
            resultBox.style.display = "block";
            resultBox.innerText = "🔮 점성술사가 수정구슬을 통해 미래를 읽고 있습니다...";
            document.getElementById('ai-btn').style.display = "none";

            try {
                const response = await fetch('/api/tarot', { // 핸들러 경로 확인!
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question: `${session.name}(${session.birth}) - ${session.question}`,
                        cards: session.cards
                    })
                });
                const data = await response.json();
                resultBox.innerText = data.text;
            } catch (err) {
                resultBox.innerText = "마법사의 목소리가 흐릿합니다. (통신 오류)";
            }
        }

        // --- 게임 엔진 ---
        function loop() {
            if(keys['ArrowUp'] && p.y > 40) p.y -= 5;
            if(keys['ArrowDown'] && p.y < 280) p.y += 5;
            if(keys['ArrowLeft'] && p.x > 30) p.x -= 5;
            if(keys['ArrowRight'] && p.x < 470) p.x += 5;

            ctx.clearRect(0, 0, 500, 320);
            
            // 배경 별무리
            for(let i=0; i<35; i++) {
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.beginPath(); ctx.arc((i*157)%500, (i*149)%320, 1.2, 0, Math.PI*2); ctx.fill();
            }

            // NPC
            ctx.shadowBlur = 20; ctx.shadowColor = n.color;
            ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(n.x, n.y, 25, 0, Math.PI*2); ctx.fill();
            
            // Player
            ctx.shadowBlur = 15; ctx.shadowColor = p.color;
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, Math.PI*2); ctx.fill();
            ctx.shadowBlur = 0;

            if (Math.hypot(p.x - n.x, p.y - n.y) < 50) {
                document.getElementById('controls-wrapper').style.display = "none";
                document.getElementById('chat-stage').style.display = "block";
                return;
            }
            requestAnimationFrame(loop);
        }

        window.addEventListener('keydown', e => keys[e.code] = true);
        window.addEventListener('keyup', e => keys[e.code] = false);
        loop();
    </script>
</body>
</html>
