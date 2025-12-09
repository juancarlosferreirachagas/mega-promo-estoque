import { useState, useEffect, useCallback, useMemo } from "react";
import {
  InventoryItem,
  ProductWithVariations,
  User,
} from "../AppWithSupabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeftRight,
  Info,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  UserCircle,
  X,
} from "lucide-react";
import {
  MOTIVOS_ENTRADA,
  MOTIVOS_SAIDA,
} from "../utils/initialData";

interface RegistrarMovimentacaoProps {
  inventory: InventoryItem[];
  allProducts: ProductWithVariations[];
  users: User[];
  currentUser: User;
  onRegistrar: (
    name: string,
    size: string,
    type: "entrada" | "saida",
    quantity: number,
    reason: string,
    personName: string,
    responsible: string,
    observations?: string,
  ) => void;
}

export default function RegistrarMovimentacao({
  inventory,
  allProducts,
  users,
  currentUser,
  onRegistrar,
}: RegistrarMovimentacaoProps) {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [type, setType] = useState<"entrada" | "saida">(
    "entrada",
  );
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [personName, setPersonName] = useState("");
  const [responsible, setResponsible] = useState(
    currentUser.username,
  );
  const [observations, setObservations] = useState("");

  // Estados para motivos customizados persistentes
  const [customMotivosEntrada, setCustomMotivosEntrada] =
    useState<string[]>([]);
  const [customMotivosSaida, setCustomMotivosSaida] = useState<
    string[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomSize = size === "__CUSTOM_SIZE__";
  const isCustomReason = reason === "Outros";

  // Carregar motivos customizados do localStorage
  useEffect(() => {
    const savedEntrada = localStorage.getItem(
      "customMotivosEntrada",
    );
    const savedSaida = localStorage.getItem(
      "customMotivosSaida",
    );

    if (savedEntrada) {
      try {
        setCustomMotivosEntrada(JSON.parse(savedEntrada));
      } catch (e) {
        console.error(
          "Erro ao carregar motivos de entrada:",
          e,
        );
      }
    }

    if (savedSaida) {
      try {
        setCustomMotivosSaida(JSON.parse(savedSaida));
      } catch (e) {
        console.error("Erro ao carregar motivos de saída:", e);
      }
    }
  }, []);

  // Função para adicionar motivo customizado - memoizada
  const addCustomMotivo = useCallback((
    motivo: string,
    tipoMovimento: "entrada" | "saida",
  ) => {
    if (!motivo.trim()) return;

    if (tipoMovimento === "entrada") {
      setCustomMotivosEntrada(prev => {
        const newMotivos = [...prev, motivo.trim()];
        // Debounce para localStorage
        setTimeout(() => {
          try {
            localStorage.setItem("customMotivosEntrada", JSON.stringify(newMotivos));
          } catch (error) {
            console.error("Erro ao salvar motivos de entrada:", error);
          }
        }, 300);
        return newMotivos;
      });
    } else {
      setCustomMotivosSaida(prev => {
        const newMotivos = [...prev, motivo.trim()];
        // Debounce para localStorage
        setTimeout(() => {
          try {
            localStorage.setItem("customMotivosSaida", JSON.stringify(newMotivos));
          } catch (error) {
            console.error("Erro ao salvar motivos de saída:", error);
          }
        }, 300);
        return newMotivos;
      });
    }
  }, []);

  // Função para remover motivo customizado
  const removeCustomMotivo = (
    motivo: string,
    tipoMovimento: "entrada" | "saida",
  ) => {
    if (tipoMovimento === "entrada") {
      const newMotivos = customMotivosEntrada.filter(
        (m) => m !== motivo,
      );
      setCustomMotivosEntrada(newMotivos);
      localStorage.setItem(
        "customMotivosEntrada",
        JSON.stringify(newMotivos),
      );
      // Se o motivo removido estava selecionado, limpa a seleção
      if (reason === motivo) {
        setReason("");
      }
    } else {
      const newMotivos = customMotivosSaida.filter(
        (m) => m !== motivo,
      );
      setCustomMotivosSaida(newMotivos);
      localStorage.setItem(
        "customMotivosSaida",
        JSON.stringify(newMotivos),
      );
      // Se o motivo removido estava selecionado, limpa a seleção
      if (reason === motivo) {
        setReason("");
      }
    }
  };

  // Combina motivos padrão com customizados
  const getAllMotivosEntrada = () => {
    return [
      ...MOTIVOS_ENTRADA.filter((m) => m !== "Outros"),
      ...customMotivosEntrada,
      "Outros",
    ];
  };

  const getAllMotivosSaida = () => {
    return [
      ...MOTIVOS_SAIDA.filter((m) => m !== "Outros"),
      ...customMotivosSaida,
      "Outros",
    ];
  };

  // Combina produtos do allProducts com produtos do inventory
  // Garante que todos os produtos cadastrados apareçam no dropdown
  const inventoryProductNames = Array.from(
    new Set(inventory.map((item) => item.name)),
  );
  const allProductNames = allProducts.map((p) => p.name);
  const combinedProductNames = Array.from(
    new Set([...allProductNames, ...inventoryProductNames]),
  ).sort();

  // Obtém os tamanhos disponíveis de acordo com o produto selecionado
  // Prioriza tamanhos do allProducts, mas adiciona tamanhos do inventory também
  const getAvailableSizes = (): string[] => {
    if (!name) return [];

    // Tamanhos do allProducts
    const productData = allProducts?.find(
      (p) => p.name === name,
    );
    const productSizes = productData?.variations || [];

    // Tamanhos já cadastrados no inventory
    const inventorySizes = inventory
      .filter((item) => item.name === name)
      .map((item) => item.size);

    // Combina e remove duplicatas
    return Array.from(
      new Set([...productSizes, ...inventorySizes]),
    ).sort();
  };

  const availableSizes = getAvailableSizes();

  // Reset do tamanho quando mudar o nome do item
  const handleNameChange = (newName: string) => {
    setName(newName);
    setSize(""); // Limpa o tamanho quando mudar o item
    setCustomSize("");
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
    setCustomSize("");
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const finalSize = isCustomSize ? customSize.trim() : size;
    const finalReason = isCustomReason
      ? customReason.trim()
      : reason;

    if (
      !name.trim() ||
      !finalSize ||
      !finalReason ||
      !personName.trim() ||
      !responsible.trim() ||
      quantity <= 0
    ) {
      alert(
        "Por favor, preencha todos os campos obrigatórios.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Se for um motivo customizado novo (digitado no campo "Outros"), adiciona à lista
      if (isCustomReason && customReason.trim()) {
        addCustomMotivo(customReason.trim(), type);
      }

      await onRegistrar(
        name.trim(),
        finalSize,
        type,
        quantity,
        finalReason,
        personName.trim(),
        responsible.trim(),
        observations.trim(),
      );

      // Limpa o formulário
      setName("");
      setSize("");
      setCustomSize("");
      setType("entrada");
    setQuantity(1);
    setReason("");
    setCustomReason("");
    setPersonName("");
    setResponsible(currentUser.username);
    setObservations("");
  }, [name, size, customSize, reason, customReason, personName, responsible, observations, quantity, type, isCustomReason, isCustomSize, addCustomMotivo, onRegistrar, currentUser]);

  return (
    <Card className="border-gray-200 shadow">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          Registrar Movimentação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {/* Info Banner - Compacto */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500 rounded-lg shadow-lg">
              <Info className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Registre{" "}
              <span className="font-black text-green-600">
                entradas
              </span>{" "}
              ou{" "}
              <span className="font-black text-red-600">
                saídas
              </span>{" "}
              de estoque
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Produto e Tamanho - Grid Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="movement-item-name"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Produto
              </Label>
              <Select
                value={name}
                onValueChange={handleNameChange}
              >
                <SelectTrigger
                  id="movement-item-name"
                  className="h-10 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white rounded-xl shadow-sm transition-all"
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[250px] select-scrollbar">
                  {combinedProductNames.length === 0 ? (
                    <div className="p-3 text-center text-gray-400 text-xs">
                      Nenhum produto
                    </div>
                  ) : (
                    combinedProductNames.map((itemName) => (
                      <SelectItem
                        key={itemName}
                        value={itemName}
                        className="rounded-lg"
                      >
                        {itemName.toUpperCase()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="movement-item-size"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Tamanho
              </Label>
              <Select
                value={size}
                onValueChange={handleSizeChange}
                disabled={!name || availableSizes.length === 0}
              >
                <SelectTrigger
                  id="movement-item-size"
                  className="h-10 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white rounded-xl shadow-sm transition-all disabled:opacity-50"
                >
                  <SelectValue
                    placeholder={
                      !name
                        ? "Selecione o produto primeiro"
                        : availableSizes.length === 0
                          ? "Sem tamanhos"
                          : "Selecione..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[250px] select-scrollbar">
                  {availableSizes.map((itemSize) => (
                    <SelectItem
                      key={itemSize}
                      value={itemSize}
                      className="rounded-lg"
                    >
                      {itemSize.toUpperCase()}
                    </SelectItem>
                  ))}
                  {availableSizes.length > 0 && (
                    <SelectItem
                      value="__CUSTOM_SIZE__"
                      className="rounded-lg border-t"
                    >
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          PERSONALIZADO
                        </span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {name && availableSizes.length === 0 && (
                <div className="flex items-center gap-1 mt-1 text-amber-600 text-[10px] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>Sem tamanhos cadastrados</span>
                </div>
              )}
              {isCustomSize && (
                <Input
                  id="movement-item-custom-size"
                  type="text"
                  value={customSize}
                  onChange={(e) =>
                    setCustomSize(e.target.value)
                  }
                  placeholder="Digite o tamanho"
                  required
                  className="h-10 mt-2 border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl"
                />
              )}
            </div>
          </div>

          {/* Tipo e Quantidade - Cards Visuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="movement-type"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Tipo
              </Label>
              <Select
                value={type}
                onValueChange={(value: "entrada" | "saida") =>
                  setType(value)
                }
              >
                <SelectTrigger className="h-10 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white rounded-xl shadow-sm transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[250px] select-scrollbar">
                  <SelectItem
                    value="entrada"
                    className="rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded">
                        <ArrowUpCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="font-semibold">
                        ENTRADA
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="saida"
                    className="rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-red-100 rounded">
                        <ArrowDownCircle className="w-3.5 h-3.5 text-red-600" />
                      </div>
                      <span className="font-semibold">
                        SAÍDA
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="movement-quantity"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Quantidade
              </Label>
              <Input
                id="movement-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                placeholder="1"
                required
                className="h-10 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Motivo - Card Destacado */}
          <div className="space-y-1.5">
            <Label
              htmlFor="movement-reason"
              className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Motivo
            </Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-10 border-2 border-gray-200 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-white rounded-xl shadow-sm transition-all">
                <SelectValue placeholder="Escolha o motivo..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {type === "entrada" ? (
                  <>
                    {/* Motivos padrão */}
                    {MOTIVOS_ENTRADA.filter(
                      (m) => m !== "Outros",
                    ).map((motivo) => (
                      <SelectItem
                        key={motivo}
                        value={motivo}
                        className="rounded-lg"
                      >
                        {motivo.toUpperCase()}
                      </SelectItem>
                    ))}
                    {/* Motivos customizados */}
                    {customMotivosEntrada.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-t mt-1 pt-2">
                          Personalizados
                        </div>
                        {customMotivosEntrada.map((motivo) => (
                          <SelectItem
                            key={motivo}
                            value={motivo}
                            className="rounded-lg bg-amber-50/50"
                          >
                            <div className="flex items-center gap-2 justify-between w-full">
                              <span>{motivo.toUpperCase()}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-black">
                                CUSTOM
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {/* Outros */}
                    <SelectItem
                      value="Outros"
                      className="rounded-lg border-t mt-1"
                    >
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          + OUTROS
                        </span>
                      </div>
                    </SelectItem>
                  </>
                ) : (
                  <>
                    {/* Motivos padrão */}
                    {MOTIVOS_SAIDA.filter(
                      (m) => m !== "Outros",
                    ).map((motivo) => (
                      <SelectItem
                        key={motivo}
                        value={motivo}
                        className="rounded-lg"
                      >
                        {motivo.toUpperCase()}
                      </SelectItem>
                    ))}
                    {/* Motivos customizados */}
                    {customMotivosSaida.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-[10px] font-black text-gray-400 uppercase tracking-wider border-t mt-1 pt-2">
                          Personalizados
                        </div>
                        {customMotivosSaida.map((motivo) => (
                          <SelectItem
                            key={motivo}
                            value={motivo}
                            className="rounded-lg bg-amber-50/50"
                          >
                            <div className="flex items-center gap-2 justify-between w-full">
                              <span>{motivo.toUpperCase()}</span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-black">
                                CUSTOM
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {/* Outros */}
                    <SelectItem
                      value="Outros"
                      className="rounded-lg border-t mt-1"
                    >
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="font-semibold">
                          + CRIAR NOVO
                        </span>
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            {/* Campo para criar novo motivo */}
            {isCustomReason && (
              <Input
                id="movement-custom-reason"
                type="text"
                value={customReason}
                onChange={(e) =>
                  setCustomReason(e.target.value)
                }
                required
                placeholder="Digite o novo motivo..."
                className="h-10 mt-2 border-2 border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl"
              />
            )}

            {/* Gerenciar motivos customizados */}
            {((type === "entrada" &&
              customMotivosEntrada.length > 0) ||
              (type === "saida" &&
                customMotivosSaida.length > 0)) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                    Motivos Personalizados
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(type === "entrada"
                    ? customMotivosEntrada
                    : customMotivosSaida
                  ).map((motivo) => (
                    <div
                      key={motivo}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs group hover:border-red-400 transition-all"
                    >
                      <span className="font-semibold text-gray-700">
                        {motivo}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          removeCustomMotivo(motivo, type)
                        }
                        className="p-0.5 hover:bg-red-100 rounded transition-colors"
                        title="Remover motivo"
                      >
                        <X className="w-3 h-3 text-red-500 group-hover:text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-amber-600 mt-2 font-medium">
                  Clique no ❌ para remover um motivo
                  personalizado
                </p>
              </div>
            )}
          </div>

          {/* Pessoas - Grid Compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="movement-person-name"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                {type === "entrada"
                  ? "Empresa/Pessoa"
                  : "Pessoa"}
              </Label>
              <Input
                id="movement-person-name"
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder={
                  type === "entrada"
                    ? "Nome da empresa ou pessoa"
                    : "Nome da pessoa"
                }
                required
                className="h-10 border-2 border-gray-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl shadow-sm transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="movement-responsible"
                className="text-xs font-black text-gray-700 uppercase tracking-wide flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Responsável
                {currentUser.isMaster && (
                  <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-full">
                    ADMIN
                  </span>
                )}
              </Label>
              {currentUser.isMaster ||
              (type === "entrada" && reason === "Devolução") ? (
                // Admin pode selecionar qualquer usuário OU quando for entrada + devolução (para marcar quem está devolvendo)
                <Select
                  value={responsible}
                  onValueChange={setResponsible}
                >
                  <SelectTrigger className="h-10 border-2 border-indigo-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-sm transition-all">
                    <SelectValue
                      placeholder={
                        type === "entrada" &&
                        reason === "Devolução"
                          ? "Quem está devolvendo?"
                          : "Selecione o responsável..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[250px] select-scrollbar">
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.username}
                        className="rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="font-semibold">
                            {user.username}
                          </span>
                          {user.isMaster && (
                            <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-black rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                // Usuário normal - campo não editável com nome do usuário
                <div className="h-10 px-3 flex items-center gap-2 border-2 border-gray-200 bg-gray-50 rounded-xl text-gray-700">
                  <UserCircle className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">
                    {responsible}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label
              htmlFor="movement-observations"
              className="text-xs font-black text-gray-500 uppercase tracking-wide flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              Observações (Opcional)
            </Label>
            <Input
              id="movement-observations"
              type="text"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais..."
              className="h-10 border-2 border-gray-200 hover:border-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 rounded-xl shadow-sm transition-all"
            />
          </div>

          {/* Botão Submit - Moderno */}
          <Button
            type="submit"
            disabled={isSubmitting || !name || !size}
            className="w-full h-12 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                REGISTRANDO...
              </>
            ) : (
              <>
                <ArrowLeftRight className="w-5 h-5 mr-2" />
                Registrar Movimentação
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}