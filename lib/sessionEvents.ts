import EventEmitter from 'events';

class SessionEventEmitter extends EventEmitter {}

const globalForSession = globalThis as unknown as { sessionEmitter?: SessionEventEmitter };

export const sessionEmitter = globalForSession.sessionEmitter || new SessionEventEmitter();
if (process.env.NODE_ENV !== 'production') globalForSession.sessionEmitter = sessionEmitter;
