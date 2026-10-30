'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 💡 加上防呆網址：打包時若變數為空，會先用假網址撐過去，確保 Build 絕對不會崩潰
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('處理中...');

    try {
      // 1. 先呼叫 API 透過 Gemini 審核並寫入資料庫
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ageGroup, gender, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '送出失敗');
      }

      setStatus('提問成功送出！');
      setName('');
      setContent('');
    } catch (err) {
      setStatus(`錯誤：${err.message}`);
    }
  };

  return (
    <main style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>匿名提問箱</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>稱呼：</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>年齡區間：</label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">請選擇年齡區間</option>
            <option value="18以下">18以下</option>
            <option value="19-25">19-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="51以上">51以上</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>性別：</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">請選擇性別</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他/不透露">其他/不透露</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>問題內容：</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
          送出提問
        </button>
      </form>

      {status && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{status}</p>}
    </main>
  );
}
