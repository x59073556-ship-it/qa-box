import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  // 抓取環境變數（支援有無 NEXT_PUBLIC_ 前綴）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase 環境變數未設定' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { name, ageGroup, gender, content } = await request.json();

    // 呼叫 Gemini REST API 審核內容
    let isApproved = true;
    if (apiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `請判斷以下提問是否包含人身攻擊、仇恨言論、情色或不當內容。如果是適當提問請只回答 "PASS"，如果是不當內容請只回答 "BLOCK"。\n\n提問內容：${content}`
                }]
              }]
            })
          }
        );
        const geminiData = await geminiRes.json();
        const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        if (replyText.includes('BLOCK')) {
          isApproved = false;
        }
      } catch (e) {
        console.error('Gemini 審核失敗，預設通過:', e);
      }
    }

    if (!isApproved) {
      return NextResponse.json({ error: '提問內容未通過 AI 安全審核，請修改後重試。' }, { status: 400 });
    }

    // 寫入 Supabase 資料庫
    const { data, error } = await supabase
      .from('questions')
      .insert([{ name, age_group: ageGroup, gender, content }]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
