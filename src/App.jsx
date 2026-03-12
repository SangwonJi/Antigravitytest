import { useState, useEffect } from 'react';
import { Box, Activity, Users, MessageSquare, Repeat2, Youtube, Instagram, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from 'recharts';
import Papa from 'papaparse';
import './index.css';

// Public CSV Paths 
const DATA_PATHS = {
  weibo: '/collab_report.csv',
  youtube: '/yt_regional_stats.csv',
  instagram: '/ig_collab_report.csv'
};

function App() {
  const [platform, setPlatform] = useState('weibo');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generic metrics
  const [metrics, setMetrics] = useState({
    collabs: 0,
    totalEngagement: 0,
    avgEngagement: 0
  });

  useEffect(() => {
    fetchData(platform);
  }, [platform]);

  const fetchData = async (plt) => {
    setLoading(true);
    let path = DATA_PATHS[plt];
    
    Papa.parse(path, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let parsed = results.data;
        processData(plt, parsed);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error loading CSV: ", err);
        setLoading(false);
      }
    });
  };

  const processData = (plt, rawData) => {
    if (plt === 'weibo') {
      const topData = rawData.slice(0, 10).map(item => ({
        name: item.partner_name,
        engagement: parseInt(item.total_attitudes) + parseInt(item.total_comments) + parseInt(item.total_reposts),
        category: item.category
      }));
      setData(topData);
      setMetrics({
        collabs: rawData.length,
        totalEngagement: rawData.reduce((acc, curr) => acc + parseInt(curr.total_attitudes || 0), 0),
        avgEngagement: Math.round(rawData.reduce((acc, curr) => acc + parseInt(curr.avg_attitudes || 0), 0) / rawData.length)
      });
    } 
    else if (plt === 'instagram') {
      const topData = rawData.slice(0, 10).map(item => ({
        name: item.partner,
        engagement: parseInt(item.total_likes),
        category: item.category
      }));
      setData(topData);
      setMetrics({
        collabs: rawData.length,
        totalEngagement: rawData.reduce((acc, curr) => acc + parseInt(curr.total_likes || 0), 0),
        avgEngagement: Math.round(rawData.reduce((acc, curr) => acc + parseInt(curr.avg_likes || 0), 0) / rawData.length)
      });
    }
    else if (plt === 'youtube') {
      const topData = rawData.map(item => ({
        name: item.region,
        engagement: parseInt(item.total_views),
        category: 'Region'
      })).sort((a,b)=>b.engagement - a.engagement);
      setData(topData);
      
      setMetrics({
        collabs: rawData.length, // essentially Regions here
        totalEngagement: rawData.reduce((acc, curr) => acc + parseInt(curr.total_views || 0), 0),
        avgEngagement: Math.round(rawData.reduce((acc, curr) => acc + parseInt(curr.avg_views || 0), 0) / rawData.length)
      });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header glass-panel">
        <div className="header-left">
          <Box className="logo-icon" size={32} />
          <div>
            <h1>Google PUBG Global Analytics</h1>
            <p className="subtitle">Interactive Multiform Dashboard</p>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="platform-selector">
          <button 
            className={`btn-platform ${platform === 'weibo' ? 'active' : ''}`} 
            onClick={() => setPlatform('weibo')}>
            <Globe size={18} /> Weibo
          </button>
          <button 
            className={`btn-platform ${platform === 'youtube' ? 'active' : ''}`} 
            onClick={() => setPlatform('youtube')}>
            <Youtube size={18} /> YouTube
          </button>
          <button 
            className={`btn-platform ${platform === 'instagram' ? 'active' : ''}`} 
            onClick={() => setPlatform('instagram')}>
            <Instagram size={18} /> Instagram
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {loading ? (
          <div className="loading-state">
            <Activity className="spinner" size={48} />
            <p>Gathering Global Intel...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card glass-panel slide-up" style={{animationDelay: '0.1s'}}>
                <div className="kpi-header">
                  <span className="kpi-title">{platform === 'youtube' ? 'Total Regions' : 'Total Collaborations'}</span>
                  <Users className="kpi-icon" size={24} style={{color: 'var(--accent)'}} />
                </div>
                <div className="kpi-value">{metrics.collabs.toLocaleString()}</div>
              </div>

              <div className="kpi-card glass-panel slide-up" style={{animationDelay: '0.2s'}}>
                <div className="kpi-header">
                  <span className="kpi-title">Total {platform === 'youtube' ? 'Views' : 'Engagement'}</span>
                  <MessageSquare className="kpi-icon" size={24} style={{color: 'var(--success)'}} />
                </div>
                <div className="kpi-value">{metrics.totalEngagement.toLocaleString()}</div>
              </div>

              <div className="kpi-card glass-panel slide-up" style={{animationDelay: '0.3s'}}>
                <div className="kpi-header">
                  <span className="kpi-title">Average {platform === 'youtube' ? 'Views' : 'Engagement'}</span>
                  <Activity className="kpi-icon" size={24} style={{color: 'var(--warning)'}} />
                </div>
                <div className="kpi-value">{metrics.avgEngagement.toLocaleString()}</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-container glass-panel slide-up" style={{animationDelay: '0.4s'}}>
              <h2>Top {platform === 'youtube' ? 'Regions by Views' : 'Partners by Engagement'}</h2>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-secondary)" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{fill: 'var(--text-secondary)', fontSize: 12}} 
                    />
                    <YAxis 
                      stroke="var(--text-secondary)"
                      tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value)}
                      tick={{fill: 'var(--text-secondary)', fontSize: 12}} 
                    />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ 
                        backgroundColor: 'var(--panel-bg)',
                        border: '1px solid var(--panel-border)',
                        borderRadius: '12px',
                        color: 'var(--text-primary)',
                        padding: '12px'
                      }}
                      formatter={(value) => new Intl.NumberFormat('en-US').format(value)}
                    />
                    <Bar 
                      dataKey="engagement" 
                      name={platform === 'youtube' ? 'Views' : 'Total Engagement'} 
                      radius={[4, 4, 0, 0]}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent)' : 'var(--success)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="table-container glass-panel slide-up" style={{animationDelay: '0.5s'}}>
              <h2>Dataset Overview ({platform.toUpperCase()})</h2>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{platform === 'youtube' ? 'Region' : 'Partner'}</th>
                      <th>Category</th>
                      <th style={{textAlign: 'right'}}>{platform === 'youtube' ? 'Views' : 'Engagement'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{fontWeight: '500'}}>{row.name}</td>
                        <td>
                          <span className="badge">{row.category}</span>
                        </td>
                        <td style={{textAlign: 'right', color: 'var(--accent)', fontWeight: 'bold'}}>
                          {row.engagement.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </>
        )}
      </div>
    </div>
  );
}

export default App;
