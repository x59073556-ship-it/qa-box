import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

export async function POST(req) {
  try {
    const { content, nickname, ageGroup, gender } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '伺服器未設定 Gemini API 金鑰' }, { status: 500 });
    }

    // 呼叫 Gemini REST API 進行內容審查
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `你是一個嚴格的內容審查 AI。請判斷以下提問內容是否包含惡意攻擊、謾罵、色情、暴力、騷擾或極端不雅字眼。如果內容安全無害，請只回傳「SAFE」；如果包含違規或惡意內容，請只回傳「UNSAFE」。\n\n內容：${content}`
            }]
          }]
        })
      }
    );

    const geminiData = await geminiRes.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'UNSAFE';

    if (!aiText.includes('SAFE')) {
      return NextResponse.json({ error: '內容包含不當言論或惡意攻擊，已被 AI 攔截！' }, { status: 400 });
    }

    // 寫入 Supabase 資料庫
    const { error: dbError } = await supabase.from('questions').insert([
      {
        nickname: nickname || '匿名',
        age_group: ageGroup,
        gender: gender,
        content: content
      }
    ]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
