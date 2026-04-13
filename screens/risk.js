import { S, save } from '../state/index.js';
import { classify, extractRisks } from '../logic/classifier.js';
import { MATRIX } from '../state/matrix.js';
import { infoBtn, infoPop, toast } from '../components/index.js';

export function screen() {
  const sc = S.scope;
  return `<div style="max-width:760px;">

    <div style="margin-bottom:24px;">
      <h1 style="font-size:20px;font-weight:500;color:#0f172a;margin-bottom:3px;">Designated Services</h1>
      <p style="font-size:13px;color:#64748b;">AUSTRAC obligations only apply to firms providing designated services. This step determines whether your firm is in scope.</p>
    </div>

    <!-- INPUT CARD -->
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:14px;">
        <span style="font-size:13px;font-weight:500;color:#0f172a;">Describe your firm's services</span>
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
        <p class="mt-2 text-slate-400 border-t border-slate-600 pt-2">SimpleAML matches your description against the AUSTRAC Table 6 matrix and analyses which services are IN/OUT of scope. You then confirm the result before it is recorded.</p>
      `)}

      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#94a3b8;margin-bottom:12px;">
        <div style="font-weight:500;color:#64748b;margin-bottom:4px;">Examples:</div>
        <div>· "set up companies"</div>
        <div>· "financial statements preparation"</div>
        <div>· "providing registered office address"</div>
      </div>

      <div class="relative">
        <textarea id="classifier-input" class="inp text-sm" rows="5"
          placeholder="Describe what your firm does for clients — one service per line."
          oninput="onClassifierInput(this)"
        >${sc.classifierInput || ''}</textarea>
        <div id="classifier-suggestions" style="display:none;position:absolute;left:0;right:0;background:#fff;border:0.5px solid #e2e8f0;border-radius:10px;z-index:10;overflow:hidden;margin-top:4px;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
          <div style="padding:8px 12px;background:#f8fafc;border-bottom:0.5px solid #f1f5f9;font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;">
            Suggested services — click to use
          </div>
          <div id="classifier-suggestions-list" style="max-height:220px;overflow-y:auto;"></div>
        </div>
      </div>
      <div id="classifier-nudge" style="display:none;font-size:11px;color:#d97706;margin-top:6px;">
        Your description seems brief — the more detail you provide, the more accurate your result.
      </div>
      <div style="font-size:11px;color:#94a3b8;background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:6px;padding:8px 12px;margin-top:10px;">
        Tip: type a service and select from suggestions, or describe in your own words. One service per line gives the most accurate results.
      </div>
      <button onclick="runClassifier()" style="margin-top:12px;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">
        Analyse My Services →
      </button>
    </div>

    ${renderResults(sc)}
  </div>`;
}

const CLASSIFIER_VERSION = 3; // increment when classifier logic changes

function renderResults(sc) {
  if (!sc.classifierRan) return '';
  // If results are from an older classifier version, prompt re-analysis
  if ((sc.classifierVersion || 0) < CLASSIFIER_VERSION) {
    return `<div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:10px;padding:14px 16px;font-size:12px;color:#92400e;">
      Results need refreshing — the classifier has been updated since your last analysis.
      <button onclick="runClassifier()" style="margin-left:8px;font-size:12px;color:#92400e;font-weight:500;background:none;border:none;cursor:pointer;text-decoration:underline;">Re-analyse now →</button>
    </div>`;
  }
  const matched = sc.classifierMatched || [];
  const notDes = sc.classifierNotDesignated || [];

  const unrecognised = sc.classifierUnrecognised || [];
  const hasUnrecognised = unrecognised.length > 0;

  // STATE 1 — IN services found
  if (matched.length > 0) {
    return `
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:14px;">How AUSTRAC sees your firm</div>
        <div style="border:0.5px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:14px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:0.5px solid #e2e8f0;">
                <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;text-transform:uppercase;letter-spacing:.06em;">Task / Service</th>
                <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;width:180px;text-transform:uppercase;letter-spacing:.06em;">Table 6 Item</th>
                <th style="text-align:left;font-size:10px;font-weight:500;color:#94a3b8;padding:9px 14px;width:90px;text-transform:uppercase;letter-spacing:.06em;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${matched.map(r => `
              <tr style="border-bottom:0.5px solid #f1f5f9;">
                <td style="padding:10px 14px;font-size:12px;color:#0f172a;">${r.task}</td>
                <td style="padding:10px 14px;font-size:11px;color:#64748b;">${r.table6 || '—'}</td>
                <td style="padding:10px 14px;"><span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;background:#eef2ff;color:#4338ca;">In scope</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>

        ${notDes.length > 0 ? `
        <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
          <div style="font-size:10px;font-weight:500;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Also mentioned — not designated</div>
          ${notDes.map(r => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#64748b;margin-bottom:4px;"><span style="color:#16a34a;font-size:10px;">✓</span>${r.task}</div>`).join('')}
        </div>` : ''}

        ${hasUnrecognised ? `
        <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:500;color:#92400e;margin-bottom:8px;">Some lines were not recognised</div>
          ${unrecognised.map(line => `
          <div style="font-size:11px;color:#92400e;margin-bottom:4px;">"${line}" — we couldn't identify this service. Try selecting from the suggestions or remove it.</div>`).join('')}
          <div style="font-size:11px;color:#b45309;margin-top:6px;">Edit above, use the suggestions as you type, and re-analyse.</div>
        </div>` : ''}

        <div style="border-top:0.5px solid #f1f5f9;padding-top:14px;">
          ${hasUnrecognised ? `
          <div style="font-size:11px;color:#94a3b8;font-style:italic;">Resolve unrecognised lines above before confirming.</div>` : `
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
            <input type="checkbox" ${sc.classifierConfirmed ? 'checked' : ''} onchange="confirmClassifier(this.checked)" style="margin-top:2px;flex-shrink:0;">
            <span style="font-size:12px;color:#0f172a;line-height:1.6;">I confirm this list accurately reflects the designated services my firm provides.</span>
          </label>
          ${sc.classifierConfirmed ? '<div style="font-size:11px;color:#166534;margin-top:8px;">Confirmed — your designated services are recorded.</div>' : ''}`}
        </div>
        <p style="font-size:11px;color:#94a3b8;margin-top:10px;">Not quite right? Edit your description above and re-analyse — your confirmation will reset.</p>
      </div>
      ${renderMLTF(sc)}`;
  }

  // STATE 2 — OUT only
  if (notDes.length > 0) {
    return `
      <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
        <div style="background:#f0fdf4;border:0.5px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
          <div style="font-size:13px;font-weight:500;color:#166534;margin-bottom:6px;">Your services are outside AUSTRAC's designated service list</div>
          <p style="font-size:12px;color:#15803d;line-height:1.6;">The following services were identified — none are designated services under AUSTRAC Table 6. Your firm does not appear to have AML/CTF obligations for these activities.</p>
          <div style="margin-top:10px;">
            ${notDes.map(r => `<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#15803d;margin-bottom:4px;"><span style="font-size:10px;">✓</span>${r.task}</div>`).join('')}
          </div>
        </div>
        <p style="font-size:11px;color:#94a3b8;margin-bottom:14px;">This tool is provided for guidance only and is not legal advice.</p>

        ${hasUnrecognised ? `
        <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:12px 14px;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:500;color:#92400e;margin-bottom:8px;">Some lines were not recognised</div>
          ${unrecognised.map(line => `
          <div style="font-size:11px;color:#92400e;margin-bottom:4px;">"${line}" — we couldn't identify this service. Try selecting from the suggestions or remove it.</div>`).join('')}
          <div style="font-size:11px;color:#b45309;margin-top:6px;">Edit above, use the suggestions as you type, and re-analyse.</div>
        </div>` : ''}

        ${!hasUnrecognised ? `
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:10px;">
          <input type="checkbox" ${sc.noneConfirmed ? 'checked' : ''} onchange="toggleDsNone(this)">
          <span style="font-size:12px;color:#0f172a;">Confirm: my firm does not provide any designated services</span>
        </label>
        ${sc.noneConfirmed ? '<div style="font-size:11px;color:#166534;margin-bottom:10px;">Confirmed — recorded.</div>' : ''}` : ''}
        <a href="https://simpleaml.com.au" target="_blank" rel="noopener" style="display:block;text-align:center;font-size:12px;color:#94a3b8;padding:9px;border:0.5px solid #e2e8f0;border-radius:8px;text-decoration:none;">Exit to website ↗</a>
      </div>`;
  }

  // STATE 3 — nothing found
  return `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="background:#fffbeb;border:0.5px solid #fde68a;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:500;color:#92400e;margin-bottom:4px;">We could not match your description</div>
        <p style="font-size:12px;color:#b45309;line-height:1.6;">SimpleAML could not find your services in the AUSTRAC Table 6 matrix. This does not mean you are out of scope — try describing your services in more detail.</p>
      </div>
      <div style="background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:11px;color:#94a3b8;">
        <div style="font-weight:500;color:#64748b;margin-bottom:6px;">Try describing like this:</div>
        <div style="margin-bottom:2px;">· "set up companies and trusts"</div>
        <div style="margin-bottom:2px;">· "company secretary, process payroll"</div>
        <div style="margin-bottom:2px;">· "buy and sell businesses"</div>
        <div>· "hold client funds and pay suppliers"</div>
      </div>
    </div>`;
}

function renderMLTF(sc) {
  if (!sc.classifierConfirmed) return '';
  const risks = sc.classifierRisks || [];
  if (risks.length === 0) return '';
  return `
    <div style="background:#fff;border:0.5px solid #e2e8f0;border-radius:12px;padding:20px 22px;margin-bottom:14px;">
      <div style="font-size:13px;font-weight:500;color:#0f172a;margin-bottom:4px;">ML/TF risk patterns identified</div>
      <p style="font-size:12px;color:#64748b;margin-bottom:14px;">Based on the services you described, the following money laundering and terrorism financing risks may apply to your firm.</p>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
        ${risks.map(r => `
        <div style="border:0.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;">
          <div style="font-size:11px;font-weight:500;color:#4f46e5;margin-bottom:4px;">${r.label}</div>
          <p style="font-size:12px;color:#64748b;line-height:1.6;">${r.risk}</p>
        </div>`).join('')}
      </div>
      <div style="border-top:0.5px solid #f1f5f9;padding-top:14px;">
        <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin-bottom:10px;">
          <input type="checkbox" ${sc.mltfConfirmed ? 'checked' : ''} onchange="confirmMltf(this.checked)" style="margin-top:2px;flex-shrink:0;">
          <span style="font-size:12px;color:#0f172a;line-height:1.6;">I confirm I have considered these ML/TF risk patterns in the context of my firm's services.</span>
        </label>
        ${sc.mltfConfirmed ? `
        <div style="font-size:11px;color:#166534;margin-bottom:12px;">Confirmed — ML/TF risk assessment recorded.</div>
        <button onclick="go('servicerisk')" style="width:100%;font-size:13px;font-weight:500;color:#fff;background:#4f46e5;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;">
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
  const { matched, notDesignated, unrecognised, greyZone } = classify(input);
  S.scope.classifierInput = input;
  S.scope.classifierRan = true;
  S.scope.classifierConfirmed = false;
  S.scope.mltfConfirmed = false;
  S.scope.classifierMatched = matched;
  S.scope.classifierNotDesignated = notDesignated;
  S.scope.classifierUnrecognised = unrecognised;
  S.scope.classifierGreyZone = greyZone;
  S.scope.classifierRisks = extractRisks(matched);
  S.scope.classifierVersion = CLASSIFIER_VERSION;
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
  );

  // Deduplicate by row.id — multiple synonyms point to same row, show task once only
  const seen = new Set();
  const unique = matches.filter(m => {
    if (seen.has(m.row.id)) return false;
    seen.add(m.row.id); return true;
  }).slice(0, 8);

  if (!unique.length) {
    panel.style.display = 'none';
    return;
  }

  list.innerHTML = unique.map(m => `
    <div onclick="selectSuggestion('${m.row.task.replace(/'/g, "\\'")}', ${m.isIn})"
      style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;cursor:pointer;border-bottom:0.5px solid #f1f5f9;transition:background .1s;"
      onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
      <span style="font-size:12px;color:#0f172a;">${m.row.task}</span>
      <span style="font-size:10px;font-weight:500;padding:2px 8px;border-radius:99px;flex-shrink:0;margin-left:10px;background:${m.isIn ? '#fef2f2' : '#f0fdf4'};color:${m.isIn ? '#991b1b' : '#166534'};">
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
