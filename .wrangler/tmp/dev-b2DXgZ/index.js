var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/index.js
import indexHtml from "./1d2e16196472288e133b83f7e668de1b42290037-index.html";

// src/providers/interfaces.js
var UniverseProvider = class {
  static {
    __name(this, "UniverseProvider");
  }
  async getUniverse(_env) {
    throw new Error("UniverseProvider.getUniverse not implemented");
  }
};
var QuoteProvider = class {
  static {
    __name(this, "QuoteProvider");
  }
  async getQuote(_ticker, _env) {
    throw new Error("QuoteProvider.getQuote not implemented");
  }
  async getBars(_ticker, _interval, _lookback, _env) {
    throw new Error("QuoteProvider.getBars not implemented");
  }
};
var CatalystProvider = class {
  static {
    __name(this, "CatalystProvider");
  }
  async getCatalysts(_ticker, _env) {
    throw new Error("CatalystProvider.getCatalysts not implemented");
  }
};
function unavailable(reason) {
  return { ok: false, reason, sourceTimestamp: null, retrievedTimestamp: Date.now(), freshness: "unavailable" };
}
__name(unavailable, "unavailable");

// src/providers/alpaca.js
var BASE = "https://data.alpaca.markets/v2";
function headers(env2) {
  return {
    "APCA-API-KEY-ID": env2.ALPACA_API_KEY,
    "APCA-API-SECRET-KEY": env2.ALPACA_API_SECRET,
    Accept: "application/json"
  };
}
__name(headers, "headers");
async function alpacaFetch(env2, path, params = {}) {
  if (!env2.ALPACA_API_KEY || !env2.ALPACA_API_SECRET) {
    return unavailable("Alpaca API credentials are not configured");
  }
  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, value);
  }
  let res;
  try {
    res = await fetch(url.toString(), {
      headers: headers(env2)
    });
  } catch (err) {
    return unavailable(`Alpaca network error: ${err.message}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return unavailable(`Alpaca HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
  try {
    const json2 = await res.json();
    return {
      ok: true,
      data: json2,
      sourceTimestamp: Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: "live"
    };
  } catch (err) {
    return unavailable(`Alpaca invalid JSON response: ${err.message}`);
  }
}
__name(alpacaFetch, "alpacaFetch");
function normalizeBars(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((b) => ({
    time: b.t,
    open: Number(b.o),
    high: Number(b.h),
    low: Number(b.l),
    close: Number(b.c),
    volume: Number(b.v)
  }));
}
__name(normalizeBars, "normalizeBars");
var AlpacaQuoteProvider = class extends QuoteProvider {
  static {
    __name(this, "AlpacaQuoteProvider");
  }
  async getQuote(ticker, env2) {
    const latest = await alpacaFetch(
      env2,
      `/stocks/${encodeURIComponent(ticker)}/trades/latest`,
      { feed: "iex" }
    );
    if (!latest.ok) return latest;
    const trade = latest.data?.trade;
    if (!trade?.p) {
      return unavailable(`No latest trade returned for ${ticker}`);
    }
    const now = /* @__PURE__ */ new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    const bars = await alpacaFetch(
      env2,
      `/stocks/${encodeURIComponent(ticker)}/bars`,
      {
        timeframe: "1Min",
        start: start.toISOString(),
        feed: "iex",
        limit: 1e4
      }
    );
    if (!bars.ok) return bars;
    const todayBars = normalizeBars(bars.data?.bars);
    if (todayBars.length === 0) {
      return unavailable(`No intraday bars returned for ${ticker}`);
    }
    const first = todayBars[0];
    return {
      ok: true,
      data: {
        price: Number(trade.p),
        prevClose: null,
        open: first.open,
        high: Math.max(...todayBars.map((b) => b.high)),
        low: Math.min(...todayBars.map((b) => b.low)),
        volume: todayBars.reduce((sum, b) => sum + b.volume, 0),
        change: null,
        changePct: null
      },
      sourceTimestamp: trade.t ? Date.parse(trade.t) : Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: "live"
    };
  }
  async getBars(ticker, interval, lookback, env2) {
    const timeframe = {
      "1min": "1Min",
      "5min": "5Min",
      "15min": "15Min",
      daily: "1Day"
    }[interval];
    if (!timeframe) {
      return unavailable(`Unsupported Alpaca interval: ${interval}`);
    }
    const end = /* @__PURE__ */ new Date();
    const start = new Date(end.getTime() - lookback);
    const r = await alpacaFetch(
      env2,
      `/stocks/${encodeURIComponent(ticker)}/bars`,
      {
        timeframe,
        start: start.toISOString(),
        end: end.toISOString(),
        feed: "iex",
        limit: 1e4
      }
    );
    if (!r.ok) return r;
    const bars = normalizeBars(r.data?.bars);
    if (bars.length === 0) {
      return unavailable(`No ${interval} bars returned for ${ticker}`);
    }
    return {
      ok: true,
      data: bars,
      sourceTimestamp: bars.at(-1)?.time ? Date.parse(bars.at(-1).time) : Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: "live"
    };
  }
};

// src/providers/finnhub.js
var BASE2 = "https://finnhub.io/api/v1";
async function finnhubFetch(env2, path, params) {
  if (!env2.FINNHUB_API_KEY) return unavailable("FINNHUB_API_KEY secret not configured");
  const url = new URL(BASE2 + path);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  url.searchParams.set("token", env2.FINNHUB_API_KEY);
  let res;
  try {
    res = await fetch(url.toString());
  } catch (err) {
    return unavailable(`Finnhub network error: ${err.message}`);
  }
  if (!res.ok) return unavailable(`Finnhub HTTP ${res.status}`);
  return { ok: true, data: await res.json(), sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: "delayed" };
}
__name(finnhubFetch, "finnhubFetch");
var FinnhubCatalystProvider = class extends CatalystProvider {
  static {
    __name(this, "FinnhubCatalystProvider");
  }
  async getCatalysts(ticker, env2) {
    const catalysts = [];
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const news = await finnhubFetch(env2, "/company-news", { symbol: ticker, from: weekAgo, to: today });
    if (news.ok && Array.isArray(news.data)) {
      for (const n of news.data.slice(0, 8)) {
        catalysts.push({ type: "news", headline: n.headline, timestamp: n.datetime * 1e3, source: n.source });
      }
    }
    const earnings = await finnhubFetch(env2, "/calendar/earnings", { symbol: ticker, from: today, to: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10) });
    if (earnings.ok && Array.isArray(earnings.data?.earningsCalendar)) {
      for (const e of earnings.data.earningsCalendar) {
        catalysts.push({ type: "earnings", headline: `Earnings ${e.date} (${e.hour || "time TBD"})`, timestamp: new Date(e.date).getTime() });
      }
    }
    const upgrades = await finnhubFetch(env2, "/stock/upgrade-downgrade", { symbol: ticker, from: weekAgo, to: today });
    if (upgrades.ok && Array.isArray(upgrades.data)) {
      for (const u of upgrades.data.slice(0, 5)) {
        const type = u.action === "up" ? "upgrade" : u.action === "down" ? "downgrade" : "price-target";
        catalysts.push({ type, headline: `${u.company}: ${u.fromGrade || ""}\u2192${u.toGrade || ""}`.trim(), timestamp: Date.parse(u.gradeTime) || Date.now(), source: u.company });
      }
    }
    if (catalysts.length === 0 && !news.ok && !earnings.ok && !upgrades.ok) {
      return unavailable("Finnhub returned no usable data for this ticker");
    }
    catalysts.sort((a, b) => b.timestamp - a.timestamp);
    return { ok: true, data: catalysts, sourceTimestamp: Date.now(), retrievedTimestamp: Date.now(), freshness: "delayed" };
  }
};

// src/providers/universe.js
var NASDAQ_LISTED_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt";
var OTHER_LISTED_URL = "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt";
var SP500_URL = "https://www.spglobal.com/spdji/en/indices/equity/sp-500/";
var RUSSELL_URL = "https://www.lseg.com/en/ftse-russell/";
function parsePipeDelimited(text, symbolCol, testIssueCol) {
  const lines = text.trim().split("\n");
  const out = [];
  for (let i = 1; i < lines.length - 1; i++) {
    const cols = lines[i].split("|");
    const symbol = cols[symbolCol];
    const isTest = cols[testIssueCol] === "Y";
    if (symbol && !isTest && /^[A-Z.]{1,6}$/.test(symbol)) {
      out.push(symbol.replace(".", "-"));
    }
  }
  return out;
}
__name(parsePipeDelimited, "parsePipeDelimited");
async function fetchListedUniverse() {
  let nasdaqText;
  let otherText;
  try {
    const [a, b] = await Promise.all([
      fetch(NASDAQ_LISTED_URL),
      fetch(OTHER_LISTED_URL)
    ]);
    if (!a.ok || !b.ok) {
      return unavailable(
        `Symbol directory fetch failed (${a.status}/${b.status})`
      );
    }
    [nasdaqText, otherText] = await Promise.all([
      a.text(),
      b.text()
    ]);
  } catch (err) {
    return unavailable(
      `Symbol directory network error: ${err.message}`
    );
  }
  const nasdaq = parsePipeDelimited(
    nasdaqText,
    0,
    3
  );
  const other = parsePipeDelimited(
    otherText,
    0,
    6
  );
  const universe = Array.from(
    /* @__PURE__ */ new Set([...nasdaq, ...other])
  ).sort();
  if (universe.length === 0) {
    return unavailable(
      "Symbol directories parsed to zero symbols"
    );
  }
  return universe;
}
__name(fetchListedUniverse, "fetchListedUniverse");
var NasdaqTraderUniverseProvider = class extends UniverseProvider {
  static {
    __name(this, "NasdaqTraderUniverseProvider");
  }
  async getUniverse(_env) {
    const universe = await fetchListedUniverse();
    if (!Array.isArray(universe)) {
      return universe;
    }
    return {
      ok: true,
      data: universe,
      sourceTimestamp: Date.now(),
      retrievedTimestamp: Date.now(),
      freshness: "delayed",
      universes: {
        "NASDAQ/NYSE": universe,
        "S&P 500": [],
        "Russell 2000": []
      },
      universeSources: {
        "NASDAQ/NYSE": "Nasdaq Trader symbol directories",
        "S&P 500": SP500_URL,
        "Russell 2000": RUSSELL_URL
      },
      note: "S&P 500 and Russell 2000 membership sources are registered for the universe layer; constituent ingestion will be added separately so membership is not fabricated or hard-coded."
    };
  }
};

// src/providers/index.js
var providers = {
  universe: new NasdaqTraderUniverseProvider(),
  quotesPrimary: new AlpacaQuoteProvider(),
  catalysts: new FinnhubCatalystProvider()
};
async function getQuoteWithFallback(ticker, env2) {
  return providers.quotesPrimary.getQuote(ticker, env2);
}
__name(getQuoteWithFallback, "getQuoteWithFallback");

// src/engine/queue.js
var QUEUE_INDEX_KEY = "queue:index";
var MAX_QUEUE_SIZE = 500;
var MAX_AGE_MS = 4 * 3600 * 1e3;
var MAX_RETRIES = 6;
async function readIndex(kv) {
  return await kv.get(QUEUE_INDEX_KEY, "json") || [];
}
__name(readIndex, "readIndex");
async function writeIndex(kv, index) {
  await kv.put(QUEUE_INDEX_KEY, JSON.stringify(index));
}
__name(writeIndex, "writeIndex");
function evict(index) {
  const now = Date.now();
  let out = index.filter(
    (e) => now - e.enqueuedAt < MAX_AGE_MS && e.retries < MAX_RETRIES
  );
  if (out.length > MAX_QUEUE_SIZE) {
    out = out.sort(
      (a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt
    ).slice(0, MAX_QUEUE_SIZE);
  }
  return out;
}
__name(evict, "evict");
async function enqueue(kv, ticker, priority = 0) {
  const index = await readIndex(kv);
  if (index.find((e) => e.ticker === ticker)) return;
  index.push({
    ticker,
    priority,
    enqueuedAt: Date.now(),
    retries: 0,
    lastAttempt: null
  });
  index.sort(
    (a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt
  );
  await writeIndex(kv, evict(index));
}
__name(enqueue, "enqueue");
async function enqueueBatch(kv, tickers, priority = 0) {
  if (!Array.isArray(tickers) || tickers.length === 0) return 0;
  const index = await readIndex(kv);
  const existing = new Set(index.map((e) => e.ticker));
  const now = Date.now();
  let added = 0;
  for (const ticker of tickers) {
    if (!ticker || existing.has(ticker)) continue;
    index.push({
      ticker,
      priority,
      enqueuedAt: now,
      retries: 0,
      lastAttempt: null
    });
    existing.add(ticker);
    added++;
  }
  index.sort(
    (a, b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt
  );
  await writeIndex(kv, evict(index));
  return added;
}
__name(enqueueBatch, "enqueueBatch");
async function dequeueBatch(kv, batchSize = 25) {
  const index = await readIndex(kv);
  return index.slice(0, batchSize);
}
__name(dequeueBatch, "dequeueBatch");
async function markProcessed(kv, ticker, succeeded) {
  const index = await readIndex(kv);
  const idx = index.findIndex((e) => e.ticker === ticker);
  if (idx === -1) return;
  if (succeeded) {
    index.splice(idx, 1);
  } else {
    index[idx].retries += 1;
    index[idx].lastAttempt = Date.now();
  }
  await writeIndex(kv, evict(index));
}
__name(markProcessed, "markProcessed");
async function queueStatus(kv) {
  const index = await readIndex(kv);
  const now = Date.now();
  return {
    depth: index.length,
    oldestAgeMs: index.length ? Math.max(...index.map((e) => now - e.enqueuedAt)) : 0,
    itemsNearRetryLimit: index.filter(
      (e) => e.retries >= MAX_RETRIES - 1
    ).length
  };
}
__name(queueStatus, "queueStatus");

// src/engine/technical.js
function vwap(bars) {
  let cumPV = 0, cumVol = 0;
  for (const b of bars) {
    const typical = (b.high + b.low + b.close) / 3;
    cumPV += typical * b.volume;
    cumVol += b.volume;
  }
  return cumVol > 0 ? cumPV / cumVol : null;
}
__name(vwap, "vwap");
function ema(values, period) {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  let e = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < values.length; i++) e = values[i] * k + e * (1 - k);
  return e;
}
__name(ema, "ema");
function atr(bars, period = 14) {
  if (bars.length < period + 1) return null;
  const trs = [];
  for (let i = 1; i < bars.length; i++) {
    const cur = bars[i], prev = bars[i - 1];
    trs.push(Math.max(cur.high - cur.low, Math.abs(cur.high - prev.close), Math.abs(cur.low - prev.close)));
  }
  const recent = trs.slice(-period);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
}
__name(atr, "atr");
function adr(dailyBars, period = 20) {
  if (dailyBars.length < period) return null;
  const recent = dailyBars.slice(-period);
  const ranges = recent.map((b) => (b.high - b.low) / b.close * 100);
  return ranges.reduce((a, b) => a + b, 0) / ranges.length;
}
__name(adr, "adr");
function relativeVolume(bars, lookbackDays = 20) {
  if (bars.length < 2) return null;
  const today = bars[bars.length - 1];
  const priorDays = bars.slice(0, -1).slice(-lookbackDays);
  if (priorDays.length === 0) return null;
  const avgVol2 = priorDays.reduce((a, b) => a + b.volume, 0) / priorDays.length;
  return avgVol2 > 0 ? today.volume / avgVol2 : null;
}
__name(relativeVolume, "relativeVolume");
function momentum(closes, period = 10) {
  if (closes.length < period + 1) return null;
  const past = closes[closes.length - 1 - period];
  const now = closes[closes.length - 1];
  return past ? (now - past) / past * 100 : null;
}
__name(momentum, "momentum");
function previousDayLevels(dailyBars) {
  if (dailyBars.length < 2) return {};
  const prev = dailyBars[dailyBars.length - 2];
  return { pdh: prev.high, pdl: prev.low, prevClose: prev.close };
}
__name(previousDayLevels, "previousDayLevels");
function weeklyLevels(dailyBars) {
  const week = dailyBars.slice(-5);
  if (week.length === 0) return {};
  return { weeklyHigh: Math.max(...week.map((b) => b.high)), weeklyLow: Math.min(...week.map((b) => b.low)) };
}
__name(weeklyLevels, "weeklyLevels");
function premarketLevels(premarketBars) {
  if (!premarketBars || premarketBars.length === 0) return {};
  return {
    pmh: Math.max(...premarketBars.map((b) => b.high)),
    pml: Math.min(...premarketBars.map((b) => b.low))
  };
}
__name(premarketLevels, "premarketLevels");
function sessionLevels(sessionBars) {
  if (!sessionBars || sessionBars.length === 0) return {};
  return {
    sessionHigh: Math.max(...sessionBars.map((b) => b.high)),
    sessionLow: Math.min(...sessionBars.map((b) => b.low))
  };
}
__name(sessionLevels, "sessionLevels");
function supportResistance(dailyBars, lookback = 40, window = 3) {
  const bars = dailyBars.slice(-lookback);
  const supports = [], resistances = [];
  for (let i = window; i < bars.length - window; i++) {
    const slice = bars.slice(i - window, i + window + 1);
    const low = bars[i].low, high = bars[i].high;
    if (low === Math.min(...slice.map((b) => b.low))) supports.push(low);
    if (high === Math.max(...slice.map((b) => b.high))) resistances.push(high);
  }
  return { supports: dedupeLevels(supports), resistances: dedupeLevels(resistances) };
}
__name(supportResistance, "supportResistance");
function dedupeLevels(levels, tolerancePct = 0.3) {
  const sorted = [...levels].sort((a, b) => a - b);
  const out = [];
  for (const lvl of sorted) {
    const last = out[out.length - 1];
    if (last == null || Math.abs(lvl - last) / last * 100 > tolerancePct) out.push(lvl);
  }
  return out;
}
__name(dedupeLevels, "dedupeLevels");
function allTimeHighLow(dailyBars) {
  if (!dailyBars || dailyBars.length === 0) return {};
  return { ath: Math.max(...dailyBars.map((b) => b.high)), atl: Math.min(...dailyBars.map((b) => b.low)) };
}
__name(allTimeHighLow, "allTimeHighLow");
function buildTechnicalContext({ dailyBars, intradayBars, premarketBars, sessionBars, benchmarkChangePct }) {
  const closes = dailyBars.map((b) => b.close);
  return {
    vwap: vwap(sessionBars || intradayBars || []),
    ema9: ema(closes, 9),
    ema20: ema(closes, 20),
    atr14: atr(dailyBars, 14),
    adr20: adr(dailyBars, 20),
    relVolume: relativeVolume(dailyBars, 20),
    momentum10: momentum(closes, 10),
    ...previousDayLevels(dailyBars),
    ...weeklyLevels(dailyBars),
    ...premarketLevels(premarketBars),
    ...sessionLevels(sessionBars),
    ...supportResistance(dailyBars),
    ...allTimeHighLow(dailyBars)
  };
}
__name(buildTechnicalContext, "buildTechnicalContext");

// src/engine/setups/common.js
var SETUP_STATE = Object.freeze({
  POTENTIAL: "Potential",
  AWAITING_CONFIRMATION: "Awaiting confirmation",
  CONFIRMED: "Confirmed",
  INVALIDATED: "Invalidated",
  EXPIRED: "Expired/Stale"
});
var SETUP_TYPES = Object.freeze([
  "Break & Retest",
  "Support Bounce",
  "Resistance Rejection",
  "Breakout",
  "Breakdown",
  "Bull Flag",
  "Bear Flag",
  "Consolidation Breakout",
  "Consolidation Breakdown",
  "Premarket High Break",
  "Premarket Low Break",
  "Previous-Day High Break",
  "Previous-Day Low Break",
  "Double Bottom",
  "Double Top"
]);
function makeSetup(partial) {
  return {
    state: SETUP_STATE.POTENTIAL,
    isPremarketOnly: false,
    ...partial
  };
}
__name(makeSetup, "makeSetup");
function clampPremarketState(setup, isPremarketSession) {
  if (isPremarketSession && setup.state === SETUP_STATE.CONFIRMED) {
    return { ...setup, state: SETUP_STATE.AWAITING_CONFIRMATION, isPremarketOnly: true };
  }
  return setup;
}
__name(clampPremarketState, "clampPremarketState");
function near(price, level, toleranceAtrFraction, atr14) {
  if (level == null || price == null) return false;
  const tolerance = atr14 ? atr14 * toleranceAtrFraction : level * 15e-4;
  return Math.abs(price - level) <= tolerance;
}
__name(near, "near");

// src/engine/setups/breakoutFamily.js
function detectBreakRetest(ticker, bars, ctx) {
  if (bars.length < 6) return null;
  const level = ctx.pdh ?? ctx.resistances?.[0];
  if (!level) return null;
  const recent = bars.slice(-6);
  const breakIdx = recent.findIndex((b) => b.close > level);
  if (breakIdx === -1 || breakIdx >= recent.length - 2) return null;
  const afterBreak = recent.slice(breakIdx + 1);
  const pulledBack = afterBreak.some((b) => b.low <= level * 1.001);
  const held = afterBreak[afterBreak.length - 1].close > level;
  if (!pulledBack) return null;
  const state = held ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Break & Retest",
    state,
    trigger: `Reclaim and hold above ${level.toFixed(2)} after retest`,
    confirmation: `Close back above ${level.toFixed(2)} following the pullback`,
    invalidation: `Close below ${(level * 0.995).toFixed(2)}`,
    levels: { level }
  });
}
__name(detectBreakRetest, "detectBreakRetest");
function detectBreakout(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const level = ctx.resistances?.find((r) => r > (ctx.prevClose ?? 0)) ?? ctx.pdh;
  if (!level) return null;
  const last3 = bars.slice(-3);
  const allAbove = last3.every((b) => b.close > level);
  const justBroke = bars[bars.length - 4]?.close <= level;
  if (!allAbove) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.3;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Breakout",
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Sustained acceptance above ${level.toFixed(2)}`,
    confirmation: `3 consecutive closes above ${level.toFixed(2)} with relative volume \u2265 1.3x`,
    invalidation: `Close back below ${level.toFixed(2)}`,
    levels: { level, justBroke: !!justBroke }
  });
}
__name(detectBreakout, "detectBreakout");
function detectBreakdown(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const level = ctx.supports?.find((s) => s < (ctx.prevClose ?? Infinity)) ?? ctx.pdl;
  if (!level) return null;
  const last3 = bars.slice(-3);
  const allBelow = last3.every((b) => b.close < level);
  if (!allBelow) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.3;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Breakdown",
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Sustained acceptance below ${level.toFixed(2)}`,
    confirmation: `3 consecutive closes below ${level.toFixed(2)} with relative volume \u2265 1.3x`,
    invalidation: `Close back above ${level.toFixed(2)}`,
    levels: { level }
  });
}
__name(detectBreakdown, "detectBreakdown");

// src/engine/setups/bounceRejectionFamily.js
function detectSupportBounce(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const support = ctx.supports?.find((s) => near(bars[bars.length - 2].low, s, 0.6, ctx.atr14));
  if (!support) return null;
  const testBar = bars[bars.length - 2];
  const rejected = testBar.low < support && testBar.close > support;
  if (!rejected) return null;
  const nextBar = bars[bars.length - 1];
  const reclaimed = nextBar.close > testBar.close;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Support Bounce",
    state: reclaimed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Hold above ${support.toFixed(2)} with follow-through buying`,
    confirmation: `Close above the rejection bar's close (${testBar.close.toFixed(2)})`,
    invalidation: `Close below ${support.toFixed(2)}`,
    levels: { support }
  });
}
__name(detectSupportBounce, "detectSupportBounce");
function detectResistanceRejection(ticker, bars, ctx) {
  if (bars.length < 3) return null;
  const resistance = ctx.resistances?.find((r) => near(bars[bars.length - 2].high, r, 0.6, ctx.atr14));
  if (!resistance) return null;
  const testBar = bars[bars.length - 2];
  const rejected = testBar.high > resistance && testBar.close < resistance;
  if (!rejected) return null;
  const nextBar = bars[bars.length - 1];
  const confirmed = nextBar.close < testBar.close;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Resistance Rejection",
    state: confirmed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Stay below ${resistance.toFixed(2)} with follow-through selling`,
    confirmation: `Close below the rejection bar's close (${testBar.close.toFixed(2)})`,
    invalidation: `Close above ${resistance.toFixed(2)}`,
    levels: { resistance }
  });
}
__name(detectResistanceRejection, "detectResistanceRejection");

// src/engine/setups/flagConsolidationFamily.js
function rangePct(bars) {
  const highs = bars.map((b) => b.high), lows = bars.map((b) => b.low);
  const hi = Math.max(...highs), lo = Math.min(...lows);
  return (hi - lo) / lo * 100;
}
__name(rangePct, "rangePct");
function detectBullFlag(ticker, bars, ctx) {
  if (bars.length < 8) return null;
  const pole = bars.slice(-8, -4);
  const flag = bars.slice(-4);
  const poleMove = (pole[pole.length - 1].close - pole[0].open) / pole[0].open * 100;
  if (poleMove < 3) return null;
  const flagTight = rangePct(flag) < poleMove * 0.5;
  const flagVolDown = avgVol(flag) < avgVol(pole);
  if (!flagTight || !flagVolDown) return null;
  const flagHigh = Math.max(...flag.map((b) => b.high));
  const last = bars[bars.length - 1];
  const broke = last.close > flagHigh;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Bull Flag",
    state: broke ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above flag high ${flagHigh.toFixed(2)} on expanding volume`,
    confirmation: `Close above ${flagHigh.toFixed(2)} with volume exceeding the flag's average`,
    invalidation: `Close below the flag low ${Math.min(...flag.map((b) => b.low)).toFixed(2)}`,
    levels: { flagHigh, flagLow: Math.min(...flag.map((b) => b.low)), poleStart: pole[0].open }
  });
}
__name(detectBullFlag, "detectBullFlag");
function detectBearFlag(ticker, bars, ctx) {
  if (bars.length < 8) return null;
  const pole = bars.slice(-8, -4);
  const flag = bars.slice(-4);
  const poleMove = (pole[0].open - pole[pole.length - 1].close) / pole[0].open * 100;
  if (poleMove < 3) return null;
  const flagTight = rangePct(flag) < poleMove * 0.5;
  const flagVolDown = avgVol(flag) < avgVol(pole);
  if (!flagTight || !flagVolDown) return null;
  const flagLow = Math.min(...flag.map((b) => b.low));
  const last = bars[bars.length - 1];
  const broke = last.close < flagLow;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Bear Flag",
    state: broke ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below flag low ${flagLow.toFixed(2)} on expanding volume`,
    confirmation: `Close below ${flagLow.toFixed(2)} with volume exceeding the flag's average`,
    invalidation: `Close above the flag high ${Math.max(...flag.map((b) => b.high)).toFixed(2)}`,
    levels: { flagLow, flagHigh: Math.max(...flag.map((b) => b.high)), poleStart: pole[0].open }
  });
}
__name(detectBearFlag, "detectBearFlag");
function detectConsolidationBreakout(ticker, bars, ctx) {
  if (bars.length < 10) return null;
  const range = bars.slice(-10, -1);
  if (rangePct(range) > 4) return null;
  const rangeHigh = Math.max(...range.map((b) => b.high));
  const last = bars[bars.length - 1];
  if (last.close <= rangeHigh) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.5;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Consolidation Breakout",
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above range high ${rangeHigh.toFixed(2)} with volume expansion`,
    confirmation: `Close above ${rangeHigh.toFixed(2)} with relative volume \u2265 1.5x`,
    invalidation: `Close back inside the range (below ${rangeHigh.toFixed(2)})`,
    levels: { rangeHigh, rangeLow: Math.min(...range.map((b) => b.low)) }
  });
}
__name(detectConsolidationBreakout, "detectConsolidationBreakout");
function detectConsolidationBreakdown(ticker, bars, ctx) {
  if (bars.length < 10) return null;
  const range = bars.slice(-10, -1);
  if (rangePct(range) > 4) return null;
  const rangeLow = Math.min(...range.map((b) => b.low));
  const last = bars[bars.length - 1];
  if (last.close >= rangeLow) return null;
  const relVolOk = (ctx.relVolume ?? 0) >= 1.5;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Consolidation Breakdown",
    state: relVolOk ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below range low ${rangeLow.toFixed(2)} with volume expansion`,
    confirmation: `Close below ${rangeLow.toFixed(2)} with relative volume \u2265 1.5x`,
    invalidation: `Close back inside the range (above ${rangeLow.toFixed(2)})`,
    levels: { rangeLow, rangeHigh: Math.max(...range.map((b) => b.high)) }
  });
}
__name(detectConsolidationBreakdown, "detectConsolidationBreakdown");
function avgVol(bars) {
  return bars.reduce((a, b) => a + b.volume, 0) / bars.length;
}
__name(avgVol, "avgVol");

// src/engine/setups/levelBreakFamily.js
function detectPremarketHighBreak(ticker, bars, ctx, isRegularSession) {
  if (!ctx.pmh) return null;
  const last = bars[bars.length - 1];
  if (last.close <= ctx.pmh) return null;
  let setup = makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Premarket High Break",
    state: SETUP_STATE.CONFIRMED,
    trigger: `Break and hold above premarket high ${ctx.pmh.toFixed(2)}`,
    confirmation: `Regular-session close above ${ctx.pmh.toFixed(2)} with volume confirmation`,
    invalidation: `Regular-session close back below ${ctx.pmh.toFixed(2)}`,
    levels: { pmh: ctx.pmh }
  });
  return clampPremarketState(setup, !isRegularSession);
}
__name(detectPremarketHighBreak, "detectPremarketHighBreak");
function detectPremarketLowBreak(ticker, bars, ctx, isRegularSession) {
  if (!ctx.pml) return null;
  const last = bars[bars.length - 1];
  if (last.close >= ctx.pml) return null;
  let setup = makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Premarket Low Break",
    state: SETUP_STATE.CONFIRMED,
    trigger: `Break and hold below premarket low ${ctx.pml.toFixed(2)}`,
    confirmation: `Regular-session close below ${ctx.pml.toFixed(2)} with volume confirmation`,
    invalidation: `Regular-session close back above ${ctx.pml.toFixed(2)}`,
    levels: { pml: ctx.pml }
  });
  return clampPremarketState(setup, !isRegularSession);
}
__name(detectPremarketLowBreak, "detectPremarketLowBreak");
function detectPrevDayHighBreak(ticker, bars, ctx) {
  if (!ctx.pdh) return null;
  const last = bars[bars.length - 1];
  const prior = bars[bars.length - 2];
  if (!(last.close > ctx.pdh && prior.close <= ctx.pdh)) return null;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Previous-Day High Break",
    state: (ctx.relVolume ?? 0) >= 1.2 ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break above PDH ${ctx.pdh.toFixed(2)}`,
    confirmation: `Close above ${ctx.pdh.toFixed(2)} with relative volume \u2265 1.2x`,
    invalidation: `Close back below ${ctx.pdh.toFixed(2)}`,
    levels: { pdh: ctx.pdh }
  });
}
__name(detectPrevDayHighBreak, "detectPrevDayHighBreak");
function detectPrevDayLowBreak(ticker, bars, ctx) {
  if (!ctx.pdl) return null;
  const last = bars[bars.length - 1];
  const prior = bars[bars.length - 2];
  if (!(last.close < ctx.pdl && prior.close >= ctx.pdl)) return null;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Previous-Day Low Break",
    state: (ctx.relVolume ?? 0) >= 1.2 ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break below PDL ${ctx.pdl.toFixed(2)}`,
    confirmation: `Close below ${ctx.pdl.toFixed(2)} with relative volume \u2265 1.2x`,
    invalidation: `Close back above ${ctx.pdl.toFixed(2)}`,
    levels: { pdl: ctx.pdl }
  });
}
__name(detectPrevDayLowBreak, "detectPrevDayLowBreak");

// src/engine/setups/doubleTopBottomFamily.js
function detectDoubleBottom(ticker, bars, ctx) {
  if (bars.length < 12) return null;
  const window = bars.slice(-12);
  const lows = window.map((b) => b.low);
  const firstLowIdx = lows.indexOf(Math.min(...lows.slice(0, 6)));
  const firstLow = lows[firstLowIdx];
  const bounceIdx = window.slice(firstLowIdx).findIndex((b, i) => i > 0 && b.close > window[firstLowIdx].close * 1.01);
  if (bounceIdx === -1) return null;
  const necklineIdx = firstLowIdx + bounceIdx;
  const neckline = Math.max(...window.slice(firstLowIdx, necklineIdx + 1).map((b) => b.high));
  const secondLegBars = window.slice(necklineIdx);
  if (secondLegBars.length < 2) return null;
  const secondLow = Math.min(...secondLegBars.map((b) => b.low));
  const secondLowHolds = Math.abs(secondLow - firstLow) / firstLow < 0.01 && secondLow >= firstLow * 0.99;
  if (!secondLowHolds) return null;
  const last = window[window.length - 1];
  const reclaimed = last.close > neckline;
  return makeSetup({
    ticker,
    bias: "bullish",
    setupType: "Double Bottom",
    state: reclaimed ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Reclaim neckline ${neckline.toFixed(2)} after second low holds ${secondLow.toFixed(2)}`,
    confirmation: `Close above neckline ${neckline.toFixed(2)}`,
    invalidation: `Close below the second low ${secondLow.toFixed(2)}`,
    levels: { firstLow, secondLow, neckline }
  });
}
__name(detectDoubleBottom, "detectDoubleBottom");
function detectDoubleTop(ticker, bars, ctx) {
  if (bars.length < 12) return null;
  const window = bars.slice(-12);
  const highs = window.map((b) => b.high);
  const firstHighIdx = highs.indexOf(Math.max(...highs.slice(0, 6)));
  const firstHigh = highs[firstHighIdx];
  const pullbackIdx = window.slice(firstHighIdx).findIndex((b, i) => i > 0 && b.close < window[firstHighIdx].close * 0.99);
  if (pullbackIdx === -1) return null;
  const necklineIdx = firstHighIdx + pullbackIdx;
  const neckline = Math.min(...window.slice(firstHighIdx, necklineIdx + 1).map((b) => b.low));
  const secondLegBars = window.slice(necklineIdx);
  if (secondLegBars.length < 2) return null;
  const secondHigh = Math.max(...secondLegBars.map((b) => b.high));
  const secondHighRejects = Math.abs(secondHigh - firstHigh) / firstHigh < 0.01 && secondHigh <= firstHigh * 1.01;
  if (!secondHighRejects) return null;
  const last = window[window.length - 1];
  const brokeDown = last.close < neckline;
  return makeSetup({
    ticker,
    bias: "bearish",
    setupType: "Double Top",
    state: brokeDown ? SETUP_STATE.CONFIRMED : SETUP_STATE.AWAITING_CONFIRMATION,
    trigger: `Break neckline ${neckline.toFixed(2)} after second high rejects ${secondHigh.toFixed(2)}`,
    confirmation: `Close below neckline ${neckline.toFixed(2)}`,
    invalidation: `Close above the second high ${secondHigh.toFixed(2)}`,
    levels: { firstHigh, secondHigh, neckline }
  });
}
__name(detectDoubleTop, "detectDoubleTop");

// src/engine/setups/index.js
var SETUP_STALE_MS = 90 * 60 * 1e3;
function detectAllSetups(ticker, { dailyBars, intradayBars }, ctx, isRegularSession) {
  const results = [];
  const push = /* @__PURE__ */ __name((setup) => {
    if (setup) results.push(setup);
  }, "push");
  push(detectBreakRetest(ticker, intradayBars, ctx));
  push(detectBreakout(ticker, intradayBars, ctx));
  push(detectBreakdown(ticker, intradayBars, ctx));
  push(detectSupportBounce(ticker, intradayBars, ctx));
  push(detectResistanceRejection(ticker, intradayBars, ctx));
  push(detectBullFlag(ticker, intradayBars, ctx));
  push(detectBearFlag(ticker, intradayBars, ctx));
  push(detectConsolidationBreakout(ticker, intradayBars, ctx));
  push(detectConsolidationBreakdown(ticker, intradayBars, ctx));
  push(detectPremarketHighBreak(ticker, intradayBars, ctx, isRegularSession));
  push(detectPremarketLowBreak(ticker, intradayBars, ctx, isRegularSession));
  push(detectPrevDayHighBreak(ticker, intradayBars, ctx));
  push(detectPrevDayLowBreak(ticker, intradayBars, ctx));
  push(detectDoubleBottom(ticker, intradayBars, ctx));
  push(detectDoubleTop(ticker, intradayBars, ctx));
  return results.map((s) => ({ ...s, ticker, detectedAt: Date.now() }));
}
__name(detectAllSetups, "detectAllSetups");

// src/engine/catalysts.js
var MAX_HEADLINE_LEN = 70;
function concise(headline) {
  if (headline.length <= MAX_HEADLINE_LEN) return headline;
  return headline.slice(0, MAX_HEADLINE_LEN - 1).trimEnd() + "\u2026";
}
__name(concise, "concise");
async function getPrimaryCatalyst(ticker, env2) {
  const r = await providers.catalysts.getCatalysts(ticker, env2);
  if (!r.ok || !r.data?.length) return null;
  const priority = { earnings: 0, fda: 1, corporate: 2, upgrade: 3, downgrade: 3, "price-target": 4, ipo: 5, economic: 6, news: 7 };
  const sorted = [...r.data].sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9) || b.timestamp - a.timestamp);
  const top = sorted[0];
  return { type: top.type, text: concise(top.headline), timestamp: top.timestamp };
}
__name(getPrimaryCatalyst, "getPrimaryCatalyst");

// src/engine/options.js
function strikeIncrement(price) {
  if (price < 25) return 0.5;
  if (price < 500) return 1;
  return 5;
}
__name(strikeIncrement, "strikeIncrement");
function roundUp(value, increment) {
  return Math.ceil(value / increment) * increment;
}
__name(roundUp, "roundUp");
function roundDown(value, increment) {
  return Math.floor(value / increment) * increment;
}
__name(roundDown, "roundDown");
function recommendStrikes(bias, underlyingPrice) {
  if (!underlyingPrice || underlyingPrice <= 0) {
    return { preferredStrike: null, secondBestStrike: null };
  }
  const increment = strikeIncrement(underlyingPrice);
  if (bias === "bullish") {
    return {
      preferredStrike: roundUp(underlyingPrice, increment),
      secondBestStrike: roundUp(
        underlyingPrice + increment,
        increment
      )
    };
  }
  return {
    preferredStrike: roundDown(underlyingPrice, increment),
    secondBestStrike: roundDown(
      underlyingPrice - increment,
      increment
    )
  };
}
__name(recommendStrikes, "recommendStrikes");
function chooseExpiration(expirations, tradeHorizon, catalystDate) {
  if (Array.isArray(expirations) && expirations.length > 0) {
    const sorted = [...expirations].sort();
    if (tradeHorizon === "earnings" && catalystDate) {
      const target = new Date(catalystDate);
      return sorted.find((d) => new Date(d) >= target) ?? sorted[sorted.length - 1];
    }
    if (tradeHorizon === "swing") {
      const target = new Date(
        Date.now() + 21 * 864e5
      );
      return sorted.reduce((best, current) => {
        const currentDiff = Math.abs(
          new Date(current) - target
        );
        const bestDiff = Math.abs(
          new Date(best) - target
        );
        return currentDiff < bestDiff ? current : best;
      });
    }
    return sorted[0];
  }
  return nextExpiration(
    tradeHorizon === "earnings" ? 14 : tradeHorizon === "swing" ? 21 : 7
  );
}
__name(chooseExpiration, "chooseExpiration");
function nextExpiration(daysOut = 7) {
  const date = /* @__PURE__ */ new Date();
  date.setDate(date.getDate() + daysOut);
  if (date.getDay() === 6) date.setDate(date.getDate() + 2);
  if (date.getDay() === 0) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
__name(nextExpiration, "nextExpiration");
function selectOptionsForSetup(setup, underlyingPrice, tradeHorizon, catalystDate, _env) {
  const strikes = recommendStrikes(
    setup.bias,
    underlyingPrice
  );
  if (!strikes.preferredStrike) return null;
  const expiration = chooseExpiration(
    [],
    tradeHorizon,
    catalystDate
  );
  return {
    expiration,
    preferredStrike: strikes.preferredStrike,
    secondBestStrike: strikes.secondBestStrike,
    contractType: setup.bias === "bullish" ? "call" : "put",
    chainFreshness: "not_used",
    contractVerificationRequired: true
  };
}
__name(selectOptionsForSetup, "selectOptionsForSetup");

// src/engine/targets.js
function uniqueAscending(levels, bias) {
  const sorted = [...new Set(levels.filter((l) => l != null))].sort((a, b) => a - b);
  return bias === "bullish" ? sorted : sorted.slice().reverse();
}
__name(uniqueAscending, "uniqueAscending");
function calculateTargets(setup, entryPrice, ctx) {
  const bias = setup.bias;
  const atr2 = ctx.atr14;
  if (!entryPrice) return null;
  const structuralCandidates = bias === "bullish" ? [ctx.pdh, ctx.pmh, ctx.weeklyHigh, ctx.ath, ...ctx.resistances || []] : [ctx.pdl, ctx.pml, ctx.weeklyLow, ctx.atl, ...ctx.supports || []];
  const inDirection = structuralCandidates.filter(
    (l) => l != null && (bias === "bullish" ? l > entryPrice : l < entryPrice)
  );
  let ordered = uniqueAscending(inDirection, bias);
  const atrMultiples = [1, 1.8, 2.6, 3.4];
  const atrTargets = atr2 ? atrMultiples.map((m) => bias === "bullish" ? entryPrice + atr2 * m : entryPrice - atr2 * m) : [];
  const merged = [];
  let si = 0, ai = 0;
  while (merged.length < 4 && (si < ordered.length || ai < atrTargets.length)) {
    if (si < ordered.length) {
      merged.push(ordered[si]);
      si++;
    }
    if (merged.length < 4 && ai < atrTargets.length) {
      const candidate = atrTargets[ai];
      const tooClose = merged.some((m) => Math.abs(m - candidate) / candidate < 3e-3);
      if (!tooClose) merged.push(candidate);
      ai++;
    }
  }
  if (merged.length < 4) return null;
  const final = uniqueAscending(merged, bias).slice(0, 4);
  return final.map((t) => Number(t.toFixed(2)));
}
__name(calculateTargets, "calculateTargets");

// src/journal/journal.js
function journalId(setup) {
  return `journal:${setup.ticker}:${setup.detectedAt}`;
}
__name(journalId, "journalId");
async function recordSetupSnapshot(kv, setup) {
  const id = journalId(setup);
  const existing = await kv.get(id, "json");
  if (existing) return existing;
  const snapshot = {
    id,
    ticker: setup.ticker,
    date: new Date(setup.detectedAt).toISOString().slice(0, 10),
    bias: setup.bias,
    setupType: setup.setupType,
    trigger: setup.trigger,
    confirmation: setup.confirmation,
    invalidation: setup.invalidation,
    levels: setup.levels,
    targets: setup.targets ?? null,
    optionSelection: setup.optionSelection ?? null,
    catalyst: setup.catalyst ?? null,
    createdAt: Date.now(),
    events: [],
    outcome: null
  };
  await kv.put(id, JSON.stringify(snapshot));
  return snapshot;
}
__name(recordSetupSnapshot, "recordSetupSnapshot");
var OUTCOMES = Object.freeze({
  PLAYED_OUT: "Setup played out",
  PARTIALLY_PLAYED_OUT: "Setup partially played out",
  TRIGGERED_THEN_INVALIDATED: "Setup triggered but later invalidated",
  NEVER_CONFIRMED: "Setup never confirmed",
  INVALIDATED_BEFORE_CONFIRMATION: "Setup invalidated before confirmation"
});
function evaluateAtClose(snapshot, sessionPriceSeries, closePrice) {
  if (!sessionPriceSeries?.length || closePrice == null) return null;
  const prices = sessionPriceSeries.map((p) => p.price);
  const bias = snapshot.bias;
  const wasConfirmed = snapshot.events.some((e) => e.type === "confirmed");
  const wasInvalidated = snapshot.events.some((e) => e.type === "invalidated");
  const triggerHit = bias === "bullish" ? prices.some((p) => p >= (snapshot.levels?.level ?? snapshot.levels?.pdh ?? snapshot.levels?.support ?? -Infinity)) : prices.some((p) => p <= (snapshot.levels?.level ?? snapshot.levels?.pdl ?? snapshot.levels?.resistance ?? Infinity));
  const tps = snapshot.targets || [];
  const tpHits = tps.map((tp) => bias === "bullish" ? prices.some((p) => p >= tp) : prices.some((p) => p <= tp));
  const tpCount = tpHits.filter(Boolean).length;
  const maxFavorable = bias === "bullish" ? Math.max(...prices) : Math.min(...prices);
  const maxAdverse = bias === "bullish" ? Math.min(...prices) : Math.max(...prices);
  let outcome;
  if (!triggerHit && !wasConfirmed) {
    outcome = wasInvalidated ? OUTCOMES.INVALIDATED_BEFORE_CONFIRMATION : OUTCOMES.NEVER_CONFIRMED;
  } else if (wasInvalidated) {
    outcome = OUTCOMES.TRIGGERED_THEN_INVALIDATED;
  } else if (tpCount === tps.length && tps.length > 0) {
    outcome = OUTCOMES.PLAYED_OUT;
  } else if (tpCount > 0) {
    outcome = OUTCOMES.PARTIALLY_PLAYED_OUT;
  } else {
    outcome = OUTCOMES.TRIGGERED_THEN_INVALIDATED;
  }
  return {
    outcome,
    tp1: tpHits[0] ?? false,
    tp2: tpHits[1] ?? false,
    tp3: tpHits[2] ?? false,
    tp4: tpHits[3] ?? false,
    maxFavorableMove: maxFavorable,
    maxAdverseMove: maxAdverse,
    closingPrice: closePrice
  };
}
__name(evaluateAtClose, "evaluateAtClose");
async function finalizeOutcome(kv, id, evaluation) {
  const snapshot = await kv.get(id, "json");
  if (!snapshot || !evaluation) return null;
  snapshot.outcome = evaluation;
  await kv.put(id, JSON.stringify(snapshot));
  return snapshot;
}
__name(finalizeOutcome, "finalizeOutcome");
async function listRecentJournal(kv, limit = 50) {
  const list = await kv.list({ prefix: "journal:" });
  const keys = list.keys.slice(-limit).reverse();
  const entries = await Promise.all(keys.map((k) => kv.get(k.name, "json")));
  return entries.filter(Boolean);
}
__name(listRecentJournal, "listRecentJournal");

// src/engine/freshness.js
var FRESHNESS_LIMITS_MS = {
  quote: 5 * 60 * 1e3,
  // 5 min — quotes driving setup/confirmation logic
  bars: 10 * 60 * 1e3,
  // 10 min — intraday bars driving technical engine
  optionChain: 20 * 60 * 1e3,
  // 20 min — informational only, never gates setup logic
  catalyst: 24 * 3600 * 1e3
  // 24 hr — catalysts are inherently slower-moving
};
function classify(kind, sourceTimestamp, now = Date.now()) {
  if (!sourceTimestamp) return "unavailable";
  const age = now - sourceTimestamp;
  const limit = FRESHNESS_LIMITS_MS[kind];
  if (limit == null) return "unavailable";
  if (age <= limit * 0.5) return "live";
  if (age <= limit) return "delayed";
  return "stale";
}
__name(classify, "classify");
function isDecisionGrade(kind, sourceTimestamp, now = Date.now()) {
  return classify(kind, sourceTimestamp, now) !== "stale" && sourceTimestamp != null;
}
__name(isDecisionGrade, "isDecisionGrade");

// src/engine/marketHours.js
var HOLIDAYS_2026 = [
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-04-03",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-11-26",
  "2026-12-25"
];
var EARLY_CLOSES_2026 = {
  // date -> close time (ET, 24h)
  "2026-07-02": "13:00",
  // day before July 4th observance nuance varies; verify each year
  "2026-11-27": "13:00",
  // day after Thanksgiving
  "2026-12-24": "13:00"
};
function etParts(date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short"
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    dateStr: `${parts.year}-${parts.month}-${parts.day}`,
    hhmm: `${parts.hour}:${parts.minute}`,
    weekday: parts.weekday
    // 'Mon'..'Sun'
  };
}
__name(etParts, "etParts");
function getMarketStatus(now = /* @__PURE__ */ new Date()) {
  const { dateStr, hhmm, weekday } = etParts(now);
  if (weekday === "Sat" || weekday === "Sun") {
    return { status: "closed", reason: "weekend", dateStr };
  }
  if (HOLIDAYS_2026.includes(dateStr)) {
    return { status: "closed", reason: "holiday", dateStr };
  }
  const closeTime = EARLY_CLOSES_2026[dateStr] || "16:00";
  if (hhmm < "04:00") return { status: "closed", reason: "overnight", dateStr };
  if (hhmm < "09:30") return { status: "premarket", dateStr };
  if (hhmm < closeTime) return { status: "regular", dateStr, earlyClose: !!EARLY_CLOSES_2026[dateStr] };
  if (hhmm < "20:00") return { status: "after-hours", dateStr };
  return { status: "closed", reason: "overnight", dateStr };
}
__name(getMarketStatus, "getMarketStatus");

// src/engine/pipeline.js
var IN_PLAY_MIN_GAP_PCT = 2;
var IN_PLAY_MIN_REL_VOLUME = 1.5;
async function runPipelineForBatch(tickers, env2) {
  const marketStatus = getMarketStatus();
  const isRegular = marketStatus.status === "regular";
  const actionableSetups = [];
  const errors = [];
  for (const ticker of tickers) {
    try {
      const quote = await getQuoteWithFallback(ticker, env2);
      if (!quote.ok || !isDecisionGrade("quote", quote.sourceTimestamp)) continue;
      const dailyBarsRes = await providers.quotesPrimary.getBars(ticker, "daily", 40 * 864e5, env2);
      if (!dailyBarsRes.ok || dailyBarsRes.data.length < 15) continue;
      const gapPct = quote.data.open && dailyBarsRes.data.at(-2)?.close ? (quote.data.open - dailyBarsRes.data.at(-2).close) / dailyBarsRes.data.at(-2).close * 100 : 0;
      const relVolProxy = quote.data.volume && dailyBarsRes.data.at(-2)?.volume ? quote.data.volume / dailyBarsRes.data.at(-2).volume : 0;
      if (Math.abs(gapPct) < IN_PLAY_MIN_GAP_PCT && relVolProxy < IN_PLAY_MIN_REL_VOLUME) continue;
      const intradayRes = await providers.quotesPrimary.getBars(ticker, "5min", 8 * 3600 * 1e3, env2);
      if (!intradayRes.ok || intradayRes.data.length < 12) continue;
      const ctx = buildTechnicalContext({
        dailyBars: dailyBarsRes.data,
        intradayBars: intradayRes.data,
        sessionBars: intradayRes.data,
        premarketBars: marketStatus.status === "premarket" ? intradayRes.data : []
      });
      const setups = detectAllSetups(ticker, { dailyBars: dailyBarsRes.data, intradayBars: intradayRes.data }, ctx, isRegular);
      const actionable = setups.filter((s) => s.state === SETUP_STATE.CONFIRMED || s.state === SETUP_STATE.AWAITING_CONFIRMATION);
      if (actionable.length === 0) continue;
      for (const setup of actionable) {
        const catalyst = await getPrimaryCatalyst(ticker, env2);
        const entryPrice = quote.data.price;
        const targets = calculateTargets(setup, entryPrice, ctx);
        if (!targets || targets.length !== 4) continue;
        const tradeHorizon = catalyst?.type === "earnings" ? "earnings" : "day";
        const optionSelection = selectOptionsForSetup(
          setup,
          entryPrice,
          tradeHorizon,
          catalyst?.timestamp,
          env2
        );
        if (!optionSelection) continue;
        const fullSetup = { ...setup, targets, optionSelection, catalyst, entryPrice };
        if (env2.JOURNAL_KV) await recordSetupSnapshot(env2.JOURNAL_KV, fullSetup);
        actionableSetups.push(fullSetup);
      }
    } catch (err) {
      errors.push({ ticker, error: err.message });
    }
  }
  return { setups: actionableSetups, errors, marketStatus };
}
__name(runPipelineForBatch, "runPipelineForBatch");

// src/config/theme.js
var DEFAULT_THEME = {
  colors: {
    pageBg: "#0a0e14",
    secondaryBg: "#0f1420",
    cardBg: "#141a26",
    cardHoverBg: "#1a2130",
    panelBg: "#10151f",
    textPrimary: "#e8ecf4",
    textSecondary: "#9aa5b8",
    textMuted: "#5c6478",
    border: "#232b3d",
    divider: "#1c2333",
    bullish: "#2ecc71",
    bearish: "#e74c3c",
    neutral: "#8a93a6",
    warning: "#f5a623",
    success: "#2ecc71",
    error: "#e74c3c",
    buttonBg: "#3b7cff",
    buttonText: "#ffffff",
    buttonHoverBg: "#5a90ff",
    inputBg: "#0f1420",
    inputBorder: "#2a3448",
    accent: "#3b7cff",
    accentSecondary: "#9b6bff",
    chartUp: "#2ecc71",
    chartDown: "#e74c3c",
    chartGrid: "#1c2333",
    badgeBg: "#1c2333",
    badgeText: "#c3cadb",
    levelColor: "#f5a623",
    targetColor: "#3b7cff",
    invalidationColor: "#e74c3c"
  },
  typography: {
    fontPrimary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSecondary: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
    fontSizeBase: "14px",
    fontSizeSm: "12px",
    fontSizeLg: "16px",
    headingSize: "20px",
    tickerSize: "22px",
    cardTitleSize: "16px",
    labelSize: "11px",
    buttonSize: "14px",
    lineHeight: "1.45",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "700",
    letterSpacing: "0.01em"
  },
  layout: {
    pageMaxWidth: "1400px",
    pagePadding: "20px",
    cardMinWidth: "320px",
    cardGap: "16px",
    borderRadius: "10px",
    cardPadding: "16px",
    headerHeight: "64px",
    gridColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    mobileBreakpoint: "640px",
    desktopBreakpoint: "1024px",
    spacingScale: [4, 8, 12, 16, 24, 32, 48]
  },
  components: {
    cardBorder: "1px solid var(--border)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.4)",
    cardRadius: "10px",
    buttonRadius: "8px",
    badgeRadius: "999px",
    inputRadius: "8px",
    hoverTransition: "all 0.15s ease",
    transitionSpeed: "0.15s",
    animationEnabled: true,
    cardOpacity: 1,
    borderWidth: "1px"
  },
  background: {
    mode: "solid",
    // 'solid' | 'gradient' | 'image'
    solid: "#0a0e14",
    gradient: "linear-gradient(180deg, #0a0e14 0%, #0d1220 100%)",
    image: "",
    imageOpacity: 0.15,
    imagePosition: "center",
    imageSize: "cover",
    overlay: "rgba(10,14,20,0.6)",
    panelTransparency: 1
  },
  branding: {
    siteName: "Trade Command Center",
    subtitle: "Live setup scanner",
    logo: "",
    favicon: "",
    browserTitle: "Trade Command Center",
    headerText: "Trade Command Center",
    footerText: ""
  }
};
var DEFAULT_TEXT = {
  appTitle: "Trade Command Center",
  scanButton: "Scan",
  refreshButton: "Refresh",
  noSetups: "No actionable setups right now.",
  marketOpen: "Market Open",
  marketClosed: "Market Closed",
  marketPremarket: "Premarket",
  marketAfterHours: "After Hours",
  lastUpdated: "Last Updated",
  catalystLabel: "Catalyst",
  setupLabel: "Setup",
  entryLabel: "Entry",
  watchLabel: "Watch",
  expirationLabel: "Expiration",
  callsLabel: "Calls",
  putsLabel: "Puts",
  tpsLabel: "TPs",
  invalidationLabel: "Invalidation",
  confirmationLabel: "Confirmation",
  loading: "Loading\u2026",
  dataUnavailable: "Data unavailable",
  errorGeneric: "Something went wrong. Try refreshing.",
  errorScan: "Scan failed \u2014 see status panel for details.",
  emptyStateSub: "The scanner is running but nothing has met the actionable bar yet.",
  connectionOk: "Connected",
  connectionDown: "Disconnected",
  journalTitle: "Journal",
  freshnessLive: "Live",
  freshnessDelayed: "Delayed",
  freshnessStale: "Stale"
};
var THEME_PRESETS = {
  "dark-purple": {
    colors: {
      pageBg: "#0d0a14",
      secondaryBg: "#120f1c",
      cardBg: "#181228",
      cardHoverBg: "#201a33",
      panelBg: "#140f20",
      border: "#2a2140",
      divider: "#221a36",
      accent: "#a855f7",
      accentSecondary: "#6366f1",
      buttonBg: "#a855f7",
      buttonHoverBg: "#c084fc",
      textPrimary: "#ede9f7",
      textSecondary: "#a79dc4",
      textMuted: "#6b6188"
    },
    background: { mode: "gradient", gradient: "linear-gradient(180deg,#0d0a14 0%,#150f24 100%)" }
  },
  "dark-blue": {
    colors: {
      pageBg: "#060b16",
      secondaryBg: "#0a1120",
      cardBg: "#0f1930",
      cardHoverBg: "#142240",
      accent: "#3b82f6",
      buttonBg: "#3b82f6",
      buttonHoverBg: "#60a5fa"
    }
  },
  "black-white": {
    colors: {
      pageBg: "#000000",
      secondaryBg: "#0a0a0a",
      cardBg: "#111111",
      cardHoverBg: "#1a1a1a",
      panelBg: "#0a0a0a",
      border: "#2a2a2a",
      divider: "#1a1a1a",
      textPrimary: "#ffffff",
      textSecondary: "#b3b3b3",
      textMuted: "#6b6b6b",
      accent: "#ffffff",
      buttonBg: "#ffffff",
      buttonText: "#000000",
      buttonHoverBg: "#d9d9d9",
      bullish: "#ffffff",
      bearish: "#808080"
    }
  },
  emerald: {
    colors: {
      pageBg: "#06120d",
      secondaryBg: "#081a12",
      cardBg: "#0d2318",
      cardHoverBg: "#123020",
      accent: "#10b981",
      buttonBg: "#10b981",
      buttonHoverBg: "#34d399"
    }
  },
  minimal: {
    colors: {
      pageBg: "#fafafa",
      secondaryBg: "#f2f2f2",
      cardBg: "#ffffff",
      cardHoverBg: "#f5f5f5",
      panelBg: "#ffffff",
      border: "#e5e5e5",
      divider: "#eeeeee",
      textPrimary: "#111111",
      textSecondary: "#555555",
      textMuted: "#999999",
      accent: "#111111",
      buttonBg: "#111111",
      buttonText: "#ffffff",
      buttonHoverBg: "#333333",
      inputBg: "#ffffff",
      inputBorder: "#dddddd"
    },
    components: { cardShadow: "0 1px 2px rgba(0,0,0,0.06)" },
    background: { mode: "solid", solid: "#fafafa" }
  },
  "high-contrast": {
    colors: {
      pageBg: "#000000",
      cardBg: "#000000",
      border: "#ffffff",
      divider: "#ffffff",
      textPrimary: "#ffffff",
      textSecondary: "#ffffff",
      textMuted: "#cccccc",
      bullish: "#00ff66",
      bearish: "#ff3333",
      warning: "#ffcc00",
      accent: "#ffff00",
      buttonBg: "#ffff00",
      buttonText: "#000000"
    },
    components: { borderWidth: "2px" }
  }
};
function deepMerge(base, override) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override || {})) {
    const bv = base ? base[key] : void 0;
    const ov = override[key];
    if (ov && typeof ov === "object" && !Array.isArray(ov) && bv && typeof bv === "object") {
      out[key] = deepMerge(bv, ov);
    } else {
      out[key] = ov;
    }
  }
  return out;
}
__name(deepMerge, "deepMerge");
function resolveTheme(presetName) {
  if (!presetName || !THEME_PRESETS[presetName]) return DEFAULT_THEME;
  return deepMerge(DEFAULT_THEME, THEME_PRESETS[presetName]);
}
__name(resolveTheme, "resolveTheme");

// src/api/routes.js
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
}
__name(json, "json");
async function handleStatus(env2) {
  const q = env2.QUEUE_KV ? await queueStatus(env2.QUEUE_KV) : { depth: 0, oldestAgeMs: 0, itemsNearRetryLimit: 0 };
  return json({
    marketStatus: getMarketStatus(),
    queue: q,
    providers: {
      quotes: env2.ALPACA_API_KEY && env2.ALPACA_API_SECRET ? "configured" : "missing ALPACA credentials",
      catalysts: env2.FINNHUB_API_KEY ? "configured" : "missing FINNHUB_API_KEY"
    },
    now: Date.now()
  });
}
__name(handleStatus, "handleStatus");
async function handleSetups(env2, url) {
  if (!env2.QUEUE_KV) return json({ error: "QUEUE_KV not bound", setups: [] }, 500);
  const requestedTicker = url.searchParams.get("ticker")?.trim().toUpperCase();
  if (requestedTicker) {
    const { setups: setups2, errors: errors2, marketStatus: marketStatus2 } = await runPipelineForBatch(
      [requestedTicker],
      env2
    );
    return json({
      setups: setups2,
      marketStatus: marketStatus2,
      scannedCount: 1,
      errorCount: errors2.length,
      ticker: requestedTicker
    });
  }
  let status = await queueStatus(env2.QUEUE_KV);
  if (status.depth === 0) {
    const universeRes = await providers.universe.getUniverse(env2);
    if (!universeRes.ok) {
      return json(
        {
          error: `Universe unavailable: ${universeRes.reason}`,
          setups: []
        },
        502
      );
    }
    const universe = universeRes.data;
    const cursorKey = "universe:cursor";
    const cursor = Number(
      await env2.CACHE_KV.get(cursorKey) || "0"
    );
    const seedSize = 100;
    const seedBatch = universe.slice(
      cursor,
      cursor + seedSize
    );
    if (seedBatch.length > 0) {
      await enqueueBatch(env2.QUEUE_KV, seedBatch);
      const nextCursor = cursor + seedBatch.length >= universe.length ? 0 : cursor + seedBatch.length;
      await env2.CACHE_KV.put(
        cursorKey,
        String(nextCursor)
      );
    }
  }
  const batch = await dequeueBatch(env2.QUEUE_KV, 25);
  if (batch.length === 0) {
    return json({ setups: [], marketStatus: getMarketStatus(), note: "Queue empty and universe fetch returned nothing yet." });
  }
  const { setups, errors, marketStatus } = await runPipelineForBatch(batch.map((b) => b.ticker), env2);
  for (const b of batch) await markProcessed(env2.QUEUE_KV, b.ticker, true);
  return json({ setups, marketStatus, scannedCount: batch.length, errorCount: errors.length });
}
__name(handleSetups, "handleSetups");
async function handleJournal(env2) {
  if (!env2.JOURNAL_KV) return json({ error: "JOURNAL_KV not bound", entries: [] }, 500);
  const entries = await listRecentJournal(env2.JOURNAL_KV, 50);
  return json({ entries });
}
__name(handleJournal, "handleJournal");
async function handleConfig(url) {
  const presetName = url.searchParams.get("theme");
  const theme = resolveTheme(presetName);
  return json({ theme, text: DEFAULT_TEXT });
}
__name(handleConfig, "handleConfig");

// src/index.js
var src_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
      return new Response(indexHtml, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/api/status") return handleStatus(env2);
    if (url.pathname === "/api/setups") return handleSetups(env2, url);
    if (url.pathname === "/api/journal") return handleJournal(env2);
    if (url.pathname === "/api/config") return handleConfig(url);
    return new Response("Not found", { status: 404 });
  },
  /**
   * Scheduled handler. Cron firing alone never implies the market is open —
   * every branch checks getMarketStatus() before doing real work.
   * The three configured cron times (see wrangler.toml) map to:
   *   - premarket universe refresh + queue seed
   *   - mid-session scan pass
   *   - end-of-session journal evaluation
   */
  async scheduled(event, env2, ctx) {
    const status = getMarketStatus();
    if (status.status === "premarket") {
      const universeRes = await providers.universe.getUniverse(env2);
      if (universeRes.ok && env2.QUEUE_KV) {
        const optionable = universeRes.data;
        for (const ticker of optionable) await enqueue(env2.QUEUE_KV, ticker);
      }
      return;
    }
    if (status.status === "regular" && env2.QUEUE_KV) {
      const batch = await dequeueBatch(env2.QUEUE_KV, 25);
      if (batch.length > 0) {
        await runPipelineForBatch(batch.map((b) => b.ticker), env2);
        for (const b of batch) await markProcessed(env2.QUEUE_KV, b.ticker, true);
      }
      return;
    }
    if ((status.status === "after-hours" || status.status === "closed") && env2.JOURNAL_KV) {
      const entries = await listRecentJournal(env2.JOURNAL_KV, 200);
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      for (const snapshot of entries) {
        if (snapshot.date !== today || snapshot.outcome) continue;
        const quote = await getQuoteWithFallback(snapshot.ticker, env2);
        if (!quote.ok) continue;
        const bars = await providers.quotesPrimary.getBars(snapshot.ticker, "5min", 8 * 3600 * 1e3, env2);
        if (!bars.ok) continue;
        const series = bars.data.map((b) => ({ time: b.time, price: b.close }));
        const evaluation = evaluateAtClose(snapshot, series, quote.data.price);
        if (evaluation) await finalizeOutcome(env2.JOURNAL_KV, snapshot.id, evaluation);
      }
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// .wrangler/tmp/bundle-6J0wPg/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-6J0wPg/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
