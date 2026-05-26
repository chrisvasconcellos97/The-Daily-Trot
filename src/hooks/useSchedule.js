import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSchedule(familyId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('family_id', familyId)
      .order('date')
      .order('start_time')
    if (data) setEvents(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addEvent = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('schedule_events')
      .insert({ ...data, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setEvents(prev => [...prev, row].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return (a.start_time || '').localeCompare(b.start_time || '')
    }))
    return row
  }, [familyId])

  const updateEvent = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('schedule_events')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setEvents(prev => prev.map(e => e.id === id ? row : e))
    return row
  }, [])

  const deleteEvent = useCallback(async (id) => {
    const { error } = await supabase.from('schedule_events').delete().eq('id', id)
    if (error) throw error
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const eventsForDate = useCallback((dateStr) => {
    return events.filter(e => e.date === dateStr)
  }, [events])

  return { events, addEvent, updateEvent, deleteEvent, eventsForDate, loading }
}
