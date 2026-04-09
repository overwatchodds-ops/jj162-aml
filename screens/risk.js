import { S, save } from '../state/index.js';
import { classify, extractRisks } from '../logic/classifier.js';
import { infoBtn, infoPop, toast } from '../components/index.js';

export function screen() {
  const sc = S.scope;

  return `<div class="py-8 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Designated Services Identification</h1>
      <p class="text-slate-400 text-sm mt-1">
        Describe what your firm does. SimpleAML will map it to AUSTRAC Table 6 automatically.
      </p>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-bold text-slate-700">Describe your firm's services</h2>
        ${infoBtn('ds-tip')}
      </div>

      ${infoPop('ds-tip', `
        <strong class="text-indigo-300 block mb-2">Why this matters</strong>
        AUSTRAC obligations start with identifying which Table 6 designated services
        your firm provides. This step is purely factual — not a risk assessment.
      `)}

      <textarea id="classifier-input" class="inp text-sm" rows="6"
        placeholder='e.g. "We set up companies and trusts, act as company secretary, process payroll, pay supplier invoices, and help clients buy and sell businesses."'
      >${sc.classifierInput || ''}</textarea>

      <button onclick="runClassifier()" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
        Analyse My Services →
      </button>
    </div>

    ${renderResults(sc)}
  </div>`;
}

function renderResults(sc) {
  if (!sc.classifierRan) return '';

  if (sc.classifierMatched?.length > 0) {
    return `
      <div class="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <h3 class="text-sm font-bold text-slate-700">How AUSTRAC sees your firm</h3>

        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="text-left px-4 py-3">Task / Service</th>
              <th class="text-left px-4 py-3 w-32">Table 6</th>
            </tr>
          </thead>
          <tbody>
            ${sc.classifierMatched.map(r => `
              <tr class="border-b border-slate-50 last:border-0">
                <td class="px-4 py-3">${r.task}</td>
                <td class="px-4 py-3 text-xs text-slate-500">${r.table6}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <label class="flex items-start gap-3 cursor-pointer pt-4 border-t">
          <input type="checkbox" ${sc.classifierConfirmed ? 'checked' : ''}
            onchange="confirmClassifier(this.checked)">
          <span class="text-sm text-slate-700">
            I confirm this accurately reflects the designated services my firm provides.
          </span>
        </label>

        ${renderMLTF(sc)}
      </div>
    `;
  }

  return `
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
      We could not confidently match your description to AUSTRAC Table 6.
      Try adding more detail.
    </div>
  `;
}

function renderMLTF(sc) {
  if (!sc.classifierConfirmed) return '';

  const risks = sc.classifierRisks || [];
  if (risks.length === 0) return '';

  return `
    <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <h3 class="text-sm font-bold text-slate-700">ML / TF risk patterns from your services</h3>

      ${risks.map(r => `
        <div class="border rounded-lg p-3 text-sm text-slate-600">
          <div class="font-semibold text-indigo-600 text-xs">${r.label}</div>
          ${r.risk}
        </div>
      `).join('')}

      <label class="flex items-start gap-3 cursor-pointer pt-2">
        <input type="checkbox" ${sc.mltfConfirmed ? 'checked' : ''}
          onchange="confirmMltf(this.checked)">
        <span class="text-sm text-slate-700">
          I acknowledge these ML/TF risks in the context of our services.
        </span>
      </label>
    </div>
  `;
}

/* ───────── ACTIONS ───────── */

window.runClassifier = function() {
  const input = document.getElementById('classifier-input').value.trim();
  if (!input) return toast('Describe your services first', 'err');

  const { matched } = classify(input);

  S.scope.classifierInput = input;
  S.scope.classifierRan = true;
  S.scope.classifierMatched = matched;
  S.scope.classifierConfirmed = false;
  S.scope.classifierRisks = extractRisks(matched);
  S.scope.mltfConfirmed = false;

  save(); location.reload();
};

window.confirmClassifier = function(val) {
  S.scope.classifierConfirmed = val;
  if (!val) S.scope.mltfConfirmed = false;
  save(); location.reload();
};

window.confirmMltf = function(val) {
  S.scope.mltfConfirmed = val;
  save();
};