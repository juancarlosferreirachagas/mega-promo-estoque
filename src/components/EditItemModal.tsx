import { useState, useEffect } from "react";
import { InventoryItem } from "../AppWithSupabase";
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
import { Edit, Package, Info } from "lucide-react";

interface EditItemModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (itemId: string, quantity: number) => Promise<boolean>;
}

export default function EditItemModal({
  isOpen,
  item,
  onClose,
  onSave,
}: EditItemModalProps) {
  const [quantity, setQuantity] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Preenche os campos quando o item é carregado
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    if (quantity < 0) {
      alert("A quantidade não pode ser negativa.");
      return;
    }

    setIsSaving(true);
    const success = await onSave(item.id, quantity);
    setIsSaving(false);

    if (success) {
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border border-gray-300 shadow-lg">
        <DialogHeader className="space-y-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded">
              <Edit className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-900">
                Editar Item do Estoque
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Atualize a quantidade do item no estoque
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Informações do Item */}
          <div className="space-y-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm">
                Informações do Produto
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Produto
                  </Label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {item.name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Tamanho/Variação
                  </Label>
                  <p className="text-base font-semibold text-gray-900 mt-1">
                    {item.size}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide">
                    Quantidade Atual
                  </Label>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {item.quantity}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  <strong>Nota:</strong> Esta edição atualiza apenas a quantidade do item. 
                  Para alterar o nome ou tamanho, exclua o item e cadastre um novo.
                </p>
              </div>
            </div>
          </div>

          {/* Quantidade Nova */}
          <div>
            <Label
              htmlFor="edit-item-quantity"
              className="text-gray-700 font-medium mb-2 block"
            >
              Nova Quantidade *
            </Label>
            <Input
              id="edit-item-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-lg font-semibold"
              placeholder="Digite a nova quantidade"
            />
            <p className="text-xs text-gray-500 mt-1">
              Quantidade atual: <span className="font-semibold">{item.quantity}</span>
            </p>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || quantity < 0}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

