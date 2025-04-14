import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ReportConfig {
  type: 'services' | 'users' | 'revenue' | 'performance';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    status?: string[];
    serviceType?: string[];
    userType?: string[];
  };
  format: 'pdf' | 'excel' | 'csv';
}

const AdminReports = () => {
  const { theme, colors} = useTheme();
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'services',
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end: new Date(),
    },
    filters: {},
    format: 'pdf',
  });

  const handleGenerateReport = async () => {
    try {
      // Aqui você implementará a lógica para gerar o relatório no backend
      Alert.alert('Sucesso', 'Relatório gerado com sucesso');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    }
  };

  const renderReportTypeSelector = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de Relatório</Text>
      <View style={styles.reportTypeGrid}>
        {[
          { type: 'services', label: 'Serviços', icon: 'construct' },
          { type: 'users', label: 'Usuários', icon: 'people' },
          { type: 'revenue', label: 'Receita', icon: 'cash' },
          { type: 'performance', label: 'Performance', icon: 'speedometer' },
        ].map((item) => (
          <TouchableOpacity
            key={item.type}
            style={[
              styles.reportTypeButton,
              {
                backgroundColor: reportConfig.type === item.type ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setReportConfig({ ...reportConfig, type: item.type as ReportConfig['type'] })}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={reportConfig.type === item.type ? 'white' : colors.text}
            />
            <Text
              style={[
                styles.reportTypeLabel,
                {
                  color: reportConfig.type === item.type ? 'white' : colors.text,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDateRangeSelector = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Período</Text>
      <View style={styles.dateRangeContainer}>
        <View style={styles.dateInput}>
          <Text style={[styles.dateLabel, { color: colors.text }]}>Data Inicial</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={reportConfig.dateRange.start.toLocaleDateString()}
            placeholder="Selecione a data inicial"
            placeholderTextColor={colors.placeholder}
            editable={false}
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={[styles.dateLabel, { color: colors.text }]}>Data Final</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={reportConfig.dateRange.end.toLocaleDateString()}
            placeholder="Selecione a data final"
            placeholderTextColor={colors.placeholder}
            editable={false}
          />
        </View>
      </View>
    </View>
  );

  const renderFormatSelector = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Formato do Relatório</Text>
      <View style={styles.formatContainer}>
        {[
          { format: 'pdf', label: 'PDF', icon: 'document-text' },
          { format: 'excel', label: 'Excel', icon: 'grid' },
          { format: 'csv', label: 'CSV', icon: 'list' },
        ].map((item) => (
          <TouchableOpacity
            key={item.format}
            style={[
              styles.formatButton,
              {
                backgroundColor: reportConfig.format === item.format ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setReportConfig({ ...reportConfig, format: item.format as ReportConfig['format'] })}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={reportConfig.format === item.format ? 'white' : colors.text}
            />
            <Text
              style={[
                styles.formatLabel,
                {
                  color: reportConfig.format === item.format ? 'white' : colors.text,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Relatórios</Text>
      </View>

      {renderReportTypeSelector()}
      {renderDateRangeSelector()}
      {renderFormatSelector()}

      <TouchableOpacity
        style={[styles.generateButton, { backgroundColor: colors.primary }]}
        onPress={handleGenerateReport}
      >
        <Text style={styles.generateButtonText}>Gerar Relatório</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  reportTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  reportTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateRangeContainer: {
    gap: 16,
  },
  dateInput: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  formatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminReports; 