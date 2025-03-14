interface ResponseBrands {
  data: Array<Brands>;
}
interface Brands {
  valor: string;
  nome: string;
}

interface ResponseModels {
  data: Array<Models>;
}
interface Models {
  modelo: string;
}

export const fetchBrands = async (type: string): Promise<ResponseBrands> => {
  const response = await fetch("/api/brands/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  const data = await response.json();
  return data;
};

export const fetchModels = async (
  type: string,
  brand: string
): Promise<ResponseModels> => {
  const response = await fetch("api/models", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      brand,
    }),
  });
  const data = await response.json();
  return data;
};
