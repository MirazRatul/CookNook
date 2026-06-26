import React from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Input } from './Input';
import { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  isPassword?: boolean;
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  iconName,
  isPassword,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <Input
          label={label}
          iconName={iconName}
          isPassword={isPassword}
          value={value ?? ''}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
}
