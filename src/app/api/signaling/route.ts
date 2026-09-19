import { NextRequest, NextResponse } from "next/server";
import { SignalingMessage } from "@/lib/webrtc/types";

interface StoredMessage {
  id: string;
  roomId: string;
  senderId: string;
  targetId?: string;
  message: SignalingMessage;
  timestamp: number;
}

// In-memory global store for active signaling messages
// Works across active serverless instances and local dev
declare global {
  // eslint-disable-next-line no-var
  var __togetherRoomMessages: Map<string, StoredMessage[]> | undefined;
}

const messageStore: Map<string, StoredMessage[]> =
  global.__togetherRoomMessages || (global.__togetherRoomMessages = new Map());

// Maximum age of messages before deletion (60 seconds)
const MESSAGE_TTL_MS = 60 * 1000;
const MAX_MESSAGES_PER_ROOM = 150;

function cleanupOldMessages(roomId: string) {
  const list = messageStore.get(roomId);
  if (!list) return;

  const now = Date.now();
  const filtered = list.filter((m) => now - m.timestamp < MESSAGE_TTL_MS);

  if (filtered.length === 0) {
    messageStore.delete(roomId);
  } else if (filtered.length > MAX_MESSAGES_PER_ROOM) {
    messageStore.set(roomId, filtered.slice(-MAX_MESSAGES_PER_ROOM));
  } else {
    messageStore.set(roomId, filtered);
  }
}

// GET: Retrieve signaling messages for a room since timestamp
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const sinceStr = searchParams.get("since");
  const senderId = searchParams.get("senderId");
  const since = sinceStr ? parseInt(sinceStr, 10) : 0;

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  cleanupOldMessages(roomId);

  const roomMessages = messageStore.get(roomId) || [];
  const relevant = roomMessages
    .filter((item) => {
      // Must be newer than 'since'
      if (item.timestamp <= since) return false;
      // Do not return messages from self
      if (senderId && item.senderId === senderId) return false;
      // If targeted, only deliver to target or broadcast
      if (item.targetId && senderId && item.targetId !== senderId) return false;
      return true;
    })
    .map((item) => item.message);

  return NextResponse.json(
    {
      messages: relevant,
      serverTime: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// POST: Publish a new signaling message to a room
export async function POST(req: NextRequest) {
  try {
    let body: SignalingMessage;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = (await req.json()) as SignalingMessage;
    } else {
      const text = await req.text();
      body = JSON.parse(text) as SignalingMessage;
    }

    if (!body || !body.roomId || !body.senderId || !body.type) {
      return NextResponse.json({ error: "Invalid signaling message" }, { status: 400 });
    }

    const roomId = body.roomId;
    const now = Date.now();

    cleanupOldMessages(roomId);

    if (!messageStore.has(roomId)) {
      messageStore.set(roomId, []);
    }

    const list = messageStore.get(roomId)!;
    const stored: StoredMessage = {
      id: `msg-${Math.random().toString(36).substring(2, 9)}-${now}`,
      roomId,
      senderId: body.senderId,
      targetId: body.targetId,
      message: {
        ...body,
        timestamp: now,
      },
      timestamp: now,
    };

    list.push(stored);

    return NextResponse.json(
      {
        success: true,
        messageId: stored.id,
        timestamp: now,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: "Failed to parse request" }, { status: 500 });
  }
}
