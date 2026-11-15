import { afterEach, describe, expect, it, vi } from "vitest";
import { whenNear } from "@/features/landing/motion/when-near";

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let observers: { cb: Callback; margin?: string; disconnect: ReturnType<typeof vi.fn> }[] = [];

function mockObserver() {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      disconnect = vi.fn();
      constructor(cb: Callback, opts?: { rootMargin?: string }) {
        observers.push({ cb, margin: opts?.rootMargin, disconnect: this.disconnect });
      }
      observe() {}
    },
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("FR-LP-004 landing motion is set up only when its section comes near the screen", () => {
  it("does nothing until the element is near, then runs setup once", () => {
    mockObserver();
    const setup = vi.fn();
    whenNear(document.createElement("div"), setup);
    expect(setup).not.toHaveBeenCalled();
    expect(observers[0]?.margin).toBe("100% 0px");

    observers[0]?.cb([{ isIntersecting: false }]);
    expect(setup).not.toHaveBeenCalled();
    observers[0]?.cb([{ isIntersecting: true }]);
    observers[0]?.cb([{ isIntersecting: true }]);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(observers[0]?.disconnect).toHaveBeenCalled();
  });

  it("stop() runs the setup's cleanup, or cancels a setup that never ran", () => {
    mockObserver();
    const cleanup = vi.fn();
    const stop = whenNear(document.createElement("div"), () => cleanup);
    observers[0]?.cb([{ isIntersecting: true }]);
    stop();
    expect(cleanup).toHaveBeenCalledTimes(1);

    const never = vi.fn();
    const cancel = whenNear(document.createElement("div"), never);
    cancel();
    observers[1]?.cb([{ isIntersecting: true }]);
    expect(never).not.toHaveBeenCalled();
  });

  it("an async setup's cleanup runs on stop, even when stop comes before the setup finished", async () => {
    mockObserver();
    const cleanup = vi.fn();
    const stop = whenNear(document.createElement("div"), async () => cleanup);
    observers[0]?.cb([{ isIntersecting: true }]);
    await Promise.resolve();
    stop();
    expect(cleanup).toHaveBeenCalledTimes(1);

    const late = vi.fn();
    let finish: (c: () => void) => void = () => {};
    const stopEarly = whenNear(document.createElement("div"), () => new Promise<() => void>((r) => (finish = r)));
    observers[1]?.cb([{ isIntersecting: true }]);
    stopEarly();
    finish(late);
    await Promise.resolve();
    expect(late).toHaveBeenCalledTimes(1);
  });

  it("a missing element is a no-op", () => {
    mockObserver();
    const setup = vi.fn();
    whenNear(null, setup)();
    expect(setup).not.toHaveBeenCalled();
  });
});
