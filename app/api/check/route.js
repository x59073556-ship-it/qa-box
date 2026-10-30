import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

export async function POST(req) {
  try {
    const { name, ageGroup, gender, content } = await req.json();

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: '伺服器未設定 Supabase 網址或金鑰' }, { status: 500 });
    }

    if (!geminiApiKey) {
      return Response.json({ error: '伺服器未設定 Gemini API 金鑰' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `請審核以下提問內容是否包含嚴重謾罵、騷擾、色情或攻擊性內容。如果內容安全，請只回傳 PASS；如果包含不當內容，請只回傳 REJECT。內容：${content}`;
    const aiResult = await model.generateContent(prompt);
    const aiResponse = aiResult.response.text().trim();

    if (aiResponse.includes('REJECT')) {
      return Response.json({ error: '內容含有不當言論，無法送出喔！' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('questions')
      .insert([{ name, age_group: ageGroup, gender, content }]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
