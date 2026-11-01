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
      return Response.json({ error: '找不到 GEMINI_API_KEY' }, { status: 500 });
    }

    const { name, ageGroup, gender, content } = await req.json();

    const cleanContent = (content || '').trim();

    if (cleanContent.length <= 100) {
      return Response.json({ error: '提問內容必須超過 100 個字才能發送！' }, { status: 400 });
    }

    const hasTooManyRepeats = /(.)\1{7,}/.test(cleanContent);
    if (hasTooManyRepeats) {
      return Response.json({ error: '提問內容包含過多重複字元，請輸入有意義的提問內容喔！' }, { status: 400 });
    }

    const pureText = cleanContent.replace(/[\s\u3000]/g, '');
    if (pureText.length < 80) {
      return Response.json({ error: '有效文字內容不足 100 字（請勿用空白或無意義符號灌水）！' }, { status: 400 });
    }

    const lowerContent = cleanContent.toLowerCase();
    const forbiddenWords = [
      '打手槍', '自慰', '約砲', '賣色',
      '超負荷', '館長', '陳之漢', '統神', 'toyz', '羅傑', 'roger',
      '幹', '三小'
    ];

    const hasForbiddenWord = forbiddenWords.some(word => lowerContent.includes(word.toLowerCase()));

    if (hasForbiddenWord) {
      return Response.json({ error: '內容含有不當言論或敏感詞彙，已被系統攔截！' }, { status: 400 });
    }

    const promptText = `你是一個 VTuber 提問箱的嚴格審核員。
目標對象是虛擬主播（VTuber）。任何不適合問 VTuber 的內容（例如：詢問真實年齡、生日、本名、中身、真人長相、住址、私生活、私人聯絡方式，或是任何越界、騷擾、引戰、不尊重虛擬形象的言論）都必須被攔截。
只有完全正常、尊重虛擬設定且適合在公開台面上與 VTuber 互動的內容才可以放行。
請判斷以下內容是否應該被攔截。
只回傳 PASS（放行）或 REJECT（攔截）。

內容：${cleanContent}`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!geminiRes.ok) {
      const errDetail = await geminiRes.text();
      return Response.json({ error: `AI 審核連線失敗: ${errDetail}` }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'PASS';

    if (aiResponse.includes('REJECT')) {
      return Response.json({ error: '內容含有不適合問 VTuber 的話題或敏感資訊，無法送出喔！' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase
      .from('questions')
      .insert([{ nickname: name, age_group: ageGroup, gender, content: cleanContent }]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
