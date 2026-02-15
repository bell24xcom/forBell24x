'use client';

import { useState, useEffect } from 'react';
import { validateGSTNumber, formatGSTNumber, getGSTStateInfo, getEntityTypeInfo } from '@/utils/gst-validator';

interface GSTValidationProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function GSTValidation({
  value,
  onChange,
  onValidationChange,
  required = false,
  disabled = false,
  placeholder = 'Enter GST Number (e.g., 27ABCDE1234F1Z5)',
  className = ''
}: GSTValidationProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (value.trim()) {
      const result = validateGSTNumber(value);
      setValidationResult(result);
      setIsValid(result.isValid);
      setValidationMessage(result.message);
      onValidationChange?.(result.isValid);
    } else {
      setIsValid(null);
      setValidationMessage('');
      setValidationResult(null);
      onValidationChange?.(false);
    }
  }, [value, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toUpperCase();
    
    // Remove spaces and special characters except alphanumeric
    inputValue = inputValue.replace(/[^A-Z0-9]/g, '');
    
    // Limit to 15 characters
    if (inputValue.length <= 15) {
      onChange(inputValue);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      // Format the GST number when user finishes typing
      const formatted = formatGSTNumber(value);
      if (formatted !== value) {
        onChange(formatted.replace(/\s/g, ''));
      }
    }
  };

  const getInputClassName = () => {
    let baseClass = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500';
    
    if (disabled) {
      baseClass += ' bg-gray-100 cursor-not-allowed';
    }
    
    if (isValid === true) {
      baseClass += ' border-green-500 bg-green-50';
    } else if (isValid === false) {
      baseClass += ' border-red-500 bg-red-50';
    } else {
      baseClass += ' border-gray-300';
    }
    
    return `${baseClass} ${className}`;
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={getInputClassName()}
          maxLength={15}
        />
        
        {isValid !== null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <span className="text-green-500 text-xl">✓</span>
            ) : (
              <span className="text-red-500 text-xl">✗</span>
            )}
          </div>
        )}
      </div>

      {validationMessage && (
        <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {validationMessage}
        </div>
      )}

      {isValid && validationResult && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-800">
              ✅ Valid GST Number
            </span>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-green-600 hover:text-green-800"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mt-3 space-y-2 text-sm text-green-700">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">State:</span> {validationResult.stateName}
                </div>
                <div>
                  <span className="font-medium">State Code:</span> {validationResult.stateCode}
                </div>
                <div>
                  <span className="font-medium">PAN:</span> {validationResult.panNumber}
                </div>
                <div>
                  <span className="font-medium">Entity Type:</span> {validationResult.entityType}
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-white rounded border">
                <span className="font-medium">Formatted GST:</span>
                <div className="font-mono text-xs mt-1">
                  {formatGSTNumber(value)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isValid && value.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">
            <div className="font-medium mb-2">GST Number Format:</div>
            <div className="font-mono text-xs bg-white p-2 rounded border">
              <div>Format: XX XXXX XXXX X X Z X</div>
              <div>Example: 27 ABCD E123 4 F 1 Z 5</div>
              <div className="mt-1 text-xs text-gray-600">
                Where: XX = State Code, XXXX = PAN (5 letters + 4 digits + 1 letter), 
                X = Entity Code, Z = Fixed, X = Check Sum
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>💡 GST number must be 15 characters long</p>
        <p>🏛️ Format: State Code (2) + PAN (10) + Entity Code (1) + Z + Check Sum (1)</p>
      </div>
    </div>
  );
} 
