import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPracticeDestination,
  resolveSlugRedirect,
} from "./practice-redirects.ts";

const EXISTING_SLUGS: Record<string, string> = {
  "my-story-video": "https://youtu.be/ZE92UJs0NFc",
  kickoff: "https://open.substack.com/pub/freewithtech/p/example",
};

describe("getPracticeDestination", () => {
  it("builds English practice short links for positive integer IDs", () => {
    assert.equal(
      getPracticeDestination("1"),
      "https://live.freewithtech.com/practices/1?utm_source=fwt.wtf&utm_medium=shortlink"
    );
    assert.equal(
      getPracticeDestination("57"),
      "https://live.freewithtech.com/practices/57?utm_source=fwt.wtf&utm_medium=shortlink"
    );
  });

  it("builds Slovak practice short links", () => {
    assert.equal(
      getPracticeDestination("12", "sk"),
      "https://live.freewithtech.com/sk/practices/12?utm_source=fwt.wtf&utm_medium=shortlink"
    );
  });

  it("forwards ID.md paths without doubling the suffix", () => {
    assert.equal(
      getPracticeDestination("3.md"),
      "https://live.freewithtech.com/practices/3.md?utm_source=fwt.wtf&utm_medium=shortlink"
    );
    assert.equal(
      getPracticeDestination("3.md", "sk"),
      "https://live.freewithtech.com/sk/practices/3.md?utm_source=fwt.wtf&utm_medium=shortlink"
    );
    assert.equal(
      getPracticeDestination("12.md"),
      "https://live.freewithtech.com/practices/12.md?utm_source=fwt.wtf&utm_medium=shortlink"
    );
  });

  it("rejects values that are not positive integers or ID.md", () => {
    assert.equal(getPracticeDestination("0"), null);
    assert.equal(getPracticeDestination("01"), null);
    assert.equal(getPracticeDestination("12abc"), null);
    assert.equal(getPracticeDestination("12.md.md"), null);
    assert.equal(getPracticeDestination("3.MD"), null);
    assert.equal(getPracticeDestination("my-story-video"), null);
    assert.equal(getPracticeDestination(""), null);
  });
});

describe("resolveSlugRedirect", () => {
  it("keeps existing word-slug mappings unchanged", () => {
    assert.deepEqual(resolveSlugRedirect("my-story-video", EXISTING_SLUGS), {
      destination: "https://youtu.be/ZE92UJs0NFc",
      permanent: false,
    });
  });

  it("uses the generic numeric practice pattern when no explicit slug exists", () => {
    assert.deepEqual(resolveSlugRedirect("1", EXISTING_SLUGS), {
      destination:
        "https://live.freewithtech.com/practices/1?utm_source=fwt.wtf&utm_medium=shortlink",
      permanent: true,
    });
    assert.deepEqual(resolveSlugRedirect("57", EXISTING_SLUGS), {
      destination:
        "https://live.freewithtech.com/practices/57?utm_source=fwt.wtf&utm_medium=shortlink",
      permanent: true,
    });
    assert.deepEqual(resolveSlugRedirect("3.md", EXISTING_SLUGS), {
      destination:
        "https://live.freewithtech.com/practices/3.md?utm_source=fwt.wtf&utm_medium=shortlink",
      permanent: true,
    });
  });

  it("lets an explicit mapping win over the numeric practice pattern", () => {
    const redirects = {
      ...EXISTING_SLUGS,
      "1": "https://live.freewithtech.com/custom-one",
    };

    assert.deepEqual(resolveSlugRedirect("1", redirects), {
      destination: "https://live.freewithtech.com/custom-one",
      permanent: false,
    });
  });

  it("returns null for unknown non-numeric slugs", () => {
    assert.equal(resolveSlugRedirect("not-a-real-slug", EXISTING_SLUGS), null);
  });
});
