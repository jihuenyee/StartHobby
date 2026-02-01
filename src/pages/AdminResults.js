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
  const [aiProfile, setAiProfile] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    fetchAllResults();
  }, [isAdmin]);

  const fetchAllResults = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/results/all`);
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error:', errorData);
        throw new Error(`Server error: ${errorData.error || res.statusText}`);
      }
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

  const viewAiProfile = async (email) => {
    setAiLoading(true);
    setShowAiModal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/results/ai-profile/${encodeURIComponent(email)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch AI profile');
      }
      const data = await res.json();
      setAiProfile(data);
    } catch (err) {
      console.error('Error fetching AI profile:', err);
      setAiProfile({ error: err.message });
    } finally {
      setAiLoading(false);
    }
  };

  const closeAiModal = () => {
    setShowAiModal(false);
    setAiProfile(null);
  };

  // Filter results based on search term
  const filteredResults = results.filter(result => 
    result.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {!loading && results.length > 0 && (
                <div style={{marginBottom: '1.5rem'}}>
                  <input
                    type="text"
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#11998e'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                  {searchTerm && (
                    <span style={{marginLeft: '1rem', color: '#666'}}>
                      Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              )}

              {loading && (
                <div className="editor-placeholder">Loading results...</div>
              )}

              {!loading && results.length === 0 && (
                <div className="editor-placeholder">No results found.</div>
              )}

              {!loading && results.length > 0 && filteredResults.length === 0 && (
                <div className="editor-placeholder">No results match "{searchTerm}"</div>
              )}

              {!loading && results.length > 0 && filteredResults.length > 0 && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                      <tr>
                        <th style={{color: '#ffffff'}}>#</th>
                        <th style={{color: '#ffffff'}}>Email</th>
                        <th style={{color: '#ffffff'}}>Submitted At</th>
                        <th style={{color: '#ffffff', width: '200px'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.map((result, index) => (
                        <tr key={result.id || index}>
                          <td>{index + 1}</td>
                          <td>{result.email}</td>
                          <td>{result.created_at ? new Date(result.created_at).toLocaleString() : 'N/A'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => viewDetails(result)}
                              style={{marginRight: '0.5rem'}}
                            >
                              View Answers
                            </button>
                            <button
                              type="button"
                              className="btn-outline"
                              onClick={() => viewAiProfile(result.email)}
                            >
                              AI Profile
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

        {/* Modal for viewing AI Profile */}
        {showAiModal && (
          <div className="modal-overlay" onClick={closeAiModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px'}}>
              <div className="modal-header">
                <h3>🎨 AI Personality Profile</h3>
                <button className="modal-close" onClick={closeAiModal}>×</button>
              </div>
              
              <div className="modal-body">
                {aiLoading && (
                  <div style={{textAlign: 'center', padding: '3rem'}}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔄</div>
                    <p style={{color: '#718096', fontSize: '1.1rem'}}>Generating AI profile...</p>
                  </div>
                )}
                
                {!aiLoading && aiProfile && aiProfile.error && (
                  <div style={{
                    background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
                    border: '2px solid #f56565',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>⚠️</div>
                    <p style={{color: '#c53030', fontWeight: '600', margin: 0}}>Error: {aiProfile.error}</p>
                  </div>
                )}
                
                {!aiLoading && aiProfile && !aiProfile.error && (
                  <div>
                    <div style={{
                      background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem',
                      border: '2px solid #11998e'
                    }}>
                      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                        <div style={{flex: '1', minWidth: '200px'}}>
                          <div style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', marginBottom: '0.25rem'}}>Email</div>
                          <div style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748'}}>{aiProfile.email}</div>
                        </div>
                        <div style={{flex: '1', minWidth: '200px'}}>
                          <div style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', marginBottom: '0.25rem'}}>Generated</div>
                          <div style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748'}}>
                            {aiProfile.created_at ? new Date(aiProfile.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)',
                      borderRadius: '16px',
                      padding: '1.75rem',
                      marginBottom: '1.5rem',
                      border: '2px solid #ffc107',
                      boxShadow: '0 4px 15px rgba(255, 193, 7, 0.2)'
                    }}>
                      <h4 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.25rem',
                        color: '#11998e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>✨</span> Personality Summary
                      </h4>
                      <p style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.7',
                        fontSize: '1rem',
                        color: '#2d3748',
                        margin: 0
                      }}>
                        {aiProfile.personality_summary || 'No summary available'}
                      </p>
                    </div>
                    
                    {(() => {
                      try {
                        const traits = typeof aiProfile.traits === 'string' 
                          ? JSON.parse(aiProfile.traits) 
                          : aiProfile.traits;
                        
                        return traits && Array.isArray(traits) && traits.length > 0 && (
                          <div style={{marginBottom: '1.5rem'}}>
                            <h4 style={{
                              margin: '0 0 1rem 0',
                              fontSize: '1.25rem',
                              color: '#11998e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>📊</span> Personality Traits
                            </h4>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
                              {traits.map((trait, i) => (
                                <div key={i} style={{
                                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                  borderRadius: '12px',
                                  padding: '1.25rem',
                                  border: '2px solid #dee2e6',
                                  transition: 'transform 0.2s',
                                  cursor: 'default'
                                }}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                                    <span style={{fontWeight: '700', color: '#2d3748', fontSize: '1rem'}}>{trait.trait}</span>
                                    <span style={{
                                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                      color: 'white',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '20px',
                                      fontWeight: '700',
                                      fontSize: '0.9rem'
                                    }}>
                                      {trait.score}/10
                                    </span>
                                  </div>
                                  <div style={{background: '#fff', borderRadius: '8px', height: '8px', overflow: 'hidden'}}>
                                    <div style={{
                                      width: `${(trait.score / 10) * 100}%`,
                                      height: '100%',
                                      background: 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
                                      transition: 'width 0.3s ease'
                                    }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error('Traits parse error:', e);
                        return null;
                      }
                    })()}
                    
                    {(() => {
                      try {
                        const hobbies = typeof aiProfile.hobbies === 'string' 
                          ? JSON.parse(aiProfile.hobbies) 
                          : aiProfile.hobbies;
                        
                        return hobbies && Array.isArray(hobbies) && hobbies.length > 0 && (
                          <div>
                            <h4 style={{
                              margin: '0 0 1rem 0',
                              fontSize: '1.25rem',
                              color: '#11998e',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}>
                              <span>🎯</span> Recommended Hobbies
                            </h4>
                            <div style={{display: 'grid', gap: '1rem'}}>
                              {hobbies.map((hobby, i) => (
                                <div key={i} style={{
                                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                  borderRadius: '16px',
                                  padding: '1.5rem',
                                  borderLeft: '5px solid #38ef7d',
                                  boxShadow: '0 4px 12px rgba(56, 239, 125, 0.15)',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }} onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateX(5px)';
                                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 239, 125, 0.25)';
                                }} onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(56, 239, 125, 0.15)';
                                }}>
                                  <h5 style={{margin: '0 0 1rem 0', fontSize: '1.35rem', color: '#11998e', fontWeight: '700'}}>
                                    {hobby.name}
                                  </h5>
                                  <div style={{display: 'grid', gap: '0.75rem'}}>
                                    <div>
                                      <div style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', marginBottom: '0.25rem'}}>Why This Hobby</div>
                                      <div style={{color: '#2d3748', lineHeight: '1.6'}}>{hobby.why}</div>
                                    </div>
                                    <div style={{display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
                                      <div style={{background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <span style={{fontSize: '1.25rem'}}>📂</span>
                                        <div>
                                          <div style={{fontSize: '0.7rem', color: '#718096'}}>Category</div>
                                          <div style={{fontWeight: '600', color: '#2d3748'}}>{hobby.category}</div>
                                        </div>
                                      </div>
                                      <div style={{background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
                                        <span style={{fontSize: '1.25rem'}}>{hobby.social ? '👥' : '🧘'}</span>
                                        <div>
                                          <div style={{fontSize: '0.7rem', color: '#718096'}}>Type</div>
                                          <div style={{fontWeight: '600', color: '#2d3748'}}>{hobby.social ? 'Social' : 'Solo'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error('Hobbies parse error:', e);
                        return null;
                      }
                    })()}
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button onClick={closeAiModal} className="btn-submit">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for viewing answers */}
        {showModal && selectedResult && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px'}}>
              <div className="modal-header">
                <h3>📝 Quiz Results</h3>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              
              <div className="modal-body">
                <div style={{
                  background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  border: '2px solid #11998e'
                }}>
                  <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                    <div style={{flex: '1', minWidth: '200px'}}>
                      <div style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', marginBottom: '0.25rem'}}>Email</div>
                      <div style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748'}}>{selectedResult.email}</div>
                    </div>
                    <div style={{flex: '1', minWidth: '200px'}}>
                      <div style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', marginBottom: '0.25rem'}}>Submitted</div>
                      <div style={{fontSize: '1rem', fontWeight: '600', color: '#2d3748'}}>
                        {selectedResult.created_at ? new Date(selectedResult.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {(() => {
                  let claw, snake, castle;
                  
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
                  
                  if (!claw && !snake && !castle) {
                    return (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'linear-gradient(135deg, #f7f7f7 0%, #e9e9e9 100%)',
                        borderRadius: '12px'
                      }}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📭</div>
                        <p style={{color: '#718096', fontSize: '1.1rem', margin: 0}}>No game data available</p>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                      {claw && (
                        <div style={{
                          background: 'linear-gradient(135deg, #fff4e6 0%, #ffe0b2 100%)',
                          borderRadius: '16px',
                          padding: '1.75rem',
                          border: '2px solid #ff9800',
                          boxShadow: '0 4px 15px rgba(255, 152, 0, 0.15)'
                        }}>
                          <h4 style={{
                            margin: '0 0 1.25rem 0',
                            fontSize: '1.35rem',
                            color: '#11998e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{fontSize: '1.5rem'}}>🎮</span> Claw Game
                          </h4>
                          {claw.answers && claw.answers.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                              {claw.answers.map((a, i) => (
                                <div key={i} style={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  borderRadius: '12px',
                                  padding: '1.25rem',
                                  border: '2px solid rgba(255, 152, 0, 0.3)'
                                }}>
                                  <div style={{marginBottom: '0.75rem'}}>
                                    <span style={{
                                      display: 'inline-block',
                                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                      color: 'white',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                      marginRight: '0.5rem'
                                    }}>Q{i + 1}</span>
                                    <span style={{color: '#2d3748', fontSize: '1.05rem', fontWeight: '500'}}>{a.question}</span>
                                  </div>
                                  <div style={{
                                    paddingLeft: '1rem',
                                    borderLeft: '3px solid #38ef7d',
                                    color: '#4a5568',
                                    fontSize: '1rem',
                                    fontStyle: 'italic'
                                  }}>
                                    {a.answer}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{color: '#718096', fontStyle: 'italic', margin: 0}}>No answers recorded</p>}
                          {claw.personalityType && (
                            <div style={{
                              marginTop: '1rem',
                              background: 'rgba(255, 255, 255, 0.9)',
                              padding: '1rem 1.25rem',
                              borderRadius: '10px',
                              display: 'inline-block',
                              border: '2px dashed #11998e'
                            }}>
                              <span style={{fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', color: '#11998e', display: 'block', marginBottom: '0.25rem'}}>Personality Type</span>
                              <span style={{fontSize: '1.15rem', fontWeight: '700', color: '#2d3748'}}>{claw.personalityType}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {snake && (
                        <div style={{
                          background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                          borderRadius: '16px',
                          padding: '1.75rem',
                          border: '2px solid #9c27b0',
                          boxShadow: '0 4px 15px rgba(156, 39, 176, 0.15)'
                        }}>
                          <h4 style={{
                            margin: '0 0 1.25rem 0',
                            fontSize: '1.35rem',
                            color: '#11998e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{fontSize: '1.5rem'}}>🐍</span> Snake & Ladder Game
                          </h4>
                          {snake.answers && snake.answers.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                              {snake.answers.map((a, i) => (
                                <div key={i} style={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  borderRadius: '12px',
                                  padding: '1.25rem',
                                  border: '2px solid rgba(156, 39, 176, 0.3)'
                                }}>
                                  <div style={{marginBottom: '0.75rem'}}>
                                    <span style={{
                                      display: 'inline-block',
                                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                      color: 'white',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                      marginRight: '0.5rem'
                                    }}>Q{i + 1}</span>
                                    <span style={{color: '#2d3748', fontSize: '1.05rem', fontWeight: '500'}}>{a.q || a.question || 'Question'}</span>
                                  </div>
                                  <div style={{
                                    paddingLeft: '1rem',
                                    borderLeft: '3px solid #38ef7d',
                                    color: '#4a5568',
                                    fontSize: '1rem',
                                    fontStyle: 'italic'
                                  }}>
                                    {a.a || a.answer || 'N/A'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{color: '#718096', fontStyle: 'italic', margin: 0}}>No answers recorded</p>}
                          {snake.types && snake.types.length > 0 && (
                            <div style={{marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                              <span style={{fontSize: '0.85rem', fontWeight: '700', color: '#11998e', marginRight: '0.5rem', alignSelf: 'center'}}>Types:</span>
                              {snake.types.map((type, idx) => (
                                <span key={idx} style={{
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  padding: '0.4rem 1rem',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#2d3748',
                                  border: '2px solid #9c27b0'
                                }}>
                                  {type}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {castle && (
                        <div style={{
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                          borderRadius: '16px',
                          padding: '1.75rem',
                          border: '2px solid #2196f3',
                          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.15)'
                        }}>
                          <h4 style={{
                            margin: '0 0 1.25rem 0',
                            fontSize: '1.35rem',
                            color: '#11998e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{fontSize: '1.5rem'}}>🏰</span> Castle Game
                          </h4>
                          {castle.answers && castle.answers.length > 0 ? (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                              {castle.answers.map((a, i) => (
                                <div key={i} style={{
                                  background: 'rgba(255, 255, 255, 0.8)',
                                  borderRadius: '12px',
                                  padding: '1.25rem',
                                  border: '2px solid rgba(33, 150, 243, 0.3)'
                                }}>
                                  <div style={{marginBottom: '0.75rem'}}>
                                    <span style={{
                                      display: 'inline-block',
                                      background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                      color: 'white',
                                      padding: '0.25rem 0.75rem',
                                      borderRadius: '6px',
                                      fontSize: '0.75rem',
                                      fontWeight: '700',
                                      marginRight: '0.5rem'
                                    }}>Q{i + 1}</span>
                                    <span style={{color: '#2d3748', fontSize: '1.05rem', fontWeight: '500'}}>{a.question}</span>
                                  </div>
                                  <div style={{
                                    paddingLeft: '1rem',
                                    borderLeft: '3px solid #38ef7d',
                                    color: '#4a5568',
                                    fontSize: '1rem',
                                    fontStyle: 'italic'
                                  }}>
                                    {a.answer}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : <p style={{color: '#718096', fontStyle: 'italic', margin: 0}}>No answers recorded</p>}
                          {castle.choices && castle.choices.length > 0 && (
                            <div style={{marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                              <span style={{fontSize: '0.85rem', fontWeight: '700', color: '#11998e', marginRight: '0.5rem', alignSelf: 'center'}}>Choices:</span>
                              {castle.choices.map((choice, idx) => (
                                <span key={idx} style={{
                                  background: 'rgba(255, 255, 255, 0.9)',
                                  padding: '0.4rem 1rem',
                                  borderRadius: '20px',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  color: '#2d3748',
                                  border: '2px solid #2196f3'
                                }}>
                                  {choice}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              <div className="modal-footer">
                <button onClick={closeModal} className="btn-submit">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminResults;
