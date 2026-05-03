import { useState, useRef, useMemo } from 'react'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis
} from 'recharts'
import { 
  Trophy, Activity, Layout, Info, BarChart3, Download, PlayCircle, Send
} from 'lucide-react'

const ConfusionMatrix = ({ matrix, labels }) => {
  const total = matrix.flat().reduce((a, b) => a + b, 0)
  const size = matrix.length

  const getCellColor = (value, isDiagonal) => {
    const intensity = total > 0 ? value / total : 0
    if (isDiagonal) {
      return `rgba(16, 185, 129, ${0.1 + intensity * 0.9})` // Success color
    }
    return `rgba(239, 68, 68, ${intensity * 0.9})` // Danger color
  }

  return (
    <div className="confusion-matrix-wrapper">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="cm-axis-title" style={{ marginBottom: '10px' }}>Predicted</div>
        <div style={{ display: 'flex' }}>
          <div className="cm-axis-title" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginRight: '10px' }}>Actual</div>
          <div className="cm-grid" style={{ 
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`
          }}>
            {/* Column Labels */}
            <div style={{ gridColumn: `1 / span ${size}`, display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, position: 'absolute', top: '-30px', left: 0, right: 0 }}>
              {labels.map((label, i) => (
                <div key={i} className="cm-label col">{label}</div>
              ))}
            </div>
            
            {/* Row Labels & Matrix Cells */}
            {matrix.map((row, i) => (
              <>
                <div key={`label-${i}`} style={{ position: 'absolute', left: '-60px', width: '50px', height: `${100/size}%`, top: `${(i/size)*100}%`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} className="cm-label row">
                  {labels[i]}
                </div>
                {row.map((val, j) => (
                  <div 
                    key={`${i}-${j}`} 
                    className="cm-cell"
                    style={{ background: getCellColor(val, i === j) }}
                    title={`Actual: ${labels[i]}, Predicted: ${labels[j]}\nCount: ${val}`}
                  >
                    <span className="cm-value">{val}</span>
                    <span className="cm-percentage">{((val / total) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--success-color)', borderRadius: '2px' }}></div> Correct
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--danger-color)', borderRadius: '2px' }}></div> Incorrect
        </div>
      </div>
    </div>
  )
}

const RegressionPlot = ({ data }) => {
  const chartData = useMemo(() => {
    return data.slice(0, 100).map((d, i) => ({ ...d, index: i }))
  }, [data])

  // Calculate identity line (perfect prediction)
  const minVal = Math.min(...data.map(d => Math.min(d.actual, d.predicted)))
  const maxVal = Math.max(...data.map(d => Math.max(d.actual, d.predicted)))
  const lineData = [{ x: minVal, y: minVal }, { x: maxVal, y: maxVal }]

  return (
    <div className="regression-plot-container">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            type="number" 
            dataKey="actual" 
            name="Actual" 
            unit="" 
            stroke="var(--text-muted)" 
            label={{ value: 'Actual Values', position: 'bottom', fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="predicted" 
            name="Predicted" 
            unit="" 
            stroke="var(--text-muted)"
            label={{ value: 'Predicted Values', angle: -90, position: 'left', fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <ZAxis range={[60, 60]} />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="custom-tooltip">
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary-color)' }}>Sample Detail</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Actual: {data.actual.toFixed(4)}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.9rem' }}>Predicted: {data.predicted.toFixed(4)}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--success-color)' }}>Error: {Math.abs(data.actual - data.predicted).toFixed(4)}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend verticalAlign="top" height={36}/>
          <Scatter 
            name="Predictions" 
            data={chartData} 
            fill="var(--primary-color)" 
            fillOpacity={0.6} 
          />
          {/* Identity Line */}
          <Scatter 
            name="Perfect Fit" 
            data={lineData} 
            line={{ stroke: 'rgba(16, 185, 129, 0.5)', strokeWidth: 2, strokeDasharray: '5 5' }} 
            shape={() => null}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

const FeatureImportance = ({ data }) => {
  const maxImportance = Math.max(...data.map(d => d.abs_importance))
  
  return (
    <div className="feature-importance-list">
      {data.slice(0, 10).map((item, idx) => (
        <div key={idx} className="feature-bar-container">
          <div className="feature-bar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span className="feature-name">{item.feature}</span>
              <span className={`contribution-badge ${item.importance >= 0 ? 'contribution-positive' : 'contribution-negative'}`}>
                {item.importance >= 0 ? 'Positive' : 'Negative'}
              </span>
            </div>
            <span className="feature-value">{(item.abs_importance / maxImportance * 100).toFixed(1)}% weight</span>
          </div>
          <div className="feature-bar-bg">
            <div 
              className="feature-bar-fill" 
              style={{ width: `${(item.abs_importance / maxImportance * 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

const ExplainabilitySection = ({ result }) => {
  return (
    <div className="explainability-section">
      <div className="dashboard-card">
        <div className="card-header-with-icon">
          <div className="card-icon"><Info size={24} /></div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Model Explainability & Logic</h2>
        </div>
        
        <div className="explanation-card">
          <p className="explanation-text">
            {result.best_model.explanation}
          </p>
        </div>

        <div className="feature-importance-grid">
          <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>Feature Importance (Global)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              The chart below shows which features had the most significant impact on the model's predictions overall.
            </p>
            <FeatureImportance data={result.best_model.feature_importance} />
          </div>

          <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ borderBottomColor: 'rgba(255,255,255,0.05)' }}>Top Contributing Features</h3>
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table style={{ background: 'transparent' }}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {result.best_model.feature_importance.slice(0, 5).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.feature}</td>
                      <td>
                        <span className={`contribution-badge ${item.importance >= 0 ? 'contribution-positive' : 'contribution-negative'}`}>
                          {item.importance >= 0 ? 'Increase' : 'Decrease'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <p style={{ opacity: 0.8 }}>
                <strong>How to read this:</strong> Features with 'Increase' impact tend to push the model's prediction higher (or towards the positive class) when their value increases, while 'Decrease' impact features do the opposite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PredictionSection = ({ result }) => {
  const [inputs, setInputs] = useState({})
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const features = result.best_model.feature_importance.map(f => f.feature)

  const handleInputChange = (feature, value) => {
    setInputs(prev => ({ ...prev, [feature]: value }))
  }

  const handlePredict = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Prediction failed')
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="prediction-section" style={{ marginTop: '2rem' }}>
      <div className="dashboard-card" style={{ border: '1px solid var(--success-color)', background: 'rgba(16, 185, 129, 0.02)' }}>
        <div className="card-header-with-icon">
          <div className="card-icon" style={{ background: 'var(--success-color)' }}><PlayCircle size={24} /></div>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Live Model Prediction</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Test your trained model with custom input values to see real-time predictions.
        </p>

        <form onSubmit={handlePredict} className="prediction-form">
          <div className="prediction-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {features.map(feature => (
              <div key={feature} className="input-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600' }}>{feature}</label>
                <input 
                  type="text" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    border: '1px solid var(--border-color)',
                    color: 'white'
                  }}
                  placeholder={`Value for ${feature}`}
                  value={inputs[feature] || ''}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ padding: '0.8rem 2rem', minWidth: '180px' }}
            >
              {loading ? <><span className="loader"></span> Predicting...</> : <><Send size={18} style={{ marginRight: '8px' }} /> Run Prediction</>}
            </button>

            {prediction && (
              <div className="prediction-result-card animate-in" style={{ 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '1rem 2rem', 
                borderRadius: '12px', 
                border: '1px solid var(--success-color)',
                minWidth: '200px'
              }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>Predicted {prediction.target_column}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success-color)' }}>
                  {typeof prediction.prediction === 'number' ? prediction.prediction.toFixed(4) : prediction.prediction}
                </div>
              </div>
            )}
          </div>

          {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}


function App() {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.')
      return
    }
    setError(null)
    setFile(selectedFile)
    setPreviewData(null)
  }

  const [targetColumn, setTargetColumn] = useState('')
  const [preprocessResult, setPreprocessResult] = useState(null)
  const [isPreprocessing, setIsPreprocessing] = useState(false)
  const [trainResult, setTrainResult] = useState(null)
  const [isTraining, setIsTraining] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setPreprocessResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload file')
      }

      const data = await response.json()
      setPreviewData(data)
      // Default target column to the last one
      if (data.columns && data.columns.length > 0) {
        setTargetColumn(data.columns[data.columns.length - 1])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePreprocess = async () => {
    if (!file || !targetColumn) return

    setIsPreprocessing(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_column', targetColumn)

    try {
      const response = await fetch('http://127.0.0.1:8000/preprocess', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to preprocess data')
      }

      const data = await response.json()
      setPreprocessResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsPreprocessing(false)
    }
  }

  const handleTrain = async () => {
    if (!file) return

    setIsTraining(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (targetColumn) {
      formData.append('target_column', targetColumn)
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/train', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to train models')
      }

      const data = await response.json()
      setTrainResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsTraining(false)
    }
  }

  const handleDownloadModel = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/download-model')
      if (!response.ok) throw new Error('Failed to download model')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'best_model.joblib'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError('Could not download model: ' + err.message)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Autonomous ML Builder</h1>
        <p>Upload your dataset to start building intelligent pipelines effortlessly.</p>
      </header>

      <main>
        <div className="glass-card">
          {!previewData ? (
            <>
              <div 
                className={`upload-area ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  accept=".csv" 
                  className="file-input" 
                />
                <span className="upload-icon">📁</span>
                <div className="upload-text">
                  {file ? file.name : 'Click or drag CSV file to this area to upload'}
                </div>
                <div className="upload-hint">Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files.</div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={!file || loading}
                >
                  {loading ? (
                    <><span className="loader"></span> Processing Dataset...</>
                  ) : (
                    'Upload and Preview Dataset'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="preview-container">
              <div className="preview-header">
                <div className="preview-title">
                  📊 {previewData.filename}
                </div>
                <div className="stats-badges">
                  <span className="badge">Rows: {previewData.row_count}</span>
                  <span className="badge">Columns: {previewData.column_count}</span>
                </div>
              </div>

              {!preprocessResult ? (
                <>
                  <div className="dashboard-card" style={{ marginBottom: '1.5rem', border: '1px solid var(--primary-color)' }}>
                    <h3 style={{ borderBottomColor: 'var(--primary-color)' }}>Configure ML Pipeline</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8, fontWeight: '500' }}>Target Variable (Label)</label>
                        <select 
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '0.8rem', 
                            borderRadius: '8px', 
                            background: 'rgba(15, 23, 42, 0.8)', 
                            color: 'white', 
                            border: '1px solid var(--border-color)',
                            fontSize: '1rem'
                          }}
                          value={targetColumn}
                          onChange={(e) => setTargetColumn(e.target.value)}
                        >
                          {previewData.columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ alignSelf: 'flex-end' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={handlePreprocess}
                          disabled={isPreprocessing}
                          style={{ minWidth: '200px' }}
                        >
                          {isPreprocessing ? (
                            <><span className="loader"></span> Preprocessing...</>
                          ) : (
                            '🚀 Prepare Data'
                          )}
                        </button>
                      </div>
                    </div>
                    {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
                    <p className="upload-hint" style={{ marginTop: '1rem' }}>
                      Running preparation will handle missing values, encode text, and scale features for model training.
                    </p>
                  </div>
                  
                  <div className="dashboard-grid two-cols">
                    {/* Missing Values & Types */}
                    <div className="dashboard-card">
                      <h3>Dataset Schema & Quality</h3>
                      <div className="table-wrapper" style={{ maxHeight: '300px' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Feature</th>
                              <th>Type</th>
                              <th>Missing</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.columns.map(col => (
                              <tr key={col}>
                                <td>{col}</td>
                                <td><span className="badge">{previewData.feature_types?.[col] || 'unknown'}</span></td>
                                <td style={{ color: previewData.missing_values?.[col] > 0 ? 'var(--danger-color)' : 'inherit' }}>
                                  {previewData.missing_values?.[col] || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="dashboard-card">
                      <h3>Summary Statistics</h3>
                      {previewData.summary_stats && Object.keys(previewData.summary_stats).length > 0 ? (
                        <div className="table-wrapper" style={{ maxHeight: '300px' }}>
                          <table>
                            <thead>
                              <tr>
                                <th>Feature</th>
                                <th>Mean</th>
                                <th>Min</th>
                                <th>Max</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(previewData.summary_stats).map(([col, stats]) => (
                                <tr key={col}>
                                  <td>{col}</td>
                                  <td>{stats['mean'] !== null && stats['mean'] !== undefined ? Number(stats['mean']).toFixed(2) : '-'}</td>
                                  <td>{stats['min'] !== null && stats['min'] !== undefined ? Number(stats['min']).toFixed(2) : '-'}</td>
                                  <td>{stats['max'] !== null && stats['max'] !== undefined ? Number(stats['max']).toFixed(2) : '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="upload-hint" style={{ padding: '2rem' }}>No numerical features found.</p>
                      )}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Data Preview (First 10 rows)</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            {previewData.columns.map((col, index) => (
                              <th key={index}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.preview.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {previewData.columns.map((col, colIndex) => (
                                <td key={colIndex}>{row[col]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="preprocess-results" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                  <div className="dashboard-card" style={{ border: '1px solid var(--success-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <h2 style={{ color: 'var(--success-color)', fontSize: '1.5rem', fontWeight: '600' }}>✅ Data Ready for Training</h2>
                      <button className="btn btn-secondary" onClick={() => setPreprocessResult(null)} style={{ padding: '0.5rem 1rem' }}>Edit Pipeline</button>
                    </div>
                    
                    <div className="dashboard-grid two-cols">
                      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Applied Transformations</h4>
                        <ul style={{ paddingLeft: '1.5rem' }}>
                          {preprocessResult.preprocessing_steps.map((step, idx) => (
                            <li key={idx} style={{ marginBottom: '0.8rem', fontSize: '0.95rem' }}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--secondary-color)' }}>Dataset Partitioning</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>Training Set</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{preprocessResult.train_test_split.X_train_shape[0]}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Samples</div>
                          </div>
                          <div className="stat-card" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>Testing Set</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{preprocessResult.train_test_split.X_test_shape[0]}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Samples</div>
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)' }}>
                            Target: {preprocessResult.target_column} ({preprocessResult.is_classification ? 'Classification' : 'Regression'})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card" style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ marginBottom: '1rem' }}>Processed Features Preview</h4>
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              {Object.keys(preprocessResult.processed_preview[0] || {}).map(col => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preprocessResult.processed_preview.map((row, i) => (
                              <tr key={i}>
                                {Object.values(row).map((val, j) => (
                                  <td key={j}>{typeof val === 'number' ? val.toFixed(3) : val}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="upload-hint" style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                        * Numerical values above have been standardized (Mean=0, Std=1) for optimal model convergence.
                      </p>
                    </div>

                    {!trainResult ? (
                      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleTrain}
                          disabled={isTraining}
                          style={{ padding: '1.2rem 4rem', fontSize: '1.2rem', borderRadius: '12px', minWidth: '280px' }}
                        >
                          {isTraining ? (
                            <><span className="loader"></span> Training Models...</>
                          ) : (
                            'Train Model Now 🚀'
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="train-results" style={{ marginTop: '3rem', animation: 'fadeInUp 0.6s ease-out' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                          <div className="card-header-with-icon">
                            <div className="card-icon"><Trophy size={32} /></div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>Model Intelligence Report</h2>
                          </div>
                          <div className="badge" style={{ background: 'var(--primary-color)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={16} />
                            {trainResult.task_type} Analysis
                          </div>
                        </div>

                        <div className="dashboard-card best-model-card" style={{ 
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                          border: '2px solid var(--primary-color)',
                          marginBottom: '2rem',
                          position: 'relative',
                          overflow: 'hidden',
                          padding: '2.5rem'
                        }}>
                          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '8rem', opacity: 0.05, transform: 'rotate(15deg)' }}>🏆</div>
                          <div style={{ position: 'relative', zIndex: 1 }}>
                            <h4 style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', fontWeight: '700' }}>Algorithm Winner</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                              <div style={{ fontSize: '2.8rem', fontWeight: '800' }}>{trainResult.best_model.name}</div>
                              <span className="best-badge" style={{ fontSize: '1rem', padding: '4px 12px' }}>BEST PERFORMER</span>
                            </div>
                            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                              {Object.entries(trainResult.best_model.metrics).map(([name, val]) => (
                                <div key={name} className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px', minWidth: '150px' }}>
                                  <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '0.5rem' }}>{name}</div>
                                  <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--success-color)' }}>
                                    {typeof val === 'number' && name !== 'RMSE' ? (val * 100).toFixed(1) + '%' : val}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="viz-container">
                          <div className="dashboard-card">
                            <div className="card-header-with-icon">
                              <div className="card-icon"><BarChart3 size={20} /></div>
                              <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Performance Visualization</h3>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                              {trainResult.task_type === 'Classification' 
                                ? 'Visualizing the prediction accuracy across different classes using a Confusion Matrix.'
                                : 'Analyzing the residual distribution and prediction accuracy through an Actual vs Predicted scatter plot.'}
                            </p>
                            
                            {trainResult.task_type === 'Classification' ? (
                              <ConfusionMatrix 
                                matrix={trainResult.visualization.confusion_matrix} 
                                labels={trainResult.visualization.labels} 
                              />
                            ) : (
                              <RegressionPlot data={trainResult.visualization.plot_data} />
                            )}
                          </div>

                          <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header-with-icon">
                              <div className="card-icon"><Activity size={20} /></div>
                              <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Model Comparison</h3>
                            </div>
                            <div className="table-wrapper" style={{ flex: 1 }}>
                              <table>
                                <thead>
                                  <tr>
                                    <th>Algorithm</th>
                                    {Object.keys(trainResult.results[0].metrics).map(m => <th key={m}>{m}</th>)}
                                  </tr>
                                </thead>
                                <tbody>
                                  {trainResult.results.map((res, i) => (
                                    <tr key={i} className={res.model === trainResult.best_model.name ? 'highlight-row' : ''}>
                                      <td style={{ fontWeight: res.model === trainResult.best_model.name ? '700' : 'normal' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          {res.model === trainResult.best_model.name && <Trophy size={14} style={{ color: '#fbbf24' }} />}
                                          {res.model}
                                        </div>
                                      </td>
                                      {Object.values(res.metrics).map((val, j) => (
                                        <td key={j} style={{ color: res.model === trainResult.best_model.name ? 'var(--success-color)' : 'inherit' }}>
                                          {val}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="pipeline-meta" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ opacity: 0.6 }}>Dataset Info</span>
                                <span>{trainResult.dataset_info.train_samples} samples</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ opacity: 0.6 }}>Features</span>
                                <span>{trainResult.dataset_info.feature_count} columns</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.05)', padding: '0.8rem', borderRadius: '8px', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                <Info size={14} style={{ color: 'var(--primary-color)', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ opacity: 0.8 }}>{trainResult.detection_log}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <ExplainabilitySection result={trainResult} />

                         <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setTrainResult(null)} style={{ border: '1px solid var(--border-color)' }}>
                              <Activity size={18} style={{ marginRight: '8px' }} />
                              Re-run Pipeline
                            </button>
                            <button className="btn btn-primary" onClick={handleDownloadModel}>
                              <Download size={18} style={{ marginRight: '8px' }} />
                              Download Model
                            </button>
                            <button className="btn btn-primary" style={{ background: 'var(--success-color)' }}>
                              <Layout size={18} style={{ marginRight: '8px' }} />
                              Deploy Model
                            </button>
                         </div>
                         
                         <PredictionSection result={trainResult} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setFile(null);
                    setPreviewData(null);
                    setPreprocessResult(null);
                    setTrainResult(null);
                    setTargetColumn('');
                  }}
                  style={{ opacity: 0.6 }}
                >
                  Start Over / New Dataset
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
