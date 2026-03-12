
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

console.log('--- Chiliz RPC Connectivity Check ---');

async function testProvider(name: string, url: string, chainId: number) {
    console.log(`\nTesting ${name}...`);
    console.log(`URL: ${url}`);
    
    try {
        const provider = new ethers.JsonRpcProvider(url);
        const block = await provider.getBlockNumber();
        console.log(`✅ Success! Current Block: ${block}`);
        
        const network = await provider.getNetwork();
        console.log(`Network ID: ${network.chainId}`);
        
        if (Number(network.chainId) !== chainId) {
            console.warn(`⚠️ Chain ID mismatch! Expected ${chainId}, got ${network.chainId}`);
        }

        // Test balance of a zero address
        const balance = await provider.getBalance('0x0000000000000000000000000000000000000000');
        console.log(`✅ Balance check OK: ${ethers.formatEther(balance)} CHZ`);

    } catch (error: any) {
        console.error(`❌ Failed: ${error.message}`);
    }
}

async function run() {
    const isProd = process.env.NODE_ENV === 'production';
    const envRpc = process.env.CHILIZ_RPC_URL;

    if (envRpc) {
        await testProvider('ENV_OVERRIDE', envRpc, isProd ? 88888 : 88882);
    }

    await testProvider('Spicy Testnet', 'https://spicy-rpc.chiliz.com', 88882);
    await testProvider('Mainnet', 'https://rpc.chiliz.com', 88888);
}

run().catch(console.error);
