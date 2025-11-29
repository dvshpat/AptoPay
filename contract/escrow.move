module new::escrow_vault {

    use std::signer;
    use std::timestamp;
    // use std::option;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account::SignerCapability;
    use aptos_framework::table::{Self as table, Table};

    const ADMIN: address = @0x561e3de8c948305003be617b7ce5f5280aa36798ea256a8fab13fe21c2e040f4; // replace with your admin address

    /// Error code 1: The expiry timestamp provided is invalid (must be in the future)
    const INVALID_EXPIRY: u64 = 1;

    /// Error code 2: There is already an active payment for this receiver
    const ACTIVE_PAYMENT_EXISTS: u64 = 2;

    /// Error code 3: No funds available to withdraw
    const NO_FUNDS_TO_WITHDRAW: u64 = 3;

    /// Error code 4: The payment has already been withdrawn
    const ALREADY_WITHDRAWN: u64 = 4;

    /// Error code 5: The payment has expired
    const PAYMENT_EXPIRED: u64 = 5;

    /// Error code 6: Only admin can perform this action
    const NOT_ADMIN: u64 = 6;

    /// Error Already initialized
    const ALREADY_INITIALIZED: u64 = 7;


    struct VaultInfo has key {
        vault: address,
        vault_signer: SignerCapability,
    }

    struct Payment has key, store, drop {
        sender: address,
        receiver: address,
        amount: u64,
        expiry: u64,
        withdrawn: bool,
    }

    struct EscrowStore has key {
        payments: Table<address, Table<address, Payment>> // sender -> receiver -> Payment
    }

    /// Admin initializes the vault once
    public entry fun initialize_vault(admin: &signer, seeds: vector<u8>) {
        // Only ADMIN can initialize vault
        assert!(signer::address_of(admin) == ADMIN, NOT_ADMIN);

        // Ensure vault not already initialized
        assert!(!exists<VaultInfo>(signer::address_of(admin)), ALREADY_INITIALIZED);

        // Create resource account for the admin vault
        let (vault_addr, vault_cap) = account::create_resource_account(admin, seeds);

        // Register AptosCoin for this vault
        coin::register<AptosCoin>(&vault_addr);

        // Store vault info with signer capability
        move_to(admin, VaultInfo { 
            vault: signer::address_of(&vault_addr), 
            vault_signer: vault_cap 
        });

        // Initialize EscrowStore with nested table (sender -> receiver -> Payment)
        move_to(admin, EscrowStore { 
            payments: table::new<address, Table<address, Payment>>() 
        });
    }


    /// Deposit into escrow (metadata only), coins go into admin vault
    public entry fun deposit(
        sender: &signer,
        receiver: address,
        expiry: u64,
        amount: u64,
    ) acquires VaultInfo, EscrowStore {

        assert!(expiry > timestamp::now_seconds(), INVALID_EXPIRY);

        let admin_addr = ADMIN;
        let vault_info = borrow_global<VaultInfo>(admin_addr);
        let store = borrow_global_mut<EscrowStore>(admin_addr);

        let sender_addr = signer::address_of(sender);

        // Create Payment object
        let payment = Payment { 
            sender: sender_addr, 
            receiver, 
            amount, 
            expiry, 
            withdrawn: false 
        };

        // --- Ensure sender table exists ---
        if (!store.payments.contains(sender_addr)) {
            store.payments.add(sender_addr, table::new<address, Payment>());
        };

        let sender_table = store.payments.borrow_mut(sender_addr);

        // --- Ensure no active payment exists for this receiver ---
        if (sender_table.contains(receiver)) {
            let existing = sender_table.borrow(receiver);
            assert!(existing.withdrawn || timestamp::now_seconds() >= existing.expiry, ACTIVE_PAYMENT_EXISTS);
            sender_table.remove(receiver);
        };

        // Add new payment
        sender_table.add(receiver, payment);

        let coins = coin::withdraw<AptosCoin>(sender, amount);
        // Transfer coins from sender to admin vault
        coin::deposit(vault_info.vault, coins);
    }

    #[view]
    public fun getBalance(): u64 acquires VaultInfo {
        let vault_info = borrow_global<VaultInfo>(ADMIN);
        let vault_addr = vault_info.vault;
        coin::balance<AptosCoin>(vault_addr)
    }
    /// Receiver withdraws from admin vault before expiry
    public entry fun withdraw(receiver: &signer, sender_addr: address) acquires VaultInfo, EscrowStore {
        let receiver_addr = signer::address_of(receiver);
        let admin_addr = ADMIN;
        let vault_info = borrow_global<VaultInfo>(admin_addr);
        let store = borrow_global_mut<EscrowStore>(admin_addr);

        // Ensure sender has a payment table
        assert!(store.payments.contains(sender_addr), NO_FUNDS_TO_WITHDRAW);
        let sender_table = store.payments.borrow_mut(sender_addr);

        // Ensure payment exists for this receiver
        assert!(sender_table.contains(receiver_addr), NO_FUNDS_TO_WITHDRAW);
        let p = sender_table.borrow_mut(receiver_addr);

        assert!(!p.withdrawn, ALREADY_WITHDRAWN);
        assert!(timestamp::now_seconds() < p.expiry, PAYMENT_EXPIRED);

        let amount = p.amount;
        p.withdrawn = true;

        // Transfer coins from admin vault to receiver
        let vault_signer = account::create_signer_with_capability(&vault_info.vault_signer);
        coin::transfer<AptosCoin>(&vault_signer, receiver_addr, amount);
    }


    /// Refund sender after expiry if not withdrawn
    public entry fun refund(sender: &signer, receiver_addr: address) acquires VaultInfo, EscrowStore {
        let admin_addr = ADMIN;
        let vault_info = borrow_global<VaultInfo>(admin_addr);
        let store = borrow_global_mut<EscrowStore>(admin_addr);
        let sender_addr = signer::address_of(sender);

        assert!(store.payments.contains(sender_addr), NO_FUNDS_TO_WITHDRAW);
        let sender_table = store.payments.borrow_mut(sender_addr);

        // Ensure payment exists for this receiver
        assert!(sender_table.contains(receiver_addr), NO_FUNDS_TO_WITHDRAW);
        let p = sender_table.borrow_mut(receiver_addr);

        assert!(!p.withdrawn, ALREADY_WITHDRAWN);
        assert!(timestamp::now_seconds() > p.expiry, PAYMENT_EXPIRED);

        let amount = p.amount;
        p.withdrawn = true;

        let vault_signer = account::create_signer_with_capability(&vault_info.vault_signer);
        coin::transfer<AptosCoin>(&vault_signer, p.sender, amount);
    }
}