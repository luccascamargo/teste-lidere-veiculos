"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchBrands, fetchModels } from "@/app/fipe";
import { toast } from "sonner";

interface Vehicle {
  tipo: string;
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  status: string;
}

const formSchema = z.object({
  tipo: z.string().min(1, { message: "Campo obrigatório" }),
  marca: z.string().min(1, { message: "Campo obrigatório" }),
  modelo: z.string().min(1, { message: "Campo obrigatório" }),
  ano: z.string().min(1, { message: "Campo obrigatório" }),
  placa: z
    .string()
    .min(1, { message: "Campo obrigatório" })
    .max(7, { message: "Placa inválida" })
    .transform((value) => value.toUpperCase())
    .refine(
      (value) => {
        const regex = /^[A-Z]{3}(\d[A-Z0-9]\d{2}|\d{4})$/;
        return regex.test(value);
      },
      {
        message:
          "Formato inválido. A placa deve seguir o padrão ABC1D23 ou ABC1234",
      }
    ),
  cor: z.string().min(1, { message: "Campo obrigatório" }),
  status: z.string().min(1, { message: "Campo obrigatório" }),
});

const statusOptions = ["disponivel", "alugado", "manutencao"];

export function FormVeiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "",
      marca: "",
      modelo: "",
      ano: "",
      placa: "",
      cor: "",
      status: "",
    },
  });

  useEffect(() => {
    const storedVehicles = localStorage.getItem("vehicles");
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles));
    }
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingId !== null) {
      // Editar veículo existente
      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === editingId ? { ...vehicle, ...values } : vehicle
      );
      setVehicles(updatedVehicles);
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
      setEditingId(null);
    } else {
      // Adicionar novo veículo
      const vehicleAllReadyExists = vehicles.some(
        (vehicle) => vehicle.placa === values.placa
      );
      if (vehicleAllReadyExists) {
        toast("Veículo com a placa informada já cadastrado");
        return;
      }
      const brandName = brands.data?.data.filter(
        (brand) => brand.valor === values.marca
      );
      if (brandName) {
        values.marca = brandName[0].nome;
      }
      const newVehicle = { ...values, id: Date.now() };
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
    }
    form.reset();
  }

  const handleEdit = (id: number) => {
    const vehicleToEdit = vehicles.find((vehicle) => vehicle.id === id);
    if (vehicleToEdit) {
      form.reset(vehicleToEdit);
      setEditingId(id);
    }
  };

  const handleDelete = (id: number) => {
    const updatedVehicles = vehicles.filter((vehicle) => vehicle.id !== id);
    setVehicles(updatedVehicles);
    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
  };

  const brands = useMutation({
    mutationKey: ["brands"],
    mutationFn: ({ type }: { type: string }) => fetchBrands(type),
  });

  const models = useMutation({
    mutationKey: ["models"],
    mutationFn: ({ type, brand }: { type: string; brand: string }) =>
      fetchModels(type, brand),
  });

  useEffect(() => {
    const type = form.watch("tipo");
    if (type) {
      form.setValue("marca", "");
      form.setValue("modelo", "");
      brands.mutate({ type });
    }
  }, [form.watch("tipo")]);

  useEffect(() => {
    const brand = form.watch("marca");
    const type = form.watch("tipo");
    if (brand && type) {
      form.setValue("modelo", "");
      models.mutate({ type, brand });
    }
  }, [form.watch("marca")]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center"
        >
          <div className="space-y-8 space-x-8 flex flex-wrap items-start">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl className="w-36">
                      <SelectTrigger>
                        <SelectValue placeholder="Marca" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={"caminhoes"}>Caminhões</SelectItem>
                      <SelectItem value={"carros"}>Carros</SelectItem>
                      <SelectItem value={"motos"}>Motos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={brands.isSuccess !== true}
                  >
                    <FormControl className="w-36">
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            brands.isPending
                              ? "Buscando marcas..."
                              : "Selecione"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.data?.data.map((brand) => (
                        <SelectItem key={brand.valor} value={brand.valor}>
                          {brand.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={models.isSuccess !== true}
                  >
                    <FormControl className="w-36">
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            models.isPending
                              ? "Buscando modelos..."
                              : "Selecione"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {models.data?.data.map((model) => (
                        <SelectItem key={model.modelo} value={model.modelo}>
                          {model.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de Fabricação</FormLabel>
                  <FormControl>
                    <Input placeholder="2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC1D23 e ABC1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input placeholder="Branco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl className="w-36">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status do veiculo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="cursor-pointer">
            Enviar
          </Button>
        </form>
      </Form>

      <Table className="max-w-3xl m-auto">
        <TableCaption>Lista de Veículos Cadastrados</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Marca</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.marca}</TableCell>
              <TableCell>{vehicle.modelo}</TableCell>
              <TableCell>{vehicle.ano}</TableCell>
              <TableCell>{vehicle.placa}</TableCell>
              <TableCell>{vehicle.cor}</TableCell>
              <TableCell>{vehicle.status}</TableCell>
              <TableCell className="flex space-x-4">
                <Button
                  onClick={() => handleEdit(vehicle.id)}
                  className="cursor-pointer"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(vehicle.id)}
                  className="cursor-pointer"
                >
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
