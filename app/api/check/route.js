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

    const promptText = `你是一個極度嚴格且精準的提問箱審核員。
請分析下方提問內容，若符合以下任一【必須拒絕】的情況，請直接回傳 REJECT：

【必須拒絕（回傳 REJECT）】：
1. 性騷擾、性暗示、要求私密照或下流言語（例如：打手槍、看胸部、約砲、自慰等）。
2. 針對任何人的攻擊、辱罵、三字經或威脅言論。
3. 討論或詢問「擦邊、賣色、色情創作者、成人話題、18禁題材」相關的評價、看法或議題。
4. 任何「政治議題、政黨立場、選舉、政治人物或國際政治爭議」（例如：選舉看法、政黨傾向、兩岸話題等）。
5. 提及或詢問「風格極端、引戰或爭議性較高之網紅/人物」的相關話題（例如：超負荷、館長陳之漢、統神、Toyz 等任何爭議人物討論）。

【允許通過（回傳 PASS）】：
1. 提問者分享「自己」的身體困擾、心理煩惱、自卑感受（例如：「我覺得我的胸部比別人小」、「我對身材很自卑」等純粹的個人困擾傾訴）。
2. 一般正常、禮貌的提問、日常聊天、關心、生活經驗分享與正當話題。

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
      return Response.json({ error: '內容含有不當言論或不適合的話題，無法送出喔！' }, { status: 400 });
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
