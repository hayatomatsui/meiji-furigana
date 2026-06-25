const AUDIO_SRC = "assets/questions.mp3";
const STORAGE_KEY = "eiken-listening-trainer:v5";
const FIXED_AUDIO_DURATION = 204.6955;
const FIXED_SEGMENT_STARTS = [
  0, 4.68, 12.02, 17.38, 21.86, 34.54, 42.64, 50.73, 60.54, 73.3,
  88.22, 98.7, 111.87, 125.97, 139.21, 152.34, 163.47, 177.15, 190.99,
];
const END_GUARD_SECONDS = 0.22;

const QUESTIONS = [
  {
    topic: "Journalism",
    text: "Why do you think some governments try to restrict investigative journalism?",
  },
  {
    topic: "Journalism",
    text: "When general news reporting breaks a major story first, what advantage does investigative journalism still offer?",
  },
  {
    topic: "Journalism",
    text: "What specific example of investigative journalism exposing wrongdoing can you describe?",
  },
  {
    topic: "Rights",
    text: "Do people living in domestic societies take their rights for granted?",
  },
  {
    topic: "Printed books",
    text: "Thank you. Now I would like to ask you some questions related to your speech. Do you think there are specific groups of people, such as the elderly or young children, who will always prefer printed books over digital ones?",
  },
  {
    topic: "Printed books",
    text: "Can digital books ever replicate the experience of browsing a physical bookstore, and does losing that experience matter to society?",
  },
  {
    topic: "Libraries",
    text: "If governments cut funding for public libraries, would that accelerate the decline of printed books, or would it not matter much?",
  },
  {
    topic: "Employment",
    text: "If lifetime employment is completely abolished, how can companies maintain employee loyalty and prevent the leakage of essential corporate knowledge to competitors?",
  },
  {
    topic: "Employment",
    text: "Some argue that ending lifetime employment will disproportionately harm older workers, who may struggle to adapt to new technologies or find new jobs. How would you address this social concern?",
  },
  {
    topic: "AI and work",
    text: "While AI certainly brings business efficiency, it also raises serious concerns about job displacement. Do you believe governments should step in, perhaps by providing a universal basic income, to support those who lose their jobs to AI?",
  },
  {
    topic: "AI ethics",
    text: "What are your thoughts on the ethical risks of artificial intelligence, particularly regarding algorithmic bias and the potential for deepfakes to manipulate public opinion?",
  },
  {
    topic: "Politics",
    text: "If traditional political parties are failing to represent the average person, do you think decentralized social movements, perhaps driven by social media, can take their place effectively and govern a nation?",
  },
  {
    topic: "Politics",
    text: "Critics argue that decentralized systems or direct democracy can often lead to emotional and short-sighted decisions by the public. How can we ensure rational decision-making in a political system that lacks strong party leadership?",
  },
  {
    topic: "Education",
    text: "You mentioned the need for fundamental reform. Specifically, how should schools balance the teaching of foundational academic knowledge with the development of creative, entrepreneurial skills required in today's economy?",
  },
  {
    topic: "Education",
    text: "In our rapidly changing knowledge society, some suggest that continuous, lifelong learning is becoming much more important than traditional schooling. Do you agree that the traditional role of formal education is diminishing?",
  },
  {
    topic: "Philosophy",
    text: "In today's highly practical and technology-driven world, how exactly can studying philosophy directly contribute to solving modern social, economic, or environmental problems?",
  },
  {
    topic: "Philosophy",
    text: "Some people argue that philosophical concepts are simply too abstract and theoretical for the general public to apply. How can we make the study of philosophy more accessible and practically relevant to everyday life?",
  },
  {
    topic: "Japan model",
    text: "Japan is currently facing a severe demographic crisis with its aging population and declining birthrate. Given these domestic struggles, why should developing nations still look to Japan as a sustainable economic model?",
  },
  {
    topic: "Japan model",
    text: "Many developing countries are currently experiencing rapid population growth, which is the exact opposite of Japan's situation. Do you think Japan's historical economic strategies can genuinely be applied to these nations today?",
  },
];

const dom = {
  audio: document.querySelector("#questionAudio"),
  questionList: document.querySelector("#questionList"),
  questionNumber: document.querySelector("#questionNumber"),
  questionTopic: document.querySelector("#questionTopic"),
  segmentStatus: document.querySelector("#segmentStatus"),
  scriptCard: document.querySelector("#scriptCard"),
  scriptText: document.querySelector("#scriptText"),
  maskedNumber: document.querySelector("#maskedNumber"),
  prevBtn: document.querySelector("#prevBtn"),
  playBtn: document.querySelector("#playBtn"),
  restartBtn: document.querySelector("#restartBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  timeline: document.querySelector("#timeline"),
  currentTime: document.querySelector("#currentTime"),
  endTime: document.querySelector("#endTime"),
  scriptToggle: document.querySelector("#scriptToggle"),
  repeatToggle: document.querySelector("#repeatToggle"),
  autoNextToggle: document.querySelector("#autoNextToggle"),
  rateSelect: document.querySelector("#rateSelect"),
  shuffleBtn: document.querySelector("#shuffleBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  doneBtn: document.querySelector("#doneBtn"),
  hardBtn: document.querySelector("#hardBtn"),
  doneCount: document.querySelector("#doneCount"),
  hardCount: document.querySelector("#hardCount"),
  startBackBtn: document.querySelector("#startBackBtn"),
  startForwardBtn: document.querySelector("#startForwardBtn"),
  endBackBtn: document.querySelector("#endBackBtn"),
  endForwardBtn: document.querySelector("#endForwardBtn"),
  rangeResetBtn: document.querySelector("#rangeResetBtn"),
  rangeReadout: document.querySelector("#rangeReadout"),
};

const state = {
  index: 0,
  showScript: true,
  isPlaying: false,
  repeat: false,
  autoNext: false,
  shuffle: false,
  rate: 1,
  duration: FIXED_AUDIO_DURATION,
  segments: buildFixedSegments(FIXED_AUDIO_DURATION),
  segmentMode: "fixed",
  heard: new Set(),
  hard: new Set(),
  offsets: {},
  lastPlayError: "",
  segmentTimer: 0,
};

window.eikenTrainer = {
  getState: () => ({
    index: state.index,
    segmentMode: state.segmentMode,
    duration: state.duration,
    isPlaying: state.isPlaying,
    lastPlayError: state.lastPlayError,
    currentRange: getRange(state.index),
    segments: state.segments,
  }),
};

init();

function init() {
  restoreState();
  buildQuestionList();
  bindEvents();
  render();
  analyzeAudio();
}

function bindEvents() {
  dom.playBtn.addEventListener("click", togglePlay);
  dom.restartBtn.addEventListener("click", () => playCurrent(true));
  dom.prevBtn.addEventListener("click", () => selectQuestion(getPreviousIndex()));
  dom.nextBtn.addEventListener("click", () => selectQuestion(getNextIndex()));
  dom.scriptCard.addEventListener("click", () => setScriptVisibility(!state.showScript));
  dom.scriptToggle.addEventListener("change", () => setScriptVisibility(dom.scriptToggle.checked));
  dom.repeatToggle.addEventListener("change", () => {
    state.repeat = dom.repeatToggle.checked;
    saveState();
  });
  dom.autoNextToggle.addEventListener("change", () => {
    state.autoNext = dom.autoNextToggle.checked;
    saveState();
  });
  dom.rateSelect.addEventListener("change", () => {
    state.rate = Number(dom.rateSelect.value);
    dom.audio.playbackRate = state.rate;
    saveState();
  });
  dom.shuffleBtn.addEventListener("click", () => {
    state.shuffle = !state.shuffle;
    saveState();
    render();
  });
  dom.resetBtn.addEventListener("click", resetProgress);
  dom.doneBtn.addEventListener("click", () => {
    toggleSet(state.heard, state.index);
    saveState();
    render();
  });
  dom.hardBtn.addEventListener("click", () => {
    toggleSet(state.hard, state.index);
    saveState();
    render();
  });
  dom.timeline.addEventListener("input", onTimelineInput);
  dom.audio.addEventListener("loadedmetadata", () => {
    state.duration = dom.audio.duration || state.duration;
    if (!state.segments.length && state.duration) {
      state.segments = buildFixedSegments(state.duration);
      state.segmentMode = "fixed";
      render();
    }
  });
  dom.audio.addEventListener("timeupdate", updatePlaybackProgress);
  dom.audio.addEventListener("play", () => {
    state.isPlaying = true;
    scheduleSegmentStop();
    renderTransport();
  });
  dom.audio.addEventListener("pause", () => {
    state.isPlaying = false;
    clearSegmentTimer();
    renderTransport();
  });
  dom.audio.addEventListener("ended", finishSegment);
  dom.startBackBtn.addEventListener("click", () => nudgeRange("start", -0.3));
  dom.startForwardBtn.addEventListener("click", () => nudgeRange("start", 0.3));
  dom.endBackBtn.addEventListener("click", () => nudgeRange("end", -0.3));
  dom.endForwardBtn.addEventListener("click", () => nudgeRange("end", 0.3));
  dom.rangeResetBtn.addEventListener("click", resetRange);
  document.addEventListener("keydown", onKeydown);
}

async function analyzeAudio() {
  try {
    const response = await fetch(AUDIO_SRC);
    const arrayBuffer = await response.arrayBuffer();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    state.duration = audioBuffer.duration;
    if (audioContext.state !== "closed") {
      await audioContext.close();
    }
  } catch (error) {
    if (dom.audio.duration) {
      state.duration = dom.audio.duration;
    }
  }
  state.segments = buildFixedSegments(state.duration || FIXED_AUDIO_DURATION);
  state.segmentMode = "fixed";
  render();
}

function detectQuestionSegments(audioBuffer, targetCount) {
  const channel = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const frameSeconds = 0.05;
  const frameSize = Math.max(1, Math.floor(sampleRate * frameSeconds));
  const frameCount = Math.floor(channel.length / frameSize);
  const rms = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const offset = frame * frameSize;
    let total = 0;
    for (let i = 0; i < frameSize; i += 1) {
      const sample = channel[offset + i] || 0;
      total += sample * sample;
    }
    rms.push(Math.sqrt(total / frameSize));
  }

  const sorted = [...rms].sort((a, b) => a - b);
  const p20 = percentile(sorted, 0.2);
  const p90 = percentile(sorted, 0.9);
  const threshold = Math.max(p20 * 2.8, p90 * 0.055, 0.0025);
  const voiced = rms.map((value) => value > threshold);

  for (let i = 1; i < voiced.length - 1; i += 1) {
    if (!voiced[i] && voiced[i - 1] && voiced[i + 1]) {
      voiced[i] = true;
    }
  }
  for (let i = 1; i < voiced.length - 1; i += 1) {
    if (voiced[i] && !voiced[i - 1] && !voiced[i + 1]) {
      voiced[i] = false;
    }
  }

  const gaps = collectQuietGaps(voiced, frameSeconds)
    .filter((gap) => gap.duration >= 0.28)
    .map((gap) => ({ ...gap, midpoint: (gap.start + gap.end) / 2 }));

  if (gaps.length < targetCount - 1) {
    return [];
  }

  const expected = expectedBoundaries(audioBuffer.duration, targetCount);
  const selected = selectBoundaryGaps(gaps, expected, targetCount - 1);

  if (selected.length !== targetCount - 1) {
    return [];
  }

  const boundaries = [0, ...selected.map((gap) => gap.midpoint), audioBuffer.duration];
  const segments = [];

  for (let i = 0; i < targetCount; i += 1) {
    const boundaryStart = boundaries[i];
    const boundaryEnd = boundaries[i + 1];
    const speechStart = findVoicedTime(voiced, frameSeconds, boundaryStart, boundaryEnd, "first");
    const speechEnd = findVoicedTime(voiced, frameSeconds, boundaryStart, boundaryEnd, "last");
    const start = Math.max(boundaryStart, (speechStart ?? boundaryStart) - 0.18);
    const end = Math.min(boundaryEnd, (speechEnd ?? boundaryEnd) + 0.35);
    segments.push({ start, end: Math.max(end, start + 1.2) });
  }

  return segments;
}

function collectQuietGaps(voiced, frameSeconds) {
  const gaps = [];
  let firstVoice = voiced.findIndex(Boolean);
  let lastVoice = voiced.length - 1;
  while (lastVoice >= 0 && !voiced[lastVoice]) {
    lastVoice -= 1;
  }
  if (firstVoice < 0 || lastVoice <= firstVoice) {
    return gaps;
  }

  let gapStart = null;
  for (let i = firstVoice; i <= lastVoice; i += 1) {
    if (!voiced[i] && gapStart === null) {
      gapStart = i;
    }
    if ((voiced[i] || i === lastVoice) && gapStart !== null) {
      const gapEnd = voiced[i] ? i : i + 1;
      gaps.push({
        start: gapStart * frameSeconds,
        end: gapEnd * frameSeconds,
        duration: (gapEnd - gapStart) * frameSeconds,
      });
      gapStart = null;
    }
  }
  return gaps;
}

function selectBoundaryGaps(gaps, expected, needed) {
  const selected = [];
  const sortedGaps = [...gaps].sort((a, b) => a.midpoint - b.midpoint);

  for (let i = 0; i < needed; i += 1) {
    const target = expected[i];
    const previous = selected.length ? selected[selected.length - 1].midpoint : 0;
    const remaining = needed - i - 1;
    const viable = sortedGaps.filter((gap) => {
      const afterPrevious = gap.midpoint > previous + 1.6;
      const enoughRemaining = sortedGaps.filter((later) => later.midpoint > gap.midpoint + 1.6).length >= remaining;
      const unused = !selected.includes(gap);
      return afterPrevious && enoughRemaining && unused;
    });

    if (!viable.length) {
      break;
    }

    viable.sort((a, b) => scoreGap(a, target) - scoreGap(b, target));
    selected.push(viable[0]);
  }

  return selected.sort((a, b) => a.midpoint - b.midpoint);
}

function scoreGap(gap, target) {
  const distance = Math.abs(gap.midpoint - target);
  const lengthBonus = Math.min(gap.duration, 2) * 1.25;
  return distance - lengthBonus;
}

function expectedBoundaries(duration, targetCount) {
  const weights = QUESTIONS.map((question) => {
    const wordCount = question.text.split(/\s+/).length;
    return Math.max(8, wordCount * 0.62 + 2.2);
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let elapsed = 0;
  return weights.slice(0, targetCount - 1).map((weight) => {
    elapsed += weight;
    return (elapsed / total) * duration;
  });
}

function buildWeightedSegments(duration) {
  if (!duration) {
    return QUESTIONS.map((_, index) => ({ start: index * 8, end: index * 8 + 7 }));
  }
  const boundaries = [0, ...expectedBoundaries(duration, QUESTIONS.length), duration];
  return QUESTIONS.map((_, index) => ({
    start: Math.max(0, boundaries[index] + (index === 0 ? 0 : 0.15)),
    end: Math.min(duration, boundaries[index + 1] - (index === QUESTIONS.length - 1 ? 0 : 0.15)),
  }));
}

function buildFixedSegments(duration = FIXED_AUDIO_DURATION) {
  const safeDuration = duration || FIXED_AUDIO_DURATION;
  return FIXED_SEGMENT_STARTS.map((start, index) => {
    const nextStart = FIXED_SEGMENT_STARTS[index + 1];
    const end = nextStart === undefined ? safeDuration : Math.max(start + 0.8, nextStart - END_GUARD_SECONDS);
    return {
      start,
      end: Math.min(safeDuration, end),
    };
  });
}

function findVoicedTime(voiced, frameSeconds, from, to, direction) {
  const startFrame = Math.max(0, Math.floor(from / frameSeconds));
  const endFrame = Math.min(voiced.length - 1, Math.ceil(to / frameSeconds));
  if (direction === "first") {
    for (let i = startFrame; i <= endFrame; i += 1) {
      if (voiced[i]) return i * frameSeconds;
    }
    return null;
  }
  for (let i = endFrame; i >= startFrame; i -= 1) {
    if (voiced[i]) return (i + 1) * frameSeconds;
  }
  return null;
}

function percentile(sortedValues, ratio) {
  if (!sortedValues.length) return 0;
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.floor(sortedValues.length * ratio)));
  return sortedValues[index];
}

function buildQuestionList() {
  dom.questionList.innerHTML = "";
  QUESTIONS.forEach((question, index) => {
    const button = document.createElement("button");
    button.className = "question-item";
    button.type = "button";
    button.dataset.index = String(index);
    button.innerHTML = `
      <span class="item-number">${pad(index + 1)}</span>
      <span>
        <span class="item-topic">${question.topic}</span>
        <span class="item-preview">${escapeHtml(question.text)}</span>
      </span>
    `;
    button.addEventListener("click", () => selectQuestion(index));
    dom.questionList.append(button);
  });
}

function render() {
  const question = QUESTIONS[state.index];
  const number = pad(state.index + 1);
  const range = getRange(state.index);

  dom.questionNumber.textContent = `${number} / ${QUESTIONS.length}`;
  dom.questionTopic.textContent = question.topic;
  dom.scriptText.textContent = question.text;
  dom.maskedNumber.textContent = `Question ${number}`;
  dom.scriptCard.classList.toggle("is-hidden", !state.showScript);
  dom.scriptCard.setAttribute("aria-pressed", String(!state.showScript));
  dom.scriptToggle.checked = state.showScript;
  dom.repeatToggle.checked = state.repeat;
  dom.autoNextToggle.checked = state.autoNext;
  dom.rateSelect.value = String(state.rate);
  dom.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
  dom.shuffleBtn.classList.toggle("active", state.shuffle);
  dom.doneBtn.setAttribute("aria-pressed", String(state.heard.has(state.index)));
  dom.hardBtn.setAttribute("aria-pressed", String(state.hard.has(state.index)));
  dom.doneCount.textContent = String(state.heard.size);
  dom.hardCount.textContent = String(state.hard.size);
  dom.segmentStatus.textContent = segmentStatusLabel();
  dom.endTime.textContent = formatTime(range.end - range.start);
  dom.rangeReadout.textContent = `${formatTime(range.start)} - ${formatTime(range.end)}`;

  document.querySelectorAll(".question-item").forEach((item) => {
    const itemIndex = Number(item.dataset.index);
    item.classList.toggle("active", itemIndex === state.index);
    item.classList.toggle("done", state.heard.has(itemIndex));
    item.classList.toggle("hard", state.hard.has(itemIndex));
  });

  updatePlaybackProgress();
  renderTransport();
}

function renderTransport() {
  dom.playBtn.textContent = state.isPlaying ? "一時停止" : "再生";
}

function segmentStatusLabel() {
  if (state.lastPlayError) {
    return state.lastPlayError;
  }
  if (state.segmentMode === "auto") {
    return `${QUESTIONS.length} sections`;
  }
  if (state.segmentMode === "fixed") {
    return `${QUESTIONS.length} sections`;
  }
  return "audio loading";
}

function togglePlay() {
  if (state.isPlaying) {
    dom.audio.pause();
    return;
  }
  playCurrent(false);
}

function playCurrent(forceRestart) {
  const range = getRange(state.index);
  const outsideRange = dom.audio.currentTime < range.start || dom.audio.currentTime >= range.end;
  if (forceRestart || outsideRange) {
    dom.audio.currentTime = range.start;
  }
  dom.audio.playbackRate = state.rate;
  state.lastPlayError = "";
  dom.audio.play().catch(() => {
    state.lastPlayError = "playback blocked";
    state.isPlaying = false;
    render();
    renderTransport();
  });
}

function updatePlaybackProgress() {
  const range = getRange(state.index);
  const relative = Math.max(0, Math.min(range.end - range.start, dom.audio.currentTime - range.start));
  const span = Math.max(0.01, range.end - range.start);
  dom.timeline.value = String(Math.round((relative / span) * 1000));
  dom.currentTime.textContent = formatTime(relative);

  if (state.isPlaying && dom.audio.currentTime >= range.end - 0.03) {
    finishSegment();
  } else if (state.isPlaying) {
    scheduleSegmentStop();
  }
}

function scheduleSegmentStop() {
  clearSegmentTimer();
  const range = getRange(state.index);
  const secondsLeft = range.end - dom.audio.currentTime;
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    finishSegment();
    return;
  }
  const rate = Number(dom.audio.playbackRate) || state.rate || 1;
  state.segmentTimer = window.setTimeout(() => {
    if (!state.isPlaying) return;
    if (dom.audio.currentTime >= getRange(state.index).end - 0.08) {
      finishSegment();
    } else {
      scheduleSegmentStop();
    }
  }, Math.max(20, (secondsLeft / rate) * 1000));
}

function clearSegmentTimer() {
  if (state.segmentTimer) {
    window.clearTimeout(state.segmentTimer);
    state.segmentTimer = 0;
  }
}

function finishSegment() {
  clearSegmentTimer();
  dom.audio.pause();
  state.heard.add(state.index);
  saveState();

  if (state.repeat) {
    dom.audio.currentTime = getRange(state.index).start;
    playCurrent(true);
    render();
    return;
  }

  if (state.autoNext) {
    selectQuestion(getNextIndex());
    playCurrent(true);
    return;
  }

  render();
}

function onTimelineInput() {
  const range = getRange(state.index);
  const ratio = Number(dom.timeline.value) / 1000;
  dom.audio.currentTime = range.start + (range.end - range.start) * ratio;
  updatePlaybackProgress();
}

function selectQuestion(index) {
  state.index = clamp(index, 0, QUESTIONS.length - 1);
  dom.audio.pause();
  dom.audio.currentTime = getRange(state.index).start;
  saveState();
  render();
  const active = dom.questionList.querySelector(`[data-index="${state.index}"]`);
  active?.scrollIntoView({ block: "nearest" });
}

function getPreviousIndex() {
  if (!state.shuffle) {
    return state.index === 0 ? QUESTIONS.length - 1 : state.index - 1;
  }
  return randomDifferentIndex();
}

function getNextIndex() {
  if (!state.shuffle) {
    return state.index === QUESTIONS.length - 1 ? 0 : state.index + 1;
  }
  return randomDifferentIndex();
}

function randomDifferentIndex() {
  if (QUESTIONS.length < 2) return 0;
  let next = state.index;
  while (next === state.index) {
    next = Math.floor(Math.random() * QUESTIONS.length);
  }
  return next;
}

function setScriptVisibility(visible) {
  state.showScript = visible;
  saveState();
  render();
}

function nudgeRange(edge, delta) {
  const offsets = state.offsets[state.index] || { start: 0, end: 0 };
  offsets[edge] = Number(((offsets[edge] || 0) + delta).toFixed(2));
  state.offsets[state.index] = offsets;
  saveState();
  render();
}

function resetRange() {
  delete state.offsets[state.index];
  saveState();
  render();
}

function getRange(index) {
  const fallback = { start: index * 8, end: index * 8 + 7 };
  const base = state.segments[index] || fallback;
  const offsets = state.offsets[index] || { start: 0, end: 0 };
  const duration = state.duration || dom.audio.duration || base.end;
  let start = clamp(base.start + (offsets.start || 0), 0, duration);
  let end = clamp(base.end + (offsets.end || 0), 0, duration);
  if (end <= start + 0.8) {
    end = Math.min(duration, start + 0.8);
  }
  return { start, end };
}

function resetProgress() {
  state.heard.clear();
  state.hard.clear();
  state.offsets = {};
  saveState();
  render();
}

function toggleSet(set, value) {
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.index = clamp(Number(saved.index) || 0, 0, QUESTIONS.length - 1);
    state.showScript = saved.showScript !== false;
    state.repeat = Boolean(saved.repeat);
    state.autoNext = Boolean(saved.autoNext);
    state.shuffle = Boolean(saved.shuffle);
    state.rate = Number(saved.rate) || 1;
    state.heard = new Set(Array.isArray(saved.heard) ? saved.heard : []);
    state.hard = new Set(Array.isArray(saved.hard) ? saved.hard : []);
    state.offsets = saved.offsets && typeof saved.offsets === "object" ? saved.offsets : {};
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  const payload = {
    index: state.index,
    showScript: state.showScript,
    repeat: state.repeat,
    autoNext: state.autoNext,
    shuffle: state.shuffle,
    rate: state.rate,
    heard: [...state.heard],
    hard: [...state.hard],
    offsets: state.offsets,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function onKeydown(event) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    return;
  }
  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  }
  if (event.key === "ArrowRight") {
    selectQuestion(getNextIndex());
  }
  if (event.key === "ArrowLeft") {
    selectQuestion(getPreviousIndex());
  }
  if (event.key.toLowerCase() === "s") {
    setScriptVisibility(!state.showScript);
  }
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
