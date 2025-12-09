import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  FileText,
  Edit,
  Trash2,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
  User,
  UserCircle,
  Package,
  Calendar,
  Shield,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
} from "lucide-react";
import { getProductIcon } from "../utils/productIcons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ExcelJS from "exceljs";
import { getMovementAuditLog } from "../utils/api";
import { Movement, InventoryItem } from "../AppWithSupabase";

interface HistoricoProps {
  movements: Movement[];
  inventory: InventoryItem[];
  onEdit: (movement: Movement) => void;
  onDelete: (movementId: string) => void;
  currentUser: any | null;
  canEdit: boolean;
  canDelete: boolean;
}

export default function Historico({
  movements = [],
  inventory = [],
  onEdit,
  onDelete,
  currentUser,
  canEdit,
  canDelete,
}: HistoricoProps) {
  // Estados
  const [auditLogs, setAuditLogs] = useState<Record<string, any[]>>({});
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState<Record<string, boolean>>({});
  const [expandedHistorico, setExpandedHistorico] = useState<Record<string, boolean>>({});
  const [searchPerson, setSearchPerson] = useState("");
  const [searchResponsible, setSearchResponsible] = useState("");

  // Constantes
  const fieldLabels: Record<string, string> = {
    type: "Tipo",
    quantity: "Quantidade",
    reason: "Motivo",
    person_name: "Nome da Pessoa",
    responsible: "Responsável",
    observations: "Observações",
    name: "Produto",
    size: "Tamanho",
  };

  // Funções auxiliares
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "-";
    if (key === "type") {
      return value === "entrada" ? "ENTRADA" : "SAÍDA";
    }
    return String(value);
  };

  const formatTimestamp = (timestamp: number | string): string => {
    try {
      return new Date(timestamp).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      console.error("Erro ao formatar timestamp:", error);
      return "-";
    }
  };


  const getItemInfo = useCallback((itemId: string) => {
    if (!inventory || !itemId) {
      return { name: "Produto removido", size: "N/A" };
    }
    const item = inventory.find((i) => i && i.id === itemId);
    return item || { name: "Produto removido", size: "N/A" };
  }, [inventory]);

  // Debounce para busca - otimização de performance
  const [debouncedSearchPerson, setDebouncedSearchPerson] = useState('');
  const [debouncedSearchResponsible, setDebouncedSearchResponsible] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchPerson(searchPerson);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchPerson]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchResponsible(searchResponsible);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchResponsible]);

  // Filtros - memoizado com debounce para melhor performance
  const filteredMovements = useMemo(() => {
    if (!movements || movements.length === 0) {
      return [];
    }
    
    const personLower = debouncedSearchPerson.toLowerCase();
    const responsibleLower = debouncedSearchResponsible.toLowerCase();
    
    return movements.filter((movement) => {
      if (!movement) return false;
      
      const matchesPerson = !personLower || (movement.personName
        ? movement.personName.toLowerCase().includes(personLower)
        : false);

      const matchesResponsible = !responsibleLower || (movement.responsible
        ? movement.responsible.toLowerCase().includes(responsibleLower)
        : false);

      return matchesPerson && matchesResponsible;
    });
  }, [movements, debouncedSearchPerson, debouncedSearchResponsible]);

  // Carregar logs de auditoria
  useEffect(() => {
    if (!movements || movements.length === 0) {
      return;
    }
    
    const loadAuditLogs = async () => {
      const editedMovements = movements.filter((m) => m && m.editedBy);

      for (const movement of editedMovements) {
        if (!movement || !movement.id) continue;
        
        setIsLoadingAuditLogs((prev) => ({
          ...prev,
          [movement.id]: true,
        }));

        try {
          const logs = await getMovementAuditLog(movement.id);
          setAuditLogs((prev) => ({
            ...prev,
            [movement.id]: logs || [],
          }));
        } catch (error) {
          console.error(`Erro ao carregar logs da movimentação ${movement.id}:`, error);
        } finally {
          setIsLoadingAuditLogs((prev) => ({
            ...prev,
            [movement.id]: false,
          }));
        }
      }
    };

    loadAuditLogs();
  }, [movements]);

  // Exportar para Excel - memoizado (usa filteredMovements)
  const handleExportExcel = useCallback(async () => {
    if (!filteredMovements || filteredMovements.length === 0) {
      alert("Não há movimentações para exportar.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Histórico", {
        properties: { tabColor: { argb: "FFFF6B00" } },
      });

      worksheet.columns = [
        { header: "Data/Hora", key: "dateTime", width: 18 },
        { header: "Produto", key: "product", width: 25 },
        { header: "Tamanho", key: "size", width: 12 },
        { header: "Tipo", key: "type", width: 12 },
        { header: "Quantidade", key: "quantity", width: 12 },
        { header: "Motivo", key: "reason", width: 30 },
        { header: "Funcionário/Fornecedor", key: "person", width: 25 },
        { header: "Responsável", key: "responsible", width: 25 },
        { header: "Criado Por", key: "createdBy", width: 20 },
        { header: "Editado Por", key: "editedBy", width: 20 },
        { header: "Data Edição", key: "editedAt", width: 18 },
        { header: "Observações", key: "observations", width: 35 },
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF6B00" },
        };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
          size: 12,
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF000000" } },
          left: { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right: { style: "thin", color: { argb: "FF000000" } },
        };
      });

      filteredMovements.forEach((m, index) => {
        if (!m) return;
        
        const itemInfo = getItemInfo(m.itemId);
        const dateTime = new Date(m.timestamp).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const editedAt = m.editedAt
          ? new Date(m.editedAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-";

        const row = worksheet.addRow({
          dateTime,
          product: itemInfo.name,
          size: itemInfo.size,
          type: m.type === "entrada" ? "ENTRADA" : "SAÍDA",
          quantity: m.quantity,
          reason: m.reason || "-",
          person: m.personName || "-",
          responsible: m.responsible || "-",
          createdBy: m.createdBy || "-",
          editedBy: m.editedBy || "-",
          editedAt,
          observations: m.observations || "-",
        });

        const isEven = (index + 2) % 2 === 0;
        const bgColor = isEven ? "FFF9FAFB" : "FFFFFFFF";

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          cell.font = {
            size: 11,
            color: { argb: "FF000000" },
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE5E7EB" } },
            left: { style: "thin", color: { argb: "FFE5E7EB" } },
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
            right: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: colNumber === 5 ? "center" : "left",
          };

          if (colNumber === 4) {
            const tipo = cell.value as string;
            if (tipo === "ENTRADA") {
              cell.font = {
                bold: true,
                color: { argb: "FF059669" },
                size: 11,
              };
            } else if (tipo === "SAÍDA") {
              cell.font = {
                bold: true,
                color: { argb: "FFDC2626" },
                size: 11,
              };
            }
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const today = new Date().toISOString().slice(0, 10);
      const fileName = `historico_movimentacoes_${today}.xlsx`;

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();

      alert(
        `✅ Histórico exportado com sucesso!\n\n📊 ${filteredMovements.length} registro(s) exportado(s)\n📁 Arquivo: ${fileName}`,
      );
    } catch (error) {
      console.error("Erro ao exportar histórico:", error);
      alert("Erro ao exportar histórico. Tente novamente.");
    }
  }, [filteredMovements, getItemInfo]);

  // Renderização
  try {
    return (
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histórico de Movimentações
            </CardTitle>
            <Button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2 text-white shadow-md hover:shadow-xl transition-all"
              disabled={!filteredMovements || filteredMovements.length === 0}
            >
              <FileText className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!movements || movements.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">
                Nenhuma movimentação registrada ainda
              </p>
              <p className="text-gray-400 text-sm">
                As movimentações de entrada e saída aparecerão aqui
              </p>
            </div>
          ) : (
            <>
              {/* SEÇÃO DE FILTROS MELHORADA */}
              <div className="mb-6 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 backdrop-blur-sm rounded-2xl border-2 border-orange-200/50 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-5 py-2.5 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <Filter className="w-4 h-4 text-white" />
                      <h3 className="font-bold text-white tracking-wide uppercase text-sm">
                        FILTROS
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-lg border border-white/40">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-white/90 font-medium">
                            Mostrando
                          </span>
                          <span className="font-bold text-white">
                            {filteredMovements.length}
                          </span>
                          <span className="text-xs text-white/80">
                            / {movements.length}
                          </span>
                        </div>
                      </div>
                      {(searchPerson || searchResponsible) && (
                        <Button
                          onClick={() => {
                            setSearchPerson("");
                            setSearchResponsible("");
                          }}
                          className="bg-white/30 hover:bg-white/40 text-white border border-white/40 backdrop-blur-sm font-bold text-xs h-auto py-1.5 px-3 rounded-lg transition-all hover:shadow-lg"
                        >
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="search-person"
                      className="text-gray-700 font-bold mb-1.5 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-orange-600" />
                      Empresa | Pessoa
                    </Label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                      <Input
                        id="search-person"
                        type="text"
                        placeholder="Buscar por empresa ou pessoa..."
                        value={searchPerson}
                        onChange={(e) => setSearchPerson(e.target.value)}
                        className="pl-12 pr-10 h-10 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 shadow-sm hover:shadow-md transition-all"
                      />
                      {searchPerson && (
                        <button
                          onClick={() => setSearchPerson("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Limpar busca"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label
                      htmlFor="search-responsible"
                      className="text-gray-700 font-bold mb-1.5 flex items-center gap-2"
                    >
                      <UserCircle className="w-4 h-4 text-orange-600" />
                      Responsável
                    </Label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                      <Input
                        id="search-responsible"
                        type="text"
                        placeholder="Buscar por responsável..."
                        value={searchResponsible}
                        onChange={(e) => setSearchResponsible(e.target.value)}
                        className="pl-12 pr-10 h-10 bg-white border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 shadow-sm hover:shadow-md transition-all"
                      />
                      {searchResponsible && (
                        <button
                          onClick={() => setSearchResponsible("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Limpar busca"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Indicador de filtro ativo */}
                {(debouncedSearchPerson || debouncedSearchResponsible) && (
                  <div className="px-4 pb-3">
                    <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <Filter className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-xs font-semibold text-orange-800">
                        Filtros ativos: {filteredMovements.length} resultado(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* LISTA DE MOVIMENTAÇÕES */}
              <div className="space-y-3">
                {filteredMovements.map((movement) => {
                  if (!movement) return null;
                  
                  const itemInfo = getItemInfo(movement.itemId);
                  const ProductIcon = getProductIcon(itemInfo.name);
                  
                  return (
                    <div
                      key={movement.id}
                      className={`rounded-lg border-2 overflow-hidden shadow-md hover:shadow-lg transition-all bg-white ${
                        movement.type === "entrada"
                          ? "border-green-400"
                          : "border-red-400"
                      }`}
                    >
                      {/* Header */}
                      <div
                        className={`px-3 py-2 flex items-center justify-between ${
                          movement.type === "entrada"
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-red-500 to-red-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {movement.type === "entrada" ? (
                            <div className="flex items-center gap-2">
                              <ArrowDownCircle className="w-4 h-4 text-white" />
                              <span className="font-semibold text-xs text-white">
                                ENTRADA
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle className="w-4 h-4 text-white" />
                              <span className="font-semibold text-xs text-white">
                                SAÍDA
                              </span>
                            </div>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-white/90 text-gray-900">
                            {movement.quantity} {movement.quantity === 1 ? "un" : "uns"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-white text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {formatTimestamp(movement.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="p-3">
                        {/* Produto */}
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-200">
                          <div className="p-1.5 bg-orange-500 rounded-lg shadow-sm">
                            <ProductIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {itemInfo.name}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md border border-gray-300 text-sm font-medium">
                              {itemInfo.size}
                            </span>
                          </div>
                        </div>

                        {/* Grid de Informações */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-300">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Info className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs text-gray-500 uppercase font-medium">
                                Motivo
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 font-medium truncate">
                              {movement.reason || "-"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-300">
                            <div className="flex items-center gap-1 mb-0.5">
                              <User className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs text-gray-500 uppercase font-medium">
                                {movement.type === "entrada" ? "Empresa | Pessoa" : "Pessoa"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 font-medium truncate">
                              {movement.personName || "-"}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg border border-gray-300">
                            <div className="flex items-center gap-1 mb-0.5">
                              <UserCircle className="w-3.5 h-3.5 text-gray-500" />
                              <span className="text-xs text-gray-500 uppercase font-medium">
                                Responsável
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 font-medium truncate">
                              {movement.responsible || "-"}
                            </p>
                          </div>
                        </div>

                        {/* Informações de Auditoria */}
                        {movement.editedBy && (
                          <div className="mb-3 p-2 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm">
                            <button
                              onClick={() =>
                                setExpandedHistorico((prev) => ({
                                  ...prev,
                                  [movement.id]: !prev[movement.id],
                                }))
                              }
                              className="w-full flex items-center justify-between hover:bg-amber-100 rounded p-1.5 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-700" />
                                <span className="text-sm text-amber-900 font-semibold uppercase">
                                  Histórico de Edições
                                </span>
                                {auditLogs[movement.id] && auditLogs[movement.id].length > 0 && (
                                  <span className="px-1.5 py-0.5 bg-amber-600 text-white text-xs font-semibold rounded-full">
                                    {auditLogs[movement.id].length}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-amber-700 font-medium">
                                  {expandedHistorico[movement.id] ? "Ocultar" : "Mostrar"}
                                </span>
                                {expandedHistorico[movement.id] ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                                )}
                              </div>
                            </button>

                            {expandedHistorico[movement.id] && (
                              <div className="space-y-2 mt-2">
                                {auditLogs[movement.id] && auditLogs[movement.id].length > 0 && (
                                  <div className="pt-2">
                                    {isLoadingAuditLogs[movement.id] ? (
                                      <div className="flex items-center justify-center py-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {auditLogs[movement.id].map((log: any, index: number) => {
                                          const hasChanges = Object.keys(log.changes || {}).some(
                                            (key) => log.changes[key]
                                          );

                                          return (
                                            <div
                                              key={log.id || index}
                                              className="bg-white border-l-4 border-indigo-500 rounded p-2 shadow-sm"
                                            >
                                              <div className="flex items-center gap-1.5 mb-1.5 text-sm">
                                                <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded font-semibold text-xs">
                                                  #{index + 1}
                                                </span>
                                                <span className="font-semibold text-indigo-900">
                                                  {log.changed_by || "-"}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-gray-600 text-xs">
                                                  {formatTimestamp(log.timestamp)}
                                                </span>
                                              </div>

                                              {hasChanges ? (
                                                <div className="space-y-1">
                                                  {Object.keys(log.changes || {}).map((fieldKey) => {
                                                    if (!log.changes[fieldKey]) return null;

                                                    const oldValue = log.old_values?.[fieldKey];
                                                    const newValue = log.new_values?.[fieldKey];
                                                    const label = fieldLabels[fieldKey] || fieldKey;

                                                    return (
                                                      <div
                                                        key={fieldKey}
                                                        className="flex items-center flex-wrap gap-1.5 text-sm"
                                                      >
                                                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-900 rounded font-medium uppercase text-xs border border-indigo-300">
                                                          {label}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded line-through text-xs border border-rose-300">
                                                          {formatValue(fieldKey, oldValue)}
                                                        </span>
                                                        <span className="text-orange-600 font-semibold text-xs">→</span>
                                                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs border border-emerald-300">
                                                          {formatValue(fieldKey, newValue)}
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-xs text-amber-700">
                                                  <AlertCircle className="w-3 h-3" />
                                                  <span>Sem detalhes</span>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Observações */}
                        {movement.observations && movement.observations.trim() !== "" && (
                          <div className="mb-3 p-2 bg-amber-50 border-2 border-amber-300 rounded-lg shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Info className="w-3.5 h-3.5 text-amber-700" />
                              <span className="text-xs text-amber-800 uppercase font-medium">
                                Observações
                              </span>
                            </div>
                            <p className="text-sm text-gray-900">
                              {movement.observations}
                            </p>
                          </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex gap-2 pt-3 border-t-2 border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(movement)}
                            disabled={!canEdit}
                            className={`flex-1 ${
                              canEdit
                                ? "border-blue-400 text-blue-700 hover:bg-blue-50 font-semibold"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-1.5" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(movement.id)}
                            disabled={!canDelete}
                            className={`flex-1 ${
                              canDelete
                                ? "border-red-400 text-red-700 hover:bg-red-50 font-semibold"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            {canDelete ? "Excluir" : "Master"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Erro ao renderizar Histórico:", error);
    return (
      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Erro ao carregar histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12 bg-red-50 rounded-lg border-2 border-dashed border-red-200">
            <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
            <p className="text-red-600 mb-1 font-semibold">
              Ocorreu um erro ao carregar o histórico
            </p>
            <p className="text-red-400 text-sm">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
}
