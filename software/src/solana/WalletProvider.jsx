import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Keypair } from '@solana/web3.js'
import { getConnection, getBalance, shortenAddress, NETWORK } from './connection'

const WalletContext = createContext(null)

const WALLET_STORAGE_KEY = 'suraxit_wallet'

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY)
      if (stored) {
        const secretKey = new Uint8Array(JSON.parse(stored))
        const keypair = Keypair.fromSecretKey(secretKey)
        setWallet(keypair)
      }
    } catch (err) {
      console.warn('Failed to restore wallet:', err)
      localStorage.removeItem(WALLET_STORAGE_KEY)
    }
  }, [])

  // Fetch balance when wallet changes
  useEffect(() => {
    if (!wallet) {
      setBalance(null)
      return
    }

    let cancelled = false
    const fetchBalance = async () => {
      try {
        const bal = await getBalance(wallet.publicKey)
        if (!cancelled) setBalance(bal)
      } catch {
        if (!cancelled) setBalance(0)
      }
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 15000) // Refresh every 15s
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [wallet])

  /**
   * Generate a new keypair wallet (devnet)
   */
  const createWallet = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const keypair = Keypair.generate()
      localStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify(Array.from(keypair.secretKey))
      )
      setWallet(keypair)

      // Try to get an airdrop for devnet testing
      try {
        const connection = getConnection()
        const sig = await connection.requestAirdrop(keypair.publicKey, 2e9)
        await connection.confirmTransaction(sig, 'confirmed')
        const bal = await getBalance(keypair.publicKey)
        setBalance(bal)
      } catch {
        console.warn('Airdrop failed - devnet may be rate-limited')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setConnecting(false)
    }
  }, [])

  /**
   * Import wallet from secret key (Uint8Array or JSON array)
   */
  const importWallet = useCallback(async (secretKeyInput) => {
    setConnecting(true)
    setError(null)
    try {
      let secretKey
      if (typeof secretKeyInput === 'string') {
        secretKey = new Uint8Array(JSON.parse(secretKeyInput))
      } else {
        secretKey = new Uint8Array(secretKeyInput)
      }
      const keypair = Keypair.fromSecretKey(secretKey)
      localStorage.setItem(
        WALLET_STORAGE_KEY,
        JSON.stringify(Array.from(keypair.secretKey))
      )
      setWallet(keypair)
    } catch (err) {
      setError('Invalid secret key format')
    } finally {
      setConnecting(false)
    }
  }, [])

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    localStorage.removeItem(WALLET_STORAGE_KEY)
    setWallet(null)
    setBalance(null)
    setError(null)
  }, [])

  /**
   * Refresh balance manually
   */
  const refreshBalance = useCallback(async () => {
    if (!wallet) return
    try {
      const bal = await getBalance(wallet.publicKey)
      setBalance(bal)
    } catch {
      // silent
    }
  }, [wallet])

  const value = useMemo(
    () => ({
      wallet,
      publicKey: wallet?.publicKey ?? null,
      balance,
      connecting,
      connected: !!wallet,
      error,
      network: NETWORK,
      shortenedAddress: wallet ? shortenAddress(wallet.publicKey) : null,
      createWallet,
      importWallet,
      disconnect,
      refreshBalance
    }),
    [wallet, balance, connecting, error, createWallet, importWallet, disconnect, refreshBalance]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

/**
 * Hook to access wallet context
 */
export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return ctx
}

export default WalletProvider
