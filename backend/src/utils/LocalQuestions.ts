import { CachedQuestion } from './QuestionCache';

/**
 * Curated high-quality Cryptocurrency and Blockchain trivia.
 * These are used as a priority for Category 18 (Crypto) to avoid
 * the generic 'Science: Computers' questions from OpenTDB.
 */
export const CRYPTO_QUESTIONS: CachedQuestion[] = [
    {
        id: 'lc_crypto_1',
        text: 'Who is the anonymous creator of Bitcoin?',
        options: ['Satoshi Nakamoto', 'Vitalik Buterin', 'Charlie Lee', 'Craig Wright'],
        correctAnswer: 'Satoshi Nakamoto'
    },
    {
        id: 'lc_crypto_2',
        text: 'What is the maximum supply of Bitcoin?',
        options: ['21 Million', '18 Million', '100 Million', 'Unlimited'],
        correctAnswer: '21 Million'
    },
    {
        id: 'lc_crypto_3',
        text: 'Which consensus mechanism does Ethereum currently use after "The Merge"?',
        options: ['Proof of Stake', 'Proof of Work', 'Proof of History', 'Delegated Proof of Stake'],
        correctAnswer: 'Proof of Stake'
    },
    {
        id: 'lc_crypto_4',
        text: 'What was the first commercial transaction ever made using Bitcoin?',
        options: ['Buying two pizzas', 'Buying a computer', 'Paying for a hotel', 'Donating to charity'],
        correctAnswer: 'Buying two pizzas'
    },
    {
        id: 'lc_crypto_5',
        text: 'What does HODL stand for in the crypto community?',
        options: ['Hold On for Dear Life', 'High On Digital Logs', 'Hold Only Digital Leverage', 'It was originally a typo for HOLD'],
        correctAnswer: 'It was originally a typo for HOLD'
    },
    {
        id: 'lc_crypto_6',
        text: 'Which blockchain is known for having "Smart Contracts" as its primary feature first?',
        options: ['Ethereum', 'Bitcoin', 'Litecoin', 'Dogecoin'],
        correctAnswer: 'Ethereum'
    },
    {
        id: 'lc_crypto_7',
        text: 'What is a "Stablecoin"?',
        options: ['A coin pegged to a stable asset like the US Dollar', 'A coin that never loses value', 'A coin used only for trading', 'A coin with no volatility'],
        correctAnswer: 'A coin pegged to a stable asset like the US Dollar'
    },
    {
        id: 'lc_crypto_8',
        text: 'What is "Mining" in the context of Bitcoin?',
        options: ['The process of validating transactions and securing the network', 'Extracting physical gold to back the coin', 'Searching for lost wallets', 'Trading coins for profit'],
        correctAnswer: 'The process of validating transactions and securing the network'
    },
    {
        id: 'lc_crypto_9',
        text: 'What is a "Private Key"?',
        options: ['A secret code that allows you to spend your crypto', 'Your account username', 'A password you use to log into an exchange', 'The address you give people to send you money'],
        correctAnswer: 'A secret code that allows you to spend your crypto'
    },
    {
        id: 'lc_crypto_10',
        text: 'What does DeFi stand for?',
        options: ['Decentralized Finance', 'Deferred Finance', 'Digital Equity Fund', 'Defined Fiat'],
        correctAnswer: 'Decentralized Finance'
    },
    {
        id: 'lc_crypto_11',
        text: 'Which year was the Bitcoin whitepaper published?',
        options: ['2008', '2009', '2010', '2007'],
        correctAnswer: '2008'
    },
    {
        id: 'lc_crypto_12',
        text: 'What is the smallest unit of a Bitcoin called?',
        options: ['Satoshi', 'Wei', 'Gwei', 'Bit'],
        correctAnswer: 'Satoshi'
    },
    {
        id: 'lc_crypto_13',
        text: 'What is a "Cold Wallet"?',
        options: ['A wallet not connected to the internet', 'A wallet stored in a freezer', 'A wallet with no funds', 'A hardware device that is broken'],
        correctAnswer: 'A wallet not connected to the internet'
    },
    {
        id: 'lc_crypto_14',
        text: 'What is an NFT?',
        options: ['Non-Fungible Token', 'New Financial Tool', 'Network File Transfer', 'Node Filter Technology'],
        correctAnswer: 'Non-Fungible Token'
    },
    {
        id: 'lc_crypto_15',
        text: 'Which crypto is often referred to as "Digital Gold"?',
        options: ['Bitcoin', 'Ethereum', 'PAX Gold', 'Litecoin'],
        correctAnswer: 'Bitcoin'
    },
    {
        id: 'lc_crypto_16',
        text: 'What is "Staking"?',
        options: ['Locking up crypto to support a network and earn rewards', 'Betting on price movements', 'Buying a large amount of a single coin', 'Providing liquidity to an exchange'],
        correctAnswer: 'Locking up crypto to support a network and earn rewards'
    },
    {
        id: 'lc_crypto_17',
        text: 'What is a "Gas Fee"?',
        options: ['A transaction fee paid to miners/validators', 'The cost of running a computer', 'A tax paid to the government', 'A fee for converting crypto to cash'],
        correctAnswer: 'A transaction fee paid to miners/validators'
    },
    {
        id: 'lc_crypto_18',
        text: 'Which of these is a popular Decentralized Exchange (DEX)?',
        options: ['Uniswap', 'Binance', 'Coinbase', 'Kraken'],
        correctAnswer: 'Uniswap'
    },
    {
        id: 'lc_crypto_19',
        text: 'What is "Halving" in Bitcoin?',
        options: ['When the reward for mining blocks is cut in half', 'When the price of Bitcoin drops by 50%', 'When the network splits into two', 'When half of all coins are burned'],
        correctAnswer: 'When the reward for mining blocks is cut in half'
    },
    {
        id: 'lc_crypto_20',
        text: 'What is a "Bull Market"?',
        options: ['A period where prices are rising', 'A period where prices are falling', 'A market for livestock', 'A market with no activity'],
        correctAnswer: 'A period where prices are rising'
    },
    {
        id: 'lc_crypto_21',
        text: 'What does whales mean in crypto?',
        options: ['Individuals or entities that hold massive amounts of crypto', 'New investors', 'Scammers', 'Exchange owners'],
        correctAnswer: 'Individuals or entities that hold massive amounts of crypto'
    },
    {
        id: 'lc_crypto_22',
        text: 'What is the primary purpose of a "Seed Phrase"?',
        options: ['To recover a wallet if access is lost', 'To share your balance with friends', 'To verify your identity on an exchange', 'To encrypt your private emails'],
        correctAnswer: 'To recover a wallet if access is lost'
    },
    {
        id: 'lc_crypto_23',
        text: 'Which sports-focused blockchain ecosystem uses the CHZ token?',
        options: ['Chiliz', 'Solana', 'Ethereum', 'Polygon'],
        correctAnswer: 'Chiliz'
    },
    {
        id: 'lc_crypto_24',
        text: 'What is "Airdrop" in crypto?',
        options: ['Free distribution of tokens to wallet addresses', 'Sending crypto via Bluetooth', 'A method of destroying tokens', 'A sudden drop in market price'],
        correctAnswer: 'Free distribution of tokens to wallet addresses'
    },
    {
        id: 'lc_crypto_25',
        text: 'What is a "Governance Token"?',
        options: ['A token that gives holders voting rights on project changes', 'A token issued by a government', 'A token used for paying taxes', 'A token that cannot be traded'],
        correctAnswer: 'A token that gives holders voting rights on project changes'
    },
    {
        id: 'lc_crypto_26',
        text: 'What is the "Genesis Block"?',
        options: ['The very first block in a blockchain', 'The block that caused a market crash', 'The last block to be mined', 'A block containing only illegal transactions'],
        correctAnswer: 'The very first block in a blockchain'
    },
    {
        id: 'lc_crypto_27',
        text: 'What is FOAT / POAP?',
        options: ['Proof of Attendance Protocol', 'Piece of Art Protocol', 'Private Online Access Point', 'Public Open Asset Proof'],
        correctAnswer: 'Proof of Attendance Protocol'
    },
    {
        id: 'lc_crypto_28',
        text: 'Which of these is a Layer 2 scaling solution for Ethereum?',
        options: ['Arbitrum', 'Solana', 'Cardano', 'Polkadot'],
        correctAnswer: 'Arbitrum'
    },
    {
        id: 'lc_crypto_29',
        text: 'What is "FOMO"?',
        options: ['Fear Of Missing Out', 'Facts Of Market Options', 'Financial Order Management Office', 'Future Of Money Online'],
        correctAnswer: 'Fear Of Missing Out'
    },
    {
        id: 'lc_crypto_30',
        text: 'What is a "DAO"?',
        options: ['Decentralized Autonomous Organization', 'Digital Asset Ownership', 'Daily Operating Agreement', 'Distributed Archive Office'],
        correctAnswer: 'Decentralized Autonomous Organization'
    },
    {
        id: 'lc_crypto_31',
        text: 'Which coin has a Shiba Inu dog as its mascot?',
        options: ['Dogecoin', 'Litecoin', 'Solana', 'Monero'],
        correctAnswer: 'Dogecoin'
    },
    {
        id: 'lc_crypto_32',
        text: 'What is the purpose of a "Block Explorer"?',
        options: ['To view transaction history on the blockchain', 'To find lost Bitcoin in the real world', 'To mine blocks faster', 'To hide your private keys'],
        correctAnswer: 'To view transaction history on the blockchain'
    },
    {
        id: 'lc_crypto_33',
        text: 'What does "DYOR" stand for?',
        options: ['Do Your Own Research', 'Digital Yield On Return', 'Daily Yield Of Rewards', 'Deposit Your Own Reserves'],
        correctAnswer: 'Do Your Own Research'
    },
    {
        id: 'lc_crypto_34',
        text: 'What is a "Paper Wallet"?',
        options: ['Private and public keys printed on paper', 'A fake wallet made of paper', 'A wallet for storing digital documents', 'A bank account statement'],
        correctAnswer: 'Private and public keys printed on paper'
    },
    {
        id: 'lc_crypto_35',
        text: 'What is the term for when a blockchain splits into two separate chains?',
        options: ['Fork', 'Spoon', 'Knife', 'Break'],
        correctAnswer: 'Fork'
    },
    {
        id: 'lc_crypto_36',
        text: 'What is "Burning" in crypto?',
        options: ['Permanently removing tokens from circulation', 'Deleting your wallet app', 'Spending all your crypto in one day', 'Losing your seed phrase'],
        correctAnswer: 'Permanently removing tokens from circulation'
    },
    {
        id: 'lc_crypto_37',
        text: 'Which of these is a "Hardware Wallet"?',
        options: ['Ledger', 'Metamask', 'Trust Wallet', 'Phantom'],
        correctAnswer: 'Ledger'
    },
    {
        id: 'lc_crypto_38',
        text: 'What is "Liquidity Providing"?',
        options: ['Depositing pairs of tokens into a DEX to facilitate trading', 'Selling all your assets for cash', 'Buying crypto with a credit card', 'Sending crypto to a regular bank'],
        correctAnswer: 'Depositing pairs of tokens into a DEX to facilitate trading'
    },
    {
        id: 'lc_crypto_39',
        text: 'What is the "Double Spend" problem?',
        options: ['The risk that a single digital token can be spent more than once', 'Having two wallets with the same balance', 'Spending more than you have in your bank', 'A bug that doubles your transaction fee'],
        correctAnswer: 'The risk that a single digital token can be spent more than once'
    },
    {
        id: 'lc_crypto_40',
        text: 'What is "Solidity"?',
        options: ['A programming language for Ethereum smart contracts', 'The state of a stable coin', 'The level of security in a wallet', 'The opposite of digital liquidity'],
        correctAnswer: 'A programming language for Ethereum smart contracts'
    },
    {
        id: 'lc_crypto_41',
        text: 'What is "DCA"?',
        options: ['Dollar Cost Averaging', 'Digital Currency Agreement', 'Daily Crypto Assets', 'Direct Cash Access'],
        correctAnswer: 'Dollar Cost Averaging'
    },
    {
        id: 'lc_crypto_42',
        text: 'What is a "Multi-sig" wallet?',
        options: ['A wallet that requires multiple signatures to authorize a transaction', 'A wallet that can hold multiple different coins', 'A wallet that belongs to multiple owners', 'A wallet that signs messages automatically'],
        correctAnswer: 'A wallet that requires multiple signatures to authorize a transaction'
    },
    {
        id: 'lc_crypto_43',
        text: 'What is "Total Value Locked" (TVL)?',
        options: ['The sum of all assets deposited in a DeFi protocol', 'The total market cap of Bitcoin', 'The amount of crypto stored in exchanges', 'The value of coins that are lost forever'],
        correctAnswer: 'The sum of all assets deposited in a DeFi protocol'
    },
    {
        id: 'lc_crypto_44',
        text: 'What is an "Oracle" in blockchain?',
        options: ['A service that provides real-world data to smart contracts', 'A developer who can predict future prices', 'A government regulator', 'The official documentation of a coin'],
        correctAnswer: 'A service that provides real-world data to smart contracts'
    },
    {
        id: 'lc_crypto_45',
        text: 'What is "Rug Pull"?',
        options: ['When developers abandon a project and run away with investors\' funds', 'When you accidentally delete your wallet', 'When the price of ETH goes above BTC', 'A new type of consensus mechanism'],
        correctAnswer: 'When developers abandon a project and run away with investors\' funds'
    },
    {
        id: 'lc_crypto_46',
        text: 'What is "Impermanent Loss"?',
        options: ['A temporary loss of funds when providing liquidity to a DEX', 'Losing your password briefly', 'A drop in the value of an NFT', 'When a transaction fails and is refunded'],
        correctAnswer: 'A temporary loss of funds when providing liquidity to a DEX'
    },
    {
        id: 'lc_crypto_47',
        text: 'What is "Web3"?',
        options: ['The idea for a decentralized internet based on blockchain', 'The third version of Google', 'The internet for mobile devices only', 'A specialized browser for trading'],
        correctAnswer: 'The idea for a decentralized internet based on blockchain'
    },
    {
        id: 'lc_crypto_48',
        text: 'Which coin was created by Vitalik Buterin?',
        options: ['Ethereum', 'Bitcoin', 'Cardano', 'Ripple'],
        correctAnswer: 'Ethereum'
    },
    {
        id: 'lc_crypto_49',
        text: 'What is "Mainnet"?',
        options: ['The primary production blockchain where real transactions occur', 'The developer-only testing network', 'The physical server rack for a node', 'The global internet connection'],
        correctAnswer: 'The primary production blockchain where real transactions occur'
    },
    {
        id: 'lc_crypto_50',
        text: 'What is "Testnet"?',
        options: ['A blockchain used by developers to test apps without real value', 'A network for high-speed trading', 'The first version of Bitcoin', 'A network that only works on weekends'],
        correctAnswer: 'A blockchain used by developers to test apps without real value'
    },
    {
        id: 'lc_crypto_111',
        text: 'What is a "Flash Crash"?',
        options: ['An extremely rapid and dramatic drop in market price followed by a quick recovery', 'A temporary bug in an exchange interface', 'A way to buy coins during a power outage', 'A sudden increase in network speed'],
        correctAnswer: 'An extremely rapid and dramatic drop in market price followed by a quick recovery'
    },
    {
        id: 'lc_crypto_112',
        text: 'Which organization is responsible for the USDC stablecoin?',
        options: ['Circle (and Coinbase)', 'Tether Limited', 'Binance', 'MakerDAO'],
        correctAnswer: 'Circle (and Coinbase)'
    },
    {
        id: 'lc_crypto_113',
        text: 'What is "Wrapped Ether" (WETH)?',
        options: ['An ERC-20 version of ETH used for decentralized trading', 'Ethereum stored in a physical jacket', 'ETH that has been frozen by a government', 'A version of ETH that cannot be spent'],
        correctAnswer: 'An ERC-20 version of ETH used for decentralized trading'
    },
    {
        id: 'lc_crypto_114',
        text: 'What is the "Merge" in Ethereum history?',
        options: ['The transition from Proof of Work to Proof of Stake', 'The merger of Ethereum and Ethereum Classic', 'When Bitcoin and Ethereum joined the same network', 'The first time an NFT was sold'],
        correctAnswer: 'The transition from Proof of Work to Proof of Stake'
    },
    {
        id: 'lc_crypto_115',
        text: 'What is "Slashing" in Proof of Stake?',
        options: ['A penalty where a validator loses part of their staked coins for bad behavior', 'A way to cut transaction fees in half', 'A market crash where everyone sells at once', 'Deleting inactive wallet addresses'],
        correctAnswer: 'A penalty where a validator loses part of their staked coins for bad behavior'
    },
    {
        id: 'lc_crypto_116',
        text: 'Which of these is a "Zero-Knowledge Rollup" (ZK-Rollup)?',
        options: ['zkSync', 'Optimism', 'Arbitrum', 'Polygon POS'],
        correctAnswer: 'zkSync'
    },
    {
        id: 'lc_crypto_117',
        text: 'What is "Optimistic Rollup"?',
        options: ['A Layer 2 scaling solution that assumes transactions are valid unless proven otherwise', 'A blockchain that only works when the market is up', 'A way to send crypto without any fees', 'A specialized wallet for new investors'],
        correctAnswer: 'A Layer 2 scaling solution that assumes transactions are valid unless proven otherwise'
    },
    {
        id: 'lc_crypto_118',
        text: 'What is "DAI"?',
        options: ['A decentralized algorithmic stablecoin backed by collateral on MakerDAO', 'A digital asset interface', 'The original name of Ethereum', 'A coin used for voting in Japan'],
        correctAnswer: 'A decentralized algorithmic stablecoin backed by collateral on MakerDAO'
    },
    {
        id: 'lc_crypto_119',
        text: 'What is the "Maximum Supply" of Litecoin?',
        options: ['84 Million', '21 Million', 'Unlimited', '100 Million'],
        correctAnswer: '84 Million'
    },
    {
        id: 'lc_crypto_120',
        text: 'Who founded the Litecoin (LTC) blockchain?',
        options: ['Charlie Lee', 'Satoshi Nakamoto', 'Vitalik Buterin', 'Jackson Palmer'],
        correctAnswer: 'Charlie Lee'
    },
    {
        id: 'lc_crypto_121',
        text: 'What is "Lido" in the crypto space?',
        options: ['A liquid staking protocol for Ethereum', 'A decentralized exchange', 'A hardware wallet brand', 'A crypto-friendly bank'],
        correctAnswer: 'A liquid staking protocol for Ethereum'
    },
    {
        id: 'lc_crypto_122',
        text: 'What is "stETH"?',
        options: ['A token representing staked ETH in the Lido protocol', 'A way to store ETH on a physical disk', 'A version of ETH used on Solana', 'A stablecoin linked to the Euro'],
        correctAnswer: 'A token representing staked ETH in the Lido protocol'
    },
    {
        id: 'lc_crypto_123',
        text: 'What is a "Sybil Resistance"?',
        options: ['Mechanisms like PoW or PoS that make it expensive to attack the network', 'A tool to identify scammers', 'A way to encrypt private messages', 'A feature for automatic price tracking'],
        correctAnswer: 'Mechanisms like PoW or PoS that make it expensive to attack the network'
    },
    {
        id: 'lc_crypto_124',
        text: 'What is "Compound" in DeFi?',
        options: ['An algorithmic, autonomous interest rate protocol for lending and borrowing', 'A group of crypto investors', 'A way to mix multiple coins into one', 'A physical storage for servers'],
        correctAnswer: 'An algorithmic, autonomous interest rate protocol for lending and borrowing'
    },
    {
        id: 'lc_crypto_125',
        text: 'What is "Aave"?',
        options: ['A decentralized non-custodial liquidity protocol for borrowing and lending', 'The name of a crypto exchange based in France', 'A specialized mining software', 'A term for a sudden price increase'],
        correctAnswer: 'A decentralized non-custodial liquidity protocol for borrowing and lending'
    },
    {
        id: 'lc_crypto_126',
        text: 'What is "Curve Finance"?',
        options: ['A decentralized exchange optimized for low slippage stablecoin swaps', 'A firm that designs crypto logos', 'A tool for predicting market trends with curves', 'A blockchain for fitness apps'],
        correctAnswer: 'A decentralized exchange optimized for low slippage stablecoin swaps'
    },
    {
        id: 'lc_crypto_127',
        text: 'What is "CRV"?',
        options: ['The governance token for Curve Finance', 'A type of file for storing private keys', 'A stablecoin pegged to the Pound', 'A feature for canceling transactions'],
        correctAnswer: 'The governance token for Curve Finance'
    },
    {
        id: 'lc_crypto_128',
        text: 'What is an "NFT Marketplace"?',
        options: ['A platform for buying and selling non-fungible tokens like OpenSea', 'A store that sells physical goods for crypto', 'A way to trade stocks on the blockchain', 'A specialized exchange for stablecoins'],
        correctAnswer: 'A platform for buying and selling non-fungible tokens like OpenSea'
    },
    {
        id: 'lc_crypto_129',
        text: 'What is "OpenSea"?',
        options: ['The world\'s first and largest NFT marketplace', 'A decentralized data storage network', 'A crypto wallet for mobile users', 'A service for tracking whale transactions'],
        correctAnswer: 'The world\'s first and largest NFT marketplace'
    },
    {
        id: 'lc_crypto_130',
        text: 'What is "MetaMask"?',
        options: ['A popular browser extension and mobile app for interacting with Ethereum', 'A mask worn by crypto hackers', 'A company that builds Metaverse headsets', 'A decentralized social network'],
        correctAnswer: 'A popular browser extension and mobile app for interacting with Ethereum'
    },
    {
        id: 'lc_crypto_131',
        text: 'What is a "Gateway" in blockchain?',
        options: ['A node that connects different networks or protocols', 'Your internet router', 'The login page of an exchange', 'A specialized hardware wallet'],
        correctAnswer: 'A node that connects different networks or protocols'
    },
    {
        id: 'lc_crypto_132',
        text: 'What is "Chainlink" (LINK)?',
        options: ['A decentralized oracle network that connects blockchains to real-world data', 'A way to link multiple wallets together', 'A physical chain used to secure mining rigs', 'A social network for blockchain developers'],
        correctAnswer: 'A decentralized oracle network that connects blockchains to real-world data'
    },
    {
        id: 'lc_crypto_133',
        text: 'What is "The Graph" (GRT)?',
        options: ['An indexing protocol for querying data from blockchains like Ethereum', 'A tool for drawing price charts', 'A decentralized storage solution for images', 'A way to track team progress in a project'],
        correctAnswer: 'An indexing protocol for querying data from blockchains like Ethereum'
    },
    {
        id: 'lc_crypto_134',
        text: 'What is "Polygon" (MATIC)?',
        options: ['A multi-chain scaling solution for Ethereum', 'A new cryptocurrency mascot', 'A tool for drawing 3D objects in the Metaverse', 'A decentralized file sharing app'],
        correctAnswer: 'A multi-chain scaling solution for Ethereum'
    },
    {
        id: 'lc_crypto_135',
        text: 'What is a "Gas Price"?',
        options: ['The amount of Gwei a user is willing to pay per unit of gas', 'The price of fuel at a local gas station', 'A fee for using a physical credit card', 'The cost of electricity for mining'],
        correctAnswer: 'The amount of Gwei a user is willing to pay per unit of gas'
    },
    {
        id: 'lc_crypto_136',
        text: 'What is "Gwei"?',
        options: ['A small denomination of ETH used to measure gas prices', 'A name for a crypto developer', 'A specialized wallet for games', 'A type of consensus algorithm'],
        correctAnswer: 'A small denomination of ETH used to measure gas prices'
    },
    {
        id: 'lc_crypto_137',
        text: 'What is "EIP-1559"?',
        options: ['An Ethereum upgrade that introduced a base fee and fee-burning mechanism', 'A proposal to double the supply of ETH', 'A way to ban certain wallet addresses', 'A technical standard for NFTs'],
        correctAnswer: 'An Ethereum upgrade that introduced a base fee and fee-burning mechanism'
    },
    {
        id: 'lc_crypto_138',
        text: 'Which crypto project is known as the "Internet of Blockchains"?',
        options: ['Cosmos (ATOM)', 'Bitcoin', 'Ethereum', 'Ripple'],
        correctAnswer: 'Cosmos (ATOM)'
    },
    {
        id: 'lc_crypto_139',
        text: 'What is "IBC" in the Cosmos ecosystem?',
        options: ['Inter-Blockchain Communication protocol', 'Instant Bitcoin Clearing', 'Internal Banking Connection', 'International Blockchain Council'],
        correctAnswer: 'Inter-Blockchain Communication protocol'
    },
    {
        id: 'lc_crypto_140',
        text: 'What is "Solana" known for?',
        options: ['Its high speed and low transaction costs through Proof of History', 'Being the oldest blockchain after Bitcoin', 'Only allowing smart contracts in Python', 'Having no transaction fees at all'],
        correctAnswer: 'Its high speed and low transaction costs through Proof of History'
    },
    {
        id: 'lc_crypto_141',
        text: 'What is "USDC"?',
        options: ['A fully collateralized US Dollar stablecoin', 'A crypto based on the silver price', 'A version of Bitcoin on Arbitrum', 'A specialized token for gambling'],
        correctAnswer: 'A fully collateralized US Dollar stablecoin'
    },
    {
        id: 'lc_crypto_142',
        text: 'What is "Avalanche" (AVAX)?',
        options: ['A platform for launching decentralized apps and enterprise blockchain deployments', 'A sudden drop in price', 'A cold storage solution for Bitcoin', 'A specialized mining pool'],
        correctAnswer: 'A platform for launching decentralized apps and enterprise blockchain deployments'
    },
    {
        id: 'lc_crypto_143',
        text: 'What are "Subnets" in Avalanche?',
        options: ['Customizable and independent blockchains within the Avalanche network', 'Small groups of miners', 'Private messages between nodes', 'A way to connect to a VPN'],
        correctAnswer: 'Customizable and independent blockchains within the Avalanche network'
    },
    {
        id: 'lc_crypto_144',
        text: 'What does "Farcaster" refer to?',
        options: ['A decentralized social network protocol', 'A tool for predicting market moves', 'A bridge between Ethereum and Solana', 'A specialized hardware wallet'],
        correctAnswer: 'A decentralized social network protocol'
    },
    {
        id: 'lc_crypto_145',
        text: 'What is "Lens Protocol"?',
        options: ['A decentralized social graph that empowers creators to own their content', 'A specialized scanner for hardware wallets', 'A tool for zooming into price charts', 'A feature for automatic NFT creation'],
        correctAnswer: 'A decentralized social graph that empowers creators to own their content'
    },
    {
        id: 'lc_crypto_146',
        text: 'What is "Worldcoin" (WLD)?',
        options: ['A crypto project using iris scans to provide a "Proof of Personhood"', 'A coin used for global shipping', 'A centralized bank for crypto', 'A way to pay taxes with Bitcoin'],
        correctAnswer: 'A crypto project using iris scans to provide a "Proof of Personhood"'
    },
    {
        id: 'lc_crypto_147',
        text: 'What is the "Orb" in the Worldcoin project?',
        options: ['A biometric imaging device used to verify users', 'A specialized crystal ball for traders', 'A physical coin with a hole in the middle', 'The logo of the project'],
        correctAnswer: 'A biometric imaging device used to verify users'
    },
    {
        id: 'lc_crypto_148',
        text: 'Who is the CEO of Ripple?',
        options: ['Brad Garlinghouse', 'Charles Hoskinson', 'Satoshi Nakamoto', 'Brian Armstrong'],
        correctAnswer: 'Brad Garlinghouse'
    },
    {
        id: 'lc_crypto_149',
        text: 'What is "XRP" used for?',
        options: ['A digital asset for global payments on the Ripple network', 'A specialized coin for gaming only', 'A way to vote on Ethereum upgrades', 'A tool for tracking physical assets'],
        correctAnswer: 'A digital asset for global payments on the Ripple network'
    },
    {
        id: 'lc_crypto_150',
        text: 'What is "Binance Coin" (BNB) used for?',
        options: ['Paying for fees and trading on the Binance exchange and BSC', 'Buying lunch at Binance headquarters', 'A stablecoin linked to the Yen', 'A way to recover lost passwords'],
        correctAnswer: 'Paying for fees and trading on the Binance exchange and BSC'
    },
    {
        id: 'lc_crypto_151',
        text: 'What is "Near Protocol" known for?',
        options: ['Its focus on developer usability and sharding (Nightshade)', 'Having the closest nodes to the user', 'Being a private fork of Bitcoin', 'Only working on local area networks'],
        correctAnswer: 'Its focus on developer usability and sharding (Nightshade)'
    },
    {
        id: 'lc_crypto_152',
        text: 'What is "Rainbow Bridge" in the NEAR ecosystem?',
        options: ['A bridge between Ethereum and NEAR', 'A way to send crypto via email', 'A specialized UI for colorful wallets', 'A feature for automatic price alerts'],
        correctAnswer: 'A bridge between Ethereum and NEAR'
    },
    {
        id: 'lc_crypto_153',
        text: 'What is "Cosmos SDK"?',
        options: ['A framework for building custom blockchains that are interoperable', 'A tool for designing crypto skins', 'A centralized database for miners', 'A mobile app for tracking ATOM price'],
        correctAnswer: 'A framework for building custom blockchains that are interoperable'
    },
    {
        id: 'lc_crypto_154',
        text: 'What does "Validator Slashing" aim to prevent?',
        options: ['Dishonest behavior like double-signing or being offline', 'Miners using too much power', 'Exchanges from charging too much', 'Prices from falling too fast'],
        correctAnswer: 'Dishonest behavior like double-signing or being offline'
    },
    {
        id: 'lc_crypto_155',
        text: 'What is "EigenLayer"?',
        options: ['A restaking protocol that allows ETH stakers to secure other services', 'A specialized layer for private transactions', 'A new type of consensus algorithm', 'A bridge between Bitcoin and Solana'],
        correctAnswer: 'A restaking protocol that allows ETH stakers to secure other services'
    },
    {
        id: 'lc_crypto_156',
        text: 'What is "Restaking"?',
        options: ['Using staked assets to earn additional rewards by securing other protocols', 'Removing your stake and putting it back', 'Staking two different coins at once', 'A way to cancel a stake early'],
        correctAnswer: 'Using staked assets to earn additional rewards by securing other protocols'
    },
    {
        id: 'lc_crypto_157',
        text: 'What is "Arbitrum Orbit"?',
        options: ['A framework for building custom Layer 3 blockchains on top of Arbitrum', 'A specialized game for crypto users', 'A way to track orbital satellites with blockchain', 'A feature for automatic market making'],
        correctAnswer: 'A framework for building custom Layer 3 blockchains on top of Arbitrum'
    },
    {
        id: 'lc_crypto_158',
        text: 'What is "Base" in the context of Coinbase?',
        options: ['An Ethereum Layer 2 network incubated by Coinbase', 'The headquarters of the company', 'The minimum amount of crypto you can buy', 'A stablecoin linked to the Dollar'],
        correctAnswer: 'An Ethereum Layer 2 network incubated by Coinbase'
    },
    {
        id: 'lc_crypto_159',
        text: 'Which technology stack does the Base network use?',
        options: ['The OP Stack (Optimism)', 'The ZK Stack', 'The Cosmos SDK', 'The Solana codebase'],
        correctAnswer: 'The OP Stack (Optimism)'
    },
    {
        id: 'lc_crypto_160',
        text: 'What is "Optimism" (OP)?',
        options: ['An Ethereum L2 using Optimistic Rollups', 'A mental state of being positive about prices', 'A way to send coins for free', 'The logo of the project'],
        correctAnswer: 'An Ethereum L2 using Optimistic Rollups'
    },
    {
        id: 'lc_crypto_161',
        text: 'What is "Linea"?',
        options: ['A ZK-EVM Layer 2 network developed by ConsenSys', 'A straight line on a price chart', 'A specialized mobile wallet', 'A tool for tracking network latency'],
        correctAnswer: 'A ZK-EVM Layer 2 network developed by ConsenSys'
    },
    {
        id: 'lc_crypto_162',
        text: 'What is "ConsenSys" known for?',
        options: ['Developing MetaMask and Linea', 'Launching the first crypto exchange', 'Being the owner of Bitcoin', 'A government regulator for crypto'],
        correctAnswer: 'Developing MetaMask and Linea'
    },
    {
        id: 'lc_crypto_163',
        text: 'What is "Starknet"?',
        options: ['A ZK-Rollup Layer 2 network focused on scalability', 'A specialized network for Iron Man fans', 'A way to send crypto to Mars', 'A feature for automatic trading'],
        correctAnswer: 'A ZK-Rollup Layer 2 network focused on scalability'
    },
    {
        id: 'lc_crypto_164',
        text: 'What is "Cairo" in the context of Starknet?',
        options: ['A programming language for writing STARK-provable programs', 'The capital city of Egypt', 'A specialized mobile wallet', 'A tool for tracking network nodes'],
        correctAnswer: 'A programming language for writing STARK-provable programs'
    },
    {
        id: 'lc_crypto_165',
        text: 'What is "Zksync Era"?',
        options: ['The mainnet version of zkSync ZK-Rollup', 'A new year on the crypto calendar', 'A specialized wallet for NFTs', 'A way to earn free tokens'],
        correctAnswer: 'The mainnet version of zkSync ZK-Rollup'
    },
    {
        id: 'lc_crypto_166',
        text: 'What is "Mantle Network"?',
        options: ['An Ethereum L2 with a modular architecture', 'A physical server case for nodes', 'A way to buy coins with a credit card', 'A decentralized data backup service'],
        correctAnswer: 'An Ethereum L2 with a modular architecture'
    },
    {
        id: 'lc_crypto_167',
        text: 'What is "Modular Blockchain"?',
        options: ['A blockchain that separates different layers like consensus, execution, and data availability', 'A blockchain made of Lego bricks', 'A way to swap bits of code easily', 'A feature for private messaging'],
        correctAnswer: 'A blockchain that separates different layers like consensus, execution, and data availability'
    },
    {
        id: 'lc_crypto_168',
        text: 'What is "Celestia" (TIA)?',
        options: ['The first modular data availability network', 'A specialized game on Solana', 'A stablecoin linked to the Stars', 'A way to earn rewards for being online'],
        correctAnswer: 'The first modular data availability network'
    },
    {
        id: 'lc_crypto_169',
        text: 'What is "Data Availability"?',
        options: ['Ensuring that transaction data is accessible to all network participants', 'Making sure your internet is working', 'Having a copy of your private key', 'Storing your crypto in the cloud'],
        correctAnswer: 'Ensuring that transaction data is accessible to all network participants'
    },
    {
        id: 'lc_crypto_170',
        text: 'What is "Monad"?',
        options: ['A high-performance EVM-compatible Layer 1 blockchain', 'A specialized wallet for single coins', 'A type of crypto scam', 'A way to send crypto via radio waves'],
        correctAnswer: 'A high-performance EVM-compatible Layer 1 blockchain'
    },
    {
        id: 'lc_crypto_171',
        text: 'What is "Parallel Execution"?',
        options: ['Processing multiple transactions at the same time to increase throughput', 'Running two different wallets at once', 'Mining on two computers simultaneously', 'Having two different jobs in crypto'],
        correctAnswer: 'Processing multiple transactions at the same time to increase throughput'
    },
    {
        id: 'lc_crypto_172',
        text: 'What is "Sui" (SUI)?',
        options: ['A Layer 1 blockchain designed for low latency and high scalability', 'A name for a crypto developer', 'A specialized wallet for NFTs', 'A tool for tracking price movements'],
        correctAnswer: 'A Layer 1 blockchain designed for low latency and high scalability'
    },
    {
        id: 'lc_crypto_173',
        text: 'What is "Aptos" (APT)?',
        options: ['A Layer 1 blockchain built with the Move programming language', 'A way to buy coins with a physical card', 'A specialized mining pool', 'A tool for network security'],
        correctAnswer: 'A Layer 1 blockchain built with the Move programming language'
    },
    {
        id: 'lc_crypto_174',
        text: 'What is the "Move" language?',
        options: ['A safe and expressive programming language originally developed for Libra/Diem', 'A way to move coins between wallets', 'A command for mining Bitcoin', 'A tool for migrating databases'],
        correctAnswer: 'A safe and expressive programming language originally developed for Libra/Diem'
    },
    {
        id: 'lc_crypto_175',
        text: 'What is "Jupiter" (JUP) on Solana?',
        options: ['A leading liquidity aggregator and DEX', 'A new planet in the Metaverse', 'A specialized wallet for Solana only', 'A tool for network monitoring'],
        correctAnswer: 'A leading liquidity aggregator and DEX'
    },
    {
        id: 'lc_crypto_176',
        text: 'What is "Drift Protocol" on Solana?',
        options: ['A decentralized perp exchange', 'A tool for racing games on blockchain', 'A way to send crypto slowly', 'A feature for automatic market making'],
        correctAnswer: 'A decentralized perp exchange'
    },
    {
        id: 'lc_crypto_177',
        text: 'What is "Pyth Network"?',
        options: ['A decentralized oracle for real-time market data', 'A network for Python developers', 'A specialized wallet for game assets', 'A way to buy coins with fiat'],
        correctAnswer: 'A decentralized oracle for real-time market data'
    },
    {
        id: 'lc_crypto_178',
        text: 'What is "Blast" Layer 2?',
        options: ['An Ethereum L2 that provides native yield for ETH and stablecoins', 'A sudden explosion in price', 'A specialized wallet for fast trading', 'A tool for marketing a crypto project'],
        correctAnswer: 'An Ethereum L2 that provides native yield for ETH and stablecoins'
    },
    {
        id: 'lc_crypto_179',
        text: 'What does "Native Yield" mean in the context of Blast?',
        options: ['Users earn interest on their balance automatically through staking and T-Bill protocols', 'Earning coins from your home country', 'A way to mine coins with your CPU', 'A feature for automatic price alerts'],
        correctAnswer: 'Users earn interest on their balance automatically through staking and T-Bill protocols'
    },
    {
        id: 'lc_crypto_180',
        text: 'What is "Friend.tech"?',
        options: ['A SocialFi app that allows users to buy "Keys" to access private chats', 'A tool for finding new friends in crypto', 'A decentralized dating app', 'A feature for automatic message encryption'],
        correctAnswer: 'A SocialFi app that allows users to buy "Keys" to access private chats'
    },
    {
        id: 'lc_crypto_181',
        text: 'What is "SocialFi"?',
        options: ['The intersection of social media and decentralized finance', 'A way to borrow money from friends using blockchain', 'A specialized wallet for social influencers', 'A government program for digital financial inclusion'],
        correctAnswer: 'The intersection of social media and decentralized finance'
    },
    {
        id: 'lc_crypto_182',
        text: 'What is a "Key" in the Friend.tech app?',
        options: ['A tradable asset that grants access to a user\'s private chat room', 'A password used to log in', 'A physical device for 2FA', 'A unique ID for a wallet'],
        correctAnswer: 'A tradable asset that grants access to a user\'s private chat room'
    },
    {
        id: 'lc_crypto_183',
        text: 'Which crypto project is known for its "Elastic Supply" mechanism?',
        options: ['Ampleforth (AMPL)', 'Bitcoin', 'Ethereum', 'Tether'],
        correctAnswer: 'Ampleforth (AMPL)'
    },
    {
        id: 'lc_crypto_184',
        text: 'What is a "Rebase" in an elastic supply token?',
        options: ['Automatic adjustment of the total supply based on price targets', 'A way to reset a wallet password', 'Merging two different blockchain databases', 'A feature for canceling a transaction'],
        correctAnswer: 'Automatic adjustment of the total supply based on price targets'
    },
    {
        id: 'lc_crypto_185',
        text: 'What is "Olympus DAO" (OHM) known for?',
        options: ['Introducing "Protocol Owned Liquidity" and the (3,3) meme', 'Being the first crypto based on Greek mythology', 'Launching a decentralized sports betting app', 'A specialized wallet for hardware storage'],
        correctAnswer: 'Introducing "Protocol Owned Liquidity" and the (3,3) meme'
    },
    {
        id: 'lc_crypto_186',
        text: 'What is "Protocol Owned Liquidity" (POL)?',
        options: ['When a treasury holds its own liquidity pool tokens rather than relying on users', 'When a government owns the liquidity for a coin', 'A way to lock up liquidity forever', 'A feature for automatic market making'],
        correctAnswer: 'When a treasury holds its own liquidity pool tokens rather than relying on users'
    },
    {
        id: 'lc_crypto_187',
        text: 'What happened in the "Ronin Bridge" hack of 2022?',
        options: ['Over $600 million was stolen from the Axie Infinity sidechain', 'Bitcoin was split into three different coins', 'The Ethereum network was shut down for 24 hours', 'A major exchange went bankrupt'],
        correctAnswer: 'Over $600 million was stolen from the Axie Infinity sidechain'
    },
    {
        id: 'lc_crypto_188',
        text: 'What is "Axie Infinity"?',
        options: ['A popular play-to-earn game featuring virtual creatures', 'A brand of crypto-grade hardware wallets', 'A decentralized exchange on Solana', 'A stablecoin linked to the Euro'],
        correctAnswer: 'A popular play-to-earn game featuring virtual creatures'
    },
    {
        id: 'lc_crypto_189',
        text: 'What is "SLP" in the Axie Infinity ecosystem?',
        options: ['Smooth Love Potion, an in-game reward token', 'Secure Login Protocol', 'Stable Liquidity Provider', 'Static Loop Path'],
        correctAnswer: 'Smooth Love Potion, an in-game reward token'
    },
    {
        id: 'lc_crypto_190',
        text: 'What is "Wormhole" bridge hack?',
        options: ['A $320 million exploit on the Solana-Ethereum bridge', 'A bug that allowed users to travel back in time on blockchain', 'A physical theft of servers from a data center', 'A way to send crypto via a black hole'],
        correctAnswer: 'A $320 million exploit on the Solana-Ethereum bridge'
    },
    {
        id: 'lc_crypto_191',
        text: 'Who is the "White Hat" hacker?',
        options: ['A security researcher who finds and reports bugs for the good of the network', 'A hacker who only steals from rich people', 'A person who wears a white hat while trading', 'An official employee of a crypto exchange'],
        correctAnswer: 'A security researcher who finds and reports bugs for the good of the network'
    },
    {
        id: 'lc_crypto_192',
        text: 'What is "Curve Wars"?',
        options: ['A competition among protocols to accumulate CRV and influence rewards', 'A lawsuit between two different mathematical models', 'A game where users race on curved tracks', 'A disagreement about the shape of a graph'],
        correctAnswer: 'A competition among protocols to accumulate CRV and influence rewards'
    },
    {
        id: 'lc_crypto_193',
        text: 'What is "Convex Finance" (CVX)?',
        options: ['A platform that optimizes rewards for Curve liquidity providers', 'A tool for calculating the convexity of price moves', 'A decentralized insurance protocol', 'A specialized wallet for high-value traders'],
        correctAnswer: 'A platform that optimizes rewards for Curve liquidity providers'
    },
    {
        id: 'lc_crypto_194',
        text: 'What is "veCRV"?',
        options: ['Vote-escrowed CRV, obtained by locking up CRV tokens', 'A version of CRV used in virtual reality', 'A stablecoin linked to the CRV price', 'A feature for automatic transaction signing'],
        correctAnswer: 'Vote-escrowed CRV, obtained by locking up CRV tokens'
    },
    {
        id: 'lc_crypto_195',
        text: 'What is "Snapshot" used for in crypto?',
        options: ['A gasless voting platform for DAOs', 'A way to take a photo of your wallet', 'A tool for tracking physical mining machines', 'A specialized exchange for quick trades'],
        correctAnswer: 'A gasless voting platform for DAOs'
    },
    {
        id: 'lc_crypto_196',
        text: 'What is "Gasless Voting"?',
        options: ['Voting on proposals without paying a transaction fee', 'Voting that doesn\'t require any energy', 'A way to vote via SMS', 'A feature for manual vote counting'],
        correctAnswer: 'Voting on proposals without paying a transaction fee'
    },
    {
        id: 'lc_crypto_197',
        text: 'What is "Governance Minimization"?',
        options: ['Designing protocols to require as little human intervention as possible', 'Voting to remove the government from crypto', 'A way to reduce the number of tokens needed to vote', 'A feature for automatic law enforcement'],
        correctAnswer: 'Designing protocols to require as little human intervention as possible'
    },
    {
        id: 'lc_crypto_198',
        text: 'What is "Immutable X"?',
        options: ['A Layer 2 scaling solution for NFTs on Ethereum', 'A crypto that cannot be sold once bought', 'A way to permanently delete your transaction history', 'A specialized wallet for privacy coins'],
        correctAnswer: 'A Layer 2 scaling solution for NFTs on Ethereum'
    },
    {
        id: 'lc_crypto_199',
        text: 'What is "Gods Unchained"?',
        options: ['A popular blockchain-based trading card game', 'A crypto project about mythology', 'A specialized wallet for high-value assets', 'A terminal for monitoring network status'],
        correctAnswer: 'A popular blockchain-based trading card game'
    },
    {
        id: 'lc_crypto_200',
        text: 'What is "Illuvium"?',
        options: ['An open-world RPG adventure game built on Ethereum', 'A new type of chemical element discovered via blockchain', 'A specialized exchange for rare coins', 'A tool for network security'],
        correctAnswer: 'An open-world RPG adventure game built on Ethereum'
    },
    {
        id: 'lc_crypto_201',
        text: 'What is "The Sandbox"?',
        options: ['A virtual world where players can build, own, and monetize gaming experiences', 'A physical box used for storing seeds', 'A decentralized exchange for stablecoins', 'A tool for testing smart contracts safely'],
        correctAnswer: 'A virtual world where players can build, own, and monetize gaming experiences'
    },
    {
        id: 'lc_crypto_202',
        text: 'What is "Decentraland" (MANA)?',
        options: ['An Ethereum-based 3D virtual world platform', 'A country with no central capital city', 'A specialized wallet for land titles', 'A feature for automatic market making'],
        correctAnswer: 'An Ethereum-based 3D virtual world platform'
    },
    {
        id: 'lc_crypto_203',
        text: 'What is "LAND" in the Metaverse?',
        options: ['An NFT representing a digital piece of real estate in a virtual world', 'A physical territory owned by a crypto project', 'A way to buy coins with property', 'A tool for tracking geographical data'],
        correctAnswer: 'An NFT representing a digital piece of real estate in a virtual world'
    },
    {
        id: 'lc_crypto_204',
        text: 'What is "Yuga Labs" known for?',
        options: ['Creating the Bored Ape Yacht Club (BAYC)', 'Launching the first crypto bank', 'Being a government regulator', 'Designing hardware wallets'],
        correctAnswer: 'Creating the Bored Ape Yacht Club (BAYC)'
    },
    {
        id: 'lc_crypto_205',
        text: 'What is "Otherside"?',
        options: ['The Metaverse project developed by Yuga Labs', 'A decentralized exchange for rare coins', 'A specialized wallet for privacy', 'A tool for network monitoring'],
        correctAnswer: 'The Metaverse project developed by Yuga Labs'
    },
    {
        id: 'lc_crypto_206',
        text: 'What is "ENS" (Ethereum Name Service)?',
        options: ['A decentralized naming system for Ethereum addresses (e.g., name.eth)', 'An encrypted messaging server', 'A way to send ETH via ENS email', 'A specialized exchange for domains'],
        correctAnswer: 'A decentralized naming system for Ethereum addresses (e.g., name.eth)'
    },
    {
        id: 'lc_crypto_207',
        text: 'What is ".eth" domain?',
        options: ['A username on the Ethereum blockchain linked to an address', 'An email address for crypto users only', 'A way to buy Ethereum stocks', 'A feature for automatic price alerts'],
        correctAnswer: 'A username on the Ethereum blockchain linked to an address'
    },
    {
        id: 'lc_crypto_208',
        text: 'What is "Safe" (formerly Gnosis Safe)?',
        options: ['A popular multi-sig smart contract wallet', 'A tool for checking if a coin is a scam', 'A hardware device for seed storage', 'A feature for automatic message encryption'],
        correctAnswer: 'A popular multi-sig smart contract wallet'
    },
    {
        id: 'lc_crypto_209',
        text: 'What is a "Smart Contract Wallet"?',
        options: ['A wallet that is itself a smart contract, allowing for advanced features', 'A wallet that can write code automatically', 'A wallet that belongs to a robot', 'A feature for manual transaction signing'],
        correctAnswer: 'A wallet that is itself a smart contract, allowing for advanced features'
    },
    {
        id: 'lc_crypto_210',
        text: 'What is "Account Abstraction" (ERC-4337)?',
        options: ['A way to make crypto wallets as easy to use as email accounts', 'A feature that hides your balance from the public', 'A tool for deleting old accounts', 'A way to abstract the price of a coin from its value'],
        correctAnswer: 'A way to make crypto wallets as easy to use as email accounts'
    },
    {
        id: 'lc_crypto_211',
        text: 'What is "Social Recovery" in crypto wallets?',
        options: ['Recovering access to a wallet using trusted friends instead of a seed phrase', 'Finding lost coins on social media', 'Using a Facebook login to access your crypto', 'A feature for automatic price alerts'],
        correctAnswer: 'Recovering access to a wallet using trusted friends instead of a seed phrase'
    },
    {
        id: 'lc_crypto_212',
        text: 'What is "Chain Abstraction"?',
        options: ['Making the underlying blockchain invisible to the end user', 'A way to hide which chain you are using', 'A tool for deleting old blockchains', 'A feature for automatic bridge transfers'],
        correctAnswer: 'Making the underlying blockchain invisible to the end user'
    },
    {
        id: 'lc_crypto_213',
        text: 'What is "Etherscan"?',
        options: ['The leading block explorer and search platform for Ethereum', 'A specialized lens for hardware wallets', 'A decentralized data storage network', 'A tool for network security'],
        correctAnswer: 'The leading block explorer and search platform for Ethereum'
    },
    {
        id: 'lc_crypto_214',
        text: 'What is "CoinMarketCap"?',
        options: ['A price-tracking website for cryptocurrencies', 'A specialized hat for crypto miners', 'A tool for calculating market caps physically', 'A decentralized exchange for new coins'],
        correctAnswer: 'A price-tracking website for cryptocurrencies'
    },
    {
        id: 'lc_crypto_215',
        text: 'What is "CoinGecko"?',
        options: ['A popular independent crypto data aggregator', 'A robotic lizard that trades crypto', 'A specialized wallet for small coins', 'A tool for network monitoring'],
        correctAnswer: 'A popular independent crypto data aggregator'
    },
    {
        id: 'lc_crypto_216',
        text: 'What is "Tornado Cash"?',
        options: ['A decentralized privacy-preserving protocol on Ethereum', 'A sudden storm in the crypto market', 'A way to send crypto via a tornado', 'A feature for automatic price alerts'],
        correctAnswer: 'A decentralized privacy-preserving protocol on Ethereum'
    },
    {
        id: 'lc_crypto_217',
        text: 'What are "Privacy Coins"?',
        options: ['Cryptocurrencies designed to hide transaction details and balances', 'Coins that have no public logo', 'A way to buy coins privately from a bank', 'A specialized wallet for seed storage'],
        correctAnswer: 'Cryptocurrencies designed to hide transaction details and balances'
    },
    {
        id: 'lc_crypto_218',
        text: 'What is "Dark Web" in crypto history?',
        options: ['A part of the internet often associated with early Bitcoin use like Silk Road', 'A part of the blockchain that is invisible', 'A specialized network for dark mode apps', 'A way to send coins at night'],
        correctAnswer: 'A part of the internet often associated with early Bitcoin use like Silk Road'
    },
    {
        id: 'lc_crypto_219',
        text: 'What was the "Silk Road"?',
        options: ['The first modern darknet market to use Bitcoin', 'A physical road built with crypto funds', 'A decentralized exchange for clothing', 'A feature for automatic message encryption'],
        correctAnswer: 'The first modern darknet market to use Bitcoin'
    },
    {
        id: 'lc_crypto_220',
        text: 'Who was Ross Ulbricht?',
        options: ['The creator of the Silk Road marketplace', 'The founder of Ethereum', 'The owner of Binance', 'Satoshi Nakamoto\'s real name'],
        correctAnswer: 'The creator of the Silk Road marketplace'
    },
    {
        id: 'lc_crypto_221',
        text: 'What is a "Paper Wallet"?',
        options: ['A physical document containing a private key and a public address', 'A wallet that is not real', 'A specialized storage for crypto documents', 'A feature for automatic price alerts'],
        correctAnswer: 'A physical document containing a private key and a public address'
    },
    {
        id: 'lc_crypto_222',
        text: 'What is "Hacking an Exchange"?',
        options: ['Exploiting vulnerabilities to steal crypto from a centralized platform', 'Changing the price of coins on the screen', 'Using an exchange without a password', 'A way to buy coins for free'],
        correctAnswer: 'Exploiting vulnerabilities to steal crypto from a centralized platform'
    },
    {
        id: 'lc_crypto_223',
        text: 'What is "Phishing" in crypto?',
        options: ['Tricking users into revealing their seed phrase through fake websites or emails', 'A way to catch coins in a virtual game', 'Searching for coins in a physical lake', 'A feature for automatic security alerts'],
        correctAnswer: 'Tricking users into revealing their seed phrase through fake websites or emails'
    },
    {
        id: 'lc_crypto_224',
        text: 'What is "SIM Swapping"?',
        options: ['Hijacking a victim\'s phone number to bypass SMS-based 2FA', 'Swapping two physical phones', 'A way to send coins via SMS', 'A tool for network security'],
        correctAnswer: 'Hijacking a victim\'s phone number to bypass SMS-based 2FA'
    },
    {
        id: 'lc_crypto_225',
        text: 'What is "2FA" (Two-Factor Authentication)?',
        options: ['An extra layer of security that requires two forms of identification', 'A coin that doubles its price', 'A way to send crypto twice', 'A tool for network monitoring'],
        correctAnswer: 'An extra layer of security that requires two forms of identification'
    },
    {
        id: 'lc_crypto_226',
        text: 'What is a "Hardware Security Module" (HSM)?',
        options: ['A physical device for managing digital keys and providing crypto processing', 'A specialized case for hardware wallets', 'A way to encrypt private messages', 'A feature for automatic price alerts'],
        correctAnswer: 'A physical device for managing digital keys and providing crypto processing'
    },
    {
        id: 'lc_crypto_227',
        text: 'What is "Cold Storage" primarily used for?',
        options: ['Protecting large amounts of crypto from online thefts and hacks', 'Storing coins during the winter', 'A way to earn interest on coins', 'A feature for automatic price alerts'],
        correctAnswer: 'Protecting large amounts of crypto from online thefts and hacks'
    },
    {
        id: 'lc_crypto_228',
        text: 'What is a "Multisig" account?',
        options: ['An account that requires M-of-N signatures to authorize transactions', 'An account with multiple sub-accounts', 'A way to send crypto to multiple people at once', 'A tool for network monitoring'],
        correctAnswer: 'An account that requires M-of-N signatures to authorize transactions'
    },
    {
        id: 'lc_crypto_229',
        text: 'What is an "Exit Scam"?',
        options: ['When developers disappear with investors\' money after a project launch', 'A way to exit an exchange safely', 'A specialized wallet for leaving the market', 'A feature for automatic profit taking'],
        correctAnswer: 'When developers disappear with investors\' money after a project launch'
    },
    {
        id: 'lc_crypto_230',
        text: 'What is "Pump and Dump"?',
        options: ['Artificially inflating a coin\'s price before selling off and causing a crash', 'Buying a coin and selling it immediately', 'A way to earn free tokens via Twitter', 'A feature for automatic price tracking'],
        correctAnswer: 'Artificially inflating a coin\'s price before selling off and causing a crash'
    },
    {
        id: 'lc_crypto_231',
        text: 'What is "FUD"?',
        options: ['Fear, Uncertainty, and Doubt', 'Financial Utility Distribution', 'Future Unknown Direction', 'Fast Upward Drive'],
        correctAnswer: 'Fear, Uncertainty, and Doubt'
    },
    {
        id: 'lc_crypto_232',
        text: 'What is "Moon"?',
        options: ['A slang term for a coin whose price is increasing massively', 'A specialized project about space', 'A way to send crypto via satellite', 'A decentralized exchange for rare coins'],
        correctAnswer: 'A slang term for a coin whose price is increasing massively'
    },
    {
        id: 'lc_crypto_233',
        text: 'What is "Rekt"?',
        options: ['Slang for having experienced severe financial loss from a trade', 'A specialized wallet for gaming assets', 'A tool for identifying bugs in code', 'A feature for automatic price alerts'],
        correctAnswer: 'Slang for having experienced severe financial loss from a trade'
    },
    {
        id: 'lc_crypto_234',
        text: 'What is "Diamond Hands"?',
        options: ['Someone who holds coins despite volatility and price drops', 'A person with jewelry made of Bitcoin', 'A specialized tool for mining diamonds', 'A feature for automatic profit taking'],
        correctAnswer: 'Someone who holds coins despite volatility and price drops'
    },
    {
        id: 'lc_crypto_235',
        text: 'What is "Paper Hands"?',
        options: ['Someone who sells their crypto at the first sign of a price drop', 'A person who makes their own paper wallets', 'A specialized exchange for small assets', 'A tool for network security'],
        correctAnswer: 'Someone who sells their crypto at the first sign of a price drop'
    },
    {
        id: 'lc_crypto_236',
        text: 'What is "BitConnect"?',
        options: ['An infamous Ponzi scheme that collapsed in 2018', 'A way to connect Bitcoin wallets together', 'A centralized bank for crypto', 'A feature for automatic price alerts'],
        correctAnswer: 'An infamous Ponzi scheme that collapsed in 2018'
    },
    {
        id: 'lc_crypto_237',
        text: 'What is "Carlos Matos" known for?',
        options: ['The famous shouting "BIIIIITCONNNNEEEEECT!" during a presentation', 'Being the founder of Ethereum', 'Launching the first crypto exchange', 'Designing the Bitcoin logo'],
        correctAnswer: 'The famous shouting "BIIIIITCONNNNEEEEECT!" during a presentation'
    },
    {
        id: 'lc_crypto_238',
        text: 'What is "Satoshi Nakamoto Day"?',
        options: ['Occasions where community members celebrate Bitcoin\'s birth', 'A national holiday in Japan', 'A way to earn free tokens via Twitter', 'A feature for automatic price alerts'],
        correctAnswer: 'Occasions where community members celebrate Bitcoin\'s birth'
    },
    {
        id: 'lc_crypto_239',
        text: 'What is "Bitcoin Pizza Day"?',
        options: ['May 22, commemorating the first commercial Bitcoin transaction for two pizzas', 'A day where pizza shops only accept Bitcoin', 'A national holiday in Italy', 'A specialized exchange for pizza tokens'],
        correctAnswer: 'May 22, commemorating the first commercial Bitcoin transaction for two pizzas'
    },
    {
        id: 'lc_crypto_240',
        text: 'What is "Bagholder"?',
        options: ['Someone who continues to hold a coin that has lost most of its value', 'A person who carries physical crypto wallets', 'A specialized tool for store management', 'A feature for automatic price alerts'],
        correctAnswer: 'Someone who continues to hold a coin that has lost most of its value'
    },
    {
        id: 'lc_crypto_241',
        text: 'What is "To the Moon"?',
        options: ['Hope and excitement for a coin\'s price to skyrocket', 'A specialized project about space exploration', 'A tool for predicting price moves with the moon cycle', 'A feature for automatic transaction signing'],
        correctAnswer: 'Hope and excitement for a coin\'s price to skyrocket'
    },
    {
        id: 'lc_crypto_242',
        text: 'What is "Vaporware"?',
        options: ['A project that is announced but never actually developed or released', 'A coin that has no public logo', 'A way to buy coins via email', 'A specialized wallet for new assets'],
        correctAnswer: 'A project that is announced but never actually developed or released'
    },
    {
        id: 'lc_crypto_243',
        text: 'What is "Exit Liquidity"?',
        options: ['Unsuspecting retail investors who buy coins from whales selling off', 'A way to sell your coins for cash easily', 'A specialized tool for market makers', 'A feature for manual transaction signing'],
        correctAnswer: 'Unsuspecting retail investors who buy coins from whales selling off'
    },
    {
        id: 'lc_crypto_244',
        text: 'What is "CEX" (Centralized Exchange)?',
        options: ['An exchange controlled by a single company like Binance or Coinbase', 'A decentralized data backup service', 'A specialized wallet for high-value assets', 'A tool for network security'],
        correctAnswer: 'An exchange controlled by a single company like Binance or Coinbase'
    },
    {
        id: 'lc_crypto_245',
        text: 'What is "DEX" (Decentralized Exchange)?',
        options: ['A peer-to-peer marketplace where trades occur directly on-chain', 'A centralized bank for crypto', 'A specialized exchange for hardware only', 'A feature for automatic message encryption'],
        correctAnswer: 'A peer-to-peer marketplace where trades occur directly on-chain'
    },
    {
        id: 'lc_crypto_246',
        text: 'What is "Custodial"?',
        options: ['When a third party holds and manages your private keys', 'When you go to jail for crypto crimes', 'A specialized storage for crypto documents', 'A feature for automatic price alerts'],
        correctAnswer: 'When a third party holds and manages your private keys'
    },
    {
        id: 'lc_crypto_247',
        text: 'What is "Non-Custodial"?',
        options: ['When the user has full control over their own private keys and funds', 'When you are innocent of crypto crimes', 'A specialized wallet for small assets', 'A tool for network monitoring'],
        correctAnswer: 'When the user has full control over their own private keys and funds'
    },
    {
        id: 'lc_crypto_248',
        text: 'What is "Satoshi" (the unit)?',
        options: ['The smallest denomination of Bitcoin (0.00000001 BTC)', 'The name of the Bitcoin developer', 'A specialized coin for gaming', 'A tool for network security'],
        correctAnswer: 'The smallest denomination of Bitcoin (0.00000001 BTC)'
    },
    {
        id: 'lc_crypto_249',
        text: 'What is "Fiat-to-Crypto"?',
        options: ['The process of buying crypto with traditional money like USD or EUR', 'Converting crypto into a different coin', 'A way to send coins via SMS', 'A tool for network monitoring'],
        correctAnswer: 'The process of buying crypto with traditional money like USD or EUR'
    },
    {
        id: 'lc_crypto_250',
        text: 'What is "Stablecoin Peg"?',
        options: ['Maintaining a fixed value relative to another asset like the US Dollar', 'A way to secure a coin to a physical box', 'A decentralized exchange for new coins', 'A feature for automatic price alerts'],
        correctAnswer: 'Maintaining a fixed value relative to another asset like the US Dollar'
    },
    {
        id: 'lc_crypto_251',
        text: 'What is "Cardano" (ADA)?',
        options: ['A Proof-of-Stake blockchain platforms that says it is for "changemakers, innovators, and visionaries"', 'A specialized wallet for high-value assets', 'A decentralized exchange for stablecoins', 'A tool for network monitoring'],
        correctAnswer: 'A Proof-of-Stake blockchain platforms that says it is for "changemakers, innovators, and visionaries"'
    },
    {
        id: 'lc_crypto_252',
        text: 'Who is the founder of Cardano?',
        options: ['Charles Hoskinson', 'Vitalik Buterin', 'Satoshi Nakamoto', 'Gavin Wood'],
        correctAnswer: 'Charles Hoskinson'
    },
    {
        id: 'lc_crypto_253',
        text: 'What is the name of the consensus algorithm used by Cardano?',
        options: ['Ouroboros', 'Proof of Work', 'Snowball', 'Ghost'],
        correctAnswer: 'Ouroboros'
    },
    {
        id: 'lc_crypto_254',
        text: 'What is "Polkadot" (DOT)?',
        options: ['A protocol that connects different blockchains through a central relay chain', 'A coin with a polka-dot pattern', 'A specialized exchange for fashion assets', 'A tool for network security'],
        correctAnswer: 'A protocol that connects different blockchains through a central relay chain'
    },
    {
        id: 'lc_crypto_255',
        text: 'Who is the primary founder of Polkadot?',
        options: ['Dr. Gavin Wood', 'Charles Hoskinson', 'Vitalik Buterin', 'Brian Armstrong'],
        correctAnswer: 'Dr. Gavin Wood'
    },
    {
        id: 'lc_crypto_256',
        text: 'What is a "Parachain" in the Polkadot ecosystem?',
        options: ['Individual blockchains that run in parallel and connect to the Relay Chain', 'A backup chain for security', 'A chain used for parachuting funds', 'A specialized wallet for single coins'],
        correctAnswer: 'Individual blockchains that run in parallel and connect to the Relay Chain'
    },
    {
        id: 'lc_crypto_257',
        text: 'What is "Algorand" (ALGO)?',
        options: ['A carbon-negative Layer 1 blockchain using Pure Proof of Stake', 'A specialized mining software', 'A tool for calculating algorithms', 'A decentralized data backup service'],
        correctAnswer: 'A carbon-negative Layer 1 blockchain using Pure Proof of Stake'
    },
    {
        id: 'lc_crypto_258',
        text: 'Who is the founder of Algorand?',
        options: ['Silvio Micali', 'Charles Hoskinson', 'Vitalik Buterin', 'Satoshi Nakamoto'],
        correctAnswer: 'Silvio Micali'
    },
    {
        id: 'lc_crypto_259',
        text: 'What is "Tezos" (XTZ) known for?',
        options: ['Its self-amending blockchain and on-chain governance', 'Being the fastest blockchain ever', 'Having the most stable price', 'A specialized exchange for hardware'],
        correctAnswer: 'Its self-amending blockchain and on-chain governance'
    },
    {
        id: 'lc_crypto_260',
        text: 'What is "Liquid Proof of Stake" (LPoS)?',
        options: ['The consensus mechanism used by Tezos involving delegation', 'A way to stake coins in a liquid environment', 'A tool for network monitoring', 'A feature for automatic market making'],
        correctAnswer: 'The consensus mechanism used by Tezos involving delegation'
    },
    {
        id: 'lc_crypto_261',
        text: 'What is "Cosmos" (ATOM)?',
        options: ['A network of independent parallel blockchains (The Internet of Blockchains)', 'A coin named after the universe', 'A specialized project about space', 'A decentralized exchange for new coins'],
        correctAnswer: 'A network of independent parallel blockchains (The Internet of Blockchains)'
    },
    {
        id: 'lc_crypto_262',
        text: 'What is "IBC" in the Cosmos ecosystem?',
        options: ['Inter-Blockchain Communication protocol', 'Internal Bitcoin Connector', 'International Blockchain Committee', 'Initial Block Connection'],
        correctAnswer: 'Inter-Blockchain Communication protocol'
    },
    {
        id: 'lc_crypto_263',
        text: 'What is "Near Foundation"?',
        options: ['A non-profit organization that supports the NEAR Protocol ecosystem', 'A group of miners near the user', 'A specialized storage for crypto documents', 'A feature for automatic price alerts'],
        correctAnswer: 'A non-profit organization that supports the NEAR Protocol ecosystem'
    },
    {
        id: 'lc_crypto_264',
        text: 'What is "Fantom" (FTM)?',
        options: ['A high-performance Layer 1 blockchain using a DAG-based consensus', 'A coin that disappears after a while', 'A specialized project about ghosts', 'A decentralized exchange for rare coins'],
        correctAnswer: 'A high-performance Layer 1 blockchain using a DAG-based consensus'
    },
    {
        id: 'lc_crypto_265',
        text: 'What is "Lachesis" in the Fantom network?',
        options: ['A revolutionary aBFT consensus algorithm', 'A specialized mobile wallet', 'A tool for tracking network latency', 'A feature for automatic transaction signing'],
        correctAnswer: 'A revolutionary aBFT consensus algorithm'
    },
    {
        id: 'lc_crypto_266',
        text: 'What is "Andre Cronje" known for?',
        options: ['A prolific DeFi developer associated with Yearn and Fantom', 'Being the founder of Ethereum', 'Launching the first crypto exchange', 'Designing the Bitcoin logo'],
        correctAnswer: 'A prolific DeFi developer associated with Yearn and Fantom'
    },
    {
        id: 'lc_crypto_267',
        text: 'What is "Yearn.finance" (YFI)?',
        options: ['A yield aggregator for DeFi lending protocols', 'A specialized tool for year-end accounting', 'A way to earn rewards for being online', 'A feature for automatic price alerts'],
        correctAnswer: 'A yield aggregator for DeFi lending protocols'
    },
    {
        id: 'lc_crypto_268',
        text: 'What is "SushiSwap"?',
        options: ['A decentralized multi-chain exchange originally a fork of Uniswap', 'A place where you can trade physical sushi with crypto', 'A specialized exchange for food-related coins', 'A tool for network monitoring'],
        correctAnswer: 'A decentralized multi-chain exchange originally a fork of Uniswap'
    },
    {
        id: 'lc_crypto_269',
        text: 'What was the "Vampire Attack"?',
        options: ['When SushiSwap launched by attracting Uniswap\'s liquidity through better incentives', 'A bug that allowed users to steal coins from others', 'A specialized project about vampires', 'A sudden drop in price at night'],
        correctAnswer: 'When SushiSwap launched by attracting Uniswap\'s liquidity through better incentives'
    },
    {
        id: 'lc_crypto_270',
        text: 'What is "Uniswap V3" known for?',
        options: ['Concentrated Liquidity, allowing LPs to specify price ranges', 'Being the third version of a game', 'A specialized exchange for high-value assets', 'A tool for network security'],
        correctAnswer: 'Concentrated Liquidity, allowing LPs to specify price ranges'
    },
    {
        id: 'lc_crypto_271',
        text: 'What is "Concentrated Liquidity"?',
        options: ['Providing liquidity within specific price intervals to improve capital efficiency', 'Liquidity that is gathered in one single pool', 'A way to lock up funds forever', 'A feature for automatic market making'],
        correctAnswer: 'Providing liquidity within specific price intervals to improve capital efficiency'
    },
    {
        id: 'lc_crypto_272',
        text: 'What is "Impermanent Loss"?',
        options: ['A temporary loss of funds when providing liquidity due to price changes', 'A loss of coins that cannot be seen', 'A specialized storage for crypto documents', 'A feature for automatic price tracking'],
        correctAnswer: 'A temporary loss of funds when providing liquidity due to price changes'
    },
    {
        id: 'lc_crypto_273',
        text: 'What are "Governance Tokens"?',
        options: ['Tokens that grant holders the right to vote on project decisions', 'Coins used for paying taxes', 'A specialized asset for law enforcement', 'A tool for network security'],
        correctAnswer: 'Tokens that grant holders the right to vote on project decisions'
    },
    {
        id: 'lc_crypto_274',
        text: 'What is "Compound Governance" (COMP)?',
        options: ['The token used to propose and vote on changes to the Compound protocol', 'A way to calculate interest compoundedly', 'A specialized exchange for high-value assets', 'A tool for network monitoring'],
        correctAnswer: 'The token used to propose and vote on changes to the Compound protocol'
    },
    {
        id: 'lc_crypto_275',
        text: 'What is "Aave Governance" (AAVE)?',
        options: ['When AAVE holders manage the protocol via voting', 'A way to borrow coins without any interest', 'A specialized mobile wallet', 'A tool for network security'],
        correctAnswer: 'When AAVE holders manage the protocol via voting'
    },
    {
        id: 'lc_crypto_276',
        text: 'What is "MakerDAO"?',
        options: ['A decentralized organization that manages the DAI stablecoin', 'A company that makes physical coins', 'A specialized exchange for makers of goods', 'A tool for network monitoring'],
        correctAnswer: 'A decentralized organization that manages the DAI stablecoin'
    },
    {
        id: 'lc_crypto_277',
        text: 'What is "MKR" token used for?',
        options: ['Governance and as a recapitalization resource for MakerDAO', 'Paying for everything in the Maker system', 'A stablecoin linked to the Mark', 'A specialized wallet for high-value assets'],
        correctAnswer: 'Governance and as a recapitalization resource for MakerDAO'
    },
    {
        id: 'lc_crypto_278',
        text: 'What is "MiCA" (Markets in Crypto-Assets)?',
        options: ['The European Union\'s comprehensive regulatory framework for crypto', 'A new type of mining card', 'A specialized project about mice', 'A way to pay for everything in the EU'],
        correctAnswer: 'The European Union\'s comprehensive regulatory framework for crypto'
    },
    {
        id: 'lc_crypto_279',
        text: 'What is the "SEC" in the context of US crypto?',
        options: ['Securities and Exchange Commission', 'Secure Ethereum Connector', 'Stable Exchange Committee', 'Social Economy Council'],
        correctAnswer: 'Securities and Exchange Commission'
    },
    {
        id: 'lc_crypto_280',
        text: 'Who is the Chair of the US SEC?',
        options: ['Gary Gensler', 'Jerome Powell', 'Janet Yellen', 'Brian Armstrong'],
        correctAnswer: 'Gary Gensler'
    },
    {
        id: 'lc_crypto_281',
        text: 'What is "Ripple vs SEC" case about?',
        options: ['A legal battle over whether XRP is a security', 'A disagreement about the price of Ripple', 'A fight between two different matemático models', 'A way to pay taxes with XRP'],
        correctAnswer: 'A legal battle over whether XRP is a security'
    },
    {
        id: 'lc_crypto_282',
        text: 'What is "CBDC" (Central Bank Digital Currency)?',
        options: ['A digital version of a country\'s fiat currency issued by its central bank', 'A crypto based on the silver price', 'A centralized exchange for stablecoins', 'A tool for network monitoring'],
        correctAnswer: 'A digital version of a country\'s fiat currency issued by its central bank'
    },
    {
        id: 'lc_crypto_283',
        text: 'What is "e-CNY"?',
        options: ['China\'s digital yuan, a prominent CBDC', 'A way to pay for everything in China via email', 'A specialized mobile wallet', 'A tool for network security'],
        correctAnswer: 'China\'s digital yuan, a prominent CBDC'
    },
    {
        id: 'lc_crypto_284',
        text: 'What is the "Howey Test"?',
        options: ['A standard in the US used to determine if a transaction is an "investment contract" (security)', 'A way to test if your mining rig is working', 'A specialized exam for becoming a developer', 'A tool for network monitoring'],
        correctAnswer: 'A standard in the US used to determine if a transaction is an "investment contract" (security)'
    },
    {
        id: 'lc_crypto_285',
        text: 'What is "Kyoto Protocol" in crypto context?',
        options: ['It is not directly a crypto protocol, but often discussed regarding mining sustainability', 'A way to send coins to Japan', 'A centralized exchange for carbon credits', 'A specialized wallet for environmentalists'],
        correctAnswer: 'It is not directly a crypto protocol, but often discussed regarding mining sustainability'
    },
    {
        id: 'lc_crypto_286',
        text: 'What is "Green Mining"?',
        options: ['Using renewable energy sources like solar or wind for crypto mining', 'Mining on a green-colored computer', 'A way to mine coins while recycling', 'A specialized tool for forest management'],
        correctAnswer: 'Using renewable energy sources like solar or wind for crypto mining'
    },
    {
        id: 'lc_crypto_287',
        text: 'What is "ASIC Resistance"?',
        options: ['Designing algorithms to be difficult for specialized hardware like ASICs to mine efficiently', 'A way to prevent mining rigs from catching fire', 'A specialized coating for hardware wallets', 'A tool for network security'],
        correctAnswer: 'Designing algorithms to be difficult for specialized hardware like ASICs to mine efficiently'
    },
    {
        id: 'lc_crypto_288',
        text: 'What is "Monero" (XMR) best known for?',
        options: ['Privacy and anonymity, hiding sender and receiver information', 'Being the first crypto ever', 'Having the fastest transactions', 'A specialized exchange for rare coins'],
        correctAnswer: 'Privacy and anonymity, hiding sender and receiver information'
    },
    {
        id: 'lc_crypto_289',
        text: 'What are "Ring Signatures"?',
        options: ['A technology used by Monero to hide the individual identity of participants', 'Signatures made on a physical ring', 'A way to sign messages via a group chat', 'A feature for automatic transaction signing'],
        correctAnswer: 'A technology used by Monero to hide the individual identity of participants'
    },
    {
        id: 'lc_crypto_290',
        text: 'What is "Zcash" (ZEC)?',
        options: ['A privacy-focused cryptocurrency that uses Zero-Knowledge proofs (zk-SNARKs)', 'A coin named after the letter Z', 'A specialized wallet for high-value assets', 'A tool for network security'],
        correctAnswer: 'A privacy-focused cryptocurrency that uses Zero-Knowledge proofs (zk-SNARKs)'
    },
    {
        id: 'lc_crypto_291',
        text: 'What is "Shielded Transaction" in Zcash?',
        options: ['A private transaction where details are encrypted on-chain', 'A transaction that is protected by a physical shield', 'A way to send coins via a VPS', 'A feature for automatic price alerts'],
        correctAnswer: 'A private transaction where details are encrypted on-chain'
    },
    {
        id: 'lc_crypto_292',
        text: 'What is "Technical Analysis" (TA)?',
        options: ['Evaluating assets by analyzing statistics generated by market activity', 'Evaluating a project\'s code only', 'A way to test if your mining rig is working', 'A specialized exchange for high-volume traders'],
        correctAnswer: 'Evaluating assets by analyzing statistics generated by market activity'
    },
    {
        id: 'lc_crypto_293',
        text: 'What is a "Candlestick Chart"?',
        options: ['A type of price chart that shows high, low, open and close prices for a period', 'A chart showing the price of candles', 'A specialized lens for hardware wallets', 'A tool for predicting moves with fire cycles'],
        correctAnswer: 'A type of price chart that shows high, low, open and close prices for a period'
    },
    {
        id: 'lc_crypto_294',
        text: 'What is or what does "RSI" stand for?',
        options: ['Relative Strength Index', 'Random Stock Identifier', 'Real Secure Investment', 'Remote Server Integration'],
        correctAnswer: 'Relative Strength Index'
    },
    {
        id: 'lc_crypto_295',
        text: 'What is "MACD"?',
        options: ['Moving Average Convergence Divergence', 'Multiple Asset Crypto Drive', 'Main Account Currency Display', 'Minimum Alert Connection Delay'],
        correctAnswer: 'Moving Average Convergence Divergence'
    },
    {
        id: 'lc_crypto_296',
        text: 'What is "Moving Average" (MA)?',
        options: ['A common indicator that smooths out price data to help identify trends', 'A coin that moves on its own', 'A specialized tool for predicting movements', 'A feature for automatic price alerts'],
        correctAnswer: 'A common indicator that smooths out price data to help identify trends'
    },
    {
        id: 'lc_crypto_297',
        text: 'What is "Golden Cross"?',
        options: ['A bullish signal when a short-term moving average crosses above a long-term one', 'A specialized cross made of gold coins', 'A way to earn free tokens via Twitter', 'A feature for automatic transaction signing'],
        correctAnswer: 'A bullish signal when a short-term moving average crosses above a long-term one'
    },
    {
        id: 'lc_crypto_298',
        text: 'What is "Death Cross"?',
        options: ['A bearish signal when a short-term moving average crosses below a long-term one', 'A sign that the market is dying', 'A specialized tool for predicting crashes', 'A feature for manual transaction signing'],
        correctAnswer: 'A bearish signal when a short-term moving average crosses below a long-term one'
    },
    {
        id: 'lc_crypto_299',
        text: 'What is "Support" in trading?',
        options: ['A price level where a downtrend tends to pause due to concentration of demand', 'Getting help from customer support', 'A feeling of being supported by a coin', 'A feature for automatic price alerts'],
        correctAnswer: 'A price level where a downtrend tends to pause due to concentration of demand'
    },
    {
        id: 'lc_crypto_300',
        text: 'What is "Resistance" in trading?',
        options: ['A price level where an uptrend tends to pause due to concentration of supply', 'Fighting against the market', 'A sign that the price will never go up', 'A tool for network security'],
        correctAnswer: 'A price level where an uptrend tends to pause due to concentration of supply'
    },
    {
        id: 'lc_crypto_301',
        text: 'What is "Bollinger Bands"?',
        options: ['A volatility indicator consisting of a moving average and two standard deviations', 'A musical band of crypto miners', 'A specialized storage for crypto documents', 'A feature for automatic price tracking'],
        correctAnswer: 'A volatility indicator consisting of a moving average and two standard deviations'
    },
    {
        id: 'lc_crypto_302',
        text: 'What is "Market Cap"?',
        options: ['The total market value of a cryptocurrency (Price x Circulating Supply)', 'A physical cap with a logo', 'The maximum amount of money in the world', 'A specialized exchange for high-value assets'],
        correctAnswer: 'The total market value of a cryptocurrency (Price x Circulating Supply)'
    },
    {
        id: 'lc_crypto_303',
        text: 'What is "Fully Diluted Valuation" (FDV)?',
        options: ['The market cap if the entire max supply of a coin was circulating', 'When a coin is mixed with water', 'A way to calculate the value of a dead project', 'A feature for automatic profit taking'],
        correctAnswer: 'The market cap if the entire max supply of a coin was circulating'
    },
    {
        id: 'lc_crypto_304',
        text: 'What are "Whales"?',
        options: ['Individuals or entities that hold immense amounts of a certain cryptocurrency', 'Large aquatic mammals', 'A specialized project about the ocean', 'A decentralized exchange for rare coins'],
        correctAnswer: 'Individuals or entities that hold immense amounts of a certain cryptocurrency'
    },
    {
        id: 'lc_crypto_305',
        text: 'What is "Arbitrage"?',
        options: ['Buying an asset in one market and simultaneously selling it in another for profit', 'A way to settle legal disputes', 'A specialized tool for high-value trades', 'A feature for automatic market making'],
        correctAnswer: 'Buying an asset in one market and simultaneously selling it in another for profit'
    },
    {
        id: 'lc_crypto_306',
        text: 'What is "Slippage"?',
        options: ['The difference between the expected price of a trade and the actual price it executes at', 'When your hardware wallet falls on the floor', 'A sudden drop in price', 'A feature for manual transaction signing'],
        correctAnswer: 'The difference between the expected price of a trade and the actual price it executes at'
    },
    {
        id: 'lc_crypto_307',
        text: 'What is "Order Book"?',
        options: ['A list of buy and sell orders for a particular asset over various prices', 'A physical book used for taking orders at a restaurant', 'A specialized project about reading', 'A decentralized exchange for new coins'],
        correctAnswer: 'A list of buy and sell orders for a particular asset over various prices'
    },
    {
        id: 'lc_crypto_308',
        text: 'What is "Spread" in an order book?',
        options: ['The difference between the highest bid price and the lowest ask price', 'Spreading your coins across many wallets', 'A way to pay for everything via email', 'A specialized tool for network monitoring'],
        correctAnswer: 'The difference between the highest bid price and the lowest ask price'
    },
    {
        id: 'lc_crypto_309',
        text: 'What is "Market Order"?',
        options: ['An order to buy or sell an asset immediately at the best available current price', 'An order from a ghost in the market', 'A way to buy coins at a physical market', 'A feature for automatic security alerts'],
        correctAnswer: 'An order to buy or sell an asset immediately at the best available current price'
    },
    {
        id: 'lc_crypto_310',
        text: 'What is "Limit Order"?',
        options: ['An order to buy or sell an asset at a specific price or better', 'An order that has a maximum limit on it', 'A way to limit your losses in a game', 'A feature for manual transaction signing'],
        correctAnswer: 'An order to buy or sell an asset at a specific price or better'
    },
    {
        id: 'lc_crypto_311',
        text: 'What is "Stop-Loss"?',
        options: ['An order to sell an asset once it reaches a certain price to prevent further loss', 'A way to stop losing in a crypto game', 'A specialized wallet for new investors', 'A tool for network security'],
        correctAnswer: 'An order to sell an asset once it reaches a certain price to prevent further loss'
    },
    {
        id: 'lc_crypto_312',
        text: 'What is "Take-Profit"?',
        options: ['An order that automatically closes a position once it reaches a определённый profit target', 'Taking money from your friends after a trade', 'A specialized tool for market makers', 'A feature for automatic profit taking'],
        correctAnswer: 'An order that automatically closes a position once it reaches a определённый profit target'
    },
    {
        id: 'lc_crypto_313',
        text: 'What is "Leverage" in trading?',
        options: ['Borrowing funds to increase your trading position and potential returns (and risks)', 'Using a physical lever to open a hardware wallet', 'A specialized tool for mining rigs', 'A feature for automatic price alerts'],
        correctAnswer: 'Borrowing funds to increase your trading position and potential returns (and risks)'
    },
    {
        id: 'lc_crypto_314',
        text: 'What is "Margin Call"?',
        options: ['When a broker demands more funds from a trader because their account value has fallen too low', 'A call from a person named Margin', 'A sign that the market is about to crash', 'A tool for network monitoring'],
        correctAnswer: 'When a broker demands more funds from a trader because their account value has fallen too low'
    },
    {
        id: 'lc_crypto_315',
        text: 'What is "Liquidation" in leveraged trading?',
        options: ['When an exchange automatically closes a position because it has run out of collateral', 'When your coins turn into water', 'A specialized process for cleaning mining rigs', 'A feature for manual transaction signing'],
        correctAnswer: 'When an exchange automatically closes a position because it has run out of collateral'
    },
    {
        id: 'lc_crypto_316',
        text: 'What is "Long Position"?',
        options: ['A trade where you profit if the price of the asset goes UP', 'A coin with a long name', 'A trade that takes a long time to finish', 'A specialized wallet for long-term storage'],
        correctAnswer: 'A trade where you profit if the price of the asset goes UP'
    },
    {
        id: 'lc_crypto_317',
        text: 'What is "Short Position"?',
        options: ['A trade where you profit if the price of the asset goes DOWN', 'A coin with a short name', 'A trade that finishes very quickly', 'A specialized exchange for small assets'],
        correctAnswer: 'A trade where you profit if the price of the asset goes DOWN'
    },
    {
        id: 'lc_crypto_318',
        text: 'What is a "Stablecoin"?',
        options: ['A cryptocurrency whose value is tied to another asset like the US dollar', 'A coin that never moves its price', 'A specialized asset for horse stables', 'A tool for network security'],
        correctAnswer: 'A cryptocurrency whose value is tied to another asset like the US dollar'
    },
    {
        id: 'lc_crypto_319',
        text: 'What is "Tether" (USDT)?',
        options: ['The most widely used and oldest stablecoin in the world', 'A specialized rope for mining rigs', 'A way to tether your phone to your computer', 'A feature for automatic price alerts'],
        correctAnswer: 'The most widely used and oldest stablecoin in the world'
    },
    {
        id: 'lc_crypto_320',
        text: 'What is "BUSD"?',
        options: ['Binance USD, a stablecoin formerly issued by Paxos and Binance', 'A coin used for paying bus fares', 'A specialized exchange for transportation', 'A tool for network monitoring'],
        correctAnswer: 'Binance USD, a stablecoin formerly issued by Paxos and Binance'
    },
    {
        id: 'lc_crypto_321',
        text: 'What is "Render Network" (RNDR)?',
        options: ['A decentralized GPU rendering platform on Ethereum/Solana', 'A tool for rendering 3D graphics in a browser', 'A specialized project about visual effects', 'A decentralized exchange for design assets'],
        correctAnswer: 'A decentralized GPU rendering platform on Ethereum/Solana'
    },
    {
        id: 'lc_crypto_322',
        text: 'What is "Bittensor" (TAO)?',
        options: ['A peer-to-peer intelligence market that incentives AI model training', 'A specialized project about brain research', 'A way to send crypto via a neural network', 'A tool for network monitoring'],
        correctAnswer: 'A peer-to-peer intelligence market that incentives AI model training'
    },
    {
        id: 'lc_crypto_323',
        text: 'What is "Fetch.ai" (FET)?',
        options: ['An open-access, decentralized machine learning network for smart infrastructure', 'A tool for finding lost crypto wallets', 'A specialized project about robotics', 'A decentralized exchange for IoT data'],
        correctAnswer: 'An open-access, decentralized machine learning network for smart infrastructure'
    },
    {
        id: 'lc_crypto_324',
        text: 'What is "DePIN"?',
        options: ['Decentralized Physical Infrastructure Networks', 'Data Encryption Policy Internal Network', 'Digital Electronic Payment Integrated Node', 'Decentralized Peer-to-Peer Insurance Network'],
        correctAnswer: 'Decentralized Physical Infrastructure Networks'
    },
    {
        id: 'lc_crypto_325',
        text: 'What is "Helium" (HNT)?',
        options: ['A decentralized wireless network for IoT devices', 'A coin named after a gas', 'A specialized project about space', 'A tool for network security'],
        correctAnswer: 'A decentralized wireless network for IoT devices'
    },
    {
        id: 'lc_crypto_326',
        text: 'What is "Hivemapper" (HONEY)?',
        options: ['A decentralized mapping network powered by dashcams', 'A way to track honey bees with blockchain', 'A specialized UI for drone controllers', 'A tool for network monitoring'],
        correctAnswer: 'A decentralized mapping network powered by dashcams'
    },
    {
        id: 'lc_crypto_327',
        text: 'What is "Filecoin" (FIL)?',
        options: ['A decentralized storage network where users rent out their spare disk space', 'A coin used for paying legal fees', 'A specialized project about digital files', 'A decentralized exchange for storage assets'],
        correctAnswer: 'A decentralized storage network where users rent out their spare disk space'
    },
    {
        id: 'lc_crypto_328',
        text: 'What is "Arweave" (AR)?',
        options: ['A protocol for permanent, decentralized data storage (the "Permaweb")', 'A way to weave multiple blockchains together', 'A specialized mobile wallet', 'A tool for network security'],
        correctAnswer: 'A protocol for permanent, decentralized data storage (the "Permaweb")'
    },
    {
        id: 'lc_crypto_329',
        text: 'What is "Permaweb"?',
        options: ['A permanent version of the web built on top of Arweave', 'A web that is always online', 'A specialized project about spiders', 'A tool for network monitoring'],
        correctAnswer: 'A permanent version of the web built on top of Arweave'
    },
    {
        id: 'lc_crypto_330',
        text: 'What is "IPFS" (InterPlanetary File System)?',
        options: ['A peer-to-peer hypermedia protocol for decentralized storage', 'A specialized internet for Mars', 'A way to send files between planets', 'A feature for automatic price alerts'],
        correctAnswer: 'A peer-to-peer hypermedia protocol for decentralized storage'
    },
    {
        id: 'lc_crypto_331',
        text: 'What is "Sia" (SC)?',
        options: ['A leading decentralized cloud storage platform', 'A coin named after a pop star', 'A specialized mobile wallet', 'A tool for network monitoring'],
        correctAnswer: 'A leading decentralized cloud storage platform'
    },
    {
        id: 'lc_crypto_332',
        text: 'What happened with the "Terra LUNA" ecosystem in 2022?',
        options: ['An algorithmic stablecoin (UST) de-pegged, causing a total collapse', 'It was sold to Google', 'It became the largest crypto network in the world', 'A major update made it super fast'],
        correctAnswer: 'An algorithmic stablecoin (UST) de-pegged, causing a total collapse'
    },
    {
        id: 'lc_crypto_333',
        text: 'Who is Do Kwon?',
        options: ['The co-founder of Terraform Labs behind LUNA/UST', 'Developing MetaMask and Linea', 'Launching the first crypto exchange', 'Designing the Bitcoin logo'],
        correctAnswer: 'The co-founder of Terraform Labs behind LUNA/UST'
    },
    {
        id: 'lc_crypto_334',
        text: 'What is "FTX"?',
        options: ['A major cryptocurrency exchange that filed for bankruptcy in 2022', 'A specialized project about aircraft', 'A decentralized exchange for futures', 'A tool for network monitoring'],
        correctAnswer: 'A major cryptocurrency exchange that filed for bankruptcy in 2022'
    },
    {
        id: 'lc_crypto_335',
        text: 'Who is Sam Bankman-Fried (SBF)?',
        options: ['The former CEO of FTX convicted of massive fraud', 'The founder of Ethereum', 'Developing Bitcoin', 'A famous crypto trader on YouTube'],
        correctAnswer: 'The former CEO of FTX convicted of massive fraud'
    },
    {
        id: 'lc_crypto_336',
        text: 'What is "Alameda Research"?',
        options: ['A quantitative trading firm closely linked to FTX', 'A group of scientists researching blockchain', 'A specialized project about geography', 'A feature for automatic market making'],
        correctAnswer: 'A quantitative trading firm closely linked to FTX'
    },
    {
        id: 'lc_crypto_337',
        text: 'What is "CZ" known for?',
        options: ['Changpeng Zhao, the founder and former CEO of Binance', 'Being the creator of the Silk Road', 'A famous hacker on the dark web', 'Designing hardware wallets'],
        correctAnswer: 'Changpeng Zhao, the founder and former CEO of Binance'
    },
    {
        id: 'lc_crypto_338',
        text: 'What are "SAFU" funds?',
        options: ['Secure Asset Fund for Users (a Binance insurance fund)', 'Stable Asset Future Unit', 'Socially Aware Financial Union', 'Standardized Anonymous File Unit'],
        correctAnswer: 'Secure Asset Fund for Users (a Binance insurance fund)'
    },
    {
        id: 'lc_crypto_339',
        text: 'What does "Funds are SAFU" mean in crypto culture?',
        options: ['A meme and reassurance that user funds are protected and safe', 'A way to say your wallet is empty', 'A feature for automatic transaction signing', 'A specialized exchange for insurance'],
        correctAnswer: 'A meme and reassurance that user funds are protected and safe'
    },
    {
        id: 'lc_crypto_340',
        text: 'What is "Crypto.com" (CRO) famous for?',
        options: ['Buying the naming rights to the Staples Center in LA', 'Being the first crypto wallet ever', 'A specialized project about visual effects', 'A decentralized exchange for designers'],
        correctAnswer: 'Buying the naming rights to the Staples Center in LA'
    },
    {
        id: 'lc_crypto_341',
        text: 'What is "Cronos" (CRO)?',
        options: ['An Ethereum-compatible blockchain developed by Crypto.com', 'A specialized project about time', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'An Ethereum-compatible blockchain developed by Crypto.com'
    },
    {
        id: 'lc_crypto_342',
        text: 'What is "Polygon" (MATIC) best known for?',
        options: ['A Layer 2 scaling solution for Ethereum (Sidechain)', 'A specialized project about geometry', 'A way to buy coins with a physical card', 'A tool for network security'],
        correctAnswer: 'A Layer 2 scaling solution for Ethereum (Sidechain)'
    },
    {
        id: 'lc_crypto_343',
        text: 'What is "MATIC" being rebranded to?',
        options: ['POL', 'ETH2', 'ZKE', 'PLG'],
        correctAnswer: 'POL'
    },
    {
        id: 'lc_crypto_344',
        text: 'What is "Polygon zkEVM"?',
        options: ['A zero-knowledge rollup that is fully compatible with Ethereum smart contracts', 'A specialized project about mathematics', 'A way to send crypto via email', 'A decentralized exchange for new coins'],
        correctAnswer: 'A zero-knowledge rollup that is fully compatible with Ethereum smart contracts'
    },
    {
        id: 'lc_crypto_345',
        text: 'What is "Layer 3" (L3)?',
        options: ['An application-specific blockchain built on top of Layer 2 solutions', 'A layer of security in a mobile app', 'A specialized project about clothing', 'A tool for network monitoring'],
        correctAnswer: 'An application-specific blockchain built on top of Layer 2 solutions'
    },
    {
        id: 'lc_crypto_346',
        text: 'What is "Degen" culture?',
        options: ['A subset of investors pursuing high-risk, speculative trades ("degenerates")', 'A group of developers who work at night', 'A specialized project about visual effects', 'A decentralized exchange for gaming assets'],
        correctAnswer: 'A subset of investors pursuing high-risk, speculative trades ("degenerates")'
    },
    {
        id: 'lc_crypto_347',
        text: 'What is "Base" blockchain?',
        options: ['An Ethereum L2 incubated by Coinbase', 'A specialized project about maps', 'A way to buy coins with a physical card', 'A tool for network security'],
        correctAnswer: 'An Ethereum L2 incubated by Coinbase'
    },
    {
        id: 'lc_crypto_348',
        text: 'What is "Warpcast"?',
        options: ['The main client interface for the Farcaster protocol', 'A way to warp coins between wallets', 'A specialized project about sci-fi', 'A decentralized exchange for social data'],
        correctAnswer: 'The main client interface for the Farcaster protocol'
    },
    {
        id: 'lc_crypto_349',
        text: 'What are "Farcaster Casters"?',
        options: ['Users who post messages on the Farcaster network', 'A specialized tool for casting spells', 'A way to earn rewards for being online', 'A feature for automatic price alerts'],
        correctAnswer: 'Users who post messages on the Farcaster network'
    },
    {
        id: 'lc_crypto_350',
        text: 'What is "Degen Chain"?',
        options: ['A Layer 3 network on Base specifically for memecoin trading', 'A chain that is constantly breaking', 'A specialized project about high-value assets', 'A tool for network monitoring'],
        correctAnswer: 'A Layer 3 network on Base specifically for memecoin trading'
    },
    {
        id: 'lc_crypto_351',
        text: 'What is "EIP-4844" (Proto-Danksharding)?',
        options: ['A major Ethereum upgrade that significantly reduces Layer 2 transaction costs', 'A specialized project about sharks', 'A way to send crypto via email', 'A decentralized exchange for storage assets'],
        correctAnswer: 'A major Ethereum upgrade that significantly reduces Layer 2 transaction costs'
    },
    {
        id: 'lc_crypto_352',
        text: 'What are "Blobs" in the context of EIP-4844?',
        options: ['Efficient data storage containers that help lower L2 fees', 'A specialized project about visual effects', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'Efficient data storage containers that help lower L2 fees'
    },
    {
        id: 'lc_crypto_353',
        text: 'What is "Danksharding"?',
        options: ['A scalable sharding design proposed for Ethereum', 'A specialized project about visual effects', 'A way to send crypto to the moon', 'A decentralized exchange for designers'],
        correctAnswer: 'A scalable sharding design proposed for Ethereum'
    },
    {
        id: 'lc_crypto_354',
        text: 'What is a "Sybil Attack"?',
        options: ['When an attacker creates many fake identities to gain disproportionate influence', 'A sudden storm in the crypto market', 'A way to send crypto twice', 'A tool for network monitoring'],
        correctAnswer: 'When an attacker creates many fake identities to gain disproportionate influence'
    },
    {
        id: 'lc_crypto_355',
        text: 'What is "Gitcoin Passport"?',
        options: ['A sybil-resistance tool that aggregates digital credentials', 'A physical document for crypto travel', 'A specialized mobile wallet', 'A tool for network security'],
        correctAnswer: 'A sybil-resistance tool that aggregates digital credentials'
    },
    {
        id: 'lc_crypto_356',
        text: 'What is "Quadratic Funding"?',
        options: ['A mechanism where community donations are matched by a central pool non-linearly', 'A way to calculate interest quadratically', 'A specialized tool for high-value trades', 'A feature for automatic price alerts'],
        correctAnswer: 'A mechanism where community donations are matched by a central pool non-linearly'
    },
    {
        id: 'lc_crypto_357',
        text: 'What is "Retroactive Public Goods Funding" (RetroPGF)?',
        options: ['Rewarding projects after they have already provided value to the ecosystem', 'A way to buy coins with property', 'A specialized exchange for high-volume traders', 'A feature for manual transaction signing'],
        correctAnswer: 'Rewarding projects after they have already provided value to the ecosystem'
    },
    {
        id: 'lc_crypto_358',
        text: 'What is "StarkEx"?',
        options: ['A Layer 2 scalability engine on Ethereum developed by StarkWare', 'A specialized project about science', 'A way to send crypto via email', 'A decentralized exchange for new coins'],
        correctAnswer: 'A Layer 2 scalability engine on Ethereum developed by StarkWare'
    },
    {
        id: 'lc_crypto_359',
        text: 'What is "dYdX"?',
        options: ['A popular decentralized exchange for perpetual contracts (futures)', 'A math equation about the price moves', 'A specialized project about visual effects', 'A decentralized exchange for design assets'],
        correctAnswer: 'A popular decentralized exchange for perpetual contracts (futures)'
    },
    {
        id: 'lc_crypto_360',
        text: 'What is "GMX"?',
        options: ['A decentralized spot and perpetual exchange on Arbitrum and Avalanche', 'A coin named after a car', 'A specialized mobile wallet', 'A tool for network monitoring'],
        correctAnswer: 'A decentralized spot and perpetual exchange on Arbitrum and Avalanche'
    },
    {
        id: 'lc_crypto_361',
        text: 'What is "Hyperliquid"?',
        options: ['A high-performance L1 blockchain for trading perps', 'A coin that never dries', 'A specialized project about water', 'A tool for network security'],
        correctAnswer: 'A high-performance L1 blockchain for trading perps'
    },
    {
        id: 'lc_crypto_362',
        text: 'What is "Jupiter Perps"?',
        options: ['A perpetual trading platform on Solana within the Jupiter ecosystem', 'A specialized project about high-value assets', 'A way to send crypto via email', 'A feature for automatic transaction signing'],
        correctAnswer: 'A perpetual trading platform on Solana within the Jupiter ecosystem'
    },
    {
        id: 'lc_crypto_363',
        text: 'What is "Ethena" (USDe)?',
        options: ['A synthetic dollar protocol (stablecoin-like) using delta-neutral hedging', 'A coin named after the goddess Athena', 'A specialized project about mythology', 'A decentralized exchange for stablecoins'],
        correctAnswer: 'A synthetic dollar protocol (stablecoin-like) using delta-neutral hedging'
    },
    {
        id: 'lc_crypto_364',
        text: 'What is "Delta Neutral Hedging"?',
        options: ['Protecting against price changes by holding equal long and short positions', 'Hiding your balance from the public', 'A way to calculate interest non-linearly', 'A specialized tool for market makers'],
        correctAnswer: 'Protecting against price changes by holding equal long and short positions'
    },
    {
        id: 'lc_crypto_365',
        text: 'What are "Points" in modern crypto protocols?',
        options: ['Off-chain numeric rewards often used to determine future airdrop eligibility', 'Wait points during a transaction', 'A way to score your wallet against others', 'A tool for network monitoring'],
        correctAnswer: 'Off-chain numeric rewards often used to determine future airdrop eligibility'
    },
    {
        id: 'lc_crypto_366',
        text: 'What is "Yield Farming"?',
        options: ['Providing liquidity to DeFi protocols to earn rewards in the form of tokens', 'Planting physical coins in a garden', 'A specialized project about agriculture', 'A decentralized exchange for food assets'],
        correctAnswer: 'Providing liquidity to DeFi protocols to earn rewards in the form of tokens'
    },
    {
        id: 'lc_crypto_367',
        text: 'What is "Liquidity Mining"?',
        options: ['A common way to distribute new tokens to users who provide liquidity', 'Mining for coins in a liquid environment', 'A specialized tool for market makers', 'A feature for manual transaction signing'],
        correctAnswer: 'A common way to distribute new tokens to users who provide liquidity'
    },
    {
        id: 'lc_crypto_368',
        text: 'What is "Total Value Locked" (TVL)?',
        options: ['The total amount of assets currently staked or locked in a DeFi protocol', 'The total number of coins in the world', 'The value of coins that have been lost forever', 'A specialized tool for store management'],
        correctAnswer: 'The total amount of assets currently staked or locked in a DeFi protocol'
    },
    {
        id: 'lc_crypto_369',
        text: 'What is "DeFi Llama"?',
        options: ['A popular crypto data platform focused on DeFi metrics', 'A specialized project about llamas', 'A robotic animal that trades crypto', 'A tool for network monitoring'],
        correctAnswer: 'A popular crypto data platform focused on DeFi metrics'
    },
    {
        id: 'lc_crypto_370',
        text: 'What is "The Merge" in simple terms?',
        options: ['Ethereum becoming Proof of Stake', 'Bitcoin and Ethereum joining together', 'The first time an NFT was sold on Solana', 'A major hack that happened in 2021'],
        correctAnswer: 'Ethereum becoming Proof of Stake'
    },
    {
        id: 'lc_crypto_371',
        text: 'What is "Proof of Stake" (PoS)?',
        options: ['Validators secure the network by locking up (staking) their coins', 'Miners secure the network with high computing power', 'A way to earn coins by being social', 'A tool for network monitoring'],
        correctAnswer: 'Validators secure the network by locking up (staking) their coins'
    },
    {
        id: 'lc_crypto_372',
        text: 'What is "Proof of Work" (PoW)?',
        options: ['Miners solve complex mathematical problems to secure the network', 'Miners earn coins by doing physical work', 'A way to prove you have many coins', 'A tool for network security'],
        correctAnswer: 'Miners solve complex mathematical problems to secure the network'
    },
    {
        id: 'lc_crypto_373',
        text: 'What is "Validator"?',
        options: ['A node responsible for verifying transactions and securing a PoS blockchain', 'A person who checks the price of coins', 'A specialized tool for mining rigs', 'A feature for automatic security alerts'],
        correctAnswer: 'A node responsible for verifying transactions and securing a PoS blockchain'
    },
    {
        id: 'lc_crypto_374',
        text: 'What is "Delegation" in PoS?',
        options: ['Assigning your staking power to a validator while keeping your funds', 'Sending your coins to a friend to hold', 'A specialized tool for high-value assets', 'A feature for automatic market making'],
        correctAnswer: 'Assigning your staking power to a validator while keeping your funds'
    },
    {
        id: 'lc_crypto_375',
        text: 'What is "Unstaking"?',
        options: ['The process of withdrawing your staked assets, often with a waiting period', 'Taking your hardware wallet out of a box', 'Selling your coins at a loss', 'A tool for network monitoring'],
        correctAnswer: 'The process of withdrawing your staked assets, often with a waiting period'
    },
    {
        id: 'lc_crypto_376',
        text: 'What is "Mempool"?',
        options: ['A "waiting room" for unconfirmed transactions before being added to a block', 'A specialized project about memories', 'A way to store coins in a pool', 'A feature for automatic price alerts'],
        correctAnswer: 'A "waiting room" for unconfirmed transactions before being added to a block'
    },
    {
        id: 'lc_crypto_377',
        text: 'What is a "Block Header"?',
        options: ['The part of a block that summarizes everything inside it', 'A physical hat worn by miners', 'The first line of a smart contract', 'A tool for network security'],
        correctAnswer: 'The part of a block that summarizes everything inside it'
    },
    {
        id: 'lc_crypto_378',
        text: 'What is "Merkle Tree"?',
        options: ['A mathematical structure used to efficiently verify data in a block', 'A tree planted with crypto profits', 'A specialized project about nature', 'A robotic structure for mining'],
        correctAnswer: 'A mathematical structure used to efficiently verify data in a block'
    },
    {
        id: 'lc_crypto_379',
        text: 'What is "Finality"?',
        options: ['The point at which a transaction is considered permanent and irreversible', 'The end of a price crash', 'A specialized tool for law enforcement', 'A feature for automatic profit taking'],
        correctAnswer: 'The point at which a transaction is considered permanent and irreversible'
    },
    {
        id: 'lc_crypto_380',
        text: 'What is "Reentrancy Attack"?',
        options: ['A common smart contract vulnerability where an external call re-executes original code', 'A bug that allowed users to enter a wallet twice', 'A specialized project about science', 'A feature for automatic market making'],
        correctAnswer: 'A common smart contract vulnerability where an external call re-executes original code'
    },
    {
        id: 'lc_crypto_381',
        text: 'What is "Rug Pull"?',
        options: ['When developers abandon a project and run away with investors\' funds', 'A specialized project about carpets', 'A sudden drop in price', 'A feature for automatic profit taking'],
        correctAnswer: 'When developers abandon a project and run away with investors\' funds'
    },
    {
        id: 'lc_crypto_382',
        text: 'What is "Honeypot" in crypto scams?',
        options: ['A smart contract designed to trap users\' funds so they can\'t be withdrawn', 'A jar of honey with a Bitcoin logo', 'A specialized project about bees', 'A decentralized exchange for new coins'],
        correctAnswer: 'A smart contract designed to trap users\' funds so they can\'t be withdrawn'
    },
    {
        id: 'lc_crypto_383',
        text: 'What is "Dusting Attack"?',
        options: ['Sending tiny amounts of crypto to many wallets to track and de-anonymize owners', 'A sudden storm of dust in the desert', 'A way to clean your hardware wallet', 'A tool for network security'],
        correctAnswer: 'Sending tiny amounts of crypto to many wallets to track and de-anonymize owners'
    },
    {
        id: 'lc_crypto_384',
        text: 'What is a "Malicious Approval"?',
        options: ['Granting a dapp permission to spend your tokens, which it then steals', 'Approving a bad trade on an exchange', 'A specialized project about high-value assets', 'A feature for automatic security alerts'],
        correctAnswer: 'Granting a dapp permission to spend your tokens, which it then steals'
    },
    {
        id: 'lc_crypto_385',
        text: 'What is "Revoke.cash" used for?',
        options: ['A tool to check and revoke token allowances to dapps', 'A way to get your money back from a bank', 'A specialized mobile wallet', 'A tool for network monitoring'],
        correctAnswer: 'A tool to check and revoke token allowances to dapps'
    },
    {
        id: 'lc_crypto_386',
        text: 'What is "DeBank"?',
        options: ['A popular multi-chain DeFi portfolio tracker', 'A bank that has been decentralized', 'A specialized project about banking history', 'A decentralized exchange for stablecoins'],
        correctAnswer: 'A popular multi-chain DeFi portfolio tracker'
    },
    {
        id: 'lc_crypto_387',
        text: 'What is "PancakeSwap"?',
        options: ['A leading decentralized exchange on the BNB Chain', 'A place where you can trade physical pancakes with crypto', 'A specialized exchange for food-related coins', 'A tool for network security'],
        correctAnswer: 'A leading decentralized exchange on the BNB Chain'
    },
    {
        id: 'lc_crypto_388',
        text: 'What is "CAKE" token?',
        options: ['The governance and utility token for PancakeSwap', 'A token representing a physical cake', 'A specialized asset for agricultural trades', 'A feature for automatic transaction signing'],
        correctAnswer: 'The governance and utility token for PancakeSwap'
    },
    {
        id: 'lc_crypto_389',
        text: 'What is "Trust Wallet"?',
        options: ['A popular non-custodial mobile wallet owned by Binance', 'A wallet that you can trust more than others', 'A specialized storage for legal documents', 'A tool for network security'],
        correctAnswer: 'A popular non-custodial mobile wallet owned by Binance'
    },
    {
        id: 'lc_crypto_390',
        text: 'What is "Coinbase Wallet"?',
        options: ['A non-custodial wallet developed by Coinbase (separate from the exchange)', 'The main app for the Coinbase exchange', 'A specialized project about hardware', 'A decentralized exchange for new coins'],
        correctAnswer: 'A non-custodial wallet developed by Coinbase (separate from the exchange)'
    },
    {
        id: 'lc_crypto_391',
        text: 'What is "Brave Browser"?',
        options: ['A privacy-focused web browser that rewards users with BAT tokens', 'A browser for brave people only', 'A specialized project about sci-fi', 'A decentralized exchange for browsing data'],
        correctAnswer: 'A privacy-focused web browser that rewards users with BAT tokens'
    },
    {
        id: 'lc_crypto_392',
        text: 'What is "Basic Attention Token" (BAT)?',
        options: ['A token used to reward users for their attention to ads in Brave', 'A token with a bat logo', 'A specialized project about athletics', 'A decentralized exchange for social data'],
        correctAnswer: 'A token used to reward users for their attention to ads in Brave'
    },
    {
        id: 'lc_crypto_393',
        text: 'What is "Airdrop"?',
        options: ['Distributing free tokens to users to promote a new project', 'Dropping coins from a physical airplane', 'A specialized project about skydiving', 'A feature for automatic transaction signing'],
        correctAnswer: 'Distributing free tokens to users to promote a new project'
    },
    {
        id: 'lc_crypto_394',
        text: 'What is "Whitelisting"?',
        options: ['Pre-approving specific wallet addresses for participation in an event or sale', 'Painting your hardware wallet white', 'A specialized project about visual effects', 'A tool for network security'],
        correctAnswer: 'Pre-approving specific wallet addresses for participation in an event or sale'
    },
    {
        id: 'lc_crypto_395',
        text: 'What is "Public Sale"?',
        options: ['The stage where anyone can buy a project\'s tokens for the first time', 'Selling your coins in a public park', 'A specialized project about retail', 'A decentralized exchange for new coins'],
        correctAnswer: 'The stage where anyone can buy a project\'s tokens for the first time'
    },
    {
        id: 'lc_crypto_396',
        text: 'What is "Private Sale"?',
        options: ['An early stage where large investors can buy tokens before the public', 'Selling your coins in a private room', 'A specialized project about privacy', 'A tool for network security'],
        correctAnswer: 'An early stage where large investors can buy tokens before the public'
    },
    {
        id: 'lc_crypto_397',
        text: 'What is "Vesting"?',
        options: ['A schedule for releasing tokens over time to prevent sudden selling', 'Wearing a vest with a Bitcoin logo', 'A specialized project about fashion', 'A tool for network monitoring'],
        correctAnswer: 'A schedule for releasing tokens over time to prevent sudden selling'
    },
    {
        id: 'lc_crypto_398',
        text: 'What is "Cliff" in vesting?',
        options: ['A period before any tokens can be released to the holder', 'A physical cliff near a mining rig', 'A sign that the price is about to fall', 'A feature for automatic profit taking'],
        correctAnswer: 'A period before any tokens can be released to the holder'
    },
    {
        id: 'lc_crypto_399',
        text: 'What is "Tokenomics"?',
        options: ['The economic model and distribution of a cryptocurrency', 'The study of tokens in a museum', 'A specialized project about economics', 'A decentralized exchange for design assets'],
        correctAnswer: 'The economic model and distribution of a cryptocurrency'
    },
    {
        id: 'lc_crypto_400',
        text: 'What is "Burn"?',
        options: ['Permanently removing tokens from circulation to increase scarcity', 'Destroying a physical hardware wallet', 'Cooking yourself dinner with mining heat', 'A feature for automatic market making'],
        correctAnswer: 'Permanently removing tokens from circulation to increase scarcity'
    },
    {
        id: 'lc_crypto_401',
        text: 'What is a "Deflationary" token?',
        options: ['A token whose supply decreases over time', 'A token whose price is always falling', 'A coin with a flat shape', 'A specialized project about air pressure'],
        correctAnswer: 'A token whose supply decreases over time'
    },
    {
        id: 'lc_crypto_402',
        text: 'What is an "Inflationary" token?',
        options: ['A token whose supply increases over time', 'A token whose price is always rising', 'A coin with a round shape', 'A specialized tool for mining rigs'],
        correctAnswer: 'A token whose supply increases over time'
    },
    {
        id: 'lc_crypto_403',
        text: 'What is "Staking Reward"?',
        options: ['Tokens paid to validators and stakers for securing the network', 'A gold medal for being a good staker', 'A specialized tool for market makers', 'A feature for automatic profit taking'],
        correctAnswer: 'Tokens paid to validators and stakers for securing the network'
    },
    {
        id: 'lc_crypto_404',
        text: 'What is "Mining Reward"?',
        options: ['Tokens paid to miners for solving blocks in a PoW network', 'Finding a physical coin in a mine', 'A specialized project about treasure hunting', 'A decentralized exchange for hardware'],
        correctAnswer: 'Tokens paid to miners for solving blocks in a PoW network'
    },
    {
        id: 'lc_crypto_405',
        text: 'What is "Block Time"?',
        options: ['The average time it takes to create a new block in a blockchain', 'A clock made of blocks', 'A specialized project about history', 'A tool for network monitoring'],
        correctAnswer: 'The average time it takes to create a new block in a blockchain'
    },
    {
        id: 'lc_crypto_406',
        text: 'What is "Hard Cap"?',
        options: ['The maximum amount a project aims to raise in a token sale', 'A physical helmet worn by miners', 'The highest price a coin will ever reach', 'A tool for network security'],
        correctAnswer: 'The maximum amount a project aims to raise in a token sale'
    },
    {
        id: 'lc_crypto_407',
        text: 'What is "Soft Cap"?',
        options: ['The minimum amount a project needs to raise to proceed', 'A physical hat made of soft material', 'The lowest price a coin will ever reach', 'A tool for network monitoring'],
        correctAnswer: 'The minimum amount a project needs to raise to proceed'
    },
    {
        id: 'lc_crypto_408',
        text: 'What is "EIP" (Ethereum Improvement Proposal)?',
        options: ['A standard for proposing changes to the Ethereum network', 'Encrypted Insurance Plan', 'Electronic Identity Protocol', 'Ethereum Integrated Platform'],
        correctAnswer: 'A standard for proposing changes to the Ethereum network'
    },
    {
        id: 'lc_crypto_409',
        text: 'What is "LIP" in the Litecoin ecosystem?',
        options: ['Litecoin Improvement Proposal', 'Local Investment Plan', 'Litecoin Integrated Protocol', 'Logical Identity Path'],
        correctAnswer: 'Litecoin Improvement Proposal'
    },
    {
        id: 'lc_crypto_410',
        text: 'What is "BIP" (Bitcoin Improvement Proposal)?',
        options: ['A standard for proposing changes to the Bitcoin network', 'Bitcoin Investment Plan', 'Basic Identity Protocol', 'Binary Information Path'],
        correctAnswer: 'A standard for proposing changes to the Bitcoin network'
    },
    {
        id: 'lc_crypto_411',
        text: 'What are "Liquid Staking Derivatives" (LSD)?',
        options: ['Tokens representing staked assets that can be used in DeFi', 'A specialized project about chemical testing', 'A new type of high-speed hard drive', 'A tool for network monitoring'],
        correctAnswer: 'Tokens representing staked assets that can be used in DeFi'
    },
    {
        id: 'lc_crypto_412',
        text: 'What is "Proto-Danksharding" (EIP-4844)?',
        options: ['A major Ethereum upgrade introducing data "blobs" to lower L2 fees', 'A way to shard your private keys into small bits', 'A specialized project about digital sharing', 'A tool for network security'],
        correctAnswer: 'A major Ethereum upgrade introducing data "blobs" to lower L2 fees'
    },
    {
        id: 'lc_crypto_413',
        text: 'What is a "ZK-EVM"?',
        options: ['An EVM-compatible virtual machine that generates zero-knowledge proofs', 'A specialized wallet for keeping coins secret', 'A way to vote anonymously on Ethereum', 'A tool for network monitoring'],
        correctAnswer: 'An EVM-compatible virtual machine that generates zero-knowledge proofs'
    },
    {
        id: 'lc_crypto_414',
        text: 'What is "Avail"?',
        options: ['A modular data availability layer', 'A way to check if a username is available', 'A specialized project about travel', 'A tool for network monitoring'],
        correctAnswer: 'A modular data availability layer'
    },
    {
        id: 'lc_crypto_415',
        text: 'What is "EigenLayer"?',
        options: ['A restaking protocol on Ethereum', 'A specialized project about math', 'A way to layer multiple wallets', 'A decentralized exchange for new coins'],
        correctAnswer: 'A restaking protocol on Ethereum'
    },
    {
        id: 'lc_crypto_416',
        text: 'What is "Restaking"?',
        options: ['Re-using staked ETH to secure other protocols or services', 'Staking your coins twice on the same network', 'A specialized tool for market makers', 'A feature for manual transaction signing'],
        correctAnswer: 'Re-using staked ETH to secure other protocols or services'
    },
    {
        id: 'lc_crypto_417',
        text: 'What is "LRT" (Liquid Restaking Token)?',
        options: ['A token representing restaked assets that remains liquid', 'A coin that never dries', 'A specialized project about cleaning', 'A tool for network security'],
        correctAnswer: 'A token representing restaked assets that remains liquid'
    },
    {
        id: 'lc_crypto_418',
        text: 'What is "Ether.fi"?',
        options: ['A popular liquid restaking protocol', 'A specialized project about wifi', 'A way to send ETH via radio waves', 'A decentralized exchange for stablecoins'],
        correctAnswer: 'A popular liquid restaking protocol'
    },
    {
        id: 'lc_crypto_419',
        text: 'What is "Renzo" in the context of LRTs?',
        options: ['A liquid restaking protocol and strategy manager', 'A famous crypto artist', 'A specialized tool for mining', 'A feature for automatic price alerts'],
        correctAnswer: 'A liquid restaking protocol and strategy manager'
    },
    {
        id: 'lc_crypto_420',
        text: 'What is "Puffer Finance"?',
        options: ['A decentralized native liquid restaking protocol', 'A specialized project about fish', 'A way to inflate coin prices', 'A tool for network security'],
        correctAnswer: 'A decentralized native liquid restaking protocol'
    },
    {
        id: 'lc_crypto_421',
        text: 'What is "Account Abstraction" (ERC-4337)?',
        options: ['Enhancing crypto wallets to behave like smart contracts', 'Hiding your account balance from everyone', 'A specialized project about abstract art', 'A decentralized exchange for new coins'],
        correctAnswer: 'Enhancing crypto wallets to behave like smart contracts'
    },
    {
        id: 'lc_crypto_422',
        text: 'What is a "Smart Contract Wallet"?',
        options: ['A wallet that can execute code and have flexible security rules', 'A wallet that tells you when to buy coins', 'A specialized tool for high-value trades', 'A feature for automatic market making'],
        correctAnswer: 'A wallet that can execute code and have flexible security rules'
    },
    {
        id: 'lc_crypto_423',
        text: 'What is "Social Recovery" for wallets?',
        options: ['Recovering a wallet via a group of trusted friends or services', 'Getting your account back from a social media company', 'A specialized project about psychology', 'A tool for network monitoring'],
        correctAnswer: 'Recovering a wallet via a group of trusted friends or services'
    },
    {
        id: 'lc_crypto_424',
        text: 'What is "LayerZero"?',
        options: ['An omnichain interoperability protocol', 'The very first layer of Bitcoin', 'A specialized project about freezing temperatures', 'A decentralized exchange for design assets'],
        correctAnswer: 'An omnichain interoperability protocol'
    },
    {
        id: 'lc_crypto_425',
        text: 'What is "Wormhole" in crypto?',
        options: ['A cross-chain messaging protocol (bridge)', 'A bug that eats your coins', 'A specialized project about space travel', 'A tool for network security'],
        correctAnswer: 'A cross-chain messaging protocol (bridge)'
    },
    {
        id: 'lc_crypto_426',
        text: 'What is "Axelar"?',
        options: ['A network providing secure cross-chain communication for Web3', 'A specialized project about axles and cars', 'A way to send crypto via satellite', 'A decentralized exchange for IoT data'],
        correctAnswer: 'A network providing secure cross-chain communication for Web3'
    },
    {
        id: 'lc_crypto_427',
        text: 'What is "Stargate Finance"?',
        options: ['A fully composable liquidity transport protocol on LayerZero', 'A specialized project about sci-fi films', 'A way to send crypto to another galaxy', 'A feature for automatic price alerts'],
        correctAnswer: 'A fully composable liquidity transport protocol on LayerZero'
    },
    {
        id: 'lc_crypto_428',
        text: 'What is "Ondo Finance"?',
        options: ['A project bringing Real World Assets (RWA) to the blockchain', 'A specialized project about ocean waves', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'A project bringing Real World Assets (RWA) to the blockchain'
    },
    {
        id: 'lc_crypto_429',
        text: 'What are "Real World Assets" (RWA) in crypto?',
        options: ['Tokenized versions of physical assets like gold, real estate, or bonds', 'Anything you can touch in real life', 'A specialized exchange for buying physical goods', 'A tool for network security'],
        correctAnswer: 'Tokenized versions of physical assets like gold, real estate, or bonds'
    },
    {
        id: 'lc_crypto_430',
        text: 'What is "BlackRock BUIDL"?',
        options: ['A tokenized money market fund launched by BlackRock', 'A specialized project about construction', 'A way to build your own crypto exchange', 'A feature for manual transaction signing'],
        correctAnswer: 'A tokenized money market fund launched by BlackRock'
    },
    {
        id: 'lc_crypto_431',
        text: 'What is "Pendle Finance"?',
        options: ['A protocol that allows for the trading of future yield', 'A specialized project about pendulums', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'A protocol that allows for the trading of future yield'
    },
    {
        id: 'lc_crypto_432',
        text: 'What is "Yield Tokenization"?',
        options: ['Separating an asset from its yield into two different tokens', 'A way to turn agricultural yields into coins', 'A specialized tool for market makers', 'A feature for automatic transaction signing'],
        correctAnswer: 'Separating an asset from its yield into two different tokens'
    },
    {
        id: 'lc_crypto_433',
        text: 'What is "Friend.tech"?',
        options: ['A decentralized social app on Base where users buy "keys" to chat', 'A specialized project about making friends', 'A way to send crypto via Facebook', 'A tool for network security'],
        correctAnswer: 'A decentralized social app on Base where users buy "keys" to chat'
    },
    {
        id: 'lc_crypto_434',
        text: 'What is "SocialFi"?',
        options: ['The intersection of social media and decentralized finance', 'A specialized project about fire security', 'A way to earn coins by being social in real life', 'A decentralized exchange for social data'],
        correctAnswer: 'The intersection of social media and decentralized finance'
    },
    {
        id: 'lc_crypto_435',
        text: 'What happened in the Bitcoin Halving of April 2024?',
        options: ['The block reward was reduced from 6.25 BTC to 3.125 BTC', 'The price of Bitcoin was cut in half', 'All Bitcoin miners stopped working', 'Bitcoin became illegal in Europe'],
        correctAnswer: 'The block reward was reduced from 6.25 BTC to 3.125 BTC'
    },
    {
        id: 'lc_crypto_436',
        text: 'What is a "Spot Bitcoin ETF"?',
        options: ['An investment fund that holds physical Bitcoin for shareholders', 'A way to bet against the price of Bitcoin', 'A specialized project about dogs', 'A tool for network monitoring'],
        correctAnswer: 'An investment fund that holds physical Bitcoin for shareholders'
    },
    {
        id: 'lc_crypto_437',
        text: 'What is "SEC" in the context of US crypto regulation?',
        options: ['Securities and Exchange Commission', 'Secret Electronic Code', 'Socially Enhanced Coin', 'Standardized Encryption Core'],
        correctAnswer: 'Securities and Exchange Commission'
    },
    {
        id: 'lc_crypto_438',
        text: 'What is "Gary Gensler" known for?',
        options: ['The current Chairman of the SEC known for strict crypto stance', 'The co-founder of Ethereum', 'Developing Bitcoin with Satoshi', 'A famous crypto trader on YouTube'],
        correctAnswer: 'The current Chairman of the SEC known for strict crypto stance'
    },
    {
        id: 'lc_crypto_439',
        text: 'What is "MiCA"?',
        options: ['Markets in Crypto-Assets regulation (the EU framework for crypto)', 'Mobile Integrated Cryptographic Access', 'Multinational International Code Agreement', 'A specialized project about minerals'],
        correctAnswer: 'Markets in Crypto-Assets regulation (the EU framework for crypto)'
    },
    {
        id: 'lc_crypto_440',
        text: 'What is "Jupiter" (JUP) in the Solana ecosystem?',
        options: ['A leading DEX aggregator on Solana', 'A specialized project about planets', 'A way to send crypto to space', 'A decentralized exchange for new tokens'],
        correctAnswer: 'A leading DEX aggregator on Solana'
    },
    {
        id: 'lc_crypto_441',
        text: 'What is "Raydium" (RAY)?',
        options: ['An automated market maker (AMM) and liquidity provider for Solana', 'A specialized project about science', 'A way to send crypto via email', 'A tool for network security'],
        correctAnswer: 'An automated market maker (AMM) and liquidity provider for Solana'
    },
    {
        id: 'lc_crypto_442',
        text: 'What is "Orca" (ORCA) on Solana?',
        options: ['A user-friendly decentralized exchange and AMM', 'A specialized project about whales', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'A user-friendly decentralized exchange and AMM'
    },
    {
        id: 'lc_crypto_443',
        text: 'What is "Drift Protocol"?',
        options: ['A decentralized perpetual swap exchange on Solana', 'A specialized project about car racing', 'A way to send crypto via text', 'A feature for manual transaction signing'],
        correctAnswer: 'A decentralized perpetual swap exchange on Solana'
    },
    {
        id: 'lc_crypto_444',
        text: 'What is "Magic Eden"?',
        options: ['The leading NFT marketplace on Solana and cross-chain', 'A specialized project about plants', 'A way to send crypto to a garden', 'A tool for network monitoring'],
        correctAnswer: 'The leading NFT marketplace on Solana and cross-chain'
    },
    {
        id: 'lc_crypto_445',
        text: 'What is "Tensor" (TNSR)?',
        options: ['The leading NFT marketplace for pro traders on Solana', 'A specialized project about math', 'A way to send crypto via neural network', 'A tool for network security'],
        correctAnswer: 'The leading NFT marketplace for pro traders on Solana'
    },
    {
        id: 'lc_crypto_446',
        text: 'What is "Saga" phone?',
        options: ['A crypto-native Android smartphone developed by Solana Mobile', 'A specialized project about history', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'A crypto-native Android smartphone developed by Solana Mobile'
    },
    {
        id: 'lc_crypto_447',
        text: 'What is "Chapter 2" in the context of Solana Mobile?',
        options: ['The successor to the Solana Saga smartphone', 'A specialized project about reading', 'A way to send crypto via email', 'A decentralized exchange for books'],
        correctAnswer: 'The successor to the Solana Saga smartphone'
    },
    {
        id: 'lc_crypto_448',
        text: 'What is "Bonk" (BONK)?',
        options: ['The first community dog coin on Solana', 'A specialized project about athletics', 'A way to send crypto via text', 'A tool for network monitoring'],
        correctAnswer: 'The first community dog coin on Solana'
    },
    {
        id: 'lc_crypto_449',
        text: 'What is "dogwifhat" (WIF)?',
        options: ['A viral memecoin on Solana featuring a dog with a hat', 'A specialized project about fashion', 'A way to send crypto via email', 'A tool for network security'],
        correctAnswer: 'A viral memecoin on Solana featuring a dog with a hat'
    },
    {
        id: 'lc_crypto_450',
        text: 'What is "Pepe" (PEPE)?',
        options: ['A popular frog-themed memecoin on Ethereum', 'A specialized project about science', 'A way to send crypto via neural network', 'A decentralized exchange for memes'],
        correctAnswer: 'A popular frog-themed memecoin on Ethereum'
    },
    {
        id: 'lc_crypto_451',
        text: 'What is "Meme Layer 2" or "Meme Chain"?',
        options: ['Speculative L2 projects often launching memecoins', 'A specialized project about visual effects', 'A way to send crypto via radio waves', 'A tool for network security'],
        correctAnswer: 'Speculative L2 projects often launching memecoins'
    },
    {
        id: 'lc_crypto_452',
        text: 'What is "Zksync" (ZK)?',
        options: ['A Layer 2 scaling solution for Ethereum using ZK-rollups', 'A specialized project about sync music', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'A Layer 2 scaling solution for Ethereum using ZK-rollups'
    },
    {
        id: 'lc_crypto_453',
        text: 'What is "Starknet" (STRK)?',
        options: ['A permissionless decentralized ZK-rollup on Ethereum', 'A specialized project about Marvel comics', 'A way to send crypto to space', 'A tool for network security'],
        correctAnswer: 'A permissionless decentralized ZK-rollup on Ethereum'
    },
    {
        id: 'lc_crypto_454',
        text: 'What is "Linea"?',
        options: ['An Ethereum Layer 2 zkEVM developed by ConsenSys', 'A specialized project about drawing', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'An Ethereum Layer 2 zkEVM developed by ConsenSys'
    },
    {
        id: 'lc_crypto_455',
        text: 'What is "Scroll"?',
        options: ['A zkEVM-based zk-rollup on Ethereum', 'A specialized project about history', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'A zkEVM-based zk-rollup on Ethereum'
    },
    {
        id: 'lc_crypto_456',
        text: 'What is "Manta Network" (MANTA)?',
        options: ['A modular ecosystem for Web3 on Ethereum and Polkadot', 'A specialized project about sea animals', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'A modular ecosystem for Web3 on Ethereum and Polkadot'
    },
    {
        id: 'lc_crypto_457',
        text: 'What is "Blast"?',
        options: ['An Ethereum L2 with native yield for ETH and stablecoins', 'A specialized project about rockets', 'A way to send crypto via text', 'A decentralized exchange for new coins'],
        correctAnswer: 'An Ethereum L2 with native yield for ETH and stablecoins'
    },
    {
        id: 'lc_crypto_458',
        text: 'What is "Taiko"?',
        options: ['A decentralized, Ethereum-equivalent ZK-rollup', 'A specialized project about drums', 'A way to send crypto via email', 'A tool for network security'],
        correctAnswer: 'A decentralized, Ethereum-equivalent ZK-rollup'
    },
    {
        id: 'lc_crypto_459',
        text: 'What is "Mode"?',
        options: ['A modular DeFi L2 building the on-chain economy', 'A specialized project about fashion', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'A modular DeFi L2 building the on-chain economy'
    },
    {
        id: 'lc_crypto_460',
        text: 'What is "Zora"?',
        options: ['An Ethereum L2 specifically for NFTs and creators', 'A specialized project about science', 'A way to send crypto via email', 'A decentralized exchange for art assets'],
        correctAnswer: 'An Ethereum L2 specifically for NFTs and creators'
    },
    {
        id: 'lc_crypto_461',
        text: 'What is "CyberConnect"?',
        options: ['A Web3 social network protocol', 'A specialized project about cyborgs', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'A Web3 social network protocol'
    },
    {
        id: 'lc_crypto_462',
        text: 'What is "Lens Protocol"?',
        options: ['A decentralized social graph on Polygon', 'A specialized project about glasses', 'A way to send crypto via radio waves', 'A tool for network security'],
        correctAnswer: 'A decentralized social graph on Polygon'
    },
    {
        id: 'lc_crypto_463',
        text: 'What is "Aave" (AAVE)?',
        options: ['A leading decentralized lending and borrowing protocol', 'A specialized project about ghosts', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'A leading decentralized lending and borrowing protocol'
    },
    {
        id: 'lc_crypto_464',
        text: 'What is "Compound" (COMP)?',
        options: ['A DeFi protocol for lending and earning interest', 'A specialized project about chemistry', 'A way to send crypto via text', 'A feature for manual transaction signing'],
        correctAnswer: 'A DeFi protocol for lending and earning interest'
    },
    {
        id: 'lc_crypto_465',
        text: 'What is "Curve Finance" (CRV)?',
        options: ['A DEX optimized for low-slippage stablecoin swaps', 'A specialized project about geometry', 'A way to send crypto via radio', 'A tool for network security'],
        correctAnswer: 'A DEX optimized for low-slippage stablecoin swaps'
    },
    {
        id: 'lc_crypto_466',
        text: 'What is "Convex Finance" (CVX)?',
        options: ['A protocol that boosts rewards for Curve liquidity providers', 'A specialized project about physics', 'A way to send crypto via email', 'A feature for automatic transaction signing'],
        correctAnswer: 'A protocol that boosts rewards for Curve liquidity providers'
    },
    {
        id: 'lc_crypto_467',
        text: 'What is "Lido" (LDO)?',
        options: ['The leading liquid staking protocol for Ethereum', 'A specialized project about beaches', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'The leading liquid staking protocol for Ethereum'
    },
    {
        id: 'lc_crypto_468',
        text: 'What is "stETH"?',
        options: ['Lido\'s liquid-staked ETH token', 'A coin that never dries', 'A specialized project about athletics', 'A feature for automatic price alerts'],
        correctAnswer: 'Lido\'s liquid-staked ETH token'
    },
    {
        id: 'lc_crypto_469',
        text: 'What is "Rocket Pool" (RPL)?',
        options: ['A decentralized Ethereum liquid staking protocol', 'A specialized project about space travel', 'A way to send crypto to the moon', 'A tool for network security'],
        correctAnswer: 'A decentralized Ethereum liquid staking protocol'
    },
    {
        id: 'lc_crypto_470',
        text: 'What is "FrxETH"?',
        options: ['Frax Finance\'s liquid-staked ETH token', 'A specialized project about ice', 'A way to send crypto via radio waves', 'A decentralized exchange for new coins'],
        correctAnswer: 'Frax Finance\'s liquid-staked ETH token'
    },
    {
        id: 'lc_crypto_471',
        text: 'What is "MakerDAO" (MKR)?',
        options: ['The decentralized organization that governs the DAI stablecoin', 'A specialized project about coffee', 'A way to build your own coins', 'A tool for network monitoring'],
        correctAnswer: 'The decentralized organization that governs the DAI stablecoin'
    },
    {
        id: 'lc_crypto_472',
        text: 'What is "DAI"?',
        options: ['An over-collateralized stablecoin pegged to the US dollar', 'A coin used for buying flowers', 'A specialized project about Japanese history', 'A tool for network monitoring'],
        correctAnswer: 'An over-collateralized stablecoin pegged to the US dollar'
    },
    {
        id: 'lc_crypto_473',
        text: 'What is "Collateralized Debt Position" (CDP)?',
        options: ['Locking up assets as collateral to generate a stablecoin loan', 'A way to lose money very fast', 'A specialized project about banking', 'A feature for manual transaction signing'],
        correctAnswer: 'Locking up assets as collateral to generate a stablecoin loan'
    },
    {
        id: 'lc_crypto_474',
        text: 'What is "Synthetix" (SNX)?',
        options: ['A protocol for creating and trading synthetic assets of anything', 'A specialized project about robots', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'A protocol for creating and trading synthetic assets of anything'
    },
    {
        id: 'lc_crypto_475',
        text: 'What is a "Synthetic Asset"?',
        options: ['A token that tracks the value of another asset (like gold or stocks)', 'A fake coin created by scammers', 'A specialized project about plastic', 'A decentralized exchange for design assets'],
        correctAnswer: 'A token that tracks the value of another asset (like gold or stocks)'
    },
    {
        id: 'lc_crypto_476',
        text: 'What is "Instadapp"?',
        options: ['A middleware layer that simplifies managing DeFi positions', 'A way to buy coins instantly with a card', 'A specialized project about cameras', 'A tool for network monitoring'],
        correctAnswer: 'A middleware layer that simplifies managing DeFi positions'
    },
    {
        id: 'lc_crypto_477',
        text: 'What is "Bancor" (BNT)?',
        options: ['A protocol that pioneerered AMMs with its liquidity pools', 'A specialized project about banking history', 'A way to send crypto via text', 'A tool for network security'],
        correctAnswer: 'A protocol that pioneerered AMMs with its liquidity pools'
    },
    {
        id: 'lc_crypto_478',
        text: 'What is "SushiSwap" (SUSHI)?',
        options: ['A fork of Uniswap that introduced community governance', 'A specialized exchange for fish', 'A way to order food with crypto', 'A tool for network monitoring'],
        correctAnswer: 'A fork of Uniswap that introduced community governance'
    },
    {
        id: 'lc_crypto_479',
        text: 'What is "Balancer" (BAL)?',
        options: ['A protocol for programmable liquidity and portfolio management', 'A specialized tool for weight management', 'A way to send crypto via neural network', 'A feature for manual transaction signing'],
        correctAnswer: 'A protocol for programmable liquidity and portfolio management'
    },
    {
        id: 'lc_crypto_480',
        text: 'What is "1inch" (1INCH)?',
        options: ['A leading decentralized exchange aggregator', 'A specialized project about measurement', 'A way to send crypto via email', 'A tool for network monitoring'],
        correctAnswer: 'A leading decentralized exchange aggregator'
    },
    {
        id: 'lc_crypto_481',
        text: 'What is "Cow Swap"?',
        options: ['An exchange that uses batch auctions to prevent MEV', 'A specialized exchange for cattle', 'A way to send crypto via radio', 'A tool for network security'],
        correctAnswer: 'An exchange that uses batch auctions to prevent MEV'
    },
    {
        id: 'lc_crypto_482',
        text: 'What is "MEV" (Maximal Extractable Value)?',
        options: ['The value miners/validators can extract by reordering transactions', 'Maximum Estimated Value of a coin', 'Minimum Enterprise Validation', 'Machine Enhanced Voting'],
        correctAnswer: 'The value miners/validators can extract by reordering transactions'
    },
    {
        id: 'lc_crypto_483',
        text: 'What is "Flashbots"?',
        options: ['An organization aiming to mitigate the negative impacts of MEV on Ethereum', 'A group of robots that move very fast', 'A specialized project about visual effects', 'A tool for network security'],
        correctAnswer: 'An organization aiming to mitigate the negative impacts of MEV on Ethereum'
    },
    {
        id: 'lc_crypto_484',
        text: 'What is "Gas"?',
        options: ['The unit used to measure the computational effort for transactions', 'A physical gas needed to power computers', 'A specialized project about science', 'A feature for automatic market making'],
        correctAnswer: 'The unit used to measure the computational effort for transactions'
    },
    {
        id: 'lc_crypto_485',
        text: 'What is "Gwei"?',
        options: ['A tiny fraction of ETH used to pay for gas fees', 'A specialized currency used in China', 'A way to send crypto via radio', 'A tool for network monitoring'],
        correctAnswer: 'A tiny fraction of ETH used to pay for gas fees'
    },
    {
        id: 'lc_crypto_486',
        text: 'What is "Nonce" in an Ethereum transaction?',
        options: ['An incrementing number to prevent transaction replay attacks', 'A specialized project about nonsensical names', 'A way to send crypto via email', 'A feature for automatic transaction signing'],
        correctAnswer: 'An incrementing number to prevent transaction replay attacks'
    },
    {
        id: 'lc_crypto_487',
        text: 'What is "EIP-1559"?',
        options: ['A major Ethereum upgrade that introduced a base fee and burn mechanism', 'A specialized project about sharks', 'A way to send crypto to space', 'A tool for network security'],
        correctAnswer: 'A major Ethereum upgrade that introduced a base fee and burn mechanism'
    },
    {
        id: 'lc_crypto_488',
        text: 'What is "Priority Fee" in EIP-1559?',
        options: ['A tip paid to validators to have your transaction included faster', 'A specialized project about first-class flights', 'A way to send crypto via neural network', 'A tool for network monitoring'],
        correctAnswer: 'A tip paid to validators to have your transaction included faster'
    },
    {
        id: 'lc_crypto_489',
        text: 'What is "Base Fee" in EIP-1559?',
        options: ['The minimum fee required for a transaction, which is burned', 'A fee paid to use Coinbase', 'A specialized project about music', 'A tool for network security'],
        correctAnswer: 'The minimum fee required for a transaction, which is burned'
    },
    {
        id: 'lc_crypto_490',
        text: 'What is "Burning" in the context of EIP-1559?',
        options: ['Permanently removing the base fee from ETH supply', 'Destroying your computer to save fees', 'A specialized project about visual effects', 'A tool for network monitoring'],
        correctAnswer: 'Permanently removing the base fee from ETH supply'
    },
    {
        id: 'lc_crypto_491',
        text: 'What is "Decentralized Identifier" (DID)?',
        options: ['A new type of identifier for verifiable, decentralized digital identity', 'A way to find lost coins', 'A specialized project about geography', 'A feature for manual transaction signing'],
        correctAnswer: 'A new type of identifier for verifiable, decentralized digital identity'
    },
    {
        id: 'lc_crypto_492',
        text: 'What is "ENS" (Ethereum Name Service)?',
        options: ['A decentralized, open-source naming system on Ethereum (e.g., .eth)', 'Ethereum Network Security', 'Encrypted Node Service', 'Electronic Name Standard'],
        correctAnswer: 'A decentralized, open-source naming system on Ethereum (e.g., .eth)'
    },
    {
        id: 'lc_crypto_493',
        text: 'What is "WalletConnect"?',
        options: ['An open protocol to communicate between mobile wallets and dApps', 'A physical cable to connect wallets', 'A specialized tool for high-value assets', 'A feature for automatic market making'],
        correctAnswer: 'An open protocol to communicate between mobile wallets and dApps'
    },
    {
        id: 'lc_crypto_494',
        text: 'What is "MetaMask"?',
        options: ['The leading non-custodial browser extension and mobile wallet', 'A specialized project about masks', 'A way to send crypto via Facebook', 'A tool for network security'],
        correctAnswer: 'The leading non-custodial browser extension and mobile wallet'
    },
    {
        id: 'lc_crypto_495',
        text: 'What is "Infura"?',
        options: ['An infrastructure provider that offers APIs and tools for Ethereum', 'A specialized project about fire security', 'A way to send crypto via radio', 'A decentralized exchange for new coins'],
        correctAnswer: 'An infrastructure provider that offers APIs and tools for Ethereum'
    },
    {
        id: 'lc_crypto_496',
        text: 'What is "Alchemy" in crypto?',
        options: ['A leading blockchain development platform and node provider', 'A specialized project about turning lead into gold', 'A way to send crypto via neural network', 'A tool for network security'],
        correctAnswer: 'A leading blockchain development platform and node provider'
    },
    {
        id: 'lc_crypto_497',
        text: 'What is "QuickNode"?',
        options: ['A high-performance blockchain node infrastructure provider', 'A specialized tool for fast mining', 'A way to send crypto via text', 'A tool for network monitoring'],
        correctAnswer: 'A high-performance blockchain node infrastructure provider'
    },
    {
        id: 'lc_crypto_498',
        text: 'What is "Graph Protocol" (GRT)?',
        options: ['A decentralized protocol for indexing and querying data from blockchains', 'A specialized project about geometry', 'A way to send crypto via radio waves', 'A tool for network security'],
        correctAnswer: 'A decentralized protocol for indexing and querying data from blockchains'
    },
    {
        id: 'lc_crypto_499',
        text: 'What is a "Subgraph"?',
        options: ['An open API on The Graph that anyone can query', 'A way to store coins in a smaller graph', 'A specialized project about visual effects', 'A tool for network monitoring'],
        correctAnswer: 'An open API on The Graph that anyone can query'
    },
    {
        id: 'lc_crypto_500',
        text: 'What is "Chainlink" (LINK) best known for?',
        options: ['A decentralized oracle network that provides real-world data to smart contracts', 'A specialized project about chains and handcuffs', 'A way to send crypto via email', 'A decentralized exchange for social data'],
        correctAnswer: 'A decentralized oracle network that provides real-world data to smart contracts'
    },
    {
        id: 'lc_crypto_501',
        text: 'What is "Friend.tech"?',
        options: ['A pioneering SocialFi application built on Base', 'A specialized project about making friends', 'A tool for managing friend lists on exchanges', 'A feature for private messaging on Bitcoin'],
        correctAnswer: 'A pioneering SocialFi application built on Base'
    },
    {
        id: 'lc_crypto_502',
        text: 'What are "Keys" in the context of Friend.tech?',
        options: ['Assets that grant access to a user\'s private chat and influence', 'Private keys used to sign transactions', 'A specialized tool for decrypting data', 'A feature for manual wallet recovery'],
        correctAnswer: 'Assets that grant access to a user\'s private chat and influence'
    }
];
