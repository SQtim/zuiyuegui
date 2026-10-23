export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 新增接口：提交预约
    if (url.pathname === "/api/add" && request.method === "POST") {
      try {
        const data = await request.json();
        const { name, phone, time, remark } = data;
        await env.MY_DB.prepare(
          `INSERT INTO yuyue (name, phone, time, remark) VALUES (?, ?, ?, ?)`
        ).bind(name, phone, time, remark).run();
        return Response.json({ ok: true, msg: "提交成功" }, { headers: corsHeaders });
      } catch (e) {
        return Response.json({ ok: false, msg: e.message }, { headers: corsHeaders });
      }
    }

    // 查询全部预约
    if (url.pathname === "/api/list" && request.method === "GET") {
      const res = await env.MY_DB.prepare(
        `SELECT * FROM yuyue ORDER BY id DESC`
      ).all();
      return Response.json({ ok: true, list: res.results }, { headers: corsHeaders });
    }

    // 删除预约（校验密码）
    if (url.pathname === "/api/del" && request.method === "POST") {
      const data = await request.json();
      if (data.pwd !== env.MASTER_PASSWORD) {
        return Response.json({ ok: false, msg: "密码错误" }, { headers: corsHeaders });
      }
      await env.MY_DB.prepare(`DELETE FROM yuyue WHERE id=?`).bind(data.id).run();
      return Response.json({ ok: true, msg: "已删除" }, { headers: corsHeaders });
    }

    return new Response("接口正常", { status: 200, headers: corsHeaders });
  }
}
