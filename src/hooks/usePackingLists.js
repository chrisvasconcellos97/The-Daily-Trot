import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function usePackingLists(familyId) {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!familyId) return
    const { data: listsData } = await supabase
      .from('packing_lists')
      .select('*')
      .eq('family_id', familyId)

    if (!listsData) { setLoading(false); return }

    const listsWithItems = await Promise.all(listsData.map(async (list) => {
      const { data: items } = await supabase
        .from('packing_items')
        .select('*')
        .eq('list_id', list.id)
        .order('sort_order')
      return { ...list, items: items || [] }
    }))

    setLists(listsWithItems)
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetch() }, [fetch])

  const addList = useCallback(async (data) => {
    const { data: row, error } = await supabase
      .from('packing_lists')
      .insert({ ...data, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    const newList = { ...row, items: [] }
    setLists(prev => [...prev, newList])
    return newList
  }, [familyId])

  const deleteList = useCallback(async (id) => {
    const { error } = await supabase.from('packing_lists').delete().eq('id', id)
    if (error) throw error
    setLists(prev => prev.filter(l => l.id !== id))
  }, [])

  const addItem = useCallback(async (listId, label) => {
    const list = lists.find(l => l.id === listId)
    const sortOrder = list ? list.items.length : 0
    const { data: row, error } = await supabase
      .from('packing_items')
      .insert({ list_id: listId, label, is_checked: false, sort_order: sortOrder })
      .select()
      .single()
    if (error) throw error
    setLists(prev => prev.map(l => l.id === listId
      ? { ...l, items: [...l.items, row] }
      : l
    ))
    return row
  }, [lists])

  const toggleItem = useCallback(async (listId, itemId, current) => {
    const { data: row, error } = await supabase
      .from('packing_items')
      .update({ is_checked: !current })
      .eq('id', itemId)
      .select()
      .single()
    if (error) throw error
    setLists(prev => prev.map(l => l.id === listId
      ? { ...l, items: l.items.map(i => i.id === itemId ? row : i) }
      : l
    ))
  }, [])

  const deleteItem = useCallback(async (listId, itemId) => {
    const { error } = await supabase.from('packing_items').delete().eq('id', itemId)
    if (error) throw error
    setLists(prev => prev.map(l => l.id === listId
      ? { ...l, items: l.items.filter(i => i.id !== itemId) }
      : l
    ))
  }, [])

  return { lists, addList, deleteList, addItem, toggleItem, deleteItem, loading }
}
