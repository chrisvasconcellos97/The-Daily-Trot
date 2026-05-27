import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useEvents(familyId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('family_events')
      .select('*')
      .eq('family_id', familyId)
      .gte('event_date', today)
      .order('event_date', { ascending: true })
    if (data) setEvents(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addEvent = useCallback(async (eventData) => {
    const { data: row, error } = await supabase
      .from('family_events')
      .insert({ ...eventData, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setEvents(prev => [...prev, row].sort((a, b) => a.event_date.localeCompare(b.event_date)))
    return row
  }, [familyId])

  const deleteEvent = useCallback(async (id) => {
    const { error } = await supabase.from('family_events').delete().eq('id', id)
    if (error) throw error
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  return { events, loading, addEvent, deleteEvent }
}
