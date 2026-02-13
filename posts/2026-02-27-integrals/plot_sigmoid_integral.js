function initSigmoidIntegralPlot() {
  createIntegralPlot({
    idPrefix:       'Sigmoid',
    tMin:           -5,
    tMax:           5,
    f:              function(t) { return 1 / (1 + Math.exp(-t)); },
    F:              function(t) { return Math.log(1 + Math.exp(t)); },
    title:          'f(t) = 1/(1+e⁻ᵗ)',
    integralLabel:  '∫ₐᵇ σ(τ) dτ',
    yRange:         [0, 1.1],
    dtick:          2,
    hoverFmt:       ':.3f',
    defaultLower:   -2,
    defaultUpper:   2
  });
}
