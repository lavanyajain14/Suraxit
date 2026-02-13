import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor'
import { getConnection, PROGRAM_ID, getUserAccountPDA, getGroupAccountPDA, getGroupMemberPDA } from './connection'
import idl from './idl/key_registry.json'


function getProgram(wallet) {
  const connection = getConnection()
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(wallet)
        return tx
      },
      signAllTransactions: async (txs) => {
        txs.forEach((tx) => tx.partialSign(wallet))
        return txs
      }
    },
    { commitment: 'confirmed' }
  )
  return new Program(idl, PROGRAM_ID, provider)
}


export async function registerUsername(wallet, username, encryptionKey = null) {
  const program = getProgram(wallet)
  const userAccountPDA = await getUserAccountPDA(username)
  
  const key = encryptionKey || Array.from(crypto.getRandomValues(new Uint8Array(32)))

  const tx = await program.methods
    .registerUsername(username, key)
    .accounts({
      userAccount: userAccountPDA,
      owner: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId
    })
    .signers([wallet])
    .rpc()

  return { tx, pda: userAccountPDA }
}

export async function lookupUsername(username) {
  const connection = getConnection()
  const pda = await getUserAccountPDA(username)
  
  try {
    const provider = new AnchorProvider(connection, {}, { commitment: 'confirmed' })
    const program = new Program(idl, PROGRAM_ID, provider)
    const account = await program.account.userAccount.fetch(pda)
    return {
      owner: account.owner.toBase58(),
      username: account.username,
      createdAt: account.createdAt.toNumber(),
      encryptionKey: Array.from(account.encryptionKey)
    }
  } catch {
    return null 
  }
}

export async function fetchMyAccount(wallet) {
  const connection = getConnection()
  const provider = new AnchorProvider(connection, {}, { commitment: 'confirmed' })
  const program = new Program(idl, PROGRAM_ID, provider)

  try {
    const accounts = await program.account.userAccount.all([
      {
        memcmp: {
          offset: 8, 
          bytes: wallet.publicKey.toBase58()
        }
      }
    ])
    
    if (accounts.length > 0) {
      const acc = accounts[0].account
      return {
        pda: accounts[0].publicKey.toBase58(),
        owner: acc.owner.toBase58(),
        username: acc.username,
        createdAt: acc.createdAt.toNumber(),
        encryptionKey: Array.from(acc.encryptionKey)
      }
    }
    return null
  } catch {
    return null
  }
}


export async function updateEncryptionKey(wallet, username, newKey) {
  const program = getProgram(wallet)
  const userAccountPDA = await getUserAccountPDA(username)

  const tx = await program.methods
    .updateEncryptionKey(Array.from(newKey))
    .accounts({
      userAccount: userAccountPDA,
      owner: wallet.publicKey
    })
    .signers([wallet])
    .rpc()

  return tx
}

export async function closeAccount(wallet, username) {
  const program = getProgram(wallet)
  const userAccountPDA = await getUserAccountPDA(username)

  const tx = await program.methods
    .closeAccount(username)
    .accounts({
      userAccount: userAccountPDA,
      owner: wallet.publicKey
    })
    .signers([wallet])
    .rpc()

  return tx
}


export async function createGroup(wallet, {
  name,
  description = '',
  isPublic = true,
  isSearchable = true,
  inviteOnly = false,
  maxMembers = 100,
  allowMemberInvites = true
}) {
  const program = getProgram(wallet)
  const groupId = Array.from(crypto.getRandomValues(new Uint8Array(32)))
  const groupEncryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
  
  const groupPDA = await getGroupAccountPDA(new Uint8Array(groupId))
  const ownerMemberPDA = await getGroupMemberPDA(new Uint8Array(groupId), wallet.publicKey)

  const tx = await program.methods
    .createGroup(
      groupId,
      name,
      description,
      isPublic,
      isSearchable,
      inviteOnly,
      maxMembers,
      allowMemberInvites,
      groupEncryptionKey
    )
    .accounts({
      groupAccount: groupPDA,
      ownerMemberAccount: ownerMemberPDA,
      owner: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId
    })
    .signers([wallet])
    .rpc()

  return { tx, groupId, groupPDA }
}
export async function fetchMyGroups(wallet) {
  const connection = getConnection()
  const provider = new AnchorProvider(connection, {}, { commitment: 'confirmed' })
  const program = new Program(idl, PROGRAM_ID, provider)

  try {
    const accounts = await program.account.groupAccount.all([
      {
        memcmp: {
          offset: 8, 
          bytes: wallet.publicKey.toBase58()
        }
      }
    ])

    return accounts.map((a) => ({
      pda: a.publicKey.toBase58(),
      name: a.account.name,
      description: a.account.description,
      isPublic: a.account.isPublic,
      memberCount: a.account.memberCount,
      createdAt: a.account.createdAt.toNumber(),
      publicCode: a.account.publicCode
    }))
  } catch {
    return []
  }
}



export default {
  registerUsername,
  lookupUsername,
  fetchMyAccount,
  updateEncryptionKey,
  closeAccount,
  createGroup,
  fetchMyGroups
}
