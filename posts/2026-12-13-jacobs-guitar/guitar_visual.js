(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var NOTE_NAMES = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  var ROOTS = [
    { name: "C", pitch: 0 },
    { name: "D", pitch: 2 },
    { name: "E", pitch: 4 },
    { name: "F", pitch: 5 },
    { name: "G", pitch: 7 },
    { name: "A", pitch: 9 },
    { name: "B", pitch: 11 }
  ];
  var EXPANDED_ROOTS = [ROOTS[1], ROOTS[2], ROOTS[4], ROOTS[0]];
  var QUALITIES = [
    { id: "major", label: "major", suffix: "", intervals: [0, 4, 7] },
    { id: "minor", label: "minor", suffix: "m", intervals: [0, 3, 7] },
    { id: "7", label: "7", suffix: "7", intervals: [0, 4, 7, 10] },
    { id: "maj7", label: "maj7", suffix: "maj7", intervals: [0, 4, 7, 11] },
    { id: "m7", label: "m7", suffix: "m7", intervals: [0, 3, 7, 10] },
    { id: "9", label: "9", suffix: "9", intervals: [0, 4, 7, 10, 14] },
    { id: "7sharp9", label: "7♯9", suffix: "7♯9", intervals: [0, 4, 7, 10, 15] },
    { id: "add9", label: "add9", suffix: "add9", intervals: [0, 4, 7, 14] },
    { id: "sus2", label: "sus2", suffix: "sus2", intervals: [0, 2, 7] },
    { id: "sus4", label: "sus4", suffix: "sus4", intervals: [0, 5, 7] },
    { id: "dim", label: "dim", suffix: "dim", intervals: [0, 3, 6] },
    { id: "aug", label: "aug", suffix: "aug", intervals: [0, 4, 8] }
  ];
  var MAX_FRET = 7;
  var BASIC_CHORDS = [
    { name: "C", root: 0, intervals: [0, 4, 7] },
    { name: "Cm", root: 0, intervals: [0, 3, 7] },
    { name: "D", root: 2, intervals: [0, 4, 7] },
    { name: "Dm", root: 2, intervals: [0, 3, 7] },
    { name: "E", root: 4, intervals: [0, 4, 7] },
    { name: "Em", root: 4, intervals: [0, 3, 7] },
    { name: "F", root: 5, intervals: [0, 4, 7] },
    { name: "Fm", root: 5, intervals: [0, 3, 7] },
    { name: "G", root: 7, intervals: [0, 4, 7] },
    { name: "Gm", root: 7, intervals: [0, 3, 7] },
    { name: "A", root: 9, intervals: [0, 4, 7] },
    { name: "Am", root: 9, intervals: [0, 3, 7] },
    { name: "B", root: 11, intervals: [0, 4, 7] },
    { name: "Bm", root: 11, intervals: [0, 3, 7] }
  ];
  var CLASSICAL_SHAPES = {
    C: [-1, 3, 2, 0, 1, 0],
    Cm: [-1, 3, 5, 5, 4, 3],
    D: [-1, -1, 0, 2, 3, 2],
    Dm: [-1, -1, 0, 2, 3, 1],
    E: [0, 2, 2, 1, 0, 0],
    Em: [0, 2, 2, 0, 0, 0],
    F: [1, 3, 3, 2, 1, 1],
    Fm: [1, 3, 3, 1, 1, 1],
    G: [3, 2, 0, 0, 0, 3],
    Gm: [3, 5, 5, 3, 3, 3],
    A: [-1, 0, 2, 2, 2, 0],
    Am: [-1, 0, 2, 2, 1, 0],
    B: [-1, 2, 4, 4, 4, 2],
    Bm: [-1, 2, 4, 4, 3, 2]
  };
  var INSTRUMENTS = [
    {
      id: "classical-guitar-fretboard",
      tuning: [40, 45, 50, 55, 59, 64],
      shapeFor: function (chord) {
        return CLASSICAL_SHAPES[chord.name] || findVoicing(chord, this);
      }
    },
    {
      id: "five-string-guitar-fretboard",
      tuning: [38, 45, 52, 57, 62],
      shapeFor: function (chord) { return findVoicing(chord, this); }
    }
  ];

  var activeChord = BASIC_CHORDS[0];
  var activeMode = "basic";
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

  function buildExpandedChord() {
    return {
      name: activeRoot.name + activeQuality.suffix,
      root: activeRoot.pitch,
      intervals: activeQuality.intervals
    };
  }

  function renderChordControls(root) {
    var controls = root.querySelector(".guitar-chord-controls");
    controls.replaceChildren();

    if (activeMode === "basic") {
      [
        { label: "Major", qualityIndex: 0 },
        { label: "Minor", qualityIndex: 1 }
      ].forEach(function (row) {
        var group = document.createElement("div");
        group.className = "guitar-control-group";
        var label = document.createElement("span");
        label.className = "guitar-control-label";
        label.textContent = row.label;
        group.appendChild(label);
        BASIC_CHORDS.filter(function (chord) {
          return chord.intervals[1] === QUALITIES[row.qualityIndex].intervals[1];
        }).forEach(function (chord) {
          group.appendChild(makeControlButton(chord.name, chord.name === activeChord.name, function () {
            activeChord = chord;
            activeRoot = ROOTS.find(function (root) { return root.pitch === chord.root; });
            activeQuality = QUALITIES[row.qualityIndex];
            activePitch = null;
            renderChordControls(root);
            drawAll(root);
          }));
        });
        controls.appendChild(group);
      });
      return;
    }

    [
      { label: "Root", values: EXPANDED_ROOTS, active: function (value) { return value === activeRoot; } },
      { label: "Type", values: QUALITIES, active: function (value) { return value === activeQuality; } }
    ].forEach(function (groupConfig, groupIndex) {
      var group = document.createElement("div");
      group.className = "guitar-control-group";
      var label = document.createElement("span");
      label.className = "guitar-control-label";
      label.textContent = groupConfig.label;
      group.appendChild(label);
      groupConfig.values.forEach(function (value) {
        group.appendChild(makeControlButton(value.label || value.name, groupConfig.active(value), function () {
          if (groupIndex === 0) {
            activeRoot = value;
          } else {
            activeQuality = value;
          }
          activeChord = buildExpandedChord();
          activePitch = null;
          renderChordControls(root);
          drawAll(root);
        }));
      });
      controls.appendChild(group);
    });
  }

  function createModeControls(root) {
    var controls = root.querySelector(".guitar-mode-controls");
    [
      { id: "basic", label: "Basic" },
      { id: "expanded", label: "Expanded" }
    ].forEach(function (mode) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "guitar-mode-button";
      button.textContent = mode.label;
      button.style.borderColor = colors.lineA;
      styleToggle(button, mode.id === activeMode);
      button.addEventListener("click", function () {
        activeMode = mode.id;
        if (activeMode === "expanded" && EXPANDED_ROOTS.indexOf(activeRoot) === -1) {
          activeRoot = EXPANDED_ROOTS[0];
        }
        activeChord = activeMode === "basic" ?
          BASIC_CHORDS.find(function (chord) {
            return chord.root === activeRoot.pitch &&
              chord.intervals[1] === activeQuality.intervals[1];
          }) || BASIC_CHORDS[0] :
          buildExpandedChord();
        activePitch = null;
        controls.querySelectorAll("button").forEach(function (candidate) {
          styleToggle(candidate, candidate === button);
        });
        renderChordControls(root);
        drawAll(root);
      });
      controls.appendChild(button);
    });
  }

  function drawFretboard(instrument) {
    var svg = document.getElementById(instrument.id);
    var stringCount = instrument.tuning.length;
    var shape = instrument.shapeFor(activeChord);
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
        drawAll(document.getElementById("guitar-comparison"));
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
    INSTRUMENTS.forEach(drawFretboard);
    var status = root.querySelector(".guitar-comparison-status");
    if (activePitch === null) {
      status.textContent = activeChord.name + " chord · colored circles show one playable voicing";
    } else {
      status.textContent = NOTE_NAMES[activePitch] + " highlighted across both " + activeChord.name + " voicings";
    }
  }

  window.initGuitarComparison = function () {
    var root = document.getElementById("guitar-comparison");
    if (!root || !window.INFERNO) return;
    colors = window.INFERNO.roles;
    setTheme(root);
    createModeControls(root);
    renderChordControls(root);
    drawAll(root);
  };
})();
