export default {
  async fetch(request, env) {
    const { DB, MASTER_PASSWORD } = env;
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "member";
    const id = url.searchParams.get("id");
    const pwd = url.searchParams.get("password");
    const isAuth = pwd === MASTER_PASSWORD;
    const now = new Date().toLocaleString("zh-CN");

    if (request.method === "GET") {
      if (type === "member") {
        const { results } = await DB.prepare("SELECT * FROM member").all();
        return Response.json(results);
      }
      if (type === "recruit") {
        if (!isAuth) return new Response("禁止访问", { status: 403 });
        const { results } = await DB.prepare("SELECT * FROM recruit ORDER BY id DESC").all();
        return Response.json(results);
      }
      if (type === "journal") {
        const { results } = await DB.prepare("SELECT * FROM journal ORDER BY id DESC").all();
        return Response.json(results);
      }
      if (type === "photo") {
        const { results } = await DB.prepare("SELECT * FROM photo ORDER BY id DESC").all();
        return Response.json(results);
      }
      if (type === "plan") {
        const res = await DB.prepare("SELECT content FROM plan LIMIT 1").first();
        return Response.json(res?.content || "");
      }
    }

    if (request.method === "POST") {
      const body = await request.json();
      if (type === "member") {
        await DB.prepare("INSERT INTO member (name,role,desc) VALUES (?,?,?)").bind(body.name, body.role, body.desc).run();
      }
      if (type === "recruit") {
        await DB.prepare("INSERT INTO recruit (gameId,style,onlineTime,message,createTime) VALUES (?,?,?,?,?)").bind(body.gameId, body.style, body.onlineTime, body.message, now).run();
      }
      if (type === "journal") {
        if (!isAuth) return new Response("密码错误", { status: 403 });
        await DB.prepare("INSERT INTO journal (title,content,createTime) VALUES (?,?,?)").bind(body.title, body.content, now).run();
      }
      if (type === "photo") {
        if (!isAuth) return new Response("密码错误", { status: 403 });
        await DB.prepare("INSERT INTO photo (title,url,createTime) VALUES (?,?,?)").bind(body.title, body.url, now).run();
      }
      return Response.json({ ok: true });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      if (type === "member") {
        if (!isAuth) return new Response("密码错误", { status: 403 });
        await DB.prepare("UPDATE member SET name=?,role=?,desc=? WHERE id=?").bind(body.data.name, body.data.role, body.data.desc, id).run();
      }
      if (type === "plan") {
        if (!isAuth) return new Response("密码错误", { status: 403 });
        const exist = await DB.prepare("SELECT id FROM plan LIMIT 1").first();
        if (exist) await DB.prepare("UPDATE plan SET content=? WHERE id=?").bind(body.content, exist.id).run();
        else await DB.prepare("INSERT INTO plan (content) VALUES (?)").bind(body.content).run();
      }
      return Response.json({ ok: true });
    }

    if (request.method === "DELETE") {
      if (!isAuth) return new Response("密码错误", { status: 403 });
      if (type === "member") await DB.prepare("DELETE FROM member WHERE id=?").bind(id).run();
      if (type === "recruit") await DB.prepare("DELETE FROM recruit WHERE id=?").bind(id).run();
      if (type === "journal") await DB.prepare("DELETE FROM journal WHERE id=?").bind(id).run();
      if (type === "photo") await DB.prepare("DELETE FROM photo WHERE id=?").bind(id).run();
      return Response.json({ ok: true });
    }
    return new Response("404");
  }
}
