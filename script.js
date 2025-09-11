// UnitConverterPro — robust conversion script
(function () {
  'use strict';

  const DEBUG = location.search.includes('debug=1');

  function log(...args){ if(DEBUG) console.log('[UCP]', ...args); }
  function warn(...args){ console.warn('[UCP]', ...args); }
  function err(...args){ console.error('[UCP]', ...args); }

  // ---------------------------
  // Registry (units & factors)
  // ---------------------------
  const REG = {
    length: { m:1, cm:0.01, mm:0.001, km:1000, in:0.0254, ft:0.3048, yd:0.9144, mi:1609.344 },
    weight: { kg:1, g:0.001, mg:0.000001, lb:0.45359237, oz:0.028349523125 },
    volume: { L:1, mL:0.001, cup:0.2365882365, tbsp:0.01478676478125, floz:0.0295735295625, gal:3.785411784 },
    speed: { mps:1, kmh:1000/3600, mph:1609.344/3600, knot:1852/3600 },
    data: { B:1, KB:1e3, MB:1e6, GB:1e9, KiB:1024, MiB:1024**2, GiB:1024**3 },
    time: { s:1, min:60, hr:3600, d:86400 },
    cooking: { tsp:0.00492892159375, tbsp:0.01478676478125, cup:0.2365882365, mL:0.001, L:1 },
    temp: { C:'C', F:'F', K:'K' }
  };

  // ---------------------------
  // Utilities
  // ---------------------------
  function safeNumber(v){
    if (v === '' || v === null || v === undefined) return NaN;
    // allow commas
    const n = Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : NaN;
  }
  function formatNum(n){
    if (!isFinite(n)) return '';
    return (Math.round((n + Number.EPSILON) * 1000000) / 1000000).toString();
  }

  // ---------------------------
  // Temperature conversions
  // ---------------------------
  function convertTemp(val, from, to){
    if (from === to) return val;
    let C;
    if (from === 'C') C = val;
    else if (from === 'F') C = (val - 32) * 5/9;
    else if (from === 'K') C = val - 273.15;
    else return NaN;
    if (to === 'C') return C;
    if (to === 'F') return (C * 9/5) + 32;
    if (to === 'K') return C + 273.15;
    return NaN;
  }

  // ---------------------------
  // Linear convert via registry
  // ---------------------------
  function convertLinear(cat, val, from, to){
    if (!REG[cat]) return NaN;
    if (from === to) return val;
    const reg = REG[cat];
    if (!reg[from] || !reg[to]) return NaN;
    const toBase = val * reg[from]; // to base unit
    return toBase / reg[to];
  }

  // ---------------------------
  // Currency (safe fetch + cache)
  // ---------------------------
  const FX_ENDPOINT = 'https://api.exchangerate.host/latest';
  const FX_CACHE_KEY = 'ucp_fx_cache_v1';

  async function fetchRates(base = 'USD'){
    // try local cache
    try {
      const raw = localStorage.getItem(FX_CACHE_KEY);
      if (raw){
        const parsed = JSON.parse(raw);
        // use cached if < 12 hours
        if (parsed && parsed.ts && (Date.now() - parsed.ts) < (12 * 3600 * 1000)){
          log('Using cached FX rates');
          return parsed.data;
        }
      }
    } catch(e){ log('FX cache read error', e); }

    try {
      const res = await fetch(`${FX_ENDPOINT}?base=${encodeURIComponent(base)}`);
      if (!res.ok) throw new Error('FX fetch failed: ' + res.status);
      const data = await res.json();
      localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      return data;
    } catch (e) {
      warn('FX fetch error:', e);
      // fallback: return cached if any
      try {
        const raw = localStorage.getItem(FX_CACHE_KEY);
        if (raw) return JSON.parse(raw).data;
      } catch(e){}
      return null;
    }
  }

  async function convertCurrency(val, from, to){
    if (from === to) return val;
    const fx = await fetchRates(from === 'USD' ? 'USD' : 'USD'); // exchangerate.host supports base param
    if (!fx || !fx.rates) return NaN;
    // convert via base (fx.base)
    const base = fx.base || 'USD';
    let inBase;
    if (from === base) inBase = val;
    else inBase = val / (fx.rates[from] || 1);
    if (to === base) return inBase;
    return inBase * (fx.rates[to] || 1);
  }

  // ---------------------------
  // Convert value wrapper
  // ---------------------------
  async function convertValue(cat, val, from, to){
    if (val === '' || isNaN(val)) return NaN;
    val = Number(val);
    if (cat === 'temp') return convertTemp(val, from, to);
    if (cat === 'currency') return await convertCurrency(val, from, to);
    return convertLinear(cat, val, from, to);
  }

  // ---------------------------
  // Form wiring (generic .converter-form)
  // ---------------------------
  function populateUnits(selectEl, units){
    if (!selectEl) return;
    // if already has options keep them
    if (selectEl.options && selectEl.options.length > 0) return;
    units.forEach(u=>{
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      selectEl.appendChild(opt);
    });
  }

  async function wireGenericConverters(){
    const forms = document.querySelectorAll('.converter-form');
    if (!forms || forms.length === 0) { log('No .converter-form found'); return; }

    forms.forEach(form=>{
      try {
        const cat = form.dataset.cat || form.getAttribute('data-cat') || 'length';
        const from = form.querySelector('.from-unit');
        const to = form.querySelector('.to-unit');
        const val = form.querySelector('.value');
        let out = form.querySelector('.result');
        if (!out){
          out = document.createElement('div');
          out.className = 'result';
          out.style.marginTop = '8px';
          form.appendChild(out);
        }

        // choose units list
        let units = [];
        if (cat === 'temp') units = ['C','F','K'];
        else if (cat === 'currency') units = ['USD','EUR','INR','GBP','JPY','AUD','CAD'];
        else if (REG[cat]) units = Object.keys(REG[cat]);
        else units = ['1','2'];

        if (from) populateUnits(from, units);
        if (to) populateUnits(to, units);

        const run = async ()=>{
          try {
            const v = safeNumber(val ? val.value : '');
            if (isNaN(v)) { out.textContent = ''; return; }
            const result = await convertValue(cat, v, (from ? from.value : ''), (to ? to.value : ''));
            out.textContent = (isNaN(result) ? '—' : formatNum(result)) + (to ? ' ' + to.value : '');
          } catch (e) {
            warn('Conversion failed for form', e);
            out.textContent = 'Error';
          }
        };

        // wire events
        if (form.querySelector('button[type="submit"]') || form.querySelector('button')) {
          const btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
          btn.addEventListener('click', e=>{ e.preventDefault(); run(); });
        }
        if (val) val.addEventListener('input', debounce(run, 250));
        if (from) from.addEventListener('change', run);
        if (to) to.addEventListener('change', run);
      } catch (e){ warn('Error wiring form', e); }
    });
  }

  // ---------------------------
  // Legacy ID-based wiring (for pages using explicit IDs)
  // Attempt to wire common pages like lengthInput, weightInput, tempInput...
  // ---------------------------
  function wireLegacyIDs(){
    // map: prefix => {cat, inputId, fromId, toId, outId, fnName}
    const configs = [
      {cat:'length', input:'lengthInput', from:'lengthFrom', to:'lengthTo', out:'lengthResult', fn: 'convertLength'},
      {cat:'weight', input:'weightInput', from:'weightFrom', to:'weightTo', out:'weightResult', fn:'convertWeight'},
      {cat:'temp', input:'tempInput', from:'tempFrom', to:'tempTo', out:'tempResult', fn:'convertTempPage'},
      {cat:'volume', input:'volumeInput', from:'volumeFrom', to:'volumeTo', out:'volumeResult', fn:'convertVolume'},
      {cat:'speed', input:'speedInput', from:'speedFrom', to:'speedTo', out:'speedResult', fn:'convertSpeed'},
      {cat:'data', input:'dataInput', from:'dataFrom', to:'dataTo', out:'dataResult', fn:'convertData'},
      {cat:'time', input:'timeInput', from:'timeFrom', to:'timeTo', out:'timeResult', fn:'convertTime'},
      {cat:'cooking', input:'cookInput', from:'cookFrom', to:'cookTo', out:'cookResult', fn:'convertCooking'}
    ];

    configs.forEach(cfg=>{
      try {
        const inp = document.getElementById(cfg.input);
        const fr = document.getElementById(cfg.from);
        const to = document.getElementById(cfg.to);
        const out = document.getElementById(cfg.out);
        if (!inp && !fr && !to) return; // page not present
        // populate missing selects
        const units = (cfg.cat === 'temp') ? ['C','F','K'] : Object.keys(REG[cfg.cat] || {});
        if (fr && fr.options.length === 0) populateUnits(fr, units);
        if (to && to.options.length === 0) populateUnits(to, units);

        const run = async ()=>{
          try {
            const v = safeNumber(inp ? inp.value : '');
            if (isNaN(v)) { if (out) out.textContent = ''; return; }
            const result = await convertValue(cfg.cat, v, (fr ? fr.value : ''), (to ? to.value : ''));
            if (out) out.textContent = (isNaN(result) ? '—' : formatNum(result)) + (to ? ' ' + to.value : '');
          } catch(e){ warn('Legacy convert error', e); if (out) out.textContent = 'Error'; }
        };
        // attach events
        const btn = document.querySelector(`#${cfg.input} ~ button, #${cfg.input}-btn`);
        if (btn) btn.addEventListener('click', run);
        if (inp) inp.addEventListener('input', debounce(run, 250));
        if (fr) fr.addEventListener('change', run);
        if (to) to.addEventListener('change', run);
      } catch(e){ warn('legacy wiring failed', e); }
    });
  }

  // ---------------------------
  // BMI & EMI wiring (detect either by IDs or by data-tool)
  // ---------------------------
  function wireBMIandEMI(){
    // BMI
    const bmiForm = document.querySelector('.bmi-form') || document.getElementById('bmiForm');
    if (bmiForm){
      const wEl = bmiForm.querySelector('#bmiWeight') || bmiForm.querySelector('.bmi-weight') || document.getElementById('bmiWeight');
      const hEl = bmiForm.querySelector('#bmiHeight') || bmiForm.querySelector('.bmi-height') || document.getElementById('bmiHeight');
      const out = bmiForm.querySelector('.bmi-result') || document.getElementById('bmiResult');
      const btn = bmiForm.querySelector('button') || bmiForm.querySelector('.bmi-calc-btn');
      if (btn){
        btn.addEventListener('click', e=>{
          e.preventDefault();
          try {
            const weight = safeNumber(wEl ? wEl.value : '');
            const heightCm = safeNumber(hEl ? hEl.value : '');
            if (isNaN(weight) || isNaN(heightCm) || heightCm === 0){ if(out) out.textContent = 'Enter valid numbers'; return; }
            const height = heightCm / 100;
            const bmi = weight / (height * height);
            let status = '';
            if (bmi < 18.5) status = 'Underweight';
            else if (bmi < 24.9) status = 'Normal';
            else if (bmi < 29.9) status = 'Overweight';
            else status = 'Obese';
            if (out) out.textContent = 'BMI: ' + formatNum(bmi) + ' (' + status + ')';
          } catch(e){ warn('BMI error', e); if(out) out.textContent = 'Error'; }
        });
      }
    }

    // EMI
    const emiForm = document.querySelector('.emi-form') || document.getElementById('emiForm');
    if (emiForm){
      const pEl = emiForm.querySelector('#emiPrincipal') || document.getElementById('emiPrincipal');
      const rEl = emiForm.querySelector('#emiRate') || document.getElementById('emiRate');
      const nEl = emiForm.querySelector('#emiMonths') || document.getElementById('emiMonths');
      const out = emiForm.querySelector('.emi-result') || document.getElementById('emiResult');
      const btn = emiForm.querySelector('button') || emiForm.querySelector('.emi-calc-btn');
      if (btn){
        btn.addEventListener('click', e=>{
          e.preventDefault();
          try {
            const P = safeNumber(pEl ? pEl.value : '');
            const rate = safeNumber(rEl ? rEl.value : '');
            const n = safeNumber(nEl ? nEl.value : '');
            if (isNaN(P) || isNaN(rate) || isNaN(n) || n <= 0){ if(out) out.textContent = 'Enter valid numbers'; return; }
            const r = rate / 100 / 12;
            const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            if (out) out.textContent = 'EMI: ' + formatNum(emi);
          } catch(e){ warn('EMI error', e); if(out) out.textContent = 'Error'; }
        });
      }
    }
  }

  // ---------------------------
  // Debounce
  // ---------------------------
  function debounce(fn, wait){
    let t;
    return function(...args){ clearTimeout(t); t = setTimeout(()=> fn.apply(this, args), wait); };
  }

  // ---------------------------
  // Error overlay (visible on page)
  // ---------------------------
  function createErrorOverlay(){
    if (document.getElementById('ucp-error-overlay')) return;
    const div = document.createElement('div');
    div.id = 'ucp-error-overlay';
    div.style.position = 'fixed';
    div.style.right = '18px';
    div.style.bottom = '18px';
    div.style.maxWidth = '320px';
    div.style.padding = '10px 12px';
    div.style.borderRadius = '10px';
    div.style.background = 'rgba(220,38,38,0.95)';
    div.style.color = '#fff';
    div.style.fontSize = '13px';
    div.style.zIndex = 999999;
    div.style.display = 'none';
    document.body.appendChild(div);
    window.UCP_showError = function(msg){
      div.textContent = 'UCP Error: ' + (msg && msg.message ? msg.message : String(msg || 'Unknown'));
      div.style.display = 'block';
      setTimeout(()=>{ div.style.display = 'none'; }, 8000);
    };
  }

  // global uncaught errors
  window.addEventListener('error', function(ev){
    try {
      createErrorOverlay();
      window.UCP_showError(ev.error || ev.message || 'Script error');
      err('Global error:', ev.error || ev.message);
    } catch(e){}
  });
  window.addEventListener('unhandledrejection', function(ev){
    try {
      createErrorOverlay();
      window.UCP_showError(ev.reason || 'Promise rejection');
      err('Unhandled rejection:', ev.reason);
    } catch(e){}
  });

  // ---------------------------
  // Init
  // ---------------------------
  async function initAll(){
    try {
      createErrorOverlay();
      log('Init converters');
      // generic forms first
      await wireGenericConverters();
      wireLegacyIDs();
      wireBMIandEMI();
      log('Init complete');
      window.UnitConverterProLoaded = true;
    } catch (e) {
      err('Init failed', e);
      createErrorOverlay();
      window.UCP_showError(e);
    }
  }

  // run on DOM ready
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
