import { FormVeiculos } from "@/components/formVeiculos";
import Providers from "./providers";

export default function Home() {
  return (
    <div className="space-y-8 flex flex-col items-center w-screen max-w-7xl m-auto justify-center overflow-x-hidden">
      <h1 className="text-4xl text-center lg:text-start">
        Cadastro de Veículos
      </h1>
      <Providers>
        <FormVeiculos />
      </Providers>
    </div>
  );
}
