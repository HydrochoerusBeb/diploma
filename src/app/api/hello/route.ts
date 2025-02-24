export async function GET() {
    return new Response(JSON.stringify({ message: "Hello, Backend!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } 