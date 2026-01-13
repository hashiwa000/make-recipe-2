import { FastifyPluginCallback } from 'fastify';

// Minimal HTML UI served at /ui (client-side fetch calls to API)
const uiRoutes: FastifyPluginCallback = (app, _opts, done) => {
  app.get('/ui', async (_req, reply) => {
    const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI 週次献立プランナー</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 16px; }
      header { margin-bottom: 16px; }
      textarea { width: 100%; height: 90px; }
      button { margin-right: 8px; }
      .row { margin: 12px 0; }
      pre { background: #f7f7f7; padding: 12px; overflow: auto; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
      .muted { color: #666; }
      a.button { display:inline-block; padding:6px 10px; border:1px solid #888; border-radius:6px; text-decoration:none; }
    </style>
  </head>
  <body>
    <header>
      <h1>AI 週次献立プランナー（デモUI）</h1>
      <p class="muted">食材テキストから週次プランを作成。買い物リストを確認・エクスポートできます。</p>
    </header>

    <section class="card">
      <div class="row">
        <label for="inputText">食材テキスト</label>
        <textarea id="inputText" placeholder="例: 玉ねぎ2個\nにんじん1本\n鶏もも300g"></textarea>
      </div>
      <div class="row">
        <button id="btnParse">食材を解析</button>
        <button id="btnCreate">プランを作成</button>
        <span id="status" class="muted"></span>
      </div>
    </section>

    <section class="grid" style="margin-top:16px;">
      <div class="card">
        <h2>解析結果（食材）</h2>
        <pre id="parseOut" class="muted">未実行</pre>
      </div>
      <div class="card">
        <h2>プラン情報</h2>
        <div class="row">
          <label>PLAN ID: <span id="planId" class="muted">未作成</span></label>
        </div>
        <div class="row">
          <button id="btnReloadPlan" disabled>プラン再取得</button>
          <button id="btnLockFirst" disabled>最初のスロットをロック</button>
          <button id="btnRegenFirst" disabled>最初のスロットを再生成</button>
        </div>
        <div class="row">
          <a id="linkCsv" class="button" href="#" target="_blank" aria-disabled="true">CSVをダウンロード</a>
          <a id="linkPdf" class="button" href="#" target="_blank" aria-disabled="true">PDFをダウンロード</a>
        </div>
        <pre id="planOut" class="muted">未作成</pre>
      </div>
    </section>

    <section class="card" style="margin-top:16px;">
      <h2>買い物リスト</h2>
      <div class="row">
        <button id="btnShopping" disabled>買い物リスト取得</button>
      </div>
      <pre id="shopOut" class="muted">未取得</pre>
    </section>

    <script>
      const $ = (id) => document.getElementById(id);
      const state = { planId: null };

      function setStatus(msg) { $('status').textContent = msg || ''; }
      function setPlanId(id) {
        state.planId = id; $('planId').textContent = id || '未作成';
        const has = !!id;
        $('btnReloadPlan').disabled = !has;
        $('btnLockFirst').disabled = !has;
        $('btnRegenFirst').disabled = !has;
        $('btnShopping').disabled = !has;
        const csv = $('linkCsv'); const pdf = $('linkPdf');
        if (has) {
          csv.href = '/plans/' + id + '/export.csv'; csv.setAttribute('aria-disabled','false');
          pdf.href = '/plans/' + id + '/export.pdf'; pdf.setAttribute('aria-disabled','false');
        } else {
          csv.href = '#'; csv.setAttribute('aria-disabled','true');
          pdf.href = '#'; pdf.setAttribute('aria-disabled','true');
        }
      }

      $('btnParse').addEventListener('click', async () => {
        setStatus('解析中...');
        try {
          const text = $('inputText').value;
          const res = await fetch('/parse-ingredients', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
          const body = await res.json();
          $('parseOut').textContent = JSON.stringify(body, null, 2);
          setStatus('解析完了');
        } catch (e) { setStatus('解析失敗'); }
      });

      $('btnCreate').addEventListener('click', async () => {
        setStatus('作成中...');
        try {
          const text = $('inputText').value;
          const res = await fetch('/plans', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
          const plan = await res.json();
          setPlanId(plan.id);
          $('planOut').textContent = JSON.stringify(plan, null, 2);
          setStatus('作成完了');
        } catch (e) { setStatus('作成失敗'); }
      });

      $('btnReloadPlan').addEventListener('click', async () => {
        if (!state.planId) return;
        setStatus('取得中...');
        try {
          const res = await fetch('/plans/' + state.planId);
          const plan = await res.json();
          $('planOut').textContent = JSON.stringify(plan, null, 2);
          setStatus('取得完了');
        } catch (e) { setStatus('取得失敗'); }
      });

      $('btnLockFirst').addEventListener('click', async () => {
        if (!state.planId) return;
        setStatus('ロック中...');
        try {
          const plan = await (await fetch('/plans/' + state.planId)).json();
          const slotId = plan.slots[0]?.id;
          await fetch('/plans/' + state.planId + '/slots/' + slotId + '/lock', { method: 'POST' });
          setStatus('ロック完了');
        } catch (e) { setStatus('ロック失敗'); }
      });

      $('btnRegenFirst').addEventListener('click', async () => {
        if (!state.planId) return;
        setStatus('再生成中...');
        try {
          const plan = await (await fetch('/plans/' + state.planId)).json();
          const slotId = plan.slots[0]?.id;
          const updated = await (await fetch('/plans/' + state.planId + '/slots/' + slotId, { method: 'PATCH' })).json();
          $('planOut').textContent = JSON.stringify(updated, null, 2);
          setStatus('再生成完了');
        } catch (e) { setStatus('再生成失敗'); }
      });

      $('btnShopping').addEventListener('click', async () => {
        if (!state.planId) return;
        setStatus('取得中...');
        try {
          const res = await fetch('/plans/' + state.planId + '/shopping-list');
          const body = await res.json();
          $('shopOut').textContent = JSON.stringify(body, null, 2);
          setStatus('取得完了');
        } catch (e) { setStatus('取得失敗'); }
      });
    </script>
  </body>
</html>`;
    reply.header('Content-Type', 'text/html; charset=utf-8');
    return reply.status(200).send(html);
  });
  done();
};

export default uiRoutes;

