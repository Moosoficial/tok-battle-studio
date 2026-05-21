import { dom, mockComments } from './config.js';
import { state, updateState } from './state.js';

export function startSimulation() {
    stopSimulation();
    
    if (state.currentUser) {
        dom.streamerTag.textContent = `@${state.currentUser}`;
    } else {
        dom.streamerTag.textContent = '@streamer_pro';
    }

    dom.simulatedChatBox.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        addRandomComment();
    }

    const chatIntervalId = setInterval(() => {
        addRandomComment();
    }, 1800);

    updateState({ blueScore: 24500, redScore: 24500, chatIntervalId });
    updateBattleScoreBar();

    const battleTimerIntervalId = setInterval(() => {
        updateState({
            blueScore: state.blueScore + Math.floor(Math.random() * 280) + 30,
            redScore: state.redScore + Math.floor(Math.random() * 280) + 30
        });
        updateBattleScoreBar();
    }, 1200);
    
    updateState({ battleTimerIntervalId });
}

export function stopSimulation() {
    if (state.chatIntervalId) {
        clearInterval(state.chatIntervalId);
        updateState({ chatIntervalId: null });
    }
    if (state.battleTimerIntervalId) {
        clearInterval(state.battleTimerIntervalId);
        updateState({ battleTimerIntervalId: null });
    }
}

export function addRandomComment() {
    const comment = mockComments[Math.floor(Math.random() * mockComments.length)];
    const commentEl = document.createElement('div');
    commentEl.className = 'chat-comment';
    
    if (comment.type === 'gift') {
        commentEl.innerHTML = `<span class="comment-user">${comment.user}</span><span class="comment-gift">${comment.text}</span>`;
    } else {
        commentEl.innerHTML = `<span class="comment-user">${comment.user}</span><span class="comment-text">${comment.text}</span>`;
    }
    
    dom.simulatedChatBox.appendChild(commentEl);
    
    while (dom.simulatedChatBox.children.length > 12) {
        dom.simulatedChatBox.removeChild(dom.simulatedChatBox.firstChild);
    }
    
    dom.simulatedChatBox.scrollTop = dom.simulatedChatBox.scrollHeight;
}

export function updateBattleScoreBar() {
    const total = state.blueScore + state.redScore;
    const bluePercent = (state.blueScore / total) * 100;
    const redPercent = 100 - bluePercent;

    dom.scoreTeamBlue.textContent = formatScore(state.blueScore);
    dom.scoreTeamRed.textContent = formatScore(state.redScore);

    dom.battleBlueTeam.style.width = `${bluePercent}%`;
    dom.battleRedTeam.style.width = `${redPercent}%`;
}

function formatScore(score) {
    if (score >= 1000) {
        return (score / 1000).toFixed(1) + 'k';
    }
    return score;
}
