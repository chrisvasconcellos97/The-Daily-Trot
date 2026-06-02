import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SimpleHeader, { IconBtn } from '../components/SimpleHeader'
import { useCleanScore } from '../hooks/useCleanScore'
import C from '../colors'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser'

function ScoreRing({ score }) {
  const size = 120
  const r = 46
  const circ = 2 * Math.PI * r
  const pct = score != null ? Math.max(0, Math.min(10, score)) / 10 : 0
  const dash = pct * circ
  const color = score == null ? C.border : score >= 7 ? '#4A7C59' : score >= 4 ? '#B5986A' : '#C0392B'
  const label = score == null ? '—' : score.toFixed(1)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={8}/>
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2 + 2} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: C.serif, fontSize: 28, fontWeight: 700, fill: color }}>
        {label}
      </text>
      <text x={size/2} y={size/2 + 20} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: C.sans, fontSize: 9, letterSpacing: '0.1em', fill: C.inkMuted }}>
        /10
      </text>
    </svg>
  )
}

function ScoreBadge({ score }) {
  if (score == null) return null
  const color = score >= 7 ? '#4A7C59' : score >= 4 ? '#B5986A' : '#C0392B'
  return (
    <span style={{
      background: color, color: '#fff',
      fontFamily: C.sans, fontSize: 11, fontWeight: 700,
      padding: '2px 7px', borderRadius: 10,
      letterSpacing: '0.05em',
    }}>{score.toFixed(1)}</span>
  )
}

function FlagBadge({ tier }) {
  if (tier === 'avoid') return (
    <span style={{ background: '#C0392B', color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, letterSpacing: '0.08em' }}>AVOID</span>
  )
  if (tier === 'caution') return (
    <span style={{ background: '#B5986A', color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, letterSpacing: '0.08em' }}>CAUTION</span>
  )
  return (
    <span style={{ background: '#4A7C59', color: '#fff', fontFamily: C.sans, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 6, letterSpacing: '0.08em' }}>CLEAN</span>
  )
}

function BarcodeIcon({ style }) {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" style={style}>
      <rect x="2" y="4" width="2" height="16"/><rect x="5" y="4" width="1" height="16"/><rect x="7" y="4" width="2" height="16"/>
      <rect x="10" y="4" width="1" height="16"/><rect x="12" y="4" width="2" height="16"/><rect x="15" y="4" width="1" height="16"/>
      <rect x="17" y="4" width="2" height="16"/><rect x="20" y="4" width="2" height="16"/>
    </svg>
  )
}

export default function ScannerView({ familyId, toast }) {
  const navigate = useNavigate()
  const { scanning, result, error, scanBarcode, scanIngredients, confirmIngredients, setResult } = useCleanScore(familyId)

  const [manualBarcode, setManualBarcode] = useState('')
  const [ingStage, setIngStage] = useState(null) // null | 'confirm' | 'scanning'
  const [extractedIngredients, setExtractedIngredients] = useState([])
  const [ingEditText, setIngEditText] = useState('')
  const [ingScanning, setIngScanning] = useState(false)
  const [photoScanning, setPhotoScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const fileRef = useRef(null)
  const ingFileRef = useRef(null)
  const videoRef = useRef(null)
  const cameraReaderRef = useRef(null)

  // Stop camera stream on unmount or when cameraActive goes false
  useEffect(() => {
    if (!cameraActive) {
      cameraReaderRef.current?.reset()
      cameraReaderRef.current = null
    }
  }, [cameraActive])
  useEffect(() => () => { cameraReaderRef.current?.reset() }, [])

  const startCamera = useCallback(async () => {
    setCameraActive(true)
  }, [])

  // Wire up ZXing continuous decode once video element is mounted
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return
    const reader = new BrowserMultiFormatReader()
    cameraReaderRef.current = reader
    reader.decodeFromConstraints(
      { video: { facingMode: 'environment' } },
      videoRef.current,
      (result, err) => {
        if (result) {
          const bc = result.getText()
          reader.reset()
          setCameraActive(false)
          scanBarcode(bc)
        }
        // NotFoundException fires on every frame with no barcode — ignore it
      }
    ).catch(() => {
      setCameraActive(false)
      toast('Camera access denied — enter barcode manually.', 'error')
    })
  }, [cameraActive, scanBarcode, toast])

  const handleManualScan = useCallback(async () => {
    const bc = manualBarcode.trim()
    if (!bc) return
    await scanBarcode(bc)
    setManualBarcode('')
  }, [manualBarcode, scanBarcode])

  const handlePhotoCapture = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoScanning(true)
    try {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.src = url
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })
      const reader = new BrowserMultiFormatReader()
      const result = await reader.decodeFromImageElement(img)
      URL.revokeObjectURL(url)
      const bc = result.getText()
      await scanBarcode(bc)
    } catch {
      URL.revokeObjectURL?.()
      toast("Couldn't read the barcode — try the live camera or enter it manually.", 'error')
    } finally {
      setPhotoScanning(false)
    }
    e.target.value = ''
  }, [scanBarcode, toast])

  const handleIngPhotoCapture = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIngScanning(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result
        const base64 = dataUrl.split(',')[1]
        const mimeType = file.type
        try {
          const data = await scanIngredients(base64, mimeType, result?.barcode || manualBarcode, result?.product_name || '')
          if (data?.ingredients?.length) {
            setExtractedIngredients(data.ingredients)
            setIngEditText(data.ingredients.join('\n'))
            setIngStage('confirm')
          } else {
            toast('Could not extract ingredients — try a clearer photo.', 'error')
          }
        } catch {
          toast('Ingredient scan failed.', 'error')
        } finally {
          setIngScanning(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setIngScanning(false)
      toast('Could not read photo.', 'error')
    }
    e.target.value = ''
  }, [scanIngredients, result, manualBarcode, toast])

  const handleConfirmIngredients = useCallback(async () => {
    const lines = ingEditText.split('\n').map(l => l.trim()).filter(Boolean)
    const barcode = result?.barcode || manualBarcode || 'unknown'
    try {
      await confirmIngredients(barcode, lines)
      setIngStage(null)
      toast('Ingredients saved and scored!', 'success')
    } catch {
      toast('Could not save ingredients.', 'error')
    }
  }, [ingEditText, result, manualBarcode, confirmIngredients, toast])

  const handleReset = useCallback(() => {
    setResult(null)
    setIngStage(null)
    setExtractedIngredients([])
    setIngEditText('')
    setManualBarcode('')
    setCameraActive(false)
  }, [setResult])

  const scoreLabel = result?.score == null ? null : result.score >= 7 ? 'Great choice' : result.score >= 4 ? 'Use with caution' : 'Consider an alternative'
  const scoreColor = result?.score == null ? C.inkMuted : result.score >= 7 ? '#4A7C59' : result.score >= 4 ? '#B5986A' : '#C0392B'

  return (
    <div className="view-enter" style={{ paddingBottom: 120 }}>
      <SimpleHeader
        title="CLEAN LILLIE"
        leading={
          <IconBtn onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
        trailing={
          <IconBtn>
            <BarcodeIcon/>
          </IconBtn>
        }
      />

      <div style={{ padding: '20px 18px 0' }}>

        {/* Watch tier banner */}
        {result && result.watch_tier === 'recalled' && (
          <div style={{
            background: '#C0392B', color: '#fff', borderRadius: 10, padding: '10px 14px',
            fontFamily: C.sans, fontSize: 12, fontWeight: 600, marginBottom: 12, lineHeight: 1.4,
          }}>
            RECALL ALERT — {result.watch_reason || 'This product or brand has an active recall. Do not use.'}
          </div>
        )}
        {result && result.watch_tier === 'watch' && (
          <div style={{
            background: '#B5986A', color: '#fff', borderRadius: 10, padding: '10px 14px',
            fontFamily: C.sans, fontSize: 12, fontWeight: 600, marginBottom: 12, lineHeight: 1.4,
          }}>
            WATCH — {result.watch_reason || 'This product or brand has a safety notice. Review before use.'}
          </div>
        )}

        {/* Live camera viewfinder — keep mounted even during scanning so video doesn't flash */}
        <div style={{ display: cameraActive ? 'block' : 'none', position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 14, background: '#000' }}>
          <video
            ref={videoRef}
            style={{ width: '100%', display: 'block', maxHeight: 340, objectFit: 'cover' }}
            muted
            autoPlay
            playsInline
          />
          {/* Scan frame overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{ width: 220, height: 110, position: 'relative' }}>
              {/* Four corners */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTop: `3px solid ${C.gold}`, borderLeft: `3px solid ${C.gold}` }}/>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTop: `3px solid ${C.gold}`, borderRight: `3px solid ${C.gold}` }}/>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottom: `3px solid ${C.gold}`, borderLeft: `3px solid ${C.gold}` }}/>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottom: `3px solid ${C.gold}`, borderRight: `3px solid ${C.gold}` }}/>
              {/* Scan line */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5, background: C.gold, opacity: 0.8, transform: 'translateY(-50%)' }}/>
            </div>
          </div>
          <button
            onClick={() => setCameraActive(false)}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 20,
              padding: '5px 14px', fontFamily: C.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >Cancel</button>
        </div>

        {/* Idle / scan area */}
        {!result && !cameraActive && (
          <>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '28px 20px', textAlign: 'center', marginBottom: 14,
            }}>
              <div style={{ marginBottom: 12, opacity: 0.5 }}>
                <svg viewBox="0 0 64 64" width="64" height="64" style={{ display: 'inline-block' }}
                  fill="none" stroke={C.primary} strokeWidth="2">
                  <rect x="4" y="12" width="6" height="40"/><rect x="12" y="12" width="3" height="40"/>
                  <rect x="17" y="12" width="6" height="40"/><rect x="25" y="12" width="3" height="40"/>
                  <rect x="30" y="12" width="6" height="40"/><rect x="38" y="12" width="3" height="40"/>
                  <rect x="43" y="12" width="6" height="40"/><rect x="51" y="12" width="6" height="40"/>
                  <line x1="0" y1="8" x2="16" y2="8" strokeWidth="2.5"/>
                  <line x1="0" y1="8" x2="0" y2="24" strokeWidth="2.5"/>
                  <line x1="48" y1="8" x2="64" y2="8" strokeWidth="2.5"/>
                  <line x1="64" y1="8" x2="64" y2="24" strokeWidth="2.5"/>
                  <line x1="0" y1="56" x2="16" y2="56" strokeWidth="2.5"/>
                  <line x1="0" y1="56" x2="0" y2="40" strokeWidth="2.5"/>
                  <line x1="48" y1="56" x2="64" y2="56" strokeWidth="2.5"/>
                  <line x1="64" y1="56" x2="64" y2="40" strokeWidth="2.5"/>
                </svg>
              </div>
              <div style={{ fontFamily: C.serif, fontSize: 16, color: C.ink, marginBottom: 6 }}>
                Scan a product barcode
              </div>
              <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkMuted, marginBottom: 18 }}>
                Check ingredients and recalls before you buy
              </div>

              {/* Live camera button */}
              <button
                onClick={startCamera}
                style={{
                  width: '100%', padding: '13px', borderRadius: 23,
                  background: C.primary, color: C.bgLight, border: 'none',
                  fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  letterSpacing: '0.06em', marginBottom: 10,
                }}
              >
                Scan with Camera
              </button>

              {/* Photo capture fallback (iOS-friendly) */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handlePhotoCapture}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={photoScanning}
                style={{
                  width: '100%', padding: '12px', borderRadius: 23,
                  background: 'transparent', color: C.primary, border: `1px solid ${C.primary}`,
                  fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  letterSpacing: '0.06em', opacity: photoScanning ? 0.5 : 1,
                }}
              >
                {photoScanning ? 'Reading barcode...' : 'Take a Photo Instead'}
              </button>
            </div>

            {/* Manual entry */}
            <div style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: '14px 16px',
            }}>
              <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600, marginBottom: 8 }}>
                ENTER BARCODE MANUALLY
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={manualBarcode}
                  onChange={e => setManualBarcode(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleManualScan() }}
                  placeholder="e.g. 012345678901"
                  style={{
                    flex: 1, border: `1px solid ${C.border}`, background: C.bgLight, borderRadius: 8,
                    fontFamily: C.serif, fontSize: 15, color: C.ink, padding: '8px 12px', outline: 'none',
                  }}
                />
                <button
                  onClick={handleManualScan}
                  disabled={!manualBarcode.trim()}
                  style={{
                    background: C.gold, color: '#fff', border: 'none', borderRadius: 8,
                    padding: '8px 16px', fontFamily: C.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    opacity: manualBarcode.trim() ? 1 : 0.4,
                  }}
                >Look Up</button>
              </div>
            </div>
          </>
        )}

        {/* Loading */}
        {scanning && (
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '48px 20px', textAlign: 'center',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `3px solid ${C.border}`,
              borderTopColor: C.primary,
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 14px',
            }}/>
            <div style={{ fontFamily: C.serif, fontSize: 15, color: C.inkSoft }}>
              Lillie is looking this up...
            </div>
          </div>
        )}

        {/* Result */}
        {result && !scanning && (
          <>
            {result.found ? (
              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                overflow: 'hidden',
              }}>
                {/* Score header */}
                <div style={{
                  padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 16,
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <ScoreRing score={result.score}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: C.serif, fontSize: 17, color: C.ink, fontWeight: 600, lineHeight: 1.3 }}>
                      {result.product_name || 'Unknown Product'}
                    </div>
                    {result.brand && (
                      <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 3 }}>
                        {result.brand}
                      </div>
                    )}
                    {result.category && (
                      <div style={{
                        display: 'inline-block', marginTop: 6,
                        background: C.bgLight, border: `1px solid ${C.border}`,
                        borderRadius: 6, padding: '2px 8px',
                        fontFamily: C.sans, fontSize: 10, color: C.inkSoft, letterSpacing: '0.06em',
                      }}>
                        {result.category.toUpperCase()}
                      </div>
                    )}
                    {result.score != null && (
                      <div style={{ fontFamily: C.sans, fontSize: 12, color: scoreColor, marginTop: 6, fontWeight: 600 }}>
                        {scoreLabel}
                      </div>
                    )}
                  </div>
                </div>

                {/* Breakdown */}
                {result.breakdown && (
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600, marginBottom: 6 }}>
                      SCORE BREAKDOWN
                    </div>
                    <div style={{ fontFamily: C.serif, fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
                      {result.breakdown}
                    </div>
                  </div>
                )}

                {/* Flags */}
                {result.flags && result.flags.length > 0 && (
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600, marginBottom: 8 }}>
                      FLAGGED INGREDIENTS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {result.flags.filter(f => f.tier !== 'safe').map((flag, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8,
                          background: C.bgLight, borderRadius: 8, padding: '8px 10px',
                        }}>
                          <FlagBadge tier={flag.tier}/>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: C.serif, fontSize: 13, color: C.ink, fontWeight: 600 }}>{flag.ingredient}</div>
                            <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginTop: 2 }}>{flag.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source + approve */}
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: C.sans, fontSize: 10, color: C.inkMuted }}>
                    via {result.source?.replace(/_/g, ' ')}
                  </div>
                  {result.score != null && result.score >= 6 && (
                    <button style={{
                      background: C.primary, color: C.bgLight, border: 'none', borderRadius: 8,
                      padding: '6px 14px', fontFamily: C.sans, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>
                      Approve for Family
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Not found — needs ingredient scan */
              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '24px 20px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: C.serif, fontSize: 15, color: C.ink, marginBottom: 8 }}>
                  Product not found in database
                </div>
                <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkMuted, marginBottom: 20, lineHeight: 1.5 }}>
                  We don't have this product yet. Scan the ingredient label to score it and help other families.
                </div>
                <input
                  ref={ingFileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleIngPhotoCapture}
                />
                <button
                  onClick={() => ingFileRef.current?.click()}
                  disabled={ingScanning}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 23,
                    background: C.primary, color: C.bgLight, border: 'none',
                    fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    letterSpacing: '0.06em', marginBottom: 8,
                  }}
                >
                  {ingScanning ? 'Scanning...' : 'Scan Ingredient Label'}
                </button>
              </div>
            )}

            {/* Ingredient scan flow when product found but no ingredients */}
            {result.found && result.needs_ingredient_scan && ingStage !== 'confirm' && (
              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '16px 20px', marginTop: 12, textAlign: 'center',
              }}>
                <div style={{ fontFamily: C.sans, fontSize: 12, color: C.inkMuted, marginBottom: 14, lineHeight: 1.5 }}>
                  We found this product but don't have ingredient data yet. Scan the ingredient label to get a score.
                </div>
                <input
                  ref={ingFileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleIngPhotoCapture}
                />
                <button
                  onClick={() => ingFileRef.current?.click()}
                  disabled={ingScanning}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 23,
                    background: C.gold, color: '#fff', border: 'none',
                    fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    letterSpacing: '0.06em',
                  }}
                >
                  {ingScanning ? 'Scanning...' : 'Scan Ingredient Label'}
                </button>
              </div>
            )}

            {/* Ingredient confirm stage */}
            {ingStage === 'confirm' && (
              <div style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '16px 20px', marginTop: 12,
              }}>
                <div style={{ fontFamily: C.sans, fontSize: 10, letterSpacing: '0.14em', color: C.inkMuted, fontWeight: 600, marginBottom: 8 }}>
                  CONFIRM INGREDIENTS ({extractedIngredients.length} found)
                </div>
                <div style={{ fontFamily: C.sans, fontSize: 11, color: C.inkMuted, marginBottom: 10 }}>
                  Review and edit if needed, then confirm to score.
                </div>
                <textarea
                  value={ingEditText}
                  onChange={e => setIngEditText(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%', border: `1px solid ${C.border}`, background: C.bgLight,
                    borderRadius: 8, fontFamily: C.serif, fontSize: 13, color: C.ink,
                    padding: '10px 12px', outline: 'none', resize: 'vertical',
                    boxSizing: 'border-box', lineHeight: 1.6,
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button
                    onClick={() => setIngStage(null)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 23,
                      background: 'transparent', color: C.inkSoft, border: `1px solid ${C.border}`,
                      fontFamily: C.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >Cancel</button>
                  <button
                    onClick={handleConfirmIngredients}
                    style={{
                      flex: 2, padding: '10px', borderRadius: 23,
                      background: C.primary, color: C.bgLight, border: 'none',
                      fontFamily: C.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >Confirm & Score</button>
                </div>
              </div>
            )}

            {/* Scan again */}
            <button
              onClick={handleReset}
              style={{
                width: '100%', padding: '13px', borderRadius: 23, marginTop: 14,
                background: 'transparent', color: C.primary, border: `1px solid ${C.primary}`,
                fontFamily: C.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                letterSpacing: '0.06em',
              }}
            >Scan Another Product</button>
          </>
        )}

        {/* Error */}
        {error && !scanning && (
          <div style={{
            background: C.errorFaint, border: `1px solid ${C.error}`, borderRadius: 10,
            padding: '14px 16px', marginTop: 12,
          }}>
            <div style={{ fontFamily: C.sans, fontSize: 12, color: C.error, fontWeight: 600, marginBottom: 4 }}>
              Scan failed
            </div>
            <div style={{ fontFamily: C.serif, fontSize: 13, color: C.ink }}>{error}</div>
            <button
              onClick={handleReset}
              style={{
                marginTop: 10, background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: C.sans, fontSize: 11, color: C.primary, fontWeight: 600, padding: 0,
              }}
            >Try again</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
