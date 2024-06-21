import * as anchor from "@coral-xyz/anchor";
import * as fs from 'fs';
import * as path from 'path';
import { BN } from "bn.js";
import { Program } from "@coral-xyz/anchor";
import { PdaTreasury } from "../target/types/pda_treasury";
import { PublicKey , SystemProgram } from '@solana/web3.js';

describe("treasury", () => {

    // Configure the client to use the local cluster.
    const provider = anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.DeployTreasury as Program<PdaTreasury>;
    const secretKeyString = fs.readFileSync(path.join('/home/dan/treasury/secrets', 'DJMRfSQRhJRdLAYzcxfAm5xKBfJmYcEJjhTU5FPyzmVS.json'), { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const user = anchor.web3.Keypair.fromSecretKey(secretKey);
    const userPubKey = user.publicKey

    const [pdaAccount, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("coloroffire")],
      program.programId
    );
    console.log(`PDA account is -> ${pdaAccount} and bump is ${bump}.`)

    it('Initializes a PDA successfully', async () => {
  
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

      const lamport = new BN(5);
      console.log(`We want to withdraw ${lamport} lamports from the treasury to the vault!`)
      const program_account = new PublicKey('5y6nvZ2mHWG38oGN6jqUpg2mLFdsiWUBvJNDiQnHUBbS')
      const treasuryAccount =  new PublicKey(pdaAccount)
      const vaultAccount = new PublicKey('3XWNZsQ8HXaUfhouH83zVP3MKLAHwe1tw8H9uX2Zojiz')
      try {
        const tx = await program.methods.withdraw(lamport).accounts({
          treasury: treasuryAccount,
          vault: vaultAccount,
          systemProgram: SystemProgram.programId,
        }).signers([])
        .rpc();
        console.log("Transaction signature -->", tx);
      } catch (error) {
        console.error("Failed to withdraw:", error);
      }
    
      // Retrieve the updated balances of the treasury and vault accounts
      const treasuryBalance = await program.provider.connection.getBalance(treasuryAccount);
      const vaultBalance = await program.provider.connection.getBalance(vaultAccount);
      console.log("Treasury balance->", treasuryBalance);
      console.log("Vault balance->", vaultBalance);
    });
});