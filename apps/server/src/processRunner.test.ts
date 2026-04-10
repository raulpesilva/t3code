import { afterEach, describe, expect, it, vi } from "vitest";

import { isWindowsCommandNotFound, runProcess } from "./processRunner";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runProcess", () => {
  it("fails when output exceeds max buffer in default mode", async () => {
    await expect(
      runProcess("node", ["-e", "process.stdout.write('x'.repeat(2048))"], { maxBufferBytes: 128 }),
    ).rejects.toThrow("exceeded stdout buffer limit");
  });

  it("truncates output when outputMode is truncate", async () => {
    const result = await runProcess("node", ["-e", "process.stdout.write('x'.repeat(2048))"], {
      maxBufferBytes: 128,
      outputMode: "truncate",
    });

    expect(result.code).toBe(0);
    expect(result.stdout.length).toBeLessThanOrEqual(128);
    expect(result.stdoutTruncated).toBe(true);
    expect(result.stderrTruncated).toBe(false);
  });

  it("recognizes localized Windows command-not-found errors", () => {
    vi.stubGlobal("process", { ...process, platform: "win32" });

    expect(
      isWindowsCommandNotFound(
        1,
        "'codex' n\u00e3o \u00e9 reconhecido como um comando interno\r\nou externo, um programa oper\u00e1vel ou um arquivo em lotes.\r\n",
      ),
    ).toBe(true);
  });
});
