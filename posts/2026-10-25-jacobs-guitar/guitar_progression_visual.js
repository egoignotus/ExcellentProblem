(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  var ROOTS = [
    { name: "G", pitch: 7 },
    { name: "A", pitch: 9 },
    { name: "F", pitch: 5 }
  ];
  var QUALITIES = [
    { id: "sus2", label: "sus2", suffix: "sus2", intervals: [0, 2, 7] },
    { id: "minor", label: "minor", suffix: "m", intervals: [0, 3, 7] },
    { id: "major", label: "major", suffix: "", intervals: [0, 4, 7] },
    { id: "sus5", label: "sus5", suffix: "sus5", intervals: [0, 5, 7] },
    { id: "sept", label: "sept", suffix: "7", intervals: [0, 4, 7, 10] }
  ];
  var MAX_FRET = 7;
  var INSTRUMENTS = [
    {
      id: "progression-classical-guitar-fretboard",
      tuning: [40, 45, 50, 55, 59, 64]
    },
    {
      id: "progression-five-string-guitar-fretboard",
      tuning: [38, 45, 52, 57, 62]
    }
  ];

  var activeRoot = ROOTS[0];
  var activeQuality = QUALITIES[0];
  var activePitch = null;
  var colors;

  function svgElement(name, attributes, text) {
    var node = document.createElementNS(NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, attributes[key]);
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pitchClass(midi) {
    return ((midi % 12) + 12) % 12;
  }

  function scientificPitch(midi) {
    return NOTE_NAMES[pitchClass(midi)] + (Math.floor(midi / 12) - 1);
  }

  function activeChord() {
    return {
      name: activeRoot.name + activeQuality.suffix,
      root: activeRoot.pitch,
      intervals: activeQuality.intervals
    };
  }

  function chordPitchClasses(chord) {
    return chord.intervals.map(function (interval) {
      return pitchClass(chord.root + interval);
    });
  }

  function findVoicing(chord, instrument) {
    var chordNotes = chordPitchClasses(chord);
    var choices = instrument.tuning.map(function (openNote) {
      var frets = [-1];
      for (var fret = 0; fret <= MAX_FRET; fret += 1) {
        if (chordNotes.indexOf(pitchClass(openNote + fret)) !== -1) frets.push(fret);
      }
      return frets;
    });
    var best = null;

    function visit(stringIndex, shape) {
      if (stringIndex === choices.length) {
        var sounded = shape.filter(function (fret) { return fret >= 0; });
        if (sounded.length < 3) return;

        var present = {};
        var bassPitch = null;
        shape.forEach(function (fret, index) {
          if (fret < 0) return;
          var pc = pitchClass(instrument.tuning[index] + fret);
          present[pc] = true;
          if (bassPitch === null) bassPitch = pc;
        });
        if (!chordNotes.every(function (pc) { return present[pc]; })) return;

        var fingered = sounded.filter(function (fret) { return fret > 0; });
        var minFret = fingered.length ? Math.min.apply(null, fingered) : 0;
        var maxFret = fingered.length ? Math.max.apply(null, fingered) : 0;
        var span = maxFret - minFret;
        if (span > 4) return;

        var muted = shape.length - sounded.length;
        var open = sounded.filter(function (fret) { return fret === 0; }).length;
        var score = muted * 3 + span * 2 + maxFret * 0.35 -
          open * 1.25 + (bassPitch === chord.root ? 0 : 4);
        if (!best || score < best.score) {
          best = { shape: shape.slice(), score: score };
        }
        return;
      }

      choices[stringIndex].forEach(function (fret) {
        shape.push(fret);
        visit(stringIndex + 1, shape);
        shape.pop();
      });
    }

    visit(0, []);
    return best ? best.shape : choices.map(function (frets) { return frets[0]; });
  }

  function setTheme(root) {
    root.style.background = colors.panelBg;
    root.querySelectorAll(".guitar-fretboard-panel").forEach(function (panel) {
      panel.style.borderColor = colors.fillBorderA;
    });
    root.querySelectorAll(".guitar-tuning, .guitar-comparison-hint").forEach(function (node) {
      node.style.color = colors.annotation;
    });
  }

  function styleToggle(button, selected) {
    button.setAttribute("aria-pressed", selected ? "true" : "false");
    button.style.color = selected ? "white" : colors.lineA;
    button.style.background = selected ? colors.lineA : "transparent";
  }

  function makeControlButton(label, selected, onClick) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "guitar-chord-button";
    button.textContent = label;
    button.style.borderColor = colors.lineA;
    styleToggle(button, selected);
    button.addEventListener("click", onClick);
    return button;
  }

  function renderControls(root) {
    var controls = root.querySelector(".guitar-chord-controls");
    controls.replaceChildren();

    [
      {
        label: "Progression",
        values: ROOTS,
        active: function (value) { return value === activeRoot; },
        select: function (value) { activeRoot = value; }
      },
      {
        label: "Chord",
        values: QUALITIES,
        active: function (value) { return value === activeQuality; },
        select: function (value) { activeQuality = value; }
      }
    ].forEach(function (groupConfig) {
      var group = document.createElement("div");
      group.className = "guitar-control-group";
      var label = document.createElement("span");
      label.className = "guitar-control-label";
      label.textContent = groupConfig.label;
      group.appendChild(label);

      groupConfig.values.forEach(function (value) {
        group.appendChild(makeControlButton(
          value.label || value.name,
          groupConfig.active(value),
          function () {
            groupConfig.select(value);
            activePitch = null;
            renderControls(root);
            drawAll(root);
          }
        ));
      });
      controls.appendChild(group);
    });
  }

  function drawFretboard(instrument, chord) {
    var svg = document.getElementById(instrument.id);
    var stringCount = instrument.tuning.length;
    var shape = findVoicing(chord, instrument);
    var width = 720;
    var left = 118;
    var right = 16;
    var top = 35;
    var boardHeight = 220;
    var rowGap = boardHeight / (stringCount - 1);
    var height = top + boardHeight + 44;
    var fretWidth = (width - left - right) / (MAX_FRET + 0.55);
    var openX = left - 42;

    svg.replaceChildren();
    svg.setAttribute("viewBox", "0 0 " + width + " " + height);

    for (var fret = 0; fret <= MAX_FRET; fret += 1) {
      var x = fret === 0 ? left : left + (fret - 0.45) * fretWidth;
      svg.appendChild(svgElement("line", {
        x1: x,
        y1: top,
        x2: x,
        y2: top + boardHeight,
        stroke: colors.annotation,
        "stroke-width": fret === 0 ? 7 : 1.5,
        opacity: fret === 0 ? 1 : 0.55
      }));
      svg.appendChild(svgElement("text", {
        x: fret === 0 ? openX : left + (fret - 0.95) * fretWidth,
        y: 20,
        fill: colors.annotation,
        "font-size": 19,
        "font-weight": 700,
        "text-anchor": "middle"
      }, fret === 0 ? "open" : String(fret)));
    }

    instrument.tuning.forEach(function (openNote, stringIndex) {
      var y = top + stringIndex * rowGap;
      svg.appendChild(svgElement("line", {
        x1: left,
        y1: y,
        x2: width - right,
        y2: y,
        stroke: colors.annotation,
        "stroke-width": 1 + (stringCount - stringIndex) * 0.35,
        opacity: 0.72
      }));
      svg.appendChild(svgElement("text", {
        x: 29,
        y: y + 7,
        fill: colors.annotation,
        "font-size": 22,
        "font-weight": 700,
        "text-anchor": "middle"
      }, scientificPitch(openNote)));

      for (var fret = 0; fret <= MAX_FRET; fret += 1) {
        var pc = pitchClass(openNote + fret);
        if (activePitch !== pc) continue;
        var highlightX = fret === 0 ? openX : left + (fret - 0.95) * fretWidth;
        svg.appendChild(svgElement("circle", {
          cx: highlightX,
          cy: y,
          r: 17,
          fill: colors.fillB,
          stroke: colors.lineB,
          "stroke-width": 2
        }));
      }

      if (shape[stringIndex] < 0) {
        svg.appendChild(svgElement("text", {
          x: openX,
          y: y + 8,
          fill: colors.lineB,
          "font-size": 26,
          "font-weight": 700,
          "text-anchor": "middle"
        }, "×"));
        return;
      }

      var playedFret = shape[stringIndex];
      var playedPitch = pitchClass(openNote + playedFret);
      var markerX = playedFret === 0 ? openX : left + (playedFret - 0.95) * fretWidth;
      var group = svgElement("g", {
        class: "guitar-note",
        role: "button",
        tabindex: "0",
        "aria-label": NOTE_NAMES[playedPitch] + " on string " + (stringIndex + 1)
      });
      group.appendChild(svgElement("circle", {
        class: "guitar-note-ring",
        cx: markerX,
        cy: y,
        r: 19,
        fill: playedPitch === activePitch ? colors.lineB : colors.lineA,
        stroke: playedPitch === activePitch ? colors.markerLower : colors.markerUpper,
        "stroke-width": 2
      }));
      group.appendChild(svgElement("text", {
        x: markerX,
        y: y + 6,
        fill: "white",
        "font-size": 17,
        "font-weight": 700,
        "text-anchor": "middle",
        "pointer-events": "none"
      }, NOTE_NAMES[playedPitch]));
      group.addEventListener("click", function () {
        activePitch = activePitch === playedPitch ? null : playedPitch;
        drawAll(document.getElementById("guitar-progression"));
      });
      group.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          group.dispatchEvent(new MouseEvent("click"));
        }
      });
      svg.appendChild(group);
    });
  }

  function drawAll(root) {
    var chord = activeChord();
    INSTRUMENTS.forEach(function (instrument) {
      drawFretboard(instrument, chord);
    });
    var status = root.querySelector(".guitar-comparison-status");
    if (activePitch === null) {
      status.textContent = "G → A → F progression · " + chord.name +
        " selected · colored circles show one playable voicing";
    } else {
      status.textContent = NOTE_NAMES[activePitch] + " highlighted across both " +
        chord.name + " voicings";
    }
  }

  window.initGuitarProgression = function () {
    var root = document.getElementById("guitar-progression");
    if (!root || !window.INFERNO) return;
    colors = window.INFERNO.roles;
    setTheme(root);
    renderControls(root);
    drawAll(root);
  };
})();
