import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SimpleHeader, { IconBtn } from '../components/SimpleHeader'
import Lillie from '../components/Lillie'
import { useGrocery } from '../hooks/useGrocery'
import { useMeals } from '../hooks/useMeals'
import C from '../colors'

const PREF_CHIPS = [
  { key: 'vegetarian', label: 'VEGETARIAN' },
  { key: 'vegan', label: 'VEGAN' },
  { key: 'pescatarian', label: 'PESCATARIAN' },
  { key: 'gluten_free', label: 'GLUTEN FREE' },
  { key: 'dairy_free', label: 'DAIRY FREE' },
  { key: 'nut_free', label: 'NUT FREE' },
  { key: 'halal', label: 'HALAL' },
  { key: 'kosher', label: 'KOSHER' },
  { key: 'low_carb', label: 'LOW CARB' },
]

const SORTS = [
  { key: 'match', label: 'BEST MATCH' },
  { key: 'quick', label: 'QUICKEST' },
  { key: 'easy', label: 'EASIEST' },
  { key: 'method', label: 'METHOD' },
]

const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 }
const DIFF_COLOR = { easy: '#4A7C59', medium: '#B5986A', hard: '#C0392B' }

function MethodIcon({ method, size = 14 }) {
  const s = { fill: 'none', stroke: C.inkSoft, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (method) {
    case 'stovetop': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <path d="M4 12h16M5 12l1 7h12l1-7"/>
        <path d="M9 8c0-1.5 1-2 1-3.5M13 8c0-1.5 1-2 1-3.5"/>
      </svg>
    )
    case 'oven': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <rect x="4" y="4" width="16" height="16" rx="1.5"/>
        <path d="M4 9h16M7 6.5h4"/>
        <path d="M8 13h8M8 16h8"/>
      </svg>
    )
    case 'slow_cooker': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <path d="M5 10h14v5a4 4 0 01-4 4H9a4 4 0 01-4-4v-5z"/>
        <path d="M4 10h16M8 7h8"/>
        <path d="M9 13h6"/>
      </svg>
    )
    case 'instant_pot': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <rect x="5" y="9" width="14" height="11" rx="2"/>
        <path d="M4 9h16M9 6v3M15 6v3"/>
        <circle cx="12" cy="14" r="2"/>
      </svg>
    )
    case 'grill': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <rect x="4" y="6" width="16" height="3" rx="1"/>
        <path d="M7 9v9M12 9v9M17 9v9M6 12h12M6 15h12"/>
      </svg>
    )
    case 'no_cook': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <path d="M12 3c3 3 4 5 4 8a4 4 0 11-8 0c0-3 1-5 4-8z"/>
      </svg>
    )
    case 'air_fryer': return (
      <svg viewBox="0 0 24 24" width={size} height={size} {...s}>
        <circle cx="12" cy="12" r="8"/>
        <path d="M12 12l4-3M12 12l-4 3M12 12l-1-5M12 12l1 5"/>
        <circle cx="12" cy="12" r="1.5" fill={C.inkSoft}/>
      </svg>
    )
    default: return null
  }
}

function DifficultyBadge({ difficulty }) {
  const d = difficulty || 'easy'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: DIFF_COLOR[d] || DIFF_COLOR.easy }} />
      <span style={{
        fontFamily: C.sans, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: C.inkMuted,
      }}>{d.toUpperCase()}</span>
    </span>
  )
}

function MatchPill({ haveCount, totalCount, score }) {
  const color = score >= 80 ? '#4A7C59' : score >= 50 ? C.gold : C.inkMuted
  return (
    <span style={{
      background: color, color: '#fff',
      fontFamily: C.sans, fontSize: 10, fontWeight: 700,
      padding: '2px 8px', borderRadius: 10, flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      {haveCount}/{totalCount}
      <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5 9-9"/>
      </svg>
    </span>
  )
}

function MealCard({ meal }) {
  const [expanded, setExpanded] = useState(false)
  const have = meal.ingredients_have || []
  const missing = meal.ingredients_missing || []
  const totalCount = have.length + missing.length
  const score = meal.match_score ?? 0

  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '14px 16px', marginBottom: 10,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: C.serif, fontSize: 15, fontWeight: 600, color: C.ink }}>{meal.name}</span>
            <DifficultyBadge difficulty={meal.difficulty} />
            <MethodIcon method={meal.method} />
          </div>
        </div>
        <MatchPill haveCount={have.length} totalCount={totalCount} score={score} />
      </div>

      {/* Second row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 5, fontFamily: C.sans, fontSize: 10, color: C.inkMuted, fontVariantNumeric: 'tabular-nums',
      }}>
        <span>{meal.prep_minutes ?? 0} min prep · {meal.cook_minutes ?? 0} min cook</span>
        <span>Serves {meal.servings ?? 4}</span>
      </div>

      {/* Description */}
      {meal.description && (
        <div style={{ fontFamily: C.serif, fontSize: 12.5, color: C.inkSoft, marginTop: 7, lineHeight: 1.35 }}>
          {meal.description}
        </div>
      )}

      {/* Missing ingredients */}
      {missing.length > 0 && (
        <div style={{ marginTop: 9 }}>
          <span style={{ fontFamily: C.sans, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: C.inkMuted, marginRight: 6 }}>MISSING:</span>
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 5, verticalAlign: 'middle' }}>
            {missing.map((m, i) => (
              <span key={i} style={{
                background: C.bgLight, color: C.inkMuted,
                fontFamily: C.sans, fontSize: 10, padding: '2px 8px', borderRadius: 9,
                border: `1px solid ${C.border}`,
              }}>
                {m.name}{m.optional ? ' ?' : ''}
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0',
          fontFamily: C.sans, fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: '0.04em',
        }}
      >
        {expanded ? 'Hide Recipe ‹' : 'View Recipe ›'}
      </button>

      {/* Expanded section */}
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.inkMuted, marginBottom: 7 }}>INGREDIENTS</div>
          <div style={{ marginBottom: 12 }}>
            {have.map((ing, i) => (
              <div key={`h${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontFamily: C.serif, fontSize: 13, color: C.ink }}>
                <span style={{ color: '#4A7C59', fontWeight: 700 }}>✓</span>
                <span>{ing}</span>
              </div>
            ))}
            {missing.map((m, i) => (
              <div key={`m${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontFamily: C.serif, fontSize: 13, color: C.inkMuted }}>
                <span style={{ color: C.inkMuted }}>○</span>
                <span>{m.name}{m.quantity ? ` — ${m.quantity}` : ''}{m.optional ? ' (optional)' : ''}</span>
              </div>
            ))}
          </div>

          {(meal.steps || []).length > 0 && (
            <>
              <div style={{ fontFamily: C.sans, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: C.inkMuted, marginBottom: 7 }}>STEPS</div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {meal.steps.map((step, i) => (
                  <li key={i} style={{ fontFamily: C.serif, fontSize: 13, color: C.ink, marginBottom: 6, lineHeight: 1.4 }}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function MealsView({ familyId, toast }) {
  const navigate = useNavigate()
  const { items } = useGrocery(familyId)
  const { prefs, togglePref, meals, loading, generateMeals } = useMeals(familyId)
  const [sort, setSort] = useState('match')

  const groceryItems = useMemo(() => items.filter(i => !i.checked), [items])
  const itemCount = groceryItems.length

  const sortedMeals = useMemo(() => {
    const copy = [...meals]
    switch (sort) {
      case 'quick':
        return copy.sort((a, b) =>
          ((a.prep_minutes || 0) + (a.cook_minutes || 0)) - ((b.prep_minutes || 0) + (b.cook_minutes || 0)))
      case 'easy':
        return copy.sort((a, b) => {
          const d = (DIFF_ORDER[a.difficulty] ?? 0) - (DIFF_ORDER[b.difficulty] ?? 0)
          if (d !== 0) return d
          return ((a.prep_minutes || 0) + (a.cook_minutes || 0)) - ((b.prep_minutes || 0) + (b.cook_minutes || 0))
        })
      case 'method':
        return copy.sort((a, b) => {
          const m = (a.method || '').localeCompare(b.method || '')
          if (m !== 0) return m
          return (b.match_score || 0) - (a.match_score || 0)
        })
      case 'match':
      default:
        return copy.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    }
  }, [meals, sort])

  const handleGenerate = async () => {
    if (itemCount === 0) return
    try {
      await generateMeals(groceryItems)
    } catch (err) {
      toast(err.message || 'Could not plan meals', 'error')
    }
  }

  return (
    <div className="view-enter" style={{ paddingBottom: 120 }}>
      <SimpleHeader
        title="MEALS"
        leading={
          <IconBtn onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </IconBtn>
        }
      />

      {/* Dietary restriction chips */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
          {PREF_CHIPS.map(chip => {
            const active = !!prefs[chip.key]
            return (
              <button
                key={chip.key}
                onClick={() => togglePref(chip.key)}
                style={{
                  flexShrink: 0, padding: '5px 13px', borderRadius: 20,
                  border: `1px solid ${active ? C.primary : C.border}`,
                  background: active ? C.primary : C.card,
                  color: active ? C.bgLight : C.primary,
                  fontFamily: C.sans, fontSize: 10, fontWeight: 600,
                  cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                }}
              >{chip.label}</button>
            )
          })}
        </div>
      </div>

      {/* Grocery summary bar */}
      <div style={{ padding: '12px 18px 0' }}>
        <div style={{
          fontFamily: C.sans, fontSize: 11, letterSpacing: '0.04em',
          color: itemCount === 0 ? C.inkMuted : C.inkSoft,
        }}>
          {itemCount === 0
            ? 'No items on your grocery list yet'
            : `Using ${itemCount} item${itemCount === 1 ? '' : 's'} from your grocery list`}
        </div>
      </div>

      {/* Generate button / loading */}
      <div style={{ padding: '14px 18px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '28px 0' }}>
            <Lillie size={72} wagging />
            <div style={{ fontFamily: C.serif, fontSize: 14, color: C.inkSoft, letterSpacing: '0.04em' }}>
              Lillie is planning your meals...
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={itemCount === 0}
            style={{
              width: '100%', padding: '14px', borderRadius: 26,
              background: C.primary, color: C.bgLight, border: 'none',
              fontFamily: C.sans, fontSize: 14, fontWeight: 600, letterSpacing: '0.06em',
              cursor: itemCount === 0 ? 'default' : 'pointer',
              opacity: itemCount === 0 ? 0.5 : 1,
            }}
          >Find Meals</button>
        )}
      </div>

      {/* Sort bar */}
      {!loading && meals.length > 0 && (
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
            {SORTS.map(s => {
              const active = sort === s.key
              return (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  style={{
                    flexShrink: 0, padding: '5px 13px', borderRadius: 20,
                    border: `1px solid ${active ? C.gold : C.border}`,
                    background: active ? C.gold : 'transparent',
                    color: active ? '#fff' : C.inkSoft,
                    fontFamily: C.sans, fontSize: 10, fontWeight: 600,
                    cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}
                >{s.label}</button>
              )
            })}
          </div>
        </div>
      )}

      {/* Meal cards */}
      {!loading && meals.length > 0 && (
        <div style={{ padding: '14px 18px 0' }}>
          {sortedMeals.map((meal, i) => (
            <MealCard key={`${meal.name}-${i}`} meal={meal} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && meals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <svg viewBox="0 0 32 32" width="40" height="40" fill="none" stroke={C.inkMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4v9a3 3 0 003 3v12M9 4v8M12 4v8M12 4v9a3 3 0 01-3 3"/>
            <path d="M22 4c-2 0-3 3-3 7s1 6 3 6v11"/>
          </svg>
          <div style={{ fontFamily: C.serif, fontSize: 14, color: C.inkMuted, lineHeight: 1.4, maxWidth: 260 }}>
            Tap 'Find Meals' to see what you can cook with your groceries.
          </div>
        </div>
      )}
    </div>
  )
}
