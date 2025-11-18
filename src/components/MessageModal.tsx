import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  onClose: () => void;
}

export default function MessageModal({ isOpen, title, body, onClose }: MessageModalProps) {
  // Determina o tipo de modal baseado no título
  const isSuccess = title.toLowerCase().includes('sucesso');
  const isError = title.toLowerCase().includes('erro');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border border-gray-300 shadow-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isSuccess && (
              <div className="p-2 bg-green-100 rounded">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
            {isError && (
              <div className="p-2 bg-red-100 rounded">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            )}
            {!isSuccess && !isError && (
              <div className="p-2 bg-blue-100 rounded">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <DialogTitle className={`${
              isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-blue-700'
            }`}>
              {title}
            </DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className={`py-3 px-1 rounded ${
              isSuccess ? 'bg-green-50' : isError ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              <p className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={onClose} 
            className={`w-full ${
              isSuccess 
                ? 'bg-green-600 hover:bg-green-700' 
                : isError 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}