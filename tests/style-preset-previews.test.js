"use strict";

// Rich style preset preview smoke suite for Podcast Design Canvas (#102).
// Run with: `node tests/style-preset-previews.test.js`.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const style = require("../app/episode-style.js");

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
  console.log(`  ok ${name}`);
}

const ui = fs.readFileSync(path.join(__dirname, "../app/episode-setup.ui.js"), "utf8");
const styles = fs.readFileSync(path.join(__dirname, "../app/styles.css"), "utf8");

test("buildRichPreviewModel returns multi-speaker frames and overlay cues", () => {
  const preset = style.getPreset("bold-broadcast");
  const model = style.buildRichPreviewModel(preset, null, { showName: "Founders Unfiltered" });
  assert.strictEqual(model.frames.length, 3);
  assert.ok(model.overlayLabel);
  assert.ok(model.captionText);
  assert.ok(model.titleText);
  assert.strictEqual(model.showName, "Founders Unfiltered");
});

test("each named preset preview is visually distinct", () => {
  const overlays = new Set();
  const captions = new Set();
  style.STYLE_PRESETS.forEach((preset) => {
    const model = style.buildRichPreviewModel(preset);
    overlays.add(model.overlayLabel);
    captions.add(model.captionText);
    assert.notStrictEqual(model.layoutId, "");
  });
  assert.strictEqual(overlays.size, style.STYLE_PRESETS.length);
  assert.strictEqual(captions.size, style.STYLE_PRESETS.length);
});

test("new-show UI uses rich preset cards, main preview, and secondary blank path", () => {
  assert.ok(ui.includes("renderRichEpisodePreview"));
  assert.ok(ui.includes("openNewShowPresetPreview"));
  assert.ok(ui.includes("create-show-preset-picker"));
  assert.ok(ui.includes("create-show-main-preview"));
  assert.ok(ui.includes("create-show-secondary"));
  assert.ok(ui.includes("rich-preset-card-blank"));
});

test("styles define large rich episode preview layout", () => {
  assert.ok(styles.includes(".rich-episode-preview-large"));
  assert.ok(styles.includes(".rich-preview-frames"));
  assert.ok(styles.includes(".create-show-layout"));
  assert.ok(styles.includes(".rich-preview-caption"));
});

test("ACCEPTANCE: preset picker preserves show context and exposes publishable preview metadata", () => {
  style.STYLE_PRESETS.forEach((preset) => {
    const model = style.buildRichPreviewModel(preset, {
      presetId: preset.id,
      layout: preset.defaultLayout,
      pacing: "balanced",
    }, {
      showName: "Test Show",
    });
    assert.ok(model.presetName);
    assert.ok(model.formatCue);
    assert.ok(model.frames.some((frame) => frame.role === "Host"));
    assert.ok(model.pacingLabel);
    assert.ok(model.captionStyle);
  });
});

console.log(`\nstyle preset previews: ${passed} assertions passed`);
