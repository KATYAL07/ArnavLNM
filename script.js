
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Newsreader', 'serif'],
            },
            colors: {
                brand: {
                    sky: '#38BDF8',
                    dark: '#050505',
                    panel: '#0F110E',
                }
            },
            backgroundImage: {
                'radial-glow': 'radial-gradient(circle at 70% 50%, rgba(56, 189, 248, 0.25) 0%, rgba(5, 5, 5, 0) 60%)',
            },
            animation: {
                'beam': 'beam 3s linear infinite',
                'spin-slow': 'spin 12s linear infinite',
                'spin-slow-reverse': 'spin 15s linear infinite reverse',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                beam: {
                    '0%': { strokeDashoffset: '1000' },
                    '100%': { strokeDashoffset: '0' },
                }
            }
        }
    }
}

// Unicorn Studio Script
!function () { if (!window.UnicornStudio) { window.UnicornStudio = { isInitialized: !1 }; var i = document.createElement("script"); i.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js", i.onload = function () { window.UnicornStudio.isInitialized || (UnicornStudio.init(), window.UnicornStudio.isInitialized = !0) }, (document.head || document.body).appendChild(i) } }();

// Flashlight/Spotlight Effect Script
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});

const CONTRACT_ADDRESS = "0x3d9AC42844315518D05dCF6000C3f74BB72cdd5a";

const ABI = [
    "function message() view returns (string)",
    "function price() view returns (uint256)",
    "function buySpot(string _msg) payable"
];

let provider, signer, contract;
let isConnected = false;

// --- Connect/Disconnect Toggle ---
async function toggleWallet() {
    if (isConnected) {
        disconnectWallet();
    } else {
        connectWallet();
    }
}

async function connectWallet() {
    if (window.ethereum) {
        try {
            // Force permission prompt to ensure "popup comes" as requested
            // This effectively clears the "trusted" status until approved again
            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }]
            });

            // Get Accounts (standard)
            await window.ethereum.request({ method: "eth_requestAccounts" });

            // Setup Ethers
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            // Update UI & State
            const address = await signer.getAddress();
            updateWalletUI(true, address);
            isConnected = true;

            // Load Billboard Data
            loadData();

        } catch (err) {
            console.error("Connection Detailed Error:", err);
            // 4001 is "User Rejected Request" - typical if they close the popup
            if (err.code !== 4001) {
                alert("Connection Failed: " + (err.message || err.toString()));
            }
        }
    } else {
        alert("Please install MetaMask or opening this in a Web3 Browser!");
    }
}

// --- Read Data from Blockchain ---
async function loadData() {
    if (!contract) return;
    try {
        const msg = await contract.message();
        const price = await contract.price();

        // Update the Billboard Text
        const textEl = document.getElementById("billboardText");
        if (textEl) textEl.innerText = `"${msg}"`;

        // Calculate Next Price (110%)
        // We use BigNumber math here because crypto numbers are huge
        const currentPrice = ethers.BigNumber.from(price);
        const nextPrice = currentPrice.mul(110).div(100);
        const formattedPrice = ethers.utils.formatEther(nextPrice);

        // Update Buy Button
        const buyBtn = document.getElementById("buyBtn");
        if (buyBtn) buyBtn.innerText = `STEAL SPOT (${formattedPrice.substring(0, 6)} MON)`;

    } catch (err) {
        console.error("Error reading data:", err);
    }
}

function disconnectWallet() {
    // We cannot strictly "logout" from the extension, but we can clear our apps state
    provider = null;
    signer = null;
    contract = null;
    isConnected = false;
    updateWalletUI(false);
}

function updateWalletUI(connected, address) {
    const btn = document.getElementById("connectBtn");
    if (!btn) return;

    if (connected) {
        btn.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Disconnect ${address.slice(0, 6)}...
        `;
        btn.classList.add('bg-brand-sky/10', 'border-brand-sky/20', 'text-brand-sky');
        btn.classList.remove('bg-white', 'text-black');
    } else {
        btn.innerHTML = `
            Connect Wallet
            <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em"
                viewBox="0 0 24 24" data-icon="solar:arrow-right-bold-duotone"
                class="iconify group-hover:translate-x-0.5 transition-transform">
                <path fill="currentColor"
                    d="M13.25 12.75V18a.75.75 0 0 0 1.28.53l6-6a.75.75 0 0 0 0-1.06l-6-6a.75.75 0 0 0-1.28.53z"></path>
            </svg>
        `;
        btn.classList.remove('bg-brand-sky/10', 'border-brand-sky/20', 'text-brand-sky');
        btn.classList.add('bg-white', 'text-black');
    }
}

// --- Buy Function / Modal Logic ---
function openBuyModal() {
    if (!isConnected || !contract) {
        // If not connected, try to connect first
        toggleWallet();
        return;
    }

    const modal = document.getElementById('buy-modal');
    modal.classList.remove('hidden');

    // Update price in modal if possible
    (async () => {
        try {
            const price = await contract.price();
            const currentPrice = ethers.BigNumber.from(price);
            const nextPrice = currentPrice.mul(110).div(100);
            const formattedPrice = ethers.utils.formatEther(nextPrice);
            document.getElementById('modal-price').innerText = `${formattedPrice.substring(0, 6)} MON`;
        } catch (e) { console.warn("Could not fetch price for modal", e); }
    })();
}

// --- File Upload Handling ---
let selectedFile = null;

function initFileUpload() {
    const fileInput = document.getElementById('buy-file');
    const fileNameDisplay = document.getElementById('file-name');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImg = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-image');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent modal from closing if button is inside form
        clearFileSelection();
    });

    function handleFileSelect(file) {
        selectedFile = file;
        fileNameDisplay.innerText = file.name;

        // Show Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    function clearFileSelection() {
        selectedFile = null;
        fileInput.value = '';
        fileNameDisplay.innerText = 'Click to upload or drag & drop';
        previewContainer.classList.add('hidden');
        previewImg.src = '';
    }

    // Expose clear function for modal close
    window.clearFileUpload = clearFileSelection;
}

async function handleBuyConfirm() {
    const msgInput = document.getElementById('buy-message');
    const statusEl = document.getElementById('buy-status');
    const newMsg = msgInput.value.trim();

    // Allow empty message IF file is selected
    if (!newMsg && !selectedFile) {
        statusEl.innerText = "Please enter a message or upload an image!";
        statusEl.className = "text-center text-xs text-red-400 h-4";
        return;
    }

    try {
        statusEl.innerText = "Checking balance...";
        statusEl.className = "text-center text-xs text-brand-sky h-4 animate-pulse";

        // 1. Get current price
        const price = await contract.price();
        const payment = price.mul(110).div(100);

        // 2. Check User Balance
        const balance = await signer.getBalance();
        if (balance.lt(payment)) {
            statusEl.innerText = `Insufficient Funds! Need ${ethers.utils.formatEther(payment).substring(0, 6)} MON`;
            statusEl.className = "text-center text-xs text-red-500 h-4";
            return;
        }

        statusEl.innerText = "Initiating Transaction...";

        // 3. Send Transaction
        // Append [IMG] tag to message if file exists so on-chain viewers know there's content (simulated)
        const finalMsg = selectedFile ? (newMsg + " [IMG]") : newMsg;

        const tx = await contract.buySpot(finalMsg, {
            value: payment,
            gasLimit: 1000000
        });

        statusEl.innerText = "Waiting for Confirmation...";

        // 4. Wait for it to finish
        // await tx.wait(); // Commented out for instant feedback/demo if chain is slow, but usually we wait.
        // Let's wait properly.
        await tx.wait();

        // Success!
        statusEl.innerText = "Success! Update incoming...";
        statusEl.className = "text-center text-xs text-green-400 h-4";

        // Close modal after short delay
        setTimeout(() => {
            document.getElementById('buy-modal').classList.add('hidden');
            msgInput.value = ''; // Reset

            // --- Live Update Logic ---
            loadData();

            // Optimistic update of Text
            document.getElementById("billboardText").innerText = newMsg ? `"${newMsg}"` : "";

            // Update Image
            const billboardImg = document.getElementById("billboardImage");
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    billboardImg.src = e.target.result;
                    billboardImg.classList.remove('hidden');
                };
                reader.readAsDataURL(selectedFile);
            } else {
                billboardImg.classList.add('hidden');
            }

            // Cleanup
            if (window.clearFileUpload) window.clearFileUpload();

        }, 1500);

    } catch (err) {
        console.error("Transaction Error:", err);

        let errorMsg = "Transaction Failed";
        if (err.code === 4001) errorMsg = "User Rejected Request";
        else if (err.reason) errorMsg = err.reason;
        else if (err.message && err.message.length < 50) errorMsg = err.message;

        statusEl.innerText = "Failed: " + errorMsg;
        statusEl.className = "text-center text-xs text-red-500 h-4";
    }
}

// --- Initialize Listeners ---
window.addEventListener('load', () => {
    const cBtn = document.getElementById("connectBtn");
    const bBtn = document.getElementById("buyBtn");

    if (cBtn) cBtn.addEventListener("click", toggleWallet);

    // Changed: bBtn opens modal now
    if (bBtn) bBtn.addEventListener("click", openBuyModal);

    // Initialize New Features
    initModals();
    initBuyModal();
    initFileUpload();
    initLiveFeed();
    initLeaderboard();
    initAuraAgent(); // Initialize the AI Agent
});

// --- Aura Agent Logic (Intent Router Pattern) ---
function initAuraAgent() {
    const widget = document.getElementById('ai-chat-widget');
    const windowEl = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('toggle-chat');
    const closeBtn = document.getElementById('close-chat');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    // Toggle logic
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            windowEl.classList.remove('hidden');
            windowEl.classList.add('scale-100', 'opacity-100');
            windowEl.classList.remove('scale-95', 'opacity-0');
            toggleBtn.classList.add('hidden');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            windowEl.classList.add('hidden');
            windowEl.classList.remove('scale-100', 'opacity-100');
            windowEl.classList.add('scale-95', 'opacity-0');
            toggleBtn.classList.remove('hidden');
        });
    }

    // Handle User Message
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            // Add User Message
            addMessage(text, 'user');
            input.value = '';

            // Simulate thinking...
            const typingId = addTypingIndicator();
            await new Promise(r => setTimeout(r, 600)); // Latency simulation

            // Execute Intent Router Logic
            const response = await processUserIntent(text);

            removeMessage(typingId);
            addMessage(response, 'agent');
        });
    }

    // --- Core Logic: Intent Router ---
    async function processUserIntent(userText) {
        const intent = detectIntent(userText);
        let context = {};

        try {
            // Context Gathering
            if (intent === "GET_PRICE") {
                if (!contract) return "Please connect your wallet first so I can read the live price.";
                try {
                    const price = await contract.price();
                    context.currentPrice = ethers.utils.formatEther(price);
                    context.nextPrice = ethers.utils.formatEther(price.mul(110).div(100));
                } catch (e) {
                    return "I cannot read the blockchain right now. Please check if you are on Monad Testnet.";
                }
            }

            // Response Generation
            return generateResponse(intent, context);

        } catch (error) {
            console.error(error);
            return "I encountered an error processing your request. Please try again.";
        }
    }

    function detectIntent(text) {
        const t = text.toLowerCase();
        if (t.includes("price") || t.includes("cost") || t.includes("worth")) return "GET_PRICE";
        if (t.includes("rule") || t.includes("work") || t.includes("profit")) return "EXPLAIN_RULES";
        if (t.includes("key") || t.includes("phrase") || t.includes("seed")) return "SAFETY_WARNING";
        if (t.includes("buy") || t.includes("purchase") || t.includes("how to")) return "EXPLAIN_BUY";
        return "GENERAL_HELP";
    }

    function generateResponse(intent, context) {
        switch (intent) {
            case "GET_PRICE":
                return `**Market Analysis:**<br>Current Spot Price: **${context.currentPrice.substring(0, 6)} MON**<br>Minimum Bid (+10%): **${context.nextPrice.substring(0, 6)} MON**<br><br>The protocol requires a 10% increase to overwrite the current message.`;

            case "EXPLAIN_RULES":
                return "The protocol rules are simple:<br>1. Pay at least 10% more than the current price to buy the spot.<br>2. If you are outbid, you receive a full refund + 5% instant profit.<br>3. The remaining 5% supports the protocol treasury.";

            case "SAFETY_WARNING":
                return "⚠️ **SECURITY ALERT**<br>I will NEVER ask for your private keys or seed phrase. Never share these with anyone. We do not need them.";

            case "EXPLAIN_BUY":
                return "To buy the spot:<br>1. Connect your wallet.<br>2. Click the **'Buy Spot'** button.<br>3. Enter your message.<br>4. Confirm the transaction in MetaMask.<br><br>I cannot execute transactions for you; you must sign them manually.";

            case "GENERAL_HELP":
            default:
                return "I am Aura Agent. I can help you with:<br>• Checking the current price<br>• Explaining the 5% profit rule<br>• Guiding you through the buying process<br><br>How can I assist?";
        }
    }

    // UI Helpers
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `flex flex-col gap-1 items-${sender === 'user' ? 'end' : 'start'} animate-fade-in-up`;

        let bubbleClass = sender === 'user'
            ? 'bg-brand-sky text-black font-medium rounded-2xl rounded-tr-sm'
            : 'bg-white/10 backdrop-blur-md border border-white/5 text-white/90 rounded-2xl rounded-tl-sm';

        div.innerHTML = `
            <div class="${bubbleClass} text-sm py-3 px-4 max-w-[85%] leading-relaxed shadow-sm">
                ${text}
            </div>
            ${sender === 'agent' ? '<span class="text-[10px] text-white/30 ml-2">Aura Agent</span>' : ''}
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div.id = 'msg-' + Date.now();
    }

    function addTypingIndicator() {
        const div = document.createElement('div');
        div.className = `flex flex-col gap-1 items-start animate-pulse`;
        div.innerHTML = `
            <div class="bg-white/5 text-white/40 text-[10px] py-1 px-3 rounded-full mb-2">
                Thinking...
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        const id = 'typing-' + Date.now();
        div.id = id;
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
}

function initBuyModal() {
    const modal = document.getElementById('buy-modal');
    const closeBtn = document.getElementById('buy-close');
    const backdrop = document.getElementById('buy-backdrop');
    const confirmBtn = document.getElementById('confirm-buy-btn');

    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    backdrop.addEventListener('click', () => modal.classList.add('hidden'));
    confirmBtn.addEventListener('click', handleBuyConfirm);
}

// --- Modals Logic ---
function initModals() {
    const rulesModal = document.getElementById('rules-modal');
    const leaderboardModal = document.getElementById('leaderboard-modal');

    // Rules Modal
    const rulesToggle = document.getElementById('rules-toggle');
    if (rulesToggle) {
        rulesToggle.addEventListener('click', (e) => {
            e.preventDefault();
            rulesModal.classList.remove('hidden');
        });
    }

    document.getElementById('rules-close').addEventListener('click', () => {
        rulesModal.classList.add('hidden');
    });

    document.getElementById('rules-backdrop').addEventListener('click', () => {
        rulesModal.classList.add('hidden');
    });

    // Leaderboard Modal
    document.getElementById('leaderboard-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        leaderboardModal.classList.remove('hidden');
        renderLeaderboard(); // Refresh data on open
    });

    document.getElementById('leaderboard-close').addEventListener('click', () => {
        leaderboardModal.classList.add('hidden');
    });

    document.getElementById('leaderboard-backdrop').addEventListener('click', () => {
        leaderboardModal.classList.add('hidden');
    });

    // Toggle Live Feed
    document.getElementById('live-feed-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        const panel = document.getElementById('live-feed-panel');
        panel.classList.toggle('opacity-0');
        panel.classList.toggle('translate-y-10');
    });
}

// --- Live Feed Logic ---
function initLiveFeed() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    const actions = ['bought the spot for', 'outbid user for', 'staked', 'claimed rewards of'];
    // Fixed identities
    const identities = [
        { name: 'test1', addr: '0x7e2...9a12' },
        { name: 'test2', addr: '0x3b5...8c4d' },
        { name: 'test3', addr: '0x1a9...2f3e' },
        { name: 'test4', addr: '0x9c4...5b7a' },
        { name: 'test5', addr: '0x5d8...1e6f' }
    ];

    function addFeedItem() {
        // Pick random identity
        const id = identities[Math.floor(Math.random() * identities.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const amount = (Math.random() * 100).toFixed(2);

        const div = document.createElement('div');
        div.className = 'bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-center gap-3 shadow-lg animate-fade-in-up';
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-brand-sky/20 to-brand-sky/5 flex items-center justify-center border border-brand-sky/20">
                <div class="w-2 h-2 rounded-full bg-brand-sky animate-pulse"></div>
            </div>
            <div class="flex flex-col">
                <span class="text-[10px] text-white/50 font-mono uppercase tracking-wider">Just Now</span>
                <span class="text-xs text-white/90">
                    <span class="text-brand-sky font-mono font-bold">${id.name}</span> <span class="text-white/50 text-[10px] font-mono">(${id.addr})</span> ${action} <span class="text-white font-medium">${amount} MON</span>
                </span>
            </div>
        `;

        container.prepend(div);

        // Keep only last 5 items
        if (container.children.length > 5) {
            container.lastElementChild.remove();
        }
    }

    // Add initial items
    addFeedItem();
    addFeedItem();

    // Random interval
    setInterval(() => {
        if (Math.random() > 0.3) addFeedItem();
    }, 3000);
}

// --- Leaderboard Logic ---
function initLeaderboard() {
    // Only rendering needs to happen, logic is self-contained
}

function renderLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;

    list.innerHTML = '';

    const identities = [
        { name: 'test1', addr: '0x7e2...9a12' },
        { name: 'test2', addr: '0x3b5...8c4d' },
        { name: 'test3', addr: '0x1a9...2f3e' },
        { name: 'test4', addr: '0x9c4...5b7a' },
        { name: 'test5', addr: '0x5d8...1e6f' }
    ];

    // Mock data based on these 5 identities
    const mockData = identities.map((id, i) => ({
        rank: i + 1,
        name: id.name,
        address: id.addr, // Keep address for consistency
        profit: (Math.random() * 1000 + 500 - (i * 50)).toFixed(2),
        won: Math.floor(Math.random() * 20 + 5)
    }));

    mockData.forEach(item => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors';
        row.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-sm font-mono text-white/30 w-6">#${item.rank}</span>
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-white font-mono">
                        <span class="text-brand-sky">${item.name}</span> <span class="text-white/40 text-xs">(${item.address})</span>
                    </span>
                    <span class="text-[10px] text-white/40">${item.won} spots won</span>
                </div>
            </div>
            <div class="text-right">
                <span class="text-sm font-bold text-brand-sky">+${item.profit} MON</span>
            </div>
        `;
        list.appendChild(row);
    });
}