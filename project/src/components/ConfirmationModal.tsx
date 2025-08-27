import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  itemName?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  itemName
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-200'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-200'
        };
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity duration-300 ease-out"
          aria-hidden="true"
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-in zoom-in-95 fade-in-0">
          {/* Close button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full ${styles.iconBg} sm:mx-0 sm:h-12 sm:w-12 shadow-lg`}>
              {type === 'danger' ? (
                <Trash2 className={`h-8 w-8 sm:h-6 sm:w-6 ${styles.iconColor}`} />
              ) : (
                <AlertTriangle className={`h-8 w-8 sm:h-6 sm:w-6 ${styles.iconColor}`} />
              )}
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2" id="modal-title">
                {title}
              </h3>
              
              <div className="mt-2">
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
                
                {itemName && (
                  <div className={`mt-3 p-3 rounded-lg border ${styles.border} bg-gray-50`}>
                    <p className="text-sm font-medium text-gray-800">
                      Item a ser excluído:
                    </p>
                    <p className="text-sm text-gray-600 mt-1 font-mono bg-white px-2 py-1 rounded border">
                      {itemName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-lg px-6 py-3 text-base font-medium text-white ${styles.confirmBtn} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {confirmText}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azure-500 transition-all duration-200 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;