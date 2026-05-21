export const state = {
    currentTemplate: 'tap', // 'tap' | 'glove' | 'versus'
    isPlaying: true,
    isExporting: false,
    duration: 10,
    fps: 60,
    
    startTime: Date.now(),
    elapsedMs: 0,
    animationFrameId: null,
    
    avatarImage: null,
    
    particles: [],
    floatingLikes: [],

    isRegisterMode: false,
    currentUser: null,
    
    chatIntervalId: null,
    battleTimerIntervalId: null,
    
    blueScore: 24500,
    redScore: 24500
};

export function updateState(updates) {
    Object.assign(state, updates);
}
