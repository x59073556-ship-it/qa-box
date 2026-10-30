import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

export default function Home() {
  async function handleSubmit(formData) {
    'use server'
    const nickname = formData.get('nickname');
    const ageGroup = formData.get('ageGroup');
    const gender = formData.get('gender');
    const content = formData.get('content');

    if (!content) return;

    try {
      // 1. 初始化 Google Gemini API 進行過濾
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        你是一個極度嚴格的內容過濾助手，保護創作者的心靈健康。
        請檢查以下觀眾提問內容：「${content}」

        審查標準：
        - REJECT：只要包含人身攻擊、酸言酸語、情緒宣洩、惡意挑釁、性騷擾、威脅、或無意義亂碼/單字。
        - PASS：態度正常、具有建設性、是具體提問或想討論特定主題的好問題。

        請只回傳 JSON 格式：{"result": "PASS" 或 "REJECT"}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const analysis = JSON.parse(response.text);

      // 2. 如果通過審查 (PASS)，才寫入 Supabase 資料庫
      if (analysis.result === 'PASS') {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        await supabase.from('questions').insert([
          { nickname, age_group: ageGroup, gender, content }
        ]);
      }
    } catch (error) {
      console.error("審查過程發生錯誤：", error);
    }
  }

  return (
    <main className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">✨ 創作者提問箱</h1>
        <p className="text-sm text-slate-500 mt-1">有什麼想問的、想聊的，歡迎告訴我！</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">稱呼 / 暱稱</label>
          <input name="nickname" required placeholder="例如：小明" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">年齡區間</label>
          <select name="ageGroup" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">請選擇年齡</option>
            <option value="18以下">18歲以下</option>
            <option value="18~30">18 ~ 30歲</option>
            <option value="30~39">30 ~ 39歲</option>
            <option value="40以上">40歲以上</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">性別</label>
          <select name="gender" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">請選擇性別</option>
            <option value="女性">女性</option>
            <option value="男性">男性</option>
            <option value="不想透露 / 其他">不想透露 / 其他</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">想問的問題</label>
          <textarea name="content" required rows="4" placeholder="請輸入你的問題..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>

        <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition shadow-md">
          送出提問
        </button>
      </form>
    </main>
  );
}
