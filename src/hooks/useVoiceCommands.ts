import { useEffect, useCallback } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import { useAccessibility } from '../context/AccessibilityContext';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export const useVoiceCommands = (commands: VoiceCommand[]) => {
  const { isVoiceControlEnabled } = useAccessibility();

  const handleVoiceCommand = useCallback((spokenText: string) => {
    if (!isVoiceControlEnabled) return;

    const normalizedText = spokenText.toLowerCase().trim();
    const matchedCommand = commands.find(cmd => 
      cmd.command.toLowerCase() === normalizedText
    );

    if (matchedCommand) {
      matchedCommand.action();
    }
  }, [commands, isVoiceControlEnabled]);

  useEffect(() => {
    if (!isVoiceControlEnabled) return;

    const subscription = AccessibilityInfo.addEventListener(
      'announcementFinished',
      ({ announcement, success }) => {
        if (success) {
          handleVoiceCommand(announcement);
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [handleVoiceCommand, isVoiceControlEnabled]);

  const announceCommand = useCallback((command: string) => {
    AccessibilityInfo.announceForAccessibility(command);
  }, []);

  const showAvailableCommands = useCallback(() => {
    const commandList = commands
      .map(cmd => `${cmd.command}: ${cmd.description}`)
      .join('\n');
    
    Alert.alert(
      'Comandos de Voz Disponíveis',
      commandList,
      [{ text: 'OK' }]
    );
  }, [commands]);

  return {
    announceCommand,
    showAvailableCommands,
  };
}; 