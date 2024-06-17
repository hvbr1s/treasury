use anchor_lang::prelude::*;

declare_id!("8LB9sB59tSfSAgUefmdme2SrGigvvnNVybgvDx757iuN");

const TREASURY_PDA_SEED : &[u8] = b"coloroffire";
const TREASURY_ACCOUNT_PDA: &str = "CDAgKPcyadPx3r1uruUYPf8WBYJFrmp5AaqDLpBw1JKX";
const VAULT_ADDRESS: &str ="3XWNZsQ8HXaUfhouH83zVP3MKLAHwe1tw8H9uX2Zojiz";
const BUMP_SEED: &[u8] = b"255";

#[program]
pub mod pda_treasury{

    use anchor_lang::solana_program::{entrypoint_deprecated::ProgramResult, program::invoke_signed, system_instruction};
    use std::str::FromStr;

    use super :: *;
    pub fn  initialize(ctx: Context<Initialize>) -> ProgramResult{
        let (pda, _bump_seed) = Pubkey::find_program_address(&[TREASURY_PDA_SEED], ctx.program_id);
        ctx.accounts.pda_account.user = *ctx.accounts.user.key;
        ctx.accounts.pda_account.bump = ctx.accounts.pda_account.bump;
        msg!("Found the PDA address-> {} and the Bump {}", pda, _bump_seed);
        Ok(())
    }
    pub fn withdraw(ctx: Context<Withdraw>, lamports: u64) -> ProgramResult{
        let program_id = Pubkey::from_str("8LB9sB59tSfSAgUefmdme2SrGigvvnNVybgvDx757iuN").unwrap();
        let vault = Pubkey::from_str(VAULT_ADDRESS).unwrap();
        let (pda , _bump_seed) = Pubkey::find_program_address(&[TREASURY_PDA_SEED], &program_id);
        msg!("Prepare to withdraw from -> {} using bump {}", pda, _bump_seed);
        let _ = invoke_signed( 
        &system_instruction::transfer(
            &pda, 
            &vault, 
            lamports,
        ),
        &[
            ctx.accounts.treasury.to_account_info(),
            ctx.accounts.vault.to_account_info(),
            ctx.accounts.system_program.to_account_info(),

        ],
        &[&[
            TREASURY_PDA_SEED.as_ref(),
            // &[_bump_seed],
            BUMP_SEED.as_ref(),

        ]],
    
    );
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
        space = 8 + 32 + 8 // space for Pubkey + u8 bump
    )]
    pub pda_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(address = TREASURY_ACCOUNT_PDA.parse::<Pubkey>().unwrap())]
    /// CHECK: This field is marked as unsafe because it uses a direct address parse with no additional type checks. This is considered safe here because the address is a known constant and not derived from user input.
    pub treasury: AccountInfo<'info>,
    #[account(address = VAULT_ADDRESS.parse::<Pubkey>().unwrap())]
    /// CHECK:
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub user: Signer<'info>,
}

#[account]
pub struct DataAccount {
    pub user: Pubkey,
    pub bump: u8,
}

