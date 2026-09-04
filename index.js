const { randomUUID } = require("node:crypto");
const readline = require("readline");

const fetch = global.fetch;
const TOKEN = "TOKEN"; // set ur ahh token here (pls run the script locally for ur privacy)

const COLORS = {
    R: "\x1b[31m",
    G: "\x1b[32m",
    Y: "\x1b[33m",
    B: "\x1b[34m",
    M: "\x1b[35m",
    C: "\x1b[36m",
    W: "\x1b[37m",
    X: "\x1b[0m",
};

const log = (c, m) =>
    console.log(`${COLORS.Y}[${new Date().toLocaleTimeString()}]${COLORS.X} ${COLORS[c]}${m}${COLORS.X}`);

const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9215 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36";
const MOBILE_USER_AGENT = "Discord-Android/343012;RNA";

let nitroMultiplier = 1.0;
let installationId = randomUUID();
let storedCookies = "";

const HEADERS = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-ch-ua": '"Not/A)Brand";v="99", "Chromium";v="148"',
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-debug-options": "bugReporterEnabled",
    "x-discord-locale": "en-US",
    "x-discord-timezone": "Asia/Riyadh",
};

const PLATFORMS = {
    DESKTOP: {
        os: "Windows",
        browser: "Discord Client",
        release_channel: "stable",
        client_version: "1.0.9215",
        os_version: "10.0.19045",
        os_arch: "x64",
        app_arch: "x64",
        system_locale: "en-US",
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: "37.6.0",
        os_sdk_version: "19045",
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: "focused",
    },
    MOBILE: {
        os: "Android",
        browser: "Discord Android",
        release_channel: "googleRelease",
        client_version: "343.12 - rn",
        os_version: "36",
        os_arch: "arm64",
        app_arch: "arm64",
        system_locale: "en-US",
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: "",
        browser_version: "",
        os_sdk_version: "33",
        client_build_number: 6312,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: "active",
        client_platform: "android",
        client_os: "Android",
        client_device: "X6837",
        device_vendor_id: randomUUID(),
        design_id: 2,
    },
    XBOX: {
        os: "Windows",
        browser: "Discord Client",
        release_channel: "stable",
        client_version: "1.0.9215",
        os_version: "10.0.19045",
        os_arch: "x64",
        app_arch: "x64",
        system_locale: "en-US",
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: "37.6.0",
        os_sdk_version: "19045",
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: "focused",
        client_platform: "xbox",
        client_os: "Xbox",
        client_device: "Xbox Series X",
    },
    PLAYSTATION: {
        os: "Windows",
        browser: "Discord Client",
        release_channel: "stable",
        client_version: "1.0.9215",
        os_version: "10.0.19045",
        os_arch: "x64",
        app_arch: "x64",
        system_locale: "en-US",
        has_client_mods: false,
        client_launch_id: randomUUID(),
        browser_user_agent: USER_AGENT,
        browser_version: "37.6.0",
        os_sdk_version: "19045",
        client_build_number: 471091,
        native_build_number: 72186,
        client_event_source: null,
        launch_signature: randomUUID(),
        client_heartbeat_session_id: randomUUID(),
        client_app_state: "focused",
        client_platform: "ps5",
        client_os: "PlayStation 5",
        client_device: "PS5",
    },
};

let CURRENT_PLATFORM = PLATFORMS.DESKTOP;

const getTasks = quest => quest.config?.task_config?.tasks || quest.config?.task_config_v2?.tasks || null;
const getPlatformForTask = taskType => {
    if (taskType.includes("XBOX")) return PLATFORMS.XBOX;
    if (taskType.includes("PLAYSTATION") || taskType.includes("PS")) return PLATFORMS.PLAYSTATION;
    if (taskType.includes("MOBILE")) return PLATFORMS.MOBILE;
    return PLATFORMS.DESKTOP;
};
const getPlatformName = taskType => {
    if (taskType.includes("XBOX")) return "XBOX";
    if (taskType.includes("PLAYSTATION") || taskType.includes("PS")) return "PS";
    if (taskType.includes("MOBILE")) return "MOBILE";
    return "DESKTOP";
};
const getXSuperProperties = (platform = CURRENT_PLATFORM) => Buffer.from(JSON.stringify(platform)).toString("base64");
const getOrbsFromQuest = quest => {
    try {
        const rewards = quest.config?.rewards_config?.rewards;
        if (!rewards || !rewards.length) return 0;
        let totalOrbs = 0;
        for (const reward of rewards) {
            if (reward.orb_quantity) totalOrbs += reward.orb_quantity;
        }
        return Math.floor(totalOrbs * nitroMultiplier);
    } catch {
        return 0;
    }
};
const getRawOrbsFromQuest = quest => {
    try {
        const rewards = quest.config?.rewards_config?.rewards;
        if (!rewards || !rewards.length) return 0;
        let totalOrbs = 0;
        for (const reward of rewards) {
            if (reward.orb_quantity) totalOrbs += reward.orb_quantity;
        }
        return totalOrbs;
    } catch {
        return 0;
    }
};
const generateMobilePlatform = () => {
    const platform = { ...PLATFORMS.MOBILE };
    platform.client_launch_id = randomUUID();
    platform.launch_signature = randomUUID();
    platform.client_heartbeat_session_id = randomUUID();
    platform.device_vendor_id = randomUUID();
    return platform;
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
const randomSleep = (min, max) => sleep(min + Math.random() * (max - min));
const retry = async (fn, n = 3) => {
    for (let i = 0; i < n; i++) {
        try {
            return await fn();
        } catch {
            await sleep(2000);
        }
    }
    throw new Error("Failed after retries");
};
const getCookie = () => storedCookies;
const setCookie = cookies => {
    storedCookies = cookies;
};

const createHeaders = (token, platform, extra = {}) => ({
    Authorization: token,
    "User-Agent": USER_AGENT,
    "x-super-properties": getXSuperProperties(platform),
    "x-installation-id": installationId,
    referer: "https://discord.com/quest-home",
    origin: "https://discord.com",
    "sec-ch-ua-platform": `"${platform.os || "Windows"}"`,
    host: "discord.com",
    cookie: getCookie(),
    ...HEADERS,
    ...extra,
});

const createMobileHeaders = (token, platform, extra = {}) => ({
    Authorization: token,
    "User-Agent": MOBILE_USER_AGENT,
    "x-super-properties": getXSuperProperties(platform),
    "x-installation-id": installationId,
    "Accept-Encoding": "gzip",
    host: "discord.com",
    cookie: getCookie(),
    ...HEADERS,
    ...extra,
});

const checkNitro = async () => {
    try {
        const response = await fetch("https://discord.com/api/v9/users/@me", {
            headers: { Authorization: TOKEN, "User-Agent": MOBILE_USER_AGENT },
        });
        const userData = await response.json();
        const premiumType = userData.premium_type || 0;
        if (premiumType === 1 || premiumType === 2 || premiumType === 3) {
            nitroMultiplier = 1.2;
            return true;
        }
        return false;
    } catch {
        return false;
    }
};

const fetchUser = async () => {
    const r = await retry(() =>
        fetch("https://discord.com/api/v10/users/@me", {
            headers: createHeaders(TOKEN, CURRENT_PLATFORM),
        }),
    );
    if (r.status === 401) throw new Error("Invalid token");
    const data = await r.json();
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return data;
};

const fetchBalance = async () => {
    const platform = generateMobilePlatform();
    const r = await retry(() =>
        fetch("https://discord.com/api/v9/users/@me/virtual-currency/balance", {
            headers: createMobileHeaders(TOKEN, platform),
        }),
    );
    if (r.status === 401) throw new Error("Invalid token");
    const data = await r.json();
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return data.balance || 0;
};

const fetchQuests = async () => {
    const r = await retry(() =>
        fetch("https://discord.com/api/v10/quests/@me", {
            headers: createHeaders(TOKEN, CURRENT_PLATFORM),
        }),
    );
    if (r.status === 401) throw new Error("Invalid token");
    const data = await r.json();
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return data;
};

const enroll = async (id, platform = PLATFORMS.DESKTOP) => {
    await retry(() =>
        fetch(`https://discord.com/api/v10/quests/${id}/enroll`, {
            method: "POST",
            headers: createHeaders(TOKEN, platform),
            body: JSON.stringify({ location: 11, is_targeted: false, metadata_raw: null }),
        }),
    );
};

const video = async (id, ts, platform = PLATFORMS.DESKTOP) => {
    const isMobile = platform === PLATFORMS.MOBILE;
    const headers = isMobile ? createMobileHeaders(TOKEN, platform) : createHeaders(TOKEN, platform);
    const r = await retry(() =>
        fetch(`https://discord.com/api/v9/quests/${id}/video-progress`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ timestamp: ts }),
        }),
    );
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return r.json();
};

const heartbeat = async (id, app, terminal, platform = PLATFORMS.DESKTOP, executablePath = null) => {
    const body = { application_id: app, terminal };
    if (executablePath) {
        body.executable_path = executablePath;
    }
    const r = await retry(() =>
        fetch(`https://discord.com/api/v9/quests/${id}/heartbeat`, {
            method: "POST",
            headers: createHeaders(TOKEN, platform),
            body: JSON.stringify(body),
        }),
    );
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return r.json();
};

const getFreshQuest = async id => {
    const data = await fetchQuests();
    return (data.quests || []).find(q => q.id === id);
};

const fetchAllBountiesDecisions = async (platform, adSessionId, heartbeatSessionId) => {
    const r = await retry(() =>
        fetch(
            `https://discord.com/api/v9/quests/get-decisions?placement=4&client_ad_session_id=${adSessionId}&client_heartbeat_session_id=${heartbeatSessionId}&num_decisions_requested=5`,
            {
                headers: createMobileHeaders(TOKEN, platform),
            },
        ),
    );
    if (r.status === 401) throw new Error("Invalid token");
    const data = await r.json();
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return data.decisions || [];
};

const claimBountyWithSession = async (decision, platform, adSessionId, heartbeatSessionId) => {
    const creativeId = decision.creative.creative_content.id;
    const r = await fetch(`https://discord.com/api/v9/quests/creatives/${creativeId}/claim-reward`, {
        method: "POST",
        headers: createMobileHeaders(TOKEN, platform),
        body: JSON.stringify({
            decision_metadata_sealed: decision.metadata_sealed,
            traffic_metadata_sealed: decision.traffic_metadata_sealed,
            client_ad_session_id: adSessionId,
            client_heartbeat_session_id: heartbeatSessionId,
        }),
    });
    if (r.headers.get("set-cookie")) {
        setCookie(r.headers.get("set-cookie"));
    }
    return { status: r.status };
};

const countdown = async seconds => {
    for (let i = seconds; i > 0; i--) {
        const time = new Date().toLocaleTimeString();
        process.stdout.write(
            `\r${COLORS.Y}[${time}]${COLORS.X} ${COLORS.B}Waiting ${COLORS.C}${i}${COLORS.B} seconds before next bounty...${COLORS.X}`,
        );
        await sleep(1000);
    }
    process.stdout.write(`\r${" ".repeat(80)}\r`);
};

const drawProgressBar = (done, need, questName, type, platformName) => {
    const percent = Math.floor((done / need) * 100);
    const barLength = 20;
    const filledLength = Math.floor((done / need) * barLength);
    const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);
    const time = new Date().toLocaleTimeString();
    process.stdout.write(
        `\r${COLORS.Y}[${time}]${COLORS.X} ${type} ${COLORS.W}${questName}${COLORS.X} ${COLORS.G}${bar}${COLORS.X} ${COLORS.C}${done}/${need}${COLORS.X} ${COLORS.M}${percent}%${COLORS.X} ${COLORS.B}[${platformName}]${COLORS.X}`,
    );
};

const runTask = async (q, task) => {
    const questName = q.config.messages.quest_name;
    const id = q.id;
    const tasks = getTasks(q);
    const need = tasks[task].target;
    let done = q.user_status?.progress?.[task]?.value || 0;
    const taskPlatform = getPlatformForTask(task);
    const platformName = getPlatformName(task);
    const isVideo = task.includes("WATCH_VIDEO");
    const type = isVideo ? "🎬" : "🎮";
    let isFirstVideoRequest = done === 0 && isVideo;

    while (done < need) {
        if (isVideo) {
            try {
                let newTimestamp;
                if (isFirstVideoRequest) {
                    newTimestamp = 0.2 + Math.random() * 0.1;
                    isFirstVideoRequest = false;
                } else {
                    const increment = 7 + Math.random() * 2;
                    newTimestamp = Math.min(need, done + increment);
                }
                const r = await video(id, newTimestamp, taskPlatform);
                const newDone = r.progress?.[task]?.value || newTimestamp;
                done = Math.min(need, newDone);
                if (r.completed_at) break;
            } catch (e) {}
            drawProgressBar(done, need, questName, type, platformName);
            await randomSleep(5000, 8000);
        } else {
            try {
                const executablePath = q.config?.application?.executable_path || "game/game.exe";
                const r = await heartbeat(id, q.config.application.id, false, taskPlatform, executablePath);
                const newDone = r.progress?.[task]?.value || done;
                if (newDone !== done) done = newDone;
                if (r.completed_at) break;
            } catch (e) {}
            drawProgressBar(done, need, questName, type, platformName);
            if (done >= need) break;
            await randomSleep(25000, 35000);
        }
    }

    if (!isVideo && done >= need) {
        try {
            const executablePath = q.config?.application?.executable_path || "game/game.exe";
            await heartbeat(id, q.config.application.id, true, taskPlatform, executablePath);
        } catch (e) {}
    }

    drawProgressBar(need, need, questName, type, platformName);
    process.stdout.write("   ");
};

const processBounties = async (showHeader = true) => {
    if (showHeader) {
        printHeader();
        log("B", "Fetching Bounties");
        console.log();
    }

    const platform = generateMobilePlatform();
    let adSessionId = randomUUID();
    let heartbeatSessionId = randomUUID();

    let decisions;
    try {
        decisions = await fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId);
    } catch (error) {
        log("R", `Failed to fetch bounties: ${error.message}`);
        if (showHeader) await sleep(2000);
        return 0;
    }

    if (decisions.length === 0) {
        log("Y", "No bounties available at this time.");
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

    log("B", `Found ${COLORS.W}${uniqueDecisions.length}${COLORS.B} Bounties!`);
    console.log();

    await countdown(15);

    let successCount = 0;
    let failCount = 0;
    const claimedCreativeIds = new Set();

    for (let i = 0; i < uniqueDecisions.length; i++) {
        const decision = uniqueDecisions[i];
        const creativeId = decision.creative.creative_content.id;
        const advertiserName = decision.creative.creative_content.advertiser_name;
        const productName = decision.creative.creative_content.product_name;
        const endsAt = new Date(decision.creative.ends_at).toLocaleDateString();

        if (claimedCreativeIds.has(creativeId)) continue;

        log(
            "B",
            `[${i + 1}/${uniqueDecisions.length}] ${COLORS.W}${advertiserName}${COLORS.B} - ${COLORS.C}${productName}${COLORS.B} (Expires: ${endsAt})`,
        );

        const result = await claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId);

        if (result.status === 204) {
            claimedCreativeIds.add(creativeId);
            log("G", `  ✅ Successfully claimed 50 Orbs!`);
            successCount++;
        } else {
            log("R", `  ❌ Failed! Status code: ${result.status}`);
            failCount++;
        }

        if (i < uniqueDecisions.length - 1) {
            await countdown(15);
        }
    }

    console.log();
    log("B", "Bounties Summary");
    log("G", `  ✅ Successful: ${successCount} × 50 = ${COLORS.Y}${successCount * 50} Orbs${COLORS.G}`);
    if (failCount > 0) log("R", `  ❌ Failed: ${failCount}`);
    log("B", `  🎁 Total Earned: ${COLORS.Y}${successCount * 50} Orbs${COLORS.B}`);
    console.log();

    return successCount * 50;
};

const processSpecificBounty = async () => {
    const platform = generateMobilePlatform();
    const adSessionId = randomUUID();
    const heartbeatSessionId = randomUUID();

    let decisions;
    try {
        decisions = await fetchAllBountiesDecisions(platform, adSessionId, heartbeatSessionId);
    } catch (error) {
        log("R", `Failed to fetch bounties: ${error.message}`);
        await sleep(2000);
        return;
    }

    if (decisions.length === 0) {
        log("Y", "No bounties available at this time.");
        await sleep(2000);
        return;
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

    const rl = createInterface();

    while (true) {
        printHeader();
        console.log(`${COLORS.C}Available Bounties:${COLORS.X}`);
        console.log();
        uniqueDecisions.forEach((decision, index) => {
            const creative = decision.creative;
            const advertiserName = creative.creative_content.advertiser_name;
            const productName = creative.creative_content.product_name;
            const endsAt = new Date(creative.ends_at).toLocaleDateString();
            console.log(
                `${COLORS.Y}${index + 1}.${COLORS.X} ${COLORS.W}${advertiserName}${COLORS.X} - ${COLORS.C}${productName}${COLORS.X} ${COLORS.B}(Expires: ${endsAt})${COLORS.X}`,
            );
        });
        console.log();
        console.log(`${COLORS.C}Enter bounty number to claim (or 'back' to return):${COLORS.X}`);

        const bountyChoice = await new Promise(resolve => {
            rl.question(`${COLORS.G}Bounty number: ${COLORS.X}`, resolve);
        });

        if (bountyChoice.toLowerCase() === "back") {
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
        const advertiserName = decision.creative.creative_content.advertiser_name;
        const productName = decision.creative.creative_content.product_name;

        log("B", `${COLORS.C}Claiming: ${COLORS.W}${advertiserName}${COLORS.B} - ${COLORS.C}${productName}${COLORS.X}`);

        let success = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (attempt > 0) {
                log("Y", `Retrying... (attempt ${attempt + 1}/3)`);
                await sleep(3000);
            }
            const result = await claimBountyWithSession(decision, platform, adSessionId, heartbeatSessionId);
            if (result.status === 204) {
                success = true;
                break;
            }
        }

        if (success) {
            log("G", `✅ Successfully claimed 50 Orbs!`);
        } else {
            log("R", `❌ Failed!`);
        }

        await sleep(2000);
        rl.close();
        return;
    }
};

const processQuestSequential = async quest => {
    let q = quest;
    const questId = q.id;
    const questName = q.config?.messages?.quest_name || "Unknown Quest";
    const rawOrbs = getRawOrbsFromQuest(q);
    const orbs = getOrbsFromQuest(q);

    const tasks = getTasks(q);
    if (!tasks) {
        log("R", `${COLORS.W}${questName}${COLORS.X} ${COLORS.R}Skipped: No valid tasks found${COLORS.X}`);
        return;
    }

    const taskKeys = Object.keys(tasks);
    const platform = getPlatformForTask(taskKeys[0] || "");
    const platformName = getPlatformName(taskKeys[0] || "");

    let orbsInfo = "";
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
        log(
            "Y",
            `${COLORS.B}Enrolling${COLORS.X} in ${COLORS.W}${questName}${COLORS.X}${orbsInfo} ${COLORS.B}[${platformName}]${COLORS.X}`,
        );
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
        await randomSleep(2500, 4000);
    }

    const freshQ = await getFreshQuest(questId);
    console.log();
    if (freshQ && freshQ.user_status?.completed_at) {
        log("G", `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}fully completed${COLORS.X}${orbsInfo}`);
    } else if (freshQ) {
        log("G", `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}progressed (check status)${COLORS.X}${orbsInfo}`);
    } else {
        log("G", `${COLORS.W}${questName}${COLORS.X} ${COLORS.G}fully completed${COLORS.X}${orbsInfo}`);
    }
};

const completeEverything = async () => {
    log("G", "Starting Complete Everything");
    console.log();

    log("B", "Phase 1: Processing Bounties...");
    const bountyOrbs = await processBounties(false);
    await sleep(2000);

    log("B", "Phase 2: Processing Quests...");
    console.log();
    const data = await fetchQuests();
    const quests = (data.quests || []).filter(
        q =>
            q &&
            q.config &&
            q.config.expires_at &&
            !q.user_status?.completed_at &&
            new Date(q.config.expires_at) > new Date(),
    );

    if (quests.length === 0) {
        log("Y", "No quests available at this time.");
        console.log();
        log("G", "Everything Completed");
        log("G", `  🎁 Bounties: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
        log("G", `  🎮 Quests: ${COLORS.Y}0 Orbs${COLORS.G}`);
        log("G", `  🏆 Grand Total: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
        console.log();
        await sleep(3000);
        return;
    }

    let questOrbs = 0;
    quests.forEach(q => (questOrbs += getOrbsFromQuest(q)));

    log(
        "Y",
        `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests ${COLORS.Y}[Total: ${questOrbs} Orbs]${COLORS.X}`,
    );

    for (const q of quests) {
        if (!q || !q.id) continue;
        try {
            await processQuestSequential(q);
        } catch (error) {
            log("R", `Error processing quest: ${error.message}`);
        }
    }

    console.log();
    log("G", "Everything Completed");
    log("G", `  🎁 Bounties: ${COLORS.Y}${bountyOrbs} Orbs${COLORS.G}`);
    log("G", `  🎮 Quests: ${COLORS.Y}${questOrbs} Orbs${COLORS.G}`);
    log("G", `  🏆 Grand Total: ${COLORS.Y}${bountyOrbs + questOrbs} Orbs${COLORS.G}`);
    console.log();

    await sleep(3000);
};

const clearScreen = () => console.clear();

const printHeader = () => {
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
    console.log(`${COLORS.G}║   ${COLORS.R}Discord Quest Fucker - by: coder.gg${COLORS.B}  V 3.0${COLORS.G}         ║`);
    console.log(`${COLORS.G}║                                                      ║`);
    console.log(`${COLORS.G}╚══════════════════════════════════════════════════════╝${COLORS.X}`);
    console.log();
};

const createInterface = () =>
    readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

const showMenu = async (username, balance) => {
    printHeader();
    const nitroText = nitroMultiplier > 1 ? `  |  ${COLORS.M}Nitro${COLORS.X}` : "";
    console.log(`${COLORS.G}@${COLORS.W}${username}${COLORS.G}  |  ${COLORS.Y}${balance} Orbs${COLORS.G}${nitroText}`);
    console.log();
    console.log(`${COLORS.C}Please select an option:${COLORS.X}`);
    console.log(
        `${COLORS.Y}1.${COLORS.X} ${COLORS.W}Complete${COLORS.X} ${COLORS.G}Everything${COLORS.X} ${COLORS.Y}(${COLORS.B}Bounties ${COLORS.Y}& ${COLORS.M}Quests${COLORS.Y})${COLORS.X}`,
    );
    console.log(`${COLORS.Y}2.${COLORS.X} ${COLORS.W}Complete all ${COLORS.M}quests${COLORS.X}`);
    console.log(`${COLORS.Y}3.${COLORS.X} ${COLORS.W}Complete specific ${COLORS.M}quest${COLORS.X}`);
    console.log(`${COLORS.Y}4.${COLORS.X} ${COLORS.W}Complete${COLORS.X} all ${COLORS.B}Bounties${COLORS.X}`);
    console.log(`${COLORS.Y}5.${COLORS.X} ${COLORS.W}Complete specific${COLORS.X} ${COLORS.B}Bounty${COLORS.X}`);
    console.log(`${COLORS.Y}6.${COLORS.X} ${COLORS.R}Exit${COLORS.X}`);
    console.log();
};

const listQuests = async quests => {
    printHeader();
    console.log(`${COLORS.C}Available Quests:${COLORS.X}`);
    console.log();

    quests.forEach((q, index) => {
        const name = q.config.messages.quest_name;
        const tasks = getTasks(q);
        const taskKeys = tasks ? Object.keys(tasks) : [];
        const platform = getPlatformName(taskKeys[0] || "");
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
        console.log(
            `${COLORS.Y}${index + 1}.${COLORS.X} ${COLORS.W}${name}${COLORS.X} ${COLORS.B}[${platform}]${COLORS.X} ${COLORS.G}|${COLORS.X} ${orbsDisplay}`,
        );
    });

    console.log();
    console.log(`${COLORS.C}Enter quest number to process (or 'back' to return):${COLORS.X}`);
};

const main = async () => {
    const rl = createInterface();

    try {
        await checkNitro();

        const user = await fetchUser();
        if (!user.username) {
            console.log(`${COLORS.R}Invalid token detected${COLORS.X}`);
            rl.close();
            process.exit(1);
        }

        log("G", `${COLORS.C}Logged in as ${COLORS.W}${user.username}${COLORS.X}`);
        await sleep(1000);

        while (true) {
            let balance = 0;
            try {
                balance = await fetchBalance();
            } catch (e) {}

            await showMenu(user.username, balance);

            const choice = await new Promise(resolve => {
                rl.question(`${COLORS.G}Your choice: ${COLORS.X}`, resolve);
            });

            if (choice === "1") {
                await completeEverything();
            } else if (choice === "2") {
                const data = await fetchQuests();
                const quests = (data.quests || []).filter(
                    q =>
                        q &&
                        q.config &&
                        q.config.expires_at &&
                        !q.user_status?.completed_at &&
                        new Date(q.config.expires_at) > new Date(),
                );

                if (quests.length === 0) {
                    log("Y", "No quests available at this time.");
                    await sleep(2000);
                    continue;
                }

                let totalOrbs = 0;
                quests.forEach(q => (totalOrbs += getOrbsFromQuest(q)));

                log(
                    "Y",
                    `${COLORS.C}Found ${COLORS.G}${quests.length}${COLORS.C} quests ${COLORS.Y}[Total: ${totalOrbs} Orbs]${COLORS.X}`,
                );

                for (const q of quests) {
                    if (!q || !q.id) continue;
                    try {
                        await processQuestSequential(q);
                    } catch (error) {
                        log("R", `Error: ${error.message}`);
                    }
                }

                log("G", `${COLORS.C}All quests ${COLORS.G}finished${COLORS.X}`);
                await sleep(2000);
            } else if (choice === "3") {
                while (true) {
                    const data = await fetchQuests();

                    const quests = (data.quests || []).filter(
                        q =>
                            q &&
                            q.config &&
                            q.config.expires_at &&
                            !q.user_status?.completed_at &&
                            new Date(q.config.expires_at) > new Date(),
                    );

                    if (quests.length === 0) {
                        log("Y", "No quests available at this time.");
                        await sleep(2000);
                        break;
                    }

                    await listQuests(quests);

                    const questChoice = await new Promise(resolve => {
                        rl.question(`${COLORS.G}Quest number: ${COLORS.X}`, resolve);
                    });

                    if (questChoice.toLowerCase() === "back") break;

                    const questIndex = parseInt(questChoice) - 1;

                    if (isNaN(questIndex) || questIndex < 0 || questIndex >= quests.length) {
                        console.log(`${COLORS.R}Invalid selection${COLORS.X}`);
                        await sleep(1000);
                        continue;
                    }

                    const selectedQuest = quests[questIndex];
                    const orbs = getOrbsFromQuest(selectedQuest);
                    log(
                        "Y",
                        `${COLORS.C}Selected: ${COLORS.W}${selectedQuest.config.messages.quest_name}${COLORS.X} ${COLORS.Y}[${orbs} Orbs]${COLORS.X}`,
                    );
                    try {
                        await processQuestSequential(selectedQuest);
                    } catch (error) {
                        log("R", `Error: ${error.message}`);
                    }

                    log("G", `${COLORS.C}Quest ${COLORS.G}completed successfully${COLORS.X}`);
                    await sleep(2000);
                }
            } else if (choice === "4") {
                await processBounties();
                await sleep(2000);
            } else if (choice === "5") {
                await processSpecificBounty();
                await sleep(1000);
            } else if (choice === "6") {
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
        if (error.message.includes("Invalid token")) {
            console.log(`${COLORS.R}Error: Invalid Discord token${COLORS.X}`);
            console.log(`${COLORS.R}Please check your token in the TOKEN variable${COLORS.X}`);
        } else {
            log("R", `${COLORS.C}Error: ${COLORS.R}${error.message}${COLORS.X}`);
        }
        rl.close();
        process.exit(1);
    }
};

main();
