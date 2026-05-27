import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useHealth(childId) {
  const [visits, setVisits] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!childId) return
    const [{ data: visitData }, { data: vaccineData }] = await Promise.all([
      supabase.from('health_visits').select('*').eq('child_id', childId).order('visit_date', { ascending: false }),
      supabase.from('health_vaccines').select('*').eq('child_id', childId).order('created_at'),
    ])
    if (visitData) setVisits(visitData)
    if (vaccineData) setVaccines(vaccineData)
    setLoading(false)
  }, [childId])

  useEffect(() => { fetch() }, [fetch])

  const addVisit = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('health_visits')
      .insert({ ...data, child_id: childId })
      .select()
      .single()
    if (error) throw error
    setVisits(prev => [row, ...prev])
    return row
  }, [childId])

  const addVaccine = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('health_vaccines')
      .insert({ ...data, child_id: childId })
      .select()
      .single()
    if (error) throw error
    setVaccines(prev => [...prev, row])
    return row
  }, [childId])

  const updateVaccine = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('health_vaccines')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setVaccines(prev => prev.map(v => v.id === id ? row : v))
    return row
  }, [])

  const deleteVaccine = useCallback(async (id) => {
    const { error } = await supabase.from('health_vaccines').delete().eq('id', id)
    if (error) throw error
    setVaccines(prev => prev.filter(v => v.id !== id))
  }, [])

  return { visits, vaccines, loading, addVisit, addVaccine, updateVaccine, deleteVaccine }
}
