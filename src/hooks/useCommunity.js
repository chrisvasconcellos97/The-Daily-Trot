import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function randomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function useCommunity(familyId) {
  const [groups, setGroups] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchGroups = useCallback(async () => {
    if (!familyId) return
    const { data: members } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('family_id', familyId)

    if (!members || members.length === 0) {
      setGroups([])
      setLoading(false)
      return
    }

    const groupIds = members.map(m => m.group_id)
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)

    setGroups(groupData || [])
    setLoading(false)
  }, [familyId])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const fetchPosts = useCallback(async (groupId) => {
    const { data } = await supabase
      .from('group_posts')
      .select('*, post_joins(count)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    return data || []
  }, [])

  const createGroup = useCallback(async (name) => {
    const invite_code = randomCode()
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name, invite_code, created_by_family_id: familyId })
      .select()
      .single()
    if (error) throw error

    await supabase
      .from('group_members')
      .insert({ group_id: group.id, family_id: familyId })

    setGroups(prev => [...prev, group])
    return group
  }, [familyId])

  const joinGroup = useCallback(async (inviteCode) => {
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single()
    if (error || !group) throw new Error('Group not found')

    const { error: joinError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, family_id: familyId })
    if (joinError) throw joinError

    setGroups(prev => [...prev, group])
    return group
  }, [familyId])

  const createPost = useCallback(async (groupId, data) => {
    const { data: row, error } = await supabase
      .from('group_posts')
      .insert({ ...data, group_id: groupId, family_id: familyId })
      .select()
      .single()
    if (error) throw error
    return row
  }, [familyId])

  const joinPost = useCallback(async (postId) => {
    const { error } = await supabase
      .from('post_joins')
      .insert({ post_id: postId, family_id: familyId })
    if (error) throw error
    const { count } = await supabase
      .from('post_joins')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    return count || 0
  }, [familyId])

  const leavePost = useCallback(async (postId) => {
    const { error } = await supabase
      .from('post_joins')
      .delete()
      .eq('post_id', postId)
      .eq('family_id', familyId)
    if (error) throw error
  }, [familyId])

  return { groups, posts, loading, createGroup, joinGroup, createPost, joinPost, leavePost, fetchPosts }
}
