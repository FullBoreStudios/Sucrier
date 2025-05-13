export function renderTemplate(template, context) {
  try {
    template = renderLoops(template, context);
    template = renderIfs(template, context);
    template = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      const value = resolveKey(context, key);
      if (value === undefined) {
        console.warn(`[template] Missing key: {{ ${key} }}`);
      }
      return value ?? '';
    });
    return template;
  } catch (e) {
    console.error("Template rendering error:", e.message);
    return `<pre style="color: red;">Template Error: ${e.message}</pre>`;
  }
}

function renderLoops(template, context) {
  return template.replace(
    /{%\s*for\s+(\w+)\s+in\s+([\w.]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (_, loopVar, iterableKey, block) => {
      const iterable = resolveKey(context, iterableKey);
      if (!Array.isArray(iterable)) {
        console.warn(`[renderLoops] "${iterableKey}" is not iterable`, iterable);
        return '';
      }
      return iterable.map(item => {
        const localCtx = { ...context, [loopVar]: item };
        return renderTemplate(block, localCtx);
      }).join('');
    }
  );
}

function renderIfs(template, context) {
  return template.replace(
    /{%\s*if\s+(.+?)\s*%}([\s\S]*?){%\s*else\s*%}([\s\S]*?){%\s*endif\s*%}|{%\s*if\s+(.+?)\s*%}([\s\S]*?){%\s*endif\s*%}/g,
    (_, cond1, ifTrue, ifFalse, cond2, onlyBlock) => {
      const condition = cond1 || cond2;
      const result = evaluateCondition(condition.trim(), context);
      return result
        ? renderTemplate(ifTrue || onlyBlock, context)
        : renderTemplate(ifFalse || '', context);
    }
  );
}

function evaluateCondition(condition, context) {
  const ops = ['==', '!=', '>=', '<=', '>', '<'];
  const op = ops.find(o => condition.includes(o));
  if (!op) return resolveTruthy(resolveKey(context, condition));

  const [leftRaw, rightRaw] = condition.split(op).map(s => s.trim());
  const left = resolveKey(context, leftRaw);
  const right = parseLiteral(rightRaw);

  if (typeof left !== typeof right) {
    throw new Error(`Type mismatch: ${typeof left} ${op} ${typeof right}`);
  }

  switch (op) {
    case '==': return left == right;
    case '!=': return left != right;
    case '>=': return left >= right;
    case '<=': return left <= right;
    case '>': return left > right;
    case '<': return left < right;
  }
}

function parseLiteral(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (!isNaN(val)) return Number(val);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function resolveTruthy(val) {
  return !!val;
}

function resolveKey(context, keyPath) {
  return keyPath.split('.').reduce((acc, part) => {
    if (acc === undefined || acc === null) return undefined;
    if (part === 'length' && Array.isArray(acc)) return acc.length;
    return acc[part];
  }, context);
}

function initAutoTemplateRendering() {
  const targets = document.querySelectorAll('[data-render][data-template][data-context]');
  console.log("[init] Found render targets:", targets.length);

  targets.forEach(async el => {
    try {
      let contextUrl = el.dataset.context;
      if (contextUrl in window) {
        contextUrl = window[contextUrl];
        console.log("[context] Resolved from window:", contextUrl);
      }

      const tplEl = document.getElementById(el.dataset.template);
      if (!tplEl) {
        console.error("[template] Template not found:", el.dataset.template);
        return;
      }

      const tpl = tplEl.innerHTML;
      const res = await fetch(`${contextUrl}?_=${Date.now()}`);
      const rawData = await res.json();

      const alias = el.dataset.alias;
      const context = alias ? { [alias]: rawData } : rawData;

      const html = renderTemplate(tpl, context);
      el.innerHTML = html;
    } catch (err) {
      console.error("Rendering error:", err);
      el.innerHTML = `<div class="text-danger">Render error: ${err.message}</div>`;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initAutoTemplateRendering, 0));
} else {
  setTimeout(initAutoTemplateRendering, 0);
}
