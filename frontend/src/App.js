import React, { useState, useEffect } from 'react';
import './App.css';

const BASE_URL = 'http://127.0.0.1:8000';
const THEMES = ['dark', 'light', 'ocean', 'purple'];
const THEME_LABELS = {
  dark: '🌑 Dark', light: '☀️ Light',
  ocean: '🌊 Ocean', purple: '🔮 Purple'
};

const api = {
  signup: (name, email, password) =>
    fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name, email, password}),
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password}),
    }).then(r => r.json()),

  // ✅ FIX 1: patient_name aur patient_age bhi bhej raha hai
  predict: (file, token, patientName, patientAge) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('patient_name', patientName || '');
    fd.append('patient_age', patientAge || '');
    return fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: token ? {Authorization: `Bearer ${token}`} : {},
      body: fd,
    }).then(r => r.json());
  },

  getHistory: (token) =>
    fetch(`${BASE_URL}/history`, {
      headers: {Authorization: `Bearer ${token}`},
    }).then(r => r.json()),

  deleteHistory: (id, token) =>
    fetch(`${BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: {Authorization: `Bearer ${token}`},
    }).then(r => r.json()),
};

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('pn-theme') || 'dark'
  );

  // ✅ FIX 2: token aur user localStorage se read ho raha hai — refresh pe logout nahi hoga
  const [token, setToken] = useState(
    () => localStorage.getItem('pn-token') || null
  );
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('pn-user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [authPage, setAuthPage]   = useState('login');
  const [authName, setAuthName]   = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass]   = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoad, setAuthLoad]   = useState(false);
  const [page, setPage]           = useState('home');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge]   = useState('');
  const [dbHistory, setDbHistory]     = useState([]);
  const [histLoad, setHistLoad]       = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('pn-theme', theme);
  }, [theme]);

  // ✅ FIX 3: token change hone par localStorage update
  useEffect(() => {
    if (token) localStorage.setItem('pn-token', token);
    else localStorage.removeItem('pn-token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('pn-user', JSON.stringify(user));
    else localStorage.removeItem('pn-user');
  }, [user]);

  useEffect(() => {
    if (token && page === 'history') loadHistory();
  }, [token, page]);

  const loadHistory = async () => {
    setHistLoad(true);
    try {
      const data = await api.getHistory(token);
      if (data.history) setDbHistory(data.history);
    } catch(e) { console.error(e); }
    finally { setHistLoad(false); }
  };

  const handleAuth = async () => {
    if (!authEmail.trim() || !authPass.trim()) {
      setAuthError('Email and password are required!'); return;
    }
    setAuthLoad(true); setAuthError('');
    try {
      let data;
      if (authPage === 'signup') {
        if (!authName.trim()) {
          setAuthError('Full name is required!');
          setAuthLoad(false); return;
        }
        data = await api.signup(authName, authEmail, authPass);
      } else {
        data = await api.login(authEmail, authPass);
      }
      if (data.status === 'success') {
        setToken(data.token);
        setUser({name: data.name, email: data.email});
        setPage('home');
      } else {
        setAuthError(data.detail || 'Something went wrong!');
      }
    } catch {
      setAuthError('Cannot connect to server! Is backend running?');
    } finally { setAuthLoad(false); }
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    setResult(null); setPreview(null);
    setSelectedFile(null);
    setPatientName(''); setPatientAge('');
    setDbHistory([]);
    localStorage.removeItem('pn-token');
    localStorage.removeItem('pn-user');
    setPage('home');
  };

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setError('Only JPEG and PNG images are supported!'); return;
    }
    setSelectedFile(file);
    setError(null); setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an X-Ray image!'); return;
    }
    if (!patientName.trim()) {
      setError('Please enter patient name!'); return;
    }
    if (!patientAge.trim()) {
      setError('Please enter patient age!'); return;
    }
    setLoading(true); setError(null);
    try {
      // ✅ FIX 4: patientName aur patientAge bhi pass ho raha hai
      const data = await api.predict(selectedFile, token, patientName, patientAge);
      if (data.status === 'success') {
        const record = {
          id:          Date.now(),
          patientName: patientName.trim(),
          patientAge:  patientAge.trim(),
          filename:    data.filename,
          prediction:  data.prediction,
          confidence:  data.confidence,
          isPneumonia: data.is_pneumonia,
          message:     data.message,
          preview:     preview,
          gradcam:     data.gradcam,
          date:        new Date().toLocaleDateString('en-IN'),
          time:        new Date().toLocaleTimeString('en-IN'),
        };
        setResult(record);
        if (token) loadHistory();
      } else {
        setError('Prediction failed! Please try again.');
      }
    } catch {
      setError('Cannot connect to server! Is backend running?');
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    setSelectedFile(null); setPreview(null);
    setResult(null); setError(null);
    setPatientName(''); setPatientAge('');
  };

  const handleDeleteHistory = async (id) => {
    try {
      await api.deleteHistory(id, token);
      setDbHistory(prev => prev.filter(r => r._id !== id));
    } catch(e) { console.error(e); }
  };

  // ── AUTH PAGE ────────────────────────────
  if (!token) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="brand-icon">🫁</span>
            <span className="brand-name">PneumoAI</span>
            <span className="brand-tag">AI Powered</span>
          </div>
          <div className="nav-themes">
            {THEMES.map(t => (
              <button key={t}
                className={`theme-btn ${theme===t?'theme-active':''}`}
                onClick={()=>setTheme(t)}>
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
        </nav>

        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">
              <span>🫁</span>
              <h2>PneumoAI</h2>
              <p>AI-Powered Pneumonia Detection</p>
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authPage==='login'?'auth-tab-active':''}`}
                onClick={()=>{setAuthPage('login');setAuthError('');}}>
                🔑 Login
              </button>
              <button
                className={`auth-tab ${authPage==='signup'?'auth-tab-active':''}`}
                onClick={()=>{setAuthPage('signup');setAuthError('');}}>
                🚀 Sign Up
              </button>
            </div>

            {authPage === 'signup' && (
              <div className="auth-field">
                <label className="flabel">👤 Full Name</label>
                <input className="finput"
                  type="text"
                  placeholder="Enter your full name"
                  value={authName}
                  onChange={e=>setAuthName(e.target.value)}/>
              </div>
            )}

            <div className="auth-field">
              <label className="flabel">📧 Email</label>
              <input className="finput"
                type="email"
                placeholder="Enter your email"
                value={authEmail}
                onChange={e=>setAuthEmail(e.target.value)}/>
            </div>

            <div className="auth-field">
              <label className="flabel">🔒 Password</label>
              <input className="finput"
                type="password"
                placeholder="Enter your password"
                value={authPass}
                onChange={e=>setAuthPass(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleAuth()}/>
            </div>

            {authError &&
              <div className="err-box">⚠️ {authError}</div>}

            <button className="btn-analyze"
              style={{marginTop:'8px'}}
              onClick={handleAuth}
              disabled={authLoad}>
              {authLoad
                ? <><span className="spinner"/> Please wait...</>
                : authPage==='login'
                  ? '🔑 Login'
                  : '🚀 Create Account'}
            </button>

            <div className="auth-footer">
              <p>
                {authPage==='login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <span className="auth-link"
                  onClick={()=>{
                    setAuthPage(authPage==='login'?'signup':'login');
                    setAuthError('');
                  }}>
                  {authPage==='login' ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <footer className="footer">
          <span>🫁 PneumoAI — PyTorch + FastAPI + React</span>
          <span className="foot-dot">·</span>
          <span>⚠️ Educational purposes only.</span>
        </footer>
      </div>
    );
  }

  // ── MAIN APP ─────────────────────────────
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🫁</span>
          <span className="brand-name">PneumoAI</span>
          <span className="brand-tag">AI Powered</span>
        </div>
        <div className="nav-center">
          <button
            className={`nav-btn ${page==='home'?'nav-active':''}`}
            onClick={()=>setPage('home')}>
            🔍 Analyze
          </button>
          <button
            className={`nav-btn ${page==='history'?'nav-active':''}`}
            onClick={()=>setPage('history')}>
            📋 History
            {dbHistory.length > 0 &&
              <span className="nav-badge">{dbHistory.length}</span>}
          </button>
        </div>
        <div className="nav-right">
          <div className="nav-themes">
            {THEMES.map(t => (
              <button key={t}
                className={`theme-btn ${theme===t?'theme-active':''}`}
                onClick={()=>setTheme(t)}>
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="user-info">
            <div className="user-av">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.name}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* HOME */}
      {page === 'home' && <>
        <section className="hero">
          <div className="hero-glow"/>
          <div className="hero-inner">
            <span className="hero-chip">🏥 Chest X-Ray Analysis</span>
            <h1 className="hero-title">Pneumonia Detection</h1>
            <p className="hero-desc">
              Welcome back, <strong>{user?.name}</strong>! Upload a Chest X-Ray to get AI analysis.
            </p>
            <div className="stats-bar">
              {[
                {v:'88%',     l:'Accuracy'},
                {v:'5,856',   l:'Trained On'},
                {v:'<2s',     l:'Analysis'},
                {v:'ResNet18',l:'Model'},
              ].map((s,i,arr) => (
                <React.Fragment key={i}>
                  <div className="stat">
                    <span className="stat-v">{s.v}</span>
                    <span className="stat-l">{s.l}</span>
                  </div>
                  {i < arr.length-1 && <div className="stat-div"/>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <main className="main-grid">
          <div className="card">
            <div className="card-head">
              <span>📤</span><h2>Upload X-Ray</h2>
            </div>

            <div className="fields">
              <div className="field">
                <label className="flabel">👤 Patient Name</label>
                <input className="finput"
                  type="text" placeholder="Enter full name"
                  value={patientName}
                  onChange={e=>setPatientName(e.target.value)}/>
              </div>
              <div className="field">
                <label className="flabel">🎂 Age</label>
                <input className="finput"
                  type="number" placeholder="--"
                  min="1" max="120"
                  value={patientAge}
                  onChange={e=>setPatientAge(e.target.value)}/>
              </div>
            </div>

            <div
              className={`dzone ${dragOver?'dzone-over':''} ${preview?'dzone-filled':''}`}
              onClick={()=>document.getElementById('xray-in').click()}
              onDragOver={e=>{e.preventDefault();setDragOver(true);}}
              onDragLeave={()=>setDragOver(false)}
              onDrop={e=>{e.preventDefault();setDragOver(false);
                handleFileChange(e.dataTransfer.files[0]);}}>
              {preview ? (
                <div className="dz-prev">
                  <img src={preview} alt="xray" className="dz-img"/>
                  <div className="dz-ov">🔄 Click to change</div>
                </div>
              ) : (
                <div className="dz-ph">
                  <div className="dz-ring">
                    <span className="dz-ic">🫁</span>
                  </div>
                  <p className="dz-t1">Drop your X-Ray here</p>
                  <p className="dz-t2">or click to browse files</p>
                  <span className="dz-fmt">JPEG · PNG</span>
                </div>
              )}
            </div>

            <input id="xray-in" type="file"
              accept="image/jpeg,image/png"
              style={{display:'none'}}
              onChange={e=>handleFileChange(e.target.files[0])}/>

            {(selectedFile || preview) && (
              <div className="ftag">
                <span>📄</span>
                <span className="ftag-name">
                  {selectedFile ? selectedFile.name : 'Image ready'}
                </span>
                {selectedFile &&
                  <span className="ftag-sz">
                    {(selectedFile.size/1024).toFixed(0)} KB
                  </span>}
              </div>
            )}

            {error && <div className="err-box">⚠️ {error}</div>}

            <div className="btn-row">
              <button className="btn-analyze"
                onClick={handleSubmit}
                disabled={loading||!selectedFile}>
                {loading
                  ? <><span className="spinner"/>Analyzing...</>
                  : <>🔍 Analyze X-Ray</>}
              </button>
              {(preview||result) &&
                <button className="btn-reset" onClick={handleReset}>
                  ↩ Reset
                </button>}
            </div>

            <div className="info-tiles">
              <div className="itile">
                <span className="itile-ic">🧠</span>
                <div>
                  <p className="itile-t">Deep Learning</p>
                  <p className="itile-s">ResNet18 Transfer</p>
                </div>
              </div>
              <div className="itile">
                <span className="itile-ic">🔒</span>
                <div>
                  <p className="itile-t">Private & Secure</p>
                  <p className="itile-s">Not stored on server</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <span>📊</span><h2>Analysis Result</h2>
            </div>

            {!result && !loading && (
              <div className="empty-state">
                <div className="empty-orb">
                  <div className="orb-r orb-r1"/>
                  <div className="orb-r orb-r2"/>
                  <div className="orb-r orb-r3"/>
                  <span className="orb-ic">🔬</span>
                </div>
                <p className="empty-t">Ready to analyze</p>
                <p className="empty-s">
                  Fill patient details, upload X-Ray and click Analyze
                </p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="load-orb">
                  <div className="load-ring"/>
                </div>
                <p className="load-t">AI is analyzing...</p>
                <p className="load-s">Processing for {patientName}</p>
              </div>
            )}

            {result && (
              <div className={`rcard ${result.isPneumonia?'rc-danger':'rc-success'} fadein`}>
                <div className="rp-row">
                  <div className="rp-av">
                    {result.patientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="rp-name">{result.patientName}</p>
                    <p className="rp-meta">
                      Age {result.patientAge} · {result.date} · {result.time}
                    </p>
                  </div>
                </div>

                <div className="rs-row">
                  <div className={`rs-dot ${result.isPneumonia?'dot-d':'dot-s'}`}>
                    <span className="dot-ring"/>
                  </div>
                  <span className="rs-text">
                    {result.isPneumonia
                      ? '🔴 Pneumonia Detected'
                      : '🟢 Normal — No Pneumonia'}
                  </span>
                </div>

                <div className="conf-block">
                  <div className="conf-row">
                    <span className="conf-lbl">Confidence Level</span>
                    <span className="conf-val">{result.confidence}%</span>
                  </div>
                  <div className="conf-track">
                    <div
                      className={`conf-fill ${result.isPneumonia?'cf-d':'cf-s'}`}
                      style={{width:`${result.confidence}%`}}/>
                  </div>
                  <div className="conf-scale">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>

                <div className="rc-msg">{result.message}</div>

                {result.gradcam && (
                  <div className="gradcam-wrap">
                    <p className="gradcam-title">
                      🔥 AI Explanation — Where AI Looked
                    </p>
                    <div className="gradcam-imgs">
                      <div className="gcam-box">
                        <img src={result.preview}
                          alt="Original" className="gcam-img"/>
                        <p className="gcam-lbl">📷 Original X-Ray</p>
                      </div>
                      <div className="gcam-arrow">→</div>
                      <div className="gcam-box">
                        <img src={result.gradcam}
                          alt="AI Focus" className="gcam-img"/>
                        <p className="gcam-lbl">🔥 AI Focus Area</p>
                      </div>
                    </div>
                    <div className="gradcam-legend">
                      <span className="legend-item">
                        <span className="legend-dot dot-red"/>High Focus
                      </span>
                      <span className="legend-item">
                        <span className="legend-dot dot-yellow"/>Medium
                      </span>
                      <span className="legend-item">
                        <span className="legend-dot dot-blue"/>Low Focus
                      </span>
                    </div>
                    <p className="gradcam-hint">
                      🔴 Red areas = AI focused here most
                    </p>
                  </div>
                )}

                <div className="advice-block">
                  <p className="advice-head">
                    {result.isPneumonia ? '⚡ Immediate Actions' : '✅ Health Tips'}
                  </p>
                  {(result.isPneumonia ? [
                    '🏥 Visit a doctor immediately',
                    '💊 Get proper medication',
                    '😴 Rest and stay hydrated',
                    '📞 Call emergency if breathing is difficult',
                  ]:[
                    '✅ Lungs appear clear and healthy',
                    '🏃 Maintain an active lifestyle',
                    '😷 Avoid smoking and pollution',
                    '📅 Schedule regular health checkups',
                  ]).map((a,i)=>(
                    <div key={i}
                      className={`adv-item ${result.isPneumonia?'adv-d':'adv-s'}`}>
                      {a}
                    </div>
                  ))}
                </div>

                <p className="rc-file">📄 {result.filename}</p>
              </div>
            )}
          </div>
        </main>
      </>}

      {/* HISTORY */}
      {page === 'history' && (
        <main className="hist-page">
          <div className="hist-head">
            <div>
              <h2 className="hist-title">📋 Scan History</h2>
              <p className="hist-sub">
                Your X-Ray analysis records — saved in database
              </p>
            </div>
          </div>

          {histLoad ? (
            <div className="loading-state">
              <div className="load-orb"><div className="load-ring"/></div>
              <p className="load-t">Loading from database...</p>
            </div>
          ) : dbHistory.length === 0 ? (
            <div className="hist-empty">
              <span>📂</span>
              <p>No scans yet</p>
              <button className="btn-analyze"
                style={{marginTop:'20px',maxWidth:'200px'}}
                onClick={()=>setPage('home')}>
                🔍 Start Analyzing
              </button>
            </div>
          ):(
            <div className="hgrid">
              {dbHistory.map(r=>(
                <div key={r._id}
                  className={`hcard ${r.is_pneumonia?'hc-d':'hc-s'}`}>
                  <div className="hc-top">
                    <div className="hc-av">
                      {r.patient_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="hc-info">
                      <p className="hc-name">{r.patient_name}</p>
                      <p className="hc-meta">
                        Age {r.patient_age} · {r.created_at}
                      </p>
                    </div>
                    <span className={`hc-badge ${r.is_pneumonia?'hb-d':'hb-s'}`}>
                      {r.is_pneumonia ? '🔴 Pneumonia' : '🟢 Normal'}
                    </span>
                  </div>

                  <div className="hc-conf">
                    <div className="hcc-row">
                      <span>Confidence</span>
                      <span className="hcc-val">{r.confidence}%</span>
                    </div>
                    <div className="hcc-track">
                      <div
                        className={`hcc-fill ${r.is_pneumonia?'cf-d':'cf-s'}`}
                        style={{width:`${r.confidence}%`}}/>
                    </div>
                  </div>

                  <div className="hc-foot">
                    <span className="hc-time">📄 {r.filename}</span>
                    <button className="btn-del"
                      onClick={()=>handleDeleteHistory(r._id)}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <span>🫁 PneumoAI — PyTorch + FastAPI + React</span>
        <span className="foot-dot">·</span>
        <span>⚠️ Educational purposes only. Always consult a doctor.</span>
      </footer>
    </div>
  );
}

export default App;