import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCleanScore(familyId) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [approvedSuggestions, setApprovedSuggestions] = useState([])

  const scanBarcode = useCallback(async (barcode) => {
    setScanning(true)
    setError(null)
    setResult(null)
    try {
      const r = await fetch('/api/scan-product', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ barcode, familyId }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Scan failed')
      setResult(data)
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setScanning(false)
    }
  }, [familyId])

  const scanIngredients = useCallback(async (image, mimeType, barcode, product_name) => {
    const r = await fetch('/api/scan-ingredients', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ image, mimeType, barcode, product_name }),
    })
    if (!r.ok) throw new Error('Ingredient scan failed')
    return r.json()
  }, [])

  const confirmIngredients = useCallback(async (barcode, confirmedIngredients) => {
    const r = await fetch('/api/scan-product', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ barcode, familyId, confirmedIngredients }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error)
    setResult(data)
    return data
  }, [familyId])

  const fetchSuggestions = useCallback(async (query) => {
    if (!familyId || !query || query.length < 2) { setApprovedSuggestions([]); return }
    const { data } = await supabase
      .from('approved_products')
      .select('barcode,product_name,brand,score')
      .eq('family_id', familyId)
      .ilike('product_name', `%${query}%`)
      .order('score', { ascending: false })
      .limit(4)
    setApprovedSuggestions(data || [])
  }, [familyId])

  const approveProduct = useCallback(async (productData) => {
    if (!familyId) return
    await supabase.from('approved_products').upsert({
      family_id: familyId,
      barcode: productData.barcode,
      product_name: productData.product_name,
      brand: productData.brand,
      category: productData.category,
      score: productData.score,
    }, { onConflict: 'family_id,barcode' })
  }, [familyId])

  return { scanning, result, error, approvedSuggestions, scanBarcode, scanIngredients, confirmIngredients, fetchSuggestions, approveProduct, setResult }
}
