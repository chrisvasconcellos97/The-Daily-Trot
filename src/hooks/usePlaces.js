import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePlaces(familyId) {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('family_id', familyId)
      .order('name')
    if (data) setPlaces(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addPlace = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('places')
      .insert({ ...data, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setPlaces(prev => [...prev, row].sort((a, b) => a.name.localeCompare(b.name)))
    return row
  }, [familyId])

  const updatePlace = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('places')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPlaces(prev => prev.map(p => p.id === id ? row : p))
    return row
  }, [])

  const deletePlace = useCallback(async (id) => {
    const { error } = await supabase.from('places').delete().eq('id', id)
    if (error) throw error
    setPlaces(prev => prev.filter(p => p.id !== id))
  }, [])

  const toggleFavorite = useCallback(async (id, current) => {
    const { data: row, error } = await supabase
      .from('places')
      .update({ is_favorite: !current })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setPlaces(prev => prev.map(p => p.id === id ? row : p))
    return row
  }, [])

  return { places, addPlace, updatePlace, deletePlace, toggleFavorite, loading }
}
