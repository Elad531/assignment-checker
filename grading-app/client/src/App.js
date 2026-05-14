import React, { useState } from 'react';
import './App.css';

function App() {
  // 1. Define the state so React knows what 'data' and 'loading' are
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      // Make sure your server is running on port 5000!
    const response = await fetch('/upload', { // שימוש בנתיב יחסי עובד הכי טוב כששניהם על אותו שרת
      method: 'POST',
      body: formData,
    });
      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setData(result); // This saves the AI results into 'data'
    } catch (err) {
      setError('שגיאה בחיבור לשרת');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. The Logic: If no data, show upload. If data exists, show dashboard.
  return (
    <div className="App" dir="rtl">
      {!data ? (
        <div className="upload-screen">
          <div className="upload-card">
            <h1>בודק עבודות מדעי הטכנולוגיה 🔬</h1>
            <label className="custom-file-upload">
              <input type="file" onChange={handleFileUpload} accept="application/pdf" />
              {loading ? 'מנתח נתונים... אנא המתן' : 'בחר קובץ PDF להעלאה'}
            </label>
            {loading && <div className="loader"></div>}
            {error && <p style={{color: 'red'}}>{error}</p>}
          </div>
        </div>
      ) : (
        <div className="dashboard-container">
          <header className="header-bar">
            <div>
              <h1>בדיקת עבודה: {data.studentName}</h1>
              <p>מזהה: {data.studentId}</p>
            </div>
            <div className="score-badge">
              <span className="score-label">ציון סופי</span>
              <span className="score-number">{data.totalGrade}</span>
            </div>
          </header>

          <div className="main-grid">
            <aside className="sidebar">
              <h3>פירוט ניקוד</h3>
              <ul className="rubric-list">
                <li><span>מבנה והגשה (5)</span> <strong>{data.scores?.technical?.score}</strong></li>
                <li><span>מבוא (5)</span> <strong>{data.scores?.intro?.score}</strong></li>
                <li><span>גוף העבודה (55)</span> <strong>{data.scores?.body?.score}</strong></li>
                <li><span>רפלקציה (20)</span> <strong>{data.scores?.reflection?.score}</strong></li>
                <li><span>ביבליוגרפיה (5)</span> <strong>{data.scores?.bibliography?.score}</strong></li>
                <li><span>השתתפות (5)</span> <strong>{data.scores?.participation?.score}</strong></li>
              </ul>
              <div className={`check-item ${data.scores?.reflection?.metTableFound ? 'success' : 'fail'}`}>
                {data.scores?.reflection?.metTableFound ? '✅ טבלת 3 מפגשים נמצאה' : '❌ טבלת 3 מפגשים חסרה'}
              </div>
            </aside>

            <main className="content">
              <div className="info-card warning">
                <h3>🔍 בקרת יושרה ו-AI</h3>
                <p>{data.aiDisclosureAudit}</p>
              </div>
              <div className="info-card success">
                <h3>💡 נקודות אור</h3>
                <p>{data.feedback?.light}</p>
              </div>
              <div className="info-card growth">
                <h3>🌱 נקודות לשיפור</h3>
                <p>{data.feedback?.growth}</p>
              </div>
              <div className="actions">
                <button className="btn secondary" onClick={() => setData(null)}>בדיקה חדשה</button>
                <button className="btn primary" onClick={() => window.print()}>הדפס משוב</button>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. THIS IS CRITICAL: Export the component so index.js can find it!
export default App;