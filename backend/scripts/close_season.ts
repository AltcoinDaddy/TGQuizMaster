import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

type Season = {
    id: string;
    title: string;
    status: string;
    start_time: string;
    end_time: string;
    prize_pool: number | string;
    metadata?: { cp_prize_pool?: number | string; [key: string]: any } | null;
};

type Player = {
    telegram_id: number;
    username: string | null;
    season_xp: number;
    balance_stars: number | null;
    balance_cp: string | number | null;
};

type Payout = {
    rank: number;
    telegramId: number;
    username: string;
    xp: number;
    stars: number;
    cp: number;
};

const args = new Set(process.argv.slice(2));
const execute = args.has('--execute');
const broadcast = args.has('--broadcast');
const force = args.has('--force');

const seasonArg = process.argv.find(arg => arg.startsWith('--season-id='));
const seasonId = seasonArg?.split('=')[1];

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
let appUrl = process.env.VITE_APP_URL || 'https://tgquizmaster.online';

if (appUrl.startsWith('http://192') || appUrl.startsWith('http://localhost')) {
    appUrl = 'https://tgquizmaster.online';
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_KEY.');
    process.exit(1);
}

if (broadcast && !botToken) {
    console.error('Missing TELEGRAM_BOT_TOKEN. Cannot broadcast.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = botToken ? new TelegramBot(botToken) : null;

const payoutTypes = ['SEASON_CLOSING_STARS', 'SEASON_CLOSING_CP'];

const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const displayName = (player: Pick<Player, 'username' | 'telegram_id'>) =>
    player.username?.trim() || `Player ${player.telegram_id}`;

const formatNumber = (value: number) => value.toLocaleString('en-US');

function allocateByXp(totalPool: number, players: Player[]) {
    const totalXp = players.reduce((sum, player) => sum + (player.season_xp || 0), 0);
    if (totalPool <= 0 || totalXp <= 0 || players.length === 0) {
        return new Map<number, number>();
    }

    const provisional = players.map(player => {
        const exact = (totalPool * player.season_xp) / totalXp;
        const amount = Math.floor(exact);
        return {
            telegramId: player.telegram_id,
            amount,
            remainder: exact - amount
        };
    });

    let distributed = provisional.reduce((sum, item) => sum + item.amount, 0);
    let remaining = totalPool - distributed;

    provisional
        .sort((a, b) => b.remainder - a.remainder)
        .forEach(item => {
            if (remaining <= 0) return;
            item.amount += 1;
            remaining -= 1;
        });

    return new Map(provisional.map(item => [item.telegramId, item.amount]));
}

async function fetchSeason() {
    let query = supabase
        .from('tournament_seasons')
        .select('*');

    if (seasonId) {
        query = query.eq('id', seasonId);
    } else {
        query = query.eq('status', 'active').lte('end_time', new Date().toISOString());
    }

    const { data, error } = await query
        .order('end_time', { ascending: true })
        .limit(1)
        .single();

    if (error || !data) {
        throw new Error(error?.message || 'No ended season found.');
    }

    return data as Season;
}

async function assertNotPaid(season: Season) {
    const { data, error } = await supabase
        .from('transactions')
        .select('id, metadata')
        .eq('type', 'PRIZE');

    if (error) throw error;

    const existing = (data || []).filter(tx =>
        tx.metadata?.seasonId === season.id && payoutTypes.includes(tx.metadata?.type)
    );

    if (existing.length > 0 && !force) {
        throw new Error(`Season already has ${existing.length} closing payout transactions. Use --force only if you are intentionally repairing a partial payout.`);
    }
}

async function fetchPlayers(season: Season) {
    const { data, error } = await supabase
        .from('users')
        .select('telegram_id, username, season_xp, balance_stars, balance_cp')
        .eq('last_season_id', season.id)
        .gt('season_xp', 0)
        .order('season_xp', { ascending: false });

    if (error) throw error;
    return (data || []) as Player[];
}

function buildPayouts(season: Season, players: Player[]) {
    const winners = players.slice(0, 30);
    const starPool = Number(season.prize_pool || 0);
    const cpPool = Number(season.metadata?.cp_prize_pool || 0);
    const starAllocations = allocateByXp(starPool, winners);
    const cpAllocations = allocateByXp(cpPool, players);

    return players.map((player, index) => ({
        rank: index + 1,
        telegramId: player.telegram_id,
        username: displayName(player),
        xp: player.season_xp || 0,
        stars: starAllocations.get(player.telegram_id) || 0,
        cp: cpAllocations.get(player.telegram_id) || 0
    })) as Payout[];
}

function buildBroadcastMessage(season: Season, payouts: Payout[]) {
    const topLines = payouts
        .slice(0, Math.min(10, payouts.length))
        .map(payout => `${payout.rank}. ${escapeHtml(payout.username)} - ${formatNumber(payout.xp)} XP - ${formatNumber(payout.stars)} Stars + ${formatNumber(payout.cp)} CP`)
        .join('\n');

    const totalStars = payouts.reduce((sum, payout) => sum + payout.stars, 0);
    const totalCp = payouts.reduce((sum, payout) => sum + payout.cp, 0);

    return [
        `🏁 <b>${escapeHtml(season.title)} is over!</b>`,
        '',
        'The final leaderboard has been locked and rewards have been credited.',
        '',
        `<b>Winners</b>`,
        topLines,
        '',
        `<b>Total shared:</b> ${formatNumber(totalStars)} Stars + ${formatNumber(totalCp)} CP`,
        'Every player who earned Season XP received a CP share based on their points.',
        '',
        'Thank you for playing. The next SportFi battle is coming soon.'
    ].join('\n');
}

async function applyPayouts(season: Season, payouts: Payout[]) {
    for (const payout of payouts) {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('balance_stars, balance_cp')
            .eq('telegram_id', payout.telegramId)
            .single();

        if (fetchError || !user) throw new Error(`User not found for payout: ${payout.telegramId}`);

        const updates = {
            balance_stars: (user.balance_stars || 0) + payout.stars,
            balance_cp: (BigInt(user.balance_cp || 0) + BigInt(payout.cp)).toString()
        };

        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('telegram_id', payout.telegramId);

        if (updateError) throw updateError;

        if (payout.stars > 0) {
            const { error } = await supabase.from('transactions').insert({
                user_id: payout.telegramId,
                type: 'PRIZE',
                amount: payout.stars,
                currency: 'STARS',
                metadata: {
                    type: 'SEASON_CLOSING_STARS',
                    seasonId: season.id,
                    seasonTitle: season.title,
                    rank: payout.rank,
                    seasonXp: payout.xp
                },
                status: 'COMPLETED'
            });
            if (error) throw error;
        }

        if (payout.cp > 0) {
            const { error } = await supabase.from('transactions').insert({
                user_id: payout.telegramId,
                type: 'PRIZE',
                amount: payout.cp,
                currency: 'CP',
                metadata: {
                    type: 'SEASON_CLOSING_CP',
                    seasonId: season.id,
                    seasonTitle: season.title,
                    rank: payout.rank,
                    seasonXp: payout.xp
                },
                status: 'COMPLETED'
            });
            if (error) throw error;
        }
    }

    const { error } = await supabase
        .from('tournament_seasons')
        .update({
            status: 'finished',
            metadata: {
                ...(season.metadata || {}),
                closed_at: new Date().toISOString(),
                payout_rule: 'Stars split by XP across top 30; CP split by XP across all players.',
                payout_players: payouts.length
            }
        })
        .eq('id', season.id);

    if (error) throw error;
}

async function broadcastResults(message: string) {
    if (!bot) throw new Error('Bot is not configured.');

    const { data: users, error } = await supabase
        .from('users')
        .select('telegram_id')
        .not('telegram_id', 'is', null);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let blocked = 0;

    for (const user of users || []) {
        try {
            await bot.sendMessage(user.telegram_id, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Open App', web_app: { url: appUrl } }
                    ]]
                }
            });
            sent++;
        } catch (error: any) {
            const message = error?.message || '';
            if (message.includes('bot was blocked') || message.includes('chat not found') || message.includes('user is deactivated') || message.includes('forbidden')) {
                blocked++;
            } else {
                failed++;
                console.error(`[BROADCAST] Failed for ${user.telegram_id}:`, message);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`Broadcast complete. Sent: ${sent}, blocked: ${blocked}, failed: ${failed}, total: ${users?.length || 0}`);
}

async function main() {
    const season = await fetchSeason();
    const players = await fetchPlayers(season);

    if (players.length === 0) {
        throw new Error(`No players found for season ${season.id}.`);
    }

    await assertNotPaid(season);

    const payouts = buildPayouts(season, players);
    const totalStars = payouts.reduce((sum, payout) => sum + payout.stars, 0);
    const totalCp = payouts.reduce((sum, payout) => sum + payout.cp, 0);

    console.log(`Season: ${season.title} (${season.id})`);
    console.log(`Status: ${season.status}`);
    console.log(`Ended: ${season.end_time}`);
    console.log(`Players: ${players.length}`);
    console.log(`Total Stars to credit: ${formatNumber(totalStars)}`);
    console.log(`Total CP to credit: ${formatNumber(totalCp)}`);
    console.table(payouts.map(payout => ({
        rank: payout.rank,
        username: payout.username,
        xp: payout.xp,
        stars: payout.stars,
        cp: payout.cp
    })));

    const message = buildBroadcastMessage(season, payouts);
    console.log('\n--- Broadcast Message Preview ---\n');
    console.log(message);
    console.log('\n--- End Preview ---\n');

    if (!execute) {
        console.log('Dry run only. Re-run with --execute to credit balances and mark the season finished.');
        return;
    }

    await applyPayouts(season, payouts);
    console.log('Payout applied and season marked finished.');

    if (broadcast) {
        await broadcastResults(message);
    } else {
        console.log('Broadcast skipped. Re-run with --execute --broadcast if you want to send the announcement.');
    }
}

main().catch(error => {
    console.error(error.message || error);
    process.exit(1);
});
