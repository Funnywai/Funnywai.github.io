// 麻將計分系統類別
class MahjongScoreSystem {
    constructor() {
        // 從 localStorage 載入數據
        this.players = JSON.parse(localStorage.getItem('mahjongPlayers')) || ['玩家一', '玩家二', '玩家三', '玩家四'];
        this.scores = JSON.parse(localStorage.getItem('mahjongScores')) || [0, 0, 0, 0];
        this.history = JSON.parse(localStorage.getItem('mahjongHistory')) || [];
        
        // 統計數據
        this.stats = JSON.parse(localStorage.getItem('mahjongStats')) || {
            totalWins: 0,
            highestScore: 0,
            selfDrawCount: 0,
            ronCount: 0
        };
        
        // 當前選擇
        this.currentSelections = {
            winner: 0,
            loser: 1,
            winType: 'self-draw', // 'self-draw' 或 'ron'
            score: 1
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadPlayers();
        this.updateScoresDisplay();
        this.updateHistory();
        this.updateStatsDisplay();
        
        // 避免多次彈出提示的標誌
        this.savePromptShown = false;
    }

    initializeElements() {
        // 取得 DOM 元素
        this.playerInputs = document.querySelectorAll('.player-name');
        
        // 分數控制
        this.scoreInput = document.getElementById('score-input');
        this.scoreSlider = document.getElementById('score-slider');
        this.decreaseScoreBtn = document.getElementById('decrease-score');
        this.increaseScoreBtn = document.getElementById('increase-score');
        
        // 胡牌類型
        this.selfDrawRadio = document.getElementById('self-draw-radio');
        this.ronRadio = document.getElementById('ron-radio');
        this.selfDrawOption = document.getElementById('win-self-draw');
        this.ronOption = document.getElementById('win-ron');
        
        // 玩家選擇
        this.winnerOptions = document.getElementById('winner-options');
        this.loserOptions = document.getElementById('loser-options');
        this.loserSection = document.getElementById('loser-section');
        
        // 動作按鈕
        this.winBtn = document.getElementById('win-btn');
        this.resetScoresBtn = document.getElementById('reset-scores-btn');
        this.resetGameBtn = document.getElementById('reset-game-btn');
        
        // 顯示區域
        this.playerScoresContainer = document.getElementById('player-scores');
        this.historyList = document.getElementById('history-list');
        
        // 同步分數輸入和滑桿
        this.scoreInput.value = this.currentSelections.score;
        this.scoreSlider.value = this.currentSelections.score;
        
        // 更新胡牌類型選擇
        this.updateWinTypeDisplay();
    }

    bindEvents() {
        
        // 分數控制事件
        this.scoreInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value) || value < 1) value = 1;
            if (value > 100) value = 100;
            this.currentSelections.score = value;
            this.scoreInput.value = value;
            this.scoreSlider.value = value;
        });
        
        this.scoreSlider.addEventListener('input', (e) => {
            this.currentSelections.score = parseInt(e.target.value);
            this.scoreInput.value = this.currentSelections.score;
        });
        
        this.decreaseScoreBtn.addEventListener('click', () => {
            if (this.currentSelections.score > 1) {
                this.currentSelections.score--;
                this.scoreInput.value = this.currentSelections.score;
                this.scoreSlider.value = this.currentSelections.score;
            }
        });
        
        this.increaseScoreBtn.addEventListener('click', () => {
            if (this.currentSelections.score < 100) {
                this.currentSelections.score++;
                this.scoreInput.value = this.currentSelections.score;
                this.scoreSlider.value = this.currentSelections.score;
            }
        });
        
        // 胡牌類型選擇
        this.selfDrawOption.addEventListener('click', () => {
            this.currentSelections.winType = 'self-draw';
            this.selfDrawRadio.checked = true;
            this.updateWinTypeDisplay();
        });
        
        this.ronOption.addEventListener('click', () => {
            this.currentSelections.winType = 'ron';
            this.ronRadio.checked = true;
            this.updateWinTypeDisplay();
        });
        
        this.selfDrawRadio.addEventListener('change', () => {
            if (this.selfDrawRadio.checked) {
                this.currentSelections.winType = 'self-draw';
                this.updateWinTypeDisplay();
            }
        });
        
        this.ronRadio.addEventListener('change', () => {
            if (this.ronRadio.checked) {
                this.currentSelections.winType = 'ron';
                this.updateWinTypeDisplay();
            }
        });
        
        // 胡牌按鈕
        this.winBtn.addEventListener('click', () => this.processWin());
        
        // 重置按鈕
        this.resetScoresBtn.addEventListener('click', () => {
            if (confirm('確定要重置所有玩家的分數嗎？此操作不可撤銷。')) {
                this.resetScores();
            }
        });
        
        this.resetGameBtn.addEventListener('click', () => {
            if (confirm('確定要清除所有記錄（包括分數和歷史）嗎？此操作不可撤銷。')) {
                this.resetGame();
            }
        });
    }

    loadPlayers() {
        // 載入玩家名稱到輸入框
        this.playerInputs.forEach((input, index) => {
            input.value = this.players[index];
            
            // 使用防抖函數來避免頻繁觸發
            let timeoutId;
            input.addEventListener('input', (e) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    this.players[index] = e.target.value.trim() || `玩家${index + 1}`;
                    // 自動保存到 localStorage，但不彈出提示
                    localStorage.setItem('mahjongPlayers', JSON.stringify(this.players));
                    this.updatePlayerOptions();
                    this.updateScoresDisplay();
                }, 1000); // 1秒後自動保存
            });
        });
        
        // 更新玩家選擇選項
        this.updatePlayerOptions();
    }

    updatePlayerOptions() {
        // 更新胡牌玩家選項
        this.winnerOptions.innerHTML = '';
        this.loserOptions.innerHTML = '';
        
        this.players.forEach((player, index) => {
            // 胡牌玩家選項
            const winnerOption = document.createElement('div');
            winnerOption.className = `player-option ${index === this.currentSelections.winner ? 'selected' : ''}`;
            winnerOption.textContent = player;
            winnerOption.dataset.index = index;
            winnerOption.addEventListener('click', () => {
                this.currentSelections.winner = index;
                this.updatePlayerOptions();
                this.updateScoresDisplay();
            });
            this.winnerOptions.appendChild(winnerOption);
            
            // 出銃玩家選項（不能選擇自己）
            const loserOption = document.createElement('div');
            loserOption.className = `player-option ${index === this.currentSelections.loser ? 'selected' : ''} ${index === this.currentSelections.winner ? 'disabled' : ''}`;
            loserOption.textContent = player;
            loserOption.dataset.index = index;
            
            if (index !== this.currentSelections.winner) {
                loserOption.addEventListener('click', () => {
                    this.currentSelections.loser = index;
                    this.updatePlayerOptions();
                });
            }
            
            this.loserOptions.appendChild(loserOption);
        });
    }

    updateWinTypeDisplay() {
        // 更新胡牌類型顯示
        if (this.currentSelections.winType === 'self-draw') {
            this.selfDrawOption.classList.add('selected');
            this.ronOption.classList.remove('selected');
            this.loserSection.style.opacity = '0.5';
            this.loserSection.style.pointerEvents = 'none';
        } else {
            this.selfDrawOption.classList.remove('selected');
            this.ronOption.classList.add('selected');
            this.loserSection.style.opacity = '1';
            this.loserSection.style.pointerEvents = 'auto';
        }
        
        this.selfDrawRadio.checked = this.currentSelections.winType === 'self-draw';
        this.ronRadio.checked = this.currentSelections.winType === 'ron';
    }

    processWin() {
        const winnerIndex = this.currentSelections.winner;
        const loserIndex = this.currentSelections.loser;
        const score = this.currentSelections.score;
        
        // 檢查是否有玩家名稱
        const hasPlayers = this.players.some(p => p.trim() !== '');
        if (!hasPlayers) {
            alert('請輸入至少一名玩家名稱！');
            return;
        }
        
        // 檢查食胡時是否選擇了不同的出銃玩家
        if (this.currentSelections.winType === 'ron' && winnerIndex === loserIndex) {
            alert('食胡時胡牌玩家和出銃玩家不能是同一人！');
            return;
        }
        
        // 計算分數變化
        let scoreChanges = [0, 0, 0, 0];
        
        if (this.currentSelections.winType === 'self-draw') {
            // 自摸：胡牌玩家從其他三家各獲得 (番數) 分
            const winAmount = score * 3; // 從三家各獲得
            const loseAmount = score; // 每家輸的分數
            
            scoreChanges[winnerIndex] = winAmount;
            
            for (let i = 0; i < 4; i++) {
                if (i !== winnerIndex) {
                    scoreChanges[i] = -loseAmount;
                }
            }
            
            // 更新統計
            this.stats.selfDrawCount++;
        } else {
            // 食胡：胡牌玩家從放槍玩家獲得 (番數 + 5) 分
            const amount = score + 5;
            
            scoreChanges[winnerIndex] = amount;
            scoreChanges[loserIndex] = -amount;
            
            // 更新統計
            this.stats.ronCount++;
        }
        
        // 更新分數
        for (let i = 0; i < 4; i++) {
            this.scores[i] += scoreChanges[i];
        }
        
        // 更新統計
        this.stats.totalWins++;
        
        // 計算實際胡牌番數（用於最高番數統計）
        const actualScore = this.currentSelections.winType === 'self-draw' ? score : score + 5;
        if (actualScore > this.stats.highestScore) {
            this.stats.highestScore = actualScore;
        }
        
        // 儲存數據
        this.saveData();
        
        // 記錄歷史
        this.addToHistory(winnerIndex, loserIndex, score, scoreChanges, actualScore);
        
        // 更新顯示
        this.updateScoresDisplay();
        this.updateHistory();
        this.updateStatsDisplay();
        
        // 顯示成功訊息
        this.showSuccessMessage();
        
        // 重置選擇（可選）
        this.currentSelections.score = 1;
        this.scoreInput.value = 1;
        this.scoreSlider.value = 1;
    }

    addToHistory(winnerIndex, loserIndex, score, scoreChanges, actualScore) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-TW', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        
        const historyEntry = {
            id: Date.now(),
            timestamp: now.toISOString(),
            time: timeString,
            winner: winnerIndex,
            loser: loserIndex,
            winType: this.currentSelections.winType,
            score: score,
            actualScore: actualScore,
            scoreChanges: [...scoreChanges],
            playerNames: [...this.players]
        };
        
        this.history.unshift(historyEntry);
        
        // 只保留最近50條記錄
        if (this.history.length > 50) {
            this.history.pop();
        }
    }

    updateScoresDisplay() {
        this.playerScoresContainer.innerHTML = '';
        
        let hasPlayers = false;
        
        this.players.forEach((player, index) => {
            if (player.trim() !== '') hasPlayers = true;
            
            const score = this.scores[index];
            const scoreCard = document.createElement('div');
            scoreCard.className = `player-score-card ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}`;
            
            if (index === this.currentSelections.winner) {
                scoreCard.classList.add('highlight');
            }
            
            // 計算統計
            const wins = this.history.filter(h => h.winner === index).length;
            const losses = this.history.filter(h => 
                h.winType === 'self-draw' ? h.winner !== index : h.loser === index
            ).length;
            
            scoreCard.innerHTML = `
                <div class="player-name-display">${player || `玩家${index + 1}`}</div>
                <div class="player-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'}">
                    ${score > 0 ? '+' : ''}${score}
                </div>
                <div class="player-stats">
                    <span>胡牌: ${wins} 次</span>
                    <span>放槍: ${losses} 次</span>
                </div>
            `;
            
            // 添加點擊選擇為胡牌玩家的功能
            scoreCard.addEventListener('click', () => {
                this.currentSelections.winner = index;
                this.updatePlayerOptions();
                this.updateScoresDisplay();
            });
            
            this.playerScoresContainer.appendChild(scoreCard);
        });
        
        if (!hasPlayers || this.history.length === 0) {
            this.playerScoresContainer.innerHTML = `
                <div class="empty-scores">
                    <i class="fas fa-chart-bar"></i>
                    <p>尚未開始計分</p>
                    <p class="sub-text">請先設定玩家名稱並開始胡牌</p>
                </div>
            `;
        }
    }

    updateHistory() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clipboard-list"></i>
                    <p>暫無記錄</p>
                </div>
            `;
            return;
        }
        
        // 只顯示最近10條記錄
        const recentHistory = this.history.slice(0, 10);
        
        recentHistory.forEach(entry => {
            const winnerName = this.players[entry.winner] || `玩家${entry.winner + 1}`;
            const loserName = this.players[entry.loser] || `玩家${entry.loser + 1}`;
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            let details = '';
            let scoreDetails = '';
            
            if (entry.winType === 'self-draw') {
                details = `${winnerName} 自摸 ${entry.score} 番`;
                scoreDetails = `${winnerName} +${entry.score * 3}`;
                
                // 顯示其他玩家損失
                const otherPlayers = [];
                for (let i = 0; i < 4; i++) {
                    if (i !== entry.winner) {
                        const playerName = this.players[i] || `玩家${i + 1}`;
                        otherPlayers.push(`${playerName} -${entry.score}`);
                    }
                }
                scoreDetails += ` (${otherPlayers.join(', ')})`;
            } else {
                details = `${winnerName} 食胡 ${loserName} ${entry.score} 番`;
                scoreDetails = `${winnerName} +${entry.actualScore} (${entry.score}+5) | ${loserName} -${entry.actualScore}`;
            }
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <span>${entry.time}</span>
                    <span>${entry.winType === 'self-draw' ? '自摸' : '食胡'}</span>
                </div>
                <div class="history-details">${details}</div>
                <div class="history-scores">${scoreDetails}</div>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }

    updateStatsDisplay() {
        document.getElementById('total-wins').textContent = this.stats.totalWins;
        document.getElementById('highest-score').textContent = this.stats.highestScore;
        document.getElementById('self-draw-count').textContent = this.stats.selfDrawCount;
        document.getElementById('ron-count').textContent = this.stats.ronCount;
    }

    showSuccessMessage() {
        // 創建臨時提示
        const message = document.createElement('div');
        message.className = 'success-message';
        message.textContent = '分數已更新！';
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a9d8f;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: fadeInOut 2s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 2000);
    }

    savePlayers() {
        // 從輸入框獲取玩家名稱
        this.playerInputs.forEach((input, index) => {
            const name = input.value.trim();
            this.players[index] = name || `玩家${index + 1}`;
            input.value = this.players[index];
        });
        
        localStorage.setItem('mahjongPlayers', JSON.stringify(this.players));
        this.updatePlayerOptions();
        this.updateScoresDisplay();
        
        // 顯示保存成功提示
        alert('玩家名稱已儲存！');
    }

    saveData() {
        localStorage.setItem('mahjongScores', JSON.stringify(this.scores));
        localStorage.setItem('mahjongHistory', JSON.stringify(this.history));
        localStorage.setItem('mahjongStats', JSON.stringify(this.stats));
    }

    resetScores() {
        this.scores = [0, 0, 0, 0];
        this.saveData();
        this.updateScoresDisplay();
    }

    resetGame() {
        this.scores = [0, 0, 0, 0];
        this.history = [];
        this.stats = {
            totalWins: 0,
            highestScore: 0,
            selfDrawCount: 0,
            ronCount: 0
        };
        this.saveData();
        this.updateScoresDisplay();
        this.updateHistory();
        this.updateStatsDisplay();
    }
}

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加淡入淡出動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .success-message {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a9d8f;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: fadeInOut 2s ease;
        }
    `;
    document.head.appendChild(style);
    
    // 初始化計分系統
    const scoreSystem = new MahjongScoreSystem();
});
