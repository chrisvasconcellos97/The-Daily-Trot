import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useFamily(userId) {
  const [familyId, setFamilyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    async function init() {
      try {
        setLoading(true)
        // Check if user already belongs to a family
        const { data: member, error: memberError } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', userId)
          .single()

        if (member) {
          setFamilyId(member.family_id)
          return
        }

        if (memberError && memberError.code !== 'PGRST116') {
          throw memberError
        }

        // No family found — create one
        const { data: userSession } = await supabase.auth.getUser()
        const email = userSession?.user?.email || 'My Family'
        const familyName = email.split('@')[0]

        // Generate ID client-side to avoid RLS chicken-and-egg:
        // INSERT into families succeeds, but the .select() after it would be
        // blocked because the SELECT policy checks family_members which doesn't
        // exist yet.
        const newFamilyId = crypto.randomUUID()

        const { error: familyError } = await supabase
          .from('families')
          .insert({ id: newFamilyId, name: familyName })

        if (familyError) throw familyError

        const { error: memberInsertError } = await supabase
          .from('family_members')
          .insert({
            family_id: newFamilyId,
            user_id: userId,
            display_name: familyName,
            role: 'admin'
          })

        if (memberInsertError) throw memberInsertError

        setFamilyId(newFamilyId)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [userId])

  return { familyId, loading, error }
}
