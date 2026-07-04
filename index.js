const { randomUUID } = require('node:crypto');
const readline = require('readline');

const fetch = global.fetch;
const TOKEN = "PUT_YOUR_DISCORD_TOKEN_HERE";

const COLORS = {
    R: '\x1b[31m',
    G: '\x1b[32m',
    Y: '\x1b[33m',
    B: '\x1b[34m',
    M: '\x1b[35m',
    C: '\x1b[36m',
    W: '\x1b[37m',
    X: '\x1b[0m'
};

const log = (c, m) => console.log(`${COLORS.Y}[${new Date().toLocaleTimeString()}]${COLORS.X} ${COLORS[c]}${m}${COLORS.X}`);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9215 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36';
const MOBILE_USER_AGENT = 'Discord-Android/335011;RNA';

let nitroMultiplier = 1.0;

const PLATFORMS = {
    DESKTOP: {
        os: 'Windows',
        browser: 'Discord Client',
        release_channel: 'stable',
        client_version: '1.0.9215',
        os_version: '10.0.19045',
        os_arch: 'x64',
        app_arch: 'x64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: '37.6.0',
        os_sdk_version: '19045',
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'focused'
    },
    MOBILE: {
        os: 'Android',
        browser: 'Discord Android',
        release_channel: 'googleRelease',
        client_version: '335.11 - rn',
        os_version: '36',
        os_arch: 'arm64',
        app_arch: 'arm64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: '',
        browser_version: '',
        os_sdk_version: '33',
        client_build_number: 33501100403287,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'active',
        client_platform: 'android',
        client_os: 'Android',
        client_device: 'X6837',
        device_vendor_id: randomUUID(),
        design_id: 2
    },
    XBOX: {
        os: 'Windows',
        browser: 'Discord Client',
        release_channel: 'stable',
        client_version: '1.0.9215',
        os_version: '10.0.19045',
        os_arch: 'x64',
        app_arch: 'x64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: '37.6.0',
        os_sdk_version: '19045',
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'focused',
        client_platform: 'xbox',
        client_os: 'Xbox',
        client_device: 'Xbox Series X'
    },
    PLAYSTATION: {
        os: 'Windows',
        browser: 'Discord Client',
        release_channel: 'stable',
        client_version: '1.0.9215',
        os_version: '10.0.19045',
        os_arch: 'x64',
        app_arch: 'x64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: '37.6.0',
        os_sdk_version: '19045',
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'focused',
        client_platform: 'ps5',
        client_os: 'PlayStation 5',
        client_device: 'PS5'
    }
};

let CURRENT_PLATFORM = PLATFORMS.DESKTOP;

function getTasks(quest) {
    return quest.config?.task_config?.tasks || quest.config?.task_config_v2?.tasks || null;
}

function getPlatformForTask(taskType) {
    if (taskType.includes('XBOX')) return PLATFORMS.XBOX;
    if (taskType.includes('PLAYSTATION') || taskType.includes('PS')) return PLATFORMS.PLAYSTATION;
    if (taskType.includes('MOBILE')) return PLATFORMS.MOBILE;
    if (taskType.includes('DESKTOP')) return PLATFORMS.DESKTOP;
    return PLATFORMS.DESKTOP;
}

function getPlatformName(taskType) {
    if (taskType.includes('XBOX')) return 'XBOX';
    if (taskType.includes('PLAYSTATION') || taskType.includes('PS')) return 'PS';
    if (taskType.includes('MOBILE')) return 'MOBILE';
    if (taskType.includes('DESKTOP')) return 'DESKTOP';
    return 'DESKTOP';
}

function getXSuperProperties(platform = CURRENT_PLATFORM) {
    return Buffer.from(JSON.stringify(platform)).toString('base64');
}

function getOrbsFromQuest(quest) {
    try {
        const rewards = quest.config?.rewards_config?.rewards;
        if (!rewards || !rewards.length) return 0;
        let totalOrbs = 0;
        for (const reward of rewards) {
            if (reward.orb_quantity) {
                totalOrbs += reward.orb_quantity;
            }
        }
        return Math.floor(totalOrbs * nitroMultiplier);
    } catch {
        return 0;
    }
}

function getRawOrbsFromQuest(quest) {
    try {
        const rewards = quest.config?.rewards_config?.rewards;
        if (!rewards || !rewards.length) return 0;
        let totalOrbs = 0;
        for (const reward of rewards) {
            if (reward.orb_quantity) {
                totalOrbs += reward.orb_quantity;
            }
        }
        return totalOrbs;
    } catch {
        return 0;
    }
}

function generateMobilePlatform() {
    const platform = { ...PLATFORMS.MOBILE };
    platform.client_launch_id = randomUUID();
    platform.launch_signature = randomUUID();
    platform.client_heartbeat_session_id = randomUUID();
    platform.device_vendor_id = randomUUID();
    return platform;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retry(fn, n = 3) {
    for (let i = 0; i < n; i++) {
        try { return await fn(); } catch { await sleep(2000); }
    }
    throw new Error('Failed after retries');
}

async function checkNitro() {
    try {
        const response = await fetch('https://discord.com/api/v9/users/@me', {
            headers: {
                'Authorization': TOKEN,
                'User-Agent': MOBILE_USER_AGENT
            }
        });
        const userData = await response.json();
        const premiumType = userData.premium_type || 0;
        if (premiumType === 1 || premiumType === 2 || premiumType === 3) {
            nitroMultiplier = 1.2;
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function fetchUser() {
    const r = await retry(() =>
        fetch('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: TOKEN,
                'User-Agent': USER_AGENT,
                'x-super-properties': getXSuperProperties()
            }
        })
    );
    if (r.status === 401) throw new Error('Invalid token');
    return r.json();
}

async function fetchBalance() {
    const platform = generateMobilePlatform();
    const r = await retry(() =>
        fetch('https://discord.com/api/v9/users/@me/virtual-currency/balance', {
            headers: {
                Authorization: TOKEN,
                'User-Agent': MOBILE_USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Accept-Encoding': 'gzip',
                'accept-language': 'en-US',
                'x-discord-locale': 'en-US',
                'x-discord-timezone': 'Asia/Riyadh',
                'x-debug-options': 'bugReporterEnabled'
            }
        })
    );
    if (r.status === 401) throw new Error('Invalid token');
    const data = await r.json();
    return data.balance || 0;
}

async function fetchQuests() {
    const r = await retry(() =>
        fetch('https://discord.com/api/v10/quests/@me', {
            headers: {
                Authorization: TOKEN,
                'User-Agent': USER_AGENT,
                'x-super-properties': getXSuperProperties()
            }
        })
    );
    if (r.status === 401) throw new Error('Invalid token');
    return r.json();
}

async function enroll(id, platform = PLATFORMS.DESKTOP) {
    await retry(() =>
        fetch(`https://discord.com/api/v10/quests/${id}/enroll`, {
            method: 'POST',
            headers: {
                Authorization: TOKEN,
                'User-Agent': USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location: 11, is_targeted: false, metadata_raw: null })
        })
    );
}

async function video(id, ts, platform = PLATFORMS.DESKTOP) {
    const r = await retry(() =>
        fetch(`https://discord.com/api/v10/quests/${id}/video-progress`, {
            method: 'POST',
            headers: {
                Authorization: TOKEN,
                'User-Agent': USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timestamp: ts })
        })
    );
    return r.json();
}

async function heartbeat(id, app, terminal, platform = PLATFORMS.DESKTOP) {
    const r = await retry(() =>
        fetch(`https://discord.com/api/v10/quests/${id}/heartbeat`, {
            method: 'POST',
            headers: {
                Authorization: TOKEN,
                'User-Agent': USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ application_id: app, terminal })
        })
    );
    return r.json();
}

async function getFreshQuest(id) {
    const data = await fetchQuests();
    return (data.quests || []).find(q => q.id === id);
}

async function runTask(q, task) {
    const questName = q.config.messages.quest_name;
    const id = q.id;
    const tasks = getTasks(q);
    const need = tasks[task].target;
    let done = q.user_status?.progress?.[task]?.value || 0;

    const taskPlatform = getPlatformForTask(task);
    const platformName = getPlatformName(task);
    const isVideo = task.includes('WATCH_VIDEO');
    const type = isVideo ? '🎬' : '🎮';

    while (done < need) {
        if (isVideo) {
            try {
                const r = await video(id, Math.min(need, done + 7 + Math.random()), taskPlatform);
                const newDone = r.progress?.[task]?.value || (done + 7);
                done = Math.min(need, newDone);
                if (r.completed_at) break;
            } catch (e) {
            }
            const time = new Date().toLocaleTimeString();
            const percent = Math.floor((done / need) * 100);
            const barLength = 20;
            const filledLength = Math.floor((done / need) * barLength);
            const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
            process.stdout.write(`\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${bar}${COLORS.X} ${COLORS.C}${done}/${need}${COLORS.X} ${COLORS.M}${percent}%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`);
            await sleep(2000);
        } else {
            try {
                const r = await heartbeat(id, q.config.application.id, false, taskPlatform);
                const newDone = r.progress?.[task]?.value || done;
                if (newDone !== done) {
                    done = newDone;
                }
                if (r.completed_at) break;
            } catch (e) {
            }
            const time = new Date().toLocaleTimeString();
            const percent = Math.floor((done / need) * 100);
            const barLength = 20;
            const filledLength = Math.floor((done / need) * barLength);
            const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
            process.stdout.write(`\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${bar}${COLORS.X} ${COLORS.C}${done}/${need}${COLORS.X} ${COLORS.M}${percent}%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`);
            if (done >= need) break;
            await sleep(30000);
        }
    }

    if (!isVideo && done >= need) {
        try {
            await heartbeat(id, q.config.application.id, true, taskPlatform);
        } catch (e) {
        }
    }

    const time = new Date().toLocaleTimeString();
    process.stdout.write(`\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${'█'.repeat(20)}${COLORS.X} ${COLORS.C}${need}/${need}${COLORS.X} ${COLORS.M}100%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}   `);
}

async function fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId) {
    const r = await retry(() =>
        fetch(`https://discord.com/api/v9/quests/get-decisions?placement=4&client_ad_session_id=${adSessionId}&client_heartbeat_session_id=${heartbeatSessionId}&num_decisions_requested=5`, {
            headers: {
                Authorization: TOKEN,
                'User-Agent': MOBILE_USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Accept-Encoding': 'gzip',
                'accept-language': 'en-US',
                'x-discord-locale': 'en-US',
                'x-discord-timezone': 'Asia/Riyadh',
                'x-debug-options': 'bugReporterEnabled'
            }
        })
    );

    if (r.status === 401) throw new Error('Invalid token');
    const data = await r.json();

    return data.decisions || [];
}

async function claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId) {
    const creative = decision.creative;
    const creativeId = creative.creative_content.id;

    const r = await fetch(
        `https://discord.com/api/v9/quests/creatives/${creativeId}/claim-reward`,
        {
            method: 'POST',
            headers: {
                Authorization: TOKEN,
                'User-Agent': MOBILE_USER_AGENT,
                'x-super-properties': getXSuperProperties(platform),
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip',
                'accept-language': 'en-US',
                'x-discord-locale': 'en-US',
                'x-discord-timezone': 'Asia/Riyadh',
                'x-debug-options': 'bugReporterEnabled'
            },
            body: JSON.stringify({
                decision_metadata_sealed: decision.metadata_sealed,
                traffic_metadata_sealed: decision.traffic_metadata_sealed,
                client_ad_session_id: adSessionId,
                client_heartbeat_session_id: heartbeatSessionId
            })
        }
    );

    return { status: r.status };
}

async function processBounties(showHeader = true) {
    if (showHeader) {
        printHeader();
        log('B', 'Fetching Bounties');
        console.log();
    }

    const platform = generateMobilePlatform();
    let adSessionId = randomUUID();
    let heartbeatSessionId = randomUUID();

    let decisions;
    try {
        decisions = await fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId);
    } catch (error) {
        log('R', `Failed to fetch bounties: ${error.message}`);
        if (showHeader) await sleep(2000);
        return 0;
    }

    if (decisions.length === 0) {
        log('Y', 'No bounties available at this time.');
        if (showHeader) await sleep(2000);
        return 0;
    }

    const uniqueDecisions = [];
    const seenCreativeIds = new Set();
    for (const d of decisions) {
        const cid = d.creative.creative_content.id;
        if (!seenCreativeIds.has(cid)) {
            seenCreativeIds.add(cid);
            uniqueDecisions.push(d);
        }
    }

    log('B', `Found ${COLORS.W}${uniqueDecisions.length}${COLORS.B} Bounties!`);
    console.log();

    await sleep(15000);

    let successCount = 0;
    let failCount = 0;
    const claimedCreativeIds = new Set();
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (attempt > 0) {
            log('Y', `\nRetrying with fresh fetch... (attempt ${attempt + 1}/${maxRetries})\n`);
            await sleep(3000);
            const newPlatform = generateMobilePlatform();
            const newAdSessionId = randomUUID();
            const newHeartbeatSessionId = randomUUID();
            try {
                decisions = await fetchAllBountiesDecisions(newPlatform, newAdSessionId, newHeartbeatSessionId);
                uniqueDecisions.length = 0;
                seenCreativeIds.clear();
                for (const d of decisions) {
                    const cid = d.creative.creative_content.id;
                    if (!seenCreativeIds.has(cid) && !claimedCreativeIds.has(cid)) {
                        seenCreativeIds.add(cid);
                        uniqueDecisions.push(d);
                    }
                }
                await sleep(5000);
            } catch (error) {
                log('R', `Failed to refetch bounties: ${error.message}`);
                break;
            }
            if (uniqueDecisions.length === 0) break;
            
            Object.assign(platform, newPlatform);
            adSessionId = newAdSessionId;
            heartbeatSessionId = newHeartbeatSessionId;
        }

        for (let i = 0; i < uniqueDecisions.length; i++) {
            const decision = uniqueDecisions[i];
            const creative = decision.creative;
            const creativeId = creative.creative_content.id;
            const advertiserName = creative.creative_content.advertiser_name;
            const productName = creative.creative_content.product_name;
            const endsAt = new Date(creative.ends_at).toLocaleDateString();

            if (claimedCreativeIds.has(creativeId)) {
                continue;
            }

            log('B', `[${i + 1}/${uniqueDecisions.length}] ${COLORS.W}${advertiserName}${COLORS.B} - ${COLORS.C}${productName}${COLORS.B} (Expires: ${endsAt})`);

            const result = await claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId);

            if (result.status === 204) {
                claimedCreativeIds.add(creativeId);
                log('G', `  ✅ Successfully claimed 50 Orbs!`);
                successCount++;
            } else {
                log('R', `  ❌ Failed! Status code: 403`);
                failCount++;
            }

            if (i < uniqueDecisions.length - 1) {
                await sleep(2000);
            }
        }

        if (failCount === 0 || attempt >= maxRetries - 1) break;
        failCount = 0;
    }

    console.log();
    log('B', 'Bounties Summary');
    log('G', `  ✅ Successful: ${successCount} × 50 = ${COLORS.Y}${successCount * 50} Orbs${COLORS.G}`);
    if (failCount > 0) {
        log('R', `  ❌ Failed: ${failCount}`);
    }
    log('B', `  🎁 Total Earned: ${COLORS.Y}${successCount * 50} Orbs${COLORS.B}`);
    console.log();

    return successCount * 50;
}

async function processBountiesParallel() {
    printHeader();
    log('B', 'Fetching Bounties - Parallel');
    console.log();

    const platform = generateMobilePlatform();
    let adSessionId = randomUUID();
    let heartbeatSessionId = randomUUID();

    let decisions;
    try {
        decisions = await fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId);
    } catch (error) {
        log('R', `Failed to fetch bounties: ${error.message}`);
        await sleep(2000);
        return 0;
    }

    if (decisions.length === 0) {
        log('Y', 'No bounties available at this time.');
        await sleep(2000);
        return 0;
    }

    const uniqueDecisions = [];
    const seenCreativeIds = new Set();
    for (const d of decisions) {
        const cid = d.creative.creative_content.id;
        if (!seenCreativeIds.has(cid)) {
            seenCreativeIds.add(cid);
            uniqueDecisions.push(d);
        }
    }

    log('B', `Found ${COLORS.W}${uniqueDecisions.length}${COLORS.B} Bounties!`);
    log('R', `${COLORS.Y}WARNING: ${COLORS.R}Parallel processing may cause rate limiting or bans!${COLORS.X}`);
    console.log();

    await sleep(1000);

    let successCount = 0;
    let failCount = 0;
    const claimedCreativeIds = new Set();
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (attempt > 0) {
            log('Y', `\nRetrying with fresh fetch... (attempt ${attempt + 1}/${maxRetries})\n`);
            await sleep(3000);
            const newPlatform = generateMobilePlatform();
            adSessionId = randomUUID();
            heartbeatSessionId = randomUUID();
            try {
                decisions = await fetchAllBountiesDecisions(newPlatform, adSessionId, heartbeatSessionId);
                uniqueDecisions.length = 0;
                seenCreativeIds.clear();
                for (const d of decisions) {
                    const cid = d.creative.creative_content.id;
                    if (!seenCreativeIds.has(cid) && !claimedCreativeIds.has(cid)) {
                        seenCreativeIds.add(cid);
                        uniqueDecisions.push(d);
                    }
                }
                await sleep(1000);
            } catch (error) {
                log('R', `Failed to refetch bounties: ${error.message}`);
                break;
            }
            if (uniqueDecisions.length === 0) break;
        }

        const claimPromises = uniqueDecisions.map(async (decision, i) => {
            const creative = decision.creative;
            const creativeId = creative.creative_content.id;
            const advertiserName = creative.creative_content.advertiser_name;
            const productName = creative.creative_content.product_name;

            log('B', `[${i + 1}/${uniqueDecisions.length}] ${COLORS.W}${advertiserName}${COLORS.B} - ${COLORS.C}${productName}${COLORS.B} Claiming...`);

            const result = await claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId);

            if (result.status === 204) {
                log('G', `  ✅ ${advertiserName} - Successfully claimed 50 Orbs!`);
                return { success: true, creativeId, name: advertiserName };
            } else {
                log('R', `  ❌ ${advertiserName} - Failed! Status code: 403`);
                return { success: false, creativeId, name: advertiserName };
            }
        });

        const results = await Promise.all(claimPromises);

        for (const r of results) {
            if (r.success) {
                claimedCreativeIds.add(r.creativeId);
            }
        }

        successCount = results.filter(r => r.success).length;
        failCount = results.filter(r => !r.success).length;

        if (failCount === 0 || attempt >= maxRetries - 1) break;
    }

    console.log();
    log('B', 'Bounties Summary');
    log('G', `  ✅ Successful: ${successCount} × 50 = ${COLORS.Y}${successCount * 50} Orbs${COLORS.G}`);
    if (failCount > 0) {
        log('R', `  ❌ Failed: ${failCount}`);
    }
    log('B', `  🎁 Total Earned: ${COLORS.Y}${successCount * 50} Orbs${COLORS.B}`);
    console.log();

    return successCount * 50;
}

async function listBounties(bounties) {
    printHeader();
    console.log(`${COLORS.C}Available Bounties:${COLORS.X}`);
    console.log();

    const seenCreativeIds = new Set();
    const uniqueDecisions = [];
    for (const d of bounties) {
        const cid = d.creative.creative_content.id;
        if (!seenCreativeIds.has(cid)) {
            seenCreativeIds.add(cid);
            uniqueDecisions.push(d);
        }
    }

    uniqueDecisions.forEach((decision, index) => {
        const creative = decision.creative;
        const advertiserName = creative.creative_content.advertiser_name;
        const productName = creative.creative_content.product_name;
        const endsAt = new Date(creative.ends_at).toLocaleDateString();
        console.log(`${COLORS.Y}${index + 1}.${COLORS.X} ${COLORS.W}${advertiserName}${COLORS.X} - ${COLORS.C}${productName}${COLORS.X} ${COLORS.B}(Expires: ${endsAt})${COLORS.X}`);
    });

    console.log();
    console.log(`${COLORS.C}Enter bounty number to claim (or 'back' to return):${COLORS.X}`);
}

async function processSpecificBounty() {
    const platform = generateMobilePlatform();
    const adSessionId = randomUUID();
    const heartbeatSessionId = randomUUID();

    let decisions;
    try {
        decisions = await fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId);
    } catch (error) {
        log('R', `Failed to fetch bounties: ${error.message}`);
        await sleep(2000);
        return;
    }

    if (decisions.length === 0) {
        log('Y', 'No bounties available at this time.');
        await sleep(2000);
        return;
    }

    const seenCreativeIds = new Set();
    const uniqueDecisions = [];
    for (const d of decisions) {
        const cid = d.creative.creative_content.id;
        if (!seenCreativeIds.has(cid)) {
            seenCreativeIds.add(cid);
            uniqueDecisions.push(d);
        }
    }

    const rl = createInterface();

    while (true) {
        await listBounties(decisions);

        const bountyChoice = await new Promise(resolve => {
            rl.question(`${COLORS.G}Bounty number: ${COLORS.X}`, resolve);
        });

        if (bountyChoice.toLowerCase() === 'back') {
            rl.close();
            return;
        }

        const bountyIndex = parseInt(bountyChoice) - 1;

        if (isNaN(bountyIndex) || bountyIndex < 0 || bountyIndex >= uniqueDecisions.length) {
            console.log(`${COLORS.R}Invalid selection${COLORS.X}`);
            await sleep(1000);
            continue;
        }

        const decision = uniqueDecisions[bountyIndex];
        const creative = decision.creative;
        const advertiserName = creative.creative_content.advertiser_name;
        const productName = creative.creative_content.product_name;

        log('B', `${COLORS.C}Claiming: ${COLORS.W}${advertiserName}${COLORS.B} - ${COLORS.C}${productName}${COLORS.X}`);

        await sleep(5000);

        let success = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) {
                log('Y', `Retrying... (attempt ${attempt + 1}/3)`);
                await sleep(3000);
            }
            const result = await claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId);
            if (result.status === 204) {
                success = true;
                break;
            }
        }

        if (success) {
            log('G', `✅ Successfully claimed 50 Orbs!`);
        } else {
            log('R', `❌ Failed! Status code: 403`);
        }

        await sleep(2000);
        rl.close();
        return;
    }

    rl.close();
}

function clearScreen() {
    console.clear();
}

function printHeader() {
    clearScreen();
    console.log(`${COLORS.G}╔══════════════════════════════════════════════════════╗`);
    console.log(`${COLORS.G}║                                                      ║`);
    console.log(`${COLORS.G}║   ██████╗ ██████╗ ██████╗ ███████╗██████╗            ║`);
    console.log(`${COLORS.G}║  ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗           ║`);
    console.log(`${COLORS.G}║  ██║     ██║   ██║██║  ██║█████╗  ██████╔╝           ║`);
    console.log(`${COLORS.G}║  ██║     ██║   ██║██║  ██║██╔══╝  ██╔══██╗           ║`);
    console.log(`${COLORS.G}║  ╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║           ║`);
    console.log(`${COLORS.G}║   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝           ║`);
    console.log(`${COLORS.G}║                                                      ║`);
    console.log(`${COLORS.G}║    ${COLORS.C}Discord Quest Fucker - by: coder.gg${COLORS.G}               ║`);
    console.log(`${COLORS.G}║                                                      ║`);
    console.log(`${COLORS.G}╚══════════════════════════════════════════════════════╝${COLORS.X}`);
    console.log();
}

function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

async function showMenu(username, balance) {
    printHeader();
    const nitroText = nitroMultiplier > 1 ? `  |  ${COLORS.M}Nitro${COLORS.X}` : '';
    console.log(`${COLORS.G}@${COLORS.W}${username}${COLORS.G}  |  ${COLORS.Y}${balance} Orbs${COLORS.G}${nitroText}`);
    console.log();
    console.log(`${COLORS.C}Please select an option:${COLORS.X}`);
    console.log(`${COLORS.Y}1.${COLORS.X} ${COLORS.W}Complete${COLORS.X} ${COLORS.G}Everything${COLORS.X} ${COLORS.M}(Bounties & Quests)${COLORS.X}`);
    console.log(`${COLORS.Y}2.${COLORS.X} ${COLORS.W}Complete${COLORS.X} ${COLORS.G}Everything${COLORS.X} ${COLORS.Y}Simultaneously${COLORS.X} ${COLORS.R}(risk)${COLORS.X}`);
    console.log(`${COLORS.Y}3.${COLORS.X} ${COLORS.W}Complete all quests sequential${COLORS.X}`);
    console.log(`${COLORS.Y}4.${COLORS.X} ${COLORS.W}Complete all quests${COLORS.X} ${COLORS.Y}simultaneously${COLORS.X} ${COLORS.R}(risk)${COLORS.X}`);
    console.log(`${COLORS.Y}5.${COLORS.X} ${COLORS.W}Complete specific quest${COLORS.X}`);
    console.log(`${COLORS.Y}6.${COLORS.X} ${COLORS.W}Complete${COLORS.X} ${COLORS.B}Bounties${COLORS.X}`);
    console.log(`${COLORS.Y}7.${COLORS.X} ${COLORS.W}Complete all${COLORS.X} ${COLORS.B}Bounties${COLORS.X} ${COLORS.Y}simultaneously${COLORS.X} ${COLORS.R}(risk)${COLORS.X}`);
    console.log(`${COLORS.Y}8.${COLORS.X} ${COLORS.W}Complete specific${COLORS.X} ${COLORS.B}Bounty${COLORS.X}`);
    console.log(`${COLORS.Y}9.${COLORS.X} ${COLORS.R}Exit${COLORS.X}`);
    console.log();
}

async function listQuests(quests) {
    printHeader();
    console.log(`${COLORS.C}Available Quests:${COLORS.X}`);
    console.log();

    quests.forEach((q, index) => {
        const name = q.config.messages.quest_name;
        const tasks = getTasks(q);
        const taskKeys = tasks ? Object.keys(tasks) : [];
        const platform = getPlatformName(taskKeys[0] || '');
        const rawOrbs = getRawOrbsFromQuest(q);
        const orbs = getOrbsFromQuest(q);
        let orbsDisplay;
        if (rawOrbs === 0) {
            orbsDisplay = `${COLORS.W}No Orbs${COLORS.X}`;
        } else if (nitroMultiplier > 1 && orbs > rawOrbs) {
            orbsDisplay = `${COLORS.Y}${orbs} Orbs${COLORS.M} (Nitro)${COLORS.X}`;
        } else {
            orbsDisplay = `${COLORS.Y}${orbs} Orbs${COLORS.X}`;
        }
        console.log(`${COLORS.Y}${index + 1}.${COLORS.X} ${COLORS.W}${name}${COLORS.X} ${COLORS.B}[${platform}]${COLORS.X} ${COLORS.G}|${COLORS.X} ${orbsDisplay}`);
    });

    console.log();
    console.log(`${COLORS.C}Enter quest number to process (or 'back' to return):${COLORS.X}`);
}

async function processQuestSequential(quest) {
    let q = quest;
    const questId = q.id;
    const questName = q.config?.messages?.quest_name || 'Unknown Quest';
    const rawOrbs = getRawOrbsFromQuest(q);
    const orbs = getOrbsFromQuest(q);

    const tasks = getTasks(q);
    if (!tasks) {
        log('R', `${COLORS.W}${questName}${COLORS.X} ${COLORS.R}Skipped: No valid tasks found${COLORS.X}`);
        return;
    }

    const taskKeys = Object.keys(tasks);
    const platform = getPlatformForTask(taskKeys[0] || '');
    const platformName = getPlatformName(taskKeys[0] || '');

    let orbsInfo = '';
    if (rawOrbs > 0) {
        if (nitroMultiplier > 1 && orbs > rawOrbs) {
            orbsInfo = ` ${COLORS.Y}[${orbs} Orbs]${COLORS.M}(Nitro)${COLORS.X}`;
        } else {
            orbsInfo = ` ${COLORS.Y}[${orbs} Orbs]${COLORS.X}`;
        }
    } else {
        orbsInfo = ` ${COLORS.W}[No Orbs]${COLORS.X}`;
    }

    if (!q.user_status?.enrolled_at) {
        log('Y', `${COLORS.B}Enrolling${COLORS.X} in ${COLORS.W}${questName}${COLORS.X}${orbsInfo} ${COLORS.B}[${platformName}]${COLORS.X}`);
        await enroll(questId, platform);
    }

    while (true) {
        q = await getFreshQuest(questId);
        if (!q || q.user_status?.completed_at) break;

        const currentTasks = getTasks(q);
        if (!currentTasks) break;

        const currentTaskKeys = Object.keys(currentTasks);
        const pending = currentTaskKeys.filter(t => {
            const need = currentTasks[t].target;
            const done = q.user_status?.progress?.[t]?.value || 0;
            return done < need;
        });

        if (!pending.length) break;

        const task = pending[0];
        await runTask(q, task);
        await sleep(3000);
    }

    const freshQ = await getFreshQuest(questId);
    console.log();
    if (freshQ && freshQ.user_status?.completed_at) {
        log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}fully completed${COLORS.X}${orbsInfo}`);
    } else if (freshQ) {
        log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}progressed (check status)${COLORS.X}${orbsInfo}`);
    } else {
        log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}fully completed${COLORS.X}${orbsInfo}`);
    }
}

async function processAllQuestsParallel(quests) {
    log('Y', `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests for ${COLORS.M}parallel${COLORS.C} processing${COLORS.X}`);

    let totalOrbs = 0;
    quests.forEach(q => {
        totalOrbs += getOrbsFromQuest(q);
    });
    log('Y', `${COLORS.Y}Total potential Orbs: ${COLORS.G}${totalOrbs}${COLORS.X}`);
    log('R', `${COLORS.Y}WARNING: ${COLORS.R}Parallel processing may cause rate limiting or bans!${COLORS.X}`);

    const enrollPromises = quests.map(async (q) => {
        const tasks = getTasks(q);
        if (!q.user_status?.enrolled_at && tasks) {
            try {
                const taskKeys = Object.keys(tasks);
                const platform = getPlatformForTask(taskKeys[0] || '');
                const platformName = getPlatformName(taskKeys[0] || '');
                log('Y', `${COLORS.B}Enrolling${COLORS.X} in ${COLORS.W}${q.config.messages.quest_name}${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`);
                await enroll(q.id, platform);
            } catch {}
        }
    });

    await Promise.all(enrollPromises);
    await sleep(2000);

    const freshData = await fetchQuests();
    const freshQuests = (freshData.quests || []).filter(q =>
        q && q.config && q.config.expires_at &&
        !q.user_status?.completed_at &&
        quests.some(orig => orig.id === q.id)
    );

    const processPromises = freshQuests.map(async (q) => {
        const questId = q.id;
        const questName = q.config?.messages?.quest_name;
        let currentQ = q;

        while (true) {
            try {
                const freshQ = await getFreshQuest(questId);
                if (!freshQ) break;
                currentQ = freshQ;

                if (currentQ.user_status?.completed_at) {
                    console.log();
                    log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}completed${COLORS.X}`);
                    break;
                }

                const tasks = getTasks(currentQ);
                if (!tasks) break;

                const taskKeys = Object.keys(tasks);
                const pending = taskKeys.filter(t => {
                    const need = tasks[t].target;
                    const done = currentQ.user_status?.progress?.[t]?.value || 0;
                    return done < need;
                });

                if (!pending.length) {
                    console.log();
                    log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}completed${COLORS.X}`);
                    break;
                }

                const task = pending[0];
                await runTask(currentQ, task);

                await sleep(3000);

            } catch (error) {
                console.log();
                log('R', `${COLORS.W}${questName}${COLORS.X} ${COLORS.R}error${COLORS.X}`);
                break;
            }
        }
    });

    await Promise.all(processPromises);

    console.log();
    log('G', `${COLORS.C}All ${COLORS.G}${freshQuests.length}${COLORS.C} quests ${COLORS.G}completed${COLORS.X} ${COLORS.M}in parallel${COLORS.X}`);
}

async function completeEverything() {
    log('G', 'Starting Complete Everything (Sequential)');
    console.log();

    log('B', 'Phase 1: Processing Bounties...');
    const bountyOrbs = await processBounties(false);
    await sleep(2000);

    log('B', 'Phase 2: Processing Quests...');
    console.log();
    const data = await fetchQuests();
    const quests = (data.quests || []).filter(q =>
        q && q.config && q.config.expires_at &&
        !q.user_status?.completed_at &&
        new Date(q.config.expires_at) > new Date()
    );

    if (quests.length === 0) {
        log('Y', 'No quests available at this time.');
        console.log();
        log('G', 'Everything Completed');
        log('G', `  🎁 Bounties: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
        log('G', `  🎮 Quests: ${COLORS.Y}0 Orbs${COLORS.G}`);
        log('G', `  🏆 Grand Total: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
        console.log();
        await sleep(3000);
        return;
    }

    let questOrbs = 0;
    quests.forEach(q => {
        questOrbs += getOrbsFromQuest(q);
    });

    log('Y', `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests ${COLORS.Y}[Total: ${questOrbs} Orbs]${COLORS.X}`);

    for (const q of quests) {
        if (!q || !q.id) continue;
        try {
            await processQuestSequential(q);
        } catch (error) {
            log('R', `Error processing quest: ${error.message}`);
        }
    }

    console.log();
    log('G', 'Everything Completed');
    log('G', `  🎁 Bounties: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
    log('G', `  🎮 Quests: ${COLORS.Y}${questOrbs} Orbs${COLORS.G}`);
    log('G', `  🏆 Grand Total: ${COLORS.Y}${bountyOrbs + questOrbs} Orbs${COLORS.G}`);
    console.log();

    await sleep(3000);
}

async function completeEverythingParallel() {
    log('G', 'Starting Complete Everything (Parallel)');
    log('R', `${COLORS.Y}WARNING: ${COLORS.R}Parallel processing may cause rate limiting or bans!${COLORS.X}`);
    console.log();

    const data = await fetchQuests();
    const quests = (data.quests || []).filter(q =>
        q && q.config && q.config.expires_at &&
        !q.user_status?.completed_at &&
        new Date(q.config.expires_at) > new Date()
    );

    let questOrbs = 0;
    quests.forEach(q => {
        questOrbs += getOrbsFromQuest(q);
    });

    const everythingPromises = [];

    everythingPromises.push(processBountiesParallel().then(result => {
        return { type: 'bounties', orbs: result };
    }));

    everythingPromises.push((async () => {
        if (quests.length === 0) {
            log('Y', 'No quests available.');
            return { type: 'quests', orbs: 0 };
        }
        try {
            await processAllQuestsParallel(quests);
        } catch (error) {
            log('R', `Error processing quests: ${error.message}`);
        }
        return { type: 'quests', orbs: questOrbs };
    })());

    const results = await Promise.all(everythingPromises);

    const bountyResult = results.find(r => r.type === 'bounties');
    const questResult = results.find(r => r.type === 'quests');

    console.log();
    log('G', 'Everything Completed (Parallel)');
    log('G', `  🎁 Bounties: ${COLORS.Y}${bountyResult.orbs} Orbs${COLORS.G}`);
    log('G', `  🎮 Quests: ${COLORS.Y}${questResult.orbs} Orbs${COLORS.G}`);
    log('G', `  🏆 Grand Total: ${COLORS.Y}${bountyResult.orbs + questResult.orbs} Orbs${COLORS.G}`);
    console.log();

    await sleep(3000);
}

async function main() {
    const rl = createInterface();

    try {
        await checkNitro();
        
        const user = await fetchUser();
        if (!user.username) {
            console.log(`${COLORS.R}Invalid token detected${COLORS.X}`);
            rl.close();
            process.exit(1);
        }

        log('G', `${COLORS.C}Logged in as ${COLORS.W}${user.username}${COLORS.X}`);
        await sleep(1000);

        while (true) {
            let balance = 0;
            try {
                balance = await fetchBalance();
            } catch (e) {
            }

            await showMenu(user.username, balance);

            const choice = await new Promise(resolve => {
                rl.question(`${COLORS.G}Your choice: ${COLORS.X}`, resolve);
            });

            if (choice === '1') {
                await completeEverything();

            } else if (choice === '2') {
                await completeEverythingParallel();

            } else if (choice === '3') {
                const data = await fetchQuests();
                const quests = (data.quests || []).filter(q =>
                    q && q.config && q.config.expires_at &&
                    !q.user_status?.completed_at &&
                    new Date(q.config.expires_at) > new Date()
                );

                if (quests.length === 0) {
                    log('Y', 'No quests available at this time.');
                    await sleep(2000);
                    continue;
                }

                let totalOrbs = 0;
                quests.forEach(q => {
                    totalOrbs += getOrbsFromQuest(q);
                });

                log('Y', `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests ${COLORS.Y}[Total: ${totalOrbs} Orbs]${COLORS.X}`);

                for (const q of quests) {
                    if (!q || !q.id) continue;
                    try {
                        await processQuestSequential(q);
                    } catch (error) {
                        log('R', `Error: ${error.message}`);
                    }
                }

                log('G', `${COLORS.C}All quests ${COLORS.G}finished${COLORS.X}`);
                await sleep(2000);

            } else if (choice === '4') {
                const data = await fetchQuests();
                const quests = (data.quests || []).filter(q =>
                    q && q.config && q.config.expires_at &&
                    !q.user_status?.completed_at &&
                    new Date(q.config.expires_at) > new Date()
                );

                if (quests.length === 0) {
                    log('Y', 'No available quests found');
                    await sleep(2000);
                    continue;
                }

                try {
                    await processAllQuestsParallel(quests);
                } catch (error) {
                    log('R', `Error: ${error.message}`);
                }
                await sleep(2000);

            } else if (choice === '5') {
                while (true) {
                    const data = await fetchQuests();

                    const quests = (data.quests || []).filter(q =>
                        q && q.config && q.config.expires_at &&
                        !q.user_status?.completed_at &&
                        new Date(q.config.expires_at) > new Date()
                    );

                    if (quests.length === 0) {
                        log('Y', 'No quests available at this time.');
                        await sleep(2000);
                        break;
                    }

                    await listQuests(quests);

                    const questChoice = await new Promise(resolve => {
                        rl.question(`${COLORS.G}Quest number: ${COLORS.X}`, resolve);
                    });

                    if (questChoice.toLowerCase() === 'back') {
                        break;
                    }

                    const questIndex = parseInt(questChoice) - 1;

                    if (isNaN(questIndex) || questIndex < 0 || questIndex >= quests.length) {
                        console.log(`${COLORS.R}Invalid selection${COLORS.X}`);
                        await sleep(1000);
                        continue;
                    }

                    const selectedQuest = quests[questIndex];
                    const orbs = getOrbsFromQuest(selectedQuest);
                    log('Y', `${COLORS.C}Selected: ${COLORS.W}${selectedQuest.config.messages.quest_name}${COLORS.X} ${COLORS.Y}[${orbs} Orbs]${COLORS.X}`);
                    try {
                        await processQuestSequential(selectedQuest);
                    } catch (error) {
                        log('R', `Error: ${error.message}`);
                    }

                    log('G', `${COLORS.C}Quest ${COLORS.G}completed successfully${COLORS.X}`);
                    await sleep(2000);
                }

            } else if (choice === '6') {
                await processBounties();
                await sleep(2000);

            } else if (choice === '7') {
                await processBountiesParallel();
                await sleep(2000);

            } else if (choice === '8') {
                await processSpecificBounty();
                await sleep(1000);

            } else if (choice === '9') {
                break;
            } else {
                console.log(`${COLORS.R}Invalid choice${COLORS.X}`);
                await sleep(1000);
            }
        }

        rl.close();
        console.log(`${COLORS.G}Goodbye!${COLORS.X}`);
        process.exit(0);

    } catch (error) {
        if (error.message.includes('Invalid token')) {
            console.log(`${COLORS.R}Error: Invalid Discord token${COLORS.X}`);
            console.log(`${COLORS.R}Please check your token in the TOKEN variable${COLORS.X}`);
        } else {
            log('R', `${COLORS.C}Error: ${COLORS.R}${error.message}${COLORS.X}`);
        }
        rl.close();
        process.exit(1);
    }
}

main();
