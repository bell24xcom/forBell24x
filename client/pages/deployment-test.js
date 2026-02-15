import { useState } from 'react';

export default function DeploymentTest() {
    const [deployTime] = useState(new Date().toLocaleString());
    
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ 
                textAlign: 'center',
                padding: '3rem',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    🚀 DEPLOYMENT SUCCESS!
                </h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#a0f0a0' }}>
                    Bell24h Changes Are Now LIVE!
                </h2>
                <div style={{ 
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginBottom: '2rem'
                }}>
                    <p style={{ margin: 0, fontSize: '1.125rem' }}>
                        <strong>Deployment Time:</strong><br />
                        {deployTime}
                    </p>
                </div>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '2rem'
                }}>
                    <a 
                        href="/dashboard/ai-matching"
                        style={{
                            background: '#4CAF50',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        🤖 Test AI Matching
                    </a>
                    <a 
                        href="/dashboard/predictive-analytics"
                        style={{
                            background: '#2196F3',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        📊 Test Analytics
                    </a>
                    <a 
                        href="/dashboard"
                        style={{
                            background: '#FF9800',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        🏠 Test Dashboard
                    </a>
                </div>
                <div style={{ 
                    marginTop: '2rem',
                    padding: '1rem',
                    background: 'rgba(76, 175, 80, 0.2)',
                    borderRadius: '10px',
                    border: '1px solid #4CAF50'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#a0f0a0' }}>
                        ✅ VERIFICATION CHECKLIST:
                    </h3>
                    <ul style={{ textAlign: 'left', margin: 0, paddingLeft: '1rem' }}>
                        <li>If you can see this page, deployments are working!</li>
                        <li>Test the links above to verify all pages work</li>
                        <li>Check console for any remaining errors</li>
                        <li>Confirm changes persist after refresh</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
