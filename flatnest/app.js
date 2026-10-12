/**
 * FlatNest — flatten / unflatten nested JSON (client-side only)
 */
(function () {
  "use strict";

  const FREE_MAX_CHARS = 80000; // ~80KB paste
  const els = {
    input: document.getElementById("input"),
    output: document.getElementById("output"),
    status: document.getElementById("status"),
    mode: document.getElementById("mode"),
    separator: document.getElementById("separator"),
    arrays: document.getElementById("arrays"),
    pretty: document.getElementById("pretty"),
    btnRun: document.getElementById("btn-run"),
    btnSample: document.getElementById("btn-sample"),
    btnClear: document.getElementById("btn-clear"),
    btnCopy: document.getElementById("btn-copy"),
    btnDownload: document.getElementById("btn-download"),
    btnSwap: document.getElementById("btn-swap"),
    charCount: document.getElementById("char-count"),
  };

  const SAMPLE = {
    user: {
      id: 42,
      name: "Ada Lovelace",
      profile: {
        email: "ada@example.com",
        prefs: { theme: "dark", locale: "en-US" },
      },
      roles: ["admin", "editor"],
      meta: { createdAt: "2026-01-15T08:00:00Z", tags: ["vip", "beta"] },
    },
    stats: { visits: 1204, conversion: 0.037 },
  };

  function setStatus(msg, kind) {
    els.status.textContent = msg || "";
    els.status.className = "status" + (kind ? " status--" + kind : "");
  }

  function updateCount() {
    const n = (els.input.value || "").length;
    els.charCount.textContent = n.toLocaleString() + " chars";
    if (n > FREE_MAX_CHARS) {
      els.charCount.classList.add("over");
    } else {
      els.charCount.classList.remove("over");
    }
  }

  function isObject(v) {
    return v !== null && typeof v === "object";
  }

  function flatten(obj, sep, arrayStyle) {
    const out = {};
    function walk(cur, path) {
      if (Array.isArray(cur)) {
        if (arrayStyle === "index") {
          cur.forEach(function (item, i) {
            const key = path === "" ? String(i) : path + sep + i;
            if (isObject(item)) walk(item, key);
            else out[key] = item;
          });
        } else {
          // keep arrays as values at this path
          out[path] = cur;
        }
        return;
      }
      if (isObject(cur)) {
        const keys = Object.keys(cur);
        if (keys.length === 0) {
          if (path !== "") out[path] = {};
          return;
        }
        keys.forEach(function (k) {
          const next = path === "" ? k : path + sep + k;
          const val = cur[k];
          if (isObject(val)) walk(val, next);
          else out[next] = val;
        });
        return;
      }
      if (path !== "") out[path] = cur;
    }
    walk(obj, "");
    return out;
  }

  function unflatten(obj, sep) {
    const out = {};
    Object.keys(obj).forEach(function (flatKey) {
      const parts = String(flatKey).split(sep);
      let cur = out;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const nextPart = parts[i + 1];
        const nextIsIndex = nextPart !== undefined && /^\d+$/.test(nextPart);
        if (isLast) {
          cur[part] = obj[flatKey];
        } else {
          if (cur[part] === undefined || cur[part] === null || typeof cur[part] !== "object") {
            cur[part] = nextIsIndex ? [] : {};
          }
          cur = cur[part];
        }
      }
    });
    return out;
  }

  function run() {
    const raw = els.input.value.trim();
    if (!raw) {
      setStatus("Paste JSON on the left, then click Convert.", "warn");
      els.output.value = "";
      return;
    }
    if (raw.length > FREE_MAX_CHARS) {
      setStatus(
        "Free tier limit is " +
          FREE_MAX_CHARS.toLocaleString() +
          " characters. See Pricing for Pro (batch / large files).",
        "error"
      );
      return;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      setStatus("Invalid JSON: " + e.message, "error");
      return;
    }
    const sep = els.separator.value || ".";
    const mode = els.mode.value;
    const arrayStyle = els.arrays.value;
    const pretty = els.pretty.checked;
    let result;
    try {
      if (mode === "flatten") {
        if (!isObject(data) || Array.isArray(data)) {
          setStatus("Flatten expects a JSON object (not a top-level array/primitive).", "error");
          return;
        }
        result = flatten(data, sep, arrayStyle);
      } else {
        if (!isObject(data) || Array.isArray(data)) {
          setStatus("Unflatten expects a flat JSON object of key/value pairs.", "error");
          return;
        }
        result = unflatten(data, sep);
      }
    } catch (e) {
      setStatus("Convert failed: " + e.message, "error");
      return;
    }
    els.output.value = pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
    const keys = Object.keys(result).length;
    setStatus(
      "Done — " +
        mode +
        " · " +
        keys +
        " top-level key" +
        (keys === 1 ? "" : "s") +
        " · processed locally (nothing uploaded).",
      "ok"
    );
  }

  function loadSample() {
    els.input.value = JSON.stringify(SAMPLE, null, 2);
    els.mode.value = "flatten";
    updateCount();
    run();
  }

  function clearAll() {
    els.input.value = "";
    els.output.value = "";
    setStatus("");
    updateCount();
  }

  async function copyOut() {
    const t = els.output.value;
    if (!t) {
      setStatus("Nothing to copy yet.", "warn");
      return;
    }
    try {
      await navigator.clipboard.writeText(t);
      setStatus("Copied to clipboard.", "ok");
    } catch (e) {
      els.output.select();
      document.execCommand("copy");
      setStatus("Copied (fallback).", "ok");
    }
  }

  function downloadOut() {
    const t = els.output.value;
    if (!t) {
      setStatus("Nothing to download yet.", "warn");
      return;
    }
    const blob = new Blob([t], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    const mode = els.mode.value;
    a.href = URL.createObjectURL(blob);
    a.download = mode === "flatten" ? "flattened.json" : "nested.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    setStatus("Download started.", "ok");
  }

  function swapIO() {
    const a = els.input.value;
    els.input.value = els.output.value;
    els.output.value = a;
    els.mode.value = els.mode.value === "flatten" ? "unflatten" : "flatten";
    updateCount();
    setStatus("Swapped panels and toggled mode.", "ok");
  }

  els.btnRun.addEventListener("click", run);
  els.btnSample.addEventListener("click", loadSample);
  els.btnClear.addEventListener("click", clearAll);
  els.btnCopy.addEventListener("click", copyOut);
  els.btnDownload.addEventListener("click", downloadOut);
  els.btnSwap.addEventListener("click", swapIO);
  els.input.addEventListener("input", updateCount);
  ["mode", "separator", "arrays", "pretty"].forEach(function (id) {
    els[id].addEventListener("change", function () {
      if (els.input.value.trim()) run();
    });
  });

  // Ctrl/Cmd+Enter
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });

  updateCount();
  setStatus("Paste nested JSON → Convert. Runs entirely in your browser.", "");
})();
