const STORAGE_KEY = "eiken-listening-trainer:v6";
// 微調整(offset)を初期値(start/end)へ反映するたびに +1。保存済みoffsetを一度だけクリアして二重適用を防ぐ。
const OFFSETS_VERSION = 2;
const END_GUARD_SECONDS = 0.22;

/* ---------- Deck 1: 元の質問 (single audio, flat list) ---------- */
const ORIGINAL_DURATION = 204.6955;
const ORIGINAL_SEGMENT_STARTS = [
  0, 4.68, 12.02, 17.38, 21.86, 34.54, 42.64, 50.73, 60.54, 73.3,
  88.22, 98.7, 111.87, 125.97, 139.21, 152.34, 163.47, 177.15, 190.99,
];
const ORIGINAL_QUESTIONS = [
  { topic: "Journalism", text: "Why do you think some governments try to restrict investigative journalism?" },
  { topic: "Journalism", text: "When general news reporting breaks a major story first, what advantage does investigative journalism still offer?" },
  { topic: "Journalism", text: "What specific example of investigative journalism exposing wrongdoing can you describe?" },
  { topic: "Rights", text: "Do people living in domestic societies take their rights for granted?" },
  { topic: "Printed books", text: "Thank you. Now I would like to ask you some questions related to your speech. Do you think there are specific groups of people, such as the elderly or young children, who will always prefer printed books over digital ones?" },
  { topic: "Printed books", text: "Can digital books ever replicate the experience of browsing a physical bookstore, and does losing that experience matter to society?" },
  { topic: "Libraries", text: "If governments cut funding for public libraries, would that accelerate the decline of printed books, or would it not matter much?" },
  { topic: "Employment", text: "If lifetime employment is completely abolished, how can companies maintain employee loyalty and prevent the leakage of essential corporate knowledge to competitors?" },
  { topic: "Employment", text: "Some argue that ending lifetime employment will disproportionately harm older workers, who may struggle to adapt to new technologies or find new jobs. How would you address this social concern?" },
  { topic: "AI and work", text: "While AI certainly brings business efficiency, it also raises serious concerns about job displacement. Do you believe governments should step in, perhaps by providing a universal basic income, to support those who lose their jobs to AI?" },
  { topic: "AI ethics", text: "What are your thoughts on the ethical risks of artificial intelligence, particularly regarding algorithmic bias and the potential for deepfakes to manipulate public opinion?" },
  { topic: "Politics", text: "If traditional political parties are failing to represent the average person, do you think decentralized social movements, perhaps driven by social media, can take their place effectively and govern a nation?" },
  { topic: "Politics", text: "Critics argue that decentralized systems or direct democracy can often lead to emotional and short-sighted decisions by the public. How can we ensure rational decision-making in a political system that lacks strong party leadership?" },
  { topic: "Education", text: "You mentioned the need for fundamental reform. Specifically, how should schools balance the teaching of foundational academic knowledge with the development of creative, entrepreneurial skills required in today's economy?" },
  { topic: "Education", text: "In our rapidly changing knowledge society, some suggest that continuous, lifelong learning is becoming much more important than traditional schooling. Do you agree that the traditional role of formal education is diminishing?" },
  { topic: "Philosophy", text: "In today's highly practical and technology-driven world, how exactly can studying philosophy directly contribute to solving modern social, economic, or environmental problems?" },
  { topic: "Philosophy", text: "Some people argue that philosophical concepts are simply too abstract and theoretical for the general public to apply. How can we make the study of philosophy more accessible and practically relevant to everyday life?" },
  { topic: "Japan model", text: "Japan is currently facing a severe demographic crisis with its aging population and declining birthrate. Given these domestic struggles, why should developing nations still look to Japan as a sustainable economic model?" },
  { topic: "Japan model", text: "Many developing countries are currently experiencing rapid population growth, which is the exact opposite of Japan's situation. Do you think Japan's historical economic strategies can genuinely be applied to these nations today?" },
];

/* ---------- Deck 2: 想定問題バンク (grouped by speech topic, 16問ずつタブ分割) ---------- */
const SOCIAL_DURATION = 586.66;
// category = 大分類, prompt = スピーチのお題, qno = お題内の設問番号, [start,end] = 音声区間
const SOCIAL_QUESTIONS = [
  { category: "社会", prompt: "Agree or disagree: Japan should accept more immigrants", qno: 1, text: "You argued Japan should accept more immigrants. But how would the government handle the social tensions that often arise between locals and newcomers?", start: 3.5, end: 12.95 },
  { category: "社会", prompt: "Agree or disagree: Japan should accept more immigrants", qno: 2, text: "If immigration increased significantly, wouldn't that put pressure on public services like housing and healthcare?", start: 15.2, end: 21.52 },
  { category: "社会", prompt: "Agree or disagree: Japan should accept more immigrants", qno: 3, text: "Some say accepting immigrants only delays solving the real problem of the low birthrate. How would you respond to that?", start: 23.55, end: 30.22 },
  { category: "社会", prompt: "Agree or disagree: Japan should accept more immigrants", qno: 4, text: "Do you think Japanese society is culturally ready to integrate large numbers of foreign residents?", start: 32.1, end: 37.28 },
  { category: "社会", prompt: "Should the government do more to reduce income inequality?", qno: 1, text: "You said the government should do more. But wouldn't higher taxes on the wealthy discourage investment and slow economic growth?", start: 41.7, end: 48.55 },
  { category: "社会", prompt: "Should the government do more to reduce income inequality?", qno: 2, text: "Isn't some level of inequality necessary to motivate people to work hard?", start: 49.8, end: 53.86 },
  { category: "社会", prompt: "Should the government do more to reduce income inequality?", qno: 3, text: "Who exactly should bear the cost of redistribution policies?", start: 55.3, end: 58.51 },
  { category: "社会", prompt: "Should the government do more to reduce income inequality?", qno: 4, text: "Can government intervention really change inequality, or are market forces simply too strong?", start: 60.0, end: 65.2 },
  { category: "社会", prompt: "Is a cashless society desirable?", qno: 1, text: "You spoke positively about a cashless society. But what about elderly people who struggle with digital technology?", start: 69.15, end: 76.05 },
  { category: "社会", prompt: "Is a cashless society desirable?", qno: 2, text: "Doesn't a cashless system make people more vulnerable to cyberattacks and system failures?", start: 78.05, end: 83.22 },
  { category: "社会", prompt: "Is a cashless society desirable?", qno: 3, text: "If all transactions are digital, how do you protect people's financial privacy?", start: 85.55, end: 89.89 },
  { category: "社会", prompt: "Is a cashless society desirable?", qno: 4, text: "Would going fully cashless widen the gap between those with and without digital access?", start: 92.4, end: 97.2 },
  { category: "政治・国際", prompt: "Should the United Nations be given more power?", qno: 1, text: "You supported giving the UN more power. But wouldn't that undermine the sovereignty of individual nations?", start: 167.39, end: 173.75 },
  { category: "政治・国際", prompt: "Should the United Nations be given more power?", qno: 2, text: "The UN is often criticized for being slow and bureaucratic. How would more power solve that?", start: 176.79, end: 183.13 },
  { category: "政治・国際", prompt: "Should the United Nations be given more power?", qno: 3, text: "Powerful countries hold veto rights. How can the UN be fair if a few nations dominate it?", start: 186.29, end: 192.49 },
  { category: "政治・国際", prompt: "Should the United Nations be given more power?", qno: 4, text: "Can you give a concrete example where more UN authority would have prevented a crisis?", start: 195.59, end: 200.54 },
  { category: "政治・国際", prompt: "Agree or disagree: Economic sanctions are an effective foreign policy tool", qno: 1, text: "You called sanctions effective. But don't they often hurt ordinary citizens more than the leaders they target?", start: 104.7, end: 110.81 },
  { category: "政治・国際", prompt: "Agree or disagree: Economic sanctions are an effective foreign policy tool", qno: 2, text: "History shows some regimes survive sanctions for decades. Doesn't that prove they fail?", start: 113.2, end: 118.53 },
  { category: "政治・国際", prompt: "Agree or disagree: Economic sanctions are an effective foreign policy tool", qno: 3, text: "If sanctions push a country toward rival powers, aren't they counterproductive?", start: 120.78, end: 125.37 },
  { category: "政治・国際", prompt: "Agree or disagree: Economic sanctions are an effective foreign policy tool", qno: 4, text: "What alternative would you propose when diplomacy alone is not enough?", start: 127.78, end: 131.32 },
  { category: "政治・国際", prompt: "Should Japan play a greater role in international security?", qno: 1, text: "You argued for a greater role. But wouldn't that conflict with Japan's pacifist constitution?", start: 137.15, end: 142.63 },
  { category: "政治・国際", prompt: "Should Japan play a greater role in international security?", qno: 2, text: "How would neighboring countries react to a more militarily active Japan?", start: 144.9, end: 148.88 },
  { category: "政治・国際", prompt: "Should Japan play a greater role in international security?", qno: 3, text: "Could increased security spending divert money from domestic needs like welfare?", start: 151.4, end: 155.35 },
  { category: "政治・国際", prompt: "Should Japan play a greater role in international security?", qno: 4, text: "Is Japan's public actually willing to support such a shift?", start: 157.85, end: 161.04 },
  { category: "環境・科学技術", prompt: "Can renewable energy fully replace fossil fuels?", qno: 1, text: "You believe renewables can replace fossil fuels. But how do you deal with the problem of intermittent supply when the sun doesn't shine or the wind doesn't blow?", start: 205.71, end: 214.73 },
  { category: "環境・科学技術", prompt: "Can renewable energy fully replace fossil fuels?", qno: 2, text: "Building renewable infrastructure requires huge upfront costs. Who should pay for that?", start: 216.51, end: 222.29 },
  { category: "環境・科学技術", prompt: "Can renewable energy fully replace fossil fuels?", qno: 3, text: "Many countries still depend heavily on coal. Is a full transition realistic within our lifetime?", start: 223.96, end: 230.19 },
  { category: "環境・科学技術", prompt: "Can renewable energy fully replace fossil fuels?", qno: 4, text: "What about the environmental cost of producing batteries and solar panels?", start: 231.86, end: 235.56 },
  { category: "環境・科学技術", prompt: "Agree or disagree: Artificial intelligence will do more good than harm", qno: 1, text: "You're optimistic about AI. But what about the millions of jobs that automation could eliminate?", start: 243.81, end: 249.49 },
  { category: "環境・科学技術", prompt: "Agree or disagree: Artificial intelligence will do more good than harm", qno: 2, text: "If AI systems make biased decisions, who should be held responsible?", start: 251.76, end: 256.01 },
  { category: "環境・科学技術", prompt: "Agree or disagree: Artificial intelligence will do more good than harm", qno: 3, text: "Doesn't concentrating AI power in a few large companies threaten democracy?", start: 258.56, end: 263.58 },
  { category: "環境・科学技術", prompt: "Agree or disagree: Artificial intelligence will do more good than harm", qno: 4, text: "How can we ensure AI is used ethically across different countries with different values?", start: 266.06, end: 271.26 },
  { category: "環境・科学技術", prompt: "Is space exploration worth the cost?", qno: 1, text: "You said space exploration is worth it. But shouldn't that money go to solving problems on Earth first?", start: 276.39, end: 282.59 },
  { category: "環境・科学技術", prompt: "Is space exploration worth the cost?", qno: 2, text: "What tangible benefit does the average citizen get from space programs?", start: 284.29, end: 288.22 },
  { category: "環境・科学技術", prompt: "Is space exploration worth the cost?", qno: 3, text: "Isn't space exploration increasingly driven by private profit rather than public good?", start: 289.94, end: 295.12 },
  { category: "環境・科学技術", prompt: "Is space exploration worth the cost?", qno: 4, text: "How do you justify the environmental impact of rocket launches?", start: 296.84, end: 300.54 },
  { category: "経済・ビジネス", prompt: "Agree or disagree: Globalization has benefited most people", qno: 1, text: "You argued globalization benefits most people. But what about workers in developed countries who lost their jobs to overseas factories?", start: 307.45, end: 315.09 },
  { category: "経済・ビジネス", prompt: "Agree or disagree: Globalization has benefited most people", qno: 2, text: "Doesn't globalization mainly benefit large corporations rather than ordinary citizens?", start: 316.55, end: 321.23 },
  { category: "経済・ビジネス", prompt: "Agree or disagree: Globalization has benefited most people", qno: 3, text: "How do you respond to the claim that globalization erodes local cultures?", start: 323.23, end: 327.41 },
  { category: "経済・ビジネス", prompt: "Agree or disagree: Globalization has benefited most people", qno: 4, text: "If globalization is so beneficial, why is there a growing backlash against it worldwide?", start: 328.8, end: 333.9 },
  { category: "経済・ビジネス", prompt: "Should governments introduce a universal basic income?", qno: 1, text: "You support universal basic income. But where would the enormous funding come from?", start: 340.26, end: 345.37 },
  { category: "経済・ビジネス", prompt: "Should governments introduce a universal basic income?", qno: 2, text: "Wouldn't giving everyone money discourage people from working?", start: 348.16, end: 351.56 },
  { category: "経済・ビジネス", prompt: "Should governments introduce a universal basic income?", qno: 3, text: "Is it fair to give the same payment to both the wealthy and the poor?", start: 354.36, end: 358.14 },
  { category: "経済・ビジネス", prompt: "Should governments introduce a universal basic income?", qno: 4, text: "Has any country actually proven that UBI works on a large scale?", start: 361.01, end: 365.01 },
  { category: "経済・ビジネス", prompt: "Is lifetime employment still viable in Japan?", qno: 1, text: "You discussed lifetime employment. But doesn't it prevent companies from adapting quickly to change?", start: 370.82, end: 376.4 },
  { category: "経済・ビジネス", prompt: "Is lifetime employment still viable in Japan?", qno: 2, text: "Young workers increasingly value flexibility. Is lifetime employment still attractive to them?", start: 377.92, end: 383.6 },
  { category: "経済・ビジネス", prompt: "Is lifetime employment still viable in Japan?", qno: 3, text: "Could this system be holding back innovation in Japanese companies?", start: 385.27, end: 388.87 },
  { category: "経済・ビジネス", prompt: "Is lifetime employment still viable in Japan?", qno: 4, text: "How can small businesses afford to guarantee lifetime jobs?", start: 390.37, end: 394.39 },
  { category: "教育・文化", prompt: "Should university education be free for all?", qno: 1, text: "You said university should be free. But who would ultimately pay for it through taxes?", start: 399.5, end: 404.24 },
  { category: "教育・文化", prompt: "Should university education be free for all?", qno: 2, text: "If everyone gets a degree, won't that simply reduce the value of a university education?", start: 405.7, end: 411.18 },
  { category: "教育・文化", prompt: "Should university education be free for all?", qno: 3, text: "Wouldn't free university benefit mainly the middle class rather than the poorest?", start: 412.7, end: 417.19 },
  { category: "教育・文化", prompt: "Should university education be free for all?", qno: 4, text: "Are there better uses for that money, such as vocational training?", start: 418.9, end: 422.8 },
  { category: "教育・文化", prompt: "Agree or disagree: English should be an official language of Japan", qno: 1, text: "You argued for English as an official language. But wouldn't that threaten the status of the Japanese language?", start: 431.47, end: 437.52 },
  { category: "教育・文化", prompt: "Agree or disagree: English should be an official language of Japan", qno: 2, text: "Is it realistic to expect the entire population to become proficient in English?", start: 440.12, end: 445.05 },
  { category: "教育・文化", prompt: "Agree or disagree: English should be an official language of Japan", qno: 3, text: "Could this policy create a divide between English speakers and non-speakers?", start: 447.97, end: 452.9 },
  { category: "教育・文化", prompt: "Agree or disagree: English should be an official language of Japan", qno: 4, text: "What concrete economic benefit would justify such a major change?", start: 455.67, end: 459.82 },
  { category: "教育・文化", prompt: "Should schools place more emphasis on creativity than memorization?", qno: 1, text: "You favored creativity over memorization. But isn't a strong base of knowledge necessary before one can be creative?", start: 467.56, end: 475.13 },
  { category: "教育・文化", prompt: "Should schools place more emphasis on creativity than memorization?", qno: 2, text: "How would you fairly assess creativity in exams?", start: 478.11, end: 481.37 },
  { category: "教育・文化", prompt: "Should schools place more emphasis on creativity than memorization?", qno: 3, text: "Some subjects like medicine require memorization. Should they change too?", start: 484.21, end: 489.27 },
  { category: "教育・文化", prompt: "Should schools place more emphasis on creativity than memorization?", qno: 4, text: "Could reducing memorization weaken students' fundamental academic skills?", start: 492.26, end: 496.86 },
  { category: "医療・倫理", prompt: "Should euthanasia be legalized?", qno: 1, text: "You supported legalizing euthanasia. But how do you prevent vulnerable people from feeling pressured to end their lives?", start: 501.75, end: 508.79 },
  { category: "医療・倫理", prompt: "Should euthanasia be legalized?", qno: 2, text: "Where exactly should we draw the line on who qualifies?", start: 510.8, end: 514.05 },
  { category: "医療・倫理", prompt: "Should euthanasia be legalized?", qno: 3, text: "Doesn't this place an enormous ethical burden on doctors?", start: 516.05, end: 519.52 },
  { category: "医療・倫理", prompt: "Should euthanasia be legalized?", qno: 4, text: "Could legalization weaken efforts to improve palliative care instead?", start: 521.5, end: 525.75 },
  { category: "医療・倫理", prompt: "Should animal testing be banned?", qno: 1, text: "You argued for banning animal testing. But how would we ensure new medicines are safe without it?", start: 530.2, end: 536.72 },
  { category: "医療・倫理", prompt: "Should animal testing be banned?", qno: 2, text: "Are the available alternatives truly reliable enough to replace it?", start: 538.2, end: 542.78 },
  { category: "医療・倫理", prompt: "Should animal testing be banned?", qno: 3, text: "Wouldn't a ban simply push such testing to countries with weaker regulations?", start: 544.3, end: 549.55 },
  { category: "医療・倫理", prompt: "Should animal testing be banned?", qno: 4, text: "How do you weigh animal welfare against potential human lives saved?", start: 550.8, end: 556.05 },
  { category: "医療・倫理", prompt: "Is it ethical to use AI in medical decision-making?", qno: 1, text: "You discussed AI in medicine. But who is responsible if an AI makes a fatal misdiagnosis?", start: 562.05, end: 568.85 },
  { category: "医療・倫理", prompt: "Is it ethical to use AI in medical decision-making?", qno: 2, text: "Can patients truly trust a decision they cannot understand?", start: 570.05, end: 574.3 },
  { category: "医療・倫理", prompt: "Is it ethical to use AI in medical decision-making?", qno: 3, text: "Doesn't reliance on AI risk eroding doctors' own clinical judgment?", start: 575.45, end: 580.66 },
  { category: "医療・倫理", prompt: "Is it ethical to use AI in medical decision-making?", qno: 4, text: "How do we protect sensitive patient data used to train these systems?", start: 581.65, end: 586.65 },
];

function buildFixedSegments(starts, duration) {
  const safeDuration = duration || starts[starts.length - 1] + 8;
  return starts.map((start, index) => {
    const nextStart = starts[index + 1];
    const end = nextStart === undefined ? safeDuration : Math.max(start + 0.8, nextStart - END_GUARD_SECONDS);
    return { start, end: Math.min(safeDuration, end) };
  });
}

const SOCIAL_AUDIO = "assets/questions2.mp3?v=10";
const CHUNK_SIZE = 16;

// 想定問題バンク(72問)を16問ずつのタブに分割（最後のタブは半端でOK）
const SOCIAL_DECKS = [];
for (let start = 0; start < SOCIAL_QUESTIONS.length; start += CHUNK_SIZE) {
  const slice = SOCIAL_QUESTIONS.slice(start, start + CHUNK_SIZE);
  const number = SOCIAL_DECKS.length + 2; // 想定問題1は元セット。バンクは2番から
  SOCIAL_DECKS.push({
    id: "social" + (SOCIAL_DECKS.length + 1),
    label: "想定問題" + number,
    sub: slice.length + "問",
    audio: SOCIAL_AUDIO,
    duration: SOCIAL_DURATION,
    grouped: true,
    questions: slice,
    segments: slice.map((q) => ({ start: q.start, end: q.end })),
  });
}

const DECKS = [
  {
    id: "original",
    label: "想定問題1",
    sub: "19問",
    audio: "assets/questions.mp3",
    duration: ORIGINAL_DURATION,
    grouped: false,
    questions: ORIGINAL_QUESTIONS,
    segments: buildFixedSegments(ORIGINAL_SEGMENT_STARTS, ORIGINAL_DURATION),
  },
  ...SOCIAL_DECKS,
];

const dom = {
  audio: document.querySelector("#questionAudio"),
  deckSelect: document.querySelector("#deckSelect"),
  questionList: document.querySelector("#questionList"),
  questionNumber: document.querySelector("#questionNumber"),
  questionTopic: document.querySelector("#questionTopic"),
  segmentStatus: document.querySelector("#segmentStatus"),
  scriptCard: document.querySelector("#scriptCard"),
  scriptPrompt: document.querySelector("#scriptPrompt"),
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
  rangeExportBtn: document.querySelector("#rangeExportBtn"),
  rangeReadout: document.querySelector("#rangeReadout"),
};

const state = {
  deckId: DECKS[0].id,
  showScript: true,
  isPlaying: false,
  repeat: false,
  autoNext: false,
  shuffle: false,
  rate: 1,
  duration: DECKS[0].duration,
  segments: DECKS[0].segments,
  progress: {},
  lastPlayError: "",
  segmentTimer: 0,
};

window.eikenTrainer = {
  getState: () => ({
    deckId: state.deckId,
    index: prog().index,
    duration: state.duration,
    isPlaying: state.isPlaying,
    lastPlayError: state.lastPlayError,
    currentRange: getRange(prog().index),
    segments: state.segments,
  }),
  exportRanges: () => collectAdjustments(),
};

init();

function deck() {
  return DECKS.find((d) => d.id === state.deckId) || DECKS[0];
}

function questions() {
  return deck().questions;
}

function ensureProgress(id) {
  if (!state.progress[id]) {
    state.progress[id] = { index: 0, heard: new Set(), hard: new Set(), offsets: {} };
  }
  return state.progress[id];
}

function prog() {
  return ensureProgress(state.deckId);
}

function init() {
  restoreState();
  DECKS.forEach((d) => ensureProgress(d.id));
  buildDeckSelector();
  applyDeck(false);
  bindEvents();
  buildQuestionList();
  render();
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
    const p = prog();
    toggleSet(p.heard, p.index);
    if (p.heard.has(p.index)) {
      p.hard.delete(p.index);
    }
    saveState();
    render();
  });
  dom.hardBtn.addEventListener("click", () => {
    const p = prog();
    toggleSet(p.hard, p.index);
    if (p.hard.has(p.index)) {
      p.heard.delete(p.index);
    }
    saveState();
    render();
  });
  dom.timeline.addEventListener("input", onTimelineInput);
  dom.audio.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(dom.audio.duration) && dom.audio.duration > 0) {
      state.duration = dom.audio.duration;
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
  dom.deckSelect.addEventListener("click", onDeckSelectClick);
  dom.startBackBtn.addEventListener("click", () => nudgeRange("start", -0.3));
  dom.startForwardBtn.addEventListener("click", () => nudgeRange("start", 0.3));
  dom.endBackBtn.addEventListener("click", () => nudgeRange("end", -0.3));
  dom.endForwardBtn.addEventListener("click", () => nudgeRange("end", 0.3));
  dom.rangeResetBtn.addEventListener("click", resetRange);
  dom.rangeExportBtn.addEventListener("click", () => showExportOverlay(exportRangesText()));
  document.addEventListener("keydown", onKeydown);
}

function buildDeckSelector() {
  dom.deckSelect.innerHTML = "";
  DECKS.forEach((d) => {
    const button = document.createElement("button");
    button.className = "deck-btn";
    button.type = "button";
    button.dataset.deck = d.id;
    button.innerHTML = `<span class="deck-name">${escapeHtml(d.label)}</span><span class="deck-sub">${escapeHtml(d.sub)}</span>`;
    dom.deckSelect.append(button);
  });
}

function onDeckSelectClick(event) {
  const button = event.target.closest(".deck-btn");
  if (!button) return;
  selectDeck(button.dataset.deck);
}

function selectDeck(id) {
  if (id === state.deckId || !DECKS.some((d) => d.id === id)) return;
  dom.audio.pause();
  state.deckId = id;
  applyDeck(true);
  buildQuestionList();
  saveState();
  render();
  scrollActiveIntoView();
}

function applyDeck(seek) {
  const d = deck();
  state.duration = d.duration;
  state.segments = d.segments;
  if (dom.audio.getAttribute("src") !== d.audio) {
    dom.audio.src = d.audio;
    dom.audio.load();
  }
  dom.audio.playbackRate = state.rate;
  if (seek) {
    seekToRangeStart();
  }
}

function seekToRangeStart() {
  const start = getRange(prog().index).start;
  const apply = () => {
    try {
      dom.audio.currentTime = start;
    } catch (error) {
      /* metadata not ready yet */
    }
  };
  if (dom.audio.readyState >= 1) {
    apply();
  } else {
    dom.audio.addEventListener("loadedmetadata", apply, { once: true });
  }
}

function buildQuestionList() {
  const d = deck();
  dom.questionList.innerHTML = "";
  dom.questionList.classList.toggle("grouped", Boolean(d.grouped));
  let lastCategory = null;
  let lastPrompt = null;

  d.questions.forEach((question, index) => {
    if (d.grouped) {
      if (question.category !== lastCategory) {
        const divider = document.createElement("p");
        divider.className = "cat-divider";
        divider.textContent = question.category;
        dom.questionList.append(divider);
        lastCategory = question.category;
        lastPrompt = null;
      }
      if (question.prompt !== lastPrompt) {
        const header = document.createElement("p");
        header.className = "group-header";
        header.textContent = question.prompt;
        dom.questionList.append(header);
        lastPrompt = question.prompt;
      }
    }

    const button = document.createElement("button");
    button.className = "question-item";
    button.type = "button";
    button.dataset.index = String(index);
    const badge = d.grouped ? `Q${question.qno}` : pad(index + 1);
    const topLabel = d.grouped ? question.category : question.topic;
    button.innerHTML = `
      <span class="item-number">${escapeHtml(badge)}</span>
      <span>
        <span class="item-topic">${escapeHtml(topLabel)}</span>
        <span class="item-preview">${escapeHtml(question.text)}</span>
      </span>
    `;
    button.addEventListener("click", () => selectQuestion(index));
    dom.questionList.append(button);
  });
}

function render() {
  const d = deck();
  const p = prog();
  const question = d.questions[p.index];
  const number = pad(p.index + 1);
  const range = getRange(p.index);

  dom.questionNumber.textContent = `${number} / ${d.questions.length}`;
  dom.questionTopic.textContent = d.grouped ? question.category : question.topic;
  if (d.grouped) {
    dom.scriptPrompt.textContent = question.prompt;
    dom.scriptPrompt.hidden = false;
    dom.maskedNumber.textContent = `Q${question.qno} · ${question.category}`;
  } else {
    dom.scriptPrompt.textContent = "";
    dom.scriptPrompt.hidden = true;
    dom.maskedNumber.textContent = `Question ${number}`;
  }
  dom.scriptText.textContent = question.text;
  dom.scriptCard.classList.toggle("is-hidden", !state.showScript);
  dom.scriptCard.setAttribute("aria-pressed", String(!state.showScript));
  dom.scriptToggle.checked = state.showScript;
  dom.repeatToggle.checked = state.repeat;
  dom.autoNextToggle.checked = state.autoNext;
  dom.rateSelect.value = String(state.rate);
  dom.shuffleBtn.setAttribute("aria-pressed", String(state.shuffle));
  dom.shuffleBtn.classList.toggle("active", state.shuffle);
  dom.doneBtn.setAttribute("aria-pressed", String(p.heard.has(p.index)));
  dom.hardBtn.setAttribute("aria-pressed", String(p.hard.has(p.index)));
  dom.doneCount.textContent = String(p.heard.size);
  dom.hardCount.textContent = String(p.hard.size);
  dom.segmentStatus.textContent = `${d.questions.length} sections`;
  if (state.lastPlayError) {
    dom.segmentStatus.textContent = state.lastPlayError;
  }
  dom.endTime.textContent = formatTime(range.end - range.start);
  dom.rangeReadout.textContent = `${formatTime(range.start)} - ${formatTime(range.end)}`;

  dom.deckSelect.querySelectorAll(".deck-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.deck === state.deckId);
    button.setAttribute("aria-pressed", String(button.dataset.deck === state.deckId));
  });

  document.querySelectorAll(".question-item").forEach((item) => {
    const itemIndex = Number(item.dataset.index);
    item.classList.toggle("active", itemIndex === p.index);
    item.classList.toggle("done", p.heard.has(itemIndex));
    item.classList.toggle("hard", p.hard.has(itemIndex));
  });

  updatePlaybackProgress();
  renderTransport();
}

function renderTransport() {
  dom.playBtn.textContent = state.isPlaying ? "一時停止" : "再生";
}

function togglePlay() {
  if (state.isPlaying) {
    dom.audio.pause();
    return;
  }
  playCurrent(false);
}

function playCurrent(forceRestart) {
  const range = getRange(prog().index);
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
  const range = getRange(prog().index);
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
  const range = getRange(prog().index);
  const secondsLeft = range.end - dom.audio.currentTime;
  if (!Number.isFinite(secondsLeft) || secondsLeft <= 0) {
    finishSegment();
    return;
  }
  const rate = Number(dom.audio.playbackRate) || state.rate || 1;
  state.segmentTimer = window.setTimeout(() => {
    if (!state.isPlaying) return;
    if (dom.audio.currentTime >= getRange(prog().index).end - 0.08) {
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
  if (!prog().hard.has(prog().index)) {
    prog().heard.add(prog().index);
  }
  saveState();

  if (state.repeat) {
    dom.audio.currentTime = getRange(prog().index).start;
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
  const range = getRange(prog().index);
  const ratio = Number(dom.timeline.value) / 1000;
  dom.audio.currentTime = range.start + (range.end - range.start) * ratio;
  updatePlaybackProgress();
}

function selectQuestion(index) {
  const p = prog();
  p.index = clamp(index, 0, questions().length - 1);
  dom.audio.pause();
  dom.audio.currentTime = getRange(p.index).start;
  saveState();
  render();
  scrollActiveIntoView();
}

function scrollActiveIntoView() {
  const active = dom.questionList.querySelector(`[data-index="${prog().index}"]`);
  active?.scrollIntoView({ block: "nearest" });
}

function getPreviousIndex() {
  const total = questions().length;
  if (!state.shuffle) {
    return prog().index === 0 ? total - 1 : prog().index - 1;
  }
  return randomDifferentIndex();
}

function getNextIndex() {
  const total = questions().length;
  if (!state.shuffle) {
    return prog().index === total - 1 ? 0 : prog().index + 1;
  }
  return randomDifferentIndex();
}

function randomDifferentIndex() {
  const total = questions().length;
  if (total < 2) return 0;
  let next = prog().index;
  while (next === prog().index) {
    next = Math.floor(Math.random() * total);
  }
  return next;
}

function setScriptVisibility(visible) {
  state.showScript = visible;
  saveState();
  render();
}

function nudgeRange(edge, delta) {
  const offsets = prog().offsets[prog().index] || { start: 0, end: 0 };
  offsets[edge] = Number(((offsets[edge] || 0) + delta).toFixed(2));
  prog().offsets[prog().index] = offsets;
  saveState();
  render();
}

function resetRange() {
  delete prog().offsets[prog().index];
  saveState();
  render();
}

// 各デッキで微調整(offset)された問題を集計し、調整後の絶対start/endを返す
function collectAdjustments() {
  const out = [];
  DECKS.forEach((d) => {
    const prg = ensureProgress(d.id);
    d.questions.forEach((q, index) => {
      const off = prg.offsets[index];
      if (!off || (!off.start && !off.end)) return;
      const base = d.segments[index];
      const dur = d.duration;
      let start = clamp(base.start + (off.start || 0), 0, dur);
      let end = clamp(base.end + (off.end || 0), 0, dur);
      if (end <= start + 0.8) {
        end = Math.min(dur, start + 0.8);
      }
      out.push({
        set: d.label,
        label: d.grouped ? "Q" + q.qno : "#" + (index + 1),
        topic: d.grouped ? q.category + " / " + q.prompt : q.topic,
        text: q.text,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2)),
        baseStart: Number(base.start.toFixed(2)),
        baseEnd: Number(base.end.toFixed(2)),
      });
    });
  });
  return out;
}

function exportRangesText() {
  const adj = collectAdjustments();
  if (!adj.length) {
    return "（まだRangeの調整がありません。各問題で「開始/終了 ±0.3」を押して微調整してから、もう一度この書き出しを押してください。）";
  }
  const lines = adj.map(
    (a) =>
      `[${a.set}] ${a.label}  ${a.topic}\n  "${a.text}"\n  → start ${a.start} / end ${a.end}   (元: ${a.baseStart} / ${a.baseEnd})`
  );
  const json = JSON.stringify(adj.map((a) => ({ text: a.text, start: a.start, end: a.end })));
  return `Range調整 ${adj.length}件\n\n${lines.join("\n\n")}\n\n--- 反映用データ(このJSONをそのまま渡してください) ---\n${json}`;
}

function showExportOverlay(text) {
  let overlay = document.querySelector("#exportOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "exportOverlay";
    overlay.className = "export-overlay";
    overlay.innerHTML = `
      <div class="export-box">
        <h2>Range調整の書き出し</h2>
        <p class="export-hint">下のテキストを全部コピーして、開発者(チャット)に貼り付けてください。初期値として反映すれば、GitHub経由で全員に共有されます。</p>
        <textarea id="exportText" readonly></textarea>
        <div class="export-actions">
          <button class="primary-btn" id="exportCopyBtn" type="button">コピー</button>
          <button class="wide-btn subtle" id="exportCloseBtn" type="button">閉じる</button>
        </div>
      </div>`;
    document.body.append(overlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) overlay.classList.remove("open");
    });
    overlay.querySelector("#exportCloseBtn").addEventListener("click", () => overlay.classList.remove("open"));
    overlay.querySelector("#exportCopyBtn").addEventListener("click", () => {
      const area = overlay.querySelector("#exportText");
      area.select();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(area.value).catch(() => {});
      }
      try {
        document.execCommand("copy");
      } catch (error) {
        /* 手動コピーにフォールバック */
      }
      const button = overlay.querySelector("#exportCopyBtn");
      button.textContent = "コピーしました";
      window.setTimeout(() => {
        button.textContent = "コピー";
      }, 1500);
    });
  }
  overlay.querySelector("#exportText").value = text;
  overlay.classList.add("open");
  const area = overlay.querySelector("#exportText");
  area.focus();
  area.select();
}

function getRange(index) {
  const fallback = { start: index * 8, end: index * 8 + 7 };
  const base = state.segments[index] || fallback;
  const offsets = prog().offsets[index] || { start: 0, end: 0 };
  const duration = state.duration || dom.audio.duration || base.end;
  const start = clamp(base.start + (offsets.start || 0), 0, duration);
  let end = clamp(base.end + (offsets.end || 0), 0, duration);
  if (end <= start + 0.8) {
    end = Math.min(duration, start + 0.8);
  }
  return { start, end };
}

function resetProgress() {
  const p = prog();
  p.heard.clear();
  p.hard.clear();
  p.offsets = {};
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
    state.deckId = DECKS.some((d) => d.id === saved.deckId) ? saved.deckId : DECKS[0].id;
    state.showScript = saved.showScript !== false;
    state.repeat = Boolean(saved.repeat);
    state.autoNext = Boolean(saved.autoNext);
    state.shuffle = Boolean(saved.shuffle);
    state.rate = Number(saved.rate) || 1;
    const savedProgress = saved.progress && typeof saved.progress === "object" ? saved.progress : {};
    const keepOffsets = (Number(saved.offsetsVersion) || 1) >= OFFSETS_VERSION;
    DECKS.forEach((d) => {
      const sp = savedProgress[d.id] || {};
      const heard = new Set(Array.isArray(sp.heard) ? sp.heard : []);
      const hard = new Set(Array.isArray(sp.hard) ? sp.hard : []);
      hard.forEach((i) => heard.delete(i)); // 「聞き取れた」と「苦手」は排他（苦手を優先）
      state.progress[d.id] = {
        index: clamp(Number(sp.index) || 0, 0, d.questions.length - 1),
        heard,
        hard,
        offsets: keepOffsets && sp.offsets && typeof sp.offsets === "object" ? sp.offsets : {},
      };
    });
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  const progress = {};
  DECKS.forEach((d) => {
    const p = ensureProgress(d.id);
    progress[d.id] = {
      index: p.index,
      heard: [...p.heard],
      hard: [...p.hard],
      offsets: p.offsets,
    };
  });
  const payload = {
    deckId: state.deckId,
    showScript: state.showScript,
    repeat: state.repeat,
    autoNext: state.autoNext,
    shuffle: state.shuffle,
    rate: state.rate,
    offsetsVersion: OFFSETS_VERSION,
    progress,
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
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
