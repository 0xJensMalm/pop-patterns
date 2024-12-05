class DebugLogger {
    constructor() {
        this.logs = [];
        this.currentSeed = null;
        this.isBlankOutput = false;
    }

    startNewSession(seed) {
        this.currentSeed = seed;
        this.logs = [];
        this.isBlankOutput = true; // Will be set to false if anything is drawn
        this.log('Session Start', { seed });
    }

    log(event, data = {}) {
        const timestamp = performance.now();
        this.logs.push({
            timestamp,
            event,
            seed: this.currentSeed,
            ...data
        });
    }

    markDrawn() {
        this.isBlankOutput = false;
    }

    getFormattedLogs() {
        let output = '';
        const sessions = new Map();

        // Group logs by seed
        this.logs.forEach(log => {
            if (!sessions.has(log.seed)) {
                sessions.set(log.seed, []);
            }
            sessions.get(log.seed).push(log);
        });

        // Format each session
        sessions.forEach((logs, seed) => {
            output += `\n=== Session: ${seed} ===\n`;
            output += `Blank Output: ${this.isBlankOutput ? 'YES' : 'NO'}\n`;
            
            logs.forEach(log => {
                const time = log.timestamp.toFixed(2);
                delete log.timestamp;
                delete log.seed;
                
                const dataStr = Object.keys(log).length > 1 
                    ? ` | ${JSON.stringify(log)}`
                    : '';
                
                output += `[${time}ms] ${log.event}${dataStr}\n`;
            });
        });

        return output;
    }

    copyToClipboard() {
        const text = this.getFormattedLogs();
        navigator.clipboard.writeText(text).then(() => {
            console.log('Debug logs copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy logs:', err);
        });
    }
}

// Global instance
const debugLogger = new DebugLogger();
