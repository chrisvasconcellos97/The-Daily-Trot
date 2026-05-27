import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useLibrary(familyId) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBooks = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('library_books')
      .select('*')
      .eq('family_id', familyId)
      .order('due_date', { ascending: true })
    if (error) setError(error.message)
    else setBooks(data || [])
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  const addBook = async (book) => {
    const { data, error } = await supabase
      .from('library_books')
      .insert({ ...book, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    setBooks(prev =>
      [...prev, data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    )
    return data
  }

  const markReturned = async (id) => {
    const { error } = await supabase
      .from('library_books')
      .update({ returned_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setBooks(prev =>
      prev.map(b => b.id === id ? { ...b, returned_at: new Date().toISOString() } : b)
    )
  }

  const removeBook = async (id) => {
    const { error } = await supabase
      .from('library_books')
      .delete()
      .eq('id', id)
    if (error) throw error
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  return { books, loading, error, addBook, markReturned, removeBook, refetch: fetchBooks }
}
