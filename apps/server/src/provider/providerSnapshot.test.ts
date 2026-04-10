import { Effect, Stream } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";

import { collectStreamAsString, quoteWindowsShellArgument } from "./providerSnapshot";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("collectStreamAsString", () => {
  it("decodes UTF-16LE Windows output across odd chunk boundaries", async () => {
    vi.stubGlobal("process", { ...process, platform: "win32" });

    const output = Buffer.from("n\u00e3o \u00e9 reconhecido", "utf16le");
    const firstChunk = new Uint8Array(output.subarray(0, 5));
    const secondChunk = new Uint8Array(output.subarray(5));

    const result = await Effect.runPromise(
      collectStreamAsString(Stream.make(firstChunk, secondChunk)),
    );

    expect(result).toBe("n\u00e3o \u00e9 reconhecido");
  });
});

describe("quoteWindowsShellArgument", () => {
  it("preserves trailing backslashes when quoting is not needed", () => {
    expect(quoteWindowsShellArgument("C:\\tools\\")).toBe("C:\\tools\\");
  });

  it("doubles trailing backslashes only when quoting is needed", () => {
    expect(quoteWindowsShellArgument("C:\\Program Files\\tool\\")).toBe(
      '"C:\\Program Files\\tool\\\\"',
    );
  });
});
