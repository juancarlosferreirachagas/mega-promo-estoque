import { useState, useEffect } from "react";
import { Movement, ProductWithVariations, InventoryItem } from "../AppWithSupabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Edit,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import { MOTIVOS_ENTRADA, MOTIVOS_SAIDA } from "../utils/initialData";

interface EditMovementModalProps {
  isOpen: boolean;
  movement: Movement | null;
  inventory: InventoryItem[];
  allProducts: ProductWithVariations[];
  onClose: () => void;
  onSave: (
    movementId: string,
    newType: "entrada" | "saida",
    newQuantity: number,
    newReason: string,
    newPersonName: string,
    newResponsible: string,
    newObservations?: string,
    newProductName?: string,
    newSize?: string
  ) => void;
}

export default function EditMovementModal({
  isOpen,
  movement,
  inventory,
  allProducts,
  onClose,
  onSave,
}: EditMovementModalProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [personName, setPersonName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [observations, setObservations] = useState("");

  const isCustomReason = reason === "Outros";

  // Preenche os campos quando o movimento é carregado
  useEffect(() => {
    if (movement) {
      // Buscar o item no inventário para pegar nome e tamanho
      const item = inventory.find(i => i.id === movement.itemId);
      if (item) {
        setSelectedProduct(item.name);
        setSelectedSize(item.size);
      }
      
      setType(movement.type);
      setQuantity(movement.quantity);
      
      // Verificar se o motivo está na lista de motivos padrão
      const allMotivos = [...MOTIVOS_ENTRADA, ...MOTIVOS_SAIDA];
      if (allMotivos.includes(movement.reason)) {
        setReason(movement.reason);
        setCustomReason('');
      } else {
        // Se não estiver na lista, é um motivo personalizado
        setReason('Outros');
        setCustomReason(movement.reason);
      }
      
      setPersonName(movement.personName);
      setResponsible(movement.responsible);
      setObservations(movement.observations || "");
    }
  }, [movement, inventory]);

  // Resetar o tamanho quando o produto mudar
  const handleProductChange = (productName: string) => {
    setSelectedProduct(productName);
    setSelectedSize(""); // Limpa a seleção de tamanho
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!movement) return;

    const finalReason = isCustomReason ? customReason.trim() : reason.trim();

    if (
      !selectedProduct ||
      !selectedSize ||
      quantity <= 0 ||
      !reason.trim() ||
      (isCustomReason && !customReason.trim()) ||
      !personName.trim() ||
      !responsible.trim()
    ) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    onSave(
      movement.id,
      type,
      quantity,
      finalReason,
      personName.trim(),
      responsible.trim(),
      observations.trim(),
      selectedProduct,
      selectedSize
    );
  };

  if (!movement) return null;

  // Buscar o produto selecionado e todos os tamanhos disponíveis no estoque
  const currentProduct = allProducts?.find(p => p.name === selectedProduct);
  
  // CORREÇÃO: Pegar todos os tamanhos que já existem no estoque para este produto
  const sizesInInventory = inventory
    .filter(item => item.name === selectedProduct)
    .map(item => item.size);
  
  // Combinar as variações do produto cadastrado com os tamanhos que já existem no estoque
  const productVariations = currentProduct?.variations || [];
  const allAvailableSizes = [...new Set([...productVariations, ...sizesInInventory])];
  
  const availableSizes = allAvailableSizes;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-lg">
        <DialogHeader className="space-y-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded">
              <Edit className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-900">
                Editar Movimentação
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Modifique os campos que desejar alterar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Seleção de Produto e Tamanho */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">
                Produto e Variação
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Produto */}
              <div>
                <Label
                  htmlFor="edit-product"
                  className="text-gray-700 font-medium mb-2 block"
                >
                  Produto *
                </Label>
                <Select
                  value={selectedProduct}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] select-scrollbar">
                    {allProducts.map((product) => (
                      <SelectItem key={product.name} value={product.name}>
                        {product.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanho */}
              <div>
                <Label
                  htmlFor="edit-size"
                  className="text-gray-700 font-medium mb-2 block"
                >
                  Tamanho/Variação *
                </Label>
                <Select
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500">
                    <SelectValue
                      placeholder={
                        selectedProduct
                          ? "Selecione o tamanho"
                          : "Selecione o produto primeiro"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] select-scrollbar">
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size.toUpperCase()}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        NENHUM TAMANHO DISPONÍVEL
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Atenção:</strong> Ao alterar o produto/tamanho, o estoque do item original será revertido e o novo item será atualizado.
                </p>
              </div>
            </div>
          </div>

          {/* Tipo e Quantidade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="edit-movement-type"
                className="text-gray-700 font-medium mb-2 block"
              >
                Tipo de Movimento *
              </Label>
              <Select
                value={type}
                onValueChange={(value: "entrada" | "saida") =>
                  setType(value)
                }
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <div className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-green-600" />
                      <span>ENTRADA (+)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="saida">
                    <div className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4 text-red-600" />
                      <span>SAÍDA (-)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="edit-movement-quantity"
                className="text-gray-700 font-medium mb-2 block"
              >
                Quantidade *
              </Label>
              <Input
                id="edit-movement-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Detalhes */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">
                Detalhes da Transação
              </span>
            </div>

            <div>
              <Label
                htmlFor="edit-movement-reason"
                className="text-gray-700 font-medium mb-2 block"
              >
                Motivo da Movimentação *
              </Label>
              <Select
                value={reason}
                onValueChange={setReason}
              >
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Escolha o motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {type === "entrada" ? (
                    MOTIVOS_ENTRADA.map(motivo => (
                      <SelectItem key={motivo} value={motivo}>{motivo.toUpperCase()}</SelectItem>
                    ))
                  ) : (
                    MOTIVOS_SAIDA.map(motivo => (
                      <SelectItem key={motivo} value={motivo}>{motivo.toUpperCase()}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {isCustomReason && (
                <Input
                  id="edit-movement-custom-reason"
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  required
                  placeholder="Digite o motivo personalizado"
                  className="mt-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>

            <div>
              <Label
                htmlFor="edit-movement-person-name"
                className="text-gray-700 font-medium mb-2 block"
              >
                Funcionário/Fornecedor *
              </Label>
              <Input
                id="edit-movement-person-name"
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                required
                placeholder="Nome do funcionário ou fornecedor"
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label
                htmlFor="edit-movement-responsible"
                className="text-gray-700 font-medium mb-2 block"
              >
                Responsável pela Transação *
              </Label>
              <Input
                id="edit-movement-responsible"
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                required
                placeholder="Seu nome ou do colaborador"
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label
                htmlFor="edit-movement-observations"
                className="text-gray-700 font-medium mb-2 block"
              >
                Observações (Opcional)
              </Label>
              <Input
                id="edit-movement-observations"
                type="text"
                value={observations}
                onChange={(e) =>
                  setObservations(e.target.value)
                }
                placeholder="Informações adicionais sobre a movimentação..."
                className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}