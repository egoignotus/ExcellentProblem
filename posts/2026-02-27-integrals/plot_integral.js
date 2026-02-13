function initIntegralPlot() {
  var tMax = 10;
  createIntegralPlot({
    idPrefix:       '',
    tMin:           0,
    tMax:           tMax,
    f:              function(t) { return t; },
    F:              function(t) { return t * t / 2; },
    title:          'f(t) = t',
    integralLabel:  '∫ₐᵇ τ dτ',
    yRange:         [0, tMax],
    dtick:          2,
    hoverFmt:       ':.1f',
    defaultLower:   0,
    defaultUpper:   5
  });
}
