const server = Deno.listen({ port: 8080 });
console.log("File server running on http://localhost:8080/");

for await (const conn of server) {
  handleHttp(conn).catch(console.error);
}

async function handleHttp(conn: Deno.Conn) {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    const url = new URL(requestEvent.request.url);
    const filepath = decodeURIComponent(
      url.pathname === "/" ? "/index.html" : url.pathname
    );
    let file;
    try {
      file = await Deno.open("." + filepath, { read: true });
    } catch {
      const notFoundResponse = new Response("404 Not Found", { status: 404 });
      await requestEvent.respondWith(notFoundResponse);
      return;
    }
    const response = new Response(file.readable);
    await requestEvent.respondWith(response);
  }
}
