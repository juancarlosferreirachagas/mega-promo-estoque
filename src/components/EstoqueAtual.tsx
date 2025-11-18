import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Package, 
  FileText, 
  Trash2,
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

interface EstoqueAtualProps {
  inventory: InventoryItem[];
  onDelete?: (itemId: string, itemName: string) => Promise<boolean>;
}

export default function EstoqueAtual({ inventory, onDelete }: EstoqueAtualProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'quantity-asc' | 'quantity-desc'>('name-asc');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; item: InventoryItem | null }>({
    isOpen: false,
    item: null
  });

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

  const handleExportExcel = async () => {
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
  };

  // Aplicar filtros
  const filteredInventory = inventory.filter(item => {
    // Filtro de busca
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.size.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de status
    const isLowStock = item.quantity < 10;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'low' && isLowStock) ||
                         (statusFilter === 'ok' && !isLowStock);
    
    return matchesSearch && matchesStatus;
  });

  // Aplicar ordenação
  const sortedInventory = [...filteredInventory].sort((a, b) => {
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

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item || !onDelete) return;
    
    await onDelete(deleteDialog.item.id, `${deleteDialog.item.name} (${deleteDialog.item.size})`);
    setDeleteDialog({ isOpen: false, item: null });
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setDeleteDialog({ isOpen: true, item });
  };

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
        <CardContent className="pt-6">
          {/* FILTROS MODERNOS E INTELIGENTES */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 backdrop-blur-sm rounded-2xl border-2 border-orange-200/50 shadow-xl overflow-hidden"
          >
            {/* Header do Filtro */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-5 py-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Filter className="w-4 h-4 text-white" />
                  <h3 className="font-bold text-white tracking-wide uppercase text-sm">FILTROS</h3>
                </div>
                
                {/* Badge de Resultados */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-lg border border-white/40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/90 font-medium">Mostrando</span>
                      <span className="font-bold text-white">{sortedInventory.length}</span>
                      <span className="text-xs text-white/80">/ {inventory.length}</span>
                    </div>
                  </div>
                  
                  {/* Botão Limpar Filtros */}
                  {(searchTerm || statusFilter !== 'all' || sortBy !== 'name-asc') && (
                    <Button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setSortBy('name-asc');
                      }}
                      className="bg-white/30 hover:bg-white/40 text-white border border-white/40 backdrop-blur-sm font-bold text-xs h-auto py-1.5 px-3 rounded-lg transition-all hover:shadow-lg"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Corpo dos Filtros */}
            <div className="p-4 space-y-3">
              {/* Linha 1: Busca Inteligente */}
              <div>
                <Label htmlFor="search" className="text-gray-700 font-bold mb-1.5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-orange-600" />
                  Busca Inteligente
                </Label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Digite nome, tamanho ou código do produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 h-10 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 shadow-sm hover:shadow-md transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <span className="text-xl font-bold">×</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Linha 2: Grid de Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Filtro de Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="status-filter" className="text-gray-700 font-bold flex items-center gap-2">
                    <div className={`p-1 rounded-md ${
                      statusFilter === 'low' ? 'bg-red-100' :
                      statusFilter === 'ok' ? 'bg-green-100' :
                      'bg-blue-100'
                    }`}>
                      {statusFilter === 'low' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                      ) : statusFilter === 'ok' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </div>
                    Situação do Estoque
                  </Label>
                  <Select value={statusFilter} onValueChange={(value: 'all' | 'low' | 'ok') => setStatusFilter(value)}>
                    <SelectTrigger id="status-filter" className="h-10 bg-white border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="font-medium">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span>Todos os Produtos</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low" className="font-medium">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span>Estoque Baixo</span>
                          <span className="text-xs text-gray-500">({"<"} 10 un)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ok" className="font-medium">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Estoque Normal</span>
                          <span className="text-xs text-gray-500">(≥ 10 un)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtro de Ordenação */}
                <div className="space-y-1.5">
                  <Label htmlFor="sort-by" className="text-gray-700 font-bold flex items-center gap-2">
                    <div className="p-1 bg-purple-100 rounded-md">
                      <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    Ordenação
                  </Label>
                  <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                    <SelectTrigger id="sort-by" className="h-10 bg-white border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-xl font-medium shadow-sm hover:shadow-md transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="name-asc" className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-bold">A→Z</span>
                          <span>Nome Crescente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="name-desc" className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-bold">Z→A</span>
                          <span>Nome Decrescente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="quantity-asc" className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold">↑</span>
                          <span>Menor Quantidade</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="quantity-desc" className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">↓</span>
                          <span>Maior Quantidade</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estatísticas Rápidas */}
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-bold flex items-center gap-2">
                    <div className="p-1 bg-indigo-100 rounded-md">
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    Estatísticas Rápidas
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 rounded-xl shadow-md border-2 border-red-400">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <AlertCircle className="w-3 h-3 text-white" />
                        <span className="text-[9px] text-white/80 font-bold uppercase tracking-wide">Baixo</span>
                      </div>
                      <p className="text-xl font-black text-white leading-none">
                        {inventory.filter(i => i.quantity < 10).length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl shadow-md border-2 border-green-400">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                        <span className="text-[9px] text-white/80 font-bold uppercase tracking-wide">Normal</span>
                      </div>
                      <p className="text-xl font-black text-white leading-none">
                        {inventory.filter(i => i.quantity >= 10).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar - Indicador Visual */}
              {sortedInventory.length !== inventory.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl border-2 border-blue-400 shadow-md"
                >
                  <Filter className="w-4 h-4 text-white" />
                  <span className="text-sm font-bold text-white">
                    Filtro ativo: Mostrando {sortedInventory.length} de {inventory.length} produtos
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Lista de Itens */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sortedInventory.map(item => {
                const isLowStock = item.quantity < 10;
                const ProductIcon = getProductIcon(item.name);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border-2 ${
                      isLowStock 
                        ? 'border-red-400 hover:border-red-500' 
                        : 'border-green-400 hover:border-green-500'
                    }`}
                  >
                    {/* Header do Card - Compacto */}
                    <div className={`px-2.5 py-1.5 ${
                      isLowStock 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <ProductIcon className="w-3.5 h-3.5 text-white" />
                        <span className="text-white font-black uppercase text-[10px] tracking-wide">
                          {isLowStock ? 'Estoque Baixo' : 'Normal'}
                        </span>
                      </div>
                    </div>

                    {/* Corpo do Card - Compacto */}
                    <div className="p-3">
                      {/* Nome do Produto com ícone */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mt-0.5 shrink-0">
                          <ProductIcon className="w-3.5 h-3.5 text-gray-700" />
                        </div>
                        <h3 className="font-black text-gray-900 text-sm flex-1 line-clamp-2 leading-tight">
                          {item.name}
                        </h3>
                        {/* Botão Excluir - Compacto */}
                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-600 transition-all shadow-sm hover:shadow-md group shrink-0"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                      </div>
                      
                      {/* Tamanho/Variação - Compacto */}
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
                        {(() => {
                          const sizeColor = getSizeColor(item.size);
                          const isNumeric = !isNaN(parseInt(item.size)) && parseInt(item.size) !== 0;
                          const num = parseInt(item.size);
                          const isAutoGenerated = isNumeric && (num < 33 || num > 50);
                          
                          if (isAutoGenerated) {
                            // Usar styles inline para cores geradas
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
                                className="px-2 py-1 text-white font-black rounded-md shadow-sm border text-xs"
                                style={{
                                  background: uniqueColor.bg,
                                  borderColor: uniqueColor.border
                                }}
                              >
                                {item.size}
                              </span>
                            );
                          }
                          
                          // Usar classes Tailwind para cores predefinidas
                          return (
                            <span className={`px-2 py-1 ${sizeColor.bg} ${sizeColor.text} font-black rounded-md shadow-sm border text-xs ${sizeColor.border}`}>
                              {item.size}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Quantidade - Compacto */}
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-black">Qtd</p>
                          <p className="text-3xl font-black text-gray-900 leading-none">
                            {item.quantity}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black shadow-sm ${
                          isLowStock 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {isLowStock ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>Baixo</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>OK</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Data de Atualização - Compacto */}
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-[10px] text-gray-500">
                          <span className="font-black">Atualizado:</span>{" "}
                          {new Date(item.lastUpdated).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
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
    </>
  );
}