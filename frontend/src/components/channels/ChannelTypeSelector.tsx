import { useTranslation } from 'react-i18next';
import { CHANNEL_TYPES, type ChannelType } from '../../types/channel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ChannelTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChannelTypeSelector({ 
  value, 
  onValueChange, 
  placeholder,
  disabled = false 
}: ChannelTypeSelectorProps) {
  const { t } = useTranslation();
  const knownValues = Object.values(CHANNEL_TYPES)
  const isUnknown = !!value && !knownValues.includes(value as ChannelType)
  const defaultPlaceholder = placeholder || t('channels.selectChannelType');

  return (
    <Select
      value={value ?? ""}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {isUnknown && (
          <SelectItem value={value}>{`${value} (${t('channelTypes.unknown')})`}</SelectItem>
        )}
        {Object.entries(CHANNEL_TYPES).map(([key, channelType]) => (
          <SelectItem key={key} value={channelType}>
            {`${t(`channelTypes.${channelType}`)} (${channelType})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}