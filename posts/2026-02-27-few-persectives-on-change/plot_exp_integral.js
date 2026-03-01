function initExpIntegralPlot() {
  var tMax = 5;
  createIntegralPlot({
    idPrefix:       'Exp',
    tMin:           0,
    tMax:           tMax,
    f:              function(t) { return Math.exp(t); },
    F:              function(t) { return Math.exp(t); },
    title:          'f(t) = exp(t)',
    integralLabel:  '∫ₐᵇ exp(τ) dτ',
    yRange:         [0, Math.exp(tMax) * 1.05],
    dtick:          1,
    hoverFmt:       ':.2f',
    step:           20,
    defaultLower:   0,
    defaultUpper:   2.5
  });
}
