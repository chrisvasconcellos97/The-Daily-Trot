import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useGrocery(familyId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data } = await supabase
      .from('grocery_items')
      .select('*')
      .eq('family_id', familyId)
      .order('checked', { ascending: true })
      .order('created_at', { ascending: true })
    if (data) setItems(data)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addItem = useCallback(async ({ name, category }) => {
    const { data: row, error } = await supabase
      .from('grocery_items')
      .insert({ name, category, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setItems(prev => [...prev, row])
    return row
  }, [familyId])

  const toggleItem = useCallback(async (id, checked) => {
    const { data: row, error } = await supabase
      .from('grocery_items')
      .update({ checked })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setItems(prev => prev.map(i => i.id === id ? row : i))
  }, [])

  const deleteItem = useCallback(async (id) => {
    const { error } = await supabase.from('grocery_items').delete().eq('id', id)
    if (error) throw error
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearChecked = useCallback(async () => {
    const ids = items.filter(i => i.checked).map(i => i.id)
    if (!ids.length) return
    await supabase.from('grocery_items').delete().in('id', ids)
    setItems(prev => prev.filter(i => !i.checked))
  }, [items])

  return { items, loading, addItem, toggleItem, deleteItem, clearChecked }
}
