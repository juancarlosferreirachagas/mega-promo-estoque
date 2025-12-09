import { useState, useEffect, useCallback } from "react";
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
import { PlusCircle, Info, X, Edit2, Trash2, Settings } from "lucide-react";
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
  onUpdateCustomProduct?: (oldName: string, newName: string, variations: string[]) => void;
}

export default function CadastrarItem({
  onCadastrar,
  allProducts,
  customProducts = [],
  onRemoveCustomProduct,
  onUpdateCustomProduct,
}: CadastrarItemProps) {
  const [product, setProduct] = useState("");
  const [customProductName, setCustomProductName] = useState("");
  const [size, setSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [sizeType, setSizeType] = useState<
    "none" | "letters" | "numbers" | "unique" | "custom" | null
  >(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [multipleMode, setMultipleMode] = useState(false);
  
  // Estados para gerenciamento de produtos
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductVariations, setEditProductVariations] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomProduct = product === "__CUSTOM__";

  // Opções predefinidas de tamanhos
  const letterSizes = [
    "PP", "P", "M", "G", "GG", "XG", "XXG", "XXXG",
  ];
  const numberSizes = [
    "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  ];

  // Variações disponíveis baseadas no tipo selecionado ou no produto
  const availableVariations = (() => {
    if (isCustomProduct) {
      if (sizeType === "letters") return letterSizes;
      if (sizeType === "numbers") return numberSizes;
      return [];
    }

    if (product && allProducts) {
      const productData = allProducts.find((p) => p.name === product);
      return productData?.variations || [];
    }

    if (sizeType === "letters") return letterSizes;
    if (sizeType === "numbers") return numberSizes;

    return [];
  })();

  const handleProductChange = (value: string) => {
    setProduct(value);
    setSize("");
    setCustomProductName("");
    setCustomSize("");
    setSelectedSizes([]);
    setMultipleMode(false);

    if (value !== "__CUSTOM__" && allProducts) {
      const productData = allProducts.find((p) => p.name === value);
      if (
        productData &&
        productData.variations.length === 1 &&
        productData.variations[0] === "Único"
      ) {
        setSize(productData.variations[0]);
      }
    }
  };

  useEffect(() => {
    if (
      availableVariations.length === 1 &&
      availableVariations[0] === "Único"
    ) {
      setSize(availableVariations[0]);
    }
  }, [availableVariations]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const finalProductName = isCustomProduct
      ? customProductName.trim()
      : product;

    if (!finalProductName || quantity < 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setIsSubmitting(true);

    let finalSize: string = "";

    try {
      if (isCustomProduct) {
        if (sizeType === "unique") {
          finalSize = "ÚNICO";
        } else if (selectedSizes.length > 0) {
          // Se houver múltiplos tamanhos selecionados, cadastrar todos
          if (selectedSizes.length > 1) {
            let successCount = 0;
            for (const selectedSize of selectedSizes) {
              await onCadastrar(finalProductName, selectedSize, quantity);
              successCount++;
            }

            alert(`✅ ${successCount} variação(ões) cadastrada(s) com sucesso!`);

            setSelectedSizes([]);
            setQuantity(0);
            setMultipleMode(false);
            setProduct("");
            setCustomProductName("");
            setSizeType(null);
            setIsSubmitting(false);
            return;
          } else {
            // Se houver apenas 1 tamanho selecionado, usar ele
            finalSize = selectedSizes[0];
          }
        } else if (customSize.trim()) {
          finalSize = customSize.trim();
        }
      } else {
        if (isCustomSize && customSize.trim()) {
          finalSize = customSize.trim();
        } else if (size) {
          finalSize = size;
        }
      }

      if (!finalSize) {
        alert("Por favor, selecione ou digite um tamanho.");
        setIsSubmitting(false);
        return;
      }

      await onCadastrar(finalProductName, finalSize, quantity);

      alert(`✅ Produto "${finalProductName}" com tamanho "${finalSize}" cadastrado com sucesso!`);

      setProduct("");
      setCustomProductName("");
      setSize("");
      setCustomSize("");
      setQuantity(0);
      setIsCustomSize(false);
      setSizeType(null);
      setSelectedSizes([]);
      setMultipleMode(false);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [product, customProductName, isCustomProduct, size, customSize, isCustomSize, quantity, multipleMode, selectedSizes, sizeType, onCadastrar, isSubmitting]);

  const handleStartEdit = (productName: string) => {
    const product = customProducts.find(p => p.name === productName);
    if (product) {
      setEditingProduct(productName);
      setEditProductName(product.name);
      setEditProductVariations([...product.variations]);
    }
  };

  const handleSaveEdit = () => {
    if (!editingProduct || !onUpdateCustomProduct) return;
    
    if (!editProductName.trim()) {
      alert("O nome do produto não pode estar vazio.");
      return;
    }

    onUpdateCustomProduct(editingProduct, editProductName.trim().toUpperCase(), editProductVariations);
    setEditingProduct(null);
    setEditProductName("");
    setEditProductVariations([]);
    
    if (product === editingProduct) {
      setProduct(editProductName.trim().toUpperCase());
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProductName("");
    setEditProductVariations([]);
  };

  const handleRemoveVariation = (variation: string) => {
    setEditProductVariations(prev => prev.filter(v => v !== variation));
  };

  const handleAddVariation = (variation: string) => {
    if (!editProductVariations.includes(variation)) {
      setEditProductVariations(prev => [...prev, variation]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card de Cadastro */}
    <Card className="border-gray-200 shadow">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
            CADASTRAR NOVO PRODUTO
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-900">
                Preencha os dados do produto que deseja adicionar ao estoque. 
                Após o cadastro, você poderá registrar movimentações de entrada e saída.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="new-item-product"
              className="text-gray-700 font-medium mb-1.5 block text-sm"
            >
                PRODUTO *
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
                  {allProducts?.map((productItem) => (
                  <SelectItem
                      key={productItem.name}
                      value={productItem.name}
                  >
                      {productItem.name.toUpperCase()}
                  </SelectItem>
                ))}
                <SelectItem key="__CUSTOM__" value="__CUSTOM__">
                    CADASTRAR NOVO PRODUTO
                </SelectItem>
              </SelectContent>
            </Select>
            {isCustomProduct && (
              <Input
                id="custom-product-name"
                type="text"
                value={customProductName}
                onChange={(e) =>
                    setCustomProductName(e.target.value.toUpperCase())
                }
                  placeholder="NOME DO NOVO PRODUTO"
                required
                  className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mt-2 uppercase"
              />
            )}
          </div>

          {/* Tipo de Variação - Lista Compacta */}
          {isCustomProduct && (
            <div>
              <Label className="text-gray-700 font-medium mb-1.5 block text-sm">
                  TIPO DE VARIAÇÃO
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
                        setMultipleMode(true);
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors border-b border-gray-200 text-sm ${
                    sizeType === "letters"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                    <span>LETRAS (PP, P, M, G, GG...)</span>
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
                        setMultipleMode(true);
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors border-b border-gray-200 text-sm ${
                    sizeType === "numbers"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                    <span>NUMERAÇÃO (33, 34, 35...)</span>
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
                        setMultipleMode(false);
                    } else {
                      setSizeType("unique");
                      setCustomSize("ÚNICO");
                      setSelectedSizes([]);
                        setMultipleMode(false);
                    }
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between transition-colors text-sm ${
                    sizeType === "unique"
                      ? "bg-purple-50 text-purple-700 font-medium"
                      : "bg-white hover:bg-gray-50 text-gray-700"
                  }`}
                >
                    <span>TAMANHO ÚNICO</span>
                  {sizeType === "unique" && (
                    <span className="text-purple-600">✓</span>
                  )}
                </button>
              </div>
            </div>
          )}

            {/* Tamanho */}
          <div>
            <Label className="text-gray-700 font-medium mb-1.5 block text-sm">
                TAMANHO *
                {isCustomProduct && sizeType !== "unique" && selectedSizes.length > 0 && (
                <span className="ml-2 text-xs text-orange-600 font-normal">
                    ({selectedSizes.length} SELECIONADO
                    {selectedSizes.length > 1 ? "S" : ""})
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
                    setCustomSize("");
                      setIsCustomSize(value === "__CUSTOM_SIZE__");
                  }}
                    required={!isCustomSize}
                >
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                    <SelectContent className="max-h-[250px] select-scrollbar">
                    {availableVariations.length === 0 ? (
                      <SelectItem value="UNIQUE" disabled>
                          SELECIONE UM PRODUTO PRIMEIRO
                      </SelectItem>
                    ) : (
                      <>
                          {availableVariations.map((variation) => (
                            <SelectItem key={variation} value={variation}>
                              {variation.toUpperCase()}
                            </SelectItem>
                          ))}
                        <SelectItem value="__CUSTOM_SIZE__">
                            OUTRO TAMANHO
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
                        setCustomSize(e.target.value.toUpperCase())
                    }
                      placeholder="DIGITE O TAMANHO PERSONALIZADO"
                    required
                      className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 mt-2 uppercase"
                  />
                )}
              </>
            ) : (
              <>
                  {sizeType === "unique" ? (
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 text-sm uppercase">
                      TAMANHO ÚNICO
                  </div>
                ) : !sizeType ? (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-700 text-xs uppercase">
                      SELECIONE UM TIPO DE VARIAÇÃO ACIMA
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border border-gray-300 rounded-lg p-2 bg-white max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-5 gap-1.5">
                          {availableVariations.map((variation) => (
                            <label
                              key={variation}
                              className={`flex items-center justify-center px-2 py-1.5 rounded border cursor-pointer transition-all text-xs uppercase ${
                                selectedSizes.includes(variation)
                                  ? "bg-orange-500 text-white border-orange-600 font-medium"
                                  : "bg-white border-gray-300 hover:border-orange-400 text-gray-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSizes.includes(variation)}
                                onChange={() => {
                                  if (selectedSizes.includes(variation)) {
                                    setSelectedSizes(
                                      selectedSizes.filter((s) => s !== variation)
                                    );
                                  } else {
                                    setSelectedSizes([...selectedSizes, variation]);
                                  }
                                }}
                                className="sr-only"
                              />
                              {variation}
                            </label>
                          ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                          onClick={() => setSelectedSizes([...availableVariations])}
                          className="flex-1 px-2 py-1.5 bg-blue-50 border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors text-xs font-medium uppercase"
                        >
                          TODOS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSizes([])}
                          className="flex-1 px-2 py-1.5 bg-red-50 border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors text-xs font-medium uppercase"
                      >
                          LIMPAR
                      </button>
                    </div>

                    {selectedSizes.length > 0 && (
                        <div className="p-2 bg-green-50 border border-green-300 rounded text-xs uppercase">
                        <span className="text-green-800 font-medium">
                            SELECIONADOS:
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
                QUANTIDADE INICIAL *
                {isCustomProduct && sizeType !== "unique" && selectedSizes.length > 1 && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                    (MESMA PARA TODOS)
                </span>
              )}
            </Label>
            <Input
              id="initial-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="DIGITE A QUANTIDADE"
              className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-4 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                CADASTRANDO...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" />
                {isCustomProduct && sizeType !== "unique" && selectedSizes.length > 1
                  ? `CADASTRAR ${selectedSizes.length} VARIAÇÕES`
                  : "CADASTRAR PRODUTO"}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

      {/* Card de Gerenciamento de Produtos Customizados */}
      {customProducts.length > 0 && (
        <Card className="border-gray-200 shadow">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              GERENCIAR PRODUTOS CUSTOMIZADOS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {customProducts.map((customProduct) => {
                const isEditing = editingProduct === customProduct.name;
                
                return (
                  <div
                    key={customProduct.name}
                    className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-all"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1 block">
                            NOME DO PRODUTO
                          </Label>
                          <Input
                            value={editProductName}
                            onChange={(e) => setEditProductName(e.target.value.toUpperCase())}
                            className="uppercase"
                            placeholder="NOME DO PRODUTO"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                            VARIAÇÕES/TAMANHOS
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editProductVariations.map((variation) => (
                              <div
                                key={variation}
                                className="flex items-center gap-1 px-2 py-1 bg-orange-100 border border-orange-300 rounded text-xs uppercase"
                              >
                                <span>{variation}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariation(variation)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value && value !== "") {
                                  handleAddVariation(value);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Adicionar tamanho..." />
                              </SelectTrigger>
                              <SelectContent>
                                {[...letterSizes, ...numberSizes, "ÚNICO"]
                                  .filter(v => !editProductVariations.includes(v))
                                  .map(v => (
                                    <SelectItem key={v} value={v}>
                                      {v}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="text"
                              placeholder="Ou digite um tamanho"
                              className="h-8 text-xs uppercase"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                  if (value && !editProductVariations.includes(value)) {
                                    handleAddVariation(value);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleSaveEdit}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            SALVAR
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                          >
                            CANCELAR
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm mb-2 uppercase">
                            {customProduct.name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {customProduct.variations.map((variation) => (
                              <span
                                key={variation}
                                className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs uppercase text-gray-700"
                              >
                                {variation}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {onUpdateCustomProduct && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(customProduct.name)}
                              className="p-2 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                              title="Editar produto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onRemoveCustomProduct && (
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
                              className="p-2 rounded hover:bg-red-100 text-red-600 transition-colors"
                              title="Remover produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
