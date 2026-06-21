export type FreePracticeExpressionVariants = {
  standard: string;
  idiomatic: string;
  simple: string;
  natural: string;
  spoken: string;
};

type ConcertContext = {
  hasCentralPark: boolean;
  hasConcert: boolean;
  hasFuture: boolean;
  hasPast: boolean;
  hasRelaxed: boolean;
  hasTuesday: boolean;
  hasToday: boolean;
  hasVery: boolean;
  hasWe: boolean;
};

const concertPattern =
  /\u97f3\u4e50\u4f1a|\u6f14\u5531\u4f1a|\u542c\u97f3\u4e50|\u770b\u6f14\u51fa/;
const centralParkPattern = /\u4e2d\u592e\u516c\u56ed|centralpark/i;
const relaxedPattern =
  /\u653e\u677e|\u8f7b\u677e|\u89e3\u538b|\u8212\u670d|\u8212\u7f13/;
const veryPattern =
  /\u975e\u5e38|\u5f88|\u7279\u522b|\u633a|\u86ee|\u76f8\u5f53|\u5341\u5206/;
const tuesdayPattern = /\u661f\u671f\u4e8c|\u5468\u4e8c|\u793c\u62dc\u4e8c/;
const todayPattern = /\u4eca\u5929/;
const wePattern = /\u6211\u4eec|\u54b1\u4eec/;
const jobPattern = /\u5de5\u4f5c|\u804c\u4f4d|\u6c42\u804c|\u627e\u5de5\u4f5c|job|work/i;
const betterPattern = /\u66f4\u597d|\u66f4\u4f73|\u7406\u60f3|\u6ee1\u610f|better/i;
const bagPattern =
  /\u884c\u56ca|\u884c\u674e|\u80cc\u5305|\u5305|\u884c\u88c5|bag|backpack|luggage/i;
const simpleBagPattern =
  /\u7b80\u5355|\u8f7b\u4fbf|\u8f7b\u88c5|\u8f7b\u677e|simple|light/i;
const futurePattern =
  /\u660e\u5929|\u540e\u5929|\u4e0b\u5468|\u4e0b\u4e2a|\u7b49\u4f1a|\u5f85\u4f1a|\u4e00\u4f1a|\u8981|\u4f1a(?:\u53bb|\u6765|\u770b|\u542c|\u53c2\u52a0|\u89c9\u5f97|\u611f\u5230|\u5f88|\u975e\u5e38|\u66f4|\u8ba9)|\u6253\u7b97|\u51c6\u5907|\u60f3\u53bb|\u5c06|soon|later/i;
const pastPattern =
  /\u542c\u4e86|\u770b\u4e86|\u53bb\u4e86|\u53c2\u52a0\u4e86|\u521a|\u5df2\u7ecf|\u6628\u5929|\u4e0a\u5468|\u524d\u5929|\u4e86/;

const requiredEnglishPatterns = {
  centralPark: /central park/,
  concert: /(concert|gig|recital|live music|music show|performance)/,
  relaxed: /(relax|relaxed|relaxing|unwind|calm|at ease|peaceful|restful)/,
  tuesday: /tuesday/,
};

function normalizeChinese(chinese: string) {
  return chinese.replace(/\s+/g, "");
}

function getConcertContext(chinese: string): ConcertContext {
  const normalizedChinese = normalizeChinese(chinese);
  const futureProbeText = normalizedChinese.replace(concertPattern, "");
  const hasFuture = futurePattern.test(futureProbeText);
  const hasRelaxed = relaxedPattern.test(normalizedChinese);

  return {
    hasCentralPark: centralParkPattern.test(normalizedChinese),
    hasConcert: concertPattern.test(normalizedChinese),
    hasFuture,
    hasPast:
      pastPattern.test(normalizedChinese) || (hasRelaxed && !hasFuture),
    hasRelaxed,
    hasTuesday: tuesdayPattern.test(normalizedChinese),
    hasToday: todayPattern.test(normalizedChinese),
    hasVery: veryPattern.test(normalizedChinese),
    hasWe: wePattern.test(normalizedChinese),
  };
}

function getTimePhrase(context: ConcertContext) {
  if (context.hasTuesday && !context.hasToday) return "on Tuesday";
  if (context.hasToday && !context.hasTuesday) return "today";
  return "";
}

function appendTime(text: string, timePhrase: string) {
  return timePhrase ? `${text} ${timePhrase}` : text;
}

function sentenceWithTuesdayLead(text: string, context: ConcertContext) {
  if (!context.hasTuesday || !context.hasToday) return text;

  return `Today is Tuesday, and ${text}`;
}

function finishConcertSentence(base: string, context: ConcertContext) {
  const degree = context.hasVery ? "very" : "really";

  if (!context.hasRelaxed) return `${base}.`;
  if (context.hasFuture) {
    return `${base}, and I think it will be ${degree} relaxing.`;
  }

  return `${base}, and ${context.hasWe ? "we" : "I"} felt ${degree} relaxed.`;
}

function ensureSentence(text: string) {
  const trimmedText = text.replace(/\s+/g, " ").trim();
  if (!trimmedText) return "";
  return /[.!?]$/.test(trimmedText) ? trimmedText : `${trimmedText}.`;
}

function withoutFinalPunctuation(text: string) {
  return text.replace(/\s+/g, " ").trim().replace(/[.!?]+$/g, "");
}

function contractCommonPhrases(text: string) {
  return text
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bWe are\b/g, "We're")
    .replace(/\bWe will\b/g, "We'll")
    .replace(/\bThey are\b/g, "They're")
    .replace(/\bThey will\b/g, "They'll")
    .replace(/\bIt is\b/g, "It's")
    .replace(/\bThat is\b/g, "That's")
    .replace(/\bThere is\b/g, "There's")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bdoes not\b/g, "doesn't")
    .replace(/\bdid not\b/g, "didn't")
    .replace(/\bcannot\b/g, "can't")
    .replace(/\bwill not\b/g, "won't");
}

function createGenericFallbackVariants(
  standard: string
): FreePracticeExpressionVariants {
  const base = ensureSentence(standard);
  if (!base) {
    return {
      standard: "",
      idiomatic: "",
      simple: "",
      natural: "",
      spoken: "",
    };
  }
  const baseWithoutPeriod = withoutFinalPunctuation(base);
  const contractedBase = ensureSentence(contractCommonPhrases(base));
  const idiomatic =
    contractedBase !== base
      ? contractedBase
      : ensureSentence(`I'd put it this way: ${baseWithoutPeriod}`);

  return {
    standard: base,
    idiomatic,
    simple: ensureSentence(`In simple words, ${baseWithoutPeriod}`),
    natural: ensureSentence(`A natural way to say it is, ${baseWithoutPeriod}`),
    spoken: ensureSentence(`Honestly, ${baseWithoutPeriod}`),
  };
}

function createConcertBase(chinese: string) {
  const context = getConcertContext(chinese);
  const subject = context.hasWe ? "We" : "I";
  const subjectGoing = context.hasWe ? "We're" : "I'm";
  const timePhrase = getTimePhrase(context);

  if (!context.hasConcert) return "";

  if (context.hasPast) {
    const base = context.hasCentralPark
      ? appendTime(`${subject} went to a concert in Central Park`, timePhrase)
      : appendTime(`${subject} went to a concert`, timePhrase);

    return finishConcertSentence(sentenceWithTuesdayLead(base, context), context);
  }

  if (context.hasFuture) {
    const base = context.hasCentralPark
      ? appendTime(`${subjectGoing} going to Central Park for a concert`, timePhrase)
      : appendTime(`${subjectGoing} going to a concert`, timePhrase);

    return finishConcertSentence(sentenceWithTuesdayLead(base, context), context);
  }

  const base = context.hasCentralPark
    ? appendTime(`${subjectGoing} going to Central Park for a concert`, timePhrase)
    : appendTime(`${subjectGoing} going to a concert`, timePhrase);

  return finishConcertSentence(sentenceWithTuesdayLead(base, context), context);
}

export function createFallbackEnglish(chinese: string) {
  const normalizedChinese = normalizeChinese(chinese);
  const concertEnglish = createConcertBase(chinese);

  if (concertEnglish) return concertEnglish;

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(normalizedChinese)) {
    return "Exercise makes me feel energized, and I sleep really well at night.";
  }

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return "Let's take a short break, and then we can go for a walk later.";
  }

  if (jobPattern.test(normalizedChinese) && betterPattern.test(normalizedChinese)) {
    return "That's why I'm looking for a better job.";
  }

  if (bagPattern.test(normalizedChinese) && simpleBagPattern.test(normalizedChinese)) {
    return "I carry a simple bag on my back.";
  }

  if (/\u6237\u5916|\u5929\u6c14|\u592a\u9633/.test(normalizedChinese)) {
    return "I want to stay outside a little longer and enjoy the weather.";
  }

  if (/\u5f00\u5fc3|\u559c\u6b22|\u4eab\u53d7|\u9ad8\u5174/.test(normalizedChinese)) {
    return "This feeling makes me happy for the whole day.";
  }

  if (/\u5403|\u997f|\u5496\u5561|\u8336|\u559d/.test(normalizedChinese)) {
    return "I want to get something nice to eat in a little while.";
  }

  return "";
}

function createConcertVariants(
  chinese: string,
  standardEnglish: string
): FreePracticeExpressionVariants | null {
  const context = getConcertContext(chinese);
  if (!context.hasConcert) return null;

  const subject = context.hasWe ? "We" : "I";
  const object = context.hasWe ? "us" : "me";
  const capSubjectGoing = context.hasWe ? "We're" : "I'm";
  const timePhrase = getTimePhrase(context);
  const event = context.hasCentralPark
    ? "a concert in Central Park"
    : "a concert";
  const destination = context.hasCentralPark
    ? "Central Park for a concert"
    : "a concert";
  const degree = context.hasVery ? "really" : "pretty";

  if (context.hasPast) {
    if (context.hasRelaxed) {
      return {
        standard: standardEnglish || createFallbackEnglish(chinese),
        idiomatic: sentenceWithTuesdayLead(
          `${subject} went to ${event}${
            timePhrase ? ` ${timePhrase}` : ""
          } and came away feeling ${degree} relaxed.`,
          context
        ),
        simple: sentenceWithTuesdayLead(
          `${subject} went to ${destination}${
            timePhrase ? ` ${timePhrase}` : ""
          }, and ${context.hasWe ? "we" : "I"} felt very relaxed.`,
          context
        ),
        natural: sentenceWithTuesdayLead(
          `${subject} caught ${event}${
            timePhrase ? ` ${timePhrase}` : ""
          }, and it really helped ${object} relax.`,
          context
        ),
        spoken: sentenceWithTuesdayLead(
          `${subject} went to ${event}${
            timePhrase ? ` ${timePhrase}` : ""
          }, and honestly, it was super relaxing.`,
          context
        ),
      };
    }

    return {
      standard: standardEnglish || createFallbackEnglish(chinese),
      idiomatic: sentenceWithTuesdayLead(
        `${subject} went to ${event}${timePhrase ? ` ${timePhrase}` : ""}.`,
        context
      ),
      simple: sentenceWithTuesdayLead(
        `${subject} went to ${destination}${
          timePhrase ? ` ${timePhrase}` : ""
        }.`,
        context
      ),
      natural: sentenceWithTuesdayLead(
        `${subject} caught ${event}${timePhrase ? ` ${timePhrase}` : ""}.`,
        context
      ),
      spoken: sentenceWithTuesdayLead(
        `${subject} went to see ${event}${timePhrase ? ` ${timePhrase}` : ""}.`,
        context
      ),
    };
  }

  if (context.hasRelaxed && context.hasFuture) {
    return {
      standard: standardEnglish || createFallbackEnglish(chinese),
      idiomatic: sentenceWithTuesdayLead(
        `${capSubjectGoing} heading to ${destination}${
          timePhrase ? ` ${timePhrase}` : ""
        }, and I think it will be really relaxing.`,
        context
      ),
      simple: sentenceWithTuesdayLead(
        `${capSubjectGoing} going to ${destination}${
          timePhrase ? ` ${timePhrase}` : ""
        }, and I think it will be very relaxing.`,
        context
      ),
      natural: sentenceWithTuesdayLead(
        `${capSubjectGoing} going to catch ${event}${
          timePhrase ? ` ${timePhrase}` : ""
        }, and it should help ${object} relax.`,
        context
      ),
      spoken: sentenceWithTuesdayLead(
        `${capSubjectGoing} going to ${event}${
          timePhrase ? ` ${timePhrase}` : ""
        }, and I think it'll be super relaxing.`,
        context
      ),
    };
  }

  return {
    standard: standardEnglish || createFallbackEnglish(chinese),
    idiomatic: sentenceWithTuesdayLead(
      `${capSubjectGoing} heading to ${destination}${
        timePhrase ? ` ${timePhrase}` : ""
      }.`,
      context
    ),
    simple: sentenceWithTuesdayLead(
      `${capSubjectGoing} going to ${destination}${
        timePhrase ? ` ${timePhrase}` : ""
      }.`,
      context
    ),
    natural: sentenceWithTuesdayLead(
      `${capSubjectGoing} going to ${destination}${
        timePhrase ? ` ${timePhrase}` : ""
      } later.`,
      context
    ),
    spoken: sentenceWithTuesdayLead(
      `${capSubjectGoing} going to catch ${event}${
        timePhrase ? ` ${timePhrase}` : ""
      }.`,
      context
    ),
  };
}

export function createFallbackVariants(
  chinese: string,
  standardEnglish: string
): FreePracticeExpressionVariants {
  const standard = standardEnglish || createFallbackEnglish(chinese);
  const normalizedChinese = normalizeChinese(chinese);
  const concertVariants = createConcertVariants(chinese, standard);

  if (concertVariants) return concertVariants;

  if (/\u4f11\u606f|\u6563\u6b65/.test(normalizedChinese)) {
    return {
      standard: standard || "Let's take a break, and then go for a walk later.",
      idiomatic: "Let's take a break first, then go for a walk later.",
      simple: "Let's rest first, and then take a walk later.",
      natural: "Let's take a break, and we can go for a walk in a while.",
      spoken: "How about we take a break and go for a walk later?",
    };
  }

  if (jobPattern.test(normalizedChinese) && betterPattern.test(normalizedChinese)) {
    return {
      standard: standard || "That's why I'm looking for a better job.",
      idiomatic: "That's why I'm searching for a better job.",
      simple: "So I want to find a better job.",
      natural: "I'm trying to find a better job that fits me better.",
      spoken: "That's why I'm trying to find a better job.",
    };
  }

  if (bagPattern.test(normalizedChinese) && simpleBagPattern.test(normalizedChinese)) {
    return {
      standard: standard || "I carry a simple bag on my back.",
      idiomatic: "I sling a simple bag over my shoulder.",
      simple: "I carry a simple bag.",
      natural: "I have a simple bag on my back.",
      spoken: "I've got a simple bag with me.",
    };
  }

  if (/\u8fd0\u52a8|\u953b\u70bc|\u7cbe\u795e|\u7761/.test(normalizedChinese)) {
    return {
      standard,
      idiomatic:
        "Working out leaves me feeling energized, and I sleep much better at night.",
      simple: "Exercise makes me feel good, and I sleep better at night.",
      natural:
        "After I exercise, I feel full of energy and sleep really well.",
      spoken: "Working out gives me energy, and I sleep really well after that.",
    };
  }

  return createGenericFallbackVariants(standard);
}

export function isEnglishRelevantToChinese(chinese: string, english: string) {
  const context = getConcertContext(chinese);
  const lowerEnglish = english.toLowerCase();

  if (
    context.hasConcert &&
    !requiredEnglishPatterns.concert.test(lowerEnglish)
  ) {
    return false;
  }

  if (
    context.hasCentralPark &&
    !requiredEnglishPatterns.centralPark.test(lowerEnglish)
  ) {
    return false;
  }

  if (
    context.hasTuesday &&
    !requiredEnglishPatterns.tuesday.test(lowerEnglish)
  ) {
    return false;
  }

  if (
    context.hasRelaxed &&
    !requiredEnglishPatterns.relaxed.test(lowerEnglish)
  ) {
    return false;
  }

  if (
    context.hasPast &&
    context.hasConcert &&
    /\b(?:i'm|i am|we're|we are)\s+(?:going|heading)|\bwill\b|\bgoing to\b/.test(
      lowerEnglish
    ) &&
    !/\b(?:went|attended|saw|listened|caught|felt|was|were|had)\b/.test(
      lowerEnglish
    )
  ) {
    return false;
  }

  return true;
}

export function shouldUseDeterministicFallback(chinese: string) {
  return concertPattern.test(normalizeChinese(chinese));
}
