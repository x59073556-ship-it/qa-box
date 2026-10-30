import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseUrl = rawUrl.replace(/[\[\]"'`]/g, '').trim();

    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseKey = rawKey.replace(/[\[\]"'`]/g, '').trim();

    const geminiApiKey = (process.env.GEMINI_API_KEY || '').replace(/[\[\]"'`]/g, '').trim();

    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      return Response.json({ error: 'Supabase 網址設定錯誤' }, { status: 500 });
    }

    if (!supabaseKey) {
      return Response.json({ error: '找不到 Supabase 金鑰' }, { status: 500 });
    }

    if (!geminiApiKey) {
      return Response.json({ error: '找不到 GEMINI_API_KEY，請確認 Vercel 環境變數是否有設定！' }, { status: 500 });
    }

    const { name, ageGroup, gender, content } = await req.json();

    const lowerContent = (content || '').toLowerCase();
    const forbiddenWords = [
      '雞雞', '打手槍', '自慰', '約砲', '胸部', '看胸部', '賣色', '擦邊',
      '超負荷', '館長', '陳之漢', '統神', 'toyz', '羅傑', 'roger',
      '幹', '三小', '靠北'
    ];

    const hasForbiddenWord = forbiddenWords.some(word => lowerContent.includes(word.toLowerCase()));

    if (hasForbiddenWord) {
      return Response.json({ error: '內容含有不當言論或敏感詞彙，已被系統攔截！' }, { status: 400 });
    }

    const promptText = `你是一個極度嚴格的提問箱審核員。
請檢查以下內容是否包含任何性暗示、性騷擾、髒話、引戰、爭議人物或不當話題。
只要有一點不妥，請回傳 REJECT，只有百分之百安全才回傳 PASS。
只回傳單字 PASS 或 REJECT。

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

    if (!geminiRes.ok) {
      return Response.json({ error: 'AI 審核服務連線失敗，請稍後再試' }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'REJECT';

    if (aiResponse.includes('REJECT') || !aiResponse.includes('PASS')) {
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
