Look-up table of useful constants. Some values have several names, like TAUOVER4 and PIOVER2. You can use either, but I recommend using the TAU versions because they make more intuitive sense compared to the PI versions. The PI versions are just there for legacy reasons. 

Example usage: 
```
var fus = luma.SQRT2OVER2;
var ro = luma.TAU > luma.PI ? true : false;
var dah = luma.TAUOVER4 == luma.PIOVER4 ? true : false;
```

## Numeric Constants
Name | Value | Symbol | Alt. Value | Meaning
- | - | - | - | - 
E | 2.718281828459 | \begin{align}e\end{align} | | Euler's number
PHI | 1.6180339887498 | \begin{align}\phi\end{align} | | Golden ratio
SQRT2 | 1.4142135623731 | \begin{align}\sqrt{2}\end{align} | | 
SQRT2OVER2 | 0.7071067811865 | \begin{align}\frac{\sqrt{2}}{2}\end{align} | \begin{align}sin(45°), cos(45°), \frac{1}{\sqrt{2}}\end{align} | 
SQRT3 | 1.7320508075689 | \begin{align}\sqrt{3}\end{align} | \begin{align}tan(60°)\end{align} | 
SQRT3OVER2 | 0.8660254037844 | \begin{align}\frac{\sqrt{3}}{2}\end{align} | \begin{align}cos(30°), sin(60°)\end{align} | | 
SQRT3OVER3 | 0.57735026919 | \begin{align}\frac{\sqrt{3}}{3}\end{align} | \begin{align}tan(30°), \frac{1}{\sqrt{3}}\end{align}
LN2 | 0.6931471805599 | \begin{align}ln(2)\end{align} | \begin{align}log_e(2)\end{align} | 
LN3 | 1.0986122886681 | \begin{align}ln(3)\end{align} | \begin{align}log_e(3)\end{align} | 

## Trigonometric Constants
Name | Value | Symbol | Alt. Value | Meaning
- | - | - | - | -
DEG2RAD | 0.0174532925199 | | \begin{align}\frac{\pi}{180}\end{align} | Multiply to convert from degrees to radians
RAD2DEG | 57.2957795130823 | | \begin{align}\frac{180}{\pi}\end{align} | Multiply to convert from radians to degrees
TAU | 6.2831853071796 | \begin{align}\tau\end{align} | \begin{align}2\pi\end{align} | One turn around circle
TAUOVER2, PI | 3.1415926535898 | \begin{align}\frac{1}{2}\tau\end{align} | \begin{align}\pi\end{align} | Half turn around circle
TAUOVER4, PIOVER2 | 1.5707963267949 | \begin{align}\frac{1}{4}\tau\end{align} | \begin{align}\frac{1}{2}\pi\end{align} | Quarter turn around circle
TAUOVER6, PIOVER3 | 1.0471975511966 | \begin{align}\frac{1}{6}\tau\end{align} | \begin{align}\frac{1}{3}\pi\end{align} | Sixth turn around circle
TAUOVER8, PIOVER4 | 0.7853981633974 | \begin{align}\frac{1}{8}\tau\end{align} | \begin{align}\frac{1}{4}\pi\end{align} | Eigth turn around circle
TAUOVER12, PIOVER6 | 0.5235987755983 | \begin{align}\frac{1}{12}\tau\end{align} | \begin{align}\frac{1}{6}\pi\end{align} | Twelvth turn arount circle

## Indices of Refraction
Name | Material | Value 
- | - | - 
iof_vacuum | Vacuum | 1.00000
iof_air | Air | 1.00029
iof_water | Water | 1.330
iof_oliveOil | Olive Oil | 1.47
iof_silicon | Silicon | 3.45
iof_humanCornea | Human Cornea | 1.38466666667
iof_humanLens | Human Lens | 1.406
iof_ice | Ice | 1.31
iof_glassLight | Light Glass | 1.44
iof_glassWindow | Window Glass | 1.52
iof_glassFlint | Flint Glass | 1.77
iof_glassHeavy | Heavy Glass | 1.90
iof_opal | Opal | 1.445
iof_obsidian | Obsidian | 1.5
iof_moonstone | Moonstone | 1.522
iof_sunstone | Sunstone | 1.5365
iof_amethyst | Amethyst | 1.5485
iof_citrine | Citrine | 1.5485
iof_amber | Amber | 1.55
iof_emerald | Emerald | 1.5835
iof_pearl | Pearl | 1.605
iof_topaz | Topaz | 1.626
iof_turquoise | Turquoise | 1.63
iof_jet | Jet | 1.66
iof_jade | Jade | 1.67
iof_sapphire | Sapphire | 1.77
iof_ruby | Ruby | 1.77
iof_malachite | Malachite | 1.782
iof_azurite | Azurite | 1.784
iof_diamond | Diamond | 2.42