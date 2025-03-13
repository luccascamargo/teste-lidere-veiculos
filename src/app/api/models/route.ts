export const dynamic = "force-static";

export async function POST(request: Request) {
  const res = await request.json();
  const response = await fetch(
    `https://brasilapi.com.br/api/fipe/veiculos/v1/${res.type}/${res.brand}`,
    {
      cache: "force-cache",
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  const data = await response.json();

  return Response.json({ data });
}
