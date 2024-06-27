use anchor_lang::prelude::*;

declare_id!("5y6nvZ2mHWG38oGN6jqUpg2mLFdsiWUBvJNDiQnHUBbS");

const TREASURY_PDA_SEED : &[u8] = b"coloroffire";
const VAULT_ADDRESS: &str ="3XWNZsQ8HXaUfhouH83zVP3MKLAHwe1tw8H9uX2Zojiz";

#[program]
pub mod pda_treasury{

    use anchor_lang::solana_program::entrypoint_deprecated::ProgramResult;
    use super :: *;
    
    // Initialize the PDA at address function
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult{
        let account_data = &mut ctx.accounts.pda_account;
        account_data.bump = ctx.bumps.pda_account; // stored bump
        let (pda, bump_seed) = Pubkey::find_program_address(&[TREASURY_PDA_SEED], ctx.program_id);
        msg!("Found the PDA address-> {} and the Bump {}", pda, bump_seed);
        Ok(())
    }
    // Withdraw to vault function
    pub fn withdraw(ctx: Context<Withdraw>, lamports: u64) -> ProgramResult {
        let from = ctx.accounts.treasury.to_account_info();
        let to = ctx.accounts.vault.to_account_info();
    
        // Ensure the treasury has enough balance
        if **from.lamports.borrow() < lamports {
            return Err(ProgramError::InsufficientFunds.into());
        }
    
        // Perform the transfer
        **from.try_borrow_mut_lamports()? -= lamports;
        **to.try_borrow_mut_lamports()? += lamports;
    
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [TREASURY_PDA_SEED],
        bump,
        payer = user,
        space = 8 + 32 + 8
    )]
    pub pda_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [TREASURY_PDA_SEED],
        bump,
    )]
    pub treasury: Account<'info, DataAccount>,
    #[account(mut, address = VAULT_ADDRESS.parse::<Pubkey>().unwrap())]
    /// CHECK: This is the vault account
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DataAccount {
    pub bump: u8,
}

