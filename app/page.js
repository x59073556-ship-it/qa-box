'use client';

import { useState } from 'react';

const CREATOR_NAME = "小小"; 
const CREATOR_AVATAR = "/avatar.jpg"; 
const CREATOR_AUDIO_URL = "/my-voice.mp3"; 

const playSuccessSound = () => {
  if (!CREATOR_AUDIO_URL) return;
  try {
    const audio = new Audio(CREATOR_AUDIO_URL);
    audio.play().catch((e) => {
      console.log("播放失敗：", e);
    });
  } catch (e) {
    console.log("錯誤：", e);
  }
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
      background: 'linear-gradient(135deg, #fceade 0%, #f1d3b3 50%, #d49a6a 100%)',
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
        boxShadow: '0 20px 40px rgba(110, 70, 40, 0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 14px auto',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #b87333',
            boxShadow: '0 4px 12px rgba(184, 115, 51, 0.3)',
          }}>
            <img 
              src={CREATOR_AVATAR} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', color: '#4a3525', fontWeight: '700' }}>
            {CREATOR_NAME} 的匿名提問箱 🧋
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#8c6d53' }}>有什麼想對我說的或想問的嗎？大膽問吧！</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5c4033' }}>你的稱呼</label>
            <input
              type="text"
              placeholder="例如：神秘路人、小明"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #dcd0c0',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5c4033' }}>年齡區間</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #dcd0c0',
                  fontSize: '15px',
                  background: '#fff',
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
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5c4033' }}>性別</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #dcd0c0',
                  fontSize: '15px',
                  background: '#fff',
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
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#5c4033' }}>問題內容</label>
            <textarea
              placeholder="輸入你的問題或想說的話..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid #dcd0c0',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '6px',
              padding: '14px',
              background: loading ? '#dcd0c0' : 'linear-gradient(135deg, #b87333 0%, #6b3e26 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(107, 62, 38, 0.3)',
            }}
          >
            {loading ? '傳送中...' : '送出匿名提問 🧋'}
          </button>
        </form>

        {status && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '8px',
            background: status.includes('❌') ? '#fdf2f2' : '#f4f9f4',
            color: status.includes('❌') ? '#a63a3a' : '#3b6e3b',
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
