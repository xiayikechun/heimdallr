import type { Control } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CHANNEL_CONFIG_FIELDS, type ChannelType, type ChannelConfigField } from '../../types/channel';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

interface ChannelConfigFormProps {
  channelType: ChannelType;
  control: Control<{
    name: string;
    channel_type: string;
    is_active: boolean;
    config: Record<string, unknown>;
  }>;
  disabled?: boolean;
}

export function ChannelConfigForm({ channelType, control, disabled = false }: ChannelConfigFormProps) {
  const { t } = useTranslation();
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  
  const configFields = CHANNEL_CONFIG_FIELDS[channelType] || [];

  const togglePasswordVisibility = (fieldName: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(fieldName)) {
      newVisible.delete(fieldName);
    } else {
      newVisible.add(fieldName);
    }
    setVisiblePasswords(newVisible);
  };

  const renderField = (field: ChannelConfigField) => {    
    return (
      <FormField
        key={field.name}
        control={control}
        name={`config.${field.name}` as any}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {(() => {
                switch (field.type) {
                  case 'password': {
                    const isVisible = visiblePasswords.has(field.name);
                    return (
                      <div className="relative">
                        <Input
                          type={isVisible ? 'text' : 'password'}
                          placeholder={field.placeholder}
                          disabled={disabled}
                          {...formField}
                          value={formField.value || ''}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          disabled={disabled}
                          onClick={() => togglePasswordVisibility(field.name)}
                        >
                          {isVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  }
                  
                  case 'number':
                    return (
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        disabled={disabled}
                        {...formField}
                        value={formField.value || ''}
                        onChange={(e) => formField.onChange(e.target.value ? Number(e.target.value) : '')}
                      />
                    );
                  
                  case 'boolean':
                    return (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formField.value || false}
                          onCheckedChange={formField.onChange}
                          disabled={disabled}
                        />
                        <span className="text-sm">{formField.value ? t('channelConfig.enabled') : t('channelConfig.disabled')}</span>
                      </div>
                    );
                  
                  case 'select':
                    return (
                      <Select
                        value={formField.value || ''}
                        onValueChange={formField.onChange}
                        disabled={disabled}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder || t('channelConfig.pleaseSelect')} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={String(option.value)} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  
                  default:
                    // For long text fields or descriptions, use textarea
                    if (field.name.toLowerCase().includes('description') || 
                        field.name.toLowerCase().includes('content') ||
                        (field.placeholder && field.placeholder.length > 50)) {
                      return (
                        <Textarea
                          placeholder={field.placeholder}
                          disabled={disabled}
                          {...formField}
                          value={formField.value || ''}
                          rows={3}
                        />
                      );
                    }
                    
                    return (
                      <Input
                        type="text"
                        placeholder={field.placeholder}
                        disabled={disabled}
                        {...formField}
                        value={formField.value || ''}
                      />
                    );
                }
              })()}
            </FormControl>
            {field.descriptionI18nKey ? (
              <FormDescription 
                dangerouslySetInnerHTML={{ __html: t(field.descriptionI18nKey) }}
              />
            ) : field.description ? (
              <FormDescription>{field.description}</FormDescription>
            ) : null}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  if (configFields.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>{t('channelConfig.noConfigRequired')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {configFields.map(renderField)}
      </div>
    </div>
  );
}