import { useState, useEffect, useCallback, useMemo } from "react";
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
import { PlusCircle, Info, Package, X } from "lucide-react";
import { ProductWithVariations } from "../AppWithSupabase";

interface CadastrarItemProps {
  onCadastrar: (
    name: string,
    size: string,
    quantity: number,
  ) => void;
  allProducts: ProductWithVariations[];
  customProducts: ProductWithVariations[];
  onRemoveCustomProduct?: (productName: string) => void;
}

export default function CadastrarItem({
  onCadastrar,
  allProducts,
  customProducts = [],
  onRemoveCustomProduct,
}: CadastrarItemProps) {
  const [product, setProduct] = useState("");
  const [customProductName, setCustomProductName] =
    useState("");
  const [size, setSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [sizeType, setSizeType] = useState<
    "none" | "letters" | "numbers" | "unique" | "custom" | null
  >(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    [],
  );
  const [multipleMode, setMultipleMode] = useState(false);

  const isCustomProduct = product === "__CUSTOM__";

  // Opções predefinidas de tamanhos
  const letterSizes = [
    "PP",
    "P",
    "M",
    "G",
    "GG",
    "XG",
    "XXG",
    "XXXG",
  ];
  const numberSizes = [
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "50",
  ];

  // Variações disponíveis baseadas no tipo selecionado ou no produto
  const availableVariations = (() => {
    // Se for produto personalizado, usa o tipo selecionado
    if (isCustomProduct) {
      if (sizeType === "letters") return letterSizes;
      if (sizeType === "numbers") return numberSizes;
      return [];
    }

    // Se não for produto personalizado, pega do produto selecionado
    if (product && allProducts) {
      const productData = allProducts.find(
        (p) => p.name === product,
      );
      return productData?.variations || [];
    }

    // Se tipo foi selecionado manualmente, retorna as opções
    if (sizeType === "letters") return letterSizes;
    if (sizeType === "numbers") return numberSizes;

    return [];
  })();

  const handleProductChange = (value: string) => {
    setProduct(value);
    setSize("");
    setCustomProductName("");
    setCustomSize("");

    // Auto-preencher tamanho se tiver apenas uma variação (e não for produto personalizado)
    if (value !== "__CUSTOM__" && allProducts) {
      const productData = allProducts.find(
        (p) => p.name === value,
      );
      if (
        productData &&
        productData.variations.length === 1 &&
        productData.variations[0] === "Único"
      ) {
        setSize(productData.variations[0]);
      }
    }
  };

  const handleSizeChange = (value: string) => {
    setSize(value);
    setCustomSize("");
  };

  // Auto-preencher tamanho quando as variações mudarem e houver apenas uma "Único"
  useEffect(() => {
    if (
      availableVariations.length === 1 &&
      availableVariations[0] === "Único"
    ) {
      setSize(availableVariations[0]);
    }
  }, [availableVariations]);

  // Funções para modo múltiplo
  const toggleSizeSelection = (variation: string) => {
    setSelectedSizes((prev) =>
      prev.includes(variation)
        ? prev.filter((s) => s !== variation)
        : [...prev, variation],
    );
  };

  const selectAllSizes = () => {
    setSelectedSizes([...availableVariations]);
  };

  const clearSizeSelection = () => {
    setSelectedSizes([]);
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const finalProductName = isCustomProduct
      ? customProductName.trim()
      : product;

    if (!finalProductName || quantity < 0) {
      alert(
        "Por favor, preencha todos os campos corretamente.",
      );
      return;
    }

    // Modo múltiplo - cadastrar vários tamanhos de uma vez
    if (multipleMode && selectedSizes.length > 0) {
      let successCount = 0;
      selectedSizes.forEach((selectedSize) => {
        onCadastrar(finalProductName, selectedSize, quantity);
        successCount++;
      });

      alert(
        `✅ ${successCount} variação(ões) cadastrada(s) com sucesso!`,
      );

      // Limpa seleção múltipla mas mantém o produto
      setSelectedSizes([]);
      setQuantity(0);
      setMultipleMode(false);
      return;
    }

    // Modo simples - cadastrar um tamanho
    const finalSize = isCustomSize
      ? customSize.trim()
      : isCustomProduct
        ? customSize.trim()
        : size;

    if (!finalSize) {
      alert("Por favor, selecione um tamanho.");
      return;
    }

    onCadastrar(finalProductName, finalSize, quantity);

    // Limpa o formulário
    setProduct("");
    setCustomProductName("");
    setSize("");
    setCustomSize("");
    setQuantity(0);
    setSelectedSizes([]);
    setMultipleMode(false);
  }, [product, customProductName, isCustomProduct, size, customSize, isCustomSize, quantity, multipleMode, selectedSizes, onCadastrar]);

  return (
    <Card className="border-gray-200 shadow">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          Cadastrar Novo Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
              Preencha os dados do produto que deseja adicionar
              ao estoque. Após o cadastro, você poderá registrar
              movimentações de entrada e saída.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="new-item-product"
              className="text-gray-700 font-medium mb-1.5 block text-sm"
            >
              Produto *
            </Label>
            <Select
              id="new-item-product"
              value={product}
              onValueChange={handleProductChange}
              required
            >
              <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                <SelectValue placeholder="Selecione o produto" />
              </SelectTrigger>
              <SelectContent className="max-h-[250px] select-scrollbar">
                {allProducts?.map((product) => (
                  <SelectItem
                    key={product.name}
                    value={product.name}
                  >
                    {product.name}
                  </SelectItem>
                ))}
                <SelectItem key="__CUSTOM__" value="__CUSTOM__">
                  Cadastrar
                </SelectItem>
              </SelectContent>
            </Select>
            {isCustomProduct && (
              <Input
                id="custom-product-name"
                type="text"
                value={customProductName}
                onChange={(e) =>
                  setCustomProductName(e.target.value)
                }
                placeholder="Nome do novo produto"
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mt-2"
              />
            )}
          </div>

          {/* Seção de Produtos Customizados */}
          {customProducts.length > 0 && onRemoveCustomProduct && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-gray-700 font-medium text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  Produtos Customizados
                </Label>
                <span className="text-xs text-gray-500">
                  {customProducts.length} produto(s)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {customProducts.map((customProduct) => (
                  <div
                    key={customProduct.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-300 rounded-md shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {customProduct.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Deseja remover o produto "${customProduct.name}" da lista?`)) {
                          onRemoveCustomProduct(customProduct.name);
                          if (product === customProduct.name) {
                            setProduct("");
                          }
                        }
                      }}
                      className="p-0.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                      title="Remover produto customizado"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tipo de Variação - Lista Compacta */}
          {isCustomProduct && (
            <div>
              <Label className="text-gray-700 font-medium mb-1.5 block text-sm">
                Tipo de Variação
              </Label>
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => {
                    if (sizeType === "letters") {
                      setSizeType(null);
                      setSelectedSizes([]);
                    } else {
                      setSizeType("letters");
                      setSelectedSizes([]);
                      setCustomSize("");
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors border-b border-gray-200 text-sm ${
                    sizeType === "letters"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>Letras (PP, P, M, G, GG...)</span>
                  {sizeType === "letters" && (
                    <span className="text-blue-600">✓</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (sizeType === "numbers") {
                      setSizeType(null);
                      setSelectedSizes([]);
                    } else {
                      setSizeType("numbers");
                      setSelectedSizes([]);
                      setCustomSize("");
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors border-b border-gray-200 text-sm ${
                    sizeType === "numbers"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>Numeração (33, 34, 35...)</span>
                  {sizeType === "numbers" && (
                    <span className="text-green-600">✓</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (sizeType === "unique") {
                      setSizeType(null);
                      setCustomSize("");
                      setSelectedSizes([]);
                    } else {
                      setSizeType("unique");
                      setCustomSize("ÚNICO");
                      setSelectedSizes([]);
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors text-sm ${
                    sizeType === "unique"
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>Tamanho Único</span>
                  {sizeType === "unique" && (
                    <span className="text-purple-600">✓</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tamanho - Seleção Múltipla Compacta */}
          <div>
            <Label className="text-gray-700 font-medium mb-1.5 block text-sm">
              Tamanho *
              {selectedSizes.length > 0 && (
                <span className="ml-2 text-xs text-orange-600 font-normal">
                  ({selectedSizes.length} selecionado
                  {selectedSizes.length > 1 ? "s" : ""})
                </span>
              )}
            </Label>

            {!isCustomProduct ? (
              <>
                <Select
                  id="item-size"
                  value={size}
                  onValueChange={(value) => {
                    setSize(value);
                    setIsCustomSize(
                      value === "__CUSTOM_SIZE__",
                    );
                    setCustomSize("");
                  }}
                  required
                >
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] select-scrollbar">
                    {availableVariations.length === 0 ? (
                      <SelectItem value="UNIQUE" disabled>
                        Selecione um produto primeiro
                      </SelectItem>
                    ) : (
                      <>
                        {availableVariations.map(
                          (variation) => (
                            <SelectItem
                              key={variation}
                              value={variation}
                            >
                              {variation}
                            </SelectItem>
                          ),
                        )}
                        <SelectItem value="__CUSTOM_SIZE__">
                          Outro tamanho
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {isCustomSize && (
                  <Input
                    id="custom-size-input"
                    type="text"
                    value={customSize}
                    onChange={(e) =>
                      setCustomSize(e.target.value)
                    }
                    placeholder="Digite o tamanho personalizado"
                    required
                    className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mt-2"
                  />
                )}
              </>
            ) : (
              <>
                {sizeType === "none" ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm">
                    Sem Variação
                  </div>
                ) : sizeType === "unique" ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm">
                    Tamanho Único
                  </div>
                ) : !sizeType ? (
                  <div className="px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-xs">
                    Selecione um tipo de variação acima
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Grid Compacto de Checkboxes */}
                    <div className="border border-gray-300 rounded-lg p-2 bg-white max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-5 gap-1.5">
                        {availableVariations.map(
                          (variation) => (
                            <label
                              key={variation}
                              className={`flex items-center justify-center px-2 py-1.5 rounded border cursor-pointer transition-all text-xs ${
                                selectedSizes.includes(
                                  variation,
                                )
                                  ? "bg-orange-500 text-white border-orange-600 font-medium"
                                  : "bg-white border-gray-300 hover:border-orange-400 text-gray-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSizes.includes(
                                  variation,
                                )}
                                onChange={() => {
                                  if (
                                    selectedSizes.includes(
                                      variation,
                                    )
                                  ) {
                                    setSelectedSizes(
                                      selectedSizes.filter(
                                        (s) => s !== variation,
                                      ),
                                    );
                                  } else {
                                    setSelectedSizes([
                                      ...selectedSizes,
                                      variation,
                                    ]);
                                  }
                                }}
                                className="sr-only"
                              />
                              {variation}
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Botões de Ação Compactos */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSizes([
                            ...availableVariations,
                          ])
                        }
                        className="flex-1 px-2 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSizes([])}
                        className="flex-1 px-2 py-1.5 bg-red-50 border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors text-xs font-medium"
                      >
                        Limpar
                      </button>
                    </div>

                    {/* Resumo Compacto */}
                    {selectedSizes.length > 0 && (
                      <div className="p-2 bg-green-50 border border-green-300 rounded text-xs">
                        <span className="text-green-800 font-medium">
                          Selecionados:
                        </span>
                        <span className="text-green-700 ml-1">
                          {selectedSizes.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <Label
              htmlFor="initial-quantity"
              className="text-gray-700 font-medium mb-1.5 block text-sm"
            >
              Quantidade Inicial *
              {selectedSizes.length > 1 && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (mesma para todos)
                </span>
              )}
            </Label>
            <Input
              id="initial-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Digite a quantidade"
              className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-4"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            {selectedSizes.length > 1
              ? `Cadastrar ${selectedSizes.length} Variações`
              : "Cadastrar Produto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}