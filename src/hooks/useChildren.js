import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useChildren(familyId) {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at')
    if (data) setChildren(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addChild = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('children')
      .insert({ ...data, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setChildren(prev => [...prev, row])
    return row
  }, [familyId])

  const updateChild = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('children')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setChildren(prev => prev.map(c => c.id === id ? row : c))
    return row
  }, [])

  const deleteChild = useCallback(async (id) => {
    const { error } = await supabase.from('children').delete().eq('id', id)
    if (error) throw error
    setChildren(prev => prev.filter(c => c.id !== id))
  }, [])

  return { children, addChild, updateChild, deleteChild, loading }
}
