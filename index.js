const { randomUUID } = require('node:crypto');
const readline = require('readline');

const fetch = global.fetch;
const TOKEN = 'PUT_YOUR_DISCORD_TOKEN_HERE';

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
        browser: 'Discord Client',
        release_channel: 'stable',
        client_version: '1.0.9215',
        os_version: '13',
        os_arch: 'arm64',
        app_arch: 'arm64',
        system_locale: 'en-US',
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: '37.6.0',
        os_sdk_version: '33',
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: 'focused',
        client_platform: 'android',
        client_os: 'Android',
        client_device: 'SM-G998B'
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
let progressInterval = null;
let currentProgressData = { questName: '', done: 0, need: 0, platformName: '', isVideo: false, lastUpdateTime: 0, lastDone: 0 };

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
        return totalOrbs;
    } catch {
        return 0;
    }
}

function startProgressDisplay() {
    if (progressInterval) return;
    progressInterval = setInterval(() => {
        const { questName, done, need, platformName, isVideo, lastUpdateTime, lastDone } = currentProgressData;
        if (need > 0 && lastUpdateTime > 0) {
            const time = new Date().toLocaleTimeString();
            const elapsed = (Date.now() - lastUpdateTime) / 1000;
            const incrementPerSec = isVideo ? (7 / 2) : (30 / 30);
            const estimatedTotal = lastDone + Math.floor(elapsed * incrementPerSec);
            const displayDone = Math.min(need, Math.max(done, estimatedTotal));
            const percent = Math.floor((displayDone / need) * 100);
            const barLength = 20;
            const filledLength = Math.floor((displayDone / need) * barLength);
            const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
            const type = isVideo ? '🎬' : '🎮';
            process.stdout.write(`\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${bar}${COLORS.X} ${COLORS.C}${displayDone}/${need}${COLORS.X} ${COLORS.M}${percent}%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`);
        }
    }, 500);
}

function stopProgressDisplay() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgressData(questName, done, need, platformName, isVideo = false) {
    currentProgressData = {
        questName,
        done: Math.min(done, need),
        need,
        platformName,
        isVideo,
        lastUpdateTime: Date.now(),
        lastDone: Math.min(done, need)
    };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function retry(fn, n = 5) {
    for (let i = 0; i < n; i++) {
        try { return await fn(); } catch { await sleep(3000); }
    }
    throw new Error('Failed after retries');
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

async function runTaskParallel(q, task) {
    const questName = q.config.messages.quest_name;
    const id = q.id;
    const tasks = getTasks(q);
    const need = tasks[task].target;
    let done = q.user_status?.progress?.[task]?.value || 0;
    
    const taskPlatform = getPlatformForTask(task);
    const platformName = getPlatformName(task);
    const isVideo = task.includes('WATCH_VIDEO');

    updateProgressData(questName, done, need, platformName, isVideo);
    startProgressDisplay();

    if (isVideo) {
        while (done < need) {
            try {
                const r = await video(id, Math.min(need, done + 7 + Math.random()), taskPlatform);
                done += 7;
                updateProgressData(questName, Math.min(done, need), need, platformName, isVideo);
                if (r.completed_at) break;
            } catch {
                updateProgressData(questName, done, need, platformName, isVideo);
            }
            await sleep(2000);
        }
    } else {
        while (done < need) {
            try {
                const r = await heartbeat(id, q.config.application.id, false, taskPlatform);
                const newDone = r.progress?.[task]?.value || done;
                if (newDone !== done) {
                    done = newDone;
                    updateProgressData(questName, done, need, platformName, isVideo);
                }
                if (r.completed_at) break;
            } catch {
                updateProgressData(questName, done, need, platformName, isVideo);
            }
            await sleep(30000);
        }
        try {
            await heartbeat(id, q.config.application.id, true, taskPlatform);
        } catch {}
    }
    
    stopProgressDisplay();
    updateProgressData(questName, need, need, platformName, isVideo);
    const time = new Date().toLocaleTimeString();
    const type = isVideo ? '🎬' : '🎮';
    process.stdout.write(`\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${'█'.repeat(20)}${COLORS.X} ${COLORS.C}${need}/${need}${COLORS.X} ${COLORS.M}100%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}\n`);
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

async function showMenu() {
    printHeader();
    console.log(`${COLORS.C}Please select an option:${COLORS.X}`);
    console.log(`${COLORS.Y}1.${COLORS.X} Complete all quests ${COLORS.M}sequential${COLORS.X}`);
    console.log(`${COLORS.Y}2.${COLORS.X} Complete all quests ${COLORS.M}simultaneously${COLORS.X} ${COLORS.R}(risk)${COLORS.X}`);
    console.log(`${COLORS.Y}3.${COLORS.X} Complete ${COLORS.M}specific${COLORS.X} quest`);
    console.log(`${COLORS.Y}4.${COLORS.X} ${COLORS.R}Exit${COLORS.X}`);
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
        const orbs = getOrbsFromQuest(q);
        const orbsDisplay = orbs > 0 ? `${COLORS.Y}${orbs} Orbs${COLORS.X}` : `${COLORS.R}No Orbs${COLORS.X}`;
        console.log(`${COLORS.Y}${index + 1}.${COLORS.X} ${COLORS.W}${name}${COLORS.X} ${COLORS.B}[${platform}]${COLORS.X} ${COLORS.G}|${COLORS.X} ${orbsDisplay}`);
    });
    
    console.log();
    console.log(`${COLORS.C}Enter quest number to process (or 'back' to return):${COLORS.X}`);
}

async function processQuestSequential(quest) {
    let q = quest;
    const questName = q.config?.messages?.quest_name || 'Unknown Quest';
    const orbs = getOrbsFromQuest(q);

    const tasks = getTasks(q);
    if (!tasks) {
        log('R', `${COLORS.W}${questName}${COLORS.X} ${COLORS.R}Skipped: No valid tasks found${COLORS.X}`);
        return;
    }

    const taskKeys = Object.keys(tasks);
    const platform = getPlatformForTask(taskKeys[0] || '');
    const platformName = getPlatformName(taskKeys[0] || '');

    if (!q.user_status?.enrolled_at) {
        log('Y', `${COLORS.B}Enrolling${COLORS.X} in ${COLORS.W}${questName}${COLORS.X} ${COLORS.Y}[${orbs} Orbs]${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`);
        await enroll(q.id, platform);
    }

    while (true) {
        q = await getFreshQuest(q.id);
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
        await runTaskParallel(q, task);
        await sleep(3000);
    }

    log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}fully completed${COLORS.X} ${COLORS.Y}[${orbs} Orbs earned]${COLORS.X}`);
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
        !q.user_status?.completed_at &&
        quests.some(orig => orig.id === q.id)
    );

    const processPromises = freshQuests.map(async (q) => {
        const questName = q.config?.messages?.quest_name;
        let currentQ = q;
        
        while (true) {
            try {
                if (currentQ.user_status?.completed_at) {
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
                    log('G', `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}completed${COLORS.X}`);
                    break;
                }

                const task = pending[0];
                await runTaskParallel(currentQ, task);
                
                await sleep(3000);
                const freshQ = await getFreshQuest(currentQ.id);
                if (freshQ) currentQ = freshQ;
                
            } catch (error) {
                log('R', `${COLORS.W}${questName}${COLORS.X} ${COLORS.R}error${COLORS.X}`);
                break;
            }
        }
    });

    await Promise.all(processPromises);
    
    log('G', `${COLORS.C}All ${COLORS.G}${freshQuests.length}${COLORS.C} quests ${COLORS.G}completed${COLORS.X} ${COLORS.M}in parallel${COLORS.X}`);
}

async function main() {
    const rl = createInterface();
    
    try {
        const user = await fetchUser();
        if (!user.username) {
            console.log(`${COLORS.R}Invalid token detected${COLORS.X}`);
            rl.close();
            process.exit(1);
        }
        
        log('G', `${COLORS.C}Logged in as ${COLORS.W}${user.username}${COLORS.X}`);
        await sleep(1000);

        while (true) {
            await showMenu();
            
            const choice = await new Promise(resolve => {
                rl.question(`${COLORS.G}Your choice: ${COLORS.X}`, resolve);
            });

            if (choice === '1') {
                const data = await fetchQuests();
                const quests = (data.quests || []).filter(q =>
                    !q.user_status?.completed_at &&
                    new Date(q.config.expires_at) > new Date()
                );

                let totalOrbs = 0;
                quests.forEach(q => {
                    totalOrbs += getOrbsFromQuest(q);
                });

                log('Y', `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests ${COLORS.Y}[Total: ${totalOrbs} Orbs]${COLORS.X}`);
                
                for (const q of quests) {
                    await processQuestSequential(q);
                }
                
                log('G', `${COLORS.C}All quests ${COLORS.G}finished${COLORS.X}`);
                await sleep(2000);
                
            } else if (choice === '2') {
                const data = await fetchQuests();
                const quests = (data.quests || []).filter(q =>
                    !q.user_status?.completed_at &&
                    new Date(q.config.expires_at) > new Date()
                );

                if (quests.length === 0) {
                    console.log(`${COLORS.R}No available quests found${COLORS.X}`);
                    await sleep(2000);
                    continue;
                }

                await processAllQuestsParallel(quests);
                await sleep(2000);
                
            } else if (choice === '3') {
                while (true) {
                    const data = await fetchQuests();

                    const quests = (data.quests || []).filter(q =>
                        !q.user_status?.completed_at &&
                        new Date(q.config.expires_at) > new Date()
                    );

                    if (quests.length === 0) {
                        console.log(`${COLORS.R}No available quests found${COLORS.X}`);
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
                    await processQuestSequential(selectedQuest);
                    
                    log('G', `${COLORS.C}Quest ${COLORS.G}completed successfully${COLORS.X}`);
                    await sleep(2000);
                }
                
            } else if (choice === '4') {
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
