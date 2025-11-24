import { useState, useMemo, useCallback } from 'react';
import { InventoryItem } from '../AppWithSupabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Package, 
  FileText, 
  Trash2,
  Edit,
  X,
  Shirt,
  ShoppingBag,
  Footprints,
  Watch,
  Glasses,
  Backpack,
  Crown,
  Zap,
  Heart,
  Star,
  Gift,
  Briefcase,
} from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import ExcelJS from 'exceljs';
import EditItemModal from './EditItemModal';

interface EstoqueAtualProps {
  inventory: InventoryItem[];
  onDelete?: (itemId: string, itemName: string) => Promise<boolean>;
  onEdit?: (itemId: string, quantity: number) => Promise<boolean>;
}

export default function EstoqueAtual({ inventory, onDelete, onEdit }: EstoqueAtualProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'quantity-asc' | 'quantity-desc'>('name-asc');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; item: InventoryItem | null }>({
    isOpen: false,
    item: null
  });
  const [editDialog, setEditDialog] = useState<{ isOpen: boolean; item: InventoryItem | null }>({
    isOpen: false,
    item: null
  });
  const [editingQuantity, setEditingQuantity] = useState<{ itemId: string; value: string } | null>(null);

  // Filtros dinâmicos - apenas produtos e tamanhos que estão realmente no estoque
  const availableProducts = useMemo(() => {
    // Apenas produtos que estão no estoque
    const productsInInventory = new Set(inventory.map(item => item.name.toUpperCase()));
    
    return Array.from(productsInInventory).sort();
  }, [inventory]);

  // Tamanhos dinâmicos baseados no produto selecionado
  const availableSizes = useMemo(() => {
    // Se um produto estiver selecionado, mostrar apenas tamanhos desse produto
    if (productFilter !== 'all') {
      const sizesForProduct = inventory
        .filter(item => item.name.toUpperCase() === productFilter)
        .map(item => item.size.toUpperCase());
      return Array.from(new Set(sizesForProduct)).sort();
    }
    
    // Se nenhum produto selecionado, mostrar todos os tamanhos
    const sizesInInventory = new Set(inventory.map(item => item.size.toUpperCase()));
    return Array.from(sizesInInventory).sort();
  }, [inventory, productFilter]);

  const getSizeColor = (size: string): { bg: string; text: string; border: string } => {
    // Padrão ÚNICO cinza para todos os tamanhos
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
  };

  const getProductIcon = (productName: string) => {
    const nameLower = productName.toLowerCase();
    
    // Roupas
    if (nameLower.includes('camisa') || nameLower.includes('blusa') || nameLower.includes('polo') || nameLower.includes('camiseta')) {
      return Shirt;
    }
    if (nameLower.includes('calça') || nameLower.includes('short') || nameLower.includes('bermuda')) {
      return ShoppingBag;
    }
    
    // Calçados
    if (nameLower.includes('tênis') || nameLower.includes('tenis') || nameLower.includes('sapato') || nameLower.includes('chinelo') || nameLower.includes('sandália') || nameLower.includes('sandalia') || nameLower.includes('bota')) {
      return Footprints;
    }
    
    // Acessórios
    if (nameLower.includes('relógio') || nameLower.includes('relogio')) {
      return Watch;
    }
    if (nameLower.includes('óculos') || nameLower.includes('oculos')) {
      return Glasses;
    }
    if (nameLower.includes('mochila') || nameLower.includes('bolsa')) {
      return Backpack;
    }
    if (nameLower.includes('boné') || nameLower.includes('bone') || nameLower.includes('chapéu') || nameLower.includes('chapeu')) {
      return Crown;
    }
    if (nameLower.includes('jóia') || nameLower.includes('joia') || nameLower.includes('colar') || nameLower.includes('pulseira') || nameLower.includes('anel')) {
      return Star;
    }
    if (nameLower.includes('presente') || nameLower.includes('brinde') || nameLower.includes('kit')) {
      return Gift;
    }
    if (nameLower.includes('mala') || nameLower.includes('pasta') || nameLower.includes('case')) {
      return Briefcase;
    }
    
    // Padrão
    return Package;
  };

  const handleExportExcel = useCallback(async () => {
    if (inventory.length === 0) {
      alert('Não há itens no estoque para exportar.');
      return;
    }

    // Criar workbook e worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Estoque Atual', {
      properties: { tabColor: { argb: 'FFFF6B00' } }
    });

    // Definir colunas com largura
    worksheet.columns = [
      { header: 'Produto', key: 'product', width: 30 },
      { header: 'Tamanho/Variação', key: 'size', width: 18 },
      { header: 'Quantidade', key: 'quantity', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Última Atualização', key: 'lastUpdated', width: 20 }
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF6B00' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });

    // Adicionar dados
    inventory.forEach((item, index) => {
      const isLowStock = item.quantity < 10;
      const lastUpdated = new Date(item.lastUpdated).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const row = worksheet.addRow({
        product: item.name,
        size: item.size,
        quantity: item.quantity,
        status: isLowStock ? 'ESTOQUE BAIXO' : 'NORMAL',
        lastUpdated
      });

      // Estilizar linha
      const isEven = (index + 2) % 2 === 0;
      const bgColor = isEven ? 'FFF9FAFB' : 'FFFFFFFF';

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Cor de fundo alternada
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor }
        };

        // Fonte padrão
        cell.font = {
          size: 11,
          color: { argb: 'FF000000' }
        };

        // Bordas
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };

        // Alinhamento
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 3 ? 'center' : 'left'
        };

        // Estilo especial para coluna Quantidade (coluna 3)
        if (colNumber === 3) {
          cell.font = {
            bold: true,
            size: 12,
            color: { argb: 'FF000000' }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }

        // Estilo especial para coluna Status (coluna 4)
        if (colNumber === 4) {
          const status = cell.value as string;
          if (status === 'ESTOQUE BAIXO') {
            cell.font = {
              bold: true,
              color: { argb: 'FFDC2626' },
              size: 11
            };
          } else if (status === 'NORMAL') {
            cell.font = {
              bold: true,
              color: { argb: 'FF059669' },
              size: 11
            };
          }
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        }
      });
    });

    // Adicionar linha de totais
    const totalRow = worksheet.addRow({
      product: 'TOTAL DE ITENS',
      size: '',
      quantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
      status: `${inventory.length} produtos`,
      lastUpdated: ''
    });

    // Estilizar linha de totais
    totalRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }
      };
      cell.font = {
        bold: true,
        size: 12,
        color: { argb: 'FF000000' }
      };
      cell.border = {
        top: { style: 'double', color: { argb: 'FFFF6B00' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'double', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 3 ? 'center' : 'left'
      };
    });

    // Gerar arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `estoque_atual_${today}.xlsx`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();

    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    alert(`✅ Estoque exportado com sucesso!\n\n📦 ${inventory.length} produto(s)\n📊 ${totalQuantity} unidade(s) total\n📁 Arquivo: ${fileName}`);
  }, [inventory]);

  // Aplicar filtros
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Filtro de busca
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.size.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de status
      const isLowStock = item.quantity < 10;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'low' && isLowStock) ||
                           (statusFilter === 'ok' && !isLowStock);
      
      // Filtro de produto (comparação case-insensitive)
      const matchesProduct = productFilter === 'all' || item.name.toUpperCase() === productFilter;
      
      // Filtro de tamanho (comparação case-insensitive)
      const matchesSize = sizeFilter === 'all' || item.size.toUpperCase() === sizeFilter;
      
      return matchesSearch && matchesStatus && matchesProduct && matchesSize;
    });
  }, [inventory, searchTerm, statusFilter, productFilter, sizeFilter]);

  // Aplicar ordenação
  const sortedInventory = useMemo(() => {
    return [...filteredInventory].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          if (a.name !== b.name) return a.name.localeCompare(b.name);
          return a.size.localeCompare(b.size);
        case 'name-desc':
          if (a.name !== b.name) return b.name.localeCompare(a.name);
          return b.size.localeCompare(a.size);
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });
  }, [filteredInventory, sortBy]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteDialog.item || !onDelete) return;
    
    await onDelete(deleteDialog.item.id, `${deleteDialog.item.name} (${deleteDialog.item.size})`);
    setDeleteDialog({ isOpen: false, item: null });
  }, [deleteDialog.item, onDelete]);

  const handleDeleteClick = useCallback((item: InventoryItem) => {
    setDeleteDialog({ isOpen: true, item });
  }, []);

  const handleEditClick = useCallback((item: InventoryItem) => {
    setEditDialog({ isOpen: true, item });
  }, []);

  const handleEditSave = useCallback(async (itemId: string, quantity: number) => {
    if (!onEdit) return false;
    const success = await onEdit(itemId, quantity);
    if (success) {
      setEditDialog({ isOpen: false, item: null });
    }
    return success;
  }, [onEdit]);

  const handleInlineEditStart = useCallback((item: InventoryItem) => {
    setEditingQuantity({ itemId: item.id, value: item.quantity.toString() });
  }, []);

  const handleInlineEditSave = useCallback(async (itemId: string) => {
    if (!editingQuantity || !onEdit) return;
    
    const newQuantity = parseInt(editingQuantity.value);
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert('Por favor, insira uma quantidade válida (número maior ou igual a zero).');
      setEditingQuantity(null);
      return;
    }

    const success = await onEdit(itemId, newQuantity);
    if (success) {
      setEditingQuantity(null);
    } else {
      alert('Erro ao atualizar a quantidade. Tente novamente.');
    }
  }, [editingQuantity, onEdit]);

  const handleInlineEditCancel = useCallback(() => {
    setEditingQuantity(null);
  }, []);

  return (
    <>
      <Card className="border-orange-200 shadow-lg glass-card">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventário Atual
            </CardTitle>
            <Button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white shadow-md hover:shadow-xl transition-all font-semibold"
              disabled={inventory.length === 0}
            >
              <FileText className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-4 sm:px-6">
          {/* FILTROS COMPACTOS E MODERNOS */}
          <div className="mb-4 bg-white rounded-xl border-2 border-orange-200 shadow-md overflow-hidden">
            {/* Header Compacto */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white" />
                  <h3 className="font-bold text-white text-sm">Filtros</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-white/20 rounded-lg backdrop-blur-sm">
                    <span className="text-xs text-white font-semibold">
                      {sortedInventory.length}/{inventory.length}
                    </span>
                  </div>
                  {(searchTerm || statusFilter !== 'all' || productFilter !== 'all' || sizeFilter !== 'all' || sortBy !== 'name-asc') && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setProductFilter('all');
                        setSizeFilter('all');
                        setSortBy('name-asc');
                      }}
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 h-auto py-1 px-2.5 text-xs font-semibold rounded-lg transition-all"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Corpo Compacto */}
            <div className="p-3 sm:p-4 space-y-3">
              {/* Busca */}
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Buscar produto ou tamanho..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-8 h-9 bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 rounded-lg text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid de Filtros Compacto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {/* Filtro de Produto */}
                <div>
                  <Label htmlFor="product-filter" className="text-xs text-gray-600 font-semibold mb-1 block">
                    Produto
                  </Label>
                  <Select 
                    value={productFilter} 
                    onValueChange={(value) => {
                      setProductFilter(value);
                      setSizeFilter('all');
                    }}
                  >
                    <SelectTrigger id="product-filter" className="h-9 bg-gray-50 border border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-lg text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] select-scrollbar">
                      <SelectItem value="all">Todos</SelectItem>
                      {availableProducts.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Tamanho */}
                <div>
                  <Label htmlFor="size-filter" className="text-xs text-gray-600 font-semibold mb-1 block">
                    Tamanho
                  </Label>
                  <Select value={sizeFilter} onValueChange={setSizeFilter}>
                    <SelectTrigger id="size-filter" className="h-9 bg-gray-50 border border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-lg text-sm">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] select-scrollbar">
                      <SelectItem value="all">Todos</SelectItem>
                      {availableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Status */}
                <div>
                  <Label htmlFor="status-filter" className="text-xs text-gray-600 font-semibold mb-1 block">
                    Situação
                  </Label>
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'low' | 'ok') => setStatusFilter(value)}>
                    <SelectTrigger id="status-filter" className="h-9 bg-gray-50 border border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] select-scrollbar">
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Baixo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ok">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          <span>Normal</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Ordenação */}
                <div>
                  <Label htmlFor="sort-by" className="text-xs text-gray-600 font-semibold mb-1 block">
                    Ordenar
                  </Label>
                  <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                    <SelectTrigger id="sort-by" className="h-9 bg-gray-50 border border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] select-scrollbar">
                      <SelectItem value="name-asc">A→Z</SelectItem>
                      <SelectItem value="name-desc">Z→A</SelectItem>
                      <SelectItem value="quantity-asc">Qtd ↑</SelectItem>
                      <SelectItem value="quantity-desc">Qtd ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Estatísticas Compactas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div className={`p-2.5 rounded-lg ${
                  inventory.filter(i => i.quantity < 10).length > 0
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle className={`w-3.5 h-3.5 ${
                      inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <span className="text-xs font-semibold text-gray-700">Baixo</span>
                  </div>
                  <p className={`text-lg font-black ${
                    inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-700' : 'text-gray-500'
                  }`}>
                    {inventory.filter(i => i.quantity < 10).length}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">Normal</span>
                  </div>
                  <p className="text-lg font-black text-green-700">
                    {inventory.filter(i => i.quantity >= 10).length}
                  </p>
                </div>
              </div>

              {/* Indicador de Filtro Ativo */}
              {sortedInventory.length !== inventory.length && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <Filter className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-800">
                    {sortedInventory.length} de {inventory.length} produtos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="overflow-y-auto max-h-[calc(100vh-450px)] pr-2 sm:pr-4 custom-scrollbar">
            {sortedInventory.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  {inventory.length === 0 
                    ? 'Nenhum produto cadastrado ainda'
                    : 'Nenhum produto encontrado com os filtros selecionados'}
                </p>
                <p className="text-gray-400 text-sm">
                  {inventory.length === 0 && 'Comece cadastrando um novo item na aba "Cadastrar"'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pb-6">
              {sortedInventory.map((item) => {
                const isLowStock = item.quantity < 10;
                const ProductIcon = getProductIcon(item.name);
                
                return (
                  <div
                    key={item.id}
                    className={`group relative aspect-square rounded-xl overflow-hidden bg-white border-2 shadow-md hover:shadow-xl ${
                      isLowStock 
                        ? 'border-red-400 hover:border-red-500' 
                        : 'border-green-400 hover:border-green-500'
                    }`}
                  >
                    {/* Header - Verde para OK, Vermelho para Baixo */}
                    <div className={`relative px-3 py-2 ${
                      isLowStock 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
                            <ProductIcon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-white font-bold uppercase text-[10px] tracking-wide">
                            {isLowStock ? 'BAIXO' : 'OK'}
                          </span>
                        </div>
                        {/* Botão de Excluir - Sempre visível */}
                        {onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item);
                            }}
                            className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors shadow-sm hover:shadow-md"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Corpo do Card */}
                    <div className="p-3 h-full flex flex-col justify-between">
                      {/* Nome do Produto */}
                      <div className="flex-1 mb-3">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-3">
                          {item.name}
                        </h3>
                        
                        {/* Tamanho Badge - Maior */}
                        <div className="mb-2">
                          {(() => {
                            const sizeColor = getSizeColor(item.size);
                            const isNumeric = !isNaN(parseInt(item.size)) && parseInt(item.size) !== 0;
                            const num = parseInt(item.size);
                            const isAutoGenerated = isNumeric && (num < 33 || num > 50);
                            
                            if (isAutoGenerated) {
                              const generateUniqueColor = (number: number) => {
                                const hash = ((number * 2654435761) % 360);
                                const hue = Math.abs(hash) % 360;
                                const saturation = 65;
                                const lightness = 55;
                                
                                const hslToRgb = (h: number, s: number, l: number) => {
                                  s /= 100;
                                  l /= 100;
                                  const k = (n: number) => (n + h / 30) % 12;
                                  const a = s * Math.min(l, 1 - l);
                                  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
                                  return [
                                    Math.round(255 * f(0)),
                                    Math.round(255 * f(8)),
                                    Math.round(255 * f(4))
                                  ];
                                };
                                
                                const [r, g, b] = hslToRgb(hue, saturation, lightness);
                                const [r2, g2, b2] = [Math.max(0, r - 25), Math.max(0, g - 25), Math.max(0, b - 25)];
                                const [rb, gb, bb] = [Math.min(255, r + 60), Math.min(255, g + 60), Math.min(255, b + 60)];
                                
                                return {
                                  bg: `linear-gradient(to right, rgb(${r}, ${g}, ${b}), rgb(${r2}, ${g2}, ${b2}))`,
                                  border: `rgb(${rb}, ${gb}, ${bb})`,
                                };
                              };
                              
                              const uniqueColor = generateUniqueColor(num);
                              
                              return (
                                <span 
                                  className="inline-block px-3 py-1.5 text-white font-bold rounded-lg text-xs border-2 shadow-md"
                                  style={{
                                    background: uniqueColor.bg,
                                    borderColor: uniqueColor.border
                                  }}
                                >
                                  {item.size}
                                </span>
                              );
                            }
                            
                            return (
                              <span className={`inline-block px-3 py-1.5 ${sizeColor.bg} ${sizeColor.text} font-bold rounded-lg text-xs border-2 ${sizeColor.border} shadow-md`}>
                                {item.size}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Quantidade - Edição Inline */}
                      <div className="mt-auto">
                        <div className={`rounded-lg p-3 border-2 ${
                          isLowStock 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-green-50 border-green-300'
                        }`}>
                          <div className="flex items-center justify-between gap-2">
                            {/* Quantidade - Editável */}
                            {editingQuantity?.itemId === item.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <Input
                                  type="number"
                                  min="0"
                                  value={editingQuantity.value}
                                  onChange={(e) => setEditingQuantity({ ...editingQuantity, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineEditSave(item.id);
                                    } else if (e.key === 'Escape') {
                                      handleInlineEditCancel();
                                    }
                                  }}
                                  onBlur={() => handleInlineEditSave(item.id)}
                                  autoFocus
                                  className={`flex-1 h-10 text-2xl font-black text-center border-2 ${
                                    isLowStock 
                                      ? 'border-red-400 focus:border-red-500' 
                                      : 'border-green-400 focus:border-green-500'
                                  }`}
                                />
                                <button
                                  onClick={() => handleInlineEditSave(item.id)}
                                  className="p-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors"
                                  title="Salvar"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleInlineEditCancel}
                                  className="p-1.5 rounded-md bg-gray-400 hover:bg-gray-500 text-white transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div 
                                  className="flex items-center gap-2 flex-1 cursor-pointer group"
                                  onClick={() => onEdit && handleInlineEditStart(item)}
                                  title="Clique para editar quantidade"
                                >
                                  <p className={`text-4xl font-black leading-none ${
                                    isLowStock ? 'text-red-700' : 'text-green-700'
                                  } group-hover:opacity-80 transition-opacity`}>
                                    {item.quantity}
                                  </p>
                                  {onEdit && (
                                    <Edit className={`w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity ${
                                      isLowStock ? 'text-red-600' : 'text-green-600'
                                    }`} />
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold ${
                                  isLowStock 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-green-500 text-white'
                                }`}>
                                  {isLowStock ? (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>BAIXO</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>OK</span>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Data */}
                        <p className="text-[10px] text-gray-500 mt-2.5 text-center font-medium">
                          Atualizado: {new Date(item.lastUpdated).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => setDeleteDialog({ isOpen: open, item: deleteDialog.item })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Item</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir o item <span className="font-bold">{deleteDialog.item?.name} ({deleteDialog.item?.size})</span> do inventário?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edição de item */}
      <EditItemModal
        isOpen={editDialog.isOpen}
        item={editDialog.item}
        onClose={() => setEditDialog({ isOpen: false, item: null })}
        onSave={handleEditSave}
      />
    </>
  );
}