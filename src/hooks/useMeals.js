import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_PREFS = {
  vegetarian: false, vegan: false, pescatarian: false,
  gluten_free: false, dairy_free: false, nut_free: false,
  halal: false, kosher: false, low_carb: false,
}

export function useMeals(familyId) {
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(false)
  const [prefsLoading, setPrefsLoading] = useState(true)

  // Load prefs from supabase
  useEffect(() => {
    if (!familyId) return
    supabase.from('dietary_prefs').select('*').eq('family_id', familyId).single()
      .then(({ data }) => {
        if (data) setPrefsState({ ...DEFAULT_PREFS, ...data })
        setPrefsLoading(false)
      })
  }, [familyId])

  // Toggle a pref and upsert to supabase
  const togglePref = useCallback(async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefsState(updated)
    await supabase.from('dietary_prefs')
      .upsert({ family_id: familyId, ...updated, updated_at: new Date().toISOString() })
      .catch(console.error)
  }, [prefs, familyId])

  // Call the meals API
  const generateMeals = useCallback(async (groceryItems) => {
    setLoading(true)
    setMeals([])
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groceryItems, dietaryPrefs: prefs, familyId }),
      })
      const data = await res.json()
      if (data.meals) setMeals(data.meals)
      else throw new Error(data.error || 'No meals returned')
    } catch (err) {
      throw err
    } finally {
      setLoading(false)
    }
  }, [prefs, familyId])

  return { prefs, togglePref, meals, setMeals, loading, prefsLoading, generateMeals }
}
