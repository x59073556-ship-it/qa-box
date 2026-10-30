'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [ageGroup, setAgeGroup] = useState('18-24');
  const [gender, setGender] = useState('不透露');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setStatus('AI 審查中...');

    try {
      // 呼叫 API 進行 Gemini 審查
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, nickname, ageGroup, gender })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '發送失敗');

      setStatus('🎉 提問已成功送出！');
      setContent('');
      setNickname('');
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>💬 創作者匿名提問箱</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>稱呼：</label><br />
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)} 
            placeholder="例如：小明 (選填)"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div>
          <label>年齡區間：</label><br />
          <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="18歲以下">18歲以下</option>
            <option value="18-24">18-24 歲</option>
            <option value="25-34">25-34 歲</option>
            <option value="35-44">35-44 歲</option>
            <option value="45歲以上">45歲以上</option>
          </select>
        </div>

        <div>
          <label>性別：</label><br />
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他/不透露">其他/不透露</option>
          </select>
        </div>

        <div>
          <label>想問的問題：</label><br />
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={5} 
            placeholder="請輸入你想問的問題..."
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? '處理中...' : '送出提問'}
        </button>
      </form>
      {status && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{status}</p>}
    </main>
  );
}
