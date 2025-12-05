import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { CheckCircle2, X, Edit, Loader2 } from 'lucide-react';

interface InlineEditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<boolean>;
  onCancel?: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  validate?: (value: string) => string | null; // Retorna mensagem de erro ou null se válido
}

export default function InlineEditableText({
  value,
  onSave,
  onCancel,
  className = '',
  placeholder = '',
  disabled = false,
  validate
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debug: log quando componente renderiza
  useEffect(() => {
    console.log('🔍 InlineEditableText renderizado:', { value, disabled });
  }, [value, disabled]);

  // Sincronizar valor quando prop muda
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focar no input quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    console.log('🟢 handleStartEdit chamado:', { disabled, value });
    if (disabled) {
      console.log('⚠️ Edição desabilitada');
      return;
    }
    setEditValue(value);
    setError(null);
    setIsEditing(true);
    console.log('✅ Modo de edição ativado');
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
    onCancel?.();
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    
    // Validar se não está vazio
    if (!trimmedValue) {
      setError('O nome não pode estar vazio');
      return;
    }

    // Validar se mudou
    if (trimmedValue === value) {
      handleCancel();
      return;
    }

    // Validação customizada
    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('💾 Salvando valor:', trimmedValue);
      const success = await onSave(trimmedValue);
      console.log('📥 Resultado do save:', success);
      if (success) {
        setIsEditing(false);
        console.log('✅ Edição concluída com sucesso');
      } else {
        console.error('❌ Save retornou false');
        setError('Não foi possível salvar a alteração');
      }
    } catch (err: any) {
      console.error('❌ Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2 w-full">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className={`${className} ${error ? 'border-red-500' : ''}`}
            placeholder={placeholder}
            disabled={isSaving}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !editValue.trim()}
            className="bg-green-600 hover:bg-green-700 text-white h-8 px-2 disabled:opacity-50"
            title="Salvar (Enter)"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleCancel}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white h-8 px-2 disabled:opacity-50"
            title="Cancelar (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
      <span 
        className={`${className} flex-1 cursor-pointer hover:text-orange-600 transition-colors`}
        onClick={handleStartEdit}
        title="Clique para editar"
      >
        {value}
      </span>
      {!disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStartEdit();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-50 rounded flex-shrink-0"
          title="Editar nome"
        >
          <Edit className="w-3.5 h-3.5 text-orange-600" />
        </button>
      )}
    </div>
  );
}

