// Info button — small indigo (i) button that toggles a tooltip by id
export function infoBtn(id) {
  return `<button type="button" onclick="var t=document.getElementById('${id}');t.style.display=t.style.display==='block'?'none':'block'" class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] font-bold cursor-pointer flex-shrink-0 hover:bg-indigo-600">i</button>`;
}

// Info popover — dark tooltip panel hidden by default, toggled by infoBtn
export function infoPop(id, content) {
  return `<div id="${id}" style="display:none" class="bg-slate-800 text-slate-200 rounded-xl p-4 text-xs leading-relaxed mt-2">${content}</div>`;
}
