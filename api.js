export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 新增接口：提交预约
    if (url.pathname === "/api/add" && request.method === "POST") {
      try {
        const data = await request.json();
        const { name, contact, time, remark } = data;
        await env.MY_DB.prepare(
          `INSERT INTO reserve (name, contact, time, remark) VALUES (?, ?, ?, ?)`
        ).bind(name, contact, time, remark).run();
        return Response.json({ ok: true, msg: "提交成功" });
      } catch (e) {
        return Response.json({ ok: false, msg: e.message });
      }
    }

    // 查询全部预约
    if (url.pathname === "/api/list" && request.method === "GET") {
      const res = await env.MY_DB.prepare(
        `SELECT * FROM reserve ORDER BY id DESC`
      ).all();
      return Response.json({ ok: true, list: res.results });
    }

    // 删除预约（校验密码）
    if (url.pathname === "/api/del" && request.method === "POST") {
      const data = await request.json();
      if (data.pwd !== env.MASTER_PASSWORD) {
        return Response.json({ ok: false, msg: "密码错误" });
      }
      await env.MY_DB.prepare(`DELETE FROM reserve WHERE id=?`).bind(data.id).run();
      return Response.json({ ok: true, msg: "已删除" });
    }

    return new Response("接口正常", { status: 200 });
  }
};
