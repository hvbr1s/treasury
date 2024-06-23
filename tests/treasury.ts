import * as anchor from "@coral-xyz/anchor";
import * as fs from 'fs';
import * as path from 'path';
import { BN } from "bn.js";
import { Program } from "@coral-xyz/anchor";
import { PdaTreasury } from "../target/types/pda_treasury";
import { PublicKey , SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

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
  
    it("can withdraw safely!", async () => {
      const program_account = new PublicKey('5y6nvZ2mHWG38oGN6jqUpg2mLFdsiWUBvJNDiQnHUBbS');
      const treasuryAccount = new PublicKey(pdaAccount);
      const vaultAccount = new PublicKey('3XWNZsQ8HXaUfhouH83zVP3MKLAHwe1tw8H9uX2Zojiz');

      try {
        // Get the current balance of the treasury account
        const treasuryBalance = await program.provider.connection.getBalance(treasuryAccount);
        console.log(`Current treasury balance: ${treasuryBalance} lamports`);

        // Get the minimum balance for rent exemption
        const rentExemptionAmount = await program.provider.connection.getMinimumBalanceForRentExemption(0);
        const safeWithdrawalAmount = rentExemptionAmount + (0.01 * LAMPORTS_PER_SOL); // 0.01 SOL buffer

        if (treasuryBalance > safeWithdrawalAmount) {
          const amountToWithdraw = treasuryBalance - safeWithdrawalAmount;
          console.log(`Attempting to withdraw ${amountToWithdraw} lamports from the treasury to the vault!`);

          const tx = await program.methods.withdraw(new BN(amountToWithdraw)).accounts({
            treasury: treasuryAccount,
            vault: vaultAccount,
            systemProgram: SystemProgram.programId,
          }).signers([])
          .rpc();

          console.log("Transaction signature -->", tx);

          // Retrieve the updated balances of the treasury and vault accounts
          const updatedTreasuryBalance = await program.provider.connection.getBalance(treasuryAccount);
          const updatedVaultBalance = await program.provider.connection.getBalance(vaultAccount);
          console.log("Updated treasury balance ->", updatedTreasuryBalance);
          console.log("Updated vault balance ->", updatedVaultBalance);

          console.log(`Successfully withdrew ${amountToWithdraw} lamports from the treasury!`);
          console.log(`Treasury retains ${updatedTreasuryBalance} lamports for rent.`);
        } else if (treasuryBalance > 0) {
          console.log(`Treasury balance (${treasuryBalance} lamports) is not enough to safely withdraw. Minimum safe balance is ${safeWithdrawalAmount} lamports.`);
        } else {
          console.log("Treasury is empty. No withdrawal needed.");
        }
      } catch (error) {
        console.error("Failed to withdraw:", error);
      }
    });
});
