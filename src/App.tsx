import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Types for button configuration
type ButtonType = 'number' | 'operator' | 'function' | 'action' | 'special' | 'top-control';

interface ButtonProps {
  label: string | JSX.Element;
  subLabel?: string | JSX.Element;
  type: ButtonType;
  onClick: () => void;
  className?: string;
  isSmall?: boolean;
}

const CalculatorButton = ({ label, subLabel, type, onClick, className = '', isSmall = false }: ButtonProps) => {
  const getColors = () => {
    switch (type) {
      case 'action': return 'bg-orange-500 text-white font-bold border-orange-700 active:bg-orange-600 shadow-[0_4px_0_rgb(194,65,12)]';
      case 'operator': return 'bg-neutral-800 text-neutral-100 font-bold border-neutral-900 active:bg-neutral-700 shadow-[0_4px_0_rgb(23,23,23)]';
      case 'function': return 'bg-[#1e1e1e] text-[#f1c40f] text-[10px] sm:text-xs pt-0.5 border-neutral-950 active:bg-neutral-900 shadow-[0_4px_0_rgb(10,10,10)]';
      case 'number': return 'bg-[#3d3d3d] text-white font-bold border-neutral-900 active:bg-neutral-800 shadow-[0_4px_0_rgb(23,23,23)]';
      case 'top-control': return 'bg-neutral-700 text-white border-neutral-800 shadow-md';
      default: return 'bg-neutral-800 text-white border-neutral-900';
    }
  };

  const getSubLabelStyle = (label?: string | JSX.Element) => {
    if (!label || typeof label !== 'string') return 'text-amber-400';
    // Red/Rose for ALPHA items and variables
    if (label.match(/^[ABCDEFXYM]/) || label.includes('sin⁻¹') || label.includes('cos⁻¹') || label.includes('tan⁻¹') || label.includes(':')) return 'text-rose-500 font-bold';
    // Green/Teal for System labels
    if (label.match(/^(MATRIX|VECTOR|VERIFY|STAT|CMPLX|BASE|CONST|CONV|CLR)/)) return 'text-emerald-400 font-bold';
    // Amber/Yellow for SHIFT items
    return 'text-amber-400 font-bold';
  };

  return (
    <div className="flex flex-col items-center gap-0 w-full">
      <div className="h-4 flex items-end justify-center w-full px-0.5 pb-[2px]">
        {subLabel && (
          <span className={`text-[7px] sm:text-[9px] font-extrabold uppercase tracking-tighter truncate leading-none ${getSubLabelStyle(subLabel)}`}>
            {subLabel}
          </span>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.96, y: 1 }}
        onClick={onClick}
        className={`btn-push btn-realistic btn-shadow w-full rounded-md sm:rounded-lg border-b-[3px] flex items-center justify-center relative overflow-hidden transition-all ${getColors()} ${className} ${isSmall ? 'h-7 sm:h-8' : 'h-10 sm:h-11'}`}
      >
        <div className="relative z-10">{label}</div>
        <div className="absolute inset-x-0 top-0 h-[0.5px] bg-white/10" />
      </motion.button>
    </div>
  );
};

export default function App() {
  const [display, setDisplay] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);

  useEffect(() => {
    // Initial display matches the user's image integral example
    setDisplay('∫(π,0)e^x sin(x)dx');
    setResult('12.07034632');
  }, []);

  const handleInput = (val: string, shiftVal?: string, alphaVal?: string) => {
    let finalVal = val;
    if (isShift && shiftVal) {
      finalVal = shiftVal;
      setIsShift(false);
    } else if (isAlpha && alphaVal) {
      finalVal = alphaVal;
      setIsAlpha(false);
    }

    if (result !== null) {
      if (['+', '-', '×', '÷'].includes(finalVal)) {
        setDisplay(result + finalVal);
      } else {
        setDisplay(finalVal);
      }
      setResult(null);
    } else {
      setDisplay(prev => prev + finalVal);
    }
  };

  const handleClear = () => {
    setDisplay('');
    setResult(null);
    setIsShift(false);
    setIsAlpha(false);
  };

  const handleDel = () => {
    if (result !== null) {
      setResult(null);
    } else {
      setDisplay(prev => prev.slice(0, -1));
    }
  };

  const calculate = () => {
    try {
      if (!display) return;
      let expression = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/Math.cbrt\(/g, 'Math.cbrt(')
        .replace(/\^/g, '**')
        .replace(/Ans/g, result || '0');
      
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      
      expression = expression
        .replace(/Math\.sin\(([^)]+)\)/g, (_, val) => `Math.sin((${val}) * Math.PI / 180)`)
        .replace(/Math\.cos\(([^)]+)\)/g, (_, val) => `Math.cos((${val}) * Math.PI / 180)`)
        .replace(/Math\.tan\(([^)]+)\)/g, (_, val) => `Math.tan((${val}) * Math.PI / 180)`);

      // Auto-closing brackets
      const openBracketsCount = (expression.match(/\(/g) || []).length;
      const closeBracketsCount = (expression.match(/\)/g) || []).length;
      for (let i = 0; i < openBracketsCount - closeBracketsCount; i++) expression += ')';

      const res = new Function(`return ${expression}`)();
      if (typeof res !== 'number' || !isFinite(res)) throw new Error();
      
      const formattedRes = String(Number(res).toFixed(10)).replace(/\.?0+$/, '');
      setResult(formattedRes);
    } catch (e) {
      setResult('Math ERROR');
    }
  };

  return (
    <div className="calc-container scale-[0.85] sm:scale-100">
      <div className="calc-side-wrap" />
      <div className="max-w-[360px] sm:max-w-[420px] w-full bg-calc-body p-4 sm:p-7 pt-5 rounded-[3rem] shadow-2xl flex flex-col gap-2 relative overflow-hidden border-t-2 border-white/10">
        {/* Subtle noise/texture */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none rounded-[2.5rem] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />

        {/* Top Header Branding & Solar Panel */}
        <div className="flex justify-between items-start px-1 relative z-10">
          <div className="flex flex-col">
            <h1 className="text-zinc-100 font-serif italic font-black text-2xl sm:text-3xl leading-none tracking-tight drop-shadow-md">Next-Gen(NS)</h1>
            <span className="text-[7px] sm:text-[9px] font-black text-zinc-400 uppercase tracking-[0.25em] mt-1">SCIENTIFIC CALCULATOR</span>
          </div>
          
          <div className="w-24 h-9 sm:w-32 sm:h-11 bg-neutral-900 rounded-sm border-2 border-neutral-400/50 shadow-inner flex overflow-hidden p-0.5 ml-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-1 border-r border-white/5 bg-gradient-to-br from-neutral-800 to-black last:border-0" />
            ))}
          </div>
        </div>

        {/* Display Screen */}
        <div className="mt-2 bg-calc-screen-bg screen-inset rounded-md p-3 h-32 sm:h-40 flex flex-col justify-between font-digital text-calc-screen-ink relative overflow-hidden border-[5px] border-neutral-400 z-10">
          <div className="flex justify-start gap-3 text-[10px] sm:text-[13px] font-sans opacity-95 font-bold mix-blend-multiply">
            <span className={`px-0.5 ${isShift ? 'bg-calc-screen-ink text-calc-screen-bg' : 'opacity-20'}`}>S</span>
            <span className={`px-0.5 ${isAlpha ? 'bg-calc-screen-ink text-calc-screen-bg' : 'opacity-20'}`}>A</span>
            <span className="opacity-20">CMPLX</span>
            <span className="bg-calc-screen-ink text-calc-screen-bg px-0.5">R</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] sm:text-xs">Math <ChevronUp size={10} strokeWidth={4} /></span>
          </div>

        <div className="flex flex-col items-end gap-0.5 mt-auto overflow-hidden">
            <div className="w-full text-xl sm:text-2xl text-left truncate leading-tight min-h-[1.2em] italic font-digital flex items-center">
              <span>{display || ''}</span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "steps(2)" }}
                className="w-[2px] h-[0.8em] bg-calc-screen-ink ml-0.5"
              />
            </div>
            <div className="text-5xl sm:text-7xl font-black leading-none mt-1 truncate max-w-full font-digital text-right w-full">
              {result !== null ? result : (display ? '' : '0')}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:3px_3px]" />
        </div>

        {/* Control Section (Shift, Alpha, Replay, Mode, ON) */}
        <div className="flex justify-between items-end px-1 gap-2 mt-2 relative z-20 h-24 sm:h-32 translate-y-1">
          {/* Left Buttons */}
          <div className="flex gap-2 items-end pb-1">
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[10px] font-black text-amber-400 uppercase mb-1 drop-shadow-sm">Shift</span>
              <button 
                onClick={() => { setIsShift(!isShift); setIsAlpha(false); }} 
                className={`w-10 h-6 sm:w-16 sm:h-9 rounded-full shadow-lg border-b-[3px] border-neutral-900 transition-all ${isShift ? 'bg-amber-400' : 'bg-neutral-600'} active:translate-y-1`} 
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[10px] font-black text-rose-500 uppercase mb-1 drop-shadow-sm">Alpha</span>
              <button 
                onClick={() => { setIsAlpha(!isAlpha); setIsShift(false); }} 
                className={`w-10 h-6 sm:w-16 sm:h-9 rounded-full shadow-lg border-b-[3px] border-neutral-900 transition-all ${isAlpha ? 'bg-rose-500' : 'bg-neutral-600'} active:translate-y-1`} 
              />
            </div>
          </div>

          {/* Center Replay Pad */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-30 translate-y-7">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-neutral-800 rounded-full shadow-2xl border-[3px] border-neutral-950 flex items-center justify-center ring-1 ring-white/5">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30 rounded-full" />
               <button className="absolute top-2 hover:bg-white/10 rounded-full p-0.5 active:scale-95"><ChevronUp size={22} strokeWidth={3} className="text-neutral-400" /></button>
               <button className="absolute bottom-2 hover:bg-white/10 rounded-full p-0.5 active:scale-95"><ChevronDown size={22} strokeWidth={3} className="text-neutral-400" /></button>
               <button className="absolute left-2 hover:bg-white/10 rounded-full p-0.5 active:scale-95"><ChevronLeft size={22} strokeWidth={3} className="text-neutral-400" /></button>
               <button className="absolute right-2 hover:bg-white/10 rounded-full p-0.5 active:scale-95"><ChevronRight size={22} strokeWidth={3} className="text-neutral-400" /></button>
               <div className="bg-neutral-900 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-500/80 italic tracking-widest shadow-inner select-none pointer-events-none uppercase">Replay</div>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex gap-2 items-end pb-1">
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[10px] font-black uppercase text-zinc-300 mb-1 leading-none text-center drop-shadow-sm">
                Mode <span className="text-amber-500 italic">Setup</span>
              </span>
              <button className="w-10 h-6 sm:w-16 sm:h-9 rounded-full bg-neutral-600 border-b-[3px] border-neutral-900 shadow-lg" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] sm:text-[10px] font-black uppercase text-zinc-300 mb-1 leading-none drop-shadow-sm">On</span>
              <button onClick={handleClear} className="w-10 h-6 sm:w-16 sm:h-9 rounded-full bg-neutral-600 border-b-[3px] border-neutral-900 shadow-lg" />
            </div>
          </div>
        </div>

        {/* Mathematical Function Buttons Grid */}
        <div className="grid grid-cols-6 gap-x-1.5 gap-y-0 mt-1 z-10">
          <CalculatorButton label="CALC" subLabel={<span>SOLVE <span className="text-rose-600">=</span></span>} type="function" onClick={() => {}} isSmall />
          <CalculatorButton label={<span>∫<sub>☐</sub><sup>☐</sup></span>} subLabel={<span>d/dx <span className="text-rose-600">:</span></span>} type="function" onClick={() => handleInput('∫(')} isSmall />
          <div className="col-span-2" />
          <CalculatorButton label={<span>x<sup>-1</sup></span>} subLabel="x!" type="function" onClick={() => handleInput('^-1', '!')} isSmall />
          <CalculatorButton label={<span>log<sub>☐</sub>■</span>} subLabel="Σ" type="function" onClick={() => handleInput('log(')} isSmall />

          <CalculatorButton label="□/□" subLabel={<span><sup>■</sup>√<sub>■</sub></span>} type="function" onClick={() => handleInput('/')} isSmall />
          <CalculatorButton label="√■" subLabel="³√" type="function" onClick={() => handleInput('√(', 'Math.cbrt(')} isSmall />
          <CalculatorButton label={<span>x<sup>2</sup></span>} subLabel="x³" type="function" onClick={() => handleInput('^2', '^3')} isSmall />
          <CalculatorButton label={<span>x<sup>■</sup></span>} subLabel={<span><sup>y</sup>√<sub>■</sub></span>} type="function" onClick={() => handleInput('^', 'root(')} isSmall />
          <CalculatorButton label="log" subLabel="10■" type="function" onClick={() => handleInput('log10(')} isSmall />
          <CalculatorButton label="ln" subLabel="e■" type="function" onClick={() => handleInput('ln(')} isSmall />

          <CalculatorButton label="(-)" subLabel={<span>∠ <span className="text-rose-600">A</span></span>} type="function" onClick={() => handleInput('-', '', 'A')} isSmall />
          <CalculatorButton label="°'\" subLabel={<span>← <span className="text-rose-600">B</span></span>} type="function" onClick={() => handleInput('°', '', 'B')} isSmall />
          <CalculatorButton label="hyp" subLabel={<span>Abs <span className="text-rose-600">C</span></span>} type="function" onClick={() => {}} isSmall />
          <CalculatorButton label="sin" subLabel={<span>sin⁻¹ <span className="text-rose-600">D</span></span>} type="function" onClick={() => handleInput('sin(', 'asin(', 'D')} isSmall />
          <CalculatorButton label="cos" subLabel={<span>cos⁻¹ <span className="text-rose-600">E</span></span>} type="function" onClick={() => handleInput('cos(', 'acos(', 'E')} isSmall />
          <CalculatorButton label="tan" subLabel={<span>tan⁻¹ <span className="text-rose-600">F</span></span>} type="function" onClick={() => handleInput('tan(', 'atan(', 'F')} isSmall />

          <CalculatorButton label="RCL" subLabel="STO" type="function" onClick={() => {}} isSmall />
          <CalculatorButton label="ENG" subLabel={<span>← <span className="text-rose-600">i</span></span>} type="function" onClick={() => {}} isSmall />
          <CalculatorButton label="(" subLabel={<span>% <span className="text-rose-600">X</span></span>} type="function" onClick={() => handleInput('(', '', 'X')} isSmall />
          <CalculatorButton label=")" subLabel={<span>, <span className="text-rose-600">Y</span></span>} type="function" onClick={() => handleInput(')', '', 'Y')} isSmall />
          <CalculatorButton label="S⇔D" subLabel={<span>a b/c <span className="text-rose-600">M</span></span>} type="function" onClick={() => {}} isSmall />
          <CalculatorButton label="M+" subLabel={<span>M- <span className="text-rose-600">M</span></span>} type="function" onClick={() => handleInput('+', '-', 'M')} isSmall />
        </div>

        {/* Main Keyboard Grid */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-0 mt-1 z-10 pb-2">
          {/* Row 1 */}
          <CalculatorButton label="7" subLabel="CONST" type="number" onClick={() => handleInput('7')} />
          <CalculatorButton label="8" subLabel="CONV" type="number" onClick={() => handleInput('8')} />
          <CalculatorButton label="9" subLabel="CLR" type="number" onClick={() => handleInput('9')} />
          <CalculatorButton label="DEL" subLabel="INS" type="action" onClick={handleDel} className="!text-xs sm:!text-base" />
          <CalculatorButton label="AC" subLabel="OFF" type="action" onClick={handleClear} className="!text-xs sm:!text-base" />

          {/* Row 2 */}
          <CalculatorButton label="4" subLabel="MATRIX" type="number" onClick={() => handleInput('4')} />
          <CalculatorButton label="5" subLabel="VECTOR" type="number" onClick={() => handleInput('5')} />
          <CalculatorButton label="6" subLabel="VERIFY" type="number" onClick={() => handleInput('6')} />
          <CalculatorButton label="×" subLabel="nPr" type="operator" onClick={() => handleInput('×')} />
          <CalculatorButton label="÷" subLabel="nCr" type="operator" onClick={() => handleInput('÷')} />

          {/* Row 3 */}
          <CalculatorButton label="1" subLabel="STAT" type="number" onClick={() => handleInput('1')} />
          <CalculatorButton label="2" subLabel="CMPLX" type="number" onClick={() => handleInput('2')} />
          <CalculatorButton label="3" subLabel="BASE" type="number" onClick={() => handleInput('3')} />
          <CalculatorButton label="+" subLabel="Pol" type="operator" onClick={() => handleInput('+')} />
          <CalculatorButton label="-" subLabel="Rec" type="operator" onClick={() => handleInput('-')} />

          {/* Row 4 */}
          <CalculatorButton label="0" subLabel="Rnd" type="number" onClick={() => handleInput('0')} />
          <CalculatorButton label="·" subLabel={<span>Ran# <span className="text-rose-600">RanInt</span></span>} type="number" onClick={() => handleInput('.')} />
          <CalculatorButton label={<span>×10<sup>x</sup></span>} subLabel={<span>π <span className="text-rose-600">e</span></span>} type="number" onClick={() => handleInput('*Math.pow(10,', 'π', 'e')} className="!text-[10px] sm:!text-sm" />
          <CalculatorButton label="Ans" subLabel="DRG▶" type="number" onClick={() => handleInput('Ans')} />
          <CalculatorButton label="=" subLabel="PreAns" type="operator" onClick={calculate} />
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-neutral-500/20 shadow-inner" />
        <div className="absolute bottom-6 right-6 w-2 h-2 rounded-full bg-neutral-500/20 shadow-inner" />
      </div>
    </div>
  );
}
