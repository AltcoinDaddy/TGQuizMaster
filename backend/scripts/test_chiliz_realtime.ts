import dotenv from 'dotenv';
dotenv.config();
import { ethers } from 'ethers';
import { CHILIZ_CONFIG } from '../src/config/ChilizConfig';
import { ChilizService } from '../src/utils/ChilizService';

async function testRealtimeChiliz() {
    console.log('--- Chiliz Real-time Integration Test ---');
    console.log(`RPC: ${CHILIZ_CONFIG.RPC_URL}`);
    console.log(`Chain ID: ${CHILIZ_CONFIG.CHAIN_ID}`);

    const testAddress = process.argv[2] || '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'; // Example or provided
    console.log(`Testing address: ${testAddress}`);

    try {
        const provider = new ethers.JsonRpcProvider(CHILIZ_CONFIG.RPC_URL);
        const balance = await provider.getBalance(testAddress);
        console.log(`Native CHZ Balance (via direct RPC): ${ethers.formatEther(balance)} CHZ`);

        const serviceData = await ChilizService.getUserOnChainData(testAddress);
        console.log('Service Data:', JSON.stringify(serviceData, null, 2));

        if (serviceData.chz >= 0) {
            console.log('✅ Balance fetching works.');
        } else {
            console.log('❌ Balance fetching failed.');
        }

        console.log('Fan Tokens Configured:', CHILIZ_CONFIG.FAN_TOKENS.map(t => t.symbol).join(', '));
        console.log('Held Fan Tokens:', Object.keys(serviceData.fanTokens).filter(s => serviceData.fanTokens[s] > 0).join(', ') || 'None');

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testRealtimeChiliz();
