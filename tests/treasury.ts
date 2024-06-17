import * as anchor from "@coral-xyz/anchor";
import * as fs from 'fs';
import * as path from 'path';
import { BN } from "bn.js";
import { Program } from "@coral-xyz/anchor";
import { PdaTreasury } from "../target/types/pda_treasury";
import { PublicKey } from '@solana/web3.js';

describe("treasury", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.DeployTreasury as Program<PdaTreasury>;

    it('Initializes a PDA successfully', async () => {
    
      // Using local wallet for testing
      const secretKeyString = fs.readFileSync(path.join('/home/dan/treasury/secrets', 'DJMRfSQRhJRdLAYzcxfAm5xKBfJmYcEJjhTU5FPyzmVS.json'), { encoding: 'utf8' });
      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      const user = anchor.web3.Keypair.fromSecretKey(secretKey);
      const userPubKey = user.publicKey
  
      const [pdaAccount, bump] = await PublicKey.findProgramAddress(
        [Buffer.from("coloroffire"), user.publicKey.toBuffer()],
        program.programId
      );
      console.log(`PDA account is -> ${pdaAccount} and bump is ${bump}.`)
  
      // Call the initialize function
      const tx = await program.rpc.initialize({
        accounts: {
          user: userPubKey,
          pdaAccount: pdaAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [user],
      });
  
      console.log("Transaction signature", tx);
    });
  
    it("can withdraw!", async () => {
      const lamport = new BN(1000000);
      const tx = await program.methods.withdraw(lamport);
      console.log("Your transaction signature", tx);
    });
});