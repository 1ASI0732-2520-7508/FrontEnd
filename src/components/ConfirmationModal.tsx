import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                                        isOpen,
                                                                        onClose,
                                                                        message,
                                                                    }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeIn">
                <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Success!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};
