import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'

// Program ID from Anchor.toml – wrapped in try/catch so the app
// still renders even when the program hasn't been deployed yet.
let _programId
try {
  _programId = new PublicKey(
    '3emebPATdE5JTXp7TckzZKbNUhFMka7LdRbeCqpscHc1crpKBZ96Ry9BGbs94fzXRNc5FhVTLQGEsdoPzS2tbDmH'
  )
} catch {
  // Fallback to SystemProgram so the module still loads
  console.warn('Invalid PROGRAM_ID – using placeholder. Deploy your Anchor program and update the ID.')
  _programId = new PublicKey('11111111111111111111111111111111')
}
export const PROGRAM_ID = _programId

export const NETWORK = 'devnet'
export const ENDPOINT = clusterApiUrl(NETWORK)

let connectionInstance = null


export function getConnection() {
  if (!connectionInstance) {
    connectionInstance = new Connection(ENDPOINT, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000
    })
  }
  return connectionInstance
}

export async function getUserAccountPDA(username) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('username'), Buffer.from(username.toLowerCase())],
    PROGRAM_ID
  )
  return pda
}

export async function getGroupAccountPDA(groupId) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('group'), groupId],
    PROGRAM_ID
  )
  return pda
}


export async function getGroupMemberPDA(groupId, memberPubkey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('group:member'), groupId, memberPubkey.toBuffer()],
    PROGRAM_ID
  )
  return pda
}


export async function getGroupCodeLookupPDA(publicCode) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('group:code'), Buffer.from(publicCode.toLowerCase())],
    PROGRAM_ID
  )
  return pda
}

export async function getInviteLinkPDA(groupId, inviteCode) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('group:invite'), groupId, Buffer.from(inviteCode)],
    PROGRAM_ID
  )
  return pda
}


export function shortenAddress(address, chars = 4) {
  if (!address) return ''
  const str = typeof address === 'string' ? address : address.toBase58()
  return `${str.slice(0, chars)}...${str.slice(-chars)}`
}

export async function getBalance(publicKey) {
  const connection = getConnection()
  const balance = await connection.getBalance(publicKey)
  return balance / 1e9
}


export async function requestAirdrop(publicKey, amount = 1) {
  const connection = getConnection()
  const signature = await connection.requestAirdrop(
    publicKey,
    amount * 1e9
  )
  await connection.confirmTransaction(signature, 'confirmed')
  return signature
}
