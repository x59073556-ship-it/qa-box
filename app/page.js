'use client';

import { useState } from 'react';

const CREATOR_NAME = "小小"; 
const CREATOR_AVATAR = "/avatar.jpg"; 
const CREATOR_AUDIO_URL = "/my-voice.mp3"; 

const playSuccessSound = () => {
  if (!CREATOR_AUDIO_URL) return;
  try {
    const audio = new Audio(CREATOR_AUDIO_URL);
    audio.play().catch(() => {});
  } catch (e) {}
};

export default function Home() {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [gender, setGender] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('傳送中...');

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ageGroup, gender, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '送出失敗');
      }

      playSuccessSound();
      setStatus('✨ 提問成功送出！');
      setName('');
      setAgeGroup('');
      setGender('');
      setContent('');
    } catch (err) {
      setStatus(`❌ 錯誤：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 20px 40px rgba(255, 154, 158, 0.25)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '84px',
            height: '84px',
            margin: '0 auto 14px auto',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #ff9a9e',
            boxShadow: '0 4px 12px rgba(255, 154, 158, 0.3)',
          }}>
            <img 
              src={CREATOR_AVATAR} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#d81b60', fontWeight: '700' }}>
            {CREATOR_NAME} 的提問箱 🐰
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#ad1457' }}>有什麼想對我說的或想問的嗎？大膽問吧！🍓</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#880e4f' }}>你的稱呼</label>
            <input
              type="text"
              placeholder="例如：神秘路人、小明"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #f8bbd0',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#fffef9',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#880e4f' }}>年齡區間</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f8bbd0',
                  fontSize: '15px',
                  background: '#fffef9',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">選擇年齡</option>
                <option value="18以下">18以下</option>
                <option value="19-25">19-25</option>
                <option value="26-35">26-35</option>
                <option value="36-50">36-50</option>
                <option value="51以上">51以上</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#880e4f' }}>性別</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f8bbd0',
                  fontSize: '15px',
                  background: '#fffef9',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">選擇性別</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="其他/不透露">其他/不透露</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#880e4f' }}>問題內容</label>
            <textarea
              placeholder="輸入你的問題或想說的話..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #f8bbd0',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                background: '#fffef9',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '14px',
              background: loading ? '#f8bbd0' : 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255, 154, 158, 0.4)',
            }}
          >
            {loading ? '傳送中...' : '送出匿名提問 🍓'}
          </button>
        </form>

        {status && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '10px',
            background: status.includes('❌') ? '#ffebee' : '#e8f5e9',
            color: status.includes('❌') ? '#c62828' : '#2e7d32',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '600',
          }}>
            {status}
          </div>
        )}
      </div>
    </main>
  );
}
