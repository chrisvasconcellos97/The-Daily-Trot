import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSchoolCalendar(familyId) {
  const [closures, setClosures] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('school_closures')
      .select('*')
      .eq('family_id', familyId)
      .order('start_date', { ascending: true })
    if (data) setClosures(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addClosure = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('school_closures')
      .insert({ ...data, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setClosures(prev => [...prev, row].sort((a, b) => a.start_date.localeCompare(b.start_date)))
    return row
  }, [familyId])

  const deleteClosure = useCallback(async (id) => {
    const { error } = await supabase.from('school_closures').delete().eq('id', id)
    if (error) throw error
    setClosures(prev => prev.filter(c => c.id !== id))
  }, [])

  const isClosureDate = useCallback((dateStr) => {
    return closures.some(c => {
      const start = c.start_date
      const end = c.end_date || c.start_date
      return dateStr >= start && dateStr <= end
    })
  }, [closures])

  const getClosuresForDate = useCallback((dateStr) => {
    return closures.filter(c => {
      const start = c.start_date
      const end = c.end_date || c.start_date
      return dateStr >= start && dateStr <= end
    })
  }, [closures])

  return { closures, loading, addClosure, deleteClosure, isClosureDate, getClosuresForDate }
}
