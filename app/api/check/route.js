import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseUrl = rawUrl.replace(/[\[\]"'`]/g, '').trim();

    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseKey = rawKey.replace(/[\[\]"'`]/g, '').trim();

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').replace(/[\[\]"'`]/g, '').trim();

    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      return Response.json({ error: `網址格式不正確，目前讀到的值是: "${rawUrl}"` }, { status: 500 });
    }

    if (!supabaseKey) {
      return Response.json({ error: '找不到 Supabase 金鑰' }, { status: 500 });
    }

    if (!geminiApiKey) {
      return Response.json({ error: '找不到 Gemini API 金鑰' }, { status: 500 });
    }

    const { name, ageGroup, gender, content } = await req.json();

    const promptText = `你是一個在台灣網路社群（如 Twitch、YouTube、Dcard、PTT）經驗豐富且極度嚴格的提問箱審核員。
請以「語意與意圖」深度分析以下內容，只要含有以下任何一種意圖，請毫不猶豫回傳 REJECT：

【必須拒絕（回傳 REJECT）】：
1. 性騷擾、性暗示、下流言語、要求私密照或與性行為相關的挑逗（如打手槍、胸部、約砲、自慰等）。
2. 髒話、謾罵、人身攻擊、挑釁或威脅言論。
3. 任何形式的「實況主、網路紅人、公眾人物、政治人物」的爭議話題、評價、八卦、引戰釣魚、迷因梗洗版或政治立場討論（例如問對某個實況主、網紅、政治人物的看法或攻擊）。
4. 討論 18 禁、擦邊賣色、色情產業相關的價值觀或評價。

【允許通過（回傳 PASS）】：
1. 提問者真心誠意分享「自己」的身體困擾、心理煩惱、自卑感受（例如：「我覺得我的身材很自卑」等純粹個人心事）。
2. 一般正常、禮貌的日常生活關心、正向交流與日常話題。

請完全發揮你對台灣網路次文化與實況圈語境的理解，判斷這是不是在釣魚、引戰或騷擾。
請只回傳單字 PASS 或 REJECT，不要包含任何其他文字或標點符號。

內容：${content}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    const geminiData = await geminiRes.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'PASS';

    if (aiResponse.includes('REJECT')) {
      return Response.json({ error: '內容含有不當言論、引戰話題或不適合的內容，無法送出喔！' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase
      .from('questions')
      .insert([{ nickname: name, age_group: ageGroup, gender, content }]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
