import { FormVeiculos } from "@/components/formVeiculos";
import Providers from "./providers";

export default function Home() {
  return (
    <div className="space-y-8 flex flex-col items-center w-screen h-screen justify-center">
      <h1 className="text-4xl">Cadastro de Veículos</h1>
      <Providers>
        <FormVeiculos />
      </Providers>
    </div>
  );
}
