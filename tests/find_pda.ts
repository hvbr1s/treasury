import { PublicKey } from "@solana/web3.js";
 
const programId = new PublicKey("8LB9sB59tSfSAgUefmdme2SrGigvvnNVybgvDx757iuN");
const seed = "coloroffire";
 
const [PDA, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from(seed)],
  programId,
);
 
console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);