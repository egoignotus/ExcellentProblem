(function () {
  'use strict';

  /* ── Inject styles once ─────────────────────────────────────────────── */
  var s = document.getElementById('tail-end-style') || document.createElement('style');
  s.id = 'tail-end-style';
  s.textContent = [
      '.tail-end-grid {',
      '  display: grid;',
      '  gap: 4px;',
      '  width: fit-content;',
      '}',
      '.tail-cell {',
      '  position: relative;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  width: min(52px, 12vw);',
      '  height: min(52px, 12vw);',
      '}',
      '.cell-emoji {',
      '  font-size: min(2rem, 9vw);',
      '  line-height: 1;',
      '  user-select: none;',
      '}',
      '.cell-emoji.is-wide {',
      '  font-size: min(1.3rem, 6vw);',
      '  letter-spacing: -0.08em;',
      '}',
      '.cell-emoji.is-past {',
      '  opacity: 0.18;',
      '  filter: grayscale(50%);',
      '}',
      '.cell-cross {',
      '  position: absolute;',
      '  inset: 0;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-size: min(1.1rem, 4.8vw);',
      '  font-weight: 700;',
      '  pointer-events: none;',
      '}'
    ].join('\n');
  if (!s.parentNode) {
    document.head.appendChild(s);
  }

  /* ── Event catalogue ─────────────────────────────────────────────────
     perYear < 1 = occurs every (1/perYear) years                        */
  var EVENTS = {
    /* Annual ----------------------------------------------------------- */
    summer:         { name: 'Summers',                       singular: 'Summer',                       emoji: '\u2600\uFE0F', perYear: 1    },
    christmas:      { name: 'Christmases',                   singular: 'Christmas',                    emoji: '\uD83C\uDF84', perYear: 1    },
    birthday:       { name: 'Birthdays',                     singular: 'Birthday',                     emoji: '\uD83C\uDF82', perYear: 1    },
    dentistcheckup: { name: 'Dentist check-ups',             singular: 'Dentist check-up',             emoji: '\uD83E\uDDB7', perYear: 1    },
    meetingfriends: { name: 'Meetings with friends',         singular: 'Meeting with friends',         emoji: '\uD83D\uDC69', perYear: 4    },
    readingbooks:   { name: 'Books read',                    singular: 'Book',                         emoji: '\uD83D\uDCD6', perYear: 6    },
    fullmoon:       { name: 'Full moons',                    singular: 'Full moon',                    emoji: '\uD83C\uDF15', perYear: 12   },
    enjoyablemeal:  { name: 'Enjoyable meals',               singular: 'Enjoyable meal',               emoji: '\uD83C\uDF5B', perYear: 26   },
    /* Rare (every 5-12 years) ------------------------------------------ */
    elections:         { name: 'Elections',                   singular: 'Election',                     emoji: '\uD83D\uDDF3', perYear: 0.2    },
    passportexchange:  { name: 'Passport Exchanges',          singular: 'Passport Exchange',            emoji: '\uD83D\uDEC2', perYear: 0.1    },
    stockmarketcrash:  { name: 'Stock Market Crashes',         singular: 'Stock Market Crash',           emoji: '\uD83D\uDCC9', perYear: 0.0833 },
    isotopicexchange:  { name: 'Isotopic Exchanges',          singular: 'Isotopic Exchange',            emoji: '\u269B', perYear: 0.142857 },
    mortgagepayment:   { name: 'Mortgage-free Years',        singular: 'Mortgage-free Year',           emoji: '\uD83C\uDFE0', perYear: 1 },
    childbirthdays: { name: "Your Child's Birthdays",      singular: "Child's Birthday",            emoji: '\uD83D\uDC76', perYear: 1 },
    careeranniversary: { name: 'Career Anniversaries',       singular: 'Career Anniversary',           emoji: '\uD83D\uDCBC', perYear: 1 },
    /* Right cut-off (limited by older person's lifespan) --------------- */
    yearswithparents: { name: 'Years with parents',          singular: 'Year with parents',            emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', perYear: 1 },
    yearswithspouse:  { name: 'Years with spouse',           singular: 'Year with spouse',             emoji: '\uD83D\uDC9E', perYear: 1 },
    yearswithmentors: { name: 'Years with mentors',          singular: 'Year with mentors',            emoji: '\uD83C\uDF93', perYear: 1 }
  };

  /* ── Factory ─────────────────────────────────────────────────────────
     Returns an object { init(), update() } scoped to one set of DOM IDs.
     cfg: { gridId, summaryId, ageId, lifespanId, eventId }              */
  window.TailEnd = window.TailEnd || {};
  window.TailEnd.EVENTS    = EVENTS;
  window.TailEnd._instances = window.TailEnd._instances || {};

  window.TailEnd.create = function (cfg) {

    // Strict integer parser: only digit strings are accepted.
    function toSafeInt(rawValue, fallback, minValue, maxValue) {
      var text = String(rawValue == null ? '' : rawValue).trim();
      if (!/^\d+$/.test(text)) return fallback;
      var value = Number(text);
      if (!Number.isFinite(value) || !Number.isInteger(value)) return fallback;
      if (value < minValue) return minValue;
      if (value > maxValue) return maxValue;
      return value;
    }

    function createEventIcon(ev, isPast) {
      var emojiSpan = document.createElement('span');
      var isWide = ev.emoji.length > 2;
      emojiSpan.className = 'cell-emoji' + (isWide ? ' is-wide' : '') + (isPast ? ' is-past' : '');
      emojiSpan.textContent = ev.emoji;
      return emojiSpan;
    }

    function getInputs() {
      var age      = toSafeInt(document.getElementById(cfg.ageId).value, 0, 0, 120);
      var lifespan = toSafeInt(document.getElementById(cfg.lifespanId).value, 90, 1, 120);
      var eventKey = document.getElementById(cfg.eventId).value;
      var cutoffAge = 0;
      var frequencyPerYear = null;
      var frequencyYears = null;
      var mateAge = null;
      var mateLifespan = null;
      if (cfg.cutoffId) {
        cutoffAge = toSafeInt(document.getElementById(cfg.cutoffId).value, 0, 0, 120);
      }
      if (cfg.frequencyId) {
        frequencyPerYear = toSafeInt(document.getElementById(cfg.frequencyId).value, 1, 1, 365);
      }
      if (cfg.frequencyYearsId) {
        frequencyYears = toSafeInt(document.getElementById(cfg.frequencyYearsId).value, 1, 1, 100);
      }
      if (cfg.mateAgeId) {
        mateAge = toSafeInt(document.getElementById(cfg.mateAgeId).value, 0, 0, 120);
      }
      if (cfg.mateLifespanId) {
        mateLifespan = toSafeInt(document.getElementById(cfg.mateLifespanId).value, 85, 1, 120);
      }
      var metAge = null;
      if (cfg.metAgeId) {
        metAge = toSafeInt(document.getElementById(cfg.metAgeId).value, 0, 0, 120);
      }
      if (age > lifespan)                  age      = lifespan;
      if (cutoffAge > lifespan) cutoffAge = lifespan;
      return {
        age: age,
        lifespan: lifespan,
        cutoffAge: cutoffAge,
        frequencyPerYear: frequencyPerYear,
        frequencyYears: frequencyYears,
        mateAge: mateAge,
        mateLifespan: mateLifespan,
        metAge: metAge,
        eventKey: eventKey
      };
    }

    function buildGrid(inp) {
      var age = inp.age, lifespan = inp.lifespan, cutoffAge = inp.cutoffAge;
      var frequencyPerYear = inp.frequencyPerYear, frequencyYears = inp.frequencyYears;
      var eventKey = inp.eventKey;
      var ev    = EVENTS[eventKey] || EVENTS.summer;
      var total, past, left;
      var isRightCutoff = inp.mateAge !== null && inp.mateLifespan !== null;

      if (isRightCutoff) {
        /* Right cut-off: limited by older person's remaining life */
        var mateRemaining = Math.max(0, inp.mateLifespan - inp.mateAge);
        var yourRemaining = Math.max(0, lifespan - age);
        var ageGap = inp.mateAge - age;
        /* Your age when mate dies */
        var yourAgeAtMateDeath = Math.min(inp.mateLifespan - ageGap, lifespan);
        total = Math.max(0, yourAgeAtMateDeath);
        past  = Math.min(age, total);
        left  = Math.max(0, total - past);
      } else if (frequencyYears !== null) {
        var activeYears = Math.max(0, lifespan - cutoffAge);
        var elapsedYears = Math.max(0, age - cutoffAge);
        total = Math.max(0, Math.floor(activeYears / frequencyYears));
        past  = Math.max(0, Math.floor(elapsedYears / frequencyYears));
        past  = Math.min(past, total);
        left  = total - past;
      } else {
        var activeYears = Math.max(0, lifespan - cutoffAge);
        var elapsedYears = Math.max(0, age - cutoffAge);
        var perYear = frequencyPerYear == null ? ev.perYear : frequencyPerYear;
        total = Math.max(0, Math.round(activeYears * perYear));
        past  = Math.min(Math.round(elapsedYears * perYear), total);
        left  = total - past;
      }

      /* Summary line */
      var summaryEl = document.getElementById(cfg.summaryId);
      if (summaryEl) {
        var color = (window.INFERNO && window.INFERNO.roles) ? window.INFERNO.roles.lineA : '#932667';
        if (!/^#[0-9a-fA-F]{6}$/.test(color)) color = '#932667';
        var summaryText;
        if (isRightCutoff) {
          var metAgeVal = inp.metAge != null ? inp.metAge : 0;
          var togetherTotal = Math.max(0, total - metAgeVal);
          var togetherRemaining = Math.max(0, total - Math.max(past, metAgeVal));
          var notMetYet = metAgeVal > 0 && past < metAgeVal;
          summaryText =
            '<span style="color:' + color + '">' + togetherRemaining + '</span>' +
            ' ' + ev.name + ' remaining out of ' +
            '<span style="color:' + color + '">' + togetherTotal + '</span>' + ' together' +
            (metAgeVal > 0 ? ' (met at age ' + metAgeVal + ')' : '') + '.' +
            (notMetYet ? ' Not met yet.' : '');
        } else {
          var notStarted = cutoffAge > 0 && age < cutoffAge;
          var freqText = '';
          if (frequencyYears !== null) {
            freqText = ' once every ' + frequencyYears + ' year' + (frequencyYears > 1 ? 's' : '') + '.';
          } else if (frequencyPerYear !== null) {
            freqText = ' at ' + frequencyPerYear + '/year.';
          } else {
            freqText = '.';
          }
          var noteText = notStarted
            ? ' Not started yet \u2014 starts at age ' + cutoffAge + '.'
            : '';
          summaryText =
            '<span style="color:' + color + '">' + left + '</span>' +
            ' ' + ev.name + ' remaining out of ' +
            '<span style="color:' + color + '">' + total + '</span>' + ' total' +
              (cutoffAge > 0 && !notStarted ? ' (from age ' + cutoffAge + ')' : '') +
              freqText + noteText;
        }
        summaryEl.innerHTML = summaryText;
      }

      /* Grid */
      var grid = document.getElementById(cfg.gridId);
      if (!grid) return;
      grid.innerHTML = '';
      grid.className = 'tail-end-grid';

      var containerWidth = grid.parentElement ? grid.parentElement.offsetWidth : window.innerWidth;
      var cellSize = Math.min(52, window.innerWidth * 0.12);
      var maxCols = Math.floor(containerWidth / (cellSize + 4));
      var cols = Math.min(10, Math.max(1, total), maxCols);
      grid.style.gridTemplateColumns = 'repeat(' + cols + ', min(52px, 12vw))';

      var gridMetAge = isRightCutoff && inp.metAge != null ? inp.metAge : 0;

      for (var i = 0; i < total; i++) {
        var isPreMet = isRightCutoff && i < gridMetAge;
        var isPast = !isPreMet && i < past;

        var cell = document.createElement('div');
        cell.className = 'tail-cell';
        cell.title     = ev.singular + ' #' + (i + 1) + ' of ' + total +
                         (isPast ? ' \u2014 past' : isPreMet ? ' \u2014 before you met' : ' \u2014 ahead');

        cell.appendChild(createEventIcon(ev, isPast || isPreMet));

        if (isPast) {
          var crossSpan = document.createElement('span');
          crossSpan.className   = 'cell-cross';
          crossSpan.style.color = (window.INFERNO && window.INFERNO.roles)
            ? window.INFERNO.roles.lineA : '#932667';
          crossSpan.textContent = '\u2715';
          cell.appendChild(crossSpan);
        }

        grid.appendChild(cell);
      }
    }

    var listenersAttached = false;

    var instance = {
      init: function () {
        var inp = getInputs();
        buildGrid(inp);

        if (!listenersAttached) {
          listenersAttached = true;
          [cfg.ageId, cfg.lifespanId, cfg.cutoffId, cfg.frequencyId, cfg.frequencyYearsId, cfg.mateAgeId, cfg.mateLifespanId, cfg.metAgeId].forEach(function (id) {
            if (!id) return;
            var el = document.getElementById(id);
            if (el) el.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') instance.update();
            });
          });
          var sel = document.getElementById(cfg.eventId);
          if (sel) sel.addEventListener('change', function () {
            if (cfg.frequencyId) {
              var freqInput = document.getElementById(cfg.frequencyId);
              var selected = sel.options[sel.selectedIndex];
              if (freqInput && selected && selected.dataset.defaultFrequency) {
                freqInput.value = selected.dataset.defaultFrequency;
              }
            }
            if (cfg.frequencyYearsId) {
              var freqYearsInput = document.getElementById(cfg.frequencyYearsId);
              var selected = sel.options[sel.selectedIndex];
              if (freqYearsInput && selected && selected.dataset.defaultFrequency) {
                freqYearsInput.value = selected.dataset.defaultFrequency;
              }
            }
            instance.update();
          });
        }
      },
      update: function () {
        var inp = getInputs();
        buildGrid(inp);
      }
    };

    return instance;
  };

}());
