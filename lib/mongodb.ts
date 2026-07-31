import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 DNS order
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

// Fallback Google & Cloudflare DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);
} catch {}

let MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Convert mongodb+srv:// to direct shard nodes if SRV DNS lookup is blocked by local ISP/router
function getDirectMongoUri(srvUri: string): string {
  if (!srvUri.startsWith('mongodb+srv://')) return srvUri;
  
  // Extract user:pass and hostname/db from srvUri
  // e.g. mongodb+srv://user:pass@ac-bx8pecw.ziweawx.mongodb.net/portfolio?retryWrites=true...
  const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@ac-([^\.]+)\.([^/]+)\/([^?]+)\?(.*)$/);
  if (!match) return srvUri;

  const [, user, pass, clusterId, domain, dbName, queryParams] = match;
  const shard0 = `ac-${clusterId}-shard-00-00.${domain}:27017`;
  const shard1 = `ac-${clusterId}-shard-00-01.${domain}:27017`;
  const shard2 = `ac-${clusterId}-shard-00-02.${domain}:27017`;
  const replicaSet = `atlas-${clusterId.slice(0, 6)}-shard-0`;

  return `mongodb://${user}:${pass}@${shard0},${shard1},${shard2}/${dbName}?ssl=true&replicaSet=${replicaSet}&authSource=admin&${queryParams}`;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    // Try SRV first, if fails try direct shard connection
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    }).catch(async (srvError) => {
      console.warn('⚠️ SRV DNS lookup failed, attempting direct MongoDB connection fallback...');
      const fallbackUri = getDirectMongoUri(MONGODB_URI);
      return mongoose.connect(fallbackUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      });
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
