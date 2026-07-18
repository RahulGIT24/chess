import { describe, it, expect, beforeEach } from "vitest";
import { PendingUser } from "./PendingUsers";
import type { IPending } from "../types/types";

const makePending = (overrides: Partial<IPending> = {}): IPending => ({
  socket: {} as any,
  name: "player",
  timeLeft: 300_000,
  id: "user-1",
  profilePicture: null,
  ...overrides,
});

describe("PendingUser", () => {
  let queue: PendingUser;

  beforeEach(() => {
    queue = new PendingUser();
  });

  it("returns null when dequeuing from an empty queue", () => {
    expect(queue.deque({ userId: "a", time: 300_000 })).toBeNull();
  });

  it("dequeues a matching user by time, excluding the same user id", () => {
    const pending = makePending({ id: "user-1", timeLeft: 300_000 });
    queue.enque(pending);

    const result = queue.deque({ userId: "user-2", time: 300_000 });

    expect(result).toEqual(pending);
  });

  it("does not match a pending user against themselves", () => {
    const pending = makePending({ id: "user-1", timeLeft: 300_000 });
    queue.enque(pending);

    const result = queue.deque({ userId: "user-1", time: 300_000 });

    expect(result).toBeNull();
  });

  it("does not match users with a different time control", () => {
    const pending = makePending({ id: "user-1", timeLeft: 300_000 });
    queue.enque(pending);

    const result = queue.deque({ userId: "user-2", time: 600_000 });

    expect(result).toBeNull();
  });

  it("removes the dequeued entry from the queue so it cannot be matched twice", () => {
    const pending = makePending({ id: "user-1", timeLeft: 300_000 });
    queue.enque(pending);

    queue.deque({ userId: "user-2", time: 300_000 });
    const secondAttempt = queue.deque({ userId: "user-3", time: 300_000 });

    expect(secondAttempt).toBeNull();
  });

  it("dequeues by socket identity regardless of time or user id", () => {
    const socket = {} as any;
    const pending = makePending({ socket, id: "user-1" });
    queue.enque(pending);

    const result = queue.deque({ socket });

    expect(result).toEqual(pending);
  });

  it("returns null when dequeuing by a socket that was never enqueued", () => {
    queue.enque(makePending());

    const result = queue.deque({ socket: {} as any });

    expect(result).toBeNull();
  });
});
