import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";
import "../styles/AdminDashboard.css";

function AdminResults() {
  const { user, isAdmin } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllResults();
  }, [isAdmin]);

  const fetchAllResults = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results/all`);
      const data = await res.json();
      console.log('API returned data:', data);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (result) => {
    console.log('Selected result:', result);
    setSelectedResult(result);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedResult(null);
  };

  if (!user) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="editor-placeholder">
            You must be logged in to view this page.
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="editor-placeholder">
            ⛔ You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <div>
            <h1>All Quiz Results</h1>
            <p>View all user quiz submissions and answers.</p>
          </div>
        </header>

        <div className="admin-dashboard-main">
          <section className="admin-dashboard-editor" style={{width: '100%'}}>
            <div className="editor-content">
              {loading && (
                <div className="editor-placeholder">Loading results...</div>
              )}

              {!loading && results.length === 0 && (
                <div className="editor-placeholder">No results found.</div>
              )}

              {!loading && results.length > 0 && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                      <tr>
                        <th style={{color: '#ffffff'}}>#</th>
                        <th style={{color: '#ffffff'}}>Email</th>
                        <th style={{color: '#ffffff'}}>Submitted At</th>
                        <th style={{color: '#ffffff', width: '150px'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={result.id || index}>
                          <td>{index + 1}</td>
                          <td>{result.email}</td>
                          <td>{result.created_at ? new Date(result.created_at).toLocaleString() : 'N/A'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => viewDetails(result)}
                            >
                              View Answers
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Modal for viewing answers */}
        {showModal && selectedResult && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#fff',padding:'2rem',borderRadius:'8px',minWidth:'400px',maxWidth:'90vw',maxHeight:'90vh',overflowY:'auto'}}>
              <h3>Quiz Results</h3>
              <p><b>Email:</b> {selectedResult.email}</p>
              <p><b>Submitted:</b> {selectedResult.created_at ? new Date(selectedResult.created_at).toLocaleString() : 'N/A'}</p>
              
              <h4>Answers:</h4>
              
              {(() => {
                let claw, snake, castle;
                
                // Check if data is already an object or needs parsing
                try { 
                  claw = selectedResult.claw_data;
                  if (typeof claw === 'string') {
                    claw = JSON.parse(claw);
                  }
                  console.log('Claw data:', claw);
                } catch (e) { 
                  console.error('Claw parse error:', e);
                  claw = null; 
                }
                
                try { 
                  snake = selectedResult.snake_data;
                  if (typeof snake === 'string') {
                    snake = JSON.parse(snake);
                  }
                  console.log('Snake data:', snake);
                } catch (e) { 
                  console.error('Snake parse error:', e);
                  snake = null; 
                }
                
                try { 
                  castle = selectedResult.castle_data;
                  if (typeof castle === 'string') {
                    castle = JSON.parse(castle);
                  }
                  console.log('Castle data:', castle);
                } catch (e) { 
                  console.error('Castle parse error:', e);
                  castle = null; 
                }
                
                // If all are null or empty, show message
                if (!claw && !snake && !castle) {
                  return <p><i>No game data available</i></p>;
                }
                
                return (
                  <div>
                    {claw && (
                      <div style={{marginBottom:'1em'}}>
                        <b>Claw Game:</b>
                        {claw.answers && claw.answers.length > 0 ? (
                          <ul style={{paddingLeft:'1em'}}>
                            {claw.answers.map((a, i) => (
                              <li key={i} style={{marginBottom:'0.5em'}}>
                                <span style={{fontWeight:'bold'}}>Q:</span> {a.question}<br/>
                                <span style={{fontWeight:'bold'}}>A:</span> {a.answer}
                              </li>
                            ))}
                          </ul>
                        ) : <i>No answers</i>}
                        {claw.personalityType && (
                          <div style={{marginTop:'0.5em'}}><b>Personality Type:</b> {claw.personalityType}</div>
                        )}
                      </div>
                    )}
                    
                    {snake && (
                      <div style={{marginBottom:'1em'}}>
                        <b>Snake Game:</b>
                        {snake.answers && snake.answers.length > 0 ? (
                          <ul style={{paddingLeft:'1em'}}>
                            {snake.answers.map((a, i) => (
                              <li key={i} style={{marginBottom:'0.5em'}}>
                                <span style={{fontWeight:'bold'}}>Q:</span> {a.q || a.question || ''}<br/>
                                <span style={{fontWeight:'bold'}}>A:</span> {a.a || a.answer || ''}
                              </li>
                            ))}
                          </ul>
                        ) : <i>No answers</i>}
                        {snake.types && snake.types.length > 0 && (
                          <div style={{marginTop:'0.5em'}}><b>Types:</b> {snake.types.join(', ')}</div>
                        )}
                      </div>
                    )}
                    
                    {castle && (
                      <div style={{marginBottom:'1em'}}>
                        <b>Castle Game:</b>
                        {castle.answers && castle.answers.length > 0 ? (
                          <ul style={{paddingLeft:'1em'}}>
                            {castle.answers.map((a, i) => (
                              <li key={i} style={{marginBottom:'0.5em'}}>
                                <span style={{fontWeight:'bold'}}>Q:</span> {a.question}<br/>
                                <span style={{fontWeight:'bold'}}>A:</span> {a.answer}
                              </li>
                            ))}
                          </ul>
                        ) : <i>No answers</i>}
                        {castle.choices && castle.choices.length > 0 && (
                          <div style={{marginTop:'0.5em'}}><b>Choices:</b> {castle.choices.join(', ')}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              
              <button onClick={closeModal} className="btn-outline" style={{marginTop:'1rem'}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminResults;
