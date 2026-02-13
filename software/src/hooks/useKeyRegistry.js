import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '../solana/WalletProvider'
import { fetchMyAccount, registerUsername, lookupUsername, fetchMyGroups } from '../solana/keyRegistry'

export function useKeyRegistry() {
  const { wallet, connected } = useWallet()
  const [account, setAccount] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!connected || !wallet) {
      setAccount(null)
      setGroups([])
      return
    }

    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const [acc, grps] = await Promise.all([
          fetchMyAccount(wallet),
          fetchMyGroups(wallet)
        ])
        if (!cancelled) {
          setAccount(acc)
          setGroups(grps)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [wallet, connected])

  const register = useCallback(async (username) => {
    if (!wallet) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    try {
      const result = await registerUsername(wallet, username)
      const acc = await fetchMyAccount(wallet)
      setAccount(acc)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [wallet])

  const lookup = useCallback(async (username) => {
    setError(null)
    try {
      return await lookupUsername(username)
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const [acc, grps] = await Promise.all([
        fetchMyAccount(wallet),
        fetchMyGroups(wallet)
      ])
      setAccount(acc)
      setGroups(grps)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [wallet])

  return {
    account,
    groups,
    loading,
    error,
    registered: !!account,
    username: account?.username ?? null,
    register,
    lookup,
    refresh
  }
}

export default useKeyRegistry
