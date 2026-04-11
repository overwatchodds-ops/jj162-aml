import { S, save } from '../state/index.js';
import { classify, extractRisks } from '../logic/classifier.js';
import { MATRIX } from '../state/matrix.js';
import { infoBtn, infoPop, toast } from '../components/index.js';

export function screen() {
  const sc = S.scope;
  return `<div class="py-8 space-y-6">

    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Designated Services</h1>
        <p class="text-sm text-slate-400 mt-1">AUSTRAC obligations only apply to firms providing designated services. This step determines whether your firm is in scope and what your program must cover.</p>
      </div>
    </div>

    <!-- INPUT CARD -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Describe your firm's services</h2>
        ${infoBtn('ds-tip')}
      </div>
      ${infoPop('ds-tip', `
        <strong class="text-indigo-300 block mb-2">How to get an accurate result</strong>
        <p>Describe what your firm actually does for clients — not your job title. Include:</p>
        <ul class="mt-2 space-y-1">
          <li>· The types of entities you set up (companies, trusts, SMSFs)</li>
          <li>· Financial tasks you perform on behalf of clients (paying bills, payroll, bank accounts)</li>
          <li>· Transactions you help clients with (buying or selling businesses, property settlements)</li>
          <li>· Any governance roles you hold (company secretary, trustee, nominee director)</li>
        </ul>
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">SimpleAML matches your description against the AUSTRAC Table 6 matrix and returns only the services that apply to your firm. You then confirm the result before it is recorded.</p>
      `)}

      <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
        <div class="font-semibold text-slate-600 mb-1">Examples:</div>
        <div>· "We set up companies and trusts, act as company secretary, process payroll and pay supplier invoices"</div>
        <div>· "We help clients buy and sell businesses and assist with property settlements"</div>
        <div>· "We do bookkeeping, prepare tax returns and financial statements"</div>
      </div>

      <div class="relative">
        <textarea id="classifier-input" class="inp text-sm" rows="5"
          placeholder="Describe what your firm does for clients — one service per line works well..."
          oninput="onClassifierInput(this)"
        >${sc.classifierInput || ''}</textarea>
        <div id="classifier-suggestions" style="display:none;"
          class="absolute left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden mt-1">
          <div class="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Suggested services — click to use
          </div>
          <div id="classifier-suggestions-list" class="max-h-56 overflow-y-auto"></div>
        </div>
      </div>
      <div id="classifier-nudge" style="display:none" class="text-xs text-amber-600 font-medium">
        Your description seems brief — the more detail you provide, the more accurate your result.
      </div>
      <div class="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
        💡 <strong class="text-slate-600">Tip:</strong> Type a service and select from suggestions, or describe in your own words. One service per line gives the most accurate results.
      </div>
      <button onclick="runClassifier()" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
        Analyse My Services →
      </button>
    </div>

    ${renderResults(sc)}
  </div>`;
}

function renderResults(sc) {
  if (!sc.classifierRan) return '';
  const matched = sc.classifierMatched || [];
  const notDes = sc.classifierNotDesignated || [];

  const fuzzyPass = sc.classifierFuzzyPass || false;

  // STATE 1 — IN services found
  if (matched.length > 0) {
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h2 class="text-sm font-bold text-slate-700">How AUSTRAC sees your firm</h2>
        ${fuzzyPass ? `
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>Please verify:</strong> These results are based on partial keyword matching — your description didn't match our known service list exactly. Check the results carefully before confirming. For best accuracy, use the suggestions that appear as you type.
        </div>` : ''}
        <div class="border border-slate-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3">Task / Service</th>
                <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-48">Table 6 Item</th>
                <th class="text-left text-xs font-semibold text-slate-500 px-4 py-3 w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              ${matched.map(r => `
              <tr class="border-b border-slate-50 last:border-0">
                <td class="px-4 py-3 text-slate-700">${r.task}${r.fuzzy ? ' <span class="text-xs text-amber-500 font-normal">(unverified match)</span>' : ''}</td>
                <td class="px-4 py-3 text-xs text-slate-500">${r.table6 || '—'}</td>
                <td class="px-4 py-3"><span class="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${r.fuzzy ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}">✓ IN</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        ${notDes.length > 0 ? `
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div class="text-xs font-semibold text-slate-500 mb-1">Also mentioned — not designated services</div>
          ${notDes.map(r => `<div class="flex items-start gap-2 text-xs text-slate-500"><span class="text-green-500 flex-shrink-0">✓</span>${r.task}</div>`).join('')}
        </div>` : ''}

        <div class="border-t border-slate-100 pt-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" ${sc.classifierConfirmed ? 'checked' : ''} onchange="confirmClassifier(this.checked)" class="mt-0.5 flex-shrink-0">
            <span class="text-sm text-slate-700 leading-relaxed">I confirm this list accurately reflects the designated services my firm provides.</span>
          </label>
          ${sc.classifierConfirmed ? '<div class="text-xs text-green-600 font-medium mt-2">✓ Confirmed — your designated services are recorded.</div>' : ''}
        </div>
        <p class="text-xs text-slate-400">Not quite right? Edit your description above and re-analyse — your confirmation will reset.</p>
      </div>
      ${renderMLTF(sc)}`;
  }

  // STATE 2 — OUT only
  if (notDes.length > 0) {
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div class="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
          <div class="text-sm font-bold text-green-800">✓ Your services are outside AUSTRAC's designated service list</div>
          <p class="text-sm text-green-700 leading-relaxed">The following services were identified — none are designated services under AUSTRAC Table 6. Your firm does not appear to have AML/CTF obligations for these activities.</p>
          <div class="space-y-1.5">
            ${notDes.map(r => `<div class="flex items-start gap-2 text-sm text-green-700"><span class="flex-shrink-0">✓</span>${r.task}</div>`).join('')}
          </div>
        </div>
        <p class="text-xs text-slate-400">We recommend confirming this with CPA Australia, CA ANZ or IPA before concluding you are out of scope.</p>
        <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
          <input type="checkbox" ${sc.noneConfirmed ? 'checked' : ''} onchange="toggleDsNone(this)">
          <span>Confirm: my firm does not provide any designated services</span>
        </label>
        ${sc.noneConfirmed ? '<div class="text-xs text-green-700 font-semibold mt-1">✓ Confirmed and recorded.</div>' : ''}
      </div>`;
  }

  // STATE 3 — nothing found
  return `
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
        <div class="text-sm font-bold text-amber-800">⚠ We could not match your description</div>
        <p class="text-sm text-amber-700 leading-relaxed">SimpleAML could not find your services in the AUSTRAC Table 6 matrix. This does not mean you are out of scope — try describing your services in more detail.</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
        <div class="font-semibold text-slate-600 mb-1">Try describing your services like this:</div>
        <div>· "We set up companies and trusts for clients"</div>
        <div>· "We act as company secretary and process payroll payments"</div>
        <div>· "We help clients buy and sell businesses"</div>
        <div>· "We hold client funds and pay their suppliers"</div>
      </div>
    </div>`;
}

function renderMLTF(sc) {
  if (!sc.classifierConfirmed) return '';
  const risks = sc.classifierRisks || [];
  if (risks.length === 0) return '';
  return `
    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <div>
        <h2 class="text-sm font-bold text-slate-700">Identified ML/TF Risk Patterns arising from your services</h2>
        <p class="text-xs text-slate-400 mt-1">Based on the services you described, the following money laundering and terrorism financing risks may apply to your firm.</p>
      </div>
      <div class="space-y-3">
        ${risks.map(r => `
        <div class="border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div class="text-xs font-semibold text-indigo-600">${r.label}</div>
          <p class="text-sm text-slate-600 leading-relaxed">${r.risk}</p>
        </div>`).join('')}
      </div>
      <div class="border-t border-slate-100 pt-5 space-y-4">
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" ${sc.mltfConfirmed ? 'checked' : ''} onchange="confirmMltf(this.checked)" class="mt-0.5 flex-shrink-0">
          <span class="text-sm text-slate-700 leading-relaxed">I confirm I have considered these ML/TF risk patterns in the context of my firm's services.</span>
        </label>
        ${sc.mltfConfirmed ? `
        <div class="text-xs text-green-600 font-medium">✓ Confirmed — ML/TF risk assessment recorded.</div>
        <button onclick="go('servicerisk')" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition">
          Continue to Service Risk →
        </button>` : ''}
      </div>
    </div>`;
}

/* ─── ACTIONS ─────────────────────────────────────────────────────────────────*/
window.runClassifier = function() {
  const input = document.getElementById('classifier-input')?.value?.trim();
  if (!input) { toast('Describe your services first', 'err'); return; }
  const wordCount = input.split(/\s+/).filter(Boolean).length;
  const nudge = document.getElementById('classifier-nudge');
  if (nudge) nudge.style.display = wordCount < 10 ? 'block' : 'none';
  const { matched, notDesignated, greyZone, fuzzyPass } = classify(input);
  S.scope.classifierInput = input;
  S.scope.classifierRan = true;
  S.scope.classifierConfirmed = false;
  S.scope.mltfConfirmed = false;
  S.scope.classifierMatched = matched;
  S.scope.classifierNotDesignated = notDesignated;
  S.scope.classifierGreyZone = greyZone;
  S.scope.classifierRisks = extractRisks(matched);
  S.scope.classifierFuzzyPass = fuzzyPass || false;
  if (matched.length > 0) S.scope.noneConfirmed = false;
  save(); go('risk');
};

window.confirmClassifier = function(val) {
  S.scope.classifierConfirmed = val;
  if (!val) S.scope.mltfConfirmed = false;
  save(); go('risk');
};

window.confirmMltf = function(val) {
  S.scope.mltfConfirmed = val;
  save(); go('risk');
};

window.toggleDsNone = function(cb) {
  S.scope.noneConfirmed = cb.checked;
  if (cb.checked) { S.scope.classifierMatched = []; S.scope.classifierConfirmed = false; }
  save();
};

/* ─── SUGGESTIONS ─────────────────────────────────────────────────────────────*/
// Build a flat searchable list from matrix — task name + explicit synonyms
function buildSuggestionIndex() {
  const index = [];
  for (const row of MATRIX) {
    if (row.status.includes('GREY')) continue;
    const isIn = row.status === 'IN';
    // Add the task name itself
    index.push({ label: row.task, isIn, row });
    // Add explicit synonyms as alternative labels
    if (row.explicit) {
      for (const syn of row.synonyms) {
        if (syn.length > 5) {
          index.push({ label: syn, isIn, row });
        }
      }
    }
  }
  return index;
}

let _suggestionIndex = null;
function getSuggestionIndex() {
  if (!_suggestionIndex) _suggestionIndex = buildSuggestionIndex();
  return _suggestionIndex;
}

let _suggestionTimer = null;
window.onClassifierInput = function(el) {
  clearTimeout(_suggestionTimer);
  _suggestionTimer = setTimeout(function() {
    showSuggestions(el);
  }, 350);
};

function showSuggestions(el) {
  const panel = document.getElementById('classifier-suggestions');
  const list  = document.getElementById('classifier-suggestions-list');
  if (!panel || !list) return;

  // Get the current line being typed
  const val = el.value;
  const cursorPos = el.selectionStart;
  const textUpToCursor = val.substring(0, cursorPos);
  const lines = textUpToCursor.split('\n');
  const currentLine = lines[lines.length - 1].trim().toLowerCase();

  if (currentLine.length < 2) {
    panel.style.display = 'none';
    return;
  }

  const index = getSuggestionIndex();
  const matches = index.filter(item =>
    item.label.toLowerCase().includes(currentLine) ||
    currentLine.split(' ').some(word => word.length > 2 && item.label.toLowerCase().includes(word))
  ).slice(0, 8);

  // Deduplicate by label
  const seen = new Set();
  const unique = matches.filter(m => {
    if (seen.has(m.label)) return false;
    seen.add(m.label); return true;
  });

  if (!unique.length) {
    panel.style.display = 'none';
    return;
  }

  list.innerHTML = unique.map(m => `
    <div onclick="selectSuggestion('${m.row.task.replace(/'/g, "\\'")}', ${m.isIn})"
      class="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition">
      <span class="text-sm text-slate-700">${m.row.task}</span>
      <span class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${m.isIn ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
        ${m.isIn ? 'Designated' : 'Not designated'}
      </span>
    </div>`).join('');

  panel.style.display = 'block';
}

window.selectSuggestion = function(taskName, isIn) {
  const el = document.getElementById('classifier-input');
  const panel = document.getElementById('classifier-suggestions');
  if (!el || !panel) return;

  // Replace the current (last) line with the selected suggestion
  const lines = el.value.split('\n');
  lines[lines.length - 1] = taskName;
  el.value = lines.join('\n');

  panel.style.display = 'none';
  el.focus();
};

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
  const panel = document.getElementById('classifier-suggestions');
  const input = document.getElementById('classifier-input');
  if (panel && input && !panel.contains(e.target) && e.target !== input) {
    panel.style.display = 'none';
  }
});
